/* Testes de armazenamento do modo convidado. Não altera Supabase nem contas reais. */
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert');
const guestFile=path.join(__dirname,'../assets/js/guest-session-15.7.2.js');
const source=fs.readFileSync(guestFile,'utf8');
function mockStorage(){let map=new Map();return {
  get length(){return map.size;},
  getItem(k){return map.has(''+k)?map.get(''+k):null;},
  setItem(k,v){map.set(''+k,''+v);},
  removeItem(k){map.delete(''+k);},
  key(i){return [...map.keys()][i]||null},clear(){map.clear()}
};}
const trueLocal=mockStorage(),trueTab=mockStorage();
trueLocal.setItem('lifeos_v5_tasks','["DADOS REAIS"]');
trueLocal.setItem('life_theme','day');
function load(){
  const win={location:{reload(){win._reloaded=true;}},_reloaded:false};
  Object.defineProperty(win,'localStorage',{get:()=>trueLocal,configurable:true});
  Object.defineProperty(win,'sessionStorage',{get:()=>trueTab,configurable:true});
  const doc={documentElement:{dataset:{}},head:{appendChild(){}},createElement(){return {}},getElementById(){return null}};
  win.addEventListener=()=>{};
  const context=vm.createContext({window:win,document:doc,Map,Proxy,Reflect,Set,Number,String,Object,Error});
  vm.runInContext(source,context,{timeout:2000});
  return win;
}
let normal=load();
assert.strictEqual(normal.lifeGuest.active,false);
assert.strictEqual(normal.localStorage.getItem('lifeos_v5_tasks'),'["DADOS REAIS"]');
assert.strictEqual(normal.lifeGuest.enter(),true);
assert.strictEqual(normal._reloaded,true);
assert.strictEqual(trueTab.getItem('life_guest_mode_tab_v1572'),'1');
let guest=load();
assert.strictEqual(guest.lifeGuest.active,true);
assert.strictEqual(guest.document,undefined); // não dependemos de documento global em produção
assert.strictEqual(guest.localStorage.getItem('lifeos_v5_tasks'),null);
assert.strictEqual(guest.localStorage.getItem('life_theme'),null);
assert.strictEqual(guest.sessionStorage.getItem('life_guest_mode_tab_v1572'),null);
guest.localStorage.setItem('lifeos_v5_tasks','["DADOS DO CONVIDADO"]');
guest.localStorage.anotherKey='temporário';
guest.sessionStorage.setItem('ltest','segredo');
assert.strictEqual(guest.localStorage.anotherKey,'temporário');
assert.strictEqual(guest.localStorage.getItem('lifeos_v5_tasks'),'["DADOS DO CONVIDADO"]');
assert.ok(guest.localStorage.length>=2);
assert.ok(Object.keys(guest.localStorage).includes('lifeos_v5_tasks'));
assert.strictEqual(trueLocal.getItem('lifeos_v5_tasks'),'["DADOS REAIS"]');
assert.strictEqual(trueLocal.getItem('anotherKey'),null);
assert.strictEqual(trueTab.getItem('ltest'),null);
// Recarregar a página renova o armazenamento temporário vazio.
let refreshed=load();
assert.strictEqual(refreshed.lifeGuest.active,true);
assert.strictEqual(refreshed.localStorage.getItem('lifeos_v5_tasks'),null);
assert.strictEqual(refreshed.sessionStorage.getItem('ltest'),null);
refreshed.lifeGuest.exit();
assert.strictEqual(trueTab.getItem('life_guest_mode_tab_v1572'),null);
normal=load();
assert.strictEqual(normal.lifeGuest.active,false);
assert.strictEqual(normal.localStorage.getItem('lifeos_v5_tasks'),'["DADOS REAIS"]');
assert.strictEqual(normal.localStorage.getItem('life_theme'),'day');
console.log('PASSOU: entrar, isolar contas, editar, atualizar, sair e preservar dados reais.');
// Regressão: entrada do convidado sem SDK Supabase e sem conexão com backend.
const authSource=fs.readFileSync(path.join(__dirname,'../assets/js/supabase-auth-9.4.2.js'),'utf8');
function domNode(){const classes=new Set();return {style:{},textContent:'',innerHTML:'',attributes:{},classList:{add(x){classes.add(x)},remove(x){classes.delete(x)},contains(x){return classes.has(x)},toggle(x,force){const next=force===undefined?!classes.has(x):force;if(next)classes.add(x);else classes.delete(x);return next}},setAttribute(n,v){this.attributes[n]=v},contains(){return false},onclick:null};}
(async()=>{
 const nodes=Object.fromEntries(['life-auth','life-account-chip','life-owner-open','life-account-exit','life-account-exit-menu','life-exit-email','life-exit-plan','life-account-exit-confirm'].map(id=>[id,domNode()]));
 const document={documentElement:{dataset:{},classList:domNode().classList},getElementById:id=>nodes[id]||null,addEventListener:()=>{}};
 let outgoing=null,exitCount=0;
 const window={lifeGuest:{active:true,exit(){exitCount++}},dispatchEvent:ev=>{outgoing=ev.detail},lifeSupabase:undefined};
 function CustomEvent(name,options){this.type=name;this.detail=options.detail}
 const ctx=vm.createContext({window,document,CustomEvent,console});
 vm.runInContext(authSource,ctx,{timeout:2000});
 await Promise.resolve();
 assert.strictEqual(document.documentElement.dataset.lifePlan,'FREE');
 assert.strictEqual(window.lifeSupabase,undefined);
 assert.strictEqual(nodes['life-account-chip'].textContent,'CONVIDADO');
 assert.strictEqual(nodes['life-account-exit'].style.display,'grid');
 assert.strictEqual(nodes['life-auth'].classList.contains('hidden'),true);
 assert.strictEqual(outgoing.guest,true);
 assert.strictEqual(typeof nodes['life-account-exit-confirm'].onclick,'function');
 nodes['life-account-exit-confirm'].onclick();
 assert.strictEqual(exitCount,1);
 window.lifeOpenAuth('signup');
 assert.strictEqual(exitCount,2);
 console.log('PASSOU: convidado inicia sem Supabase, fica FREE, fecha login e oferece saída.');
})().catch(e=>{console.error(e);process.exitCode=1;});
