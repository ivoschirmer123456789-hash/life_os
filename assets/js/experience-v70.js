(function(){
  'use strict';
  const root=document.documentElement;
  try{root.dataset.lifeVersion='7.0';root.dataset.lifeDesign='7.0';localStorage.setItem('life_design_version','7.0');}catch(_){ }

  const AREA_BUTTONS=[
    ['Hoje','today'],['Tarefas','checklist'],['Estudos','school'],['Fitness','fitness_center'],['Finanças','payments'],['IA','auto_awesome'],['Biblioteca','local_library'],['Evolução','insights']
  ];
  function navTo(label){
    const nodes=[...document.querySelectorAll('.v18-tabs button,.life-mobile-more-sheet button,.life-design-mobile-nav button')];
    const exact=nodes.find(b=>(b.textContent||'').trim().toLowerCase()===label.toLowerCase());
    const loose=nodes.find(b=>(b.textContent||'').toLowerCase().includes(label.toLowerCase()));
    (exact||loose)?.click();
  }
  function currentArea(){
    const app=document.querySelector('.life-app50[data-area]');
    if(app)return app.getAttribute('data-area')||'';
    const v=document.querySelector('.v18[class*="life-area-"]');
    if(v){const c=[...v.classList].find(x=>x.startsWith('life-area-'));return c?c.replace('life-area-',''):''}
    return '';
  }
  function ensureOrbit(){
    if(document.querySelector('.life-v70-orbit'))return;
    const nav=document.createElement('nav');nav.className='life-v70-orbit';nav.setAttribute('aria-label','Atalhos principais LIFE');
    AREA_BUTTONS.forEach(([label,icon])=>{const b=document.createElement('button');b.type='button';b.dataset.area=label;b.innerHTML='<span class="material-symbols-rounded">'+icon+'</span><em>'+label+'</em>';b.addEventListener('click',()=>navTo(label));nav.appendChild(b)});
    document.body.appendChild(nav);
  }
  function ensureProgress(){if(document.querySelector('.life-v70-progress'))return;const el=document.createElement('div');el.className='life-v70-progress';document.body.appendChild(el)}
  function updateUI(){
    ensureOrbit();ensureProgress();
    const area=(currentArea()||'').toLowerCase();
    document.querySelectorAll('.life-v70-orbit button').forEach(b=>{const x=(b.dataset.area||'').toLowerCase();b.classList.toggle('on',area.includes(x)||x.includes(area))});
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);const pct=Math.max(0,Math.min(1,scrollY/max));const p=document.querySelector('.life-v70-progress');if(p)p.style.height=(pct*100)+'%';
  }
  let raf=0;const schedule=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;updateUI()})};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-area']});
  updateUI();

  // Modal ergonomics: Escape closes the visible close action; backdrop remains primary on touch.
  addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    const overlays=[...document.querySelectorAll('.life-study-topic-modal,.life-how-overlay,.v18-sheetwrap,.v18-overlay')].filter(x=>getComputedStyle(x).display!=='none');
    const top=overlays.at(-1);if(!top)return;
    const close=top.querySelector('[aria-label="Fechar"],.life-study-topic-close,.v18-close,.lov-close');close?.click();
  });
})();
