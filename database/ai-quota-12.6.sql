-- LIFE OS 12.6 — opt-in quota for authenticated LIFE AI users.
-- REVIEW IN A TEST SUPABASE PROJECT FIRST. Installs no payments or OWNER privileges.
-- Adjust limit values here before publishing; current examples: FREE 10/day, PRO 50/day, OWNER 50/day.
begin;
create table if not exists public.life_ai_daily_quota (
  user_id uuid not null references auth.users(id) on delete cascade,
  day_utc date not null,
  used integer not null default 0 check (used >= 0),
  primary key (user_id, day_utc)
);
alter table public.life_ai_daily_quota enable row level security;
revoke all on public.life_ai_daily_quota from public, anon, authenticated;
-- No table RLS policy: normal clients cannot read/update another account's counts.
create or replace function public.consume_life_ai_quota()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  requester uuid := auth.uid();
  acc_plan text := 'FREE';
  acc_status text := '';
  ends_at timestamptz;
  permitted integer := 10;
  new_used integer;
begin
  if requester is null then raise exception 'not_authenticated'; end if;
  select upper(coalesce(p.plan,'FREE')), lower(coalesce(p.subscription_status,'')), p.pro_until
    into acc_plan, acc_status, ends_at
    from public.profiles p where p.id=requester;
  if not found then raise exception 'profile_missing'; end if;
  if acc_plan='OWNER' then permitted := 50;
  elsif acc_plan='PRO'
    and (ends_at is null or ends_at > now())
    and acc_status not in ('expired','refunded','revoked','cancelled','canceled','chargeback','suspended','paused','disputed')
    then permitted := 50;
  end if;
  insert into public.life_ai_daily_quota(user_id,day_utc,used)
  values (requester,(now() at time zone 'utc')::date,1)
  on conflict (user_id, day_utc) do update
    set used = public.life_ai_daily_quota.used + 1
    where public.life_ai_daily_quota.used < permitted
  returning used into new_used;
  if new_used is null then
    return jsonb_build_object('allowed',false,'remaining',0);
  end if;
  return jsonb_build_object('allowed',true,'remaining',greatest(0,permitted-new_used));
end;
$$;
revoke all on function public.consume_life_ai_quota() from public;
grant execute on function public.consume_life_ai_quota() to authenticated;
commit;
