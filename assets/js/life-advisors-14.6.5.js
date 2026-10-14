/* LIFE OS 14.6.5 · conteúdo educativo verificável por tema, sem promessas de atendimento clínico. */
(function(root){'use strict';
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  // Títulos reais de livros, materiais didáticos e fontes institucionais.
  // Canais são termos de pesquisa, não links para vídeos individuais verificados.
  const DATA=[
    {id:'math',words:['matematica','algebra','geometria','trigonometria','numeros','calculo','estatistica','probabilidade'],books:['Fundamentos de Matemática Elementar — Gelson Iezzi e colaboradores','O Homem que Calculava — Malba Tahan'],channels:['Khan Academy Brasil','Professor Ferretto'],method:'Resolva questões novas, registre o erro e tente explicar cada passo.'},
    {id:'physics',words:['fisica','mecanica','cinematica','dinamica','eletricidade','optica','ondulatoria'],books:['Física Conceitual — Paul G. Hewitt','Fundamentos de Física — Halliday, Resnick e Walker'],channels:['Khan Academy Brasil','Professor Boaro'],method:'Desenhe o fenômeno e confira unidades antes de aplicar fórmulas.'},
    {id:'chem',words:['quimica','estequiometria','equilibrio quimico','organica','atomos','reacoes'],books:['Química na Abordagem do Cotidiano — Tito e Canto','Química — Martha Reis'],channels:['Química em Ação','Khan Academy Brasil'],method:'Faça o esquema de reagentes e produtos e explique por que a transformação acontece.'},
    {id:'bio',words:['biologia','celula','genetica','ecologia','microbiologia','imunologia','bioquimica','anatomia','fisiologia'],books:['Biologia Moderna — Amabis e Martho','A Vida Imortal de Henrietta Lacks — Rebecca Skloot'],channels:['Biologia Total','Khan Academy Brasil'],method:'Relacione estruturas, funções e exemplos sem confundir ciência com aconselhamento médico.'},
    {id:'writing',words:['redacao','gramatica','portugues','interpretacao','lingua portuguesa'],books:['A Arte de Escrever Bem — Dad Squarisi e Arlete Salvador','Manual de Redação e Estilo — Eduardo Martins'],channels:['Professor Noslen','Brasil Escola'],method:'Escreva um parágrafo, compare com os critérios e reescreva após corrigir.'},
    {id:'literature',words:['literatura','livros','leitura','poesia'],books:['Como Ler Livros — Mortimer J. Adler e Charles Van Doren','A Hora da Estrela — Clarice Lispector'],channels:['Brasil Escola','Literatura em Vídeo'],method:'Resuma em palavras próprias o tema e o argumento principal do texto.'},
    {id:'history',words:['historia','brasil colonia','revolucao','idade media'],books:['História do Brasil — Boris Fausto','Uma Breve História do Mundo — E. H. Gombrich'],channels:['Se Liga Nessa História','Brasil Escola'],method:'Construa uma linha do tempo e compare causas, consequências e fontes.'},
    {id:'geography',words:['geografia','geopolitica','clima','relevo','mapas'],books:['Geografia Geral e do Brasil — Eustáquio de Sene e João Carlos Moreira'],channels:['Brasil Escola','Descomplica'],method:'Use mapas e dados de fontes identificadas antes de generalizar tendências.'},
    {id:'philosophy',words:['filosofia','sociologia','etica','pensamento critico'],books:['O Mundo de Sofia — Jostein Gaarder','Convite à Filosofia — Marilena Chaui'],channels:['Isto Não É Filosofia','Brasil Escola'],method:'Identifique a pergunta, compare duas posições e formule sua justificativa.'},
    {id:'english',words:['ingles','english','idiomas','espanhol','alemao','frances'],books:['English Grammar in Use — Raymond Murphy'],channels:['BBC Learning English','British Council LearnEnglish'],method:'Combine escuta, repetição, produção própria e revisão espaçada.'},
    {id:'coding',words:['programacao','javascript','python','algoritmo','codigo','computacao','software','inteligencia artificial','sql'],books:['Entendendo Algoritmos — Aditya Y. Bhargava','Eloquent JavaScript — Marijn Haverbeke'],channels:['Curso em Vídeo','freeCodeCamp.org'],method:'Implemente um exemplo pequeno, teste casos extremos e explique como corrigiu falhas.'},
    {id:'finance',words:['financas','economia','dinheiro','orcamento','investimento','bolsa de valores'],books:['A Psicologia Financeira — Morgan Housel','Cidadania Financeira — Banco Central do Brasil (material gratuito)'],channels:['Banco Central do Brasil','CVM Educacional'],method:'Separe gastos reais, metas e hipóteses; nunca trate rentabilidade como garantida.'},
    {id:'habits',words:['habitos','produtividade','rotina','procrastinacao','foco','disciplina'],books:['Hábitos Atômicos — James Clear','O Poder do Hábito — Charles Duhigg'],channels:['TED-Ed','Khan Academy'],method:'Comece com uma tarefa pequena, registre o que funcionou e ajuste a frequência.'},
    {id:'health',words:['nutricao','alimentacao','nutricionista','refeicoes','comida','receitas','saude'],books:['Guia Alimentar para a População Brasileira — Ministério da Saúde (gratuito)'],channels:['Ministério da Saúde','Panelinha'],method:'Priorize variedade, regularidade e preferências pessoais; não use dietas restritivas.'},
    {id:'fitness',words:['fitness','treino','musculacao','personal','exercicio','atividade fisica','condicionamento'],books:['Guia de Atividade Física para a População Brasileira — Ministério da Saúde (gratuito)'],channels:['Ministério da Saúde','Khan Academy'],method:'Progrida gradualmente, com técnica, descanso e opções adequadas ao seu contexto.'},
    {id:'wellbeing',words:['psicologia','bem estar','emocao','ansiedade','estresse','psicologo','sono','autoconhecimento'],books:['Autocompaixão — Kristin Neff'],channels:['Fiocruz','UNICEF Brasil'],method:'Apoie-se em estratégias cotidianas de cuidado e procure ajuda qualificada quando necessário.'}
  ];
  const choose=topic=>{const q=norm(topic);let best=null,score=0;for(const row of DATA){let n=0;for(const word of row.words){const w=norm(word);if(q===w)n=Math.max(n,100+w.length);else if(q.includes(w))n=Math.max(n,20+w.length);else if(w.includes(q)&&q.length>=4)n=Math.max(n,3);}if(n>score){best=row;score=n;}}return best;};
  const youtube=(channel,subject,step,mode)=>'https://www.youtube.com/results?search_query='+encodeURIComponent([channel,subject,step,mode].filter(Boolean).join(' '));
  function study(topic,stage,answers={}){
    const row=choose(topic)||choose(stage);if(!row)return null;
    const depth=norm(answers.level||'iniciante');
    const subject=String(topic||'Assunto').slice(0,90);
    const current=String(stage||'Fundamentos').slice(0,90);
    const suffix=depth.includes('avanc')?'questoes avancadas':depth.includes('inter')?'exercicios resolvidos':'aula para iniciantes';
    const videos=row.channels.slice(0,2).map((channel,i)=>({
      kind:'AULA / BUSCA POR ETAPA',title:channel+' · '+current,
      text:(i===0?'Comece por explicações do conceito da etapa. ':'Use a segunda fonte para tirar dúvidas. ')+row.method+' Abre uma pesquisa no YouTube; confirme o vídeo antes de usar.',
      url:youtube(channel,subject,current,suffix)
    }));
    videos.push({kind:'REVISÃO / QUESTÕES',title:'Exercícios de '+current,text:'Busque resoluções comentadas e compare com seu próprio raciocínio.',url:youtube(row.channels[0],current,'exercicios revisao')});
    return {id:row.id,books:row.books.slice(),videos,method:row.method,evidence:'Seleção editorial por área e etapa; não depende de histórico externo.'};
  }
  function answer(question,context={}){
    const text=norm(question);
    const asksResource=/(livro|leitura|bibliografia|material de estudo|video|aula|canal|youtube|indica|recomenda).*?(sobre|para|de|em|aprender|estudar)/.test(text) || /(me indica|recomende|sugira).*?(livro|video|canal|aula)/.test(text);
    if(asksResource){
      const subject=String(question).replace(/^(?:me |voce )?(?:indique|recomende|sugira|qual|quais|quero|melhor|livros?|videos?|aulas?|canais?)[\s\S]*?(?:sobre|de|para aprender|em)\s*/i,'').trim();
      const entry=choose(subject)||choose(question)||choose(context.priority);
      if(!entry)return {text:'Posso recomendar livros e pesquisas de aulas por assunto e nível. Diga um tema específico (por exemplo: Matemática, Redação, Inglês, Programação ou Física) para eu não inventar uma indicação genérica.',action:{type:'navigate',target:'Estudos',label:'Abrir Estudos',go:'Estudos'}};
      const cur=study(subject||entry.words[0],subject||entry.words[0],{});
      return {text:'Seleção educativa relacionada ao assunto que você informou.\n\nLivros e materiais:\n'+cur.books.map((b,i)=>(i+1)+'. '+b).join('\n')+'\n\nVídeos: pesquise o tema no canal '+entry.channels.join(' ou ')+'. '+cur.method+'\n\nOs links de vídeo são pesquisas, não aulas verificadas individualmente.',action:{type:'navigate',target:'Estudos',label:'Abrir planejador de estudos',go:'Estudos'},kind:'educational-curation'};
    }
    if(/(nutricionista|plano alimentar|orientacao alimentar)/.test(text))return {text:'Posso ajudar a organizar opções variadas de refeições conforme seus horários, preferências e ingredientes disponíveis. Não substituo um nutricionista nem prescrevo dietas ou metas de peso. Conte quais horários e alimentos você costuma ter à disposição para montar ideias flexíveis.',action:{type:'navigate',target:'Receitas',label:'Abrir Alimentação',go:'Receitas'},kind:'general-support'};
    if(/(psicologo|terapia|saude mental|ansiedade|estresse)/.test(text))return {text:'Posso apoiar com organização da rotina, estratégias gerais de foco e conversas acolhedoras. Não faço diagnósticos nem substituo psicólogo. Se o que você está passando afetar seu dia a dia, converse com um adulto de confiança ou um profissional qualificado. Se quiser, podemos começar identificando uma preocupação prática e uma ação pequena.',action:{type:'navigate',target:'Life',label:'Abrir Rotina',go:'Life'},kind:'wellbeing-support'};
    if(/(personal trainer|treinador|orientacao de treino)/.test(text))return {text:'Posso explicar exercícios, ajudar a escolher uma rotina de atividade física e organizar treinos de forma gradual, respeitando descanso e técnica. Não substituo avaliação presencial de um profissional habilitado. Comece contando seu objetivo de saúde, experiência e dias disponíveis.',action:{type:'navigate',target:'Fitness',label:'Abrir Fitness',go:'Fitness'},kind:'fitness-support'};
    return null;
  }
  root.LifeAdvisors1465=Object.freeze({study,answer,categories:DATA.map(x=>({id:x.id,words:x.words.slice()}))});
})(typeof window!=='undefined'?window:globalThis);
