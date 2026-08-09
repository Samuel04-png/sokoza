-- Backfill seller domain rows for Auth users created before the core trigger existed.
-- Future users continue to be provisioned by public.handle_new_auth_user().

insert into public.profiles (id, full_name, role)
select
  auth_user.id,
  left(coalesce(auth_user.raw_user_meta_data ->> 'full_name', ''), 120),
  'seller'
from auth.users auth_user
where auth_user.raw_user_meta_data ->> 'account_type' = 'seller'
on conflict (id) do update
set full_name = case
      when public.profiles.full_name = '' then excluded.full_name
      else public.profiles.full_name
    end,
    role = 'seller';

insert into public.seller_profiles (user_id, terms_accepted_at)
select auth_user.id, coalesce(auth_user.created_at, now())
from auth.users auth_user
where auth_user.raw_user_meta_data ->> 'account_type' = 'seller'
on conflict (user_id) do nothing;
