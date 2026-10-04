(function(){
  'use strict';
  const root=document.documentElement;
  try{root.dataset.lifePolish='6.1';}catch(_){ }

  // Predictable backdrop behavior for the Owner panel without changing its data logic.
  document.addEventListener('click',function(e){
    const panel=e.target&&e.target.closest&&e.target.closest('#life-owner-panel');
    if(panel&&e.target===panel){
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden','true');
    }
  });

  // Keep buttons from looking frozen after touch/click on coarse pointers.
  document.addEventListener('pointerdown',function(e){
    const b=e.target&&e.target.closest&&e.target.closest('button,[role="button"]');
    if(!b||b.disabled||b.getAttribute('aria-disabled')==='true')return;
    b.classList.add('life61-pressed');
  },{passive:true});
  const clearPressed=function(){document.querySelectorAll('.life61-pressed').forEach(function(x){x.classList.remove('life61-pressed')})};
  document.addEventListener('pointerup',clearPressed,{passive:true});
  document.addEventListener('pointercancel',clearPressed,{passive:true});

  // Escape should always close the Owner control if it is the top-most custom panel.
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    const owner=document.getElementById('life-owner-panel');
    if(owner&&owner.classList.contains('open')){
      owner.classList.remove('open');
      owner.setAttribute('aria-hidden','true');
    }
  });
})();
