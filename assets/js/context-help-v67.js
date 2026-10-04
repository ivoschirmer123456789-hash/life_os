(function(){
  'use strict';
  const HELP={
    'task-create':{title:'Nova tarefa',what:'Transforma algo que precisa acontecer em uma ação visível.',use:['Escreva uma ação clara.','Adicione prazo ou prioridade somente quando isso ajudar.','Salve e volte ao Hoje para executar.'],day:'Ajuda a tirar pendências da cabeça e reduzir o risco de esquecer.',example:'Em vez de “trabalho de química”, use “terminar conclusão do trabalho de química”.'},
    'task-list':{title:'Lista de tarefas',what:'Reúne ações abertas e concluídas para você decidir o próximo passo.',use:['Use busca e filtros para reduzir a lista.','Abra a tarefa para revisar prazo e contexto.','Marque como concluída quando realmente terminar.'],day:'Evita depender da memória para acompanhar várias obrigações.',example:'Filtrar tarefas de escola antes de começar uma sessão de estudos.'},
    'task-goals':{title:'Metas',what:'Guarda resultados maiores que precisam de várias ações ao longo do tempo.',use:['Escreva o resultado desejado.','Crie tarefas menores que contribuam para ele.','Revise o progresso sem transformar a meta em cobrança constante.'],day:'Conecta pequenas ações do dia a algo maior.',example:'Meta “terminar projeto” pode gerar tarefas de pesquisa, roteiro e revisão.'},
    'task-habits':{title:'Hábitos e rotina',what:'Ajuda a lembrar comportamentos recorrentes que fazem sentido para sua rotina.',use:['Escolha poucos hábitos.','Defina uma frequência realista.','Marque quando acontecer e ajuste se a rotina mudar.'],day:'Dá consistência sem precisar recriar a mesma tarefa todos os dias.',example:'Separar 15 minutos para revisar anotações após a aula.'},
    'study-mastery':{title:'Study Engine',what:'Transforma estudo em ciclos de entender, tentar lembrar, praticar, corrigir e revisar.',use:['Escolha uma etapa da trilha.','Estude o conceito.','Tente recuperar da memória sem olhar.','Faça exercícios e registre erros.'],day:'Mostra o que ainda precisa de atenção em vez de contar apenas tempo estudado.',example:'Depois de aprender equação, resolver uma questão sem consultar o exemplo.'},
    'study-errors':{title:'Caderno de erros',what:'Guarda erros úteis para você descobrir o motivo e não apenas copiar a resposta correta.',use:['Registre a questão ou situação.','Explique por que errou.','Escreva a regra que teria evitado o erro.','Reveja depois.'],day:'Transforma erro em material de revisão.',example:'“Troquei o sinal ao passar o termo; conferir operação antes de simplificar.”'},
    'study-flashcards':{title:'Flashcards',what:'Treina recuperação ativa: lembrar antes de conferir a resposta.',use:['Crie perguntas curtas.','Responda sem olhar.','Confira e marque dificuldade.','Repita depois de um intervalo.'],day:'Fortalece memória de definições, fórmulas, vocabulário e relações.',example:'Frente: “O que é mitose?” Verso: resposta em poucas frases.'},
    'study-reviews':{title:'Revisões',what:'Recoloca conteúdos importantes no momento certo para reduzir esquecimento.',use:['Revise primeiro o que está mais fraco.','Tente lembrar antes de reler.','Faça uma questão curta.','Adie o conteúdo que já está firme.'],day:'Evita recomeçar do zero perto da prova.',example:'Rever frações dois dias depois do primeiro estudo e novamente na semana seguinte.'},
    'finance-new':{title:'Movimentação',what:'É um registro de dinheiro que entrou ou saiu.',use:['Escolha Entrada ou Saída.','Descreva o que aconteceu.','Informe valor, categoria e data reais.'],day:'Cria a base para saldo, orçamento e revisão do mês terem sentido.',example:'“Lanche · Saída · R$ 18 · Alimentação”.'},
    'finance-budget':{title:'Orçamento mensal',what:'É um limite de referência escolhido por você para comparar planejamento e gastos registrados.',use:['Defina um valor somente se ele ajudar.','Registre gastos normalmente.','Compare durante o mês.','Ajuste quando a realidade mudar.'],day:'Dá contexto antes de gastar, sem transformar o limite em punição.',example:'Perceber no meio do mês que uma categoria já consumiu boa parte do planejado.'},
    'finance-goals':{title:'Metas financeiras',what:'Organizam uma compra ou objetivo futuro em vez de tratar tudo como gasto imediato.',use:['Dê um nome claro.','Defina valor e prazo quando fizer sentido.','Acompanhe o que realmente foi separado.','Ajuste o prazo se necessário.'],day:'Ajuda a planejar antes de comprar.',example:'Guardar aos poucos para um curso ou equipamento.'},
    'finance-history':{title:'Histórico financeiro',what:'É a memória das movimentações que você registrou.',use:['Pesquise por descrição ou categoria.','Compare períodos.','Procure repetições e mudanças.','Corrija registros errados quando necessário.'],day:'Ajuda a enxergar padrões que não aparecem olhando uma compra isolada.',example:'Ver quanto foi gasto com transporte no mês.'},
    'finance-learning':{title:'Biblioteca prática de Finanças',what:'Explica os conceitos antes de pedir que você use uma ferramenta.',use:['Comece por entradas e saídas.','Depois entenda saldo e categorias.','Só então avance para orçamento, metas, juros e segurança.'],day:'Ajuda a interpretar números em vez de apenas preencher campos.',example:'Entender por que “parcela pequena” não significa necessariamente “custo total pequeno”.'},
    'kitchen-pantry':{title:'Minha Cozinha · Despensa',what:'Guarda o que você já tem em casa para o LIFE comparar com receitas.',use:['Cadastre ingrediente.','Adicione quantidade aproximada.','Informe validade quando souber.','Atualize quando usar ou comprar.'],day:'Reduz compras repetidas e ajuda a escolher receitas com menos ingredientes faltando.',example:'Ovos · 6 unidades · validade informada.'},
    'kitchen-preferences':{title:'Preferências da cozinha',what:'Dá contexto para sugestões e adaptações de receitas.',use:['Anote alimentos que evita.','Registre restrições já conhecidas.','Informe estilo alimentar apenas se realmente usar.'],day:'Evita receber receitas que você não pretende preparar.',example:'“Não gosto de coentro” ou uma alergia já diagnosticada.'},
    'kitchen-matches':{title:'Combina com sua despensa',what:'Compara ingredientes cadastrados com a lista de cada receita.',use:['Cadastre alguns ingredientes.','Veja a porcentagem de compatibilidade.','Abra a receita.','Envie apenas o que falta para Compras.'],day:'Ajuda a aproveitar alimentos que já estão em casa.',example:'Uma receita com 5 de 7 ingredientes cadastrados aparece antes de outra com 1 de 8.'},
    'kitchen-shopping':{title:'Lista de compras',what:'Guarda o que realmente falta para casa ou para uma receita.',use:['Adicione manualmente ou por uma receita.','Marque quando comprar.','Remova itens antigos.'],day:'Evita depender de memória no mercado e reduz compras duplicadas.',example:'Abrir uma receita e adicionar apenas os ingredientes que não estão na despensa.'},
    'recipe-library':{title:'Biblioteca de receitas',what:'Reúne receitas por busca, categoria e favoritos.',use:['Pesquise ingrediente ou prato.','Use filtros para reduzir opções.','Abra a receita antes de começar.','Leia o passo a passo inteiro.'],day:'Ajuda a decidir o que cozinhar sem navegar por dezenas de fontes.',example:'Buscar “frango” e filtrar preparos rápidos.'},
    'life-projects':{title:'Projetos',what:'Agrupa várias ações que juntas entregam um resultado maior.',use:['Crie o projeto.','Defina a próxima ação.','Associe tarefas.','Revise o que está travando.'],day:'Impede que trabalhos grandes virem uma única tarefa vaga.',example:'“Feira de ciências” com pesquisa, materiais, experimento e apresentação.'},
    'life-goals':{title:'Metas',what:'Mostra resultados que você quer construir ao longo do tempo.',use:['Defina uma meta concreta.','Relacione projetos ou hábitos.','Revise sem depender de motivação diária.'],day:'Mantém direção entre tarefas pequenas.',example:'Aprender um conteúdo até determinada prova.'},
    'life-habits':{title:'Hábitos',what:'Acompanha ações que se repetem e que você decidiu manter.',use:['Escolha poucos.','Use frequência realista.','Registre quando acontecer.','Ajuste sem “zerar” seu progresso.'],day:'Ajuda a construir constância.'},
    'life-agenda':{title:'Agenda',what:'Organiza compromissos ligados a horário e data.',use:['Registre o evento.','Confira conflitos.','Use lembrete quando necessário.'],day:'Ajuda a visualizar quando algo acontece, não apenas o que precisa ser feito.',example:'Prova às 8h e treino às 18h.'},
    'archive-history':{title:'Arquivo',what:'Mostra registros históricos do que aconteceu no LIFE.',use:['Use filtros.','Abra um registro para conferir contexto.','Use o histórico para revisar, não para se cobrar.'],day:'Cria continuidade entre semanas e meses.'}
  };
  const AREA={
    'Hoje':['Hoje','É o painel do seu dia. Use para escolher a próxima ação, não para guardar tudo.'],
    'Tarefas':['Tarefas','Organiza ações, prazos, metas e hábitos.'],
    'Notas':['Notas','Guarda ideias e informações para você não depender da memória.'],
    'Estudos':['Estudos','Transforma um assunto em uma sequência de aprendizado e revisão.'],
    'Fitness':['Fitness','Reúne treino, execução, recuperação e alimentação em um fluxo de acompanhamento.'],
    'Receitas':['Receitas','Ajuda a escolher, preparar e repetir receitas usando sua cozinha como contexto.'],
    'Finanças':['Finanças','Organiza seus próprios registros para você entender entradas, saídas e planejamento.'],
    'IA':['LIFE AI','Ajuda a interpretar o que já existe no seu LIFE e a transformar dúvida em próxima ação.'],
    'Life':['Planejamento','Conecta metas, projetos, hábitos e agenda.'],
    'Evolução':['Evolução','Reúne sinais de progresso ao longo do tempo sem transformar tudo em ranking.'],
    'Biblioteca':['Biblioteca','Centraliza conteúdos e atalhos pesquisáveis.'],
    'Meu LIFE':['Meu LIFE','Reúne itens pessoais, fixados e recentes.'],
    'Perfil':['Perfil','Controla conta, preferências e experiência do LIFE.'],
    'Configurações':['Configurações','Ajusta visual, comportamento e preferências do sistema.']
  };
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function currentArea(){ return document.querySelector('[data-life-view]')?.getAttribute('data-life-view') || 'LIFE'; }
  function titleOf(el){
    const h=el.querySelector(':scope > h1,:scope > h2,:scope > h3,:scope > div > h1,:scope > div > h2,:scope > div > h3');
    return (h?.textContent||el.getAttribute('data-life-section')||'Esta área').trim().slice(0,80);
  }
  function generic(el){
    const area=currentArea(), a=AREA[area]||[area,'Esta parte reúne ferramentas relacionadas ao seu dia.'];
    const title=titleOf(el);
    return {title,what:'Este bloco faz parte de '+a[0]+'. '+a[1],use:['Leia o objetivo do bloco.','Preencha ou escolha somente o que fizer sentido agora.','Use o resultado para decidir a próxima ação.'],day:'A função existe para reduzir etapas manuais e deixar claro o que fazer em seguida.',example:'Comece com um registro simples; depois acrescente detalhes quando eles realmente ajudarem.'};
  }
  function openHelp(el){
    const key=el.getAttribute('data-life-section')||'', info=HELP[key]||generic(el);
    document.getElementById('life-context-help-v67')?.remove();
    const modal=document.createElement('div'); modal.id='life-context-help-v67'; modal.className='life-context-help-v67';
    modal.innerHTML='<article><header><div><small>COMO FUNCIONA? · '+esc(currentArea()).toUpperCase()+'</small><h2>'+esc(info.title)+'</h2></div><button type="button" data-close>×</button></header><section><h3>O QUE É</h3><p>'+esc(info.what)+'</p></section><section><h3>COMO USAR</h3><ol>'+info.use.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></section><section class="impact"><h3>COMO AJUDA NO DIA</h3><p>'+esc(info.day)+'</p></section><section><h3>EXEMPLO PRÁTICO</h3><p>'+esc(info.example||'Use um caso real seu para entender a ferramenta antes de adicionar muitos dados.')+'</p></section><footer><button type="button" data-close>ENTENDI</button></footer></article>';
    modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-close]'))modal.remove();});
    document.body.appendChild(modal);
  }
  function addButton(el){
    if(!el||el.dataset.lifeHelpV67==='1'||el.closest('#life-context-help-v67'))return;
    el.dataset.lifeHelpV67='1';
    const b=document.createElement('button'); b.type='button'; b.className='life-micro-how-v67'; b.innerHTML='<span class="material-symbols-rounded">help</span> Como funciona?';
    b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openHelp(el);});
    el.insertBefore(b,el.firstChild);
  }
  function scan(){
    document.querySelectorAll('[data-life-section]').forEach(addButton);
    document.querySelectorAll('.life-app36-panel,.life-finance-card,.life-fin-command-v3,.life-editorial,.life-recipe-match,.life-knowledge-map-v4,.life-study-universe-v6,.life-mastery-v3,.life-nut-studio,.life-disclosure,.v38-section,.life-exercise-library,.life-ai-workspace-v4,.life-project-hub-v4').forEach(addButton);
  }
  let pending=false; const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;scan();});};
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',schedule); schedule();
})();
