-- LIFE OS — Quality Update / segurança de dados e OWNER
-- Execute no SQL Editor do Supabase do projeto do LIFE OS.
-- Objetivo: o navegador pode LER o plano, mas não pode transformar FREE em PRO/OWNER.
-- Pagamentos/Edge Functions usando service_role continuam capazes de atualizar plan/pro_until/subscription_status.

begin;

alter table public.profiles enable row level security;

-- Função segura para identificar o proprietário sem recursão de RLS.
create or replace function public.is_life_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and upper(coalesce(plan, 'FREE')) = 'OWNER'
  );
$$;

revoke all on function public.is_life_owner() from public;
grant execute on function public.is_life_owner() to authenticated;

-- Remove políticas LIFE antigas com estes nomes para tornar o arquivo reaplicável.
drop policy if exists "life_profiles_read_own_or_owner" on public.profiles;
drop policy if exists "life_profiles_insert_own" on public.profiles;
drop policy if exists "life_profiles_update_own" on public.profiles;
drop policy if exists "life_profiles_owner_all" on public.profiles;

-- Usuário comum lê apenas o próprio perfil. OWNER consegue listar todas as contas.
create policy "life_profiles_read_own_or_owner"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_life_owner());

-- Não criamos policy de UPDATE para authenticated.
-- Assim, plan/pro_until/subscription_status não podem ser alterados diretamente pelo navegador.
revoke all on table public.profiles from anon;
revoke insert, update, delete on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;

-- Única escrita do app: backup do LIFE da própria conta.
create or replace function public.save_life_data(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  update public.profiles
  set life_data = payload
  where id = auth.uid();

  if not found then
    raise exception 'profile_not_found';
  end if;
end;
$$;

revoke all on function public.save_life_data(jsonb) from public;
grant execute on function public.save_life_data(jsonb) to authenticated;

commit;

-- VERIFICAÇÃO RÁPIDA (rode logado pelo app):
-- 1) FREE/PRO/OWNER deve carregar normalmente.
-- 2) Sincronizar dados deve continuar funcionando.
-- 3) Uma tentativa direta de UPDATE em profiles deve falhar para usuário comum.
-- 4) Conta OWNER deve conseguir abrir LIFE CONTROL e listar as contas.
