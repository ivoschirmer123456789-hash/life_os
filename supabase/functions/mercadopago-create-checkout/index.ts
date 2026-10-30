/** LIFE OS 15.8.5 — checkout avulso 30 dias: the customer selects the method at Mercado Pago. */
import { createClient } from 'npm:@supabase/supabase-js@2.49.10';
const get=(k:string)=>Deno.env.get(k)||({'MERCADOPAGO_ACCESS_TOKEN':Deno.env.get('MP_ACCESS_TOKEN'),'MERCADOPAGO_WEBHOOK_SECRET':Deno.env.get('MP_WEBHOOK_SECRET'),'LIFE_SITE_URL':Deno.env.get('LIFE_PUBLIC_ORIGIN')||Deno.env.get('LIFE_CHECKOUT_RETURN_URL')}[k]||'');
const allowed=new Set([...get('LIFE_ALLOWED_ORIGINS').split(','),get('LIFE_PUBLIC_ORIGIN'),get('LIFE_SITE_URL')].map(s=>s.trim()).filter(Boolean).map(s=>{try{return new URL(s).origin}catch{return s}}));
const cors=(origin:string|null)=>({...((origin&&allowed.has(origin))?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{}),'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','Content-Type':'application/json'});
const out=(v:unknown,s=200,o:string|null=null)=>Response.json(v,{status:s,headers:cors(o)});
const knownMethods=['checkout'];
const money=29.90;
const urlOK=(u:string)=>{try{const x=new URL(u);return x.protocol==='https:'&&(x.hostname==='mercadopago.com.br'||x.hostname.endsWith('.mercadopago.com.br')||x.hostname==='mercadopago.com'||x.hostname.endsWith('.mercadopago.com'));}catch{return false}};
async function mp(path:string,method='GET',payload?:unknown){
 const r=await fetch('https://api.mercadopago.com'+path,{method,headers:{'Authorization':'Bearer '+get('MERCADOPAGO_ACCESS_TOKEN'),'Content-Type':'application/json','Accept':'application/json',...(method==='POST'?{'X-Idempotency-Key':crypto.randomUUID()}:{})},...(payload?{body:JSON.stringify(payload)}:{})});
 const data=await r.json().catch(()=>({})); if(!r.ok)throw new Error('mp_'+r.status);return data;
}
Deno.serve(async(req)=>{
 const origin=req.headers.get('origin');
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
 if(req.method!=='POST')return out({error:'Método não permitido.'},405,origin);
 if(origin&&!allowed.has(origin))return out({error:'Origem não autorizada.'},403,origin);
 if(get('LIFE_BILLING_ENABLED')!=='1'||!get('MERCADOPAGO_WEBHOOK_SECRET')||!get('MERCADOPAGO_ACCESS_TOKEN')||!get('LIFE_SITE_URL')||!get('SUPABASE_URL')||!get('SUPABASE_ANON_KEY')||!get('SUPABASE_SERVICE_ROLE_KEY'))return out({error:'Pagamento ainda não configurado no servidor.'},503,origin);
 let site:URL;try{site=new URL(get('LIFE_SITE_URL'));if(site.protocol!=='https:')throw Error('bad');}catch{return out({error:'URL segura do LIFE não configurada.'},503,origin)}
 const jwt=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();if(!jwt)return out({error:'Entre na sua conta para assinar.'},401,origin);
 const userDb=createClient(get('SUPABASE_URL'),get('SUPABASE_ANON_KEY'),{global:{headers:{Authorization:'Bearer '+jwt}},auth:{persistSession:false}});
 const {data:{user},error:authError}=await userDb.auth.getUser(jwt);
 if(authError||!user||!user.email)return out({error:'Sessão inválida ou e-mail ausente.'},401,origin);
 const admin=createClient(get('SUPABASE_URL'),get('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false}});
 const {data:profile,error:profileError}=await admin.from('profiles').select('plan,pro_until,subscription_status').eq('id',user.id).maybeSingle();
 if(profileError||!profile)return out({error:'Perfil indisponível.'},503,origin);
 if(String(profile.plan).toUpperCase()==='OWNER')return out({error:'A conta OWNER já possui acesso e não pode gerar cobrança.'},403,origin);
 let input:Record<string,unknown>={};try{const text=await req.text();if(text.length>4096)return out({error:'Dados muito longos.'},413,origin);input=JSON.parse(text||'{}');if(!input||typeof input!=='object'||Array.isArray(input))throw Error();}catch{return out({error:'Dados inválidos.'},400,origin)}
 const action=String(input.action||'create');
 try{
  if(action==='methods')return out({checkout:true,hosted:true,renewal:'manual',methodsAtProvider:true},200,origin);
  if(action==='status'){
   const {data}=await admin.from('life_mp_checkouts').select('method,status,created_at,provider_id').eq('user_id',user.id).order('created_at',{ascending:false}).limit(4);
   return out({payments:(data||[]).map((x:any)=>({method:x.method,status:x.status,created_at:x.created_at}))},200,origin);
  }
  if(action==='reconcile'){
   // Conta autenticada. Somente pedidos do próprio usuário, nunca IDs enviados pelo navegador.
   const cutoff=new Date(Date.now()-45*24*3600*1000).toISOString();
   const newOrders=await admin.from('life_mp_checkouts')
     .select('id,method,status').eq('user_id',user.id).eq('method','checkout')
     .in('status',['pending','created','paid']).gte('created_at',cutoff)
     .order('created_at',{ascending:false}).limit(4);
   if(newOrders.error)return out({error:'Não foi possível consultar os pedidos.'},503,origin);
   let checked=0,applied=0;
   for(const item of (newOrders.data||[])){
    const search=await mp('/v1/payments/search?external_reference='+encodeURIComponent(item.id)+'&limit=10');
    for(const candidate of (Array.isArray(search?.results)?search.results:[])){
     if(!/^\d{1,25}$/.test(String(candidate.id||'')))continue;
     const payment=await mp('/v1/payments/'+encodeURIComponent(String(candidate.id)));
     checked++;
     if(String(payment.external_reference)!==item.id || String(payment.status)!=='approved' ||
        payment.currency_id!=='BRL' || Math.abs(Number(payment.transaction_amount)-money)>0.001 ||
        !Number.isFinite(Number(payment.transaction_amount)))continue;
     const approvedDate=new Date(String(payment.date_approved||payment.date_created||''));
     if(!Number.isFinite(approvedDate.getTime()) || approvedDate.getTime()>Date.now()+300000)continue;
     // Na reconciliação, pagamentos de até 45 dias; o período é contado desde a aprovação.
     const args={p_checkout_id:item.id,p_payment_id:String(payment.id),
       p_amount:money,p_currency:'BRL',p_paid_at:approvedDate.toISOString()};
     const rpc=await admin.rpc('life_apply_checkout_payment_v1585',args);
     if(rpc.error){console.error('billing_reconciliation_rpc_failed',rpc.error.code);throw Error('db_reconcile_failed');}
     if(rpc.data===true || rpc.data==='applied') applied++;
    }
   }
   return out({ok:true,checked,applied},200,origin);
  }
  if(action==='cancel')return out({error:'Este checkout não tem renovação automática. Para assinaturas anteriores, consulte o Mercado Pago.'},409,origin);
  if(action!=='create'||!knownMethods.includes(String(input.method||'checkout')))return out({error:'Checkout inválido. Atualize o LIFE OS.'},400,origin);
  // Block double charging: an already active PRO account must not start a second payment.
  const until=profile.pro_until?Date.parse(String(profile.pro_until)):Infinity;
  if(String(profile.plan).toUpperCase()==='PRO' && (Number.isFinite(until)?until>Date.now():true) &&
     !['expired','revoked','refunded','chargeback','suspended','paused'].includes(String(profile.subscription_status||'').toLowerCase())){
    return out({error:'Seu PRO já está ativo. Consulte os pagamentos no Perfil; renove quando o período terminar.'},409,origin);
  }
  const method='checkout'; // O comprador escolhe Pix, cartão ou boleto no Mercado Pago.
  const {data:checkout,error:insertError}=await admin.from('life_mp_checkouts').insert({user_id:user.id,method,status:'pending'}).select('id').single();
  if(insertError?.code==='23505')return out({error:'Uma tentativa de assinatura já está em andamento. Abra Perfil para consultar ou cancelar antes de tentar novamente.'},409,origin);
  if(insertError||!checkout)return out({error:'Não foi possível registrar o pedido.'},503,origin);
  const ref=checkout.id;
  const back=site.origin+site.pathname+'?life_pro_return=1';
  let response:any;
  try{
  // Hosted Checkout Pro: no method is preselected or excluded here.
  // One-time access for 30 days, clearly disclosed before purchase.
  response=await mp('/checkout/preferences','POST',{
   items:[{id:'LIFE-PRO-30',title:'LIFE OS PRO — acesso por 30 dias (renovação manual)',quantity:1,currency_id:'BRL',unit_price:money}],
   payer:{email:user.email},external_reference:ref,
   notification_url:get('SUPABASE_URL').replace(/\/$/,'')+'/functions/v1/mercadopago-checkout-webhook',
   back_urls:{success:back,pending:back,failure:back},auto_return:'approved',
   payment_methods:{installments:1}
  });
  }catch(providerError){
   // Never leave a dead, provider-less checkout blocking new card attempts.
   await admin.from('life_mp_checkouts').update({status:'failed',updated_at:new Date().toISOString()}).eq('id',ref).eq('status','pending');
   throw providerError;
  }
  const paymentUrl=String(response?.init_point||'');
  if(!urlOK(paymentUrl)||!response?.id){
   await admin.from('life_mp_checkouts').update({status:'failed',updated_at:new Date().toISOString()}).eq('id',ref).eq('status','pending');
   throw Error('mp_invalid_checkout');
  }
  const {data:linked,error:updateError}=await admin.from('life_mp_checkouts').update({status:'created',provider_id:String(response.id)}).eq('id',ref).eq('user_id',user.id).eq('status','pending').select('id').maybeSingle();
  if(updateError||!linked){
   // A concurrent cancellation may have won. Revoke the newly created card checkout.
   if(method==='card')try{await mp('/preapproval/'+encodeURIComponent(String(response.id)),'PUT',{status:'cancelled'})}catch(e){console.error('manual billing reconciliation required',ref)}
   console.error('LIFE checkout link persistence failed',ref);
   throw Error('database_update_failed');
  }
  return out({checkout_url:paymentUrl,method:'checkout',recurring:false,renewal:'manual',duration_days:30,price:money},200,origin);
 }catch(e){console.error('LIFE billing create failed',String(e).slice(0,100));return out({error:'Não foi possível iniciar o pagamento. Verifique as credenciais e métodos habilitados no Mercado Pago.'},502,origin)}
});
