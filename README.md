# LIFE OS 14.4 — Power Premium Refinement

Versão completa construída sobre o aplicativo 14.3 (derivado da 14.2.1), mantendo a navegação, seus arquivos de autenticação, geradores, integrações e regras FREE/PRO/OWNER. **Não é uma imagem usada como site.**

## Mudanças visuais

1. Luz cinematográfica e maior profundidade dos painéis da Home.
2. Botões com relevo, foco de teclado, hover e resposta ao toque.
3. Gráficos com progresso diário real; categorias sem dados não mostram percentuais inventados.
4. Hero mais imersivo, mantendo contraste e legibilidade do texto.
5. Melhorias de dimensionamento e alvos de toque no mobile.
6. LIFE AI com identidade azul-ciano, painel, chat e indicadores distintos.

O estilo adicional foi isolado em `assets/css/power-refinement-14.4.css`, carregado depois do CSS da 14.3. A lógica principal permanece em `assets/js/life-app-9.4.2.js`; foram acrescentados apenas cálculos de progresso baseados nas tarefas para os novos indicadores.

## Publicar

Extraia o ZIP e envie todo o conteúdo para a raiz do repositório (com `index.html` na raiz). Publicar em ambiente de teste na Vercel antes de substituir produção. O service worker foi atualizado para forçar a nova revisão de assets. O projeto não depende de imagens hospedadas externamente para a Home: as decorações WebP e ícones SVG estão dentro do ZIP.

## Limites de homologação

Os testes locais verificam sintaxe, integridade, estrutura, lógicas isoladas e aparência ilustrativa, mas **não** comprovam login real, pagamentos, sincronização em dois aparelhos nem chamadas remotas da LIFE AI; isso exige testar a implantação configurada no servidor. A primeira carga das bibliotecas React pode requerer conexão à internet.

Veja `QA_REPORT_14.4.md`.
