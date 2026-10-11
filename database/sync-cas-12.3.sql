-- LIFE OS 12.3: execute manually in Supabase SQL Editor BEFORE deploying front-end.
-- Atomic compare-and-swap on life_data.updatedAt prevents device races.
-- Profile RLS and plan/payment permissions from security.sql must already be installed.
create or replace function public.save_life_data_cas(payload jsonb, expected_revision text default '')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  stamp text;
  changed integer;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object'
     or jsonb_typeof(payload->'data') <> 'object'
     or length(coalesce(payload->>'updatedAt','')) < 19 then
    raise exception 'invalid_backup';
  end if;
  if octet_length(payload::text) > 6000000 then raise exception 'backup_too_large'; end if;
  stamp := payload->>'updatedAt';
  if (stamp::timestamptz) > now() + interval '5 minutes' then
    raise exception 'future_backup';
  end if;
  update public.profiles
     set life_data = payload
   where id = auth.uid()
     and coalesce(life_data->>'updatedAt','') = coalesce(expected_revision,'');
  get diagnostics changed = row_count;
  if changed = 1 then
    return jsonb_build_object('status','saved','revision',stamp);
  end if;
  if exists(select 1 from public.profiles where id = auth.uid()) then
    return jsonb_build_object('status','conflict');
  end if;
  return jsonb_build_object('status','profile-not-found');
end;
$$;
revoke all on function public.save_life_data_cas(jsonb,text) from public;
grant execute on function public.save_life_data_cas(jsonb,text) to authenticated;
-- Once all updated clients are deployed, disable the unguarded legacy writer.
-- DO NOT re-run security.sql afterwards without reapplying this REVOKE.
revoke execute on function public.save_life_data(jsonb) from authenticated;
