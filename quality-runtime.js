(function(){
  'use strict';
  const root=document.documentElement;
  try{root.dataset.lifeVersion='7.0';root.dataset.lifeDesign='7.0';localStorage.setItem('life_design_version','7.0');}catch(_){ }
  // Context-aware title for installed/PWA and browser tabs.
  const updateTitle=()=>{const active=document.querySelector('.life-app50[data-area]');const area=active?.getAttribute('data-area');document.title=area&&area!=='LIFE'?'LIFE OS · '+area:'LIFE OS — Seu sistema pessoal';};
  const mo=new MutationObserver(()=>requestAnimationFrame(updateTitle));
  const rootEl=document.getElementById('life-v18-root'); if(rootEl)mo.observe(rootEl,{subtree:true,childList:true,attributes:true,attributeFilter:['data-area']});
  updateTitle();
  // Keep modal exits predictable and body scroll stable on mobile.
  const syncModalState=()=>{const modal=document.querySelector('.v45-recipe-sheet,.life-recipe-modal,.life-study-topic-modal,.life-ai-quickwrap,.life-mobile-more,.v18-sheetwrap,.life-settings-overlay');document.documentElement.classList.toggle('life-modal-open',!!modal);};
  const modalObserver=new MutationObserver(syncModalState); if(document.body)modalObserver.observe(document.body,{subtree:true,childList:true}); syncModalState();
  // Keyboard: Esc closes the topmost dismissible layer using its visible close control when available.
  addEventListener('keydown',e=>{if(e.key!=='Escape')return;const candidates=[...document.querySelectorAll('.life-study-topic-modal,.v45-recipe-sheet,.life-ai-quickwrap,.life-mobile-more,.v18-sheetwrap,.life-settings-overlay')].filter(x=>getComputedStyle(x).display!=='none');const top=candidates.at(-1);if(!top)return;const close=top.querySelector('button[aria-label*="Fechar"],button[aria-label*="fechar"],header button:last-child,.life-mobile-more-head button,.life-ai-quick-head button');if(close){e.preventDefault();close.click();}});
})();
