const LIFE_CACHE='life-os-15.8.1-projects';
const ASSET_BUILD='15.8.1';
const SHELL=[
  './',
  './index.html',
  './landing.html',
  './privacy.html',
  './terms.html',
  './support.html',
  './offline.html',
  './manifest.webmanifest',
  './assets/css/life-app-14.3.css',
  './assets/css/power-refinement-14.4.css',
  './assets/css/mobile-repair-14.5.1.css',
  './assets/css/section-rhythm-14.5.2.css',
  './assets/css/fitness-content-14.5.4.css',
  './assets/css/content-repair-14.5.5.css',
  './assets/css/aurora-day-14.5.6.css',
  './assets/css/aurora-review-14.5.7.css',
  './assets/css/free-pro-experience-14.5.8.css',
  './assets/css/free-product-grade-14.6.1.css',
  './assets/css/pro-understands-you-14.5.9.css',
  './assets/css/life-brain-14.6.3.css',
  './assets/css/life-brain-projection-14.6.4.css',
  './assets/js/life-cognitive-engine-14.7.2.js',
  './assets/js/life-logic-engine-14.8.0.js',
  './assets/js/life-intelligence-14.9.0.js',
  './assets/css/usability-14.6.5.css',
  './assets/css/smart-hub-containment-14.8.1.css',
  './assets/css/training-nutrition-visual-14.9.1.css',
  './assets/css/mobile-clarity-15.8.1.css',
  './assets/media/hero-daylight.webp',
  './assets/media/hero-mountain.webp',
  './assets/media/fitness.webp',
  './assets/media/estudos.webp',
  './assets/media/alimentacao.webp',
  './assets/media/financas.webp',
  './assets/media/sono.webp',
  './assets/media/evolucao.webp',
  './assets/media/sidebar-mountain.webp',
  './assets/media/exercicio-supino-barra-14.9.5.webp',
  './assets/media/exercicio-supino-halteres-14.9.5.webp',
  './assets/media/exercicio-crucifixo-polia-14.9.5.webp',
  './assets/media/exercicio-paralelas-14.9.5.webp',
  './assets/css/signature-9.4.2.css',
  './assets/css/visual-marketing-10.2.css',
  './assets/css/apex-marketing-9.4.2.css',
  './assets/css/marketing.css',
  './assets/css/marketing-v60.css',
  './assets/js/visual-rebuild-10.2.js',
  './assets/js/generator-rules-12.2.js',
  './assets/js/life-integrity-12.3.js',
  './assets/js/life-brain-14.6.4.js',
  './assets/js/life-quality-12.4.js',
  './assets/js/life-release-15.8.1.js',
  './assets/js/life-production-12.6.js',
  './assets/js/life-extras-13.0.js',
  './assets/js/config-15.8.1.js',
  './assets/js/product-core-9.4.2.js',
  './assets/js/product-spacious-9.4.2.js',
  './assets/js/clarity-guardrails-9.4.2.js',
  './assets/js/life-app-15.8.1.js',
  './assets/js/context-help-9.4.2.js',
  './assets/js/supabase-auth-9.4.2.js',
  './assets/js/runtime-9.4.2.js',
  './assets/js/interaction-layer-9.4.2.js',
  './assets/js/quality-guardrails-9.4.2.js',
  './assets/icons/life143-sprite.svg',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];
const EXTERNAL_CACHE_HOSTS=new Set(['unpkg.com','cdn.jsdelivr.net','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com']);

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(LIFE_CACHE);
    // Atomic install: never activate an incomplete bundle over the last working version.
    try {
      // Mirror the page's release query for CSS/JS. Avoid duplicate downloads
      // when installing the PWA just after the page has loaded them.
      const urls=SHELL.map(p=>p.startsWith('./assets/')&&/\.(css|js)$/.test(p)?p+'?v='+ASSET_BUILD:p);
      await cache.addAll(urls);
    } catch (e) {
      await caches.delete(LIFE_CACHE);
      throw e;
    }
    await self.skipWaiting();
  })());
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
        if(preload&&preload.ok)return preload;
        // Don't persist checkout query parameters or account-specific navigations.
        return await fetch(req,{cache:'no-store'});
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
      // Versioned local assets: compare full URL INCLUDING release query.
      // IMPORTANT: ignoreSearch:true previously reused obsolete workout generators after deploy.
      event.respondWith((async()=>{
        const cache=await caches.open(LIFE_CACHE);
        const cached=await cache.match(req);
        if(cached)return cached; // Immutable, versioned app shell; no duplicate background requests.
        try{
          const fresh=await fetch(req);
          if(fresh&&fresh.ok)cache.put(req,fresh.clone()).catch(()=>{});
          return fresh;
        }catch(_){return Response.error();}
      })());
    }else{
      // Non-static routes and query strings may contain private or checkout information.
      // Do not cache them, even on the same origin.
      event.respondWith(fetch(req,{cache:'no-store'}));
    }
    return;
  }

  // Cache only known static third-party libraries/fonts. Never cache Supabase API/user data here.
  if(EXTERNAL_CACHE_HOSTS.has(url.hostname)){
    event.respondWith((async()=>{
      const cache=await caches.open(LIFE_CACHE);
      const cached=await cache.match(req);
      if(cached)return cached;
      try{
        const fresh=await fetch(req);
        if(fresh&&(fresh.ok||fresh.type==='opaque'))cache.put(req,fresh.clone()).catch(()=>{});
        return fresh;
      }catch(_){return Response.error();}
    })());
  }
});

self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch(e){data={body:event.data?event.data.text():''}}
  const safe = (v,n)=>String(v||'').replace(/[\u0000-\u001f]/g,' ').slice(0,n);
  const title=safe(data.title||'LIFE',80);
  const options={body:safe(data.body||data.message||'Você tem uma atualização no LIFE.',220),icon:'./assets/icons/icon-192.png',badge:'./assets/icons/icon-192.png',tag:safe(data.tag||data.reminderId||'life-update',64),data:{url:safe(data.url||'./',350)},renotify:false};
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const rawTarget=(event.notification.data&&event.notification.data.url)||'./';
  let target='./';
  try{const next=new URL(rawTarget,self.location.href);if(next.origin===self.location.origin&&['http:','https:'].includes(next.protocol))target=next.href;}catch(_){}
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){if('focus' in client){client.navigate(target).catch(()=>{});return client.focus();}}
    return clients.openWindow?clients.openWindow(target):null;
  }));
});
