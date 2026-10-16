# LIFE OS 15.4.4 — correção do bloqueio indevido no gerador de treinos

## Problema reproduzido

O questionário bloqueava automaticamente a geração ao escolher qualquer categoria específica de movimento que causasse desconforto (pernas, empurrar ou puxar), sem diferenciar **preferência de movimento sem dor** de **dor, instabilidade, lesão ou dúvida de segurança**. A captura de tela do usuário correspondia exatamente a esse bloqueio em `buildPfPlan()`.

## Correção no fluxo real

- Uma pergunta condicional aparece somente quando a pessoa seleciona um grupo de movimento: *prefiro não fazer, sem dor* versus *sinto dor/instabilidade* ou *não sei dizer*.
- No caso de preferência sem dor e sem indicação de lesão/condição médica, o gerador monta uma semana adaptada, filtrando antecipadamente os exercícios do grupo evitado a partir do catálogo, sem acrescentar sessões extras. Em movimentos de perna evitados, não prescreve cardio automaticamente. Limita a musculação a duas sessões semanais nessa situação.
- Se houver dor, instabilidade, condição médica ou incerteza, o LIFE mantém a orientação de consultar profissional qualificado/responsável, sem afirmar que outra variação é segura. As respostas permanecem preenchidas e o botão revisar direciona à pergunta condicional.
- As sugestões de fichas prontas e o refinamento externo não podem reintroduzir movimentos excluídos de uma ficha adaptada.
- Restaurar um rascunho na pergunta condicional 20 agora é permitido; cache, HTML, manifest e configuração marcam 15.4.4.

## Testes executados

- **288/288** combinações ordinárias de objetivo, local, dias e divisão com sessões não vazias.
- **144/144** combinações com exclusão de um dos três grupos para preferências sem dor, em diferentes ambientes e divisões; nenhum exercício listado pertence ao grupo marcado como evitado segundo o classificador do próprio gerador.
- **4/4** cenários de extensão condicional do questionário: 19 perguntas normais; 20 com grupo evitado.
- Casos com dor, dúvida não esclarecida e indicação médica continuam bloqueados por segurança.
- Testes de regressão e integridade executados no pacote: ver saída da auditoria local.

## Limitações

As verificações do gerador são testes isolados de lógica; não substituem teste end-to-end autenticado no domínio do usuário. Não foram validados login real, direitos PRO em nuvem, cobrança ou sincronização entre dispositivos. Uma preferência sem dor não prova segurança médica: o aplicativo não deve recomendar treinar diante de dor.

## Resultado da auditoria do pacote final

- 13 de 13 suítes JavaScript da versão anterior aprovadas novamente, ajustando somente as verificações que continham a versão ou o texto antigo da pergunta.
- 22 scripts JavaScript verificados com `node --check`.
- 32 referências locais do HTML e 67 itens do cache encontrados no pacote.
- Configuração, `index.html`, manifest e service worker consistentes com `15.4.4`.
- 100 arquivos no ZIP, sem logs temporários, e `index.html` na raiz.

A validação de interação completa **no domínio publicado do usuário** ainda não foi realizada. O teste específico do questionário verificou a estrutura condicional da pergunta e a lógica de geração correspondente.
