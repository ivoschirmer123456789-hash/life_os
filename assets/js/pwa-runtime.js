(function(){
  'use strict';
  window.LIFE_BUILD={version:'6.3.0',name:'Signature System'};
  window.LIFE_SINGLE_FILE=false;
  const paintNetwork=()=>{document.documentElement.dataset.network=navigator.onLine?'online':'offline'};
  window.addEventListener('online',paintNetwork);
  window.addEventListener('offline',paintNetwork);
  paintNetwork();
  if(!('serviceWorker' in navigator)) return;
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./service-worker.js',{scope:'./'}).then(reg=>{
      reg.update().catch(()=>{});
      window.LIFE_SERVICE_WORKER=reg;
    }).catch(err=>console.warn('LIFE PWA: service worker indisponível',err));
  });
})();
