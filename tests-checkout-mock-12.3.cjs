/* Isolated behavior test of ACTUAL browser checkout handler (mocks, no real purchases). */
const vm=require('node:vm'),assert=require('node:assert/strict'),fs=require('node:fs');
const app=fs.readFileSync(__dirname+'/assets/js/life-app-9.4.2.js','utf8');
const start=app.indexOf('    const lifeCheckoutUrlFrom = (data) =>');
const end=app.indexOf('    const [v31Menu, setV31Menu]',start);
if(start<0||end<0)throw Error('checkout source not found');
const checkout=app.slice(start,end);
const api=require('./assets/js/life-integrity-12.3.js');
const prod=require('./assets/js/life-production-12.6.js');
let n=0;
const tick=async(title,scenario,expected)=>{
 const calls={dest:[],error:[],toast:[],busy:[],backend:0};
 const context={
  console:{error(){}},setTimeout(){},URL,
  window:{lifeSupabase:{auth:{getSession:async()=>({data:{session:scenario.session===false?null:{user:{id:'u123'},access_token:'token'}}})},functions:{invoke:async(name)=>{calls.backend++;return {data:scenario.reply||{checkout_url:'https://www.mercadopago.com.br/checkout?id=123'},error:scenario.error||null}}}},location:{assign(u){calls.dest.push(u)}},lifeOpenAuth(){calls.auth=true},LifeIntegrity123:api,LifeProduction126:prod,lifeProductEvent(){}},
  realPlan:scenario.plan||'FREE',proCheckoutBusy:false,life126CheckoutLock:{current:false},
  setProCheckoutError:v=>calls.error.push(v),setProCheckoutBusy:v=>calls.busy.push(v),setToast:v=>calls.toast.push(v),lifeSessionSet(){},
  lifeCheckoutUrlFrom:null
 };
 vm.createContext(context);
 vm.runInContext(checkout+'\nthis.__start=startLifeProCheckout;',context,{timeout:1000});
 await context.__start();
 expected(calls);
 n++;console.log('  ✓ '+title);
};
(async()=>{
 await tick('conta FREE autenticada abre checkout HTTPS Mercado Pago',{},c=>{assert.equal(c.backend,1);assert.equal(c.dest.length,1);assert.equal(c.busy.at(-1),true)});
 await tick('checkout retorna URL suspeita e NÃO redireciona',{reply:{checkout_url:'https://mercadopago.com.br.evil.example/order'}},c=>{assert.equal(c.dest.length,0);assert.ok(c.error.at(-1).includes('não confiável'))});
 await tick('falta de token não chama backend', {session:false},c=>{assert.equal(c.backend,0);assert.equal(c.dest.length,0);assert.ok(c.error.at(-1).includes('Entre'))});
 await tick('OWNER jamais inicia cobrança',{plan:'OWNER'},c=>{assert.equal(c.backend,0);assert.equal(c.dest.length,0);assert.ok(c.error.at(-1).includes('OWNER'))});
 await tick('PRO ativo jamais inicia cobrança',{plan:'PRO'},c=>{assert.equal(c.backend,0);assert.equal(c.dest.length,0)});
 await tick('falha servidor não abre checkout',{reply:{},error:new Error('Backend 404')},c=>{assert.equal(c.dest.length,0);assert.ok(c.error.length>0)});
 console.log('OK: '+n+' cenários comportamentais de checkout com servidor simulado. Pagamento real NÃO testado.');
})().catch(e=>{console.error(e);process.exit(1)});
