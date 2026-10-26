/** LIFE OS · Reconciliação do Pix. Publicar com --no-verify-jwt.
 * SEGURANÇA: assinatura do Mercado Pago + consulta autenticada à API antes de alterar perfis.
 * Registre esta URL no painel de Webhooks (evento Pagamentos) da aplicação Mercado Pago.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const json = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
const equalHex = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};
async function verifySignature(req: Request, dataId: string, secret: string): Promise<boolean> {
  const signature = req.headers.get('x-signature') || '';
  const requestId = req.headers.get('x-request-id') || '';
  const ts = /(?:^|,)\s*ts=([^,]+)/.exec(signature)?.[1]?.trim();
  const v1 = /(?:^|,)\s*v1=([a-f0-9]{64})(?:,|$)/i.exec(signature)?.[1]?.toLowerCase();
  if (!ts || !v1 || !requestId || !dataId || !/^\d+$/.test(ts)) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest)));
  const computed = Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
  return equalHex(computed, v1);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);
  const mpSecret = Deno.env.get('MP_WEBHOOK_SECRET');
  const token = Deno.env.get('MP_ACCESS_TOKEN');
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!mpSecret || !token || !url || !key) return json({ error: 'Webhook não configurado.' }, 503);
  const incomingUrl = new URL(req.url);
  const dataId = incomingUrl.searchParams.get('data.id') || '';
  if (!/^\d{1,25}$/.test(dataId) || !(await verifySignature(req, dataId, mpSecret))) return json({ error: 'Assinatura inválida.' }, 401);

  let event: { type?: string; data?: { id?: string | number } };
  try { event = await req.json(); } catch { return json({ error: 'JSON inválido.' }, 400); }
  if (event.type !== 'payment' || String(event.data?.id ?? '') !== dataId) return json({ ok: true, ignored: true });

  const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!paymentRes.ok) return json({ error: 'Falha ao consultar o pagamento.' }, 502);
  const payment = await paymentRes.json().catch(() => null);
  if (!payment || String(payment.id) !== dataId) return json({ error: 'Pagamento inconsistente.' }, 502);

  const orderId = String(payment.external_reference || '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) return json({ ok: true, ignored: true });
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: order, error: orderError } = await db.from('life_pix_orders')
    .select('id,amount_cents,currency,preference_id').eq('id', orderId).maybeSingle();
  if (orderError) return json({ error: 'Falha ao consultar a cobrança.' }, 503);
  if (!order) return json({ ok: true, ignored: true });
  if (order.amount_cents !== 2990 || order.currency !== 'BRL' ||
    payment.currency_id !== 'BRL' || Math.round(Number(payment.transaction_amount) * 100) !== 2990 ||
    !Number.isFinite(Number(payment.transaction_amount))) return json({ error: 'Valor ou moeda divergente.' }, 409);

  // O status recebido do Webhook NÃO é confiável sozinho: usamos o status consultado na API.
  const remoteStatus = String(payment.status || '').toLowerCase();
  if (remoteStatus === 'approved') {
    const { error } = await db.rpc('life_apply_pix_payment', {
      p_order_id: orderId, p_payment_id: dataId, p_amount_cents: 2990, p_currency: 'BRL',
    });
    if (error) { console.error('Falha na ativação idempotente', error.code); return json({ error: 'Falha ao registrar a aprovação.' }, 503); }
    return json({ ok: true, status: 'approved' });
  }
  if (remoteStatus === 'refunded' || remoteStatus === 'charged_back') {
    const { error } = await db.rpc('life_reverse_pix_payment', { p_order_id: orderId, p_payment_id: dataId, p_reason: remoteStatus });
    if (error) { console.error('Falha na reversão', error.code); return json({ error: 'Falha ao registrar a reversão.' }, 503); }
    return json({ ok: true, status: remoteStatus });
  }
  return json({ ok: true, status: 'pending' });
});
