/** LIFE OS 13.0 — authenticated user request. No account deletion happens here. */
import { withSupabase } from 'npm:@supabase/server@^1';
const origins = new Set((Deno.env.get('LIFE_ALLOWED_ORIGINS')||'').split(',').map(x=>x.trim()).filter(Boolean));
const cors = (origin:string|null):Record<string,string> => ({ ...(origin?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{}), 'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8'});
const respond = (body:unknown,status:number,origin:string|null)=>Response.json(body,{status,headers:cors(origin)});
const run=withSupabase({auth:'user'},async(req,ctx)=>{
  const origin=req.headers.get('origin'); const validated=origin&&origins.has(origin)?origin:null;
  const uid=String(ctx.userClaims?.sub||''); if(!uid)return respond({ok:false,error:'Faça login.'},401,validated);
  let body:Record<string,unknown>={};
  try {const raw=await req.text(); if(raw.length>3000)return respond({ok:false,error:'Solicitação muito grande.'},413,validated);const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('Invalid JSON');body=parsed;}
  catch{return respond({ok:false,error:'Dados inválidos.'},400,validated);}
  const kind='feedback';
  let category='Geral',message='';
  if(kind==='feedback'){
    category=String(body.category||'Sugestão');if(!['Erro','Sugestão','Dúvida'].includes(category))return respond({ok:false,error:'Categoria inválida.'},400,validated);
    if(typeof body.message!=='string'||body.message.length>1200)return respond({ok:false,error:'Texto inválido.'},400,validated);
    message=body.message.trim();if(message.length<10)return respond({ok:false,error:'Escreva pelo menos 10 caracteres.'},400,validated);
  } else {
    if(body.confirm!=='EXCLUIR MINHA CONTA')return respond({ok:false,error:'Confirmação obrigatória.'},400,validated);
    category='Privacidade';message='Solicitação autenticada de exclusão da conta e dos dados associados; requer processamento administrativo.';
  }
  const {data,error}=await ctx.supabase.from('life_user_requests').insert({user_id:uid,kind,category,message}).select('id,status,created_at').single();
  if(error){if(error.code==='23505')return respond({ok:true,alreadyPending:true,status:'pending'},200,validated);return respond({ok:false,error:'Não foi possível registrar a solicitação. Tente novamente.'},503,validated);}
  return respond({ok:true,id:data?.id,status:data?.status||'pending'},200,validated);
});
export default {async fetch(req:Request,ctx:unknown){
  const origin=req.headers.get('origin');const valid=origin&&origins.has(origin)?origin:null;
  if(origin&&!valid)return respond({ok:false,error:'Origem não autorizada.'},403,null);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(valid)});
  if(req.method!=='POST')return respond({ok:false,error:'Use POST.'},405,valid);
  const res=await run(req,ctx);const h=new Headers(res.headers);Object.entries(cors(valid)).forEach(([k,v])=>h.set(k,v));return new Response(res.body,{status:res.status,headers:h});
}};
