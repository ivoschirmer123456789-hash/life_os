-- LIFE OS 13.0 — requests from the owner of a logged-in account.
-- Run in Supabase SQL Editor only after reviewing with the project administrator.
CREATE TABLE IF NOT EXISTS public.life_user_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('feedback','delete_account')),
  category text NOT NULL DEFAULT 'Geral' CHECK (char_length(category) <= 30),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 1200),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','resolved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS life_user_requests_by_user_created ON public.life_user_requests(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS life_one_pending_deletion ON public.life_user_requests(user_id)
  WHERE kind='delete_account' AND status='pending';
ALTER TABLE public.life_user_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.life_user_requests FROM PUBLIC, anon;
GRANT SELECT, INSERT ON public.life_user_requests TO authenticated;
DROP POLICY IF EXISTS life_request_own_read ON public.life_user_requests;
CREATE POLICY life_request_own_read ON public.life_user_requests FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS life_request_own_create ON public.life_user_requests;
CREATE POLICY life_request_own_create ON public.life_user_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()) AND status='pending');
-- No UPDATE/DELETE policy for end users. Operators process requests through an audited admin backend.
-- Deletion is NOT automatic: the provider must validate/fulfill the request and all related data flows.
