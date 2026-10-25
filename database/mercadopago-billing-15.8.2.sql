-- LIFE OS 15.8.2 — apply manually to the EXISTING Supabase database after review.
-- Not a replacement for database/security.sql. Requires public.profiles(id,plan,pro_until,subscription_status).
BEGIN;
CREATE TABLE IF NOT EXISTS public.life_mp_checkouts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 method text NOT NULL CHECK(method IN ('card','pix','boleto')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','created','active','paid','cancelled','paused','failed')),
 provider_id text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
-- Only one non-cancelled card checkout per account, even under simultaneous requests.
-- If this fails, reconcile pre-existing duplicate checkouts manually; do not discard charge records.
CREATE UNIQUE INDEX IF NOT EXISTS life_mp_one_open_card_checkout ON public.life_mp_checkouts(user_id)
 WHERE method='card' AND status IN ('pending','created','active','paid');
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
