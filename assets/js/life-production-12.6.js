/* LIFE OS 12.6 — deterministic release gates; no telemetry or personal content. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LifeProduction126 = api;
})(typeof globalThis !== 'undefined' ? globalThis : undefined, function () {
  'use strict';
  const BUILD = '12.6';
  function requestGuard(meta = {}) {
    const url = String(meta.checkoutUrl || '');
    const loggedIn = meta.loggedIn === true;
    const role = String(meta.role || 'FREE').toUpperCase();
    const busy = meta.busy === true;
    if (busy) return {ok: false, code: 'busy'};
    if (!loggedIn) return {ok: false, code: 'login_required'};
    if (role === 'PRO' || role === 'OWNER') return {ok: false, code: 'already_entitled'};
    if (role !== 'FREE') return {ok: false, code: 'invalid_plan'};
    if (url) {
      try {
        const u = new URL(url);
        const hosts = ['mercadopago.com','mercadopago.com.br','mercadopago.com.ar','mercadopago.com.mx','mercadopago.com.co','mercadopago.com.pe','mercadopago.com.uy','mercadopago.cl','mercadopago.com.ve','mpago.la'];
        if (u.protocol !== 'https:' || u.username || u.password || !hosts.some(h => u.hostname === h || u.hostname.endsWith('.' + h))) return {ok:false,code:'untrusted_provider'};
      } catch (_) {return {ok:false,code:'untrusted_provider'};}
    }
    return {ok: true, code: 'allowed'};
  }
  function safeHealth({online = false, authenticated = false,plan = 'FREE', sync = 'local', sw = false, startupMs = null,errors=0,aiReady=false} = {}) {
    const validPlan = ['FREE','PRO','OWNER'].includes(plan) ? plan : 'FREE';
    const safeSync = ['synced','syncing','conflict','local','checking'].includes(sync)?sync:'local';
    const duration = Number.isFinite(Number(startupMs)) && startupMs !== null && Number(startupMs) >= 0 ? Math.min(60000,Math.floor(Number(startupMs))) : null;
    return Object.freeze({build:BUILD,online:!!online,authenticated:!!authenticated,plan:validPlan,sync:safeSync,serviceWorker:!!sw,startupMs:duration,errors:Number.isFinite(Number(errors))?Math.min(99,Math.max(0,Math.floor(Number(errors)))):0,aiStatus:aiReady?'Configurada no cliente; não validada remotamente':'Integração não confirmada'});
  }
  function auditReadiness(input = {}) {
    const s=safeHealth(input),checks=[
      {key:'auth',label:'Sessão',ok:s.authenticated},
      {key:'sync',label:'Sincronização',ok:s.sync==='synced'},
      {key:'pwa',label:'Service Worker',ok:s.serviceWorker},
      {key:'network',label:'Internet',ok:s.online},
    ];
    return {build:BUILD,scope:'este navegador',generatedAt:new Date().toISOString(),checks,summary:s,note:'Não avalia cobrança, RLS real, outras contas ou saúde do servidor.'};
  }
  function safeDiagnostics(input={}) { return JSON.stringify(auditReadiness(input),null,2); }
  return Object.freeze({BUILD,requestGuard,safeHealth,auditReadiness,safeDiagnostics});
});
