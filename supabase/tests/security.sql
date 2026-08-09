begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(16);

select extensions.ok((select relrowsecurity from pg_class where oid = 'public.stores'::regclass), 'stores has RLS');
select extensions.ok((select relrowsecurity from pg_class where oid = 'public.products'::regclass), 'products has RLS');
select extensions.ok((select relrowsecurity from pg_class where oid = 'public.order_intents'::regclass), 'order intents has RLS');
select extensions.ok((select relrowsecurity from pg_class where oid = 'public.order_intent_items'::regclass), 'order intent items has RLS');
select extensions.ok((select relrowsecurity from pg_class where oid = 'public.store_verifications'::regclass), 'verification state has RLS');
select extensions.ok((select relrowsecurity from pg_class where oid = 'private.marketplace_events'::regclass), 'raw marketplace events have RLS');

select extensions.ok(not has_table_privilege('anon', 'public.products', 'INSERT'), 'anonymous cannot insert products');
select extensions.ok(not has_table_privilege('anon', 'public.products', 'UPDATE'), 'anonymous cannot update products');
select extensions.ok(not has_table_privilege('anon', 'public.order_intents', 'SELECT'), 'anonymous cannot enumerate order intents');
select extensions.ok(not has_table_privilege('authenticated', 'private.marketplace_events', 'SELECT'), 'seller cannot read raw marketplace events');
select extensions.ok(not has_column_privilege('anon', 'public.store_verifications', 'evidence_path', 'SELECT'), 'anonymous cannot read verification evidence paths');
select extensions.ok(not has_column_privilege('authenticated', 'public.store_verifications', 'evidence_path', 'SELECT'), 'seller cannot read verification evidence paths through public rows');
select extensions.ok(not has_column_privilege('authenticated', 'public.stores', 'status', 'UPDATE'), 'seller cannot bypass Store status functions');
select extensions.ok(not has_column_privilege('authenticated', 'public.products', 'status', 'UPDATE'), 'seller cannot bypass product status functions');
select extensions.ok(not has_function_privilege('anon', 'public.create_order_intent_server(text,uuid,jsonb,uuid,text)', 'EXECUTE'), 'anonymous cannot execute order-intent service function');
select extensions.ok(not has_function_privilege('authenticated', 'public.capture_marketplace_event_server(text,uuid,uuid,text,text,text,uuid,text,uuid)', 'EXECUTE'), 'seller cannot forge authoritative marketplace events directly');

select * from extensions.finish();
rollback;
