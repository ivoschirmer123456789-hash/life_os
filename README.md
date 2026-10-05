# LIFE OS 7.2.4 — PRO Flow Rebuild

Esta versão reconstrói o fluxo FREE → prévia PRO → planos → checkout.

## O que foi corrigido

- A prévia PRO e o comparativo de planos são renderizados via portal diretamente no `body`, evitando conflitos com `overflow`, `isolation` e `z-index` do app principal.
- `window.lifeOpenProPreview`, `window.lifeOpenProPlans` e `window.lifeStartProCheckout` formam uma bridge global de segurança.
- O runtime reconhece botões PRO e garante resposta ao clique.
- Se o modal React não aparecer, um modal de fallback independente é criado no DOM.
- O botão de planos possui fallback próprio.
- O runtime também reconhece o contexto da aba para mostrar uma prévia coerente com Fitness, Estudos, Receitas, Finanças, LIFE AI, Evolução e Biblioteca.
- Todos os assets críticos foram versionados como 7.2.4 para reduzir risco de cache de lógica antiga.

## Arquivos principais

- `index.html`
- `assets/css/life-bundle-7.2.4.css`
- `assets/js/life-app-7.2.4.js`
- `assets/js/context-help-v724.js`
- `assets/js/config-7.2.4.js`
- `assets/js/supabase-auth-7.2.4.js`
- `assets/js/runtime-7.2.4.js`
- `service-worker.js`

## Teste recomendado após o deploy

Com conta FREE:
1. toque em um recurso PRO;
2. confirme que aparece uma prévia contextual;
3. toque em `VER PLANOS E ASSINAR`;
4. confirme que aparece o comparativo FREE x PRO;
5. toque em `DESBLOQUEAR LIFE OS PRO` e valide a resposta do backend de checkout.

A aplicação não inclui segredos do Mercado Pago no frontend. O checkout real depende da função de backend publicada no Supabase.
