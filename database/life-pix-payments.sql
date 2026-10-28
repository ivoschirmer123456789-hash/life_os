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


-- NOVO CHECKOUT PRO (15.8.4): aplicar junto da migração legado, sem apagar dados.
-- LIFE OS 15.8.5 — apply manually to the EXISTING Supabase database after review.
-- Not a replacement for database/security.sql. Requires public.profiles(id,plan,pro_until,subscription_status).
BEGIN;
CREATE TABLE IF NOT EXISTS public.life_mp_checkouts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 method text NOT NULL CHECK(method IN ('card','pix','boleto','checkout')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','created','active','paid','cancelled','paused','failed')),
 provider_id text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
-- Only one non-cancelled card checkout per account, even under simultaneous requests.
-- If this fails, reconcile pre-existing duplicate checkouts manually; do not discard charge records.
CREATE UNIQUE INDEX IF NOT EXISTS life_mp_one_open_card_checkout ON public.life_mp_checkouts(user_id)
 WHERE method='card' AND status IN ('pending','created','active','paid');
ALTER TABLE public.life_mp_checkouts DROP CONSTRAINT IF EXISTS life_mp_checkouts_method_check;
ALTER TABLE public.life_mp_checkouts ADD CONSTRAINT life_mp_checkouts_method_check CHECK(method IN ('card','pix','boleto','checkout'));
ALTER TABLE public.life_mp_checkouts DROP CONSTRAINT IF EXISTS life_mp_checkouts_status_check;
ALTER TABLE public.life_mp_checkouts ADD CONSTRAINT life_mp_checkouts_status_check
 CHECK (status IN ('pending','created','active','paid','cancelled','paused','failed'));
CREATE INDEX IF NOT EXISTS life_mp_checkouts_user_idx ON public.life_mp_checkouts(user_id,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS life_mp_checkouts_provider_unique ON public.life_mp_checkouts(provider_id) WHERE provider_id IS NOT NULL;
ALTER TABLE public.life_mp_checkouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS life_mp_read_own ON public.life_mp_checkouts;
CREATE POLICY life_mp_read_own ON public.life_mp_checkouts FOR SELECT TO authenticated USING(user_id=auth.uid());
REVOKE INSERT,UPDATE,DELETE ON public.life_mp_checkouts FROM anon,authenticated;
GRANT SELECT ON public.life_mp_checkouts TO authenticated;
GRANT ALL ON public.life_mp_checkouts TO service_role;
CREATE TABLE IF NOT EXISTS public.life_mp_payments (
 payment_id text PRIMARY KEY,
 checkout_id uuid NOT NULL REFERENCES public.life_mp_checkouts(id),
 user_id uuid NOT NULL REFERENCES auth.users(id),
 amount numeric(10,2) NOT NULL,
 currency text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.life_mp_payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.life_mp_payments FROM PUBLIC, anon,authenticated;
GRANT ALL ON public.life_mp_payments TO service_role;
-- This SECURITY DEFINER RPC is callable only by service_role. The webhook verifies the signed
-- notification and independently retrieves the approved transaction from Mercado Pago.
CREATE OR REPLACE FUNCTION public.life_apply_mp_payment(
 p_checkout_id uuid,p_payment_id text,p_amount numeric,p_currency text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.life_mp_checkouts%ROWTYPE;
BEGIN
 SELECT * INTO c FROM public.life_mp_checkouts WHERE id=p_checkout_id FOR UPDATE;
 IF NOT FOUND OR c.status NOT IN ('created','active','paid','cancelled') OR p_payment_id IS NULL OR length(p_payment_id)>100
    OR p_amount <> 29.90 OR p_currency <> 'BRL' THEN
   RAISE EXCEPTION 'invalid_payment';
 END IF;
 INSERT INTO public.life_mp_payments(payment_id,checkout_id,user_id,amount,currency)
 VALUES(p_payment_id,c.id,c.user_id,p_amount,p_currency) ON CONFLICT(payment_id) DO NOTHING;
 IF NOT FOUND THEN RETURN false; END IF;
 UPDATE public.profiles
 SET plan=CASE WHEN upper(coalesce(plan,'FREE'))='OWNER' THEN 'OWNER' ELSE 'PRO' END,
     subscription_status='active',
     pro_until=GREATEST(now(),coalesce(pro_until,now())) + CASE WHEN c.method='card' THEN interval '1 month' ELSE interval '30 days' END
 WHERE id=c.user_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'profile_not_found'; END IF;
 UPDATE public.life_mp_checkouts SET status=CASE WHEN c.status='cancelled' THEN 'cancelled' WHEN c.method='card' THEN 'active' ELSE 'paid' END,
 updated_at=now() WHERE id=c.id;
 RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.life_apply_mp_payment(uuid,text,numeric,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.life_apply_mp_payment(uuid,text,numeric,text) TO service_role;
-- Protect paid plan fields even if an older, broad client UPDATE policy is still installed.
CREATE OR REPLACE FUNCTION public.life_guard_paid_fields() RETURNS trigger
LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF current_setting('request.jwt.claim.role',true) IN ('authenticated','anon') AND
    (NEW.plan IS DISTINCT FROM OLD.plan OR NEW.pro_until IS DISTINCT FROM OLD.pro_until
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status) THEN
   RAISE EXCEPTION 'billing_fields_are_server_only';
 END IF;
 RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS life_guard_paid_fields ON public.profiles;
CREATE TRIGGER life_guard_paid_fields BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.life_guard_paid_fields();
COMMIT;


-- LIFE OS 15.8.5 — Reconciliação segura + estornos. Rodar no mesmo projeto Supabase.
-- Extensão não destrutiva para instalações anteriores 15.8.3.
BEGIN;
ALTER TABLE public.life_mp_payments
  ADD COLUMN IF NOT EXISTS paid_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.life_mp_payments
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';

CREATE OR REPLACE FUNCTION public.life_apply_mp_payment_v1584(
  p_checkout_id uuid, p_payment_id text, p_amount numeric, p_currency text, p_paid_at timestamptz
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
  v_checkout public.life_mp_checkouts%ROWTYPE;
  v_old_plan text;
  v_old_until timestamptz;
  v_new_until timestamptz;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'server_only'; END IF;
  IF p_payment_id !~ '^[0-9]{1,25}$' OR p_amount <> 29.90 OR p_currency <> 'BRL' OR p_paid_at IS NULL
     OR p_paid_at > now() + interval '5 minutes' THEN RAISE EXCEPTION 'invalid_payment'; END IF;
  SELECT * INTO v_checkout FROM public.life_mp_checkouts WHERE id=p_checkout_id FOR UPDATE;
  IF NOT FOUND OR v_checkout.status NOT IN ('pending','created','active','paid','cancelled')
     OR p_paid_at < v_checkout.created_at - interval '7 days' THEN
    RAISE EXCEPTION 'checkout_mismatch';
  END IF;
  INSERT INTO public.life_mp_payments(payment_id,checkout_id,user_id,amount,currency,paid_at,status)
  VALUES(p_payment_id,v_checkout.id,v_checkout.user_id,p_amount,p_currency,p_paid_at,'approved')
  ON CONFLICT(payment_id) DO NOTHING;
  IF NOT FOUND THEN RETURN false; END IF;
  SELECT plan,pro_until INTO v_old_plan,v_old_until FROM public.profiles WHERE id=v_checkout.user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile_missing'; END IF;
  -- Crédito a partir da aprovação REAL, não do dia em que o cliente clicou para conciliar.
  v_new_until=GREATEST(coalesce(v_old_until,p_paid_at),p_paid_at)+ interval '30 days';
  UPDATE public.profiles
     SET plan=CASE WHEN upper(coalesce(v_old_plan,'FREE'))='OWNER' THEN 'OWNER' ELSE 'PRO' END,
         pro_until=v_new_until,
         subscription_status='active'
   WHERE id=v_checkout.user_id;
  UPDATE public.life_mp_checkouts
    SET status=CASE WHEN status='cancelled' THEN 'cancelled' WHEN method='card' THEN 'active' ELSE 'paid' END,
        updated_at=now() WHERE id=v_checkout.id;
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.life_apply_mp_payment_v1584(uuid,text,numeric,text,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.life_apply_mp_payment_v1584(uuid,text,numeric,text,timestamptz) TO service_role;

CREATE OR REPLACE FUNCTION public.life_reverse_mp_payment_v1584(
  p_checkout_id uuid,p_payment_id text,p_reason text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
  v_payment public.life_mp_payments%ROWTYPE;
  v_plan text;
  v_status text;
  v_until timestamptz;
  v_adjusted timestamptz;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'server_only'; END IF;
  IF p_reason NOT IN ('refunded','charged_back') OR p_payment_id !~ '^[0-9]{1,25}$' THEN
    RAISE EXCEPTION 'invalid_reversal'; END IF;
  SELECT * INTO v_payment FROM public.life_mp_payments
    WHERE payment_id=p_payment_id AND checkout_id=p_checkout_id FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF v_payment.status <> 'approved' THEN RETURN false; END IF;
  UPDATE public.life_mp_payments SET status=p_reason WHERE payment_id=p_payment_id;
  SELECT plan,subscription_status,pro_until INTO v_plan,v_status,v_until
   FROM public.profiles WHERE id=v_payment.user_id FOR UPDATE;
  -- Não altera OWNER, nem uma assinatura administrada por outra integração.
  IF upper(coalesce(v_plan,''))='PRO' AND v_status='active' THEN
    v_adjusted=coalesce(v_until,now())- interval '30 days';
    IF v_adjusted <= now() THEN
      UPDATE public.profiles SET plan='FREE',pro_until=NULL,subscription_status=p_reason
       WHERE id=v_payment.user_id;
    ELSE
      UPDATE public.profiles SET pro_until=v_adjusted WHERE id=v_payment.user_id;
    END IF;
  END IF;
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.life_reverse_mp_payment_v1584(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.life_reverse_mp_payment_v1584(uuid,text,text) TO service_role;
COMMIT;
