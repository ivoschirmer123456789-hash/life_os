'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'assets/js/life-app-15.4.7.js'),'utf8');
const section=js.slice(js.indexOf('const LIFE_PLAN_VISUALS_V149 ='),js.indexOf('const lifeIsSimpleGreeting ='));
let pass=0;
const check=(name,fn)=>{fn();console.log('PASS',name);pass++};
const ctx={window:{},React:{Fragment:Symbol('Fragment'),createElement:(tag,props,...children)=>({tag,props:props||{},children:children.flat(Infinity).filter(x=>x!==false&&x!=null)})},
 IRON_EXERCISE_LIBRARY:[{id:1,name:'Supino reto com barra',muscle_group:'Peito',video_id:'rT7DgCr-3pg',equipment:'Barra e banco'},{id:2,name:'Remada unilateral com halter',muscle_group:'Costas',video_id:null},{id:3,name:'Agachamento livre',muscle_group:'Pernas',video_id:'ultWZbUMPL8'}],
 lifeNormalizeText:x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),
 lifeExtractMuscleTargets:s=>[],lifeExerciseGroup:ex=>ex.muscle_group,lifeExerciseMeta:ex=>({equipment:ex.equipment||'Equipamento variável'}),
 lifeExerciseVideoInfo:ex=>({id:ex.video_id||'rT7DgCr-3pg',exact:!!ex.video_id}),LIFE_MOVEMENT_VIDEO_RULES:[],lifeExerciseArt:ex=>'data:image/svg+xml,test',lifeExerciseCover:ex=>'https://i.ytimg.com/vi/test/hqdefault.jpg'};
let opened=[];ctx.window.open=(...args)=>opened.push(args);
vm.runInNewContext(section+`\nwindow.api={find:lifePlanMatchExerciseV1493,resolve:lifeResolveWorkoutExercise,card:lifeRenderWorkoutExerciseCards,open:lifePlanOpenVideoV1493,search:lifePlanVideoSearchV1493};`,ctx);
const api=ctx.window.api;
const flatten=t=>!t||typeof t!=='object'?[]:[t,...(t.children||[]).flatMap(flatten)];
const word=t=>!t?'':typeof t==='object'?(t.children||[]).map(word).join(''):String(t);
let detail=[];
check('nome exato liga a exercício exato',()=>assert.equal(api.find('Supino reto com barra').exact,true));
check('abre opção de vídeo exato dentro do LIFE',()=>{const t=api.card({k:'SEG',t:'Peito',moves:['Supino reto com barra']},x=>detail.push(x));flatten(t).find(e=>e.tag==='button'&&word(e)==='ABRIR PASTA DO VÍDEO').props.onClick();assert.equal(detail.at(-1).name,'Supino reto com barra')});
check('thumbnail exata é rotulada demonstração',()=>assert(flatten(api.card({moves:['Supino reto com barra']})).some(x=>x.tag==='span'&&word(x)==='DEMONSTRAÇÃO')));
check('referência de movimento não se apresenta como exata',()=>{const t=api.card({moves:['Remada unilateral com halter']});assert(flatten(t).some(x=>x.tag==='span'&&word(x)==='PASTA COM VÍDEO'))});
check('nome genérico mostra padrão como referência, não identidade exata',()=>{const t=api.card({moves:['Supino']});assert(flatten(t).some(x=>x.tag==='span'&&word(x)==='PASTA COM VÍDEO'))});
check('variação diferente não sofre associação enganosa',()=>assert.equal(api.find('Supino inclinado no smith'),null));
check('qualquer movimento desconhecido abre busca explícita de vídeo',()=>{const t=api.card({moves:['Movimento especial sem referência']});flatten(t).find(x=>x.tag==='button'&&word(x)==='ENCONTRAR VÍDEO').props.onClick();assert(opened.at(-1)[0].includes('youtube.com/results?search_query='))});
check('card mantém séries e descanso do plano',()=>{const t=api.card({moves:['Supino reto com barra'],prescription:[{sets:2,reps:'10–12',rest:90}]});assert.match(word(t),/2 séries/);assert.match(word(t),/90s descanso/)});
check('card de cardio não impõe séries fictícias',()=>assert(!word(api.card({sessionType:'cardio',moves:['Caminhada em ritmo confortável']})).includes('séries')));
check('todos os exercícios têm botão de vídeo',()=>{const t=api.card({moves:['Supino reto com barra','Remada unilateral com halter','Movimento especial']});const buttons=flatten(t).filter(x=>x.tag==='button'&&(['ABRIR PASTA DO VÍDEO','ENCONTRAR VÍDEO'].includes(word(x))));assert.equal(buttons.length,3)});
check('campo com prescrição e sem movimentos é exibido',()=>assert.match(word(api.card({prescription:[{move:'Supino reto com barra',sets:2}]})),/Supino reto com barra/));
check('sem movimentos, não desenha cards vazios',()=>assert.equal(api.card({moves:[]}),null));
const engineCtx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/life-intelligence-14.9.0.js'),'utf8'),engineCtx);
const engine=engineCtx.window.LifeIntelligence149;
const input={name:'Personalizado',items:[{k:'DIA 1',t:'Empurrar',sessionType:'strength',moves:['Supino reto com barra'],prescription:[{sets:5,reps:'8–12',rest:30}]},{k:'DIA 2',sessionType:'cardio',moves:['Caminhada'],prescription:[{sets:1,reps:'10 min'}]}]};
const youth={0:'17',3:'Iniciante',12:'Tenho pouco tempo para recuperar',18:'Tenho dormido pouco'};
const refined=engine.refineTrainingPlan(input,youth);
check('motor não modifica o objeto original',()=>assert.equal(input.items[0].prescription[0].sets,5));
check('recuperação reduz séries sem criar treino extremo',()=>assert.equal(refined.items[0].prescription[0].sets,2));
check('respeita cardio original sem alterar sua progressão',()=>assert.equal(refined.items[1].prescription[0].sets,1));
check('corrige descanso inválido com opção conservadora',()=>assert.equal(refined.items[0].prescription[0].rest,60));
check('relatório contabiliza exercícios reais',()=>assert.equal(engine.analyzeWorkoutPlan(refined,youth).moves,2));
check('relatório fala de recuperação curta',()=>assert.match(engine.analyzeWorkoutPlan(refined,youth).alerts.join(' '),/Recuperação/));
check('gerador não inventa avaliação para plano sem movimentos',()=>assert(engine.analyzeWorkoutPlan({items:[]}).alerts.length>0));
check('motor não salva/compartilha dados na rede',()=>assert(!/fetch\s*\(|localStorage\.|XMLHttpRequest/.test(fs.readFileSync(path.join(root,'assets/js/life-intelligence-14.9.0.js'),'utf8'))));
check('treinos prontos usam ficha antes de iniciar',()=>assert(js.includes('setSelectedReadyWorkout(w)')&&js.includes('life-ready-modal-1493')));
check('treino ativo mostra demonstração de cada exercício',()=>assert(js.includes("k:'EM EXECUÇÃO'")));
check('treino personalizado passa por refinamento de plano',()=>assert(js.includes('refineTrainingPlan?.(generatedTrainingPlan,a)') && js.includes('treino base preservado')));
check('modal pronto mantém confirmação do acesso PRO',()=>assert(js.includes("if (!hasV18Pro) {\n            const freeWorkoutIds")));
console.log(`PASS ${pass} cenários LIFE 14.9.5`);
