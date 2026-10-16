/* LIFE OS 12.5 — pure production safeguards. No remote requests and no plan changes. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LifeRelease125=api;})(typeof globalThis!=='undefined'?globalThis:undefined,function(){
 'use strict';
 const SNAPSHOT_KEY='life_local_recovery_v125';
 function releasePlan(row={},now=Date.now()){
   const role=String(row?.plan||'FREE').toUpperCase(),status=String(row?.subscription_status||'').toLowerCase();
   if(role==='OWNER')return 'OWNER';
   if(role!=='PRO')return 'FREE';
   const end=row?.pro_until?Date.parse(row.pro_until):Infinity;
   if(!Number.isFinite(end)&&end!==Infinity)return 'FREE';
   if(end<=now)return 'FREE';
   if(['expired','refunded','revoked','cancelled','canceled','chargeback','suspended','paused','disputed'].includes(status))return 'FREE';
   return 'PRO';
 }
 function redactError(raw){
   return String(raw?.message||raw||'Erro não identificado')
    .replace(/https?:\/\/[^\s<>"']+/gi,'[endereço omitido]')
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'[email omitido]')
    .replace(/(?:bearer\s+)[a-z0-9._~-]+/gi,'Bearer [token omitido]')
    .replace(/\b(?:eyJ[a-z0-9_-]{10,}\.){2}[a-z0-9_=-]{10,}\b/gi,'[token omitido]')
    .replace(/(token|password|secret|apikey|api_key)\s*[=:]\s*[^\s,;]+/gi,'$1=[omitido]')
    .replace(/[\u0000-\u001f]/g,' ').slice(0,160);
 }
 function snapshotStore(storage,uid,bundle,source='restauração',now=Date.now()){
   if(!storage||typeof storage.setItem!=='function'||!uid||!bundle||!bundle.data)return {ok:false,error:'Não foi possível identificar esta conta.'};
   if(typeof bundle.version!=='number'||!bundle.updatedAt||typeof bundle.data!=='object'||Array.isArray(bundle.data))return {ok:false,error:'Dados locais incompatíveis.'};
   const safe={uid:String(uid),at:new Date(now).toISOString(),source:String(source).slice(0,45),bundle};
   let raw;
   try{raw=JSON.stringify(safe);}catch(_){return {ok:false,error:'Não foi possível preparar a cópia local.'};}
   if(raw.length>4000000)return {ok:false,error:'A cópia é muito grande. Exporte seus dados antes de continuar.'};
   try{storage.setItem(SNAPSHOT_KEY,raw);if(storage.getItem(SNAPSHOT_KEY)!==raw)throw new Error('snapshot-not-persisted');return {ok:true,bytes:raw.length};}
   catch(_){return {ok:false,error:'Sem espaço para preservar a versão anterior. Exporte seus dados antes de continuar.'};}
 }
 function snapshotRead(storage,uid,validator){
   try{
     const snap=JSON.parse(storage.getItem(SNAPSHOT_KEY)||'null');
     if(!snap||snap.uid!==String(uid)||!snap.bundle||typeof snap.at!=='string')return null;
     if(Date.parse(snap.at)>Date.now()+300000||!Number.isFinite(Date.parse(snap.at)))return null;
     if(typeof validator==='function'&&!validator(snap.bundle)?.ok)return null;
     return {at:snap.at,source:snap.source,bundle:snap.bundle};
   }catch(_){return null;}
 }
 function snapshotClear(storage){try{storage.removeItem(SNAPSHOT_KEY);return true;}catch(_){return false;}}
 function healthInfo({online=true,profilePlan='FREE',cloudStatus='local',aiConnected=false,errors=0,swControlled=false}={}){
   const available=Number.isFinite(Number(errors))?Math.min(99,Math.max(0,Math.floor(Number(errors)))):0;
   return {
     internet:online?'Conectado':'Sem conexão',
     account:['FREE','PRO','OWNER'].includes(profilePlan)?profilePlan:'FREE',
     sync:['synced','syncing','conflict','local','checking'].includes(cloudStatus)?cloudStatus:'local',
     ai:aiConnected?'Conexão reconhecida':'Integração não confirmada',
     technicalErrors:available,
     pwa:swControlled?'Controlada pelo Service Worker':'Sem controle offline confirmado'
   };
 }
 function releaseAudit(input){
   const safe=healthInfo(input);
   return {product:'LIFE OS',build:'12.5',generatedAt:new Date().toISOString(),summary:safe,note:'Diagnóstico local. Não contém dados pessoais, conteúdo, tokens ou informações de cobrança.'};
 }
 return Object.freeze({SNAPSHOT_KEY,releasePlan,redactError,snapshotStore,snapshotRead,snapshotClear,healthInfo,releaseAudit});
});
