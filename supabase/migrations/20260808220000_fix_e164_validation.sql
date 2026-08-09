-- PostgreSQL standard strings preserve backslashes. The original E.164 regular
-- expressions therefore contained one escape too many on the live database.

alter table public.stores
  drop constraint if exists stores_whatsapp_e164_check;
alter table public.stores
  add constraint stores_whatsapp_e164_check
  check (whatsapp_e164 = '' or whatsapp_e164 ~ '^\+[1-9][0-9]{7,14}$');

alter table public.order_intents
  drop constraint if exists order_intents_seller_whatsapp_snapshot_check;
alter table public.order_intents
  add constraint order_intents_seller_whatsapp_snapshot_check
  check (seller_whatsapp_snapshot ~ '^\+[1-9][0-9]{7,14}$');

-- Repair both publication functions without duplicating their full definitions.
do $$
declare
  definition text;
  function_oid oid;
begin
  for function_oid in
    select procedure.oid
    from pg_proc procedure
    join pg_namespace namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname in ('publish_store', 'create_order_intent_server')
  loop
    definition := pg_get_functiondef(function_oid);
    definition := replace(definition, $bad$^\\+$bad$, $good$^\+$good$);
    execute definition;
  end loop;
end;
$$;
