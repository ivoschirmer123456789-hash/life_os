'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const dir=__dirname;
const read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const html=read('index.html'),sw=read('service-worker.js'),app=read('assets/js/life-app-9.4.2.js');
const style=read('assets/css/power-refinement-14.4.css');
let n=0;const ok=(label,fn)=>{fn();console.log('PASS',++n,label)};
ok('14.4 version, original app + last-override CSS',()=>{
 assert.match(html,/life143-power life144-refined/);assert.match(html,/content="14.4"/);
 assert.match(html,/life-app-14.3\.css\?v=14\.4/);assert.match(html,/power-refinement-14\.4\.css\?v=14\.4/);
});
ok('Versioned source and repaired React loader retained',()=>{
 assert(html.includes('lifeReactReady'));assert(html.includes('generator-rules-12.2.js?v=14.4'));
 assert(html.includes('life-app-9.4.2.js?v=14.4'));
});
ok('Source contains existing navigation and actions',()=>{
 for(const text of ['lifeNavItems.map((x, i) =>','onClick: () => v18Go(x)','className:\'life143-home\'','onClick:()=>setFocus(true)','onClick:()=>v42Go(go)','addLifeTodayPlan();','setAiQuickOpen(true);','toggleLifeTask(t.id)']) assert(app.includes(text),text);
});
ok('Progress only reflects real user task data',()=>{
 for(const text of ['const life144AreaProgress','lifeTodayPlans.filter(t=>','rows.filter(taskIsDone)','lifeTodayProgress','life144-eco-track','life144-eco-stat'])assert(app.includes(text),text);
 assert(!app.includes('PROGRESSO FICTÍCIO'));
});
ok('Cinematic visual, buttons, charts, mobile and LIFE AI styles',()=>{
 for(const text of ['.life143-welcome:before','.life143-primary','.life143-ring','.life143-ecosystem-disc','.life144-eco-track','.life-ai36-top','.life-ai36-chat','.life143-ai-icon','@media(max-width:560px)','@media(prefers-reduced-motion:reduce)'])assert(style.includes(text),text);
});
ok('Explicit accessible focus styles and reduced motion',()=>{
 assert(style.includes(':focus-visible'));assert(style.includes('animation:none!important'));
});
ok('PWA cache updated + complete shell references',()=>{
 assert(sw.includes('life-os-14.4-premium-refinement'));
 for(const text of ['assets/css/power-refinement-14.4.css','assets/css/life-app-14.3.css','assets/js/generator-rules-12.2.js','assets/js/life-app-9.4.2.js','assets/icons/life143-sprite.svg'])assert(sw.includes(text),text);
});
ok('Photos are local and original full functional source remains',()=>{
 for(const img of ['hero-mountain','fitness','estudos','alimentacao','financas','sono','evolucao'])assert(fs.statSync(path.join(dir,`assets/media/${img}.webp`)).size>1000,img);
 assert(fs.statSync(path.join(dir,'assets/js/life-app-9.4.2.js')).size>1700000);
});
console.log(`PASS: ${n} checks 14.4`);
