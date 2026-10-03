(function(){
  'use strict';
  const root=document.documentElement;
  try{
    root.dataset.lifeVersion='5.0';
    root.dataset.lifeDesign='5.0';
    localStorage.setItem('life_design_version','5.0');
  }catch(_){ }

  const titleMap={
    hoje:'Hoje',tarefas:'Organizar',notas:'Notas',estudos:'Estudos',fitness:'Fitness',receitas:'Receitas',finanças:'Finanças',ia:'LIFE AI',life:'Planejador','meu-life':'Meu LIFE',evolução:'Evolução',biblioteca:'Biblioteca',favoritos:'Favoritos',archive:'Arquivo',perfil:'Perfil',tutorial:'Tutorial','guia-de-estudos':'Guia de Estudos'
  };
  let lastArea='';
  function syncArea(){
    const app=document.querySelector('.v18');
    if(!app)return;
    const cls=[...app.classList].find(x=>x.indexOf('life-area-')===0);
    const area=cls?cls.slice(10):'';
    if(area&&area!==lastArea){
      lastArea=area;
      document.title='LIFE OS · '+(titleMap[area]||area.replace(/-/g,' '));
      root.dataset.lifeArea=area;
      const main=app.querySelector('main');
      if(main){
        main.setAttribute('data-life-page',area);
      }
    }
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(syncArea));
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  syncArea();

  // Small tactile feedback on primary mobile navigation where supported.
  document.addEventListener('click',e=>{
    const target=e.target&&e.target.closest&&e.target.closest('.life-design-mobile-nav button,.life-v50-agent-grid button,.life-v50-shelves button');
    if(!target)return;
    try{ if(navigator.vibrate && matchMedia('(pointer:coarse)').matches) navigator.vibrate(7); }catch(_){ }
  },{passive:true});

  // Keep viewport variables in sync with iOS browser chrome.
  function viewport(){
    const vv=window.visualViewport;
    const h=vv?vv.height:window.innerHeight;
    const top=vv?vv.offsetTop:0;
    root.style.setProperty('--life-v50-vh',(h*.01)+'px');
    root.style.setProperty('--life-v50-offset-top',top+'px');
  }
  viewport();
  addEventListener('resize',viewport,{passive:true});
  if(window.visualViewport){
    visualViewport.addEventListener('resize',viewport,{passive:true});
    visualViewport.addEventListener('scroll',viewport,{passive:true});
  }

  // Defensive: buttons marked disabled by the UI cannot leak clicks to content behind them.
  document.addEventListener('click',e=>{
    const disabled=e.target&&e.target.closest&&e.target.closest('[aria-disabled="true"],button:disabled');
    if(disabled){ e.preventDefault(); e.stopPropagation(); }
  },true);
})();
