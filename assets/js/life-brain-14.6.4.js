/* LIFE OS 14.6.3 · Motor contextual local.
 * Não usa rede, não salva dados, não toma ações e não deduz características pessoais.
 * Apenas usa dados que o app incluiu explicitamente no contexto.
 */
(function(root){
  'use strict';
  const text=(x,max=100)=>String(x == null?'':x).replace(/\s+/g,' ').trim().slice(0,max);
  const arr=x=>Array.isArray(x)?x:[];
  // Imported/local records can be incomplete. Ignore damaged rows rather than
  // allowing one malformed item to break the PRO Home during rendering.
  const records=x=>arr(x).filter(v=>v && typeof v==='object' && !Array.isArray(v));
  const duration=v=>{
    if(v===null||v===undefined||String(v).trim()==='')return null;
    const n=Number(v);
    return Number.isFinite(n)&&n>=1&&n<=480?n:null;
  };
  const validProfile=p=>p && ['Estudos','Fitness','Finanças','Rotina'].includes(p.priority)&&['Falta de foco','Pouco tempo','Não sei por onde começar','Manter consistência'].includes(p.barrier)&&[10,20,30].includes(Number(p.minutes));
  const countMatches=(items,pattern)=>records(items).filter(x=>pattern.test(text(x.text||x.title||x.category||'',120))).length;
  const safeDate=(s)=>{if(!s)return null;const d=new Date(s);return Number.isFinite(d.getTime())?d:null};
  const pastDue=(date,now,rawNow)=>{
    if(typeof date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(date)){
      const d=safeDate(date);
      if(!d||d.toISOString().slice(0,10)!==date)return false;
      const today=typeof rawNow==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(rawNow)?rawNow:
        [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
      return date<today;
    }
    const d=safeDate(date);return !!d && d.getTime()<now.getTime();
  };
  const labelPriority={Estudos:'Estudos',Fitness:'Fitness',Finanças:'Finanças',Rotina:'Tarefas'};
  function analyze(args){
    args=args||{};
    const ctx=args.context||{};
    const profile=validProfile(args.profile)?args.profile:null;
    const tasks=records(ctx.tasks).filter(t=>text(t.text||t.title));
    const study=ctx.study_plan&&typeof ctx.study_plan==='object'&&!Array.isArray(ctx.study_plan)?ctx.study_plan:null;
    const projects=records(ctx.projects),goals=records(ctx.goals&&ctx.goals.items);
    const workouts=records(ctx.plans&&ctx.plans.customWorkouts);
    const meals=records(ctx.plans&&ctx.plans.mealPlans);
    const pantry=arr(ctx.food_system&&ctx.food_system.pantry).filter(x=>typeof x==='string'||(x&&typeof x==='object'));
    const events=records(ctx.events);
    const results=[];
    const add=(v)=>{if(v&&v.title&&!results.some(x=>x.id===v.id))results.push(v)};
    if(profile){
      const target=labelPriority[profile.priority];
      const match=profile.priority==='Rotina'?tasks.length:countMatches(tasks,new RegExp(profile.priority==='Finanças'?'finan|conta|gasto|orça|pag':profile.priority==='Fitness'?'treino|fitness|academia|movimento':'estudo|prova|enem|aula|revis','i'));
      const lead=profile.barrier==='Falta de foco'?'Proteja um bloco sem distrações.':profile.barrier==='Pouco tempo'?'Use um bloco curto e viável.':profile.barrier==='Não sei por onde começar'?'Escolha uma primeira ação pequena.':'Repita uma ação que caiba na sua rotina.';
      add({id:'direction',title:'Seu primeiro passo em '+profile.priority,description:lead+' Você escolheu '+profile.minutes+' minutos para começar.',route:target,cta:'Abrir '+(target==='Tarefas'?'planejamento':target),evidence:['Sua escolha: '+profile.priority,'Dificuldade informada: '+profile.barrier,match?match+' tarefa(s) relacionada(s) registrada(s)':'Sem tarefa diretamente relacionada registrada'],priority:100,source:'respostas'});
    }
    const now=safeDate(args.now)||new Date();
    const late=tasks.filter(t=>pastDue(t.dueAt,now,args.now));
    if(late.length){
      add({id:'pending',title:'Revisar tarefas com prazo passado',description:'Há '+late.length+' tarefa(s) com prazo anterior a hoje. Confirme o que ainda é relevante antes de reorganizar.',route:'Tarefas',cta:'Revisar tarefas',evidence:['Prazos registrados em Tarefas'],priority:profile?.priority==='Rotina'?92:78,source:'tarefas'});
    }else if(tasks.length){
      add({id:'next-task',title:'Transformar pendências em uma próxima ação',description:'Existem '+tasks.length+' tarefa(s) aberta(s). Comece por uma que combine com seu tempo disponível.',route:'Tarefas',cta:'Ver tarefas',evidence:['Lista de tarefas em aberto'],priority:profile?.priority==='Rotina'?90:58,source:'tarefas'});
    }
    if(study&&study.nextStage&&text(study.nextStage.title)){
      const linked=countMatches(tasks,/estudo|prova|enem|aula|revis|simulad/i);
      add({id:'study',title:'Continuar sua trilha de estudos',description:'Próxima etapa: '+text(study.nextStage.title,100)+(linked?' · '+linked+' tarefa(s) de estudo podem apoiar a etapa.':''),route:'Estudos',cta:'Abrir trilha',evidence:['Plano de estudo salvo'+(study.topic?' · '+text(study.topic,55):''),...(linked?['Tarefas relacionadas a estudo']:[])],priority:profile?.priority==='Estudos'?96:67,source:'estudos'});
    }
    if(projects.length){
      const project=projects.find(p=>p.next)||projects[0];
      const linked=tasks.filter(t=>t.projectId&&String(t.projectId)===String(project.id));
      if(project.next||linked.length) add({id:'project',title:'Conectar projeto e execução',description:project.next?'Próxima etapa registrada: '+text(project.next,100):'Há '+linked.length+' tarefa(s) vinculada(s) a um projeto ativo.',route:'Tarefas',cta:'Abrir planejamento',evidence:['Projeto: '+text(project.title,70),...(linked.length?['Tarefas vinculadas ao projeto']:[])],priority:62,source:'projetos'});
    }
    if(workouts.length){
      add({id:'fitness',title:'Retomar um treino salvo',description:'Você já tem '+workouts.length+' treino(s) personalizado(s) registrado(s). Confira sua disponibilidade antes de escolher a próxima sessão.',route:'Fitness',cta:'Abrir meus treinos',evidence:['Treino salvo: '+text(workouts[0].name,65)],priority:profile?.priority==='Fitness'?94:56,source:'fitness'});
    }
    if(pantry.length){
      add({id:'kitchen',title:'Conectar sua cozinha às receitas',description:'Há '+pantry.length+' ingrediente(s) na despensa. Consulte as receitas e confira o que falta, sem montar dieta restritiva.',route:'Receitas',cta:'Abrir receitas',evidence:['Minha Cozinha / despensa cadastrada'],priority:45,source:'alimentação'});
    }
    if(ctx.finance && typeof ctx.finance==='object' && !Array.isArray(ctx.finance) && (records(ctx.finance.recent).length||Number(ctx.finance.entries)>0||Number(ctx.finance.expenses)>0||Number(ctx.finance.balance)!==0&&Number.isFinite(Number(ctx.finance.balance)))){
      add({id:'finance',title:'Revisar registros financeiros',description:'Organize as entradas e saídas já registradas antes de escolher uma próxima meta.',route:'Finanças',cta:'Abrir Finanças',evidence:['Finanças incluídas com sua permissão'],priority:profile?.priority==='Finanças'?90:40,source:'finanças'});
    }
    if(events.length&&tasks.length){
      add({id:'agenda',title:'Conectar agenda e tarefas',description:'Há '+events.length+' compromisso(s) e '+tasks.length+' tarefa(s) no contexto. Revise horários antes de criar novos blocos.',route:'Tarefas',cta:'Conferir agenda',evidence:['Agenda registrada','Tarefas em aberto'],priority:profile?.barrier==='Pouco tempo'?88:52,source:'agenda'});
    }
    if(meals.length){
      add({id:'mealplan',title:'Retomar suas escolhas de alimentação',description:'Existem '+meals.length+' planejamento(s) de refeições salvo(s). Consulte seus dados antes de preparar novas opções.',route:'Receitas',cta:'Consultar alimentação',evidence:['Planejamentos alimentares já registrados'],priority:profile?.connection==='Alimentação'?84:44,source:'alimentação'});
    }
    if(ctx.study_mastery && records(ctx.study_mastery.reviews).length){
      add({id:'reviews',title:'Ligar revisões à sua trilha',description:'Há '+records(ctx.study_mastery.reviews).length+' revisão(ões) registrada(s). Confira o que já foi estudado antes de avançar.',route:'Estudos',cta:'Abrir revisões',evidence:['Histórico de revisões nos Estudos'],priority:profile?.priority==='Estudos'?88:53,source:'estudos'});
    }
    if(!results.length){
      add({id:'start',title:'Começar com uma prioridade',description:'Ainda não há dados suficientes para cruzar áreas. Responda às perguntas do PRO ou registre uma tarefa para receber sugestões melhores.',route:'Tarefas',cta:'Registrar uma tarefa',evidence:['Poucos registros disponíveis'],priority:20,source:'limites'});
    }
    if(profile && profile.connection && profile.connection!=='Deixar o LIFE sugerir'){
      const preferred=profile.connection==='Agenda e tarefas'?'Tarefas':profile.connection==='Alimentação'?'Receitas':profile.connection;
      results.forEach(s=>{if(s.route===preferred && s.id!=='direction'){
        s.priority+=13;s.evidence.push('Área que você escolheu conectar: '+profile.connection);
      }});
    }
    results.sort((a,b)=>b.priority-a.priority);
    const knownDurations=tasks.map(t=>duration(t.duration)).filter(n=>n!==null);
    const totalMinutes=knownDurations.reduce((sum,n)=>sum+n,0);
    const blockMinutes=profile?Number(profile.minutes):null;
    // This is a scheduling simulation, never a prediction of completion.
    const projection=profile && totalMinutes ? {
      available:true,
      taskCount:knownDurations.length,
      unestimatedTasks:tasks.length-knownDurations.length,
      estimatedMinutes:Math.round(totalMinutes),
      minutesPerBlock:blockMinutes,
      blocks:Math.ceil(totalMinutes/blockMinutes),
      basis:'Duração informada nas tarefas + tempo escolhido no perfil PRO',
      disclaimer:'Simulação de tempo, não previsão de conclusão. Não inclui imprevistos, descansos ou compromissos.'
    } : {
      available:false,
      missing:!profile?'Responda às perguntas do PRO para informar seu tempo disponível.':'Defina a duração de ao menos uma tarefa aberta para calcular uma estimativa.',
      disclaimer:'Sem durações reais registradas, o LIFE não inventa projeções.'
    };
    return {
      version:'14.6.4',
      profileUsed:!!profile,
      answerStyle:profile?profile.style||'Passo a passo':'Passo a passo',
      sourceAreas:Array.from(new Set(results.map(x=>x.source))),
      suggestions:results.slice(0,5),
      projection,
      questions:profile?[]:['Qual área é mais importante para você agora?','O que mais dificulta começar?','Quanto tempo gostaria de dedicar a um primeiro passo?'],
      coverage:{tasks:tasks.length,events:events.length,projects:projects.length,goals:goals.length,workouts:workouts.length,mealPlans:meals.length,pantry:pantry.length,financeAllowed:!!ctx.finance},
      note:'Regras locais baseadas em respostas e dados disponíveis. Não são uma avaliação psicológica, previsão ou decisão automática.'
    };
  }
  function answer(prompt,analysis){
    const p=text(prompt,500).toLocaleLowerCase('pt-BR');
    const wantsProjection=/(proje[cç][aã]o|estimativa|quantos dias|quanto tempo|previs[aã]o|simula[cç][aã]o|simular blocos)/i.test(p);
    if(!wantsProjection && !/(conect|interlig|cruz|prioridade|prioriz|por onde come|o que fa[cç]o|recomend|suger|entend|meu contexto|meus dados|planeje minha|vis[aã]o geral|resumo inteligent|me conhec)/i.test(p))return null;
    const a=analysis&&arr(analysis.suggestions).length?analysis:analyze({});
    const list=a.suggestions.slice(0,3);
    const lines=list.map((s,i)=>(i+1)+'. '+s.title+': '+s.description+' (Base: '+s.evidence.join('; ')+')');
    const intro=a.profileUsed?'Usei suas respostas e os registros disponíveis.':'Ainda não tenho suas respostas de personalização; usei apenas os dados permitidos.';
    const body=a.answerStyle==='Direto ao ponto'?lines.slice(0,2):lines;
    const projectionText=wantsProjection && a.projection ? (a.projection.available
      ? 'Simulação com as tarefas que têm duração registrada: '+a.projection.estimatedMinutes+' minutos em '+a.projection.blocks+' bloco(s) de até '+a.projection.minutesPerBlock+' minutos. '+(a.projection.unestimatedTasks?'Há '+a.projection.unestimatedTasks+' tarefa(s) sem duração fora desta conta. ':'')+a.projection.disclaimer
      : a.projection.missing+' '+a.projection.disclaimer) : '';
    return {text:intro+'\n\n'+(projectionText?projectionText+'\n\n':'')+body.join('\n')+'\n\nSão sugestões, não mudanças automáticas. Você pode abrir a área indicada e confirmar qualquer alteração.',action:list[0]&&list[0].route?{type:'navigate',target:list[0].route,label:list[0].cta,go:list[0].route}:null,kind:'local-brain'};
  }
  root.LifeBrain1463=Object.freeze({analyze,answer});
})(typeof window==='object'?window:globalThis);
