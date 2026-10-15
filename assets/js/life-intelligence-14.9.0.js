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
   return {text:'RELATÓRIO DE TREINO\n'+r.note+'\nDADOS DECLARADOS: '+r.facts.join('; ')+'\nAJUSTES JUSTIFICADOS: '+r.adjustments.join(' ')+'\nSEGURANÇA: '+r.clarification+'\nPRÓXIMA VERIFICAÇÃO: '+r.nextMeasure+'\nCampos ausentes: '+(r.missing.length?r.missing.join(', '):'nenhum no formulário.')};
  }
  if(/relatorio|diagnostico|livr/.test(q))return {text:'Para gerar um relatório específico, abra Estudos e conclua o questionário de aprendizagem ou Fitness e conclua o questionário de treino. O LIFE mostrará apenas dados informados, justificativas, fontes selecionadas e o que ainda precisa medir. Não inventarei resultados.'};
  return null;
 }
 root.LifeIntelligence149=Object.freeze({recommendBooks,studyReport,trainingReport,answer,version:'14.9.0'});
})(typeof window!=='undefined'?window:globalThis);
