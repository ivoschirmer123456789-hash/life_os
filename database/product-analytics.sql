-- LIFE OS 2.0 — Professional Pass
-- Execute no SQL Editor do Supabase depois do supabase-quality-update.sql.
-- Cria analytics de produto sem conteúdo sensível do usuário e reforça consultas do OWNER.

begin;

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null check (char_length(event_name) between 1 and 80),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists product_events_user_created_idx
  on public.product_events(user_id, created_at desc);
create index if not exists product_events_name_created_idx
  on public.product_events(event_name, created_at desc);

alter table public.product_events enable row level security;

drop policy if exists "life_events_insert_own" on public.product_events;
drop policy if exists "life_events_read_own_or_owner" on public.product_events;

create policy "life_events_insert_own"
on public.product_events
for insert
to authenticated
with check (user_id = auth.uid());

create policy "life_events_read_own_or_owner"
on public.product_events
for select
to authenticated
using (user_id = auth.uid() or public.is_life_owner());

revoke all on table public.product_events from anon;
grant insert, select on table public.product_events to authenticated;

-- Visão agregada para o OWNER. Não expõe texto de notas, tarefas, finanças ou prompts.
create or replace view public.life_product_daily as
select
  date_trunc('day', created_at) as day,
  event_name,
  count(*)::bigint as events,
  count(distinct user_id)::bigint as users
from public.product_events
group by 1,2;

-- A view usa as permissões da tabela; mantenha o acesso somente autenticado.
revoke all on public.life_product_daily from anon;
grant select on public.life_product_daily to authenticated;

commit;

-- Eventos enviados pela versão 2.0 incluem somente nome do evento e metadados curtos
-- definidos pelo produto. Não envie texto livre de notas, tarefas, finanças, senhas ou prompts.
