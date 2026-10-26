/** LIFE OS · Pix mensal (pagamento único) · autenticação obrigatória.
 * Publicação: supabase functions deploy mercadopago-create-pix
 * Segredos: MP_ACCESS_TOKEN, LIFE_CHECKOUT_RETURN_URL; padrões SUPABASE_* do Supabase.
 * Nunca receba preço, plano, ID de usuário ou URL de retorno do navegador.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const amountBRL = 29.90; // Deve corresponder ao preço mostrado no LIFE OS.
const json = (data: unknown, status = 200, origin = '') => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  },
});

Deno.serve(async (req) => {
  const configuredOrigin = Deno.env.get('LIFE_PUBLIC_ORIGIN') || '';
  const origin = req.headers.get('origin') || '';
  if (!configuredOrigin || !/^https:\/\/[^/]+$/.test(configuredOrigin)) return json({ error: 'Origem pública não configurada.' }, 503);
  if (origin && origin !== configuredOrigin) return json({ error: 'Origem não autorizada.' }, 403);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': configuredOrigin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin',
  }});
  if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405, configuredOrigin);

  const token = Deno.env.get('MP_ACCESS_TOKEN');
  const sbUrl = Deno.env.get('SUPABASE_URL');
  const pubKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const returnUrl = Deno.env.get('LIFE_CHECKOUT_RETURN_URL');
  if (!token || !sbUrl || !pubKey || !serviceKey || !returnUrl) return json({ error: 'Pix ainda não configurado no servidor.' }, 503, configuredOrigin);
  try {
    const u = new URL(returnUrl);
    if (u.protocol !== 'https:' || u.origin !== configuredOrigin || u.username || u.password) throw new Error('invalid');
  } catch { return json({ error: 'Endereço de retorno inválido.' }, 503, configuredOrigin); }

  const accessToken = /^Bearer (\S+)$/i.exec(req.headers.get('authorization') || '')?.[1];
  if (!accessToken) return json({ error: 'Entre na sua conta antes de pagar.' }, 401, configuredOrigin);
  const auth = createClient(sbUrl, pubKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authErr } = await auth.auth.getUser(accessToken);
  if (authErr || !user?.id || !user.email) return json({ error: 'Sessão inválida.' }, 401, configuredOrigin);

  const admin = createClient(sbUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: profile, error: profileErr } = await admin.from('profiles').select('plan,pro_until,subscription_status').eq('id', user.id).single();
  if (profileErr || !profile) return json({ error: 'Não foi possível consultar seu plano.' }, 503, configuredOrigin);
  const currentPlan = String(profile.plan || 'FREE').toUpperCase();
  const status = String(profile.subscription_status || '').toLowerCase();
  const expiration = profile.pro_until ? Date.parse(profile.pro_until) : Number.POSITIVE_INFINITY;
  const blocked = ['expired','refunded','revoked','cancelled','canceled','chargeback','suspended','paused','disputed'];
  if (currentPlan === 'OWNER' || (currentPlan === 'PRO' && expiration > Date.now() && !blocked.includes(status))) {
    return json({ error: 'O plano completo já está ativo nesta conta.' }, 409, configuredOrigin);
  }

  // Limita criação repetida; sem enviar informações de pedidos anteriores ao cliente.
  const cutoff = new Date(Date.now() - 60000).toISOString();
  const { data: recent, error: recentErr } = await admin.from('life_pix_orders')
    .select('id').eq('user_id', user.id).gte('created_at', cutoff).limit(1);
  if (recentErr) return json({ error: 'Estrutura Pix não preparada no banco.' }, 503, configuredOrigin);
  if (recent?.length) return json({ error: 'Uma cobrança acabou de ser criada. Aguarde um minuto para gerar outra.' }, 429, configuredOrigin);

  const { data: order, error: insertErr } = await admin.from('life_pix_orders')
    .insert({ user_id: user.id, amount_cents: 2990, currency: 'BRL', status: 'pending' })
    .select('id').single();
  if (insertErr || !order?.id) return json({ error: 'Não foi possível preparar o pagamento.' }, 503, configuredOrigin);

  const notifyUrl = new URL(sbUrl.replace(/\/$/, '') + '/functions/v1/mercadopago-pix-webhook');
  if (notifyUrl.protocol !== 'https:') return json({ error: 'Webhook Pix inválido.' }, 503, configuredOrigin);

  const preference = {
    items: [{ id: 'life-os-pro-pix-30d', title: 'LIFE OS PRO — 30 dias (pagamento único)', quantity: 1, currency_id: 'BRL', unit_price: amountBRL }],
    external_reference: order.id,
    payer: { email: user.email },
    back_urls: {
      success: `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}life_pro_return=1`,
      pending: `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}life_pro_return=1`,
      failure: `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}life_pro_return=1`,
    },
    // Webhook exclusivo desta preferência: preserva outros webhooks (cartão) da aplicação.
    notification_url: notifyUrl.toString(),
    // Checkout hospedado: Pix e demais métodos dependem da disponibilidade da conta.
    auto_return: 'approved',
    statement_descriptor: 'LIFE OS',
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  try {
    const mp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': order.id },
      body: JSON.stringify(preference),
    });
    const created = await mp.json().catch(() => ({}));
    if (!mp.ok || !created.id || !created.init_point) {
      console.error('Falha ao criar preferência de pagamento', mp.status);
      return json({ error: 'Mercado Pago não conseguiu criar o checkout.' }, 502, configuredOrigin);
    }
    const checkout = new URL(String(created.init_point));
    if (checkout.protocol !== 'https:' || !['mercadopago.com.br','mercadopago.com'].some(h => checkout.hostname === h || checkout.hostname.endsWith('.' + h))) {
      return json({ error: 'Endereço de checkout inesperado.' }, 502, configuredOrigin);
    }
    const { error: savedErr } = await admin.from('life_pix_orders').update({ preference_id: String(created.id) }).eq('id', order.id).eq('status', 'pending');
    if (savedErr) return json({ error: 'Não foi possível registrar o checkout.' }, 503, configuredOrigin);
    return json({ checkout_url: checkout.toString(), checkout_method: 'pix_one_time' }, 200, configuredOrigin);
  } catch (e) {
    console.error('Falha de rede no Mercado Pago', e instanceof Error ? e.name : 'unknown');
    return json({ error: 'Serviço de pagamento indisponível.' }, 502, configuredOrigin);
  }
});
