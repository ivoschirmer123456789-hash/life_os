/* LIFE OS 14.9.0 — inteligência de diagnóstico local, interpretável, sem rede/telemetria.
 * Sem dados inventados, sem inferências clínicas e sem alterações automáticas.
 * Não grava ou busca armazenamento. Cada chamada recebe dados explicitamente fornecidos.
 */
(function(root){
 'use strict';
 const clean=(s,n=140)=>String(s==null?'':s).replace(/\s+/g,' ').trim().slice(0,n);
 const normalize=s=>clean(s,240).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const num=(v,min,max)=>{const n=Number(v);return Number.isFinite(n)&&n>=min&&n<=max?n:null};
 const books=[
  {tags:['estud','aprender','metodo','enem','prova'],title:'Aprendendo a Aprender',author:'Barbara Oakley e Terrence Sejnowski',level:'Iniciante',kind:'livro',why:'Estratégias de estudo, memória e prática deliberada.'},
  {tags:['estud','aprend','enem','prova','metodo'],title:'Make It Stick: The Science of Successful Learning',author:'Peter C. Brown, Henry L. Roediger III e Mark A. McDaniel',level:'Intermediário',kind:'livro',why:'Prática de recuperação, revisão espaçada e testes.'},
  {tags:['foco','produtiv','metodo','estud'],title:'Trabalho Focado',author:'Cal Newport',level:'Intermediário',kind:'livro',why:'Estrutura de atenção para sessões sem distração.'},
  {tags:['habito','rotina','consistenc','produtiv'],title:'Hábitos Atômicos',author:'James Clear',level:'Iniciante',kind:'livro',why:'Construção de hábitos sustentáveis e ajuste do ambiente.'},
  {tags:['matemat','algebra','aritmet','calculo','enem'],title:'Pré-Cálculo',author:'OpenStax',level:'Iniciante',kind:'livro aberto',why:'Fundamentos e exercícios graduais de álgebra e funções.'},
  {tags:['fisica','mecanica','optica','eletric'],title:'Física Universitária',author:'OpenStax',level:'Intermediário',kind:'livro aberto',why:'Teoria, exemplos e problemas graduais; escolha apenas os capítulos da etapa.'},
  {tags:['quimica','estequiometr','equilibrio'],title:'Química',author:'OpenStax',level:'Intermediário',kind:'livro aberto',why:'Exercícios e explicações sobre matéria, reações e equilíbrio.'},
  {tags:['bio','genetica','ecologia','medicina','anatomia'],title:'Biologia',author:'OpenStax',level:'Intermediário',kind:'livro aberto',why:'Conceitos biológicos com exemplos e exercícios.'},
  {tags:['portugues','redacao','gramatica','enem'],title:'Manual de Redação e Estilo',author:'Eduardo Martins',level:'Intermediário',kind:'livro',why:'Clareza, revisão e escolhas de linguagem; complementar com critérios oficiais da redação.'},
  {tags:['programa','javascript','web','html','css'],title:'Eloquent JavaScript',author:'Marijn Haverbeke',level:'Intermediário',kind:'livro aberto',why:'Aprendizagem por exemplos e projetos de programação.'},
  {tags:['programa','python','dados','machine learning'],title:'Automatize Tarefas Maçantes com Python',author:'Al Sweigart',level:'Iniciante',kind:'livro',why:'Exercícios práticos de Python e automação.'},
  {tags:['algorit','computacao','ciencia da comput'],title:'Entendendo Algoritmos',author:'Aditya Bhargava',level:'Iniciante',kind:'livro',why:'Introdução visual a algoritmos e estruturas de dados.'},
  {tags:['historia','geograf','sociolog','sociedad'],title:'História do Brasil',author:'Boris Fausto',level:'Intermediário',kind:'livro',why:'Contextualização histórica e leitura crítica.'},
  {tags:['filosofia','pensamento critico','logica'],title:'Convite à Filosofia',author:'Marilena Chaui',level:'Intermediário',kind:'livro',why:'Base conceitual de problemas, correntes e argumentos filosóficos.'},
  {tags:['econom','financ','mercado','empreend'],title:'Economia',author:'OpenStax',level:'Iniciante',kind:'livro aberto',why:'Princípios de oferta, demanda, inflação e incentivos.'},
  {tags:['marketing','vendas','branding','produto','negocio'],title:'A Startup Enxuta',author:'Eric Ries',level:'Intermediário',kind:'livro',why:'Experimentos verificáveis e aprendizado antes de investir mais recursos.'},
  {tags:['marketing','vendas','persuasao','comunicacao'],title:'As Armas da Persuasão',author:'Robert B. Cialdini',level:'Intermediário',kind:'livro',why:'Princípios de influência para análise crítica e comunicação ética.'},
  {tags:['musica','violao','harmonia'],title:'Teoria da Música',author:'Bohumil Med',level:'Intermediário',kind:'livro',why:'Notação, ritmo e relações musicais para prática guiada.'},
  {tags:['ingles','english','idioma'],title:'English Grammar in Use',author:'Raymond Murphy',level:'Intermediário',kind:'livro',why:'Gramática em unidades curtas com prática e autoavaliação.'},
  {tags:['matemat','algebra','trigonomet','enem'],title:'Fundamentos de Matemática Elementar',author:'Gelson Iezzi e colaboradores',level:'Intermediário',kind:'livro',why:'Exercícios organizados por pré-requisitos; escolha o volume pertinente.'},
  {tags:['fisica','mecanica','optica','eletric'],title:'Fundamentos de Física',author:'David Halliday, Robert Resnick e Jearl Walker',level:'Intermediário',kind:'livro',why:'Abordagem de conceitos e problemas para estudo progressivo.'},
  {tags:['quimica','equilibrio','reac','estequiometr'],title:'Princípios de Química',author:'Peter Atkins e Loretta Jones',level:'Intermediário',kind:'livro',why:'Explicações conceituais e problemas aplicados de química.'},
  {tags:['biologia','genetica','evolucao','ecologia'],title:'Biologia de Campbell',author:'Lisa A. Urry e colaboradores',level:'Intermediário',kind:'livro',why:'Texto amplo de biologia com conexões entre os temas.'},
  {tags:['historia','brasil','republica'],title:'Brasil: Uma Biografia',author:'Lilia Moritz Schwarcz e Heloisa Murgel Starling',level:'Intermediário',kind:'livro',why:'Análise da história brasileira com perspectivas sociais e políticas.'},
  {tags:['filosofia','etica','pensamento'],title:'O Mundo de Sofia',author:'Jostein Gaarder',level:'Iniciante',kind:'livro',why:'Introdução narrativa à história da filosofia.'},
  {tags:['portugues','redacao','escrita','argument'],title:'Comunicação em Prosa Moderna',author:'Othon M. Garcia',level:'Intermediário',kind:'livro',why:'Construção de argumentos, clareza e organização textual.'},
  {tags:['psicologia','neurociencia','comportamento'],title:'Behave: The Biology of Humans at Our Best and Worst',author:'Robert M. Sapolsky',level:'Avançado',kind:'livro',why:'Aprofundamento em bases biológicas do comportamento; não é leitura introdutória.'},
  {tags:['anatomia','fisiologia','medicina'],title:'Anatomy & Physiology 2e',author:'OpenStax',level:'Intermediário',kind:'livro aberto',why:'Fundamentos anatômicos e fisiológicos com diagramas e revisão.'},
  {tags:['neurociencia','psicologia','mente'],title:'Neuroscience',author:'Dale Purves e colaboradores',level:'Avançado',kind:'livro',why:'Referência acadêmica para neuroanatomia e neurofisiologia após a base.'},
  {tags:['programacao','machine learning','ia','inteligencia artificial'],title:'Deep Learning',author:'Ian Goodfellow, Yoshua Bengio e Aaron Courville',level:'Avançado',kind:'livro aberto',why:'Referência técnica avançada; exige matemática e programação prévias.'},
  {tags:['financas','investimento','economia'],title:'A Psicologia Financeira',author:'Morgan Housel',level:'Iniciante',kind:'livro',why:'Comportamento, risco e decisões financeiras de longo prazo.'},
  {tags:['musica','violao','guitarra','harmonia'],title:'Harmonia & Improvisação',author:'Almir Chediak',level:'Intermediário',kind:'livro',why:'Aplicação de acordes, progressões e harmonia na prática musical.'},
  {tags:['marketing','posicionamento','marca'],title:'Isso é Marketing',author:'Seth Godin',level:'Iniciante',kind:'livro',why:'Posicionamento, público e criação de valor com responsabilidade.'},
  {tags:['ingles','gramatica','idioma'],title:'Practical English Usage',author:'Michael Swan',level:'Avançado',kind:'livro',why:'Referência para dúvidas detalhadas de uso e gramática inglesa.'},
  {tags:['psicolog','neuro','mente'],title:'Psychology 2e',author:'OpenStax',level:'Iniciante',kind:'livro aberto',why:'Visão geral de psicologia com abordagem acadêmica.'}
 ];
 function recommendBooks(topic,answers={},limit=4){
  const subject=normalize([topic?.title||topic,topic?.domain].join(' '));
  const goal=normalize(answers.goal||'');
  const genericStudy=/enem|aprender a estudar|metodo de estudo|tecnicas de estudo/.test(subject);
  const query=subject+' '+goal;
  const terms=subject.split(/[^a-z0-9]+/).filter(t=>t.length>3);
  const level=answers.level==='Iniciante' || answers.reading==='Não leio hoje'?'Iniciante':answers.level==='Avançado'?'Intermediário':null;
  const ranked=books.map((book,idx)=>{
    const hits=book.tags.reduce((n,t)=>n+(subject.includes(normalize(t))?5:(genericStudy&&goal.includes(normalize(t))?1:0)),0);
    const tokenHits=terms.reduce((n,t)=>n+(book.tags.some(tag=>normalize(tag).includes(t)||t.includes(normalize(tag)))?1:0),0);
    const score=hits+tokenHits+(level===book.level?2:0)+(book.kind==='livro aberto'?0.5:0);
    return {...book,score,idx,matched:hits+tokenHits>0};
  }).filter(x=>x.matched).sort((a,b)=>b.score-a.score||a.idx-b.idx);
  const freeOnly=answers.resources==='Apenas recursos gratuitos';
  const ageAppropriate=answers.level==='Iniciante'?ranked.filter(b=>b.level!=='Avançado'):ranked;
  const available=freeOnly?ageAppropriate.filter(b=>b.kind==='livro aberto'):ageAppropriate;
  const result=available.slice(0,Math.max(1,Math.min(6,limit)));
  if(!result.length&&!freeOnly)result.push({...books[0],score:0,reason:'Referência geral de métodos de aprendizagem; área específica ainda precisa ser confirmada.'});
  return result.map(({idx,score,matched,...b})=>({...b,reason:matched?b.why:'Sugestão geral, não validada para a matéria específica.'}));
 }
 const studyKeys=['topic','goal','level','reading','blocker','session','frequency','deadline','practice','baseline','format','resources'];
 function studyReport(answers={},topic={}){
  const a=answers&&typeof answers==='object'?answers:{};
  const completed=studyKeys.filter(k=>clean(a[k]||'',200)).length;
  const completeness=Math.round(completed/studyKeys.length*100);
  const missing=studyKeys.filter(k=>!clean(a[k]||'',200));
  const sessions=num(parseInt(a.frequency,10),1,7);
  const minutes=num(parseInt(a.session,10),10,180);
  const week=sessions&&minutes?sessions*minutes:null;
  const facts=[
   a.goal&&'Objetivo declarado: '+clean(a.goal),
   a.level&&'Nível autodeclarado: '+clean(a.level),
   week!==null&&'Tempo semanal indicado: '+week+' minutos',
   a.practice&&'Tipo de prática preferido: '+clean(a.practice),
   a.baseline&&'Diagnóstico inicial declarado: '+clean(a.baseline),
   a.format&&'Formato preferido: '+clean(a.format)
  ].filter(Boolean);
  const notes=[];
  if(a.baseline==='Ainda não testei o que sei')notes.push('Faça 5 questões curtas sem consulta antes de assumir domínio do conteúdo.');
  if(a.baseline==='Errei a maioria das questões')notes.push('Comece por fundamentos e exemplos guiados; avance somente após conseguir explicar o raciocínio.');
  if(a.baseline==='Acertei a maioria com segurança')notes.push('Teste questões novas e misturadas para confirmar domínio antes de pular etapas.');
  if(a.blocker==='Cansaço / sono')notes.push('Reduza a duração das sessões e priorize descanso; não compense com maratonas.');
  if(a.practice==='Resolver questões e simulados')notes.push('Faça questões curtas, classifique erros e repita exercícios semelhantes após revisão.');
  if(a.practice==='Criar um projeto')notes.push('Defina um produto pequeno e observável por etapa: código, texto, apresentação ou exercício aplicado.');
  if(a.format==='Áudio e vídeo')notes.push('Pause a explicação e faça recuperação ativa; só assistir não comprova aprendizagem.');
  if(a.format==='Texto e leitura')notes.push('Leia trechos curtos, resuma de memória e valide sua explicação com exercícios.');
  if(a.deadline==='2 semanas'&&(!week||week<120))notes.push('Prazo curto para o tempo indicado: priorize tópicos essenciais e diagnóstico, sem prometer conclusão integral.');
  if(!notes.length)notes.push('Use um ciclo de explicar, praticar, corrigir e revisar; ajuste após a primeira avaliação real.');
  const citations= recommendBooks(topic,a,4);
  if(a.resources==='Apenas recursos gratuitos'&&!citations.length)notes.push('Não há livro gratuito específico confirmado no catálogo local; consulte fontes abertas do assunto em vez de receber uma referência inventada.');
  const note='Completude do questionário: '+completeness+'% (não é nota de capacidade). '+(week!==null?'Disponibilidade declarada: '+week+' min/semana. ':'')+'As recomendações são hipóteses até serem conferidas com resultados de prática.';
  return {version:'14.9.0',completeness,missing,facts,notes,books:citations,note,assumptions:['Nível informado, não testado','Tempo disponível informado, não confirmado','Nenhum resultado de prova foi inferido'],nextMeasure:'Após 2 sessões, registre acertos, erros e dificuldades em questões novas para recalibrar o plano.'};
 }
 const trainingLabels=['Idade','Altura (opcional)','Objetivo','Experiência','Dias totais','Dias de força','Experiência com cardio','Dias de cardio','Equilíbrio híbrido','Divisão','Tempo por sessão','Local/equipamentos','Recuperação','Restrições de segurança','Impacto','Preferência de exercícios','Adaptação por esforço','Movimento desconfortável','Qualidade do sono'];
 function trainingReport(a={}){
  const obj=a&&typeof a==='object'?a:{};
  const get=i=>obj[i]??obj[String(i)];
  const present=trainingLabels.filter((x,i)=>clean(get(i))).length;
  const completeness=Math.round(present/trainingLabels.length*100);
  const age=num(get(0),13,90);
  const safety=get(13),recovery=get(12),sleep=get(18),discomfort=get(17),style=get(15),effort=get(16);
  const caution=safety&&safety!=='Não';
  const facts=trainingLabels.filter((_,i)=>get(i)!==undefined&&String(get(i)).trim()).map((x)=>{const idx=trainingLabels.indexOf(x);return x+': '+clean(get(idx),75)});
  const adjustments=[];
  if(age!==null&&age<18)adjustments.push('Priorizar técnica supervisionada, variedade de movimentos e recuperação; evitar protocolos extremos.');
  if(recovery==='Tenho pouco tempo para recuperar'||sleep==='Tenho dormido pouco')adjustments.push('Manter sessões moderadas e margem de descanso entre estímulos semelhantes.');
  if(discomfort&&discomfort!=='Nenhum')adjustments.push('Não incluir automaticamente movimentos relatados como desconfortáveis; confirmar alternativas seguras.');
  if(style==='Prefiro máquinas e movimentos guiados')adjustments.push('Priorizar aparelhos estáveis compatíveis com equipamento disponível.');
  if(style==='Prefiro pesos livres e movimentos básicos')adjustments.push('Priorizar exercícios básicos com progressão técnica conservadora.');
  if(effort==='Estou voltando após uma pausa')adjustments.push('Iniciar com volume reduzido e aumentar apenas após observar recuperação e técnica.');
  if(effort==='Quero aprender os movimentos')adjustments.push('Priorizar aprendizagem motora e exercícios estáveis antes de aumentar a complexidade.');
  if(!adjustments.length)adjustments.push('Priorizar progressão gradual e revisar esforço, técnica e recuperação semanalmente.');
  return {version:'14.9.0',completeness,missing:trainingLabels.filter((_,i)=>!clean(get(i))),facts,adjustments,
   caution:!!caution,clarification:caution?'Precisa de avaliação individual antes de gerar treino automático.':'Não há limitação médica informada; ainda assim, não é avaliação clínica.',
   note:'Questionário '+completeness+'% preenchido. Não é avaliação médica, não prevê ganho muscular ou transformação corporal.',
   nextMeasure:'Após 2 semanas, registre se as sessões foram confortáveis, qualidade do movimento, disposição e recuperação; ajuste antes de progredir.'};
 }

 const readAnswers = (a,i)=>a?.[i]??a?.[String(i)];
 function analyzeWorkoutPlan(plan,answers={}){
   const days=Array.isArray(plan?.items)&&plan.items.some(x=>x&&typeof x==='object')?plan.items:Array.isArray(plan?.weeklyItems)?plan.weeklyItems:[];
   const allMoves=days.length?days.flatMap(d=>Array.isArray(d.moves)?d.moves:[]):Array.isArray(plan?.moves)?plan.moves:[];
   const count=allMoves.length;
   const age=num(answers?.age??readAnswers(answers,0),13,90);
   const level=clean(readAnswers(answers,3)||plan?.level||'não informado');
   const recovery=clean(readAnswers(answers,12)||'não informada');
   const sleep=clean(readAnswers(answers,18)||'não informado');
   const time=clean(readAnswers(answers,10)||plan?.duration||'não informado');
   const alerts=[];
   if(!count) alerts.push('Faltam exercícios descritos para conferir o conteúdo do plano.');
   if(age!==null&&age<18) alerts.push('Adolescente: respeitar supervisão, técnica e descanso; não buscar cargas máximas.');
   if(/pouco tempo|dormido pouco|voltando ap[oó]s/i.test([recovery,sleep,readAnswers(answers,16)].join(' '))) alerts.push('Recuperação limitada: priorize sessão moderada, pausas e reavaliação.');
   const normalizeName=s=>normalize(typeof s==='string'?s:s?.name||s?.move||'');
   const duplicateDays=[];
   for(let i=0;i<days.length;i++){
     const seen=new Set();for(const m of days[i].moves||[]){const key=normalizeName(m);if(!key)continue;if(seen.has(key))duplicateDays.push(i+1);seen.add(key)}
   }
   if(duplicateDays.length) alerts.push('Exercícios repetidos na mesma sessão: '+[...new Set(duplicateDays)].join(', ')+'.');
   const supported=days.length?days.length:(Number(plan?.days)||1);
   const summary=(days.length?days.length+' sessões organizadas; ':supported+' sessão(ões) previstas; ')+count+' exercícios listados'+(level&&level!=='não informado'?'; nível '+level.toLowerCase():'')+'. '+
      (alerts.length?alerts[0]:'Confira os vídeos, ajuste a técnica e revise a recuperação após as primeiras sessões.');
   return {version:'14.9.3',days:supported,moves:count,time,alerts,summary,
     reasons:['Estrutura baseada em movimentos presentes no plano','Intensidade deve acompanhar recuperação e domínio técnico','Acompanhamento depende de registros reais, não de previsões corporais'],
     nextMeasure:'Depois de duas sessões, registre conforto, técnica, recuperação e quais movimentos precisam de ajuste.'};
 }
 function refineTrainingPlan(plan,answers={}){
   if(!plan||plan.blocked||!Array.isArray(plan.items)) return plan;
   const age=num(readAnswers(answers,0),13,90);
   const recovery=clean(readAnswers(answers,12));
   const sleep=clean(readAnswers(answers,18));
   const comeback=clean(readAnswers(answers,16));
   const cautious=(age!==null&&age<18)||/pouco tempo|dormido pouco|voltando ap[oó]s/i.test([recovery,sleep,comeback].join(' '));
   const reduced=/pouco tempo|dormido pouco|voltando ap[oó]s/i.test([recovery,sleep,comeback].join(' '));
   const items=plan.items.map(day=>{
     const copy={...day};
     const strength=(day.sessionType||'strength')==='strength';
     if(!strength)return {...copy,moves:Array.isArray(day.moves)?day.moves.slice():[],prescription:Array.isArray(day.prescription)?day.prescription.map(p=>({...p})):[]};
     const moves=Array.isArray(day.moves)?day.moves.slice():[];
     const prescriptions=Array.isArray(day.prescription)?day.prescription:[];
     copy.moves=moves;
     copy.prescription=moves.map((_,i)=>{
       const p={...(prescriptions[i]||{})};
       const raw=Number(p.sets);
       const sets=Number.isFinite(raw)&&raw>0?Math.min(8,Math.max(1,Math.round(raw))):3;
       p.sets=reduced?Math.min(sets,2):cautious?Math.min(sets,3):sets;
       if(!p.reps) p.reps='8–12';
       if(!Number.isFinite(Number(p.rest))||Number(p.rest)<45) p.rest=60;
       return p;
     });
     return copy;
   });
   const result={...plan,items};
   const report=analyzeWorkoutPlan(result,answers);
   return {...result,planAudit:report,methodNote:String(plan.methodNote||'')+' '+(reduced?'Séries moderadas enquanto a recuperação estiver limitada. ':'')+'Confira nomes e demonstrações antes de executar.',
      adjustments:[...(Array.isArray(plan.adjustments)?plan.adjustments:[]),...(reduced?['Séries moderadas conforme o sono/retorno declarado.']:[])].filter((v,i,a)=>a.indexOf(v)===i)};
 }
 function answer(prompt,ctx={}){
  const q=normalize(prompt);
  if(!q || !/(relatorio|diagnostico|avaliac|analis|livr|bibliograf|leitura|aprend|estud|trein|exercic)/.test(q))return null;
  const study=ctx.study&&typeof ctx.study==='object'?ctx.study:null;
  const training=ctx.training&&typeof ctx.training==='object'?ctx.training:null;
  const studyAsked=/(livr|bibliograf|leitura|estud|aprend|enem|prova)/.test(q);
  const trainAsked=/(trein|exercic|muscul|academia)/.test(q);
  if(studyAsked && study){
   const r=studyReport(study.answers||{}, {title:study.topic,domain:study.domain});
   const sources=r.books.map((b,i)=>(i+1)+'. '+b.title+' — '+b.author+' ('+b.level+'). '+b.reason).join('\n');
   return {text:(/livr|bibliograf|leitura/.test(q)?'REFERÊNCIAS COM JUSTIFICATIVA\n'+sources:'RELATÓRIO DE ESTUDOS\n'+r.note+'\nFATOS: '+r.facts.join('; ')+'\nRECOMENDAÇÕES: '+r.notes.join(' ')+'\nLIVROS:\n'+sources+'\nPRÓXIMA VERIFICAÇÃO: '+r.nextMeasure)+'\nDados não informados: '+(r.missing.length?r.missing.join(', '):'nenhum no questionário; ainda faltam resultados de prática.')};
  }
  if(trainAsked && training){
   const r=trainingReport(training.answers||{});
   const planDetails=training.items?analyzeWorkoutPlan(training,training.answers||{}):null;
   return {text:'RELATÓRIO DE TREINO\n'+r.note+'\nDADOS DECLARADOS: '+r.facts.join('; ')+'\nAJUSTES JUSTIFICADOS: '+r.adjustments.join(' ')+(planDetails?'\nANÁLISE DO PLANO: '+planDetails.summary+'\nPONTOS A CONFERIR: '+(planDetails.alerts.join(' ')||'Verificar execução real e recuperação.'):'')+'\nSEGURANÇA: '+r.clarification+'\nPRÓXIMA VERIFICAÇÃO: '+r.nextMeasure+'\nCampos ausentes: '+(r.missing.length?r.missing.join(', '):'nenhum no formulário.')};
  }
  if(/relatorio|diagnostico|livr/.test(q))return {text:'Para gerar um relatório específico, abra Estudos e conclua o questionário de aprendizagem ou Fitness e conclua o questionário de treino. O LIFE mostrará apenas dados informados, justificativas, fontes selecionadas e o que ainda precisa medir. Não inventarei resultados.'};
  return null;
 }
 root.LifeIntelligence149=Object.freeze({recommendBooks,studyReport,trainingReport,analyzeWorkoutPlan,refineTrainingPlan,answer,version:'14.9.3'});
})(typeof window!=='undefined'?window:globalThis);

// LIFE OS 15.1 — deterministic, consent-first planning and recovery utilities.
// This supplements the existing local/remote AI; it does not claim to replace either.
(function(root){
 'use strict';
 const CLAMP=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||min));
 const clean=(v,len=220)=>String(v==null?'':v).trim().slice(0,len);
 const QUESTION_BANK={
  Estudos:[['priority','Qual matéria ou habilidade merece mais atenção agora?',['Uma matéria','Várias matérias','Ainda não sei']],['evidence','Como você sabe que está aprendendo?',['Fiz questões ou exercícios','Consigo explicar com exemplos','Ainda não testei']],['capacity','Quantos momentos de estudo cabem na sua semana?',['1–2 momentos','3–4 momentos','5 ou mais momentos']]],
  Finanças:[['priority','O que quer organizar primeiro?',['Registrar gastos','Planejar reserva','Rever despesas recorrentes']],['evidence','Você já tem registros de despesas?',['Sim, registrados','Alguns','Ainda não']],['capacity','Quanto tempo pode reservar para revisar?',['Uma vez na semana','Duas vezes na semana','Preciso começar pequeno']]],
  'Bem-estar':[['priority','O que mais precisa melhorar na sua rotina?',['Consistência','Técnica e segurança','Recuperação e descanso']],['evidence','Como acompanha sua atividade?',['Registo sessões','Anoto disposição e conforto','Ainda não acompanho']],['capacity','Quanto espaço há na semana?',['1–2 dias','3–4 dias','Varia bastante']]],
  default:[['priority','Qual é a próxima entrega observável?',['Aprender o básico','Criar uma primeira versão','Melhorar algo existente']],['evidence','Como vai verificar o resultado?',['Teste prático','Revisão de alguém','Ainda preciso definir']],['capacity','Quanto espaço real tem na semana?',['1–2 momentos','3–4 momentos','Varia bastante']]]
 };
 const questionsFor=(category)=>QUESTION_BANK[category]||QUESTION_BANK.default;
 const report=(project,answers={})=>{
  const qs=questionsFor(project?.category); const facts=qs.map(([id,question])=>({question,answer:clean(answers?.[id],100)}));
  const missing=facts.filter(x=>!x.answer).map(x=>x.question);
  const weeks=Array.isArray(project?.lifeGuide?.weeks)?project.lifeGuide.weeks:[];
  const valid=weeks.flatMap(w=>Array.isArray(w?.steps)?w.steps.filter(s=>s&&typeof s==='object'&&!s.optional):[]);
  const done=valid.filter(s=>s.done).length;
  const upcoming=weeks.find(w=>Array.isArray(w?.steps)&&w.steps.some(s=>s&&!s.done&&!s.optional));
  const suggestions=[];
  if(answers.evidence==='Ainda não testei'||answers.evidence==='Ainda não acompanho'||answers.evidence==='Ainda não') suggestions.push('Registre um pequeno teste ou fato observado antes de interpretar o progresso.');
  if(/1–2|começar pequeno|Varia bastante|Varia muito/.test(clean(answers.capacity))) suggestions.push('Distribua no máximo um ou dois blocos essenciais por semana; não preencha toda a agenda.');
  if(answers.priority==='Recuperação e descanso') suggestions.push('Proteja dias de recuperação e ajuste a dificuldade se a disposição diminuir.');
  if(answers.priority==='Rever despesas recorrentes') suggestions.push('Revise cobranças documentadas e compare com despesas necessárias antes de sugerir cortes.');
  if(answers.priority==='Várias matérias') suggestions.push('Escolha primeiro duas prioridades de estudo e revise o resultado antes de ampliar.');
  if(!suggestions.length) suggestions.push('Conclua uma etapa, registre o que aconteceu e revise o plano com base nesse resultado.');
  return {facts,missing,suggestions,done,total:valid.length,percent:valid.length?Math.round(done/valid.length*100):0,
   next:clean(upcoming?.steps?.find(s=>s&&!s.done&&!s.optional)?.text||'Revise o objetivo e escolha a próxima etapa.'),
   note:'O percentual indica ações marcadas, não resultado corporal, escolar ou financeiro.'};
 };
 const adaptGuide=(guide,answers={})=>{
  if(!guide||!Array.isArray(guide.weeks))return guide;
  const capacity=clean(answers.capacity);
  const small=/1–2|começar pequeno|Varia bastante|Varia muito/.test(capacity);
  return {...guide,adaptive:{...Object.fromEntries(['priority','evidence','capacity'].map(k=>[k,clean(answers[k],120)])),appliedAt:new Date().toISOString()},
   weeks:guide.weeks.map((w,i)=>({...w,steps:(w.steps||[]).map((s,j)=>({...s,optional:small&&j===2})),
    focus:clean(w.focus,700)+(small?' Priorize a primeira ação; a terceira fica opcional se a semana estiver apertada.':''),
    reviewPrompt:i%4===3?'O que foi concluído, o que não funcionou e qual ajuste é útil?':'Qual evidência concreta você conseguiu registrar esta semana?'}))};
 };
 const todayKey=(date=new Date())=>{
  const d=date instanceof Date?date:new Date(date);
  if(!Number.isFinite(d.getTime()))return null;
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 };
 const parseDay=(key)=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(key)))return null;
  const [y,m,d]=key.split('-').map(Number);
  const date=new Date(y,m-1,d,12);
  return date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d?date:null;
 };
 const addDays=(day,n)=>{const date=parseDay(day);if(!date)return null;date.setDate(date.getDate()+n);return todayKey(date)};
 const replanProposal=(project,asOf=todayKey())=>{
  const weeks=project?.lifeGuide?.weeks;
  const today=parseDay(asOf);
  if(!Array.isArray(weeks)||!today)return {ok:false,reason:'Projeto sem cronograma válido.'};
  const pending=weeks.find(w=>Array.isArray(w?.steps)&&w.steps.some(s=>s&&!s.done&&!s.optional));
  if(!pending)return {ok:false,reason:'Nenhuma semana pendente.'};
  const oldDate=parseDay(project.lifeGuide.startDate),first=parseDay(pending.from?.split('/').reverse().join('-'));
  // The source calendar is local; when parsing pt-BR dates, validate all parts.
  const from=first||oldDate;
  if(!from)return {ok:false,reason:'Datas do projeto inválidas.'};
  const todayAtNoon=new Date(today.getFullYear(),today.getMonth(),today.getDate(),12);
  const shift=Math.max(0,Math.ceil((todayAtNoon-from)/(86400000)));
  if(!shift)return {ok:false,reason:'O cronograma já está em dia.'};
  const affected=weeks.filter(w=>Array.isArray(w?.steps)&&w.steps.some(s=>s&&!s.done&&!s.optional)).length;
  if(!affected)return {ok:false,reason:'Nenhum item pendente.'};
  const reformatted=weeks.map(w=>{
    if(!w||!Array.isArray(w.steps))return w;
    if(w.steps.every(s=>s?.done||s?.optional))return {...w};
    const fr=String(w.from||'').split('/').reverse().join('-'),to=String(w.to||'').split('/').reverse().join('-');
    const nf=addDays(fr,shift),nt=addDays(to,shift);
    if(!nf||!nt)return null;
    const fmt=x=>x.slice(8,10)+'/'+x.slice(5,7)+'/'+x.slice(0,4);
    return {...w,from:fmt(nf),to:fmt(nt),monthKey:nf.slice(0,7)};
  });
  if(reformatted.some(x=>!x))return {ok:false,reason:'Existem datas inválidas; revise antes de reorganizar.'};
  return {ok:true,days:shift,affected,guide:{...project.lifeGuide,weeks:reformatted,endDate:reformatted[reformatted.length-1]?.to?.split('/').reverse().join('-')||project.lifeGuide.endDate,
   revisedAt:new Date().toISOString()},reason:'Proposta, ainda não aplicada. Semanas concluídas mantêm suas datas; somente semanas pendentes mudam.'};
 };
 const studyReview=(plan,feedback='')=>{
  const done=new Set(Array.isArray(plan?.completedStages)?plan.completedStages:[]),steps=Array.isArray(plan?.timeline)?plan.timeline:[];
  const next=steps.find(s=>s&&!done.has(s.index));
  const advice=feedback==='Preciso revisar'?'Volte a um exemplo guiado, corrija os erros e tente um exercício diferente.':feedback==='Consegui aplicar'?'Experimente uma questão nova, sem consulta, antes de marcar domínio.':'Faça uma questão curta ou explique o tema com suas palavras; ainda falta evidência de domínio.';
  return {done:steps.filter(s=>s&&done.has(s.index)).length,total:steps.filter(s=>s&&typeof s==='object').length,next:next?.title||'Revisão final',advice};
 };
 const fitnessReview=(records=[],workoutId='')=>{
  const rows=(Array.isArray(records)?records:[]).filter(x=>!workoutId||String(x.workoutId)===String(workoutId));
  const latest=rows.slice(-1)[0];
  const low=rows.slice(-3).filter(x=>x.feedback==='Preciso reduzir').length;
  return {count:rows.length,last:latest||null,advice:low>=2?'Você marcou recuperação limitada em mais de uma revisão. Priorize descanso e ajuste com orientação adequada.':latest?.feedback==='Técnica a revisar'?'Na próxima sessão, revise a execução e escolha variações confortáveis antes de progredir.':latest?.feedback==='Sessão confortável'?'Mantenha a regularidade; não é necessário aumentar a dificuldade automaticamente.':'Após treinar, registre como foi a técnica e a recuperação.'};
 };
 root.LifeExperience151=Object.freeze({questionsFor,report,adaptGuide,replanProposal,studyReview,fitnessReview,todayKey,version:'15.1.0'});
})(typeof window!=='undefined'?window:globalThis);


/* LIFE 15.2 — Evidence-based continuity, task linking and UI decision support.
   Pure local functions. No API calls, data writes or access to denied context. */
(function(root){
 'use strict';
 const arr=x=>Array.isArray(x)?x:[];
 const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const txt=(x,n=160)=>String(x==null?'':x).trim().slice(0,n);
 const key=x=>txt(x,220).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/\s+/g,' ');
 const projectId=p=>txt(p?.id||p?.n,120);
 const unfinished=project=>arr(project?.lifeGuide?.weeks).flatMap(w=>arr(w?.steps).filter(step=>obj(step)&&!step.done&&!step.optional).map(step=>({projectId:projectId(project),projectName:txt(project.n||'Projeto',90),weekId:txt(w.id,70),weekNumber:Number(w.index)||0,stepId:txt(step.id,70),text:txt(step.text,180),from:txt(w.from,20)}))).filter(s=>s.text&&s.weekId&&s.stepId);
 const calendarDate=raw=>{const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(txt(raw));if(!match)return null;const [_,day,month,year]=match;const d=new Date(+year,+month-1,+day,12);return d.getDate()===+day&&d.getMonth()===+month-1&&d.getFullYear()===+year?`${year}-${month}-${day}`:null;};
 function linkedTask(project,step,tasks=[]){
  const pid=projectId(project),candidate=arr(tasks).filter(obj);
  const match=candidate.find(t=>txt(t.projectId,120)===pid&&txt(t.projectWeekId,70)===txt(step?.weekId,70)&&txt(t.projectStepId,70)===txt(step?.stepId,70));
  return match||candidate.find(t=>txt(t.projectId,120)===pid&&key(t.text||t.title)===key(step?.text))||null;
 }
 function taskPreview(project,tasks=[]){
  if(!obj(project))return {ok:false,reason:'Escolha um projeto válido.'};
  const remaining=unfinished(project); // Do not hide later steps in long (12-month) projects.
  const next=remaining.find(st=>!linkedTask(project,st,tasks));
  if(!next)return {ok:false,reason:remaining.length?'As próximas etapas já estão vinculadas às Tarefas.':'Este projeto não tem etapas pendentes.'};
  const date=calendarDate(next.from);
  return {ok:true,projectId:next.projectId,projectName:next.projectName,weekId:next.weekId,stepId:next.stepId,text:next.text,day:date,description:'Será criada apenas uma tarefa, sem alterar o cronograma do projeto. A data é referência da semana, não um compromisso em horário fixo.'};
 }
 function overview({projects=[],tasks=[],studyPlan=null,workouts=[],feedback=[]}={}){
  const ps=arr(projects).filter(obj).slice(0,120),ts=arr(tasks).filter(obj).slice(0,300);
  const guided=ps.filter(p=>arr(p.lifeGuide?.weeks).length);
  const open=ts.filter(t=>!(t.done??t.completed));
  const nextProject=guided.map(p=>taskPreview(p,ts)).find(x=>x.ok)||null;
  const hasStudy=obj(studyPlan);
  const timeline=hasStudy?arr(studyPlan.timeline):[];
  const studied=new Set(arr(studyPlan?.completedStages).map(x=>String(x)));
  const nextStudy=timeline.find(x=>obj(x)&&!studied.has(String(x.index)));
  const lastFeedback=arr(feedback).filter(obj).slice(-1)[0]||null;
  const available=['Projetos','Tarefas',...(hasStudy?['Estudos']:[]),...(arr(workouts).length?['Fitness']:[])];
  // Deadline alerts use only explicit task timestamps, never guessed dates.
  const now=Date.now();
  const overdue=open.filter(t=>{
    if(typeof t.dueAt!=='string'||!/\d{4}-\d{2}-\d{2}/.test(t.dueAt))return false;
    const ms=Date.parse(t.dueAt);return Number.isFinite(ms)&&ms<now;
  });
  const linkedStatus=root.LifePlanLink154?.syncSummary(ps,ts)||null;
  const notes=[];
  if(overdue.length)notes.push({area:'Tarefas',label:'Conferir prazo informado',text:overdue.length+' tarefa(s) com prazo vencido',reason:'Prazos identificados apenas nos registros informados'});
  if(nextProject)notes.push({area:'Projetos',label:'Próxima etapa disponível',text:nextProject.text,reason:'Primeira ação ainda não enviada à lista de Tarefas'});
  if(open.length)notes.push({area:'Tarefas',label:'Tarefas pendentes',text:open.length+' pendente(s) registrado(s)',reason:'Contagem baseada nas tarefas locais, não em tempo estimado'});
  if(nextStudy)notes.push({area:'Estudos',label:'Próxima etapa de estudo',text:txt(nextStudy.title||'Revisar conteúdo'),reason:'Etapa da trilha ainda não concluída'});
  if(lastFeedback?.feedback==='Preciso reduzir'||lastFeedback?.feedback==='Técnica a revisar')notes.push({area:'Fitness',label:'Atenção à recuperação / técnica',text:txt(lastFeedback.feedback),reason:'Último relato informado pelo usuário, sem diagnóstico médico'});
  return {version:'15.4.1',counts:{projects:ps.length,guidedProjects:guided.length,openTasks:open.length,overdueTasks:overdue.length,savedWorkouts:arr(workouts).length,studyStages:timeline.length,studyCompleted:timeline.filter(x=>obj(x)&&studied.has(String(x.index))).length},linkedStatus,available,notes:notes.slice(0,4),nextProject,nextStudy:nextStudy?txt(nextStudy.title):null,source:'Dados locais autorizados no LIFE; estimativas e resultados externos não foram inferidos.',missing:[!ps.length?'Nenhum projeto registrado':null,!hasStudy?'Sem trilha de estudos disponível':null].filter(Boolean)};
 }
 function question({projects=[],tasks=[],studyPlan=null,workouts=[],feedback=[]}={}){
  const result=overview({projects,tasks,studyPlan,workouts,feedback});
  if(result.counts.overdueTasks>0)return {area:'Tarefas',text:'Você tem '+result.counts.overdueTasks+' prazo(s) registrado(s) que passaram. Quer revisar essas tarefas antes de planejar novas?',options:['Revisar tarefas','Ver meus projetos']};
  if(!result.counts.projects)return {area:'Projetos',text:'Qual objetivo você quer acompanhar primeiro?',options:['Estudos','Organização','Finanças','Bem-estar']};
  if(result.nextProject)return {area:'Projetos',text:'Quer levar a próxima etapa de '+result.nextProject.projectName+' para suas Tarefas?',options:['Ver antes de criar','Apenas consultar']};
  if(result.counts.openTasks>0)return {area:'Tarefas',text:'Qual das tarefas pendentes merece prioridade nesta semana?',options:['Ver lista','Rever projeto']};
  return {area:'Projetos',text:'O que você gostaria de revisar nesta semana?',options:['Meus projetos','Estudos','Fitness']};
 }
 root.LifeExperience152=Object.freeze({version:'15.2.1',unfinished,linkedTask,taskPreview,overview,question,calendarDate});
})(typeof window!=='undefined'?window:globalThis);


/* LIFE OS 15.4 — Linked project/task status and evidence-safe guidance.
 * Pure functions: caller owns mutation and synchronization. Never creates tasks,
 * sends data, changes entitlements or calls the network. */
(function(root){
  'use strict';
  const arr=x=>Array.isArray(x)?x:[];
  const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  const ident=x=>String(x===undefined||x===null?'':x).trim().slice(0,180);
  const projectId=p=>ident(p?.id||p?.n);
  const done=x=>x?.done===true||x?.completed===true;
  const readProgress=project=>{
    const valid=arr(project?.lifeGuide?.weeks).filter(obj).flatMap(w=>arr(w.steps).filter(s=>obj(s)&&!s.optional));
    const finished=valid.filter(done).length;
    return {finished,total:valid.length,percent:valid.length?Math.round(100*finished/valid.length):0};
  };
  function setStep(project,weekId,stepId,value){
    const weeks=arr(project?.lifeGuide?.weeks);
    let matched=false;
    const next=weeks.map(w=>{
      if(!obj(w)||ident(w.id)!==ident(weekId))return w;
      const steps=arr(w.steps).map(st=>{
        if(!obj(st)||ident(st.id)!==ident(stepId)||st.optional)return st;
        if(done(st)===!!value)return st;
        matched=true;return {...st,done:!!value,completed:undefined};
      });
      return {...w,steps};
    });
    if(!matched)return project;
    const lifeGuide={...project.lifeGuide,weeks:next};
    const progress=readProgress({lifeGuide});
    const updates={...project,lifeGuide,lifeGuideProgress:progress.percent};
    if(ident(project.id).startsWith('guided_')){
      updates.p=progress.percent;
      updates.next=next.flatMap(w=>arr(w?.steps)).find(s=>obj(s)&&!done(s)&&!s.optional)?.text||'Revisar o projeto concluído';
    }
    return updates;
  }
  function taskToProjects(projects,task,newDone){
    if(!obj(task)||!ident(task.projectId)||!ident(task.projectWeekId)||!ident(task.projectStepId))
      return {items:projects,changed:false,reason:'Sem vínculo explícito com etapa de Projeto.'};
    if(typeof newDone!=='boolean')return {items:projects,changed:false,reason:'Estado inválido.'};
    let changed=false;
    const items=arr(projects).map(project=>{
      if(!obj(project)||projectId(project)!==ident(task.projectId))return project;
      const result=setStep(project,task.projectWeekId,task.projectStepId,newDone);
      if(result!==project)changed=true;
      return result;
    });
    return {items:changed?items:projects,changed,reason:changed?'Etapa de projeto vinculada atualizada.':'Nenhuma etapa correspondente precisou de atualização.'};
  }
  function stepToTasks(tasks,project,weekId,stepId,newDone){
    if(!obj(project)||!ident(projectId(project))||!ident(weekId)||!ident(stepId)||typeof newDone!=='boolean')
      return {items:tasks,changed:false,reason:'Identificadores incompletos.'};
    const pid=projectId(project);
    let changed=false;
    const items=arr(tasks).map(task=>{
      if(!obj(task)||ident(task.projectId)!==pid||ident(task.projectWeekId)!==ident(weekId)||ident(task.projectStepId)!==ident(stepId)||done(task)===newDone)return task;
      changed=true;
      return {...task,done:newDone,completed:undefined,doneAt:newDone?new Date().toISOString():undefined};
    });
    return {items:changed?items:tasks,changed,reason:changed?'Tarefa vinculada atualizada.':'Nenhuma tarefa vinculada precisou de atualização.'};
  }
  const syncSummary=(projects,tasks)=>{
    const p=arr(projects).filter(obj), t=arr(tasks).filter(obj);
    let linked=0, mismatch=0, orphan=0;
    t.filter(x=>ident(x.projectWeekId)&&ident(x.projectStepId)&&ident(x.projectId)).slice(0,500).forEach(task=>{
      const project=p.find(x=>projectId(x)===ident(task.projectId));
      const step=arr(project?.lifeGuide?.weeks).filter(obj).flatMap(w=>arr(w.steps).filter(obj).map(s=>({w,s}))).find(x=>ident(x.w.id)===ident(task.projectWeekId)&&ident(x.s.id)===ident(task.projectStepId))?.s;
      if(!step){orphan++;return;}
      linked++;if(done(step)!==done(task))mismatch++;
    });
    return {linked,mismatch,orphan,canReview:mismatch>0||orphan>0,disclaimer:'Este diagnóstico é local. Não valida sincronização entre dispositivos.'};
  };
  root.LifePlanLink154=Object.freeze({version:'15.4.1',readProgress,taskToProjects,stepToTasks,syncSummary});
})(typeof window==='object'?window:globalThis);
