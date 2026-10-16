/* LIFE OS 12.3 — pure validation, trends, and navigation between modules. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LifeIntegrity123 = api;
})(typeof globalThis !== 'undefined' ? globalThis : undefined, function () {
  'use strict';
  const VALID_ROUTES = new Set(['Hoje','Tarefas','Notas','Estudos','Guia de Estudos','Fitness','Dieta','Receitas','Finanças','IA','Life','Meu LIFE','Evolução','Biblioteca','Favoritos','Archive','Perfil','Configurações','Tutorial']);
  const VALID_ACTIONS = new Set(['navigate','focus','fitness-tab','add-note','add-task','add-memory','apply-day-plan','workspace-tasks','upgrade']);
  const MUTATIONS = new Set(['add-note','add-task','add-memory','apply-day-plan','workspace-tasks']);
  const safeString = (value, limit) => typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, limit) : '';
  const validIso = v => typeof v === 'string' && Number.isFinite(Date.parse(v));
  const eventDate = x => Date.parse(x && (x.date || x.createdAt || x.created_at) || '') || NaN;
  const norm = x => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const bucket = row => {
    // Classify each event once. This prevents double-counting one event in multiple areas.
    const type = norm(row && row.type);
    const go = norm(row && row.go);
    if (/finan/.test(type) || /finan/.test(go)) return 'Finanças';
    if (/fitness|treino|atividade|esporte/.test(type) || /fitness/.test(go)) return 'Fitness';
    if (/estud|revis|foco|flash/.test(type) || /estud/.test(go)) return 'Estudos';
    if (/receita|alimenta|cozinha|despensa/.test(type) || /receita|dieta/.test(go)) return 'Alimentação';
    if (/taref|nota|projeto|meta|habit|planeja|agenda|compromisso/.test(type) || /tarefa|nota|life/.test(go)) return 'Organização';
    return 'Outros';
  };
  function insights(data = {}, now = Date.now()) {
    const dateNow = Number(now);
    const nowTs = Number.isFinite(dateNow) ? dateNow : Date.now();
    const acts = (Array.isArray(data.activity) ? data.activity : []).filter(x => {
      const ts = eventDate(x);
      return Number.isFinite(ts) && ts <= nowTs + 300000 && ts >= nowTs - 365 * 86400000;
    });
    const counts = {}, areas = ['Organização','Estudos','Fitness','Alimentação','Finanças','Outros'];
    for (const name of areas) counts[name] = { current:0, previous:0, month:0 };
    for (const row of acts) {
      const age = nowTs - eventDate(row), key = bucket(row);
      if (age >= 0 && age < 7 * 86400000) counts[key].current++;
      if (age >= 7 * 86400000 && age < 14 * 86400000) counts[key].previous++;
      if (age >= 0 && age < 30 * 86400000) counts[key].month++;
    }
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const done = tasks.filter(t => !!(t.done ?? t.completed)).length;
    const workouts = Array.isArray(data.sets) ? data.sets : [];
    const trainingDays = new Set(workouts.filter(x => validIso(x.date)).map(x => String(x.date).slice(0,10)));
    const studyPlan = data.studyPlan && typeof data.studyPlan === 'object' ? data.studyPlan : null;
    const stages = Array.isArray(studyPlan?.timeline) ? studyPlan.timeline : [];
    const completed = Array.isArray(studyPlan?.completedStages) ? studyPlan.completedStages : [];
    const studyProgress = stages.length ? Math.min(100,Math.round(100*completed.length/stages.length)) : null;
    const total7 = areas.reduce((sum,k)=>sum+counts[k].current,0), prev7=areas.reduce((sum,k)=>sum+counts[k].previous,0);
    const direction = prev7 === 0 ? 'sem-base' : total7 > prev7 ? 'mais-registros' : total7 < prev7 ? 'menos-registros' : 'estável';
    const next = [];
    if (tasks.some(t=>!(t.done ?? t.completed))) next.push({area:'Tarefas',title:'Revise suas prioridades em aberto',note:'Tarefas pendentes registradas'});
    if (studyProgress !== null && studyProgress < 100) next.push({area:'Estudos',title:'Continue sua trilha de estudos',note:studyProgress+'% das etapas concluídas'});
    if (workouts.length) next.push({area:'Fitness',title:'Confira seu histórico de séries',note:trainingDays.size+' dias com registros de séries'});
    if (counts.Finanças.month) next.push({area:'Finanças',title:'Revise suas movimentações',note:counts.Finanças.month+' registros no período de 30 dias'});
    return {counts, total7, prev7, direction, tasks:{total:tasks.length,done,pending:tasks.length-done}, studyProgress, trainingDays:trainingDays.size, next:next.slice(0,3), source:'registros locais do LIFE', limited:acts.length<5};
  }
  function sanitizeAction(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const type=safeString(raw.type,40);
    if (!VALID_ACTIONS.has(type)) return null;
    const label=safeString(raw.label,120)||'Ação LIFE AI';
    if (type === 'navigate') {
      if (!VALID_ROUTES.has(raw.target)) return null;
      return {type,label,target:raw.target,go:raw.target};
    }
    if (type === 'upgrade') return {type,label,source:'ai_pro'};
    if (type === 'focus') return {type,label,labelText:safeString(raw.labelText,120)||'Sessão de foco'};
    if (type === 'fitness-tab') {
      const tabs=new Set(['Hoje','Treinos','Exercícios','Alimentação','Evolução']);
      return {type,label,tab:tabs.has(raw.tab)?raw.tab:'Exercícios',group:safeString(raw.group,60),query:safeString(raw.query,80)};
    }
    if (['add-task','add-note','add-memory'].includes(type)) {
      const text=safeString(raw.text,type==='add-memory'?160:350);
      if (!text || text.length<2) return null;
      return {type,label,text,go:type==='add-task'?'Tarefas':type==='add-note'?'Notas':'IA'};
    }
    if (['workspace-tasks','apply-day-plan'].includes(type)) {
      if (!Array.isArray(raw.items) || !raw.items.length || raw.items.length>10) return null;
      const items=raw.items.map(item=>{
        const title=safeString(item && (item.title || item.text),160);
        const duration=Number(item?.duration);
        if (title.length < 2 || !Number.isFinite(duration) && type==='apply-day-plan') return null;
        return {title, duration:type==='apply-day-plan'?Math.min(120,Math.max(10,Math.round(duration))):30,kind:safeString(item?.kind,40)||'Planejamento',taskId:safeString(item?.taskId,100)||null};
      });
      if (items.some(x=>!x)) return null;
      return {type,label,items,go:type==='workspace-tasks'?'Tarefas':'Life'};
    }
    return null;
  }
  function localCommand(prompt) {
    const p=safeString(prompt,420);
    const task=/^(?:crie|criar|adicione|adicionar|inclua|incluir)\s+(?:uma?\s+)?tarefa\s*[:\-–]\s*(.{2,350})$/i.exec(p);
    if (task) return sanitizeAction({type:'add-task',text:task[1],label:'Criar tarefa sugerida'});
    const note=/^(?:anote|anotar|salve|salvar)\s+(?:uma?\s+)?nota\s*[:\-–]\s*(.{2,350})$/i.exec(p);
    if (note) return sanitizeAction({type:'add-note',text:note[1],label:'Salvar anotação sugerida'});
    return null;
  }
  function syncDecision({remoteRevision='', lastSynced='', dirtyAt='', remoteHasData=false}={}) {
    const remote=String(remoteRevision||''), synced=String(lastSynced||'');
    const changed = remote !== synced && !!remoteHasData;
    const localDirty = !!dirtyAt && (!lastSynced || (Date.parse(dirtyAt)||0) > (Date.parse(lastSynced)||0));
    if (changed && localDirty) return 'conflict';
    if (changed) return 'restore';
    return 'push';
  }
  function validCheckoutUrl(raw) {
    try {
      const u=new URL(raw);
      const h=u.hostname.toLowerCase();
      return u.protocol==='https:' && !u.username && !u.password && [
        'mercadopago.com.br','mercadopago.com','mercadopago.com.ar','mercadopago.com.mx',
        'mercadopago.cl','mercadopago.com.co','mercadopago.com.pe','mercadopago.com.uy','mercadopago.com.ve','mpago.la'
      ].some(domain=>h===domain||h.endsWith('.'+domain));
    } catch {return false;}
  }
  function planAccess(row={}, now=Date.now()) {
    const role=String(row.plan||'FREE').toUpperCase();
    const status=String(row.subscription_status||'').toLowerCase();
    if(role==='OWNER')return 'OWNER';
    if(role!=='PRO')return 'FREE';
    const exp=row.pro_until?Date.parse(row.pro_until):Infinity;
    return (!row.pro_until || (Number.isFinite(exp)&&exp>now))&&!['expired','refunded','revoked','cancelled','canceled','chargeback','suspended','paused','disputed'].includes(status)?'PRO':'FREE';
  }
  return Object.freeze({ insights,sanitizeAction,localCommand,syncDecision,planAccess,validCheckoutUrl,MUTATIONS,VALID_ROUTES });
});
