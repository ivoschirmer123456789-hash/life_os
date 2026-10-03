(function(){
  document.addEventListener('click',function(e){const b=e.target&&e.target.closest&&e.target.closest('button');if(!b||!navigator.vibrate||matchMedia('(pointer:fine)').matches)return;try{navigator.vibrate(b.classList.contains('life-design-nav-add')?9:4)}catch(_){}},{passive:true});
  try{document.documentElement.dataset.lifeDesign='2.1';localStorage.setItem('life_design_version','2.1')}catch(e){}
})();
