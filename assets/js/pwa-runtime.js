(function(){
  'use strict';
  window.LIFE_BUILD={version:'7.6.1',name:'Ready Build'};
  window.LIFE_SINGLE_FILE=false;
  if(!('serviceWorker' in navigator)) return;
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'}).then(reg=>{
      reg.update().catch(()=>{});
      window.LIFE_SERVICE_WORKER=reg;
    }).catch(err=>console.warn('LIFE PWA: service worker indisponível',err));
  });
  window.addEventListener('online',()=>document.documentElement.dataset.network='online');
  window.addEventListener('offline',()=>document.documentElement.dataset.network='offline');
  document.documentElement.dataset.network=navigator.onLine?'online':'offline';
})();
