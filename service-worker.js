const LIFE_CACHE='life-os-9.1.2-fitness-nutrition-hub';
const SHELL=[
  './','./index.html','./landing.html','./privacy.html','./terms.html','./support.html','./offline.html',
  './manifest.webmanifest',
  './assets/css/life-bundle-9.1.2.css','./assets/css/signature-9.1.2.css','./assets/css/apex-9.1.2.css','./assets/css/product-core-9.1.2.css','./assets/css/design-system-9.1.2.css','./assets/css/apex-marketing-9.1.2.css','./assets/css/marketing.css','./assets/css/marketing-v60.css',
  './assets/js/config-9.1.2.js','./assets/js/product-core-9.1.2.js','./assets/js/product-spacious-9.1.2.js','./assets/js/life-app-9.1.2.js','./assets/js/context-help-9.1.2.js','./assets/js/supabase-auth-9.1.2.js','./assets/js/runtime-9.1.2.js',
  './assets/icons/icon.svg','./assets/icons/icon-192.png','./assets/icons/icon-512.png'
];
const EXTERNAL_CACHE_HOSTS=new Set(['unpkg.com','cdn.jsdelivr.net','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com']);

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(LIFE_CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('life-os-')&&k!==LIFE_CACHE).map(k=>caches.delete(k)));
    if(self.registration.navigationPreload)try{await self.registration.navigationPreload.enable()}catch(_){ }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);

  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const preload=await event.preloadResponse;
        if(preload&&preload.ok){const c=await caches.open(LIFE_CACHE);c.put(req,preload.clone()).catch(()=>{});return preload;}
        const res=await fetch(req,{cache:'no-store'});
        if(res&&res.ok){const c=await caches.open(LIFE_CACHE);c.put(req,res.clone()).catch(()=>{});}
        return res;
      }catch(_){
        const exact=await caches.match(req,{ignoreSearch:true});
        if(exact)return exact;
        const isRoot=url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');
        if(isRoot){const home=await caches.match('./index.html');if(home)return home;}
        return (await caches.match('./offline.html'))||Response.error();
      }
    })());
    return;
  }

  if(url.origin===self.location.origin){
    const isAsset=/\/assets\//.test(url.pathname);
    if(isAsset){
      // Versioned local assets: fast cache-first, quietly refreshed in the background.
      event.respondWith((async()=>{
        const cache=await caches.open(LIFE_CACHE);
        const cached=await cache.match(req,{ignoreSearch:true});
        const fresh=fetch(req).then(res=>{if(res&&res.ok)cache.put(req,res.clone()).catch(()=>{});return res;}).catch(()=>null);
        return cached||(await fresh)||Response.error();
      })());
    }else{
      event.respondWith(fetch(req).then(async res=>{if(res&&res.ok){const c=await caches.open(LIFE_CACHE);c.put(req,res.clone()).catch(()=>{});}return res;}).catch(()=>caches.match(req,{ignoreSearch:true})));
    }
    return;
  }

  // Cache only known static third-party libraries/fonts. Never cache Supabase API/user data here.
  if(EXTERNAL_CACHE_HOSTS.has(url.hostname)){
    event.respondWith((async()=>{
      const cache=await caches.open(LIFE_CACHE);
      const cached=await cache.match(req);
      const fresh=fetch(req).then(res=>{if(res&&(res.ok||res.type==='opaque'))cache.put(req,res.clone()).catch(()=>{});return res;}).catch(()=>null);
      return cached||(await fresh)||Response.error();
    })());
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
