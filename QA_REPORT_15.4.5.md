# LIFE OS 15.4.5 — Correção reproduzida do cache do gerador

## Problema reportado
A tela do usuário continuava mostrando: “Você informou desconforto em um grupo de movimentos…” (versão 15.4.3). Essa frase não existe na lógica de geração da 15.4.4, mas reaparecia no navegador.

## Causa técnica identificada
O service worker antigo carregava `/assets/` do cache com `cache.match(req, {ignoreSearch:true})`, ignorando `?v=...`. Mesmo após publicar `index.html` atualizado, uma instalação ainda controlada pelo service worker antigo podia receber o JS da versão antiga no mesmo caminho.

## Correções
1. Arquivo principal renomeado para `assets/js/life-app-15.4.5.js` (antigo service worker não possui esse caminho no cache).
2. Arquivos `config`, `life-release` e CSS alterado também renomeados para impedir colisões com cache antigo.
3. `service-worker.js` agora usa `cache.match(req)` com a URL completa, respeitando a versão.
4. Identificação `V15.4.5` na barra do questionário e `GERADOR ATIVO · LIFE 15.4.5` na tela de resultado.
5. Ação `ATUALIZAR ARQUIVOS DO LIFE` no questionário e resultado: desregistra apenas o service worker do aplicativo, remove somente caches `life-os-*` e recarrega a página, sem apagar dados de conta/localStorage.
6. Pergunta sobre exclusão de movimentos reescrita para diferenciar preferência sem dor de dor/instabilidade. Em caso de dor/lesão ou dúvida de segurança, a restrição de segurança continua ativa.

## Testes concluídos
- 13/13 suítes .cjs de regressão.
- 288/288 combinações de geração usual com sessões válidas.
- 144/144 combinações de exclusão de movimentos por preferência, sem movimentos do grupo excluído.
- 4/4 verificações de número e texto das perguntas do questionário.
- 3/3 verificações em simulação de service worker (reprodução do cache antigo; bypass por novo nome; cache novo respeita query).
- 22/22 arquivos JS verificáveis por `node --check`.
- Integridade: 100 arquivos, `index.html` no topo, verificações de referências HTML/PWA e teste CRC ZIP.

## Limitações
O ambiente bloqueou `http://127.0.0.1` no Chromium (`ERR_BLOCKED_BY_ADMINISTRATOR`), impedindo a validação ponta-a-ponta da tela em navegador neste ambiente. Não houve acesso autenticado ao domínio publicado; portanto não foram testados pagamento, sincronização e o fluxo real de login. A simulação do service worker comprova o defeito da regra do cache, mas não substitui teste em produção.

## Confirmação após publicar
- Ver `LIFE / FITNESS / PERSONAL · V15.4.5` no alto do modal ou `GERADOR LOCAL · LIFE 15.4.5` no questionário.
- Quando marcar um movimento por **preferência sem dor**, o LIFE deve pedir a confirmação e mostrar a ficha adaptada (prévia FREE ou ficha PRO, conforme conta).
- Se a tela ainda não disser 15.4.5, o navegador/site segue antigo. Publicar a pasta completa e atualizar os arquivos do site; não atribuir o erro à nova lógica antes de verificar essa marca.
- Se houver dor, lesão, instabilidade ou dúvida de segurança, o LIFE continua pedindo avaliação e não prescreve automaticamente movimentos afetados.
