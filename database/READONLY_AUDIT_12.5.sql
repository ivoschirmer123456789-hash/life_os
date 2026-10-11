-- LIFE OS 12.5: read-only Supabase security report.
-- This file does NOT change permissions, policies, profiles or subscriptions.
-- Run in SQL Editor and inspect results before making any production change.
-- Check profiles RLS and grants for anon/authenticated.
select n.nspname as schema, c.relname as table_name, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind in ('r','p')
  and c.relname in ('profiles','product_events')
order by c.relname;

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema='public' and table_name in ('profiles','product_events')
  and grantee in ('anon','authenticated')
order by table_name,grantee,privilege_type;

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname='public' and tablename in ('profiles','product_events')
order by tablename, policyname;

-- CAS writer should be the ONLY authenticated way to update life_data.
-- Legacy save_life_data must not remain executable by authenticated/anon.
select p.proname, pg_get_function_identity_arguments(p.oid) as args,
       has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_can_execute,
       has_function_privilege('anon',p.oid,'EXECUTE') as anon_can_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('save_life_data','save_life_data_cas','is_life_owner')
order by p.proname;

-- Expected: save_life_data=false, save_life_data_cas=true for authenticated;
-- no UPDATE/INSERT/DELETE grant for authenticated on public.profiles;
-- RLS enabled; owner checks performed server-side.
-- Verify payments only through your authenticated, signed webhook/backend.
