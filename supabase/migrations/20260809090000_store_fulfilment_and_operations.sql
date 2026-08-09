-- Structured fulfilment and truthful Store operational events.

alter table public.stores
  add column if not exists collection_enabled boolean not null default false,
  add column if not exists collection_area text not null default '',
  add column if not exists delivery_enabled boolean not null default false,
  add column if not exists delivery_scope text not null default 'within_city',
  add column if not exists delivery_fee_mode text not null default 'whatsapp',
  add column if not exists delivery_fee numeric(12,2),
  add column if not exists whatsapp_tone text not null default 'standard';

update public.stores
set collection_enabled = collection_details <> '',
    collection_area = case when collection_area = '' then area else collection_area end,
    delivery_enabled = delivery_details <> '';

alter table public.stores drop constraint if exists stores_delivery_scope_check;
alter table public.stores add constraint stores_delivery_scope_check
  check (delivery_scope in ('within_city', 'selected_areas', 'zambia_wide'));
alter table public.stores drop constraint if exists stores_delivery_fee_mode_check;
alter table public.stores add constraint stores_delivery_fee_mode_check
  check (delivery_fee_mode in ('whatsapp', 'fixed', 'free'));
alter table public.stores drop constraint if exists stores_delivery_fee_check;
alter table public.stores add constraint stores_delivery_fee_check
  check ((delivery_fee_mode = 'fixed' and delivery_fee is not null and delivery_fee >= 0) or (delivery_fee_mode <> 'fixed' and delivery_fee is null));
alter table public.stores drop constraint if exists stores_whatsapp_tone_check;
alter table public.stores add constraint stores_whatsapp_tone_check
  check (whatsapp_tone in ('standard', 'warm', 'concise'));

grant insert (
  collection_enabled, collection_area, delivery_enabled, delivery_scope,
  delivery_fee_mode, delivery_fee, whatsapp_tone
) on public.stores to authenticated;
grant update (
  collection_enabled, collection_area, delivery_enabled, delivery_scope,
  delivery_fee_mode, delivery_fee, whatsapp_tone
) on public.stores to authenticated;

create or replace function public.publish_store()
returns public.stores
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.stores;
begin
  update public.stores store
  set status = 'published', published_at = coalesce(store.published_at, now())
  where store.owner_id = auth.uid()
    and store.status in ('draft', 'paused')
    and char_length(trim(store.name)) >= 2
    and char_length(trim(store.tagline)) >= 2
    and char_length(trim(store.description)) >= 20
    and store.city_id is not null
    and cardinality(store.category_tags) > 0
    and store.logo_path is not null
    and store.cover_path is not null
    and store.whatsapp_e164 ~ '^\+[1-9][0-9]{7,14}$'
    and (store.collection_enabled or store.delivery_enabled)
    and (not store.collection_enabled or char_length(trim(store.collection_details)) > 0)
    and (not store.delivery_enabled or char_length(trim(store.delivery_details)) > 0)
    and char_length(trim(store.exchange_policy)) > 0
    and char_length(trim(store.cancellation_policy)) > 0
  returning store.* into result;

  if result.id is null then
    raise exception using errcode = 'P0001', message = 'STORE_NOT_READY';
  end if;
  return result;
end;
$$;

create table if not exists private.store_operational_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('store_created', 'store_updated', 'store_published', 'store_paused', 'store_archived')),
  store_id uuid references public.stores(id) on delete cascade,
  actor_seller_id uuid references auth.users(id) on delete set null,
  request_id uuid not null,
  created_at timestamptz not null default now(),
  unique (event_type, store_id, request_id)
);

alter table private.store_operational_events enable row level security;
revoke all on private.store_operational_events from public, anon, authenticated;

create or replace function public.capture_store_operational_event_server(
  p_event_type text,
  p_store_id uuid,
  p_actor_seller_id uuid,
  p_request_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_event_type not in ('store_created', 'store_updated', 'store_published', 'store_paused', 'store_archived') then
    raise exception using errcode = 'P0001', message = 'UNSUPPORTED_STORE_EVENT';
  end if;
  if not exists (select 1 from public.stores where id = p_store_id and owner_id = p_actor_seller_id) then
    raise exception using errcode = 'P0001', message = 'INVALID_STORE_EVENT';
  end if;
  insert into private.store_operational_events(event_type, store_id, actor_seller_id, request_id)
  values (p_event_type, p_store_id, p_actor_seller_id, p_request_id)
  on conflict do nothing;
  return found;
end;
$$;

revoke all on function public.capture_store_operational_event_server(text, uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.capture_store_operational_event_server(text, uuid, uuid, uuid) to service_role;
