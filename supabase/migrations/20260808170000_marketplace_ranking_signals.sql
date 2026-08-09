-- SOKOZA ranking_v1 marketplace evidence and aggregate serving boundary.
-- Dependency: apply after the approved stores, products, order_intents, and
-- order_intent_items migrations. Raw events/configuration are intentionally private.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.marketplace_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in (
    'product_viewed',
    'saved_product',
    'order_review_started',
    'order_intent_created',
    'whatsapp_opened',
    'buyer_marked_enquiry_sent'
  )),
  product_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  order_intent_id uuid references public.order_intents(id) on delete set null,
  session_key_hash text not null check (char_length(session_key_hash) = 64),
  viewer_key_hash text not null check (char_length(viewer_key_hash) = 64),
  view_kind text check (view_kind in ('raw', 'meaningful')),
  intent_key_hash text check (intent_key_hash is null or char_length(intent_key_hash) = 64),
  eligible_at_event boolean not null,
  idempotency_key uuid not null unique,
  ranking_version text not null default 'ranking_v1',
  created_at timestamptz not null default now(),
  check (
    (event_type = 'product_viewed' and view_kind is not null)
    or (event_type <> 'product_viewed' and view_kind is null)
  )
);

alter table private.marketplace_events enable row level security;
revoke all on private.marketplace_events from public, anon, authenticated;

create index if not exists marketplace_events_product_created_idx
  on private.marketplace_events (product_id, created_at desc);
create index if not exists marketplace_events_store_created_idx
  on private.marketplace_events (store_id, created_at desc);
create index if not exists marketplace_events_dedupe_idx
  on private.marketplace_events (session_key_hash, product_id, event_type, view_kind, created_at desc);
create index if not exists marketplace_events_intent_idx
  on private.marketplace_events (order_intent_id, event_type)
  where order_intent_id is not null;

create table if not exists private.product_metric_daily (
  product_id uuid not null references public.products(id) on delete cascade,
  metric_date date not null,
  raw_views integer not null default 0 check (raw_views >= 0),
  unique_viewers integer not null default 0 check (unique_viewers >= 0),
  unique_saves integer not null default 0 check (unique_saves >= 0),
  order_reviews integer not null default 0 check (order_reviews >= 0),
  order_intents integer not null default 0 check (order_intents >= 0),
  whatsapp_opens integer not null default 0 check (whatsapp_opens >= 0),
  buyer_marked_sent integer not null default 0 check (buyer_marked_sent >= 0),
  refreshed_at timestamptz not null default now(),
  primary key (product_id, metric_date)
);

alter table private.product_metric_daily enable row level security;
revoke all on private.product_metric_daily from public, anon, authenticated;

create table if not exists private.product_metric_rolling (
  product_id uuid primary key references public.products(id) on delete cascade,
  raw_views_24h integer not null default 0,
  unique_viewers_24h integer not null default 0,
  raw_views_7d integer not null default 0,
  unique_viewers_7d integer not null default 0,
  previous_unique_viewers_7d integer not null default 0,
  raw_views_30d integer not null default 0,
  unique_viewers_30d integer not null default 0,
  unique_saves_7d integer not null default 0,
  order_reviews_7d integer not null default 0,
  order_intents_7d integer not null default 0,
  whatsapp_opens_7d integer not null default 0,
  buyer_marked_sent_24h integer not null default 0,
  buyer_marked_sent_7d integer not null default 0,
  buyer_marked_sent_30d integer not null default 0,
  last_event_at timestamptz,
  refreshed_at timestamptz not null default now()
);

alter table private.product_metric_rolling enable row level security;
revoke all on private.product_metric_rolling from public, anon, authenticated;

create table if not exists private.marketplace_ranking_config (
  ranking_version text primary key,
  active boolean not null default false,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(config) = 'object')
);

alter table private.marketplace_ranking_config enable row level security;
revoke all on private.marketplace_ranking_config from public, anon, authenticated;
create unique index if not exists marketplace_ranking_one_active_idx
  on private.marketplace_ranking_config (active)
  where active;

insert into private.marketplace_ranking_config (ranking_version, active, config)
values (
  'ranking_v1',
  true,
  jsonb_build_object(
    'socialProof', jsonb_build_object('uniqueViewersToday', 10, 'uniqueViewersWeek', 22),
    'viewDedupeMinutes', 30,
    'comparisonMinimumPreviousUniqueViewers', 5,
    'priors', jsonb_build_object(
      'enquiryRate', jsonb_build_object('rate', 0.025, 'strength', 40),
      'saveRate', jsonb_build_object('rate', 0.08, 'strength', 30),
      'reviewRate', jsonb_build_object('rate', 0.055, 'strength', 35)
    ),
    'exploration', jsonb_build_object('maximumShare', 0.15, 'recentDays', 21, 'lowExposureMaximum', 3),
    'diversity', jsonb_build_object('maximumConsecutiveProductsPerStore', 2)
  )
)
on conflict (ranking_version) do nothing;

create or replace function public.capture_marketplace_event_server(
  p_event_type text,
  p_product_id uuid,
  p_store_id uuid,
  p_session_key_hash text,
  p_viewer_key_hash text,
  p_view_kind text default null,
  p_order_intent_id uuid default null,
  p_intent_key_hash text default null,
  p_idempotency_key uuid default gen_random_uuid()
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_eligible boolean;
begin
  if p_event_type not in (
    'product_viewed', 'saved_product', 'order_review_started',
    'order_intent_created', 'whatsapp_opened', 'buyer_marked_enquiry_sent'
  ) then
    raise exception 'unsupported marketplace event';
  end if;

  if char_length(p_session_key_hash) <> 64 or char_length(p_viewer_key_hash) <> 64 then
    raise exception 'invalid viewer key';
  end if;

  select (
    product.store_id = p_store_id
    and product.status = 'published'
    and store.status = 'published'
  )
  into v_eligible
  from public.products product
  join public.stores store on store.id = product.store_id
  where product.id = p_product_id;

  if v_eligible is null then
    raise exception 'unknown product/store relationship';
  end if;

  if p_event_type in ('order_intent_created', 'whatsapp_opened', 'buyer_marked_enquiry_sent') then
    if p_order_intent_id is null or not exists (
      select 1
      from public.order_intents intent
      join public.order_intent_items item on item.order_intent_id = intent.id
      where intent.id = p_order_intent_id
        and intent.store_id = p_store_id
        and item.product_id = p_product_id
    ) then
      raise exception 'qualified event requires a matching order intent';
    end if;
  end if;

  if p_event_type = 'product_viewed' and p_view_kind = 'meaningful' and exists (
    select 1 from private.marketplace_events event
    where event.product_id = p_product_id
      and event.session_key_hash = p_session_key_hash
      and event.event_type = p_event_type
      and event.view_kind = 'meaningful'
      and event.created_at >= now() - interval '30 minutes'
  ) then
    return false;
  end if;

  if p_event_type <> 'product_viewed' and exists (
    select 1 from private.marketplace_events event
    where event.product_id = p_product_id
      and event.session_key_hash = p_session_key_hash
      and event.event_type = p_event_type
      and coalesce(event.intent_key_hash, '') = coalesce(p_intent_key_hash, '')
      and event.created_at >= now() - interval '30 minutes'
  ) then
    return false;
  end if;

  insert into private.marketplace_events (
    event_type, product_id, store_id, order_intent_id, session_key_hash,
    viewer_key_hash, view_kind, intent_key_hash, eligible_at_event,
    idempotency_key, ranking_version
  ) values (
    p_event_type, p_product_id, p_store_id, p_order_intent_id, p_session_key_hash,
    p_viewer_key_hash, p_view_kind, p_intent_key_hash, v_eligible,
    p_idempotency_key, 'ranking_v1'
  )
  on conflict (idempotency_key) do nothing;

  return found;
end;
$$;

revoke all on function public.capture_marketplace_event_server(text, uuid, uuid, text, text, text, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.capture_marketplace_event_server(text, uuid, uuid, text, text, text, uuid, text, uuid) to service_role;

create or replace function private.refresh_product_metrics(p_now timestamptz default now())
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from private.product_metric_daily
  where metric_date >= (p_now at time zone 'Africa/Lusaka')::date - 31;

  insert into private.product_metric_daily (
    product_id, metric_date, raw_views, unique_viewers, unique_saves,
    order_reviews, order_intents, whatsapp_opens, buyer_marked_sent, refreshed_at
  )
  select
    event.product_id,
    (event.created_at at time zone 'Africa/Lusaka')::date,
    count(*) filter (where event.event_type = 'product_viewed' and event.view_kind = 'raw'),
    count(distinct event.viewer_key_hash) filter (where event.event_type = 'product_viewed' and event.view_kind = 'meaningful'),
    count(distinct event.session_key_hash) filter (where event.event_type = 'saved_product'),
    count(distinct event.session_key_hash) filter (where event.event_type = 'order_review_started'),
    count(distinct event.order_intent_id) filter (where event.event_type = 'order_intent_created'),
    count(distinct event.order_intent_id) filter (where event.event_type = 'whatsapp_opened'),
    count(distinct event.order_intent_id) filter (where event.event_type = 'buyer_marked_enquiry_sent'),
    p_now
  from private.marketplace_events event
  where event.created_at >= p_now - interval '31 days'
    and event.eligible_at_event
  group by event.product_id, (event.created_at at time zone 'Africa/Lusaka')::date;

  insert into private.product_metric_rolling (
    product_id, raw_views_24h, unique_viewers_24h, raw_views_7d,
    unique_viewers_7d, previous_unique_viewers_7d, raw_views_30d,
    unique_viewers_30d, unique_saves_7d, order_reviews_7d, order_intents_7d,
    whatsapp_opens_7d, buyer_marked_sent_24h, buyer_marked_sent_7d,
    buyer_marked_sent_30d, last_event_at, refreshed_at
  )
  select
    product.id,
    count(*) filter (where event.event_type = 'product_viewed' and event.view_kind = 'raw' and event.created_at >= p_now - interval '24 hours'),
    count(distinct event.viewer_key_hash) filter (where event.event_type = 'product_viewed' and event.view_kind = 'meaningful' and event.created_at >= p_now - interval '24 hours'),
    count(*) filter (where event.event_type = 'product_viewed' and event.view_kind = 'raw' and event.created_at >= p_now - interval '7 days'),
    count(distinct event.viewer_key_hash) filter (where event.event_type = 'product_viewed' and event.view_kind = 'meaningful' and event.created_at >= p_now - interval '7 days'),
    count(distinct event.viewer_key_hash) filter (where event.event_type = 'product_viewed' and event.view_kind = 'meaningful' and event.created_at >= p_now - interval '14 days' and event.created_at < p_now - interval '7 days'),
    count(*) filter (where event.event_type = 'product_viewed' and event.view_kind = 'raw' and event.created_at >= p_now - interval '30 days'),
    count(distinct event.viewer_key_hash) filter (where event.event_type = 'product_viewed' and event.view_kind = 'meaningful' and event.created_at >= p_now - interval '30 days'),
    count(distinct event.session_key_hash) filter (where event.event_type = 'saved_product' and event.created_at >= p_now - interval '7 days'),
    count(distinct event.session_key_hash) filter (where event.event_type = 'order_review_started' and event.created_at >= p_now - interval '7 days'),
    count(distinct event.order_intent_id) filter (where event.event_type = 'order_intent_created' and event.created_at >= p_now - interval '7 days'),
    count(distinct event.order_intent_id) filter (where event.event_type = 'whatsapp_opened' and event.created_at >= p_now - interval '7 days'),
    count(distinct event.order_intent_id) filter (where event.event_type = 'buyer_marked_enquiry_sent' and event.created_at >= p_now - interval '24 hours'),
    count(distinct event.order_intent_id) filter (where event.event_type = 'buyer_marked_enquiry_sent' and event.created_at >= p_now - interval '7 days'),
    count(distinct event.order_intent_id) filter (where event.event_type = 'buyer_marked_enquiry_sent' and event.created_at >= p_now - interval '30 days'),
    max(event.created_at),
    p_now
  from public.products product
  left join private.marketplace_events event
    on event.product_id = product.id
   and event.eligible_at_event
   and event.created_at >= p_now - interval '30 days'
  group by product.id
  on conflict (product_id) do update set
    raw_views_24h = excluded.raw_views_24h,
    unique_viewers_24h = excluded.unique_viewers_24h,
    raw_views_7d = excluded.raw_views_7d,
    unique_viewers_7d = excluded.unique_viewers_7d,
    previous_unique_viewers_7d = excluded.previous_unique_viewers_7d,
    raw_views_30d = excluded.raw_views_30d,
    unique_viewers_30d = excluded.unique_viewers_30d,
    unique_saves_7d = excluded.unique_saves_7d,
    order_reviews_7d = excluded.order_reviews_7d,
    order_intents_7d = excluded.order_intents_7d,
    whatsapp_opens_7d = excluded.whatsapp_opens_7d,
    buyer_marked_sent_24h = excluded.buyer_marked_sent_24h,
    buyer_marked_sent_7d = excluded.buyer_marked_sent_7d,
    buyer_marked_sent_30d = excluded.buyer_marked_sent_30d,
    last_event_at = excluded.last_event_at,
    refreshed_at = excluded.refreshed_at;
end;
$$;

revoke all on function private.refresh_product_metrics(timestamptz) from public, anon, authenticated;
grant execute on function private.refresh_product_metrics(timestamptz) to service_role;

create or replace function public.get_product_social_proof(p_product_ids uuid[])
returns table (product_id uuid, window_label text, unique_viewers integer)
language sql
stable
security definer
set search_path = ''
as $$
  with config as (
    select config
    from private.marketplace_ranking_config
    where active
    limit 1
  )
  select
    metric.product_id,
    case
      when metric.unique_viewers_24h >= (config.config #>> '{socialProof,uniqueViewersToday}')::integer then 'today'
      else 'week'
    end,
    case
      when metric.unique_viewers_24h >= (config.config #>> '{socialProof,uniqueViewersToday}')::integer then metric.unique_viewers_24h
      else metric.unique_viewers_7d
    end
  from private.product_metric_rolling metric
  join public.products product on product.id = metric.product_id and product.status = 'published'
  join public.stores store on store.id = product.store_id and store.status = 'published'
  cross join config
  where metric.product_id = any(p_product_ids)
    and (
      metric.unique_viewers_24h >= (config.config #>> '{socialProof,uniqueViewersToday}')::integer
      or metric.unique_viewers_7d >= (config.config #>> '{socialProof,uniqueViewersWeek}')::integer
    );
$$;

revoke all on function public.get_product_social_proof(uuid[]) from public;
grant execute on function public.get_product_social_proof(uuid[]) to anon, authenticated;

create or replace function public.get_seller_product_metrics()
returns table (
  product_id uuid,
  raw_views_7d integer,
  unique_viewers_7d integer,
  previous_unique_viewers_7d integer,
  unique_saves_7d integer,
  order_reviews_7d integer,
  order_intents_7d integer,
  whatsapp_opens_7d integer,
  buyer_marked_sent_7d integer,
  refreshed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    metric.product_id,
    metric.raw_views_7d,
    metric.unique_viewers_7d,
    metric.previous_unique_viewers_7d,
    metric.unique_saves_7d,
    metric.order_reviews_7d,
    metric.order_intents_7d,
    metric.whatsapp_opens_7d,
    metric.buyer_marked_sent_7d,
    metric.refreshed_at
  from private.product_metric_rolling metric
  join public.products product on product.id = metric.product_id
  join public.stores store on store.id = product.store_id
  where store.owner_id = auth.uid();
$$;

revoke all on function public.get_seller_product_metrics() from public, anon;
grant execute on function public.get_seller_product_metrics() to authenticated;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if not exists (select 1 from cron.job where jobname = 'sokoza-refresh-product-metrics') then
      perform cron.schedule(
        'sokoza-refresh-product-metrics',
        '*/5 * * * *',
        'select private.refresh_product_metrics();'
      );
    end if;
  end if;
end;
$$;
