(function(){
  'use strict';
  window.LIFE_BUILD={version:'6.3.2',name:'Signature System'};
  window.LIFE_SINGLE_FILE=false;
  const paintNetwork=()=>{document.documentElement.dataset.network=navigator.onLine?'online':'offline'};
  window.addEventListener('online',paintNetwork);
  window.addEventListener('offline',paintNetwork);
  paintNetwork();
  if(!('serviceWorker' in navigator)) return;
  const hadController=!!navigator.serviceWorker.controller;
  let controllerReloaded=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!hadController || controllerReloaded) return;
    controllerReloaded=true;
    try {
      const key='life_sw_reload_6_3_2';
      if(sessionStorage.getItem(key)==='1') return;
      sessionStorage.setItem(key,'1');
    } catch(e) {}
    location.reload();
  });
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./service-worker.js',{scope:'./'}).then(reg=>{
      reg.update().catch(()=>{});
      window.LIFE_SERVICE_WORKER=reg;
    }).catch(err=>console.warn('LIFE PWA: service worker indisponível',err));
  });
})();
