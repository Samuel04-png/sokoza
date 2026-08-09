-- Authoritative publication, guest-order-intent, and inventory operations.

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
    and store.logo_path is not null
    and store.cover_path is not null
    and store.whatsapp_e164 ~ '^\+[1-9][0-9]{7,14}$'
    and char_length(trim(store.collection_details)) > 0
    and char_length(trim(store.delivery_details)) > 0
  returning store.* into result;

  if result.id is null then
    raise exception using errcode = 'P0001', message = 'STORE_NOT_READY';
  end if;
  return result;
end;
$$;

create or replace function public.set_store_operating_status(p_status text)
returns public.stores
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.stores;
begin
  if p_status not in ('paused', 'published', 'archived') then
    raise exception using errcode = 'P0001', message = 'INVALID_STORE_STATUS';
  end if;
  if p_status = 'published' then
    return public.publish_store();
  end if;
  update public.stores store set status = p_status
  where store.owner_id = auth.uid() and store.status not in ('restricted', 'suspended')
  returning store.* into result;
  if result.id is null then
    raise exception using errcode = 'P0001', message = 'STORE_UNAVAILABLE';
  end if;
  return result;
end;
$$;

create or replace function public.publish_product(p_product_id uuid, p_expected_version integer)
returns public.products
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.products;
begin
  update public.products product
  set status = 'published',
      published_at = coalesce(product.published_at, now()),
      last_availability_confirmed_at = coalesce(product.last_availability_confirmed_at, now())
  from public.stores store
  where product.id = p_product_id
    and product.store_id = store.id
    and store.owner_id = auth.uid()
    and store.status = 'published'
    and product.version = p_expected_version
    and product.category_id is not null
    and char_length(trim(product.title)) >= 2
    and char_length(trim(product.description)) >= 20
    and product.regular_price >= 0
    and exists (select 1 from public.product_images image where image.product_id = product.id)
    and exists (
      select 1 from public.product_variants variant
      where variant.product_id = product.id
        and variant.availability in ('available', 'low', 'made_to_order')
        and (variant.stock_quantity > 0 or variant.availability = 'made_to_order')
    )
  returning product.* into result;

  if result.id is null then
    if exists (
      select 1 from public.products product
      join public.stores store on store.id = product.store_id
      where product.id = p_product_id and store.owner_id = auth.uid() and product.version <> p_expected_version
    ) then
      raise exception using errcode = 'P0001', message = 'VERSION_CONFLICT';
    end if;
    raise exception using errcode = 'P0001', message = 'PRODUCT_NOT_READY';
  end if;
  return result;
end;
$$;

create or replace function public.set_product_status(p_product_id uuid, p_status text, p_expected_version integer)
returns public.products
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.products;
begin
  if p_status = 'published' then
    return public.publish_product(p_product_id, p_expected_version);
  end if;
  if p_status not in ('draft', 'hidden', 'sold_out', 'archived') then
    raise exception using errcode = 'P0001', message = 'INVALID_PRODUCT_STATUS';
  end if;
  update public.products product
  set status = p_status
  from public.stores store
  where product.id = p_product_id
    and product.store_id = store.id
    and store.owner_id = auth.uid()
    and product.version = p_expected_version
  returning product.* into result;
  if result.id is null then
    raise exception using errcode = 'P0001', message = 'VERSION_CONFLICT_OR_FORBIDDEN';
  end if;
  return result;
end;
$$;

create or replace function public.set_drop_status(p_drop_id uuid, p_status text)
returns public.drops
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.drops;
begin
  if p_status not in ('draft', 'published', 'ended', 'archived') then
    raise exception using errcode = 'P0001', message = 'INVALID_DROP_STATUS';
  end if;
  if p_status = 'published' and not exists (
    select 1
    from public.drops drop_row
    join public.stores store on store.id = drop_row.store_id
    where drop_row.id = p_drop_id
      and store.owner_id = auth.uid()
      and store.status = 'published'
      and drop_row.cover_path is not null
      and char_length(trim(drop_row.title)) >= 2
      and char_length(trim(drop_row.subtitle)) >= 2
      and exists (
        select 1 from public.drop_products link
        join public.products product on product.id = link.product_id
        where link.drop_id = drop_row.id and product.store_id = store.id and product.status = 'published'
      )
  ) then
    raise exception using errcode = 'P0001', message = 'DROP_NOT_READY';
  end if;
  update public.drops drop_row
  set status = p_status,
      published_at = case when p_status = 'published' then coalesce(drop_row.published_at, now()) else drop_row.published_at end
  from public.stores store
  where drop_row.id = p_drop_id and store.id = drop_row.store_id and store.owner_id = auth.uid()
  returning drop_row.* into result;
  if result.id is null then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN';
  end if;
  return result;
end;
$$;

create or replace function public.confirm_inventory(p_variant_ids uuid[], p_expected_versions integer[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed integer;
begin
  if cardinality(p_variant_ids) = 0 or cardinality(p_variant_ids) <> cardinality(p_expected_versions) then
    raise exception using errcode = 'P0001', message = 'INVALID_VARIANT_SET';
  end if;
  update public.product_variants variant
  set last_availability_confirmed_at = now()
  from public.products product, public.stores store,
       unnest(p_variant_ids, p_expected_versions) as requested(variant_id, expected_version)
  where variant.id = requested.variant_id
    and variant.version = requested.expected_version
    and product.id = variant.product_id
    and store.id = product.store_id
    and store.owner_id = auth.uid();
  get diagnostics changed = row_count;
  if changed <> cardinality(p_variant_ids) then
    raise exception using errcode = 'P0001', message = 'VERSION_CONFLICT_OR_FORBIDDEN';
  end if;
  update public.products product
  set last_availability_confirmed_at = now()
  where exists (select 1 from public.product_variants variant where variant.product_id = product.id and variant.id = any(p_variant_ids));
  return changed;
end;
$$;

create or replace function public.confirm_product_inventory(p_product_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  confirmed_at timestamptz := now();
begin
  if not exists (
    select 1 from public.products product
    join public.stores store on store.id = product.store_id
    where product.id = p_product_id and store.owner_id = auth.uid()
  ) then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN';
  end if;
  update public.product_variants set last_availability_confirmed_at = confirmed_at where product_id = p_product_id;
  update public.products set last_availability_confirmed_at = confirmed_at where id = p_product_id;
  return confirmed_at;
end;
$$;

create or replace function public.create_order_intent_server(
  p_guest_token_hash text,
  p_store_id uuid,
  p_items jsonb,
  p_idempotency_key uuid,
  p_buyer_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  guest_id uuid;
  intent_id uuid;
  existing_id uuid;
  reference_value text;
  store_row public.stores;
  requested jsonb;
  product_row record;
  requested_quantity integer;
  current_price numeric(12,2);
  subtotal_value numeric(12,2) := 0;
  items_result jsonb := '[]'::jsonb;
begin
  if char_length(p_guest_token_hash) <> 64 then
    raise exception using errcode = 'P0001', message = 'INVALID_GUEST_SESSION';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
    raise exception using errcode = 'P0001', message = 'INVALID_ITEMS';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_items) item
    group by item ->> 'productId', item ->> 'variantId'
    having count(*) > 1
  ) then
    raise exception using errcode = 'P0001', message = 'INVALID_ITEMS';
  end if;
  if p_buyer_note is not null and char_length(p_buyer_note) > 1000 then
    raise exception using errcode = 'P0001', message = 'INVALID_BUYER_NOTE';
  end if;

  insert into public.guest_sessions (token_hash, expires_at, last_seen_at)
  values (p_guest_token_hash, now() + interval '180 days', now())
  on conflict (token_hash) do update set last_seen_at = now(), expires_at = greatest(public.guest_sessions.expires_at, now() + interval '30 days')
  returning id into guest_id;

  select id into existing_id
  from public.order_intents
  where idempotency_key = p_idempotency_key and guest_session_id = guest_id and store_id = p_store_id;
  if existing_id is not null then
    return public.get_order_intent_server(p_guest_token_hash, existing_id);
  end if;

  select * into store_row from public.stores where id = p_store_id and status = 'published' for share;
  if store_row.id is null or store_row.whatsapp_e164 !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception using errcode = 'P0001', message = 'STORE_UNAVAILABLE';
  end if;

  for requested in select value from jsonb_array_elements(p_items)
  loop
    begin
      requested_quantity := (requested ->> 'quantity')::integer;
    exception when others then
      raise exception using errcode = 'P0001', message = 'INVALID_QUANTITY';
    end;
    if requested_quantity < 1 or requested_quantity > 20 then
      raise exception using errcode = 'P0001', message = 'INVALID_QUANTITY';
    end if;

    select
      product.id as product_id,
      product.title,
      product.regular_price,
      product.promotion_price,
      product.promotion_starts_at,
      product.promotion_ends_at,
      variant.id as variant_id,
      variant.label as variant_label,
      variant.stock_quantity,
      variant.availability,
      (select image.storage_path from public.product_images image where image.product_id = product.id order by image.is_cover desc, image.sort_order limit 1) as image_path
    into product_row
    from public.products product
    join public.product_variants variant on variant.product_id = product.id
    where product.id = (requested ->> 'productId')::uuid
      and variant.id = (requested ->> 'variantId')::uuid
      and product.store_id = p_store_id
      and product.status = 'published'
    for share of product, variant;

    if product_row.product_id is null then
      raise exception using errcode = 'P0001', message = 'PRODUCT_UNAVAILABLE';
    end if;
    if product_row.availability = 'unavailable' then
      raise exception using errcode = 'P0001', message = 'VARIANT_UNAVAILABLE';
    end if;
    if product_row.availability <> 'made_to_order' and product_row.stock_quantity < requested_quantity then
      raise exception using errcode = 'P0001', message = 'INSUFFICIENT_STOCK';
    end if;

    current_price := case
      when product_row.promotion_price is not null
        and (product_row.promotion_starts_at is null or product_row.promotion_starts_at <= now())
        and (product_row.promotion_ends_at is null or product_row.promotion_ends_at > now())
      then product_row.promotion_price else product_row.regular_price end;
    subtotal_value := subtotal_value + current_price * requested_quantity;
    items_result := items_result || jsonb_build_array(jsonb_build_object(
      'productId', product_row.product_id,
      'variantId', product_row.variant_id,
      'title', product_row.title,
      'variantLabel', product_row.variant_label,
      'imagePath', product_row.image_path,
      'unitPrice', current_price,
      'quantity', requested_quantity
    ));
  end loop;

  reference_value := 'SZ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  insert into public.order_intents (
    reference, store_id, guest_session_id, idempotency_key, store_name_snapshot,
    seller_whatsapp_snapshot, subtotal, buyer_note
  ) values (
    reference_value, store_row.id, guest_id, p_idempotency_key, store_row.name,
    store_row.whatsapp_e164, subtotal_value, nullif(trim(p_buyer_note), '')
  ) returning id into intent_id;

  insert into public.order_intent_items (
    order_intent_id, product_id, variant_id, product_title_snapshot,
    variant_label_snapshot, image_url_snapshot, unit_price, quantity
  )
  select
    intent_id,
    (item ->> 'productId')::uuid,
    (item ->> 'variantId')::uuid,
    item ->> 'title',
    item ->> 'variantLabel',
    item ->> 'imagePath',
    (item ->> 'unitPrice')::numeric,
    (item ->> 'quantity')::integer
  from jsonb_array_elements(items_result) item;

  return public.get_order_intent_server(p_guest_token_hash, intent_id);
end;
$$;

create or replace function public.get_order_intent_server(p_guest_token_hash text, p_order_intent_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', intent.id,
    'reference', intent.reference,
    'storeId', intent.store_id,
    'storeName', intent.store_name_snapshot,
    'whatsapp', intent.seller_whatsapp_snapshot,
    'status', intent.status,
    'subtotal', intent.subtotal,
    'buyerNote', intent.buyer_note,
    'createdAt', intent.created_at,
    'items', coalesce(jsonb_agg(jsonb_build_object(
      'id', item.id,
      'productId', item.product_id,
      'variantId', item.variant_id,
      'title', item.product_title_snapshot,
      'variantLabel', item.variant_label_snapshot,
      'imageUrl', item.image_url_snapshot,
      'unitPrice', item.unit_price,
      'quantity', item.quantity,
      'subtotal', item.line_subtotal
    ) order by item.created_at), '[]'::jsonb)
  )
  from public.order_intents intent
  join public.guest_sessions guest on guest.id = intent.guest_session_id and guest.token_hash = p_guest_token_hash and guest.expires_at > now()
  left join public.order_intent_items item on item.order_intent_id = intent.id
  where intent.id = p_order_intent_id
  group by intent.id;
$$;

create or replace function public.list_guest_order_intents_server(p_guest_token_hash text)
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.get_order_intent_server(p_guest_token_hash, intent.id)
  from public.order_intents intent
  join public.guest_sessions guest on guest.id = intent.guest_session_id
  where guest.token_hash = p_guest_token_hash and guest.expires_at > now()
  order by intent.created_at desc
  limit 100;
$$;

create or replace function public.update_guest_order_intent_status_server(
  p_guest_token_hash text,
  p_order_intent_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('whatsapp_opened', 'buyer_marked_sent') then
    raise exception using errcode = 'P0001', message = 'INVALID_INTENT_STATUS';
  end if;
  update public.order_intents intent
  set status = case
        when p_status = 'buyer_marked_sent' then 'buyer_marked_sent'
        when intent.status = 'ready' then 'whatsapp_opened'
        else intent.status
      end,
      whatsapp_opened_at = case when p_status = 'whatsapp_opened' then coalesce(intent.whatsapp_opened_at, now()) else intent.whatsapp_opened_at end,
      buyer_marked_sent_at = case when p_status = 'buyer_marked_sent' then coalesce(intent.buyer_marked_sent_at, now()) else intent.buyer_marked_sent_at end
  from public.guest_sessions guest
  where intent.id = p_order_intent_id
    and intent.guest_session_id = guest.id
    and guest.token_hash = p_guest_token_hash
    and guest.expires_at > now()
    and intent.status in ('ready', 'whatsapp_opened', 'buyer_marked_sent');
  if not found then
    raise exception using errcode = 'P0001', message = 'ORDER_INTENT_NOT_FOUND';
  end if;
  return public.get_order_intent_server(p_guest_token_hash, p_order_intent_id);
end;
$$;

create or replace function public.set_seller_order_intent_state(
  p_order_intent_id uuid,
  p_followup_status text,
  p_canonical_status text default null
)
returns public.order_intents
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.order_intents;
begin
  if p_followup_status not in ('new', 'contacted', 'awaiting_buyer', 'closed') then
    raise exception using errcode = 'P0001', message = 'INVALID_FOLLOWUP_STATUS';
  end if;
  if p_canonical_status is not null and p_canonical_status not in ('seller_marked_sold', 'unavailable', 'cancelled') then
    raise exception using errcode = 'P0001', message = 'INVALID_INTENT_STATUS';
  end if;
  update public.order_intents intent
  set seller_followup_status = p_followup_status,
      status = coalesce(p_canonical_status, intent.status),
      seller_updated_at = now()
  where intent.id = p_order_intent_id
    and public.current_user_owns_store(intent.store_id)
  returning intent.* into result;
  if result.id is null then
    raise exception using errcode = 'P0001', message = 'ORDER_INTENT_NOT_FOUND';
  end if;
  return result;
end;
$$;

revoke all on function public.publish_store() from public, anon;
revoke all on function public.set_store_operating_status(text) from public, anon;
revoke all on function public.publish_product(uuid, integer) from public, anon;
revoke all on function public.set_product_status(uuid, text, integer) from public, anon;
revoke all on function public.set_drop_status(uuid, text) from public, anon;
revoke all on function public.confirm_inventory(uuid[], integer[]) from public, anon;
revoke all on function public.confirm_product_inventory(uuid) from public, anon;
grant execute on function public.publish_store() to authenticated;
grant execute on function public.set_store_operating_status(text) to authenticated;
grant execute on function public.publish_product(uuid, integer) to authenticated;
grant execute on function public.set_product_status(uuid, text, integer) to authenticated;
grant execute on function public.set_drop_status(uuid, text) to authenticated;
grant execute on function public.confirm_inventory(uuid[], integer[]) to authenticated;
grant execute on function public.confirm_product_inventory(uuid) to authenticated;
revoke all on function public.set_seller_order_intent_state(uuid, text, text) from public, anon;
grant execute on function public.set_seller_order_intent_state(uuid, text, text) to authenticated;

revoke all on function public.create_order_intent_server(text, uuid, jsonb, uuid, text) from public, anon, authenticated;
revoke all on function public.get_order_intent_server(text, uuid) from public, anon, authenticated;
revoke all on function public.list_guest_order_intents_server(text) from public, anon, authenticated;
revoke all on function public.update_guest_order_intent_status_server(text, uuid, text) from public, anon, authenticated;
grant execute on function public.create_order_intent_server(text, uuid, jsonb, uuid, text) to service_role;
grant execute on function public.get_order_intent_server(text, uuid) to service_role;
grant execute on function public.list_guest_order_intents_server(text) to service_role;
grant execute on function public.update_guest_order_intent_status_server(text, uuid, text) to service_role;

-- Sellers may edit draft fields directly through RLS, but publication and
-- operating-state transitions must pass the validated RPCs above.
revoke insert, update on public.stores from authenticated;
grant insert (
  id, owner_id, slug, name, tagline, description, city_id, area, logo_path,
  cover_path, category_tags, style_tags, whatsapp_e164, contact_email,
  collection_details, delivery_details, exchange_policy, cancellation_policy,
  reply_expectation
) on public.stores to authenticated;
grant update (
  slug, name, tagline, description, city_id, area, logo_path, cover_path,
  category_tags, style_tags, whatsapp_e164, contact_email, collection_details,
  delivery_details, exchange_policy, cancellation_policy, reply_expectation
) on public.stores to authenticated;

revoke insert, update on public.products from authenticated;
grant insert (
  id, store_id, category_id, slug, title, description, details, condition,
  regular_price, promotion_price, promotion_starts_at, promotion_ends_at,
  primary_colour, style_tags, occasion_tags, audience, made_here
) on public.products to authenticated;
grant update (
  category_id, slug, title, description, details, condition, regular_price,
  promotion_price, promotion_starts_at, promotion_ends_at, primary_colour,
  style_tags, occasion_tags, audience, made_here
) on public.products to authenticated;

revoke insert, update on public.drops from authenticated;
grant insert (id, store_id, slug, title, subtitle, cover_path) on public.drops to authenticated;
grant update (slug, title, subtitle, cover_path) on public.drops to authenticated;

revoke update on public.order_intents from authenticated;
grant update (seller_followup_status, seller_updated_at) on public.order_intents to authenticated;
