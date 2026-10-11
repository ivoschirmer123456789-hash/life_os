'use strict';
const assert=require('node:assert/strict');
const Q=require('./assets/js/life-quality-12.4.js');
let checks=0;
const t=(name,fn)=>{fn();checks++;process.stdout.write('  ✓ '+name+'\n');};
const now=new Date(2026,9,12,7,45).getTime();
const tasks=[
 {id:'a',text:'Revisar biologia',category:'Estudos',priority:'Alta',duration:30},
 {id:'b',text:'Organizar documentos',category:'Organização',priority:'Normal',duration:45},
 {id:'c',text:'Registrar despesas',category:'Finanças',priority:'Normal',duration:20},
 {id:'d',text:'Atividade concluída',done:true,priority:'Alta',duration:30},
 {id:'e',text:'Uma tarefa em espera',waiting:true,priority:'Alta'}
];
const events=[{id:'evt1',date:'2026-10-12',t:'13:00',n:'Aula',m:'Compromisso · 60 min'}];
const base={tasks,events,startDate:'2026-10-12',days:'uteis',period:'tarde',minutesPerDay:90,now};
const P=()=>Q.buildWeek(base);
t('proposta de semana válida com tarefas reais',()=>{const p=P();assert.equal(p.ok,true);assert.ok(p.items.length>0);});
t('sessão respeita compromissos na agenda',()=>{const p=P();assert.ok(p.items.filter(x=>x.date==='2026-10-12').every(x=>x.start>=14*60));});
t('nunca marca tarefa concluída/espera',()=>{const p=P();assert.ok(!p.items.some(x=>['d','e'].includes(x.taskId)));});
t('nunca agenda a mesma tarefa duas vezes',()=>{const p=P();assert.equal(new Set(p.items.map(x=>x.taskId)).size,p.items.length);});
t('respeita duração e teto de minutos diário',()=>{const p=P();const m={};p.items.forEach(x=>m[x.date]=(m[x.date]||0)+x.minutes);assert.ok(Object.values(m).every(n=>n<=90));});
t('proposta pode ser aplicada ao estado atual',()=>{const p=P();assert.equal(Q.validateWeek(p.items,events,now).ok,true);});
t('bloqueia duplicações por tarefa anteriormente agendada',()=>{const p=P();const x=p.items[0];const booked=[...events,{date:x.date,t:`${String(Math.floor(x.start/60)).padStart(2,'0')}:${String(x.start%60).padStart(2,'0')}`,m:'30 min',linkedTaskId:x.taskId}];assert.equal(Q.validateWeek(p.items,booked,now).ok,false);});
t('bloqueia proposta no passado',()=>{const p=P();assert.equal(Q.validateWeek(p.items,events,new Date(2026,9,18).getTime()).ok,false);});
t('valida dias e períodos inválidos',()=>{assert.equal(Q.buildWeek({...base,days:'tudo'}).ok,false);assert.equal(Q.buildWeek({...base,period:'madrugada'}).ok,false);});
t('rejeita data anterior e datas inexistentes',()=>{assert.equal(Q.buildWeek({...base,startDate:'2026-10-10'}).ok,false);assert.equal(Q.buildWeek({...base,startDate:'2026-02-31'}).ok,false);});
t('seleção de dias úteis exclui final de semana',()=>{const p=Q.buildWeek({...base,tasks:Array.from({length:30},(_,i)=>({id:'t'+i,text:'Tarefa '+i,duration:30})),days:'uteis',minutesPerDay:180});assert.ok(p.items.every(x=>![0,6].includes(new Date(x.date+'T12:00:00').getDay())));});
t('opção todos os dias pode incluir fim de semana',()=>{const p=Q.buildWeek({...base,tasks:Array.from({length:40},(_,i)=>({id:'t'+i,text:'Tarefa '+i,duration:60})),events:[],days:'todos',minutesPerDay:180});assert.ok(p.items.some(x=>[0,6].includes(new Date(x.date+'T12:00:00').getDay())));});
t('se a tarefa já tem um horário, não duplica',()=>{const p=Q.buildWeek({...base,events:[...events,{date:'2026-10-13',t:'13:30',m:'Tarefa · 45 min',linkedTaskId:'a'}]});assert.ok(!p.items.some(x=>x.taskId==='a'));});
t('tarefas sem caber são visíveis em skipped',()=>{const p=Q.buildWeek({...base,days:'uteis',period:'manha',minutesPerDay:30,tasks:Array.from({length:30},(_,i)=>({id:''+i,text:'Item '+i,duration:45}))});assert.equal(p.items.length+p.skipped.length,30);});
t('tarefas atrasadas ainda podem ser reagendadas',()=>{const p=Q.buildWeek({...base,tasks:[{id:'overdue',text:'Tarefa antiga',dueAt:'2026-10-01T12:00:00',duration:30}],events:[]});assert.equal(p.items.length,1);});
t('sem tarefas não cria eventos fictícios',()=>{const p=Q.buildWeek({...base,tasks:[]});assert.equal(p.items.length,0);});
t('importação de backup local correto',()=>{assert.equal(Q.validateBackup({version:3,updatedAt:new Date(now).toISOString(),data:{lifeos_v5_tasks:'[]',l49_notes:'[]'}}).ok,true);});
t('backup rejeita campos perigosos',()=>{assert.equal(Q.validateBackup({version:3,updatedAt:new Date().toISOString(),data:{'__proto__':'oops','constructor':'oops'}}).ok,false);});
t('backup rejeita objetos aninhados no lugar de strings',()=>{assert.equal(Q.validateBackup({version:3,updatedAt:new Date().toISOString(),data:{lifeos_v5_tasks:{foo:'bar'}}}).ok,false);});
t('backup rejeita entradas vazias e metadata incompleta',()=>{assert.equal(Q.validateBackup({version:3,updatedAt:new Date().toISOString(),data:{}}).ok,false);assert.equal(Q.validateBackup({data:{lifeos_v5_tasks:'[]'}}).ok,false);});
t('backup rejeita dados excessivamente grandes',()=>{assert.equal(Q.validateBackup({version:3,updatedAt:new Date().toISOString(),data:{lifeos_v5_tasks:'x'.repeat(1600000)}}).ok,false);});
t('CSV conserva caracteres Unicode',()=>{const csv=Q.exportTasks([{text:'Revisão – química',done:false}]);assert.ok(csv.includes('Revisão – química'));});
t('CSV neutraliza fórmulas em células',()=>{for(const v of ['=SUM(1,2)', '+cmd', '-foo', '@test','\t=expr']){const csv=Q.exportTasks([{text:v}]);assert.ok(csv.includes(`"'${v.replace(/\r\n?/g,'\n')}"`));}});
t('CSV escapa separador e aspas',()=>{const csv=Q.exportTasks([{text:'texto; "com aspas"'}]);assert.ok(csv.includes('"texto; ""com aspas"""'));});
t('CSV exporta tarefas concluídas e pendentes',()=>{const csv=Q.exportTasks([{text:'A',done:true},{text:'B',done:false}]);assert.ok(csv.includes('Concluída')&&csv.includes('Pendente'));});
t('CSV atividades contém tipo e data',()=>{const csv=Q.exportActivity([{date:'2026-10-12',type:'ESTUDOS',go:'Estudos',title:'Matemática'}]);assert.ok(csv.includes('Matemática')&&csv.includes('ESTUDOS'));});
t('série histórica não inventa dados',()=>{const bins=Q.dailySeries([],14,now);assert.equal(bins.length,14);assert.ok(bins.every(x=>x.count===0));});
t('série histórica conta somente datas válidas e já ocorridas',()=>{const b=Q.dailySeries([{date:new Date(now-3000).toISOString()},{date:new Date(now+300000).toISOString()},{date:'data inválida'}],14,now);assert.equal(b.reduce((a,x)=>a+x.count,0),1);});
t('série histórica tem no máximo 30 dias',()=>{assert.equal(Q.dailySeries([],100,now).length,30);});
// Deterministic scenario matrix: periods, dates, budgets, existing event combinations.
for(const days of ['uteis','todos'])for(const period of ['manha','tarde','noite'])for(const budget of [30,60,90,120,180])for(const eventCount of [0,1,4]){
 const busy=Array.from({length:eventCount},(_,i)=>({date:'2026-10-12',t:`${13+i}:00`,m:'50 min'}));
 const plan=Q.buildWeek({tasks:Array.from({length:24},(_,i)=>({id:'t'+i,text:'Tarefa '+i,duration:15+(i%5)*15,category:i%2?'Estudos':'Organização'})),events:busy,now,days,period,minutesPerDay:budget,startDate:'2026-10-12'});
 assert.equal(plan.ok,true);assert.ok(plan.items.length<=40);
 const validation=Q.validateWeek(plan.items,busy,now);
 if(plan.items.length)assert.equal(validation.ok,true,`Matriz falhou ${days}/${period}/${budget}/${eventCount}: ${validation.error}`);
 checks++;
}
console.log('PASS:',checks,'verificações de qualidade 12.4, incluindo 90 combinações de agenda.');
