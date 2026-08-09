alter table public.stores
  add column if not exists facebook_url text not null default '',
  add column if not exists tiktok_url text not null default '';

alter table public.stores
  drop constraint if exists stores_facebook_url_check,
  add constraint stores_facebook_url_check check (
    facebook_url = '' or facebook_url ~ '^https://(www\.|m\.)?(facebook\.com|fb\.com)/[^[:space:]]+$'
  ),
  drop constraint if exists stores_tiktok_url_check,
  add constraint stores_tiktok_url_check check (
    tiktok_url = '' or tiktok_url ~ '^https://(www\.)?tiktok\.com/[^[:space:]]+$'
  );

insert into public.categories (name, slug, sort_order, active)
values
  ('Cardigans', 'cardigans', 55, true),
  ('Sleepwear', 'sleepwear', 56, true)
on conflict (slug) do update
set name = excluded.name, sort_order = excluded.sort_order, active = true;

comment on column public.stores.facebook_url is 'Optional canonical HTTPS Facebook profile/page URL. Empty means not supplied.';
comment on column public.stores.tiktok_url is 'Optional canonical HTTPS TikTok profile URL. Empty means not supplied.';
