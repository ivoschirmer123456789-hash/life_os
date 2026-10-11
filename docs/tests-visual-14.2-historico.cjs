"use strict";
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname;
const app=fs.readFileSync(path.join(root,'assets/js/life-app-9.4.2.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/css/life-app-14.2.css'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'CSS_BUNDLE_MANIFEST_14.2.json'),'utf8'));
let count=0;function test(name,fn){fn();count++;console.log('  ✓ '+name)}
test('navegação principal mantém botões e destinos',()=>{assert(app.includes('lifeNavItems.map((x, i) =>'));assert(app.includes('navLabel[x] || x'));assert(app.includes('onClick: () => v18Go(x)'))});
test('Home atualizada sem substituir Tarefas, Fitness ou IA',()=>{for(const c of ['life141-commandbar','life141-hero-edition','life142-orbit','life141-briefing-insight','life141-radial','life11-today-grid','life11-areas','life11-ai-banner'])assert(app.includes(c),c)});
test('botões novos têm ações reais',()=>{assert(app.includes("className:'life141-commandbar-search',onClick:()=>setSpot(true)"));assert(app.includes('setWeeklyPlannerOpen(true)'));assert(app.includes('setFocus(true)'))});
test('indicadores da Home usam dados reais',()=>{assert(app.includes('lifeTodayProgress'));assert(app.includes('lifeTodayOpen.length'));assert(app.includes('lifeCommitmentsOpen.length'));assert(app.includes('cloudStatus'))});
test('arquivo único de CSS de aplicação',()=>{const links=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)];assert.equal(links.length,1);assert(links[0][1].includes('life-app-14.2.css'))});
test('manifesto atualizado para CSS 14.2',()=>{assert.equal(manifest.app,'assets/css/life-app-14.2.css');assert.equal(manifest.version,'14.2');assert(manifest.sha256)});
test('cache e versão consistentes',()=>{assert(sw.includes('life-os-14.2-graphite-system'));assert(sw.includes('./assets/css/life-app-14.2.css'));assert(!sw.includes('./assets/css/life-app-13.2.css'));assert(html.includes('content="14.2"'))});
test('CSS preserva as áreas e inclui responsividade',()=>{for(const c of ['.life11-hero','.life-fit-focus-v913','.life-study-architect','.life-fin-command','.life13-extras','.life-premium-masthead','@media(max-width:640px)','life142-orbit','prefers-reduced-motion'])assert(css.includes(c),c)});
test('pacote não inclui CSS antigo duplicado',()=>{assert(!fs.existsSync(path.join(root,'assets/css/life-app-14.1.css')))});
console.log('PASS: '+count+' verificações visual 14.2');
