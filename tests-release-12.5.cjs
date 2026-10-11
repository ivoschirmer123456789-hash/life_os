'use strict';
// Static and isolated tests. Does not connect to Supabase/Mercado Pago.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=__dirname;
const api=require('./assets/js/life-release-12.5.js');
const app=fs.readFileSync(path.join(root,'assets/js/life-app-9.4.2.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const headers=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
const quality=require('./assets/js/life-quality-12.4.js');
let n=0;
function test(name,fn){fn();n++;console.log('  ✓ '+name);}
function memStorage(initial={}){const store=new Map(Object.entries(initial));return {getItem:k=>store.has(k)?store.get(k):null,setItem(k,v){store.set(k,String(v));},removeItem:k=>store.delete(k),values:()=>[...store]};}
const simple={version:3,updatedAt:new Date().toISOString(),data:{lifeos_v5_tasks:'[{"id":"t1"}]',life_theme:'night'}};
test('Planos FREE não mudam por retorno de checkout',()=>assert.equal(api.releasePlan({plan:'FREE',subscription_status:'approved'}),'FREE'));
test('PRO com data vencida fica FREE',()=>assert.equal(api.releasePlan({plan:'PRO',pro_until:'2020-01-01T00:00:00Z',subscription_status:'active'}),'FREE'));
test('PRO reembolsado ou suspenso fica FREE',()=>{for(const status of ['refunded','chargeback','paused','suspended','disputed','cancelled'])assert.equal(api.releasePlan({plan:'PRO',subscription_status:status}),'FREE')});
test('PRO com vencimento futuro fica PRO',()=>assert.equal(api.releasePlan({plan:'PRO',pro_until:'2099-01-01T00:00:00Z',subscription_status:'active'}),'PRO'));
test('OWNER apenas pela informação do perfil',()=>assert.equal(api.releasePlan({plan:'OWNER'}),'OWNER'));
test('Datas inválidas falham com acesso FREE',()=>assert.equal(api.releasePlan({plan:'PRO',pro_until:'not-a-date'}),'FREE'));
test('Sanitização omite e-mail, endereço e bearer',()=>{const msg=api.redactError('Falha em https://example.com/path?token=abc para test@example.com Bearer abc.secret');assert(!msg.includes('example.com'));assert(!msg.includes('test@example.com'));assert(!msg.includes('abc.secret'))});
test('Checkpoint de conta A só abre na conta A',()=>{const db=memStorage();assert(api.snapshotStore(db,'userA',simple,'importação').ok);assert(api.snapshotRead(db,'userA',quality.validateBackup));assert.equal(api.snapshotRead(db,'userB',quality.validateBackup),null)});
test('Checkpoint pode ser limpo localmente',()=>{const db=memStorage();api.snapshotStore(db,'a',simple);api.snapshotClear(db);assert.equal(api.snapshotRead(db,'a'),null)});
test('Falha de armazenamento bloqueia checkpoint',()=>{const db={getItem:()=>null,setItem(){throw Error('quota')},removeItem(){}};assert.equal(api.snapshotStore(db,'x',simple).ok,false)});
test('Backup corrompido nunca habilita restauração',()=>{const db=memStorage();api.snapshotStore(db,'x',simple);const t=JSON.parse(db.getItem(api.SNAPSHOT_KEY));t.bundle.data={'wrong_key':'private'};db.setItem(api.SNAPSHOT_KEY,JSON.stringify(t));assert.equal(api.snapshotRead(db,'x',quality.validateBackup),null)});
test('Diagnóstico não contém token ou dados do usuário',()=>{const d=api.releaseAudit({online:false,profilePlan:'OWNER',cloudStatus:'conflict',errors:5});assert.equal(d.summary.account,'OWNER');assert.equal(d.summary.sync,'conflict');assert(!JSON.stringify(d).includes('user_id'));assert(!JSON.stringify(d).includes('access_token'))});
test('Carregamento de helper antes do React e auth',()=>{const idx=html.indexOf('life-release-12.5.js');assert(idx>0&&idx<html.indexOf('life-app-9.4.2.js')&&idx<html.indexOf('supabase-auth-9.4.2.js'))});
test('Restaurações usam checkpoint antes de aplicar',()=>{assert.equal((app.match(/life125SafeApply\((remote|bundle),'[^']+'\)/g)||[]).length,4);assert(app.includes('life125Checkpoint(source);'));assert(app.includes('life125UndoRestore'))});
test('Aplicação interrompe e reverte em caso de falha',()=>{
  const start=app.indexOf('    const applyLifeData = (bundle) => {');const end=app.indexOf('    const saveLifeCloudCAS',start);
  const storage=memStorage({life_theme:'day',lifeos_v5_tasks:'[]'});let writes=0;
  const context={window:{LifeQuality124:quality},lifeRawStorageGet:k=>storage.getItem(k),lifeRawStorageSet:(k,v)=>{writes++;if(writes===2)return false;storage.setItem(k,v);return true},lifeRawStorageRemove:k=>storage.removeItem(k)};
  vm.createContext(context);vm.runInContext(app.slice(start,end)+'\nthis.testApply=applyLifeData',context,{timeout:300});
  assert.throws(()=>context.testApply(simple));
  assert.equal(storage.getItem('life_theme'),'day');
  assert.equal(storage.getItem('lifeos_v5_tasks'),'[]');
});
test('Asset JS/CSS sem immutable de 1 ano',()=>{for(const h of headers.headers.filter(x=>/^\/assets\/(css|js)/.test(x.source))){const v=h.headers.find(x=>x.key==='Cache-Control')?.value||'';assert(!v.includes('immutable'));assert(v.includes('must-revalidate'))}});
test('SW instala arquivos críticos atomicamente',()=>{assert(sw.includes('await cache.addAll(SHELL)'));assert(!sw.includes('Promise.allSettled(SHELL'));assert(sw.includes('await caches.delete(LIFE_CACHE)'))});
test('SW não salva navegações com parâmetros de pagamento',()=>{const nav=sw.split("if(req.mode==='navigate'){")[1].split('if(url.origin===')[0];assert(!nav.includes('put(req'));assert(nav.includes("cache:'no-store'"))});
test('Arquivos referenciados no SW existem',()=>{const match=sw.match(/const SHELL=\[([\s\S]*?)\];/);assert(match);const found=[...match[1].matchAll(/'\.\/([^']*)'/g)].map(x=>x[1]);assert(found.length>30);for(const rel of found){const name=rel||'index.html';assert(fs.existsSync(path.join(root,name)),'missing '+rel)}});
test('Links CSS e JavaScript locais no HTML existem',()=>{for(const [,link]of html.matchAll(/(?:src|href)="((?:assets\/)[^"]+)"/g)){const local=link.split('?')[0];assert(fs.existsSync(path.join(root,local)),'missing '+local)}});
console.log('PASS: '+n+' testes do lançamento LIFE OS 12.5 (isolados; nenhum pagamento real).');
