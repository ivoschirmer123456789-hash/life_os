(()=>{
  'use strict';
  const forbidden=[/\bPRIVATE MEMBER\b/i,/\bARCHIVE\b/i,/\bPLANNER\b/i];
  let timer=null,last={};
  const visible=el=>!!(el&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
  const scan=()=>{
    const hubs=[...document.querySelectorAll('.life-entry-hub-grid-v912')].filter(visible);
    const focusLists=[...document.querySelectorAll('.life-area-focus-list-v920,.life-fit-focus-workout-list-v913,.life-fit-focus-saved-list-v913')].filter(visible);
    const hubOver=hubs.map(x=>[x,[...x.children].filter(visible).length]).filter(([,n])=>n>4).map(([,n])=>n);
    const focusOver=focusLists.map(x=>[x,[...x.children].filter(el=>visible(el)&&!el.classList.contains('life-fit-focus-more-v913')).length]).filter(([,n])=>n>4).map(([,n])=>n);
    const tinyActions=[...document.querySelectorAll('button,a,input,select,textarea')].filter(visible).filter(el=>parseFloat(getComputedStyle(el).fontSize||'16')<11).length;
    const text=(document.querySelector('.v18')?.innerText||'').slice(0,120000);
    const naming=forbidden.filter(rx=>rx.test(text)).map(rx=>String(rx));
    last={version:'9.4.1',at:new Date().toISOString(),hubOver,focusOver,tinyActions,naming,ok:!hubOver.length&&!focusOver.length&&!tinyActions&&!naming.length};
    document.documentElement.dataset.lifeClarity=last.ok?'ok':'review';
    window.__lifeQuality940=last;
    return last;
  };
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(scan,180)};
  const start=()=>{
    scan();
    const app=document.querySelector('.v18')||document.body;
    new MutationObserver(m=>{if(m.some(x=>x.type==='childList'||(x.type==='attributes'&&/data-life|class/.test(x.attributeName||''))))schedule()}).observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-life-view','data-area-focus','data-fitness-focus']});
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
  window.LIFEQualityGuardrails940={scan:()=>scan(),getReport:()=>({...last})};
})();
