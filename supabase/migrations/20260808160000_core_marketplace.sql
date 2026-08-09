-- SOKOZA production marketplace core.
-- This migration contains no fictional Store, Product, Drop, enquiry, review,
-- follower, verification, promotion, or analytics seed data.

create extension if not exists pg_trgm with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_versioned_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  new.version = old.version + 1;
  return new;
end;
$$;

-- PostgreSQL marks array_to_string as STABLE, so it cannot be called directly
-- from a stored generated column. This wrapper is immutable for text arrays and
-- keeps the generated search vectors deterministic.
create or replace function public.searchable_text_array(values_to_join text[])
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select pg_catalog.array_to_string(values_to_join, ' ');
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'operator')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seller_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  onboarding_step smallint not null default 0 check (onboarding_step between 0 and 6),
  onboarding_complete boolean not null default false,
  preferences jsonb not null default '{"enquiryAlerts":true,"freshnessReminders":true,"weeklySummary":false,"compactCatalog":false}'::jsonb check (jsonb_typeof(preferences) = 'object'),
  whatsapp_verified_at timestamptz,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Reference taxonomy is production configuration, not marketplace content.
insert into public.cities (name, slug) values
  ('Lusaka', 'lusaka'),
  ('Ndola', 'ndola'),
  ('Kitwe', 'kitwe'),
  ('Livingstone', 'livingstone')
on conflict (slug) do nothing;

insert into public.categories (name, slug, sort_order) values
  ('Dresses', 'dresses', 10),
  ('Sets', 'sets', 20),
  ('Tailoring', 'tailoring', 30),
  ('Tops', 'tops', 40),
  ('Bottoms', 'bottoms', 50),
  ('Footwear', 'footwear', 60),
  ('Accessories', 'accessories', 70),
  ('Beauty', 'beauty', 80)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.seller_profiles(user_id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 100),
  tagline text not null default '' check (char_length(tagline) <= 90),
  description text not null default '' check (char_length(description) <= 1000),
  city_id uuid references public.cities(id) on delete set null,
  area text not null default '' check (char_length(area) <= 120),
  logo_path text,
  cover_path text,
  category_tags text[] not null default '{}',
  style_tags text[] not null default '{}',
  whatsapp_e164 text not null default '' check (whatsapp_e164 = '' or whatsapp_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  contact_email text check (contact_email is null or char_length(contact_email) <= 254),
  collection_details text not null default '' check (char_length(collection_details) <= 1000),
  delivery_details text not null default '' check (char_length(delivery_details) <= 1000),
  exchange_policy text not null default '' check (char_length(exchange_policy) <= 1500),
  cancellation_policy text not null default '' check (char_length(cancellation_policy) <= 1500),
  reply_expectation text not null default '' check (char_length(reply_expectation) <= 180),
  status text not null default 'draft' check (status in ('draft', 'published', 'paused', 'restricted', 'suspended', 'archived')),
  published_at timestamptz,
  version integer not null default 1 check (version > 0),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple'::regconfig, coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(tagline, '')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(description, '')), 'C') ||
    setweight(to_tsvector('simple'::regconfig, public.searchable_text_array(category_tags || style_tags)), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create table if not exists public.store_verifications (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  verification_type text not null check (verification_type in ('whatsapp', 'identity', 'business')),
  state text not null default 'pending' check (state in ('not_started', 'pending', 'verified', 'rejected', 'expired')),
  evidence_path text,
  public_label text not null default '',
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, verification_type)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null default '' check (char_length(title) <= 140),
  description text not null default '' check (char_length(description) <= 3000),
  details text[] not null default '{}',
  condition text not null check (condition in ('new', 'like_new', 'good', 'made_to_order')),
  regular_price numeric(12,2) not null check (regular_price >= 0),
  promotion_price numeric(12,2) check (promotion_price is null or (promotion_price >= 0 and promotion_price < regular_price)),
  promotion_starts_at timestamptz,
  promotion_ends_at timestamptz,
  primary_colour text not null default '' check (char_length(primary_colour) <= 80),
  style_tags text[] not null default '{}',
  occasion_tags text[] not null default '{}',
  audience text not null default 'All' check (char_length(audience) <= 80),
  made_here boolean not null default false,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden', 'sold_out', 'archived')),
  last_availability_confirmed_at timestamptz,
  published_at timestamptz,
  version integer not null default 1 check (version > 0),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(description, '')), 'C') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(primary_colour, '')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, public.searchable_text_array(style_tags || occasion_tags)), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (promotion_ends_at is null or promotion_starts_at is null or promotion_ends_at > promotion_starts_at),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null default '' check (char_length(alt_text) <= 180),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_cover boolean not null default false,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  created_at timestamptz not null default now()
);

create unique index if not exists product_images_one_cover_idx
  on public.product_images (product_id) where is_cover;

create table if not exists public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, name)
);

create table if not exists public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options(id) on delete cascade,
  value text not null check (char_length(value) between 1 and 80),
  colour_hex text check (colour_hex is null or colour_hex ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (option_id, value)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text check (sku is null or char_length(sku) <= 80),
  label text not null check (char_length(label) between 1 and 160),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  availability text not null default 'available' check (availability in ('available', 'low', 'unavailable', 'made_to_order')),
  last_availability_confirmed_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, sku)
);

create table if not exists public.product_variant_values (
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  option_value_id uuid not null references public.product_option_values(id) on delete cascade,
  primary key (variant_id, option_value_id)
);

create table if not exists public.drops (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 120),
  subtitle text not null default '' check (char_length(subtitle) <= 240),
  cover_path text,
  status text not null default 'draft' check (status in ('draft', 'published', 'ended', 'archived')),
  published_at timestamptz,
  ends_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create table if not exists public.drop_products (
  drop_id uuid not null references public.drops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (drop_id, product_id)
);

create table if not exists public.guest_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique check (char_length(token_hash) = 64),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.order_intents (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^SZ-[A-Z0-9]{8,16}$'),
  store_id uuid not null references public.stores(id) on delete restrict,
  guest_session_id uuid not null references public.guest_sessions(id) on delete restrict,
  idempotency_key uuid not null unique,
  status text not null default 'ready' check (status in ('ready', 'whatsapp_opened', 'buyer_marked_sent', 'seller_marked_sold', 'unavailable', 'cancelled', 'expired')),
  seller_followup_status text not null default 'new' check (seller_followup_status in ('new', 'contacted', 'awaiting_buyer', 'closed')),
  store_name_snapshot text not null,
  seller_whatsapp_snapshot text not null check (seller_whatsapp_snapshot ~ '^\+[1-9][0-9]{7,14}$'),
  currency text not null default 'ZMW' check (currency = 'ZMW'),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  buyer_note text check (buyer_note is null or char_length(buyer_note) <= 1000),
  whatsapp_opened_at timestamptz,
  buyer_marked_sent_at timestamptz,
  seller_updated_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_intent_items (
  id uuid primary key default gen_random_uuid(),
  order_intent_id uuid not null references public.order_intents(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_title_snapshot text not null,
  variant_label_snapshot text not null,
  image_url_snapshot text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_subtotal numeric(12,2) generated always as (unit_price * quantity) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_session_hash text check (reporter_session_hash is null or char_length(reporter_session_hash) = 64),
  store_id uuid references public.stores(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  reason text not null check (reason in ('counterfeit', 'misleading', 'prohibited', 'harassment', 'privacy', 'other')),
  detail text not null default '' check (char_length(detail) <= 2000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (store_id is not null or product_id is not null)
);

create index if not exists stores_owner_idx on public.stores (owner_id);
create index if not exists stores_status_idx on public.stores (status);
create index if not exists stores_city_status_idx on public.stores (city_id, status);
create index if not exists stores_search_idx on public.stores using gin (search_vector);
create index if not exists stores_name_trgm_idx on public.stores using gin (name extensions.gin_trgm_ops);
create index if not exists products_store_idx on public.products (store_id);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_status_published_idx on public.products (status, published_at desc);
create index if not exists products_freshness_idx on public.products (last_availability_confirmed_at desc);
create index if not exists products_search_idx on public.products using gin (search_vector);
create index if not exists products_title_trgm_idx on public.products using gin (title extensions.gin_trgm_ops);
create index if not exists product_images_product_order_idx on public.product_images (product_id, sort_order);
create index if not exists product_options_product_idx on public.product_options (product_id, sort_order);
create index if not exists product_option_values_option_idx on public.product_option_values (option_id, sort_order);
create index if not exists product_variants_product_idx on public.product_variants (product_id);
create index if not exists drops_store_idx on public.drops (store_id);
create index if not exists drops_status_published_idx on public.drops (status, published_at desc);
create index if not exists order_intents_store_status_idx on public.order_intents (store_id, status, created_at desc);
create index if not exists order_intents_guest_idx on public.order_intents (guest_session_id, created_at desc);
create index if not exists order_intent_items_intent_idx on public.order_intent_items (order_intent_id);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists seller_profiles_updated_at on public.seller_profiles;
create trigger seller_profiles_updated_at before update on public.seller_profiles for each row execute function public.set_updated_at();
drop trigger if exists stores_updated_at on public.stores;
create trigger stores_updated_at before update on public.stores for each row execute function public.set_versioned_updated_at();
drop trigger if exists store_verifications_updated_at on public.store_verifications;
create trigger store_verifications_updated_at before update on public.store_verifications for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_versioned_updated_at();
drop trigger if exists product_variants_updated_at on public.product_variants;
create trigger product_variants_updated_at before update on public.product_variants for each row execute function public.set_versioned_updated_at();
drop trigger if exists drops_updated_at on public.drops;
create trigger drops_updated_at before update on public.drops for each row execute function public.set_versioned_updated_at();
drop trigger if exists order_intents_updated_at on public.order_intents;
create trigger order_intents_updated_at before update on public.order_intents for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    case when new.raw_user_meta_data ->> 'account_type' = 'seller' then 'seller' else 'buyer' end
  )
  on conflict (id) do nothing;

  if new.raw_user_meta_data ->> 'account_type' = 'seller' then
    insert into public.seller_profiles (user_id, terms_accepted_at)
    values (new.id, now())
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.current_user_owns_store(p_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.stores where id = p_store_id and owner_id = auth.uid()
  );
$$;

create or replace function public.current_user_owns_product(p_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.products product
    join public.stores store on store.id = product.store_id
    where product.id = p_product_id and store.owner_id = auth.uid()
  );
$$;

create or replace function public.current_user_owns_store_path(p_store_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.stores where id::text = p_store_id and owner_id = auth.uid()
  );
$$;

create or replace function public.current_user_owns_product_path(p_product_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.products product
    join public.stores store on store.id = product.store_id
    where product.id::text = p_product_id and store.owner_id = auth.uid()
  );
$$;

revoke all on function public.current_user_owns_store(uuid) from public;
revoke all on function public.current_user_owns_product(uuid) from public;
revoke all on function public.current_user_owns_store_path(text) from public;
revoke all on function public.current_user_owns_product_path(text) from public;
grant execute on function public.current_user_owns_store(uuid) to authenticated;
grant execute on function public.current_user_owns_product(uuid) to authenticated;
grant execute on function public.current_user_owns_store_path(text) to authenticated;
grant execute on function public.current_user_owns_product_path(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.stores enable row level security;
alter table public.store_verifications enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_options enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_variant_values enable row level security;
alter table public.drops enable row level security;
alter table public.drop_products enable row level security;
alter table public.guest_sessions enable row level security;
alter table public.order_intents enable row level security;
alter table public.order_intent_items enable row level security;
alter table public.reports enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role in ('buyer', 'seller'));
create policy seller_profiles_select_own on public.seller_profiles for select to authenticated using (user_id = auth.uid());
create policy seller_profiles_insert_own on public.seller_profiles for insert to authenticated with check (user_id = auth.uid());
create policy seller_profiles_update_own on public.seller_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy cities_public_read on public.cities for select to anon, authenticated using (active);
create policy categories_public_read on public.categories for select to anon, authenticated using (active);

create policy stores_public_read on public.stores for select to anon, authenticated using (status in ('published', 'paused'));
create policy stores_owner_read on public.stores for select to authenticated using (owner_id = auth.uid());
create policy stores_owner_insert on public.stores for insert to authenticated with check (owner_id = auth.uid());
create policy stores_owner_update on public.stores for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid() and status not in ('restricted', 'suspended'));

create policy store_verifications_public_read on public.store_verifications for select to anon, authenticated using (state = 'verified' and exists (select 1 from public.stores where stores.id = store_id and stores.status in ('published', 'paused')));
create policy store_verifications_owner_read on public.store_verifications for select to authenticated using (public.current_user_owns_store(store_id));
create policy store_verifications_owner_submit on public.store_verifications for insert to authenticated with check (public.current_user_owns_store(store_id) and state = 'pending' and reviewed_at is null and reviewed_by is null);

create policy products_public_read on public.products for select to anon, authenticated using (
  status in ('published', 'sold_out') and exists (select 1 from public.stores where stores.id = store_id and stores.status in ('published', 'paused'))
);
create policy products_owner_read on public.products for select to authenticated using (public.current_user_owns_store(store_id));
create policy products_owner_insert on public.products for insert to authenticated with check (public.current_user_owns_store(store_id));
create policy products_owner_update on public.products for update to authenticated using (public.current_user_owns_store(store_id)) with check (public.current_user_owns_store(store_id));

create policy product_images_public_read on public.product_images for select to anon, authenticated using (exists (select 1 from public.products where products.id = product_id and products.status in ('published', 'sold_out')));
create policy product_images_owner_all on public.product_images for all to authenticated using (public.current_user_owns_product(product_id)) with check (public.current_user_owns_product(product_id));
create policy product_options_public_read on public.product_options for select to anon, authenticated using (exists (select 1 from public.products where products.id = product_id and products.status in ('published', 'sold_out')));
create policy product_options_owner_all on public.product_options for all to authenticated using (public.current_user_owns_product(product_id)) with check (public.current_user_owns_product(product_id));
create policy product_option_values_public_read on public.product_option_values for select to anon, authenticated using (exists (select 1 from public.product_options option where option.id = option_id and exists (select 1 from public.products where products.id = option.product_id and products.status in ('published', 'sold_out'))));
create policy product_option_values_owner_all on public.product_option_values for all to authenticated using (exists (select 1 from public.product_options option where option.id = option_id and public.current_user_owns_product(option.product_id))) with check (exists (select 1 from public.product_options option where option.id = option_id and public.current_user_owns_product(option.product_id)));
create policy product_variants_public_read on public.product_variants for select to anon, authenticated using (exists (select 1 from public.products where products.id = product_id and products.status in ('published', 'sold_out')));
create policy product_variants_owner_all on public.product_variants for all to authenticated using (public.current_user_owns_product(product_id)) with check (public.current_user_owns_product(product_id));
create policy product_variant_values_public_read on public.product_variant_values for select to anon, authenticated using (exists (select 1 from public.product_variants variant join public.products product on product.id = variant.product_id where variant.id = variant_id and product.status in ('published', 'sold_out')));
create policy product_variant_values_owner_all on public.product_variant_values for all to authenticated using (exists (select 1 from public.product_variants where product_variants.id = variant_id and public.current_user_owns_product(product_variants.product_id))) with check (exists (select 1 from public.product_variants where product_variants.id = variant_id and public.current_user_owns_product(product_variants.product_id)));

create policy drops_public_read on public.drops for select to anon, authenticated using (status in ('published', 'ended') and exists (select 1 from public.stores where stores.id = store_id and stores.status in ('published', 'paused')));
create policy drops_owner_all on public.drops for all to authenticated using (public.current_user_owns_store(store_id)) with check (public.current_user_owns_store(store_id));
create policy drop_products_public_read on public.drop_products for select to anon, authenticated using (exists (select 1 from public.drops where drops.id = drop_id and drops.status in ('published', 'ended')));
create policy drop_products_owner_all on public.drop_products for all to authenticated using (exists (select 1 from public.drops where drops.id = drop_id and public.current_user_owns_store(drops.store_id))) with check (exists (select 1 from public.drops where drops.id = drop_id and public.current_user_owns_store(drops.store_id)));

create policy order_intents_seller_read on public.order_intents for select to authenticated using (public.current_user_owns_store(store_id));
create policy order_intents_seller_update on public.order_intents for update to authenticated using (public.current_user_owns_store(store_id)) with check (public.current_user_owns_store(store_id));
create policy order_intent_items_seller_read on public.order_intent_items for select to authenticated using (exists (select 1 from public.order_intents intent where intent.id = order_intent_id and public.current_user_owns_store(intent.store_id)));

-- Reports are accepted through a server-only operation and never publicly enumerable.

grant select on public.cities, public.categories to anon, authenticated;
grant select on public.stores, public.products, public.product_images, public.product_options, public.product_option_values, public.product_variants, public.product_variant_values, public.drops, public.drop_products to anon, authenticated;
grant select (id, store_id, verification_type, state, public_label, reviewed_at, created_at, updated_at) on public.store_verifications to anon, authenticated;
grant select on public.profiles, public.seller_profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant update (onboarding_step, onboarding_complete, preferences) on public.seller_profiles to authenticated;
grant insert, update on public.stores, public.products, public.drops to authenticated;
grant insert on public.store_verifications to authenticated;
grant insert, update, delete on public.product_images, public.product_options, public.product_option_values, public.product_variants, public.product_variant_values, public.drop_products to authenticated;
grant select, update on public.order_intents to authenticated;
grant select on public.order_intent_items to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-media', 'product-media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('store-media', 'store-media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('verification-documents', 'verification-documents', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy public_product_media_read on storage.objects for select to anon, authenticated using (
  bucket_id = 'product-media' and (
    owner_id = auth.uid()::text
    or exists (
      select 1 from public.product_images image
      join public.products product on product.id = image.product_id
      join public.stores store on store.id = product.store_id
      where image.storage_path = storage.objects.name and product.status in ('published', 'sold_out') and store.status in ('published', 'paused')
    )
  )
);
create policy public_store_media_read on storage.objects for select to anon, authenticated using (
  bucket_id = 'store-media' and (
    owner_id = auth.uid()::text
    or exists (select 1 from public.stores store where storage.objects.name in (store.logo_path, store.cover_path) and store.status in ('published', 'paused'))
    or exists (select 1 from public.drops drop_row where drop_row.cover_path = storage.objects.name and drop_row.status in ('published', 'ended'))
  )
);
create policy seller_product_media_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy seller_product_media_update on storage.objects for update to authenticated using (
  bucket_id = 'product-media' and owner_id = auth.uid()::text
) with check (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy seller_product_media_delete on storage.objects for delete to authenticated using (bucket_id = 'product-media' and owner_id = auth.uid()::text);
create policy seller_store_media_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'store-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy seller_store_media_update on storage.objects for update to authenticated using (bucket_id = 'store-media' and owner_id = auth.uid()::text) with check (bucket_id = 'store-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy seller_store_media_delete on storage.objects for delete to authenticated using (bucket_id = 'store-media' and owner_id = auth.uid()::text);
create policy seller_verification_media_read on storage.objects for select to authenticated using (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy seller_verification_media_insert on storage.objects for insert to authenticated with check (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy seller_verification_media_delete on storage.objects for delete to authenticated using (bucket_id = 'verification-documents' and owner_id = auth.uid()::text);

create or replace function public.search_marketplace(p_query text, p_limit integer default 12)
returns table (
  entity_type text,
  entity_id uuid,
  slug text,
  title text,
  subtitle text,
  image_path text,
  price numeric,
  store_id uuid,
  relevance real
)
language sql
stable
security invoker
set search_path = ''
as $$
  with query as (
    select trim(left(coalesce(p_query, ''), 120)) as term,
           plainto_tsquery('simple'::regconfig, trim(left(coalesce(p_query, ''), 120))) as tsq
  ), results as (
    select
      'store'::text as entity_type,
      store.id as entity_id,
      store.slug,
      store.name as title,
      store.tagline as subtitle,
      store.logo_path as image_path,
      null::numeric as price,
      store.id as store_id,
      (case when lower(store.name) = lower(query.term) then 8 else 0 end
       + case when lower(store.name) like lower(query.term) || '%' then 4 else 0 end
       + ts_rank_cd(store.search_vector, query.tsq, 32))::real as relevance
    from public.stores store cross join query
    where query.term <> '' and store.status = 'published'
      and (store.search_vector @@ query.tsq or store.name ilike '%' || query.term || '%')
    union all
    select
      'product', product.id, product.slug, product.title, store.name,
      (select image.storage_path from public.product_images image where image.product_id = product.id order by image.is_cover desc, image.sort_order limit 1),
      case
        when product.promotion_price is not null
          and (product.promotion_starts_at is null or product.promotion_starts_at <= now())
          and (product.promotion_ends_at is null or product.promotion_ends_at > now())
        then product.promotion_price else product.regular_price
      end,
      product.store_id,
      (case when lower(product.title) = lower(query.term) then 8 else 0 end
       + case when lower(product.title) like lower(query.term) || '%' then 4 else 0 end
       + ts_rank_cd(product.search_vector, query.tsq, 32))::real
    from public.products product
    join public.stores store on store.id = product.store_id
    cross join query
    where query.term <> '' and product.status = 'published' and store.status = 'published'
      and (product.search_vector @@ query.tsq or product.title ilike '%' || query.term || '%' or store.name ilike '%' || query.term || '%')
    union all
    select
      'drop', drop_row.id, drop_row.slug, drop_row.title, store.name,
      drop_row.cover_path, null::numeric, drop_row.store_id,
      (case when lower(drop_row.title) = lower(query.term) then 8 else 0 end
       + case when lower(drop_row.title) like lower(query.term) || '%' then 4 else 0 end
       + extensions.similarity(drop_row.title, query.term))::real
    from public.drops drop_row
    join public.stores store on store.id = drop_row.store_id
    cross join query
    where query.term <> '' and drop_row.status = 'published' and store.status = 'published'
      and (drop_row.title ilike '%' || query.term || '%' or extensions.similarity(drop_row.title, query.term) > 0.2)
  )
  select * from results order by relevance desc, title asc limit greatest(1, least(coalesce(p_limit, 12), 30));
$$;

grant execute on function public.search_marketplace(text, integer) to anon, authenticated;
