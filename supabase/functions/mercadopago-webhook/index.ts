/** LIFE OS 15.8.2 — signed Mercado Pago payment / recurring invoice webhook. */
import { createClient } from 'npm:@supabase/supabase-js@2.49.10';
const get=(key:string)=>Deno.env.get(key)||'';
const respond=(v:unknown,s=200)=>Response.json(v,{status:s,headers:{'Cache-Control':'no-store'}});
const money=29.90;
const utf=new TextEncoder();
const safeEquals=(a:string,b:string)=>{if(!/^[0-9a-f]{64}$/i.test(a)||!/^[0-9a-f]{64}$/i.test(b))return false;let z=0;for(let i=0;i<64;i++)z|=a.charCodeAt(i)^b.charCodeAt(i);return z===0;};
async function signed(req:Request,id:string){
 const signature=req.headers.get('x-signature')||'';
 const requestId=req.headers.get('x-request-id')||'';
 const fields=Object.fromEntries(signature.split(',').map(s=>s.trim().split('=',2)));
 if(!id||!requestId||!fields.ts||!fields.v1||!/^\d{10,16}$/.test(fields.ts))return false;
 const ts=Number(fields.ts);const ms=ts<1e11?ts*1000:ts;
 if(!Number.isFinite(ms)||Math.abs(Date.now()-ms)>24*60*60*1000)return false;
 const key=await crypto.subtle.importKey('raw',utf.encode(get('MERCADOPAGO_WEBHOOK_SECRET')),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const digest=new Uint8Array(await crypto.subtle.sign('HMAC',key,utf.encode(`id:${id.toLowerCase()};request-id:${requestId};ts:${fields.ts};`)));
 const hex=Array.from(digest).map(b=>b.toString(16).padStart(2,'0')).join('');
 return safeEquals(hex,fields.v1.toLowerCase());
}
async function mp(path:string){const r=await fetch('https://api.mercadopago.com'+path,{headers:{Authorization:'Bearer '+get('MERCADOPAGO_ACCESS_TOKEN'),Accept:'application/json'}});if(!r.ok)throw Error('MP lookup failed '+r.status);return r.json()}
Deno.serve(async(req)=>{
 if(req.method!=='POST')return respond({error:'method'},405);
 if(!get('MERCADOPAGO_WEBHOOK_SECRET')||!get('MERCADOPAGO_ACCESS_TOKEN')||!get('SUPABASE_URL')||!get('SUPABASE_SERVICE_ROLE_KEY'))return respond({error:'webhook_not_configured'},503);
 const url=new URL(req.url);
 let body:any={};try{const raw=await req.text();if(raw.length>16000)return respond({error:'large'},413);body=JSON.parse(raw||'{}')}catch{return respond({error:'json'},400)}
 const id=String(url.searchParams.get('data.id')||body?.data?.id||'').trim();
 const topic=String(url.searchParams.get('type')||url.searchParams.get('topic')||body?.type||'').toLowerCase();
 if(!/^[\w-]{1,120}$/.test(id))return respond({error:'invalid_id'},400);
 if(!(await signed(req,id)))return respond({error:'invalid_signature'},401);
 if(!['payment','subscription_authorized_payment','subscription_preapproval'].includes(topic))return respond({ok:true,ignored:true});
 try{
  const admin=createClient(get('SUPABASE_URL'),get('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false}});
  if(topic==='subscription_preapproval'){
   const pre=await mp('/preapproval/'+encodeURIComponent(id));
   const {data:checkout}=await admin.from('life_mp_checkouts').select('id,method,provider_id').eq('id',String(pre.external_reference||'')).eq('provider_id',String(pre.id)).eq('method','card').maybeSingle();
   if(checkout&&['cancelled','paused'].includes(String(pre.status)))await admin.from('life_mp_checkouts').update({status:String(pre.status)}).eq('id',checkout.id);
   // Never grant or revoke paid access from subscription status alone.
   return respond({ok:true});
  }
  let payment:any,checkoutId='',actualMethod='',subscriptionId='';
  if(topic==='payment'){
   payment=await mp('/v1/payments/'+encodeURIComponent(id));
   checkoutId=String(payment.external_reference||'');
   // Recurring card payments may arrive as ordinary `payment` events.
   // Verify the invoice association with Mercado Pago; never trust the payment id alone.
   const {data:linked}=await admin.from('life_mp_checkouts').select('id,method,provider_id').eq('id',checkoutId).maybeSingle();
   if(linked?.method==='card'||!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(checkoutId)){
    const invoices=await mp('/authorized_payments/search?payment_id='+encodeURIComponent(id));
    const match=(Array.isArray(invoices?.results)?invoices.results:[]).find((v:any)=>
      String(v?.payment?.id||'')===String(payment?.id)&&String(v?.payment?.status||'')==='approved'&&v?.preapproval_id);
    if(!match)return respond({ok:true,unmatched:true});
    subscriptionId=String(match.preapproval_id);
    const {data:card}=await admin.from('life_mp_checkouts').select('id,method,provider_id').eq('provider_id',subscriptionId).eq('method','card').maybeSingle();
    if(!card)return respond({ok:true,unmatched:true});
    checkoutId=card.id; actualMethod='card';
   }
  }else{
   const authorized=await mp('/authorized_payments/'+encodeURIComponent(id));
   if(authorized?.payment?.status!=='approved'||!authorized?.payment?.id)return respond({ok:true,pending:true});
   subscriptionId=String(authorized.preapproval_id||'');
   const {data:checkout}=await admin.from('life_mp_checkouts').select('id,method,provider_id').eq('provider_id',subscriptionId).eq('method','card').maybeSingle();
   if(!checkout)return respond({ok:true,unmatched:true});
   checkoutId=checkout.id;
   payment=await mp('/v1/payments/'+encodeURIComponent(String(authorized.payment.id)));
   actualMethod='card';
  }
  if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(checkoutId))return respond({ok:true,unmatched:true});
  const {data:checkout,error:checkoutError}=await admin.from('life_mp_checkouts').select('id,user_id,method,status,provider_id').eq('id',checkoutId).maybeSingle();
  if(checkoutError)throw checkoutError;
  if(!checkout)return respond({ok:true,unmatched:true});
  if(topic!=='payment'&&checkout.method!=='card')return respond({ok:true,ignored:true});
  if(topic==='payment'&&checkout.method==='card'&&actualMethod!=='card')return respond({ok:true,ignored:true});
  if(actualMethod==='card'&&String(checkout.provider_id||'')!==subscriptionId)return respond({error:'subscription_mismatch'},409);
  if(actualMethod&&actualMethod!==checkout.method)return respond({ok:true,ignored:true});
  const approved=payment?.status==='approved';
  if(!approved)return respond({ok:true,pending:true});
  if(String(payment.currency_id)!=='BRL'||Math.abs(Number(payment.transaction_amount)-money)>0.001)return respond({error:'payment_mismatch'},409);
  if(checkout.method!=='card'&&String(payment.external_reference)!==checkout.id)return respond({error:'reference_mismatch'},409);
  // Checkout Pro can still show Mercado Pago wallet; it cannot be excluded from classic preferences.
  // An approved payment with matching amount/currency/external reference is sufficient.
  if(checkout.method==='card'&&!['credit_card','debit_card','prepaid_card','account_money'].includes(String(payment.payment_type_id)))return respond({error:'method_mismatch'},409);
  // Admin RPC applies entitlement and inserts unique transaction in one database transaction.
  const {data:applied,error}=await admin.rpc('life_apply_mp_payment',{p_checkout_id:checkout.id,p_payment_id:String(payment.id),p_amount:money,p_currency:'BRL'});
  if(error)throw error;
  return respond({ok:true,applied:Boolean(applied)});
 }catch(e){console.error('billing_webhook_failure',String(e).slice(0,120));return respond({error:'retry_later'},503)}
});
