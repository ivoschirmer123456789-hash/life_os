(()=>{
  'use strict';
  const ROW_SELECTOR = [
    '.life-area-focus-row-v920',
    '.life-fit-focus-saved-row-v913',
    '.life-fit-focus-exercise-row-v913',
    '.life-fit-focus-workout-row-v913',
    '.v18-result',
    '.life-spot-recent-v930'
  ].join(',');
  let drawer=null, activeTarget=null, longPressTimer=null, touchStart=null, suppressClickTarget=null, suppressClickUntil=0;
  const scrollByKey=new Map();
  let currentKey='';

  const root=()=>document.querySelector('.v18[data-life-view]');
  const keyFor=()=>{
    const r=root(); if(!r) return '';
    return [r.dataset.lifeView||'',r.dataset.areaFocus||'',r.dataset.fitnessFocus||''].join('|');
  };
  const textOf=(el)=>{
    const title=el.querySelector('b,h2,h3')?.textContent?.trim() || el.textContent?.trim().split('\n')[0] || 'Item';
    const meta=el.querySelector('small,span')?.textContent?.trim() || '';
    return {title:title.slice(0,120),meta:meta.slice(0,180)};
  };
  const isActionable=(el)=>!!el&&(el.matches?.('button,a[href],[role="button"]')||typeof el.onclick==='function');
  const copyText=async(text)=>{
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true}}catch(_){}
    try{const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return !!ok}catch(_){return false}
  };
  const ensureDrawer=()=>{
    if(drawer) return drawer;
    drawer=document.createElement('div');
    drawer.className='life-quick-peek-v940';
    drawer.hidden=true;
    drawer.innerHTML=`<div class="life-quick-peek-backdrop-v940"></div><section class="life-quick-peek-sheet-v940" role="dialog" aria-modal="true" aria-label="Prévia rápida"><div class="life-quick-peek-grip-v940"></div><header><small>PRÉVIA RÁPIDA</small><button type="button" class="life-quick-peek-close-v940" aria-label="Fechar">×</button></header><h2></h2><p></p><div class="life-quick-peek-actions-v940"><button type="button" data-action="open" class="primary">ABRIR</button><button type="button" data-action="copy">COPIAR NOME</button></div></section>`;
    document.body.appendChild(drawer);
    drawer.querySelector('.life-quick-peek-backdrop-v940').addEventListener('click',closeDrawer);
    drawer.querySelector('.life-quick-peek-close-v940').addEventListener('click',closeDrawer);
    drawer.querySelector('[data-action="open"]').addEventListener('click',()=>{const t=activeTarget;if(!isActionable(t))return;closeDrawer();t.click();});
    drawer.querySelector('[data-action="copy"]').addEventListener('click',async()=>{const {title}=textOf(activeTarget||drawer);const ok=await copyText(title);const b=drawer.querySelector('[data-action="copy"]');if(!b)return;b.textContent=ok?'COPIADO':'NÃO FOI POSSÍVEL COPIAR';setTimeout(()=>{if(b)b.textContent='COPIAR NOME'},1100)});
    return drawer;
  };
  function openDrawer(target){
    if(!target) return;
    activeTarget=target;
    const d=ensureDrawer(), t=textOf(target);
    d.querySelector('h2').textContent=t.title;
    d.querySelector('p').textContent=t.meta||'Abra o item para ver os detalhes completos.';
    const openBtn=d.querySelector('[data-action="open"]');
    const actionable=isActionable(target);
    if(openBtn){openBtn.hidden=!actionable;openBtn.disabled=!actionable;openBtn.setAttribute('aria-hidden',actionable?'false':'true')}
    d.hidden=false;
    document.documentElement.classList.add('life-quick-peek-open-v940');
    requestAnimationFrame(()=>d.querySelector('.life-quick-peek-close-v940')?.focus({preventScroll:true}));
  }
  function closeDrawer(){
    if(!drawer) return;
    drawer.hidden=true; document.documentElement.classList.remove('life-quick-peek-open-v940');
    const t=activeTarget; activeTarget=null; t?.focus?.({preventScroll:true});
  }
  const matchRow=(node)=>node?.closest?.(ROW_SELECTOR);
  document.addEventListener('contextmenu',e=>{const row=matchRow(e.target);if(!row)return;e.preventDefault();openDrawer(row)},true);
  document.addEventListener('touchstart',e=>{
    const row=matchRow(e.target); if(!row||e.touches.length!==1) return;
    touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY,row};
    clearTimeout(longPressTimer); longPressTimer=setTimeout(()=>{suppressClickTarget=row;suppressClickUntil=Date.now()+900;openDrawer(row)},560);
  },{passive:true,capture:true});
  document.addEventListener('touchmove',e=>{if(!touchStart||!e.touches[0])return;const dx=e.touches[0].clientX-touchStart.x,dy=e.touches[0].clientY-touchStart.y;if(Math.hypot(dx,dy)>14){clearTimeout(longPressTimer);touchStart=null}}, {passive:true,capture:true});
  document.addEventListener('touchend',()=>{clearTimeout(longPressTimer);touchStart=null},{passive:true,capture:true});
  document.addEventListener('touchcancel',()=>{clearTimeout(longPressTimer);touchStart=null},{passive:true,capture:true});
  document.addEventListener('click',e=>{
    if(!suppressClickTarget||Date.now()>suppressClickUntil){suppressClickTarget=null;suppressClickUntil=0;return}
    const row=matchRow(e.target);
    if(row&&row===suppressClickTarget){e.preventDefault();e.stopImmediatePropagation();suppressClickTarget=null;suppressClickUntil=0}
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer&&!drawer.hidden){e.preventDefault();closeDrawer()}},true);

  // Preserve the hub scroll position without restoring deep focus screens.
  const observeRoot=()=>{
    const r=root(); if(!r) return setTimeout(observeRoot,250);
    currentKey=keyFor();
    const obs=new MutationObserver(()=>{
      const next=keyFor(); if(!next||next===currentKey) return;
      if(currentKey) scrollByKey.set(currentKey,window.scrollY||0);
      currentKey=next;
      const parts=next.split('|'); const isFocus=!!(parts[1]||parts[2]);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(isFocus) window.scrollTo({top:0,left:0,behavior:'auto'});
        else if(scrollByKey.has(next)) window.scrollTo({top:scrollByKey.get(next),left:0,behavior:'auto'});
      }));
    });
    obs.observe(r,{attributes:true,attributeFilter:['data-life-view','data-area-focus','data-fitness-focus']});
  };
  observeRoot();

  window.LIFEInteraction940={openPreview:openDrawer,closePreview:closeDrawer,version:'9.4.1'};
})();
