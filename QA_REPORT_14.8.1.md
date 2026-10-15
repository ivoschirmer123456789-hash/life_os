# LIFE OS 14.8.1 — Correção localizada da Busca Inteligente

## Problema relatado
O painel **“Encontre qualquer recurso ou peça para a IA direcionar você”** extrapolava sua área e se sobrepunha a perguntas e campos de formulários.

## Causa identificada
No layout PRO, o componente `.life-smart-hub` é irmão do contêiner `.v18-shell` dos formulários, mas possuía `z-index:65`. Isso o colocava acima dos diálogos renderizados no contêiner do aplicativo, mesmo quando estes precisavam receber interação. A caixa `.life-smart-suggest` era posicionada de forma absoluta para fora do cartão, podendo cobrir elementos abaixo.

## Alterações
- Adicionado somente `assets/css/smart-hub-containment-14.8.1.css` para reduzir a ordem visual do painel, limitá-lo à largura disponível e renderizar resultados de busca **dentro** do cartão, com rolagem interna de altura limitada.
- Ajustes estritamente locais de largura e quebra de texto para mobile.
- `index.html`, `service-worker.js`, `manifest.webmanifest` e campo de build da configuração atualizados para **14.8.1**, para o PWA carregar o novo CSS. A estrutura do DOM e as telas do aplicativo não foram remodeladas.
- As versões esperadas por alguns testes históricos foram atualizadas para o build 14.8.1 (somente nos próprios testes).
- Nenhuma alteração nos módulos de lógica, conteúdo dos formulários, integração da LIFE AI, pagamentos, Supabase ou demais folhas de estilo.

## Validações
- **72 verificações de layout** em componentes representativos com CSS real: 360, 390, 412, 768, 1024 e 1440 px × modo noite/dia. Conferidos: painel dentro da largura, resultados contidos, diálogo acima da busca, pergunta acessível e ausência de rolagem horizontal.
- **35 cenários de lógica + 400 entradas imperfeitas**, testes cognitivos e de usabilidade passaram.
- 8 das 9 suítes históricas `.cjs` passaram após atualizar os identificadores de build nos testes. A suíte `audit-14.7.2.cjs` permanece com a mesma falha de interpretação de data/fuso presente no ZIP **14.8.0 de origem** (`Prazo hoje` vs `Prazo anterior`); nenhum código correspondente foi alterado.
- 21 arquivos JavaScript e 20 folhas CSS conferidos sintaticamente.
- 29 referências de recursos do HTML e 55 entradas locais do service worker encontradas.
- Arquivos visual e funcionalmente não relacionados permaneceram intactos (comparação de bytes com ZIP 14.8.0).

## Limitações
- A navegação direta do navegador de teste para localhost foi bloqueada no ambiente. Os testes visuais usaram um **fixture representativo com as folhas CSS reais embutidas**; não são capturas de sessão autenticada ou testes ponta a ponta no domínio publicado.
- Confirmar na Vercel com conta PRO: questionários de Fitness/Alimentação, lista de sugestões da Busca Inteligente, tema dia/noite, celular e desktop.

## Publicação
Faça backup da versão em produção. Extraia o ZIP inteiro, mantenha `index.html` na raiz e envie todos os arquivos ao mesmo repositório. Confirme o build 14.8.1 e recarregue o PWA para ativar o novo cache.
