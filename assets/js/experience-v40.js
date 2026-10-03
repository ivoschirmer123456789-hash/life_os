(function(){
  'use strict';
  const root=document.documentElement;
  try{root.dataset.lifeVersion='4.0';root.dataset.lifeDesign='4.0';localStorage.setItem('life_design_version','4.0')}catch(_){}

  function setViewport(){
    const h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;
    root.style.setProperty('--life-vh',(h*.01)+'px');
    root.style.setProperty('--life-window-h',h+'px');
  }
  setViewport();
  addEventListener('resize',setViewport,{passive:true});
  if(window.visualViewport) visualViewport.addEventListener('resize',setViewport,{passive:true});

  try{
    if(matchMedia('(display-mode: standalone)').matches || navigator.standalone===true) root.classList.add('life-standalone');
    if(/iP(hone|od|ad)/.test(navigator.userAgent)) root.classList.add('life-ios');
  }catch(_){}

  const blockers=['.v18-sheetwrap','.v18-overlay','.life-how-overlay','.life-ai-quickwrap','.life-ai-confirm','.life-notification-overlay','.life-pro-paywall','.life-fit35-review-modal','.life-mobile-more','#life-owner-panel[aria-hidden="false"]'];
  function visible(el){if(!el)return false;const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&el.getClientRects().length>0}
  let raf=0;
  function syncModal(){
    raf=0;
    const active=blockers.some(sel=>Array.from(document.querySelectorAll(sel)).some(visible));
    document.body.classList.toggle('life-modal-open',active);
    document.querySelectorAll('[role="dialog"]').forEach(d=>{if(visible(d)&&!d.hasAttribute('aria-modal'))d.setAttribute('aria-modal','true')});
  }
  const mo=new MutationObserver(()=>{if(!raf)raf=requestAnimationFrame(syncModal)});
  mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','aria-hidden']});
  syncModal();

  document.addEventListener('click',e=>{
    const blocked=e.target&&e.target.closest&&e.target.closest('[aria-disabled="true"]');
    if(blocked){e.preventDefault();e.stopPropagation();}
  },true);

  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    const candidates=Array.from(document.querySelectorAll('[role="dialog"] button[aria-label*="Fechar"], [role="dialog"] button[aria-label*="fechar"], .life-pro-paywall-close, .life-mobile-more-head button, .life-ai-quick-head>button, .lov-close'));
    const btn=candidates.reverse().find(visible);
    if(btn){e.preventDefault();btn.click();}
  });

  addEventListener('online',()=>root.classList.remove('life-offline'));
  addEventListener('offline',()=>root.classList.add('life-offline'));
  if(!navigator.onLine)root.classList.add('life-offline');
})();
