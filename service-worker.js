const LIFE_CACHE='life-os-6.3.3';
const SHELL=[
  './','./index.html','./landing.html','./privacy.html','./terms.html','./support.html','./offline.html',
  './manifest.webmanifest',
  './assets/css/utilities.css','./assets/css/marketing.css','./assets/css/marketing-v60.css','./assets/css/life.css','./assets/css/product.css','./assets/css/final.css','./assets/css/fitness-v35.css','./assets/css/modules-v36.css','./assets/css/system-v40.css','./assets/css/system-v50.css','./assets/css/system-v60.css','./assets/css/signature-polish-v61.css','./assets/css/layout-fixes-v62.css','./assets/css/stability-fixes-v63.css',
  './assets/js/config-6.3.3.js','./assets/js/life-app-6.3.3.js','./assets/js/supabase-auth-6.3.3.js','./assets/js/quality-runtime-6.3.3.js','./assets/js/product-runtime-6.3.3.js','./assets/js/design-runtime-6.3.3.js','./assets/js/experience-v40-6.3.3.js','./assets/js/experience-v50-6.3.3.js','./assets/js/experience-v60-6.3.3.js','./assets/js/experience-v61-6.3.3.js','./assets/js/pwa-runtime-6.3.3.js',
  './assets/icons/icon.svg','./assets/icons/icon-192.png','./assets/icons/icon-512.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(LIFE_CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('life-os-')&&k!==LIFE_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{
      if(res&&res.ok){const copy=res.clone();caches.open(LIFE_CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{});} return res;
    }).catch(async()=> (await caches.match('./index.html')) || (await caches.match('./offline.html'))));
    return;
  }
  if(url.origin===self.location.origin){
    // Network-first prevents an older executable/CSS file from surviving a deploy.
    event.respondWith(fetch(req).then(res=>{
      if(res&&res.ok){const copy=res.clone();caches.open(LIFE_CACHE).then(c=>c.put(req,copy)).catch(()=>{});} return res;
    }).catch(()=>caches.match(req)));
  }
});
self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch(e){data={body:event.data?event.data.text():''}}
  const title=data.title||'LIFE';
  const options={body:data.body||data.message||'Você tem uma atualização no LIFE.',icon:'./assets/icons/icon-192.png',badge:'./assets/icons/icon-192.png',tag:data.tag||data.reminderId||'life-update',data:{url:data.url||'./',...data},renotify:false};
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=(event.notification.data&&event.notification.data.url)||'./';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){if('focus' in client){client.navigate(target).catch(()=>{});return client.focus();}}
    return clients.openWindow?clients.openWindow(target):null;
  }));
});
