/* Decorative, non-invasive enhancements. Never replaces React-managed content. */
(function () {
  'use strict';
  var glyphs = {
    'Hoje':'◈','Tarefas':'☑','Organizar':'≡','Notas':'✎','Estudos':'▤',
    'Fitness':'✦','Receitas':'◉','Alimentação':'◉','Finanças':'▥',
    'IA':'✧','LIFE AI':'✧','Life':'◇','Meu LIFE':'◇','Evolução':'↗',
    'Favoritos':'♡','Perfil':'◯','Tutorial':'?','Archive':'▣','Configurações':'⚙',
    'Biblioteca':'▤'
  };
  var nav = null;
  function decorate(){
    var current = document.querySelector('.v18-tabs');
    if(!current) return;
    nav=current;
    current.querySelectorAll('button').forEach(function(btn){
      var name = (btn.textContent || '').trim().replace(/\s*·\s*PRO\s*$/i,'');
      var ico = glyphs[name] || '◦';
      if (btn.getAttribute('data-life-icon') !== ico) btn.setAttribute('data-life-icon',ico);
    });
  }
  var schedule=false;
  var observer=new MutationObserver(function(mutations){
    if(schedule)return;
    if(!mutations.some(function(m){return m.addedNodes.length || m.removedNodes.length;})) return;
    schedule=true;
    window.requestAnimationFrame(function(){schedule=false;decorate()});
  });
  function init(){
    decorate();
    var target = document.getElementById('life-v18-root');
    if(target) observer.observe(target,{childList:true,subtree:true});
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
