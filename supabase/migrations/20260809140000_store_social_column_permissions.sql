-- Social profiles are optional Store fields. The Store editor always submits
-- their current values, including empty strings, so sellers need the same
-- narrow column-level permissions used by the rest of the editable Store copy.
grant insert (facebook_url, tiktok_url) on public.stores to authenticated;
grant update (facebook_url, tiktok_url) on public.stores to authenticated;
