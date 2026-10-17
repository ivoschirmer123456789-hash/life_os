/* LIFE OS 12.2 — shared, testable form-generator rules. Pure functions, no network. */
(function(root,factory){
  var api=factory(); if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.LifeGeneratorRules122=api;
})(typeof globalThis!=='undefined'?globalThis:undefined,function(){
  'use strict';
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const groups={
    'Full Body':['Pernas','Peito','Costas','Ombros','Abdômen'],
    'Upper':['Peito','Costas','Ombros','Bíceps','Tríceps'],
    'Lower':['Pernas','Posterior','Glúteos','Panturrilha','Abdômen'],
    'Push':['Peito','Peito','Ombros','Tríceps'],
    'Pull':['Costas','Costas','Bíceps','Antebraço'],
    'Legs':['Pernas','Posterior','Glúteos','Panturrilha','Abdômen'],
    'Braços + core':['Bíceps','Tríceps','Ombros','Abdômen']
  };
  function weeklyFoci(days,split,hybrid){
    if(hybrid){return days===3?['Full Body A','Cardio leve + mobilidade','Full Body B']:
      days===4?['Full Body A','Cardio leve','Full Body B','Cardio leve + mobilidade']:
      days===5?['Full Body A','Cardio leve','Full Body B','Cardio leve + mobilidade','Full Body C']:
      ['Full Body A','Cardio leve','Full Body B','Mobilidade','Full Body C','Cardio leve'];}
    if(days===2)return ['Full Body A','Full Body B'];
    if(days===3)return norm(split).includes('push')?['Push','Pull','Legs']:['Full Body A','Full Body B','Full Body C'];
    if(days===4)return ['Upper A','Lower A','Upper B','Lower B'];
    if(days===5)return norm(split).includes('bracos')?['Upper A','Lower A','Braços + core','Upper B','Lower B']:['Push','Pull','Legs','Upper','Lower'];
    return ['Push A','Pull A','Legs A','Push B','Pull B','Legs B'];
  }
  function groupOfFocus(focus){let key=Object.keys(groups).find(k=>focus.startsWith(k));return groups[key]||groups['Full Body'];}
  function picks(focus,library,groupOf,dayIndex,count){
    const wants=groupOfFocus(focus); let used=new Set(),out=[];
    wants.forEach((g,i)=>{
      const possible=(library||[]).filter(e=>{
        const group=groupOf(e);return group===g || (g==='Pernas'&&['Pernas','Quadríceps'].includes(group)) || (g==='Posterior'&&group==='Pernas') || (g==='Glúteos'&&group==='Pernas') || (g==='Abdômen'&&group==='Core');
      }).filter(e=>e&&e.name&&!used.has(e.name));
      if(possible.length){const e=possible[(dayIndex+i)%possible.length];out.push(e);used.add(e.name);}
    });
    if(out.length<count){for(let j=0;j<wants.length&&out.length<count;j++){
      const p=(library||[]).filter(e=>e&&e.name&&!used.has(e.name)&&(
        wants.includes(groupOf(e)) || (wants.includes('Pernas')&&['Quadríceps','Pernas'].includes(groupOf(e)))
      )); if(p.length){const e=p[(dayIndex+j)%p.length];out.push(e);used.add(e.name);}
    }}
    return out.slice(0,count);
  }
  function makeWeeklyPlan(days,goal,level,split,hybrid,library,daySets,dayNames,groupOf){
    const n=Math.min(6,Math.max(2,Number(days)||3)), selected=(daySets[n]||[1,3,5]).slice();
    const foci=weeklyFoci(n,split,hybrid);
    return dayNames.map((dayName,i)=>{
      const active=selected.includes(i+1),ord=selected.indexOf(i+1),focus=active?foci[ord]:'Descanso / recuperação';
      const cardio=/cardio|mobilidade/i.test(focus)&&!focus.startsWith('Full Body');
      const list=active&&!cardio?picks(focus,library,groupOf,ord,level==='Iniciante'?4:5):[];
      const exercises=cardio?[{name:focus.includes('mobilidade')?'Caminhada ou pedal leve + mobilidade confortável':'Caminhada, pedal ou corrida confortável, conforme experiência',sets:1,reps:'ritmo confortável',video_id:null,video_url:null}]:list.map(e=>({name:e.name,exercise_id:e.id,sets:level==='Iniciante'?2:3,reps:goal==='Força'?'6–10':'8–12',video_id:e.video_id,video_url:e.video_url}));
      return {day:i+1,dayName,active,focus,exercises};
    });
  }
  const ALLERGENS={
    egg:['ovo','ovos','omelete','panqueca','maionese','frittata'],
    dairy:['leite','laticinio','laticinios','iogurte','queijo','requeijao','whey','manteiga'],
    gluten:['trigo','pao','massa','macarrao','aveia','cuscuz','farinha','wrap','sanduiche'],
    nuts:['amendoim','castanha','nozes','noz','amendoas','amendoa','pasta de amendoim'],
    fish:['peixe','atum','salmao','tilapia','sardinha','frutos do mar'],
    soy:['soja','tofu','shoyu'],
    meat:['carne','frango','peixe','atum','salmao','peru','bovina']
  };
  const mealEntries=[
    {type:'breakfast',text:'Fruta com tapioca e pasta de grão-de-bico',ingredients:['fruta','tapioca','grão-de-bico'],quick:true},
    {type:'breakfast',text:'Fruta, aveia certificada quando adequada e bebida vegetal',ingredients:['fruta','aveia','bebida vegetal'],quick:true},
    {type:'breakfast',text:'Pão com ovo e tomate + fruta',ingredients:['pão','ovo','tomate','fruta'],quick:true},
    {type:'breakfast',text:'Iogurte com fruta e aveia',ingredients:['iogurte','fruta','aveia'],quick:true},
    {type:'breakfast',text:'Tapioca com frango desfiado e fruta',ingredients:['tapioca','frango','fruta'],quick:false},
    {type:'snack',text:'Fruta com um complemento habitual compatível',ingredients:['fruta'],quick:true},
    {type:'snack',text:'Tapioca com pasta de grão-de-bico',ingredients:['tapioca','grão-de-bico'],quick:true},
    {type:'snack',text:'Iogurte e fruta',ingredients:['iogurte','fruta'],quick:true},
    {type:'snack',text:'Pão com queijo e tomate',ingredients:['pão','queijo','tomate'],quick:true},
    {type:'lunch',text:'Arroz, feijão, legumes e salada',ingredients:['arroz','feijão','legumes','salada'],quick:true},
    {type:'lunch',text:'Batata, lentilha e vegetais',ingredients:['batata','lentilha','vegetais'],quick:true},
    {type:'lunch',text:'Arroz, feijão, frango e vegetais',ingredients:['arroz','feijão','frango','vegetais'],quick:true},
    {type:'lunch',text:'Arroz, lentilha e ovo com legumes',ingredients:['arroz','lentilha','ovo','legumes'],quick:true},
    {type:'lunch',text:'Massa com atum e vegetais',ingredients:['massa','atum','vegetais'],quick:false},
    {type:'dinner',text:'Sopa de lentilha, legumes e batata',ingredients:['lentilha','legumes','batata'],quick:true},
    {type:'dinner',text:'Arroz, feijão e legumes variados',ingredients:['arroz','feijão','legumes'],quick:true},
    {type:'dinner',text:'Omelete com vegetais e arroz',ingredients:['ovo','vegetais','arroz'],quick:true},
    {type:'dinner',text:'Frango com batata e legumes',ingredients:['frango','batata','legumes'],quick:false},
    {type:'dinner',text:'Pão com queijo, tomate e fruta',ingredients:['pão','queijo','tomate','fruta'],quick:true}
  ];
  function forbidden(answers){
    const intolerances=Array.isArray(answers.intolerances)?answers.intolerances:[];
    const style=norm(answers.style||answers.preference||'');
    const out=[];
    if(intolerances.includes('Ovo'))out.push('egg');
    if(intolerances.includes('Lactose')||style.includes('sem lactose'))out.push('dairy'); // conservative: no dairy instead of uncertain lactose-free labels
    if(intolerances.includes('Glúten por diagnóstico/orientação'))out.push('gluten');
    if(intolerances.includes('Amendoim / castanhas'))out.push('nuts');
    if(style.includes('vegan'))out.push('egg','dairy','meat');
    if(style.includes('vegetariana')||style.includes('pescetariana'))out.push('meat');
    if(style.includes('pescetariana'))out.splice(out.indexOf('meat'),1,'meat-land');
    const avoid=String(answers.avoid||'').split(',').map(s=>norm(s)).filter(x=>x.length>1);
    return {categories:[...new Set(out)],avoid};
  }
  function matches(ingredient,ban){
    const token=norm(ingredient);
    return ban.categories.some(c=>{
      const rx=c==='meat-land'?['carne','frango','peru','bovina']:ALLERGENS[c]||[];
      return rx.some(word=>norm(word)===token || token.includes(norm(word)) || norm(word).includes(token) && token.length>3);
    })||ban.avoid.some(v=>token===v || token.includes(v) || v.includes(token)&&token.length>3);
  }
  function buildNutrition(a){
    const restrictions=forbidden(a),serious=String(a.medical||'Não')!=='Não',unknown=(Array.isArray(a.intolerances)&&a.intolerances.includes('Outra'))||!!String(a.intoleranceOther||'').trim();
    const blocked=serious||unknown;
    const quick=['Quase nunca','Só coisas muito rápidas','Até 10 min','Até 20 min'].some(x=>x===a.cook||x===a.time);
    const meals=String(a.meals||a.routine||'');
    const five=/2 lanches|5 ou|3 \+ lanches/i.test(meals), four=/1 lanche|4 refeições/.test(meals);
    const blocks= five?[['MANHÃ','Café da manhã','breakfast'],['INTERVALO','Lanche','snack'],['ALMOÇO','Refeição principal','lunch'],['TARDE','Lanche','snack'],['NOITE','Jantar','dinner']]:four?[['MANHÃ','Café da manhã','breakfast'],['ALMOÇO','Refeição principal','lunch'],['TARDE','Lanche','snack'],['NOITE','Jantar','dinner']]:[['BLOCO 1','Primeira refeição','breakfast'],['BLOCO 2','Refeição principal','lunch'],['BLOCO 3','Última refeição','dinner']];
    const used=new Set(),shopping=new Set();
    const items=blocks.map((b,i)=>{
      if(blocked)return {k:b[0],t:b[1],d:'Escolha uma refeição já considerada segura para você segundo a orientação apropriada. O LIFE organiza a rotina, mas não faz substituições para alergias ou condições médicas.'};
      const choices=mealEntries.filter(e=>e.type===b[2]&&e.ingredients.every(x=>!matches(x,restrictions)));
      const fresh=choices.filter(e=>!used.has(e.text)),pool=fresh.length?fresh:choices;
      if(!pool.length)return {k:b[0],t:b[1],d:'Escolha uma refeição já conhecida e compatível com suas preferências e restrições. Não há combinação verificada suficiente para sugerir um prato.'};
      const budgetTight=a.budget==='Quero economizar bastante';
      // Rank compatible food by preparation constraints and ingredient reuse.
      // Never trade away medical or preference exclusions to improve score.
      const entry=pool.slice().sort((x,y)=>{
        const rank=e=>(quick&&!e.quick?-20:0)+(budgetTight?e.ingredients.filter(z=>shopping.has(z)).length*3-e.ingredients.length:0);
        return rank(y)-rank(x);
      })[0];used.add(entry.text);entry.ingredients.forEach(x=>shopping.add(x));
      const extra=a.hunger==='Pouca fome de manhã'&&i===0?' Ajuste o tamanho conforme seu apetite e conforto.':a.hunger==='Mais fome no fim do dia'&&i===blocks.length-1?' Mantenha uma refeição completa e confortável.':'';
      return {k:b[0],t:b[1],d:entry.text+'. Adapte ao que você já conhece e tolera; confira rótulos quando houver restrições.'+extra};
    });
    return {items,shopping:blocked?[]:[...shopping],blocked,restrictions:restrictions.categories,requiresReview:unknown};
  }
  function studyFrequency(value){return /todos os dias/i.test(String(value||''))?7:Math.max(1,Math.min(7,Number(String(value||'3').match(/\d+/)?.[0])||3));}
  function studyTimeline(stages,estimated,daysPerWeek,weeks,hasDeadline){
    const demand=estimated.reduce((n,x)=>n+x,0),capacity=daysPerWeek*weeks;
    const recommendedWeeks=Math.max(weeks,Math.ceil(demand/daysPerWeek));
    let elapsed=0;
    const timeline=stages.map((stage,i)=>{
      const sessions=estimated[i]||1,startWeek=Math.floor(elapsed/daysPerWeek)+1;
      elapsed+=sessions;
      const endWeek=Math.ceil(elapsed/daysPerWeek);
      return {title:stage,when:hasDeadline?(endWeek>startWeek?`SEMANAS ${startWeek}–${endWeek}`:`SEMANA ${startWeek}`):`ETAPA ${i+1}`,estimatedSessions:sessions,startWeek,endWeek};
    });
    const warning=hasDeadline&&demand>capacity?`O prazo informado (${weeks} semanas, ${capacity} sessões disponíveis) não comporta as ${demand} sessões estimadas. Proposta viável: aproximadamente ${recommendedWeeks} semanas, mantendo as pausas e revisões.`:'';
    return {timeline,demand,capacity,recommendedWeeks,warning};
  }
  // LIFE OS 15.5: deterministic, testable strength prescription. No remote AI or
  // automatic load increases. The caller supplies *already equipment/safety-filtered* movements.
  function movementPattern(ex){
    const n=norm(ex&&ex.name||ex),g=norm(ex&&ex.muscle_group||'');
    if(/prancha|dead bug|bird dog|abdominal|core|farmer walk/.test(n))return 'core';
    if(/panturr|soleo/.test(n))return 'calf';
    if(/agach|leg press|afundo|passada|avan[cç]|step.up|extensora|hack squat|wall sit/.test(n))return 'squat';
    if(/terra|romeno|stiff|flexora|nordic|nordica|good morning|eleva[cç][aã]o pelv|ponte de glut|hip thrust/.test(n))return 'hinge';
    if(/puxada|pulldown|barra fixa|pull.up/.test(n))return 'vertical-pull';
    if(/remada|rowing/.test(n))return 'horizontal-pull';
    if(/desenvolvimento|shoulder press|overhead press|landmine press/.test(n))return 'vertical-push';
    if(/supino|flexao de brac|chest press|press de peito|paralela/.test(n))return 'horizontal-push';
    if(/crucifixo inverso/.test(n))return 'shoulder-isolation';
    if(/crucifixo|crossover|peck deck/.test(n))return 'chest-isolation';
    if(/lateral|frontal|posterior|face pull|raise|rotacao externa/.test(n))return 'shoulder-isolation';
    if(/rosca|biceps/.test(n)||g.includes('biceps'))return 'biceps-isolation';
    if(/triceps/.test(n)||g.includes('triceps'))return 'triceps-isolation';
    return g||'other';
  }
  function selectSmartMoves(allowed,groups,count,opts={}){
    const groupOf=typeof opts.groupOf==='function'?opts.groupOf:e=>e.muscle_group;
    const belongs=typeof opts.belongs==='function'?opts.belongs:(ex,g)=>groupOf(ex)===g;
    const usedWeek=opts.usedWeek||{};
    const chosen=[],chosenNames=new Set(),patterns={};
    const level=norm(opts.experience),style=norm(opts.style);
    const target=(Array.isArray(groups)?groups:[]).filter(Boolean);
    if(!target.length || !Number.isFinite(Number(count)) || count<=0)return [];
    // A single exercise per requested group before supplementary patterns.
    const order=[...target];while(order.length<count)order.push(...target);
    for(const g of order.slice(0,Math.max(count,target.length))){
      if(chosen.length>=count)break;
      const pool=(Array.isArray(allowed)?allowed:[]).filter(ex=>ex&&ex.name&&!chosenNames.has(norm(ex.name))&&belongs(ex,g));
      if(!pool.length)continue;
      const score=ex=>{
        const name=norm(ex.name),pat=movementPattern(ex),eq=norm(ex.equipment);
        const repeated=Number(usedWeek[name]||0),samePattern=Number(patterns[pat]||0);
        const complex=/explosiv|sissy|nordic|nordica|good morning|pendlay|meadows|levantamento terra sumo|archer|rack pull/.test(name);
        const simple=/flexao de bracos|agachamento livre|agachamento goblet|puxada frente|remada baixa|supino reto|dead bug|prancha|leg press|remada unilateral|elevacao lateral/.test(name);
        let n=20 - repeated*10 - samePattern*13 - (complex && (level.includes('iniciante')||level.includes('retorno'))?35:0);
        n+=simple?5:0;
        if(style.includes('maquina'))n+=/maquina|polia/.test(eq+' '+name)?3:0;
        if(style.includes('pesos livres'))n+=/halter|barra/.test(eq)?3:0;
        // Stable tie-breaker, varies between sessions without random choices.
        n+=((Number(opts.offset)||0)+pool.indexOf(ex)*7)%13/100;
        return n;
      };
      const chosenEx=pool.slice().sort((a,b)=>score(b)-score(a)||norm(a.name).localeCompare(norm(b.name)))[0];
      chosen.push(chosenEx.name);
      const key=norm(chosenEx.name),pattern=movementPattern(chosenEx);
      chosenNames.add(key);patterns[pattern]=(patterns[pattern]||0)+1;
      usedWeek[key]=(usedWeek[key]||0)+1;
    }
    return chosen;
  }
  function strengthPrescription(weeks,library,opts={}){
    const rows=Array.isArray(weeks)?weeks:[];
    const lookup=new Map((Array.isArray(library)?library:[]).filter(e=>e&&e.name).map(e=>[norm(e.name),e]));
    const level=norm(opts.experience),age=Number(opts.age)||0;
    const cautious=level.includes('iniciante')||level.includes('retorno')||opts.recoveryLow||age>0&&age<18;
    const maxDirect=cautious?8:level.includes('avancado')?12:10;
    const volume={},breakdown=[];
    const recentByExercise=new Map();
    (Array.isArray(opts.history)?opts.history:[]).slice(-1200).forEach(row=>{
      const name=norm(row?.exercise);
      if(name && Number.isFinite(Number(row?.reps)) && Number(row.reps)>0)recentByExercise.set(name,row);
    });
    const adapted=rows.map(day=>{
      if(day.sessionType==='cardio'||day.sessionType==='mobility')return day;
      const moves=Array.isArray(day.moves)?day.moves:[];
      const prescription=moves.map((name,index)=>{
        const ex=lookup.get(norm(name))||{name,muscle_group:'Outros'};
        const group=norm(ex.muscle_group)||'outros';
        const pattern=movementPattern(ex);
        const accessory=/isolation|calf|core|biceps|triceps/.test(pattern);
        const ceiling=cautious?2:(accessory?2:3);
        // Total direct sets are capped by primary catalog group; secondary muscle
        // contribution is not mistaken for precisely measured training volume.
        const free=Math.max(0,maxDirect-(volume[group]||0));
        const sets=Math.max(1,Math.min(ceiling,free));
        volume[group]=(volume[group]||0)+sets;
        let reps= accessory?'10–15':opts.goal==='Força e técnica'?'6–10':'8–12';
        if(cautious)reps=accessory?'10–15':'8–12';
        const rest=accessory?60:(opts.goal==='Força e técnica'&&!cautious?120:90);
        const recent=recentByExercise.get(norm(name));
        const lastLogged=recent ? {reps:Number(recent.reps),loadKg:Number.isFinite(Number(recent.loadKg)) && recent.loadKg!==null ? Number(recent.loadKg):null,date:String(recent.date||'')} : null;
        const evidence=lastLogged ? `Registro anterior: ${lastLogged.reps} repetições${lastLogged.loadKg!==null?' com '+lastLogged.loadKg+' kg':''}. Mantenha a técnica e avalie o conforto antes de progredir.` : 'Sem série anterior registrada. Comece observando técnica e sensação de esforço.';
        const purposes={
          'squat':'Padrão de joelho e estabilidade das pernas.',
          'hinge':'Controle do quadril e cadeia posterior.',
          'horizontal-push':'Empurrar na horizontal com técnica.',
          'vertical-push':'Empurrar acima da linha do ombro com controle.',
          'horizontal-pull':'Puxar na horizontal e estabilizar as escápulas.',
          'vertical-pull':'Puxar na vertical com postura controlada.',
          'chest-isolation':'Complemento de peitoral.',
          'shoulder-isolation':'Controle dos ombros e estabilidade.',
          'biceps-isolation':'Complemento de flexão dos braços.',
          'triceps-isolation':'Complemento de extensão dos braços.',
          'core':'Controle e estabilidade do tronco.',
          'calf':'Movimento de panturrilhas.'
        };
        const row={move:name,sets,reps,rest,pattern,group:ex.muscle_group||'Outros',lastLogged,purpose:purposes[pattern]||'Complemento do grupo muscular selecionado.',
          instruction:opts.needsReview?'Você registrou desconforto ou necessidade de revisão: reavalie técnica e dificuldade antes de prosseguir.':evidence};
        breakdown.push({group:row.group,pattern,sets,day:day.k||day.t});
        return row;
      });
      return {...day,prescription};
    });
    const notes=[];
    if(cautious)notes.push('Volume inicial moderado para facilitar aprendizado, recuperação e consistência.');
    if(Object.values(volume).some(n=>n>maxDirect))notes.push('Parte do volume direto ficou acima da referência conservadora; revise com profissional antes de aumentar.');
    return {items:adapted,volume,breakdown,notes};
  }
  function fourWeekProgression(opts={}){
    const isYouth=Number(opts.age)>0&&Number(opts.age)<18;
    const recoveryLow=!!opts.recoveryLow;
    const lastFeedback=String(opts.lastFeedback||'');
    const needsReview=/preciso reduzir|t[eé]cnica a revisar/i.test(lastFeedback);
    return {
      title:'Progressão orientada — 4 semanas',
      automaticLoadIncrease:false,
      weeks:[
        {week:1,title:'Aprender e registrar',action:'Teste movimentos leves, registre repetições e anote como ficou a técnica. Pare diante de dor.'},
        {week:2,title:'Consolidar',action:'Se as sessões foram confortáveis, mantenha a carga e melhore a execução ou as repetições dentro da faixa proposta.'},
        {week:3,title:'Reavaliar o esforço',action:(isYouth||recoveryLow||needsReview)?'Priorize movimentos seguros e recuperação; peça ajuda para revisar técnica antes de mudar a dificuldade.':'Apenas com técnica consistente e boa recuperação, avalie com orientação se faz sentido uma pequena progressão, sem treinar até a falha.'},
        {week:4,title:'Revisar e ajustar',action:'Confira regularidade, técnica e recuperação. Se estiver cansado, simplifique a sessão; não aumente volume automaticamente.'}
      ],
      nextQuestion:needsReview?'Qual exercício exigiu revisão de técnica ou redução de esforço?':'Como foram a técnica, o conforto e a recuperação nesta semana?',
      note:'Guia educativo, não uma prescrição médica. Ajustes dependem do registro e, quando necessário, da orientação de um profissional.'
    };
  }
  // LIFE 15.6 — Shared, deterministic diagnostics for the other LIFE areas.
  // Analyses are read-only and never invent measurements, deadlines or results.
  const validDate=(value)=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||'').slice(0,10));if(!m)return null;const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));return d.toISOString().slice(0,10)===m[0]?m[0]:null;};
  function recipeMatch(recipes,pantry,prefs={}){
    const ingrNames=(Array.isArray(pantry)?pantry:[]).map(x=>norm(typeof x==='string'?x:x?.name)).filter(x=>x.length>1);
    const style=norm(prefs.style),intolerances=norm(prefs.intolerances),avoid=norm(prefs.avoid);
    const bans=[];
    if(/vegan/.test(style))bans.push('egg','dairy','meat');
    else if(/vegetarian/.test(style))bans.push('meat');
    if(/lactose|leite/.test(intolerances))bans.push('dairy');
    if(/gluten|trigo|celiac/.test(intolerances))bans.push('gluten');
    if(/ovo/.test(intolerances))bans.push('egg');
    if(/amendoim|castanh|nozes/.test(intolerances))bans.push('nuts');
    if(/peixe|pescado|frutos do mar/.test(intolerances))bans.push('fish');
    if(/soja/.test(intolerances))bans.push('soy');
    const custom=avoid.split(/[,;\n]/).map(x=>norm(x)).filter(x=>x.length>1);
    // A recognized allergen does not make other, unknown restrictions safe.
    // For example: 'ovo, kiwi' must NOT silently filter only egg and label the recipe compatible.
    const knownAllergens=/(lactose|leite|laticinios?|proteina do leite|gluten|trigo|celiac[ao]|ovo(?:s)?|amendoim|castanhas?|noz(?:es)?|peixe|pescado|frutos do mar|soja)/g;
    const normalizedRestrictions=/^(nao|nenhuma|nenhum|sem restric(?:ao|oes)|n\/?a|nao tenho)$/i.test(intolerances)?'':intolerances;
    const leftovers=normalizedRestrictions.replace(knownAllergens,' ')
      .replace(/\b(alergias?|intolerancias?|alergia|intolerancia|restric(?:ao|oes)|alimentares?|a|ao|as|aos|de|do|da|e|ou|sem|com|por|diagnostico|orientacao|medica|medico|suspeita|proteina)\b/g,' ')
      .replace(/[,;\/()\s-]+/g,'').trim();
    const uncertain=Boolean(leftovers)||Boolean(normalizedRestrictions&&!bans.length);
    if(uncertain)return {recipes:[],excluded:Array.isArray(recipes)?recipes.length:0,uncertain:true,note:'Uma ou mais restrições informadas não foram reconhecidas com segurança. Nenhuma receita foi classificada como compatível; confirme ingredientes e orientações individualmente.'};
    let excluded=0;
    const ranked=[];
    for(const recipe of (Array.isArray(recipes)?recipes:[])){
      if(!recipe||!Array.isArray(recipe.ingredients)||!recipe.title)continue;
      const ingredients=recipe.ingredients.map(norm);
      const forbiddenItem=ingredients.some(x=>{
        const symbols=Array.from(new Set(bans));
        return symbols.some(b=>(ALLERGENS[b]||[]).some(word=>x.includes(norm(word))))||custom.some(word=>x.includes(word));
      });
      if(forbiddenItem){excluded++;continue;}
      const hits=ingredients.filter(x=>ingrNames.some(p=>x===p||(p.length>3&&x.includes(p))||(x.length>3&&p.includes(x)))).length;
      const total=Math.max(1,ingredients.length);
      ranked.push({...recipe,_hits:hits,_total:total,_coverage:Math.round(hits/total*100)});
    }
    ranked.sort((a,b)=>b._coverage-a._coverage||b._hits-a._hits||String(a.title).localeCompare(String(b.title)));
    return {recipes:ranked,excluded,uncertain,note:uncertain?'Há uma restrição informada sem correspondência confiável no catálogo. Confira todos os ingredientes antes de preparar.':bans.length||custom.length?'Receitas foram filtradas por ingredientes identificáveis. Confira rótulos e possíveis contatos cruzados; nenhuma sugestão é certificada como livre de alérgenos.':'Compatibilidade mede somente ingredientes cadastrados, não quantidades nem segurança alimentar.'};
  }
  function nutritionReview(answers={},plan={}){
    const warnings=[];
    if(plan.blocked){warnings.push('Há restrição de saúde não verificada. Organize os horários com refeições previamente consideradas seguras e confirme escolhas com profissional habilitado.');}
    const bans=forbidden(answers);
    const rows=Array.isArray(plan.items)?plan.items:[];
    let unknown=0,flagged=0;
    for(const row of rows){
      const desc=String(row?.d||'');
      const entry=mealEntries.find(e=>e.text===desc);
      if(entry&&entry.ingredients.some(x=>matches(x,bans)))flagged++;
      if(!entry&&!plan.blocked&&/Escolha uma refeição já conhecida/.test(desc))unknown++;
    }
    if(flagged)warnings.push('Alguma opção selecionada pode contrariar uma restrição informada. Confira ingredientes e não utilize a sugestão sem revisão.');
    if(unknown)warnings.push(`${unknown} bloco(s) sem combinação verificada. O LIFE não inventou substituições nem ingredientes.`);
    if(bans.categories.length)warnings.push('Restrições exigem conferir rótulos, preparo e possível contato cruzado; este catálogo não certifica ausência de alérgenos.');
    if(answers.budget==='Quero economizar bastante')warnings.push('Para economizar, reúna ingredientes repetidos na lista de compras e compare preços locais antes de comprar.');
    return {warnings,flagged,unmatched:unknown,verifiedMeals:rows.length-unknown-flagged,automaticMedicalAdvice:false};
  }
  function planDay(input={}){
    const minutes=Math.min(480,Math.max(15,Math.round(Number(input.minutes)||60)));
    const energy=String(input.energy||'Normal');
    const priority=String(input.must||'').trim().slice(0,180);
    const items=[],warnings=[];let used=0,skipped=0;const priorityKey=priority.toLocaleLowerCase('pt-BR');
    const seen=new Set();
    const tasks=(Array.isArray(input.tasks)?input.tasks:[]).filter(t=>t&&typeof t==='object'&&!t.done&&!t.completed&&!t.waiting);
    const priorityTask=priority?tasks.find(t=>String(t.text||t.title||'').trim().toLocaleLowerCase('pt-BR')===priorityKey):null;
    if(priority){
      const declared=Number(priorityTask?.duration);
      const hasDuration=priorityTask&&Number.isFinite(declared)&&declared>=5&&declared<=480;
      const reserve=hasDuration?Math.ceil(declared):15;
      if(reserve<=minutes){items.push({taskId:priorityTask?.id||null,title:priority,duration:reserve,kind:'Prioridade',estimated:!hasDuration});used+=reserve;}
      else{skipped++;warnings.push('A tarefa prioritária exige '+reserve+' min, mas foram informados apenas '+minutes+' min disponíveis. Ela não foi reduzida automaticamente.');}
    }
    const scored=tasks.map((task,i)=>({task,i,score:typeof input.scorer==='function'?Number(input.scorer(task))||0:0}));
    scored.sort((a,b)=>b.score-a.score||a.i-b.i);
    for(const {task} of scored){
      const title=String(task.text||task.title||'').trim();if(!title||title.toLocaleLowerCase('pt-BR')===priorityKey)continue;
      const id=String(task.id||title).trim();if(seen.has(id))continue;seen.add(id);
      const exact=Number(task.duration);const known=Number.isFinite(exact)&&exact>=5&&exact<=480;
      const duration=known?Math.ceil(exact):30;
      // We do not silently shorten a declared duration; low-energy users get fewer tasks.
      if((energy==='Baixa'&&duration>45)||used+duration>minutes||items.length>=5){skipped++;continue;}
      items.push({taskId:task.id||null,title:title.slice(0,180),duration,kind:task.category||'Tarefa',estimated:!known});used+=duration;
    }
    if(items.some(x=>x.estimated&&x.kind==='Prioridade'))warnings.push('A prioridade sem duração registrada recebeu uma estimativa provisória de 15 min. Confira antes de aplicar.');
    if(items.some(x=>x.estimated&&x.kind!=='Prioridade'))warnings.push('Tarefas sem duração informada receberam uma estimativa provisória de 30 min. Confira antes de aplicar.');
    if(skipped)warnings.push(`${skipped} tarefa(s) não entraram por limite de tempo, energia ou quantidade de blocos.`);
    if(!items.length)warnings.push('Nenhuma tarefa compatível encontrada. Ajuste o tempo ou informe uma prioridade.');
    return {items,minutes,used,remaining:minutes-used,skipped,warnings,unchanged:true};
  }
  function financeReview(rows,period){
    const month=/^\d{4}-(0[1-9]|1[0-2])$/.test(String(period||''))?period:null;
    const transactions=Array.isArray(rows)?rows:[];
    let income=0,expense=0,unusable=0;const categories={},seen=new Set();let duplicates=0,validRows=0;
    for(const x of transactions){
      if(!x||typeof x!=='object')continue;
      const date=validDate(x.date);if(!date||!month||date.slice(0,7)!==month)continue;
      const value=Number(x.value),type=x.type;
      if(!Number.isFinite(value)||value<=0||(type!=='Entrada'&&type!=='Saída')){unusable++;continue;}
      // Malformed rows must never reserve an ID and hide the valid entry behind them.
      const id=String(x.id||'');if(id){if(seen.has(id)){duplicates++;continue;}seen.add(id);}
      validRows++;if(type==='Entrada')income+=value;
      else{expense+=value;const c=String(x.category||'Sem categoria').trim().slice(0,50)||'Sem categoria';categories[c]=(categories[c]||0)+value;}
    }
    const ranked=Object.entries(categories).sort((a,b)=>b[1]-a[1]).map(([category,total])=>({category,total,share:expense?Math.round(total/expense*100):0}));
    const coverage=validRows===0?'Sem movimentações válidas no mês selecionado.':'Análise feita com '+validRows+' movimentação(ões) válida(s), sem estimativas de receitas futuras.';
    const next=validRows===0?'Registre entradas e saídas com data e categoria para obter um resumo.':expense>income?'Confira quais despesas são recorrentes ou ajustáveis antes de estabelecer uma meta.':ranked.length?'Revise a categoria '+ranked[0].category+' e confirme se os valores estão corretos.':'Revise os lançamentos antes de planejar a próxima etapa.';
    return {income,expense,balance:income-expense,validRows,unusable,duplicates,ranked,coverage,next,onlyRecorded:true};
  }
  function studyReview(plan){
    const seenStages=new Set();
    const timeline=(Array.isArray(plan?.timeline)?plan.timeline:[]).filter(x=>{
      if(!x||typeof x!=='object'||!String(x.title||'').trim())return false;
      const key=String(x.index??'');if(!key||seenStages.has(key))return false;seenStages.add(key);return true;
    });
    // Historical plans store IDs as either numbers or strings.
    const done=new Set((Array.isArray(plan?.completedStages)?plan.completedStages:[]).map(String));
    const next=timeline.find(x=>!done.has(String(x.index)));const finished=timeline.filter(x=>done.has(String(x.index))).length;
    const baseline=String(plan?.answers?.baseline||'');
    const blocker=String(plan?.answers?.blocker||'');
    const action=next?`Próxima etapa: ${String(next.title).slice(0,100)}. Primeiro, tente explicar o que já sabe sem consultar; depois pratique e registre dúvidas.`:'Revise o conteúdo de etapas anteriores com exercícios novos para verificar retenção.';
    const review=baseline.includes('Errei')?'Antes de avançar, revise pré-requisitos e refaça questões que errou.':baseline.includes('Ainda não')?'Faça um teste curto sem consulta para identificar lacunas reais.':'Teste sua compreensão usando exemplos diferentes dos já vistos.';
    return {finished,total:timeline.length,nextTitle:next?.title||null,action,review,blocker,missing:!timeline.length,estimatedWeeks:Math.max(0,Number(plan?.recommendedWeeks)||0),scheduleNote:String(plan?.scheduleNote||''),noAutomaticCompletion:true};
  }
  function projectReview(project,today){
    const weeks=(Array.isArray(project?.lifeGuide?.weeks)?project.lifeGuide.weeks:[]).filter(w=>w&&Array.isArray(w.steps));
    const actions=weeks.flatMap(w=>w.steps.filter(s=>s&&typeof s==='object'&&!s.optional));
    const open=actions.filter(s=>!s.done),done=actions.length-open.length;
    const last=validDate(today)||validDate(new Date().toISOString());const end=validDate(project?.lifeGuide?.endDate||project?.deadline);
    const late=Boolean(end&&last&&end<last&&open.length);
    const next=open[0]?.text||'Revisar aprendizados e escolher um próximo projeto.';
    return {done,total:actions.length,remaining:open.length,late,deadline:end,next,needsReview:late||!weeks.length,notice:!weeks.length?'Projeto sem cronograma válido. Revise as etapas antes de continuar.':late?'O prazo cadastrado passou e ainda há etapas abertas. Revise o calendário; nada foi alterado.':'O progresso é calculado apenas pelas tarefas obrigatórias realmente marcadas.'};
  }
  function notesReview(notes){
    const seen=new Set();let duplicates=0,empty=0;
    const rows=Array.isArray(notes)?notes:[];
    for(const note of rows){const content=String(typeof note==='string'?note:note?.text||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('pt-BR');
      if(!content){empty++;continue;}if(seen.has(content))duplicates++;else seen.add(content);
    }
    return {total:rows.length,distinct:seen.size,duplicates,empty,
      action:duplicates?`Existem ${duplicates} anotação(ões) com texto repetido. Confira antes de combinar ou excluir; nada será alterado.`:!rows.length?'Registre uma ideia com contexto e a próxima ação, se houver.':'Ao revisar, identifique quais anotações exigem uma ação e quais servem como referência.',
      automaticDeletion:false};
  }
  function sleepReview({quality,goalHours,enabled}={}){
    const q=String(quality||'Não informado');const hours=Number(goalHours);
    return {quality:q,goal:enabled&&Number.isFinite(hours)&&hours>=6&&hours<=12?hours:null,
      action:q==='Ruim'?'Registre horários e fatores que dificultaram o descanso antes de alterar sua rotina.':q==='Ok'?'Observe a regularidade dos horários e a disposição durante o dia.':'Mantenha hábitos que estejam funcionando e revise quando sua rotina mudar.',
      caution:'A qualidade é autorrelatada; o LIFE não mede sono nem diagnostica distúrbios.'};
  }

  return {weeklyFoci,makeWeeklyPlan,studyFrequency,studyTimeline,buildNutrition,forbidden,mealEntries,movementPattern,selectSmartMoves,strengthPrescription,fourWeekProgression,recipeMatch,nutritionReview,planDay,financeReview,studyReview,projectReview,notesReview,sleepReview};
});
