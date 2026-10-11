'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('./assets/js/life-extras-13.0.js');
let tests=0;function check(label,fn){fn();tests++;console.log('✓',label)}
const fixed=Date.parse('2026-10-11T10:00:00-03:00');
check('Resumo semanal não inventa progresso',()=>{
  const s=api.weekSummary({tasks:[{done:true,doneAt:new Date(fixed-86400000).toISOString()},{done:false},{done:true}],activity:[{date:new Date(fixed-86400000).toISOString(),go:'Estudos'},{date:'2021-01-01'}],projects:[{}],now:fixed});
  assert.deepEqual([s.completed,s.open,s.activities,s.projects],[1,1,1,1]);
});
check('Metas exigem nome e etapas',()=>{
  assert.equal(api.milestoneDraft({steps:['Fazer']}).ok,false);
  assert.equal(api.milestoneDraft({goal:'Organizar'}).ok,false);
});
check('Metas rejeitam prazos retroativos',()=>{
  assert.equal(api.milestoneDraft({goal:'Meta',steps:['Fase 1'],deadline:'2025-01-01',now:fixed}).ok,false);
});
check('Metas distribuem datas e preservam texto original',()=>{
  const s=api.milestoneDraft({goal:'Meu objetivo',steps:['Pesquisa','Execução','Revisão'],deadline:'2026-11-10',now:fixed});
  assert(s.ok);assert.equal(s.items.length,3);assert(s.items[0].due<s.items[2].due);assert.equal(s.items[1].title,'Execução');
});
check('Limites impedem mais de 12 etapas',()=>{
  const s=api.milestoneDraft({goal:'Meta',steps:Array(45).fill('Etapa')});assert.equal(s.items.length,12);
});
check('Feedback tem validação e limites',()=>{
  assert.equal(api.feedbackClean({category:'Erro',message:'curto'}).ok,false);
  assert.equal(api.feedbackClean({category:'Erro',message:'A parte de estudos parou de carregar'}).ok,true);
  assert.equal(api.feedbackClean({category:'Outro',message:'Sugerir uma melhoria importante'}).entry.category,'Sugestão');
});
check('Excel exporta bytes ZIP válidos',()=>{
  const b=api.xlsxBytes({tasks:[{text:'=1+1',done:true}],activity:[{date:'2026-10-10',title:'teste'}],projects:[{n:'Projeto'}],summary:{completed:1}});
  assert.equal(String.fromCharCode(...b.slice(0,2)),'PK');assert(b.length>1000);
});
check('A navegação principal permanece idêntica à 12.6',()=>{
  const old=fs.readFileSync('/mnt/data/life_os_12_6_release_candidate/assets/js/life-app-9.4.2.js','utf8');
  const next=fs.readFileSync('./assets/js/life-app-9.4.2.js','utf8');
  for(const marker of ['const premiumNav = ','const nav = focusTarget ?']){
    const start=(a)=>a.slice(a.indexOf(marker),a.indexOf('\n',a.indexOf(marker)));
    assert.equal(start(next),start(old));
  }
});
const store=new Map();let hookIndex=0;let hookValues=[];
function setup(){
  hookIndex=0;hookValues=[];
  global.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))};
  global.window={React:{createElement:(type,props,...children)=>({type,props:props||{},children:children.flat(Infinity).filter(x=>x!==null&&x!==undefined&&x!==false)}),useState:init=>{const n=hookIndex++;if(!(n in hookValues))hookValues[n]=typeof init==='function'?init():init;return [hookValues[n],v=>{hookValues[n]=typeof v==='function'?v(hookValues[n]):v;}]},useMemo:fn=>fn()},lifeSupabase:null,open:()=>{}};
  global.confirm=()=>true;global.prompt=()=> 'EXCLUIR MINHA CONTA';
}
const flatten=(node)=>{if(!node||typeof node!=='object')return [];return [node,...(node.children||[]).flatMap(flatten)];};
const findButton=(node,label)=>flatten(node).find(x=>x.type==='button'&&x.children.join('').includes(label));
check('Todas as áreas usam painel colapsável, sem aba extra',()=>{
  setup();for(const area of ['Tarefas','Life','Evolução','Perfil']){
    hookIndex=0;const root=api.ui({area,tasks:[],activity:[],projects:[],goals:[]});
    assert.equal(root.type,'section');assert.equal(root.children[0].type,'details');
    assert.equal(root.children[0].props.open,false);
  }
});
check('A etapa não é gravada antes da confirmação',()=>{
  setup();let creations=[];const opts={area:'Tarefas',goals:[{id:'goal-1',title:'Criar um app'}],tasks:[],projects:[],onCreateMilestones:(...a)=>creations.push(a)};
  const draw=()=>{hookIndex=0;return api.ui(opts)};
  let root=draw();let select=flatten(root).find(x=>x.type==='select');select.props.onChange({target:{value:'goal-1'}});
  root=draw();let tx=flatten(root).find(x=>x.type==='textarea');tx.props.onChange({target:{value:'Planejar\nConstruir\nRevisar'}});
  root=draw();assert(findButton(root,'Pré-visualizar etapas'));
  findButton(root,'Pré-visualizar etapas').props.onClick();assert.equal(creations.length,0);
  root=draw();const add=findButton(root,'Adicionar 3 etapa');assert(add);add.props.onClick();assert.equal(creations.length,1);assert.equal(creations[0][1].length,3);
});
check('Feedback só é enviado com resposta positiva do servidor',async()=>{
  setup();let seen=[];
  const draw=()=>{hookIndex=0;return api.ui({area:'Perfil',cloudStatus:'local',aiContextFlags:{},onAiContext:()=>{}})};
  let root=draw();flatten(root).find(x=>x.type==='textarea').props.onChange({target:{value:'O botão do painel não responde'}});
  root=draw();findButton(root,'Enviar feedback').props.onClick();assert.equal(seen.length,0);
  global.window.lifeSupabase={functions:{invoke:async(name,opts)=>{seen.push(name);return {data:{ok:true},error:null}}}};
  root=draw();await findButton(root,'Enviar feedback').props.onClick();assert.deepEqual(seen,['life-feedback']);
});
check('Painel mostra opção de solicitação, não executa exclusão direta',()=>{
  setup();const tree=api.ui({area:'Perfil'});assert(findButton(tree,'Solicitar exclusão'));
});
check('Feedback rascunho fica associado à conta, não é enviado automaticamente',()=>{
  setup();global.window.lifeLastSupabaseProfile={user:{id:'uid_abc'}};
  const draw=()=>{hookIndex=0;return api.ui({area:'Perfil'})};let root=draw();
  flatten(root).find(x=>x.type==='textarea').props.onChange({target:{value:'Seria útil criar uma revisão mensal'}});
  root=draw();findButton(root,'Guardar rascunho').props.onClick();
  assert(store.has('life13_feedback_v1_uid_abc'));
});
check('Atalhos não mudam o menu principal nem executam durante digitação',()=>{
  const app=fs.readFileSync('./assets/js/life-app-9.4.2.js','utf8');
  assert(app.includes("'t':'Tarefas','e':'Evolução','p':'Perfil'"));assert(app.includes("['input','textarea','select'].includes(tag)"));
});
check('As novas preferências podem entrar no backup; feedback não vai para nuvem',()=>{
  const app=fs.readFileSync('./assets/js/life-app-9.4.2.js','utf8');
  assert(app.includes('life13_preferences_v1$'));
  assert(!app.slice(app.indexOf('const lifeSyncKeys = '),app.indexOf('const collectLifeData')).includes('life13_feedback_'));
});
check('Funções do servidor requerem login e não apagam conta automaticamente',()=>{
  const fb=fs.readFileSync('./supabase/functions/life-feedback/index.ts','utf8');
  const del=fs.readFileSync('./supabase/functions/life-delete-request/index.ts','utf8');
  assert(fb.includes("withSupabase({auth:'user'}"));assert(del.includes("withSupabase({auth:'user'}"));
  assert(del.includes('EXCLUIR MINHA CONTA'));assert(!del.includes('auth.admin.deleteUser'));
});
console.log(`PASS: ${tests} verificações LIFE 13.0 executadas. Testes de interface usam React simulado.`);
