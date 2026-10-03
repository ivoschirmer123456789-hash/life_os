(function(){
  'use strict';
  const root=document.documentElement;
  try{root.dataset.lifeVersion='6.0';root.dataset.lifeDesign='6.0';localStorage.setItem('life_design_version','6.0');}catch(_){ }
  const fine=window.matchMedia&&matchMedia('(pointer:fine)').matches;
  if(fine){
    let raf=0,x=innerWidth*.5,y=innerHeight*.18;
    addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;if(raf)return;raf=requestAnimationFrame(()=>{raf=0;root.style.setProperty('--life-pointer-x',x+'px');root.style.setProperty('--life-pointer-y',y+'px');});},{passive:true});
  }
  // Keep modal/sheet exits predictable on mobile: backdrop taps should not leak through.
  document.addEventListener('click',e=>{
    const overlay=e.target&&e.target.closest&&e.target.closest('.life-study-topic-modal,.v18-sheetwrap,.v18-overlay,.life-mobile-modal-backdrop');
    if(overlay&&e.target===overlay)e.stopPropagation();
  },true);
  // Small haptic acknowledgement for explicit navigation, never continuous feedback.
  document.addEventListener('click',e=>{
    const b=e.target&&e.target.closest&&e.target.closest('button');
    if(!b||b.disabled||b.getAttribute('aria-disabled')==='true')return;
    try{if(navigator.vibrate&&matchMedia('(pointer:coarse)').matches)navigator.vibrate(6);}catch(_){ }
  },{passive:true});
})();
