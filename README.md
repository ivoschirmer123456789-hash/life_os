# LIFE OS 7.0.0 — Exceptional

Esta versão parte da base estável 6.9 e adiciona uma camada final de qualidade de produto sem reabrir login, banco ou regras comerciais de forma desnecessária.

## O que mudou
- identidade visual aprofundada por app, mantendo o mesmo ecossistema;
- hierarquia de títulos, cards, formulários, estados vazios e CTAs refinada;
- FREE continua essencial, mas a apresentação do PRO ficou mais clara e premium;
- “Como funciona?” ganhou início rápido e orientação sobre o que evitar;
- modais recebem foco mais previsível, Escape e contenção de teclado;
- feedback de clique/toque e transições entre apps ficaram mais consistentes;
- login aceita Enter nos pontos esperados e ganhou mostrar/ocultar senha;
- estados online/offline recebem feedback discreto;
- runtime antigo foi substituído por um runtime 7.0 consolidado;
- Service Worker usa cache rápido para assets versionados e cacheia apenas hosts externos estáticos conhecidos (React/CDN/fontes), sem cachear API do Supabase;
- cache/build/manifest alinhados em 7.0.0.

## Arquivos principais
- `index.html`
- `assets/css/life-bundle-7.0.0.css`
- `assets/js/life-app-7.0.0.js`
- `assets/js/context-help-v70.js`
- `assets/js/config-7.0.0.js`
- `assets/js/supabase-auth-7.0.0.js`
- `assets/js/runtime-7.0.0.js`
- `service-worker.js`

## Validação local
A auditoria estática valida sintaxe, CSS, IDs, referências locais e shell do PWA. Supabase, Mercado Pago, push real e LIFE AI remoto dependem do ambiente publicado e precisam de teste com os serviços externos disponíveis.
