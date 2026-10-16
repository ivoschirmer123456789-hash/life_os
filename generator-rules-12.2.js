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
      const entry=(quick?pool.find(e=>e.quick):null)||pool[0];used.add(entry.text);entry.ingredients.forEach(x=>shopping.add(x));
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
  return {weeklyFoci,makeWeeklyPlan,studyFrequency,studyTimeline,buildNutrition,forbidden,mealEntries};
});
