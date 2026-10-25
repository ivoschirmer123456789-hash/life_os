'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'assets/js/life-app-15.8.3.js'),'utf8');
const begin=source.indexOf('const LIFE_PLAN_VISUALS_V149 = '),end=source.indexOf('const lifeIsSimpleGreeting = ',begin);
assert(begin>=0&&end>begin,'helper region exists');
const n=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,'').trim();
let opened=[],selected=[];
const exercise={id:'direct1',name:'Supino reto com barra',muscle_group:'Peito',video_id:'rT7DgCr-3pg'};
const related={id:'rel2',name:'Rosca direta com halteres',muscle_group:'Bíceps'};
const react={createElement:(tag,props,...children)=>({tag,props:props||{},children:children.flat(Infinity).filter(x=>x!==undefined&&x!==null&&x!==false)})};
const ctx={React:react,window:{open:(url,target,features)=>opened.push({url,target,features})},IRON_EXERCISE_LIBRARY:[exercise,related],lifeNormalizeText:n,lifeExtractMuscleTargets:(s)=>n(s).includes('peito')?['Peito']:n(s).includes('biceps')?['Bíceps']:[],lifeFindExercise:(s)=>[exercise,related].find(x=>n(x.name)===n(s))||null,lifeExerciseGroup:x=>x.muscle_group,lifeExerciseMeta:x=>({equipment:'Halteres',difficulty:'Básico'}),lifeExerciseVideoInfo:x=>({id:x.video_id||'ykJmrZ5v0Oo',exact:!!x.video_id}),LIFE_MOVEMENT_VIDEO_RULES:[],lifeExerciseArt:ex=>'data:image/svg+xml,test',lifeExerciseCover:ex=>'https://i.ytimg.com/vi/test/hqdefault.jpg'};
vm.runInNewContext(source.slice(begin,end)+`\nwindow.FIXTURE1492={exerciseCards:lifeRenderWorkoutExerciseCards,mealCards:lifeRenderNutritionBlocksV149,summary:lifeWorkoutSessionStats,profile:lifeNutritionProfileSummaryV149};`,ctx,{timeout:5000});
const api=ctx.window.FIXTURE1492;
let count=0;const check=(title,run)=>{run();count++;console.log('PASS',title)};
const flat=tree=>[tree,...((tree?.children||[]).flatMap(x=>typeof x==='object'?flat(x):[]))];
const words=tree=>(tree?.children||[]).map(x=>typeof x==='object'?words(x):String(x)).join(' ');
check('quatro indicadores de sessão',()=>assert.equal(api.summary({items:[{sessionType:'strength'},{sessionType:'cardio'},{sessionType:'mobility'}]}).length,4));
check('sem exercícios gera visual vazio',()=>assert.equal(api.exerciseCards({moves:[]}),null));
const direct=api.exerciseCards({k:'SEG',t:'Peito',moves:[exercise.name],prescription:[{move:exercise.name,sets:3,reps:'8–12',rest:90}]},x=>selected.push(x));
check('nome aparece na ficha',()=>assert(words(direct).includes(exercise.name)));
check('séries e repetições visíveis',()=>assert(/3 séries/.test(words(direct))&&/8–12/.test(words(direct))));
check('imagem usada somente quando vídeo exatamente correspondente',()=>assert(flat(direct).some(x=>x.tag==='img'&&x.props.alt.includes(exercise.name))));
check('botão exato abre técnica dentro do LIFE',()=>{const b=flat(direct).find(x=>x.tag==='button'&&words(x)==='ABRIR PASTA DO VÍDEO');assert(b);b.props.onClick();assert.equal(selected.at(-1).id,exercise.id)});
const loose=api.exerciseCards({k:'TER',t:'Bíceps',moves:['Rosca martelo no banco']},x=>selected.push(x));
check('exercício sem correspondência recebe ilustração sem fingir vídeo exato',()=>assert(flat(loose).some(x=>x.props?.className==='life-plan-ex-cover-fallback-v1498')));
check('exercício sem correspondência permite busca identificada',()=>{const b=flat(loose).find(x=>x.tag==='button'&&words(x)==='ENCONTRAR VÍDEO');assert(b);b.props.onClick();assert(opened.at(-1).url.includes('youtube.com/results?search_query='));assert.equal(opened.at(-1).target,'_blank');});
check('sem correspondência não apresenta técnica falsa',()=>{const buttons=flat(loose).filter(x=>x.tag==='button');assert(!buttons.some(x=>words(x)==='TÉCNICA'));assert(buttons.some(x=>words(x)==='BUSCAR EXATO'));});
const meals=api.mealCards([{k:'CAFÉ DA MANHÃ',t:'Pão, fruta e ovos',d:'Adapte ao seu apetite.'},{k:'ALMOÇO',t:'Prato caseiro',d:'Varie acompanhamentos.'}]);
check('plano alimentar mantém nome e explicação de cada refeição',()=>assert(words(meals).includes('Prato caseiro')&&words(meals).includes('Varie acompanhamentos.')));
check('alimentação não inventa restrições',()=>assert(!/calorias por dia|peso ideal|meta de déficit/i.test(words(meals))));
check('perfil sem idade não inventa faixa etária',()=>assert(api.profile({profile:{goal:'Variedade'}})[3][1]==='Geral'));
check('CSS das planilhas referenciado no HTML',()=>assert(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('training-nutrition-visual-14.9.1.css')));
check('CSS das planilhas faz parte do PWA offline',()=>assert(fs.readFileSync(path.join(root,'service-worker.js'),'utf8').includes("'./assets/css/training-nutrition-visual-14.9.1.css'")));
check('arquivo index deve estar na raiz do pacote',()=>assert(fs.existsSync(path.join(root,'index.html'))));

// 14.9.5: vídeos ficam em pasta sem abrir o iframe automaticamente ao renderizar.
check('vídeos ficam dentro de pasta expansível',()=>{
  const details=flat(direct).find(x=>x.tag==='details'&&x.props.className?.includes('life-plan-ex-folder-v1495'));
  assert(details);assert.equal(details.props.open,undefined);
  assert(flat(details).some(x=>x.tag==='iframe'&&x.props.src==='about:blank'));
  assert(typeof details.props.onToggle === 'function');
});
check('miniatura fotográfica original corresponde ao exercício conhecido',()=>{
  const cover=flat(direct).find(x=>x.tag==='img');
  assert(cover.props.src.endsWith('exercicio-supino-barra-14.9.5.webp'));
});
check('botão do exercício expande a pasta, sem mudar o registro',()=>{
  const folder={open:false,scrollIntoView:()=>{}};
  const card={querySelector:()=>folder};
  const button=flat(direct).find(x=>x.tag==='button'&&words(x)==='ABRIR PASTA DO VÍDEO');
  assert(button);
  button.props.onClick({currentTarget:{closest:()=>card}});
  assert.equal(folder.open,true);
});
check('área de vídeo ausente oferece busca explícita',()=>{
  assert(!flat(loose).some(x=>x.tag==='iframe'));
  assert(flat(loose).some(x=>x.tag==='details'));
});
check('menu possui controles de expandir, compactar e ocultar',()=>{
  assert(source.includes("setLifeSidebarMode('full')"));
  assert(source.includes("setLifeSidebarMode('compact')"));
  assert(source.includes("setLifeSidebarMode('hidden')"));
  assert(source.includes('startLifeSidebarResize'));
});

check('ocultar esconde o menu por CSS, não apenas bloqueia os cliques',()=>{
  const css=fs.readFileSync(path.join(root,'assets/css/mobile-clarity-15.8.3.css'),'utf8');
  assert(/\.life-sidebar-v1495\.life-sidebar-hidden\s*\{[^}]*display\s*:\s*none\s*!important/.test(css));
  assert(css.includes('.life-sidebar-restore-v1495'));
});
check('fechar pasta interrompe o iframe para não deixar áudio oculto',()=>{
  const details=flat(direct).find(x=>x.tag==='details'&&x.props.className?.includes('life-plan-ex-folder-v1495'));
  assert.equal(typeof details.props.onToggle,'function');
  const iframe={src:'https://www.youtube-nocookie.com/embed/example?autoplay=1'};
  const item={open:false,querySelector:()=>iframe};
  details.props.onToggle({currentTarget:item});
  assert.equal(iframe.src,'about:blank');
  item.open=true;
  details.props.onToggle({currentTarget:item});
  assert(iframe.src.includes('youtube-nocookie.com/embed/'));
  assert(!iframe.src.includes('autoplay=1'));
});
console.log(`PASS ${count} testes de planilhas`);
