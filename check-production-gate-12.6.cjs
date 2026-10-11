'use strict';
// Read-only production readiness gate. Never prints secrets or makes payments.
const checks=[
  ['LIFE_STAGING_URL',v=>/^https:\/\/[a-z\d.-]+(?::\d+)?\/?$/i.test(v),'URL HTTPS do ambiente de homologação'],
  ['LIFE_PRICE_VERIFIED',v=>v==='yes','Preço comparado com o Mercado Pago no servidor'],
  ['LIFE_WEBHOOK_VERIFIED',v=>v==='yes','Webhook assinado, idempotente e reembolso testados'],
  ['LIFE_RLS_VERIFIED',v=>v==='yes','RLS e isolamento de duas contas testados'],
  ['LIFE_AI_FUNCTION_TESTED',v=>v==='yes','LIFE AI e cotas verificadas no Supabase'],
  ['LIFE_SYNC_TWO_DEVICES',v=>v==='yes','Sincronização e conflito reais testados'],
  ['LIFE_BROWSER_TESTED',v=>v==='yes','Fluxos mobile/desktop e acessibilidade conferidos'],
  ['LIFE_ROLLBACK_READY',v=>v==='yes','Deploy anterior e recuperação disponíveis'],
];
let failed=0;
for(const [k,test,label] of checks){const ok=test(String(process.env[k]||'')); console.log((ok?'[OK] ':'[PENDENTE] ')+label);if(!ok)failed++;}
console.log(failed?'NÃO LIBERAR VENDAS. '+failed+' verificações não confirmadas.':'Checklist declarado completo. Confirme evidências manuais antes de vender.');
process.exitCode=failed?2:0;
