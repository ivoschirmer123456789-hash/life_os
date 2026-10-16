/* LIFE OS 14.8.0 · Logic Engine
 * Existing UI, routes and access rules remain untouched. All analysis is local,
 * read-only, explicitly scoped to the context the user has allowed.
 * Real server-side ACL, billing, remote sync and remote AI remain authoritative.
 */
(function(root){'use strict';
  const BRAIN=root.LifeBrain1463;
  if(!BRAIN || typeof BRAIN.analyze!=='function')return;
  const VERSION='14.8.0';
  const MAX=120, listeners=new Set();
  let revision=0;let lastDiagnostic=null;
  const obj=x=>!!x && typeof x==='object' && !Array.isArray(x);
  const list=x=>Array.isArray(x)?x.filter(obj).slice(0,MAX):[];
  const str=(v,max=100)=>String(v==null?'':v).replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max);
  const num=(v,lo,hi)=>v===null||v===undefined||v===''||typeof v==='boolean'?null:(Number.isFinite(Number(v))&&Number(v)>=lo&&Number(v)<=hi?Number(v):null);
  const isDone=x=>x.done===true||x.completed===true||x.isCompleted===true;
  const safeDay=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T12:00:00Z'))&&new Date(x+'T12:00:00Z').toISOString().slice(0,10)===x?x:null;
  const day=x=>{if(safeDay(x))return x; if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(x)||!safeDay(x.slice(0,10)))return null;const date=new Date(x);return Number.isFinite(+date)?[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-'):null};
  const dayDiff=(a,b)=>(Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/86400000;
  const unique=(items)=>Array.from(new Set(items));
  const sourceLabel={tasks:'Tarefas',events:'Agenda',projects:'Projetos',goals:'Metas',finance:'Finanças',plans:'Planos',study_plan:'Estudos'};
  const eventCategories={lifeos_v5_tasks:'tasks',life_tasks_v1:'tasks',l18_tasks:'tasks',lifeos_v5_projects:'projects',life_projects_v1:'projects',life_goals_v1:'goals',life_finance_transactions_v1:'finance',life_ai_workspace_v1:'plans',life_ai_actions_v1:'actions'};
  // No personal data stored. Subscribers receive just the storage key category and version.
  function notify(key){const category=eventCategories[key]||(/^life_/.test(key)||/^l18_/.test(key)?'app':'system');revision++;const event=Object.freeze({category,revision});listeners.forEach(fn=>{try{fn(event)}catch(_){}});return event}
  function subscribe(fn){if(typeof fn!=='function')return ()=>{};listeners.add(fn);return ()=>listeners.delete(fn)}
  function data(ctx){const c=obj(ctx)?ctx:{};return {tasks:list(c.tasks).filter(x=>!isDone(x)),events:list(c.events),projects:list(c.projects),goals:list(c.goals&&c.goals.items),finance:obj(c.finance)?c.finance:null,study:obj(c.study_plan)?c.study_plan:null,plans:obj(c.plans)?c.plans:null};}
  function detectConflicts(ctx,opts){const d=data(ctx),issues=[],now=day(opts&&opts.now)||day(new Date().toISOString())||'2026-01-01';
    // Only explicit, parseable dates are used; no fabricated timings.
    const deadlines=new Map();d.tasks.forEach(t=>{const due=day(t.dueAt);if(!due)return;const name=str(t.title||t.text,90);if(!name)return;
      if(!deadlines.has(due))deadlines.set(due,[]);deadlines.get(due).push(name);
      if(dayDiff(due,now)<0)issues.push({id:'late:'+str(t.id||name,90),severity:'important',area:'Tarefas',title:'Tarefa com prazo vencido',reason:'Prazo informado: '+due,evidence:['Tarefa: '+name],action:'Conferir tarefa'});
    });
    deadlines.forEach((names,at)=>{if(names.length>=3)issues.push({id:'deadlines:'+at,severity:'review',area:'Tarefas',title:'Vários prazos no mesmo dia',reason:names.length+' tarefas com prazo em '+at,evidence:names.slice(0,3),action:'Revisar prazos'})});
    // Compare events only when both full calendar date and clock are supplied.
    const slots=new Map();d.events.forEach((e,i)=>{const raw=e.startAt||e.dateTime||e.datetime||e.when||'';const date=day(raw)||day(e.date);let clock='';if(typeof raw==='string'&&/T\d{2}:\d{2}/.test(raw))clock=raw.match(/T(\d{2}:\d{2})/)[1];else if(typeof e.time==='string'&&/^\d{2}:\d{2}$/.test(e.time))clock=e.time;
      if(!date||!clock)return;const key=date+' '+clock;const arr=slots.get(key)||[];arr.push(str(e.title||e.name||'Compromisso '+(i+1),75));slots.set(key,arr);
    });slots.forEach((names,at)=>{if(names.length>1)issues.push({id:'overlap:'+at,severity:'review',area:'Tarefas',title:'Compromissos no mesmo horário',reason:'Horário registrado: '+at,evidence:names.slice(0,3),action:'Conferir agenda'})});
    const f=d.finance;if(f){const balance=num(f.balance,-1e12,1e12),expense=num(f.plannedExpenses,0,1e12),budget=num(f.budget,0,1e12);if(expense!==null&&budget!==null&&expense>budget)issues.push({id:'budget-plan',severity:'review',area:'Finanças',title:'Despesas previstas acima do orçamento informado',reason:'Diferença calculada: '+(expense-budget).toFixed(2),evidence:['Orçamento informado e despesas planejadas'],action:'Revisar Finanças'});if(balance!==null&&balance<0)issues.push({id:'negative-balance',severity:'review',area:'Finanças',title:'Saldo registrado negativo',reason:'Confira os lançamentos antes de fazer novos compromissos.',evidence:['Saldo permitido no contexto'],action:'Abrir Finanças'})}
    return issues.slice(0,12);
  }
  function plan(ctx,opts={}){const d=data(ctx),minutes=num(opts.minutes??opts.profile?.minutes,5,480);const tasks=d.tasks.filter(t=>str(t.text||t.title,100));const durations=tasks.map(t=>({id:str(t.id,70),title:str(t.text||t.title,100),minutes:num(t.duration,1,480),priority:/^(alta|high)$/i.test(str(t.priority))?3:/^(baixa|low)$/i.test(str(t.priority))?1:2,due:day(t.dueAt)}));const known=durations.filter(x=>x.minutes!==null),unknown=durations.length-known.length;const total=known.reduce((sum,x)=>sum+x.minutes,0);const ordered=[...durations].sort((a,b)=>b.priority-a.priority||((a.due||'9999')<(b.due||'9999')?-1:1));const proposal=minutes?ordered.slice(0,12).map(x=>({...x,blocks:x.minutes===null?null:Math.ceil(x.minutes/minutes)})):[];
    return {available:!!(minutes&&total),unit:'minutos',source:'durações registradas, sem estimar tarefas desconhecidas',missingDuration:unknown,knownTasks:known.length,totalMinutes:total,minutesPerBlock:minutes,scenarios:minutes&&total?[1,2,3].map(blocks=>({blocksPerDay:blocks,minDays:Math.ceil(total/(minutes*blocks)),minutesPerDay:minutes*blocks})):[],proposal,disclaimer:'Cenários matemáticos mínimos, não probabilidades nem promessa de conclusão. Não incluem pausas, imprevistos ou agenda. Nenhum dado foi alterado.'};
  }
  function evidenceQuality(ctx){const d=data(ctx);const relevant=d.tasks.length+d.events.length+d.projects.length+d.goals.length;const withDuration=d.tasks.filter(t=>num(t.duration,1,480)!==null).length;const withDates=d.tasks.filter(t=>day(t.dueAt)).length;return {level:relevant===0?'insuficiente':relevant<4?'limitado':'moderado',sources:unique(Object.keys(sourceLabel).filter(k=>Object.prototype.hasOwnProperty.call(obj(ctx)?ctx:{},k)).map(k=>sourceLabel[k])),records:relevant,taskDates:withDates,taskDurations:withDuration,limit:'Qualidade indica cobertura dos registros, não probabilidade de sucesso.'};}
  function lab(ctx,opts={}){const minutes=num(opts.minutes??opts.profile?.minutes,5,480),mode=plan(ctx,{minutes});return {baseline:mode,alternatives:mode.scenarios,unchanged:true,reason:mode.available?'Compare blocos de tempo. Os compromissos e a energia pessoal não estão modelados.':'Adicione durações e tempo disponível para comparar cenários.',executed:false};}
  // Compare revision tokens; local and remote are deliberately never silently merged.
  function syncDecision({localRevision,remoteRevision,baseRevision,localDirty=false}={}){const a=str(localRevision,120),b=str(remoteRevision,120),base=str(baseRevision,120);if(!base||!a||!b)return {status:'unknown',automatic:false,reason:'Revisões insuficientes; confirmar com o serviço remoto.'};if(a===b&&localDirty)return {status:'local-unversioned',automatic:false,reason:'Existem alterações locais não confirmadas pelo servidor.'};if(a===b)return {status:'equal',automatic:false};if(a!==base&&b!==base)return {status:'conflict',automatic:false,reason:'Alterações concorrentes; oferecer revisão ou backup, sem sobrescrever.'};if(b!==base)return {status:'remote-newer',automatic:false,reason:'Confirmar restauração antes de substituir dados locais.'};if(a!==base||localDirty)return {status:'local-newer',automatic:false,reason:'Necessário servidor autenticado e verificação de revisão.'};return {status:'unknown',automatic:false}}
  const changes=new Map();
  function safeAction(raw,{approved=false,plan='free',context={}}={}){const validator=root.LifeIntegrity123?.sanitizeAction;const action=typeof validator==='function'?validator(raw):null;if(!action)return {allowed:false,reason:'Ação não reconhecida ou inválida.'};const mutating=['add-note','add-task','add-memory','apply-day-plan','workspace-tasks'].includes(action.type);if(['add-memory','workspace-tasks','apply-day-plan'].includes(action.type)&&!['pro','owner','premium'].includes(str(plan).toLowerCase()))return {allowed:false,reason:'Função restrita ao plano PRO.',action};if(mutating&&(['add-task','workspace-tasks'].includes(action.type))){const existing=new Set(list(context.tasks).map(t=>str(t.text||t.title,150).toLocaleLowerCase('pt-BR')));const names=action.type==='add-task'?[action.text]:action.items.map(x=>x.title);if(names.some(n=>existing.has(str(n,150).toLocaleLowerCase('pt-BR'))))return {allowed:false,reason:'Tarefa já registrada. Revise antes de duplicar.',action};}
    if(mutating&&!approved)return {allowed:false,requiresConfirmation:true,reason:'Confirmação explícita obrigatória.',action};return {allowed:true,requiresConfirmation:mutating,action};}
  function recordApproved(uid,entry){const id=str(uid,120);if(!/^[a-zA-Z0-9_-]{6,120}$/.test(id)||!obj(entry)||entry.approved!==true)return false;const key='life_logic_audit_v1_'+id;try{const storage=root.localStorage;if(!storage)return false;const before=JSON.parse(storage.getItem(key)||'[]');const rows=Array.isArray(before)?before:[];rows.push({id:str(entry.id,70),type:str(entry.type,45),at:new Date().toISOString(),undone:false});storage.setItem(key,JSON.stringify(rows.slice(-50)));return true}catch(_){return false}}
  function markUndone(uid,id){const account=str(uid,120);if(!/^[a-zA-Z0-9_-]{6,120}$/.test(account))return false;try{const key='life_logic_audit_v1_'+account;const rows=JSON.parse(root.localStorage?.getItem(key)||'[]');if(!Array.isArray(rows))return false;let changed=false;const updated=rows.map(row=>{if(row&&row.id===str(id,70)&&!row.undone){changed=true;return {...row,undone:true}}return row});if(changed)root.localStorage.setItem(key,JSON.stringify(updated));return changed}catch(_){return false}}
  function diagnostics(ctx={}){const d=data(ctx),issues=[];try{if(obj(ctx)&&JSON.stringify(ctx).length>180000)issues.push({code:'large-context',message:'Contexto muito extenso para análise local completa.'});}catch(_){issues.push({code:'non-serializable',message:'Contexto não serializável; conferir a origem dos dados.'});}const ids=d.tasks.map(x=>str(x.id,70)).filter(Boolean);if(new Set(ids).size!==ids.length)issues.push({code:'duplicate-task-ids',message:'IDs de tarefas repetidos.'});const malformed=d.tasks.filter(t=>t.dueAt&&day(t.dueAt)===null).length;if(malformed)issues.push({code:'invalid-dates',message:malformed+' tarefa(s) têm prazo não reconhecido.'});const details={version:VERSION,revision,analyzedAt:new Date().toISOString(),issues,records:{tasks:d.tasks.length,events:d.events.length,projects:d.projects.length},remoteVerified:false};lastDiagnostic=details;return details;}
  let baseAnalyze=BRAIN.analyze;
  function analyze(args){args=obj(args)?args:{};const base=baseAnalyze(args);const ctx=obj(args.context)?args.context:{};const conflicts=detectConflicts(ctx,{now:args.now});const quality=evidenceQuality(ctx);const schedule=plan(ctx,{profile:args.profile||{}});const suggestions=list(base.suggestions).map(x=>({...x}));const top=conflicts.find(c=>c.severity==='important')||conflicts[0];if(top&&!suggestions.some(s=>s.id==='logic:'+top.id)){suggestions.push({id:'logic:'+top.id,title:top.title,description:top.reason,route:top.area,cta:top.action,evidence:top.evidence,priority:top.severity==='important'?95:65,source:'consistência'})}suggestions.sort((a,b)=>(num(b.priority,0,1000)||0)-(num(a.priority,0,1000)||0));return {...base,version:VERSION,suggestions:suggestions.slice(0,5),logic:{conflicts,coverage:quality,plan:schedule,scenarioLab:{baseline:schedule,alternatives:schedule.scenarios,unchanged:true,executed:false,reason:schedule.available?'Compare blocos de tempo; compromissos e pausas não estão modelados.':'Informe durações e tempo disponível.'},revision,executedActions:0,note:'Recomendações e diagnósticos locais. Nenhum plano ou registro foi alterado.'}};}
  function answer(prompt,analysis){
    const question=str(prompt,500).toLocaleLowerCase('pt-BR');
    if(/(conflito|sobreposi[cç][aã]o|compromissos no mesmo hor[aá]rio|prazo(s)? vencido(s)?)/i.test(question)){
      const issues=analysis?.logic?.conflicts||[];
      if(!issues.length)return {text:'Não identifiquei conflitos verificáveis nos registros autorizados. Horários ou datas ausentes podem impedir essa análise.',kind:'local-logic'};
      return {text:'Pontos para conferir nos registros disponíveis:\n'+issues.slice(0,4).map((x,i)=>(i+1)+'. '+x.title+' — '+x.reason).join('\n')+'\nNenhuma alteração foi realizada.',kind:'local-logic'};
    }
    return BRAIN.answer(prompt,analysis);
  }
  const enhanced=Object.freeze({...BRAIN,analyze,answer});
  root.LifeBrain1463=enhanced;root.LifeCognitiveEngine147=enhanced;
  const api=Object.freeze({version:VERSION,subscribe,notify,detectConflicts,plan,lab,syncDecision,evidenceQuality,safeAction,recordApproved,markUndone,diagnostics,analyze,day});root.LifeLogicEngine148=api;
})(typeof window==='object'?window:globalThis);

// LIFE OS 15.1 — Per-owner local recovery snapshots (not cloud synchronization).
(function(root){
 'use strict';
 const clean=(value,n=90)=>String(value==null?'':value).trim().slice(0,n);
 // Local fallback snapshots are per active LIFE data owner; never uploaded by this module.
 const tracked=new Set(['l18_projects','life_study_plan_v2','life_custom_workouts_v2','life_food_plans_v1','l18_tasks']);
 const backupKey=(key,owner)=>'life_recovery_151_'+encodeURIComponent(clean(owner,90)||'local')+'_'+key;
 const snapshots=(key,owner)=>{try{const rows=JSON.parse(root.localStorage.getItem(backupKey(key,owner))||'[]');return Array.isArray(rows)?rows:[]}catch(_){return []}};
 const record=(key,oldRaw,owner)=>{
  if(!tracked.has(key)||!oldRaw||oldRaw.length>340000)return false;
  try{
   JSON.parse(oldRaw);
   const history=snapshots(key,owner);const now=Date.now();
   if(history[0]&&now-Date.parse(history[0].at)<30000)return false;
   if(history[0]?.raw===oldRaw)return false;
   root.localStorage.setItem(backupKey(key,owner),JSON.stringify([{at:new Date().toISOString(),raw:oldRaw},...history].slice(0,3)));
   return true;
  }catch(_){return false}
 };
 const preview=(key,owner)=>snapshots(key,owner).map((x,i)=>({index:i,at:x.at,bytes:x.raw?.length||0}));
 const recover=(key,owner,index)=>{
  const entry=snapshots(key,owner)[index];
  if(!entry)return {ok:false,reason:'Nenhuma cópia local disponível.'};
  try{const data=JSON.parse(entry.raw);if(!Array.isArray(data))return {ok:false,reason:'Formato de recuperação incompatível.'};return {ok:true,data:JSON.parse(JSON.stringify(data)),at:entry.at}}
  catch(_){return {ok:false,reason:'A cópia está incompleta.'}}
 };
 root.LifeReliability151=Object.freeze({record,preview,recover,version:'15.1.0'});
})(typeof window!=='undefined'?window:globalThis);
