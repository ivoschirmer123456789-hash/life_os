/** LIFE OS 15.8.2 — checkout server-side: recurring card or manually renewed Pix/boleto. */
import { createClient } from 'npm:@supabase/supabase-js@2.49.10';
const get=(k:string)=>Deno.env.get(k)||'';
const allowed=new Set(get('LIFE_ALLOWED_ORIGINS').split(',').map(s=>s.trim()).filter(Boolean));
const cors=(origin:string|null)=>({...((origin&&allowed.has(origin))?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{}),'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','Content-Type':'application/json'});
const out=(v:unknown,s=200,o:string|null=null)=>Response.json(v,{status:s,headers:cors(o)});
const knownMethods=['card','pix','boleto'];
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
  if(action==='methods'){
   const methods=await mp('/v1/payment_methods');const active=(m:any)=>m&&m.status==='active';
   return out({card:(Array.isArray(methods)?methods:[]).some((m:any)=>m.payment_type_id==='credit_card'&&active(m)),pix:(Array.isArray(methods)?methods:[]).some((m:any)=>m.id==='pix'&&active(m)),boleto:(Array.isArray(methods)?methods:[]).some((m:any)=>m.payment_type_id==='ticket'&&active(m))},200,origin);
  }
  if(action==='status'){
   const {data}=await admin.from('life_mp_checkouts').select('method,status,created_at,provider_id').eq('user_id',user.id).order('created_at',{ascending:false}).limit(4);
   return out({payments:(data||[]).map((x:any)=>({method:x.method,status:x.status,created_at:x.created_at}))},200,origin);
  }
  if(action==='cancel'){
   const {data:latest,error}=await admin.from('life_mp_checkouts').select('id,provider_id,status').eq('user_id',user.id).eq('method','card').in('status',['pending','created','active','paid']).order('created_at',{ascending:false}).limit(1).maybeSingle();
   if(error)return out({error:'Não foi possível consultar a assinatura.'},503,origin);
   if(!latest)return out({error:'Nenhuma tentativa de assinatura automática nesta integração. Consulte o Mercado Pago para assinaturas anteriores.'},404,origin);
   // Pending without a provider id never reached a confirmed Mercado Pago checkout.
   // If a provider id exists, cancel it at Mercado Pago BEFORE recording local cancellation.
   if(latest.provider_id){
    const cancelled=await mp('/preapproval/'+encodeURIComponent(latest.provider_id),'PUT',{status:'cancelled'});
    if(!['cancelled','canceled'].includes(String(cancelled?.status||'')))throw Error('provider_cancel_unconfirmed');
   }else if(latest.status!=='pending')return out({error:'Assinatura inconsistente. Confirme o status no Mercado Pago.'},409,origin);
   const {error:updated}=await admin.from('life_mp_checkouts').update({status:'cancelled',updated_at:new Date().toISOString()}).eq('id',latest.id).eq('user_id',user.id);
   if(updated)throw Error('database_cancel_failed');
   return out({ok:true,message:'Tentativa ou renovação cancelada. O acesso já pago permanece até o vencimento.'},200,origin);
  }
  if(action!=='create'||!knownMethods.includes(String(input.method||'card')))return out({error:'Forma de pagamento inválida.'},400,origin);
  // Block double charging: an already active PRO account must not start a second payment.
  const until=profile.pro_until?Date.parse(String(profile.pro_until)):Infinity;
  if(String(profile.plan).toUpperCase()==='PRO' && (Number.isFinite(until)?until>Date.now():true) &&
     !['expired','revoked','refunded','chargeback','suspended','paused'].includes(String(profile.subscription_status||'').toLowerCase())){
    return out({error:'Seu PRO já está ativo. Consulte os pagamentos no Perfil; renove quando o período terminar.'},409,origin);
  }
  const method=String(input.method||'card');
  const {data:existing}=await admin.from('life_mp_checkouts').select('id,provider_id,status').eq('user_id',user.id).eq('method','card').in('status',['pending','created','active','paid']).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(method==='card'&&existing)return out({error:'Existe uma tentativa anterior de assinatura por cartão. No Perfil, cancele a tentativa anterior antes de criar outra.'},409,origin);
  const {data:checkout,error:insertError}=await admin.from('life_mp_checkouts').insert({user_id:user.id,method,status:'pending'}).select('id').single();
  if(insertError?.code==='23505')return out({error:'Uma tentativa de assinatura já está em andamento. Abra Perfil para consultar ou cancelar antes de tentar novamente.'},409,origin);
  if(insertError||!checkout)return out({error:'Não foi possível registrar o pedido.'},503,origin);
  const ref=checkout.id;
  const back=site.origin+site.pathname+'?life_pro_return=1';
  let response:any;
  try{
  if(method==='card'){
   response=await mp('/preapproval','POST',{reason:'LIFE OS PRO — assinatura mensal',payer_email:user.email,external_reference:ref,back_url:back,auto_recurring:{frequency:1,frequency_type:'months',transaction_amount:money,currency_id:'BRL'},status:'pending'});
  }else{
   const types=method==='pix'?['credit_card','debit_card','ticket','atm','prepaid_card']:['credit_card','debit_card','bank_transfer','atm','prepaid_card'];
   response=await mp('/checkout/preferences','POST',{items:[{id:'LIFE-PRO-30',title:'LIFE OS PRO — 30 dias (renovação manual)',quantity:1,currency_id:'BRL',unit_price:money}],payer:{email:user.email},external_reference:ref,notification_url:get('SUPABASE_URL').replace(/\/$/,'')+'/functions/v1/mercadopago-webhook',back_urls:{success:back,pending:back,failure:back},auto_return:'approved',expires:true,expiration_date_from:new Date().toISOString(),expiration_date_to:new Date(Date.now()+24*60*60*1000).toISOString(),payment_methods:{excluded_payment_types:types.map(id=>({id})),installments:1}});
  }
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
  return out({checkout_url:paymentUrl,method,recurring:method==='card',price:money},200,origin);
 }catch(e){console.error('LIFE billing create failed',String(e).slice(0,100));return out({error:'Não foi possível iniciar o pagamento. Verifique as credenciais e métodos habilitados no Mercado Pago.'},502,origin)}
});
