-- LIFE OS: executar UMA VEZ pelo SQL Editor do projeto Supabase correto.
-- Não substitui tabelas de perfis existentes nem altera o fluxo de cartão.
-- Executar depois de conferir o preço R$ 29,90 e as colunas profiles.plan/pro_until/subscription_status.
create extension if not exists pgcrypto;

create table if not exists public.life_pix_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null check (amount_cents = 2990),
  currency text not null default 'BRL' check (currency = 'BRL'),
  status text not null default 'pending' check (status in ('pending','paid','refunded','charged_back')),
  preference_id text unique,
  payment_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  expires_at timestamptz,
  reversed_at timestamptz
);
create index if not exists life_pix_orders_user_idx on public.life_pix_orders(user_id, created_at desc);
alter table public.life_pix_orders enable row level security;
revoke all on public.life_pix_orders from anon, authenticated;
-- Sem policies para navegador: somente Edge Functions com SERVICE_ROLE acessam pedidos.

create or replace function public.life_apply_pix_payment(
  p_order_id uuid, p_payment_id text, p_amount_cents integer, p_currency text
) returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_order public.life_pix_orders%rowtype;
  v_plan text;
  v_until timestamptz;
begin
  if auth.role() <> 'service_role' then raise exception 'Não autorizado'; end if;
  if p_amount_cents <> 2990 or p_currency <> 'BRL' or p_payment_id !~ '^[0-9]{1,25}$' then
    raise exception 'Pagamento inconsistente';
  end if;
  select * into v_order from public.life_pix_orders where id = p_order_id for update;
  if not found then raise exception 'Pedido inexistente'; end if;
  if v_order.amount_cents <> p_amount_cents or v_order.currency <> p_currency then raise exception 'Valor divergente'; end if;
  if v_order.status = 'paid' and v_order.payment_id = p_payment_id then return 'already_applied'; end if;
  if v_order.status <> 'pending' then raise exception 'Pedido já finalizado'; end if;

  -- Trava perfil para impedir corrida entre 2 aprovações simultâneas.
  select plan, pro_until into v_plan, v_until from public.profiles where id = v_order.user_id for update;
  if not found or upper(coalesce(v_plan,'')) = 'OWNER' then raise exception 'Perfil ausente ou OWNER'; end if;
  v_until := greatest(now(), coalesce(v_until, now())) + interval '30 days';
  update public.life_pix_orders
     set status = 'paid', payment_id = p_payment_id, paid_at = now(), expires_at = v_until
   where id = p_order_id;
  update public.profiles
     set plan = 'PRO', pro_until = v_until, subscription_status = 'pix_active'
   where id = v_order.user_id;
  return 'applied';
end $$;

create or replace function public.life_reverse_pix_payment(
  p_order_id uuid, p_payment_id text, p_reason text
) returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_order public.life_pix_orders%rowtype;
  v_profile_status text;
  v_profile_until timestamptz;
  v_adjusted_until timestamptz;
begin
  if auth.role() <> 'service_role' then raise exception 'Não autorizado'; end if;
  if p_reason not in ('refunded','charged_back') then raise exception 'Motivo inválido'; end if;
  select * into v_order from public.life_pix_orders where id = p_order_id for update;
  if not found then return 'unknown'; end if;
  if v_order.status = p_reason then return 'already_reversed'; end if;
  if v_order.status <> 'paid' or v_order.payment_id <> p_payment_id then return 'not_applied'; end if;
  update public.life_pix_orders set status = p_reason, reversed_at = now() where id = p_order_id;
  select subscription_status, pro_until into v_profile_status, v_profile_until
    from public.profiles where id = v_order.user_id for update;
  -- Nunca modificar outra assinatura administrada pelo checkout de cartão.
  if v_profile_status = 'pix_active' then
    -- Cada pedido aprovado adiciona exatamente 30 dias; ao estornar um pedido,
    -- subtraímos exatamente seu crédito mesmo se houve compras posteriores.
    v_adjusted_until := coalesce(v_profile_until, now()) - interval '30 days';
    if v_adjusted_until <= now() then
      update public.profiles set plan = 'FREE', pro_until = null, subscription_status = p_reason
       where id = v_order.user_id and subscription_status = 'pix_active';
    else
      update public.profiles set pro_until = v_adjusted_until
       where id = v_order.user_id and subscription_status = 'pix_active';
    end if;
  end if;
  return 'reversed';
end $$;

revoke all on function public.life_apply_pix_payment(uuid,text,integer,text) from public, anon, authenticated;
revoke all on function public.life_reverse_pix_payment(uuid,text,text) from public, anon, authenticated;
grant execute on function public.life_apply_pix_payment(uuid,text,integer,text) to service_role;
grant execute on function public.life_reverse_pix_payment(uuid,text,text) to service_role;
