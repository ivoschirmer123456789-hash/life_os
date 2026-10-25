'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const file=(rel)=>fs.readFileSync(path.join(base,rel),'utf8');
const js=file('assets/js/life-brain-14.6.4.js');
const sandbox={}; vm.runInNewContext(js,sandbox); const Brain=sandbox.LifeBrain1463;
const checks=[]; const check=(label,fn)=>{try{fn();checks.push({label,ok:true});console.log('PASS '+label)}catch(e){console.error('FAIL '+label,e);process.exitCode=1}};
const profile={priority:'Rotina',barrier:'Pouco tempo',minutes:20};
const context={tasks:[{text:'Entregar projeto',duration:45,dueAt:'2026-10-13'},{text:'Revisar material',duration:25,dueAt:'2026-10-14'},{text:'Organizar cadernos',duration:null}],events:[{title:'Aula',time:'13:00'}]};
check('Projeção calculada somente de durações existentes',()=>{const x=Brain.analyze({profile,context,now:'2026-10-14'}).projection;assert.equal(x.available,true);assert.equal(x.taskCount,2);assert.equal(x.unestimatedTasks,1);assert.equal(x.estimatedMinutes,70);assert.equal(x.minutesPerBlock,20);assert.equal(x.blocks,4)});
check('Tarefa para o dia de hoje não é classificada como atrasada',()=>{const a=Brain.analyze({profile,context:{tasks:[{text:'Hoje',dueAt:'2026-10-14'}]},now:'2026-10-14'});assert.ok(!a.suggestions.some(x=>x.id==='pending'))});
check('Tarefa com prazo anterior é considerada atrasada',()=>{const a=Brain.analyze({context:{tasks:[{text:'Antes',dueAt:'2026-10-13'}]},now:'2026-10-14'});assert.ok(a.suggestions.some(x=>x.id==='pending'))});
check('Data impossível não é considerada atraso',()=>{const a=Brain.analyze({context:{tasks:[{text:'Inválida',dueAt:'2026-02-30'}]},now:'2026-10-14'});assert.ok(!a.suggestions.some(x=>x.id==='pending'))});
check('Sem respostas não inventa projeção',()=>{const a=Brain.analyze({context});assert.equal(a.projection.available,false);assert.equal(a.projection.minutesPerBlock,undefined)});
check('Sem durações não inventa prazo',()=>{const a=Brain.analyze({profile,context:{tasks:[{text:'Vaga'}]}});assert.equal(a.projection.available,false);assert.match(a.projection.missing,/duraç/i)});
check('Durações 0, negativas e absurdas são descartadas',()=>{const tasks=[0,-4,900,'abc','',null,5].map(n=>({text:'T',duration:n}));const a=Brain.analyze({profile,context:{tasks}});assert.equal(a.projection.taskCount,1);assert.equal(a.projection.estimatedMinutes,5)});
check('Respostas de projeção têm ressalvas',()=>{const a=Brain.analyze({profile,context});const r=Brain.answer('Faça uma projeção do tempo das minhas tarefas',a);assert.ok(/70 minutos/.test(r.text));assert.match(r.text,/não previsão/i)});
check('Projeção sem dados pede dados, sem falsa certeza',()=>{const a=Brain.analyze({profile,context:{}});const r=Brain.answer('Quantos dias falta?',a);assert.ok(r&&/Defina a duração/i.test(r.text));assert.ok(!/\d+ bloco\(s\)/.test(r.text))});
check('Projetos corrompidos não derrubam a Home',()=>{const a=Brain.analyze({context:{projects:[null,undefined,23,'invalid',{}, {id:'p',title:'Trabalho',next:'Revisar'}]}});assert.ok(a.suggestions.some(s=>s.id==='project'))});
check('Treinos corrompidos não derrubam a Home',()=>{const a=Brain.analyze({context:{plans:{customWorkouts:[null,12,{}, {name:'Treino'}]}}});assert.ok(a.suggestions.some(s=>s.id==='fitness'))});
check('Revisões malformadas não derrubam o cérebro',()=>{const a=Brain.analyze({context:{study_mastery:{reviews:[null,NaN,'x',{}]}}});assert.ok(a.suggestions.some(s=>s.id==='reviews'))});
check('Finanças vazias não fingem ter registros',()=>{const a=Brain.analyze({context:{finance:{balance:0,entries:0,expenses:0,recent:[]}}});assert.ok(!a.suggestions.some(s=>s.id==='finance'))});
check('Finanças não são consideradas sem contexto autorizado',()=>{const a=Brain.analyze({context:{tasks:[{text:'Pagar conta'}]}});assert.ok(!a.suggestions.some(s=>s.id==='finance'))});
check('Datas e contexto inválidos não quebram a análise',()=>{let a=Brain.analyze({profile,context:{tasks:[null,false,{text:'OK',dueAt:[]},{text:'Outra',dueAt:'invalid'}],projects:null,plans:0,finance:null,goals:{items:0}},now:'invalida'});assert.ok(Array.isArray(a.suggestions))});
check('Saída do motor não altera o objeto original',()=>{const before=JSON.stringify(context);Brain.analyze({profile,context});assert.equal(JSON.stringify(context),before)});
check('Projeções não são oferecidas como informação financeira ou médica',()=>{const a=Brain.analyze({profile,context});assert.ok(!/peso|dieta|renda|lucro|saúde/i.test(a.projection.disclaimer))});
// Fuzz deterministic malformed imports, in addition to specific regression cases.
check('300 combinações de dados legados não causam exceções',()=>{
 const bad=[null,undefined,0,1,'abc',false,true,[],{},[{name:'Teste'}],[null,1,'x',{}]];
 for(let i=0;i<300;i++){
  const c={tasks:bad[(i*3)%bad.length],projects:bad[(i*5+1)%bad.length],goals:{items:bad[(i*7+3)%bad.length]},plans:{customWorkouts:bad[(i*2+2)%bad.length],mealPlans:bad[(i*4+5)%bad.length]},events:bad[(i*3+7)%bad.length],food_system:{pantry:bad[(i*9)%bad.length]},study_mastery:{reviews:bad[(i*8)%bad.length]},finance:bad[(i*6)%bad.length]};
  const a=Brain.analyze({profile,context:c,now:'2026-10-14'});assert.ok(Array.isArray(a.suggestions));
 }
});
check('Chat libera estado de envio também após exceção',()=>{const a=file('assets/js/life-app-15.8.2.js');const start=a.indexOf('const submitLifeAI = async');const end=a.indexOf('const aiQuickPrompt',start);const part=a.slice(start,end);assert.ok(part.includes('} finally {\n            setAiBusy(false);'));assert.ok(part.indexOf('const deterministic =')>part.indexOf('try {'))});
check('Análise local evita segunda análise redundante durante render',()=>{const a=file('assets/js/life-app-15.8.2.js');assert.ok(a.includes('buildAIContext(false)'));assert.ok(a.includes('const buildAIContext = (includeBrain = true) => {'))});
check('Nenhuma faixa de progresso é representada como completa por padrão',()=>{const a=file('assets/js/life-app-15.8.2.js');assert.ok(!a.includes('life1464-projection-track'))});
check('Contexto remoto nunca é cortado no meio do JSON',()=>{const x=file('supabase/functions/life-ai/index.ts');assert.ok(!x.includes('JSON.stringify(parts).slice(0,10500)'));assert.ok(x.includes('JSON.stringify(bounded)'))});
check('Configuração, manifest e página usam release 15.8.2',()=>{assert.match(file('assets/js/config-15.8.2.js'),/version:'15\.8\.2'/);assert.match(file('manifest.webmanifest'),/15\.8\.2/);assert.match(file('index.html'),/name="life-build" content="15\.8\.2"/)});
check('Identidade FREE original permaneceu intacta',()=>{const css=file('assets/css/free-product-grade-14.6.1.css');assert.ok(css.length>1000);assert.ok(!file('assets/css/life-brain-projection-14.6.4.css').includes('.life-free-active'))});
console.log('\n'+checks.length+' verificações adicionais aprovadas.');
