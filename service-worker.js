const LIFE_CACHE='life-os-3.0.0';
const SHELL=[
  './','./index.html','./landing.html','./privacy.html','./terms.html','./support.html','./offline.html',
  './manifest.webmanifest','./assets/css/utilities.css','./assets/css/life.css','./assets/css/product.css',
  './assets/js/config.js','./assets/js/life-app.js','./assets/js/supabase-auth.js','./assets/js/quality-runtime.js','./assets/js/product-runtime.js','./assets/js/design-runtime.js','./assets/js/pwa-runtime.js',
  './assets/icons/icon.svg','./assets/icons/icon-192.png','./assets/icons/icon-512.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(LIFE_CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==LIFE_CACHE && /life-os|life/i.test(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(LIFE_CACHE).then(c=>c.put(req,copy));return res;}).catch(async()=> (await caches.match(req)) || (await caches.match('./offline.html'))));
    return;
  }
  if(url.origin===self.location.origin){
    event.respondWith(caches.match(req).then(cached=>cached || fetch(req).then(res=>{if(res && res.status===200){const copy=res.clone();caches.open(LIFE_CACHE).then(c=>c.put(req,copy));}return res;})));
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
