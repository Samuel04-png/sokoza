-- Server-owned behavioral events that are useful beyond per-product ranking.
-- Search text is deliberately not stored here; only a one-way session hash and
-- canonical entity identifiers are retained.

create table if not exists private.marketplace_activity_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in (
    'store_viewed',
    'search_submitted',
    'search_result_clicked',
    'product_published',
    'inventory_confirmed'
  )),
  product_id uuid references public.products(id) on delete cascade,
  store_id uuid references public.stores(id) on delete cascade,
  actor_seller_id uuid references auth.users(id) on delete set null,
  session_key_hash text check (session_key_hash is null or char_length(session_key_hash) = 64),
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  check (product_id is not null or store_id is not null or event_type = 'search_submitted'),
  check (
    (event_type in ('product_published', 'inventory_confirmed') and actor_seller_id is not null)
    or event_type not in ('product_published', 'inventory_confirmed')
  )
);

alter table private.marketplace_activity_events enable row level security;
revoke all on private.marketplace_activity_events from public, anon, authenticated;

create index if not exists marketplace_activity_store_created_idx
  on private.marketplace_activity_events (store_id, created_at desc)
  where store_id is not null;
create index if not exists marketplace_activity_product_created_idx
  on private.marketplace_activity_events (product_id, created_at desc)
  where product_id is not null;
create index if not exists marketplace_activity_type_created_idx
  on private.marketplace_activity_events (event_type, created_at desc);

create or replace function public.capture_marketplace_activity_server(
  p_event_type text,
  p_product_id uuid default null,
  p_store_id uuid default null,
  p_actor_seller_id uuid default null,
  p_session_key_hash text default null,
  p_idempotency_key uuid default gen_random_uuid()
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_event_type not in ('store_viewed', 'search_submitted', 'search_result_clicked', 'product_published', 'inventory_confirmed') then
    raise exception using errcode = 'P0001', message = 'UNSUPPORTED_ACTIVITY_EVENT';
  end if;
  if p_session_key_hash is not null and char_length(p_session_key_hash) <> 64 then
    raise exception using errcode = 'P0001', message = 'INVALID_SESSION_KEY';
  end if;
  if p_product_id is not null and not exists (select 1 from public.products where id = p_product_id) then
    raise exception using errcode = 'P0001', message = 'UNKNOWN_PRODUCT';
  end if;
  if p_store_id is not null and not exists (select 1 from public.stores where id = p_store_id) then
    raise exception using errcode = 'P0001', message = 'UNKNOWN_STORE';
  end if;
  if p_product_id is not null and p_store_id is not null and not exists (
    select 1 from public.products where id = p_product_id and store_id = p_store_id
  ) then
    raise exception using errcode = 'P0001', message = 'INVALID_PRODUCT_STORE';
  end if;
  if p_event_type in ('product_published', 'inventory_confirmed') and (
    p_actor_seller_id is null or not exists (
      select 1
      from public.stores store
      where store.owner_id = p_actor_seller_id
        and (p_store_id is null or store.id = p_store_id)
        and (p_product_id is null or exists (select 1 from public.products product where product.id = p_product_id and product.store_id = store.id))
    )
  ) then
    raise exception using errcode = 'P0001', message = 'INVALID_SELLER_ACTIVITY';
  end if;

  insert into private.marketplace_activity_events (
    event_type, product_id, store_id, actor_seller_id, session_key_hash, idempotency_key
  ) values (
    p_event_type, p_product_id, p_store_id, p_actor_seller_id, p_session_key_hash, p_idempotency_key
  ) on conflict (idempotency_key) do nothing;
  return found;
end;
$$;

revoke all on function public.capture_marketplace_activity_server(text, uuid, uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.capture_marketplace_activity_server(text, uuid, uuid, uuid, text, uuid) to service_role;

-- A bounded, explainable serving query. Qualified intent and freshness outweigh
-- views; recent real listings receive a small exploration boost; products from
-- one Store receive a diversity penalty after its first two results.
create or replace function public.get_ranked_marketplace_products(
  p_limit integer default 60,
  p_moving_only boolean default false
)
returns table (product_id uuid, score numeric, whats_moving boolean, ranking_version text)
language sql
stable
security definer
set search_path = ''
as $$
  with eligible as (
    select
      product.id as product_id,
      product.store_id,
      product.published_at,
      product.last_availability_confirmed_at,
      coalesce(metric.unique_viewers_7d, 0) as unique_viewers_7d,
      coalesce(metric.unique_saves_7d, 0) as unique_saves_7d,
      coalesce(metric.order_reviews_7d, 0) as order_reviews_7d,
      coalesce(metric.order_intents_7d, 0) as order_intents_7d,
      coalesce(metric.whatsapp_opens_7d, 0) as whatsapp_opens_7d,
      coalesce(metric.buyer_marked_sent_7d, 0) as buyer_marked_sent_7d,
      exists (
        select 1 from public.product_variants variant
        where variant.product_id = product.id
          and variant.availability in ('available', 'low', 'made_to_order')
          and (variant.stock_quantity > 0 or variant.availability = 'made_to_order')
      ) as sellable,
      exists (
        select 1 from public.product_variants variant
        where variant.product_id = product.id and variant.availability = 'low'
      ) as low_availability,
      (select count(*) from public.product_images image where image.product_id = product.id) as image_count
    from public.products product
    join public.stores store on store.id = product.store_id and store.status = 'published'
    left join private.product_metric_rolling metric on metric.product_id = product.id
    where product.status = 'published'
  ), scored as (
    select
      eligible.*,
      (
        (case when sellable then (case when low_availability then 0.70 else 1.0 end) else 0 end) * 0.14
        + (case
            when last_availability_confirmed_at >= now() - interval '1 day' then 1.0
            when last_availability_confirmed_at >= now() - interval '3 days' then 0.82
            when last_availability_confirmed_at >= now() - interval '7 days' then 0.58
            when last_availability_confirmed_at >= now() - interval '14 days' then 0.30
            else 0.10 end) * 0.20
        + least(1.0, buyer_marked_sent_7d / 3.0) * 0.22
        + least(1.0, whatsapp_opens_7d / 5.0) * 0.12
        + least(1.0, order_intents_7d / 5.0) * 0.10
        + least(1.0, order_reviews_7d / 8.0) * 0.08
        + least(1.0, unique_saves_7d / 10.0) * 0.06
        + least(1.0, unique_viewers_7d / 50.0) * 0.02
        + least(1.0, image_count / 4.0) * 0.03
        + (case when published_at >= now() - interval '21 days' then 1.0 else 0 end) * 0.03
      )::numeric as base_score,
      (
        buyer_marked_sent_7d >= 1
        or order_intents_7d >= 2
        or (order_reviews_7d >= 2 and unique_saves_7d >= 2)
      ) as whats_moving
    from eligible
    where sellable
  ), diversified as (
    select
      scored.*,
      row_number() over (partition by store_id order by base_score desc, published_at desc, product_id) as store_position
    from scored
  )
  select
    product_id,
    greatest(0, base_score - greatest(store_position - 2, 0) * 0.12)::numeric as score,
    whats_moving,
    'ranking_v1'::text
  from diversified
  where not p_moving_only or whats_moving
  order by score desc, published_at desc, product_id
  limit greatest(1, least(coalesce(p_limit, 60), 100));
$$;

revoke all on function public.get_ranked_marketplace_products(integer, boolean) from public;
grant execute on function public.get_ranked_marketplace_products(integer, boolean) to anon, authenticated;
