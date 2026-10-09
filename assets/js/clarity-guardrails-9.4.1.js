/* LIFE OS 9.4.1 — Clarity Guardrails
   Non-invasive product rules: keep hubs simple, preserve focus modes and surface diagnostics. */
(function(){
  'use strict';
  const API={version:'9.4.1',maxHubChoices:4,minTouchPx:44,maxPreviewItems:4};
  const report=(kind,detail)=>{
    try{
      const store=window.__lifeBoot||(window.__lifeBoot={errors:[]});
      store.errors=Array.isArray(store.errors)?store.errors:[];
      if(!store.errors.some(x=>x&&x.kind===kind&&x.message===detail)){
        store.errors.push({kind,message:detail});
        store.errors=store.errors.slice(-12);
      }
    }catch(_){ }
  };
  const audit=()=>{
    try{
      document.querySelectorAll('.life-entry-hub-grid-v912').forEach(grid=>{
        const visible=[...grid.children].filter(el=>getComputedStyle(el).display!=='none');
        grid.dataset.lifeChoiceCount=String(visible.length);
        if(visible.length>API.maxHubChoices) report('clarity-hub','Hub com '+visible.length+' escolhas visíveis');
      });
      document.querySelectorAll('.life-area-focus-v920').forEach(el=>{el.dataset.lifeFocusGuard='active';});
    }catch(_){ }
  };
  let timer=0;
  const queue=()=>{clearTimeout(timer);timer=setTimeout(audit,90);};
  const relevantNode=node=>{
    if(!node||node.nodeType!==1)return false;
    return !!(node.matches?.('.life-entry-hub-grid-v912,.life-area-focus-v920')||node.querySelector?.('.life-entry-hub-grid-v912,.life-area-focus-v920'));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',audit,{once:true});else audit();
  try{new MutationObserver(records=>{for(const record of records){for(const node of record.addedNodes||[]){if(relevantNode(node)){queue();return;}}}}).observe(document.documentElement,{subtree:true,childList:true});}catch(_){ }
  window.LIFE_CLARITY_GUARDRAILS=Object.freeze(API);
})();
