/* LIFE OS 9.4.2 — Clarity Guardrails
   Lightweight product rules: audit only when the active view/focus changes. */
(function(){
  'use strict';
  const API={version:'9.4.2',maxHubChoices:4,minTouchPx:44,maxPreviewItems:4};
  const report=(kind,detail)=>{try{const store=window.__lifeBoot||(window.__lifeBoot={errors:[]});store.errors=Array.isArray(store.errors)?store.errors:[];if(!store.errors.some(x=>x&&x.kind===kind&&x.message===detail)){store.errors.push({kind,message:detail});store.errors=store.errors.slice(-12)}}catch(_){}};
  const audit=()=>{try{document.querySelectorAll('.life-entry-hub-grid-v912').forEach(grid=>{const visible=[...grid.children].filter(el=>getComputedStyle(el).display!=='none');grid.dataset.lifeChoiceCount=String(visible.length);if(visible.length>API.maxHubChoices)report('clarity-hub','Hub com '+visible.length+' escolhas visíveis')});document.querySelectorAll('.life-area-focus-v920').forEach(el=>{el.dataset.lifeFocusGuard='active'})}catch(_){}};
  let timer=0;const queue=()=>{clearTimeout(timer);timer=setTimeout(audit,120)};
  const start=()=>{audit();const attach=()=>{const app=document.querySelector('.v18[data-life-view]');if(!app)return false;try{new MutationObserver(queue).observe(app,{attributes:true,attributeFilter:['data-life-view','data-area-focus','data-fitness-focus']})}catch(_){}return true};if(!attach()){let tries=0;const id=setInterval(()=>{tries++;if(attach()||tries>20)clearInterval(id)},150)}};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
  window.LIFE_CLARITY_GUARDRAILS=Object.freeze(API);
})();
