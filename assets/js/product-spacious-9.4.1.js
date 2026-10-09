/* LIFE OS 9.4.1 — Clarity Plus helpers
   Small product-level module: layout policy, progressive rendering and shared labels. */
(function(){
  'use strict';
  const VERSION='9.4.1';
  const root=document.documentElement;
  root.dataset.lifeLayout='spacious';
  root.dataset.lifeProductCore='9.4.1';
  const idle=(fn,timeout=900)=>{
    if(typeof fn!=='function')return;
    if('requestIdleCallback' in window){requestIdleCallback(fn,{timeout});return;}
    setTimeout(fn,Math.min(timeout,180));
  };
  const contextLabels=Object.freeze({area:'Área atual',tasks:'Tarefas',notes:'Notas',projects:'Projetos',goals:'Metas e hábitos',plans:'Planos salvos',finance:'Finanças',recents:'Recentes',favorites:'Salvos',memory:'Memória PRO'});
  const inboxDestinations=Object.freeze([
    {id:'TAREFA',label:'Tarefa'},
    {id:'EVENTO',label:'Compromisso'},
    {id:'NOTA',label:'Nota'},
    {id:'ESTUDO',label:'Estudo'},
    {id:'PROJETO',label:'Projeto'},
    {id:'ARQUIVAR',label:'Arquivar'}
  ]);
  const layout=Object.freeze({timelineLimit:5,inboxPreviewLimit:3,contentMax:1420,readingMax:820,mobileBreakpoint:720});
  window.LIFEUI=Object.freeze({version:VERSION,layout,contextLabels,inboxDestinations,idle});
  idle(()=>{try{document.documentElement.classList.add('life-spacious-ready')}catch(_){}});
})();
