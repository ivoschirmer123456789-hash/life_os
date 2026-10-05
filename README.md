# LIFE OS 8.1 — Quality Assured Edition

Esta build substitui a 8.0 APEX como pacote recomendado.

## Entradas
- `index.html` — aplicativo LIFE OS
- `landing.html` — página pública
- `support.html`, `privacy.html`, `terms.html` — páginas auxiliares

## QA
- `QA_REPORT_8.1.md` — resumo legível
- `QA_RESULTS.json` — resultados detalhados
- `STATIC_AUDIT_8.1.json` — referências/HTML/CSS/PWA

## Publicação
Publique a pasta inteira, sem misturar assets de versões anteriores. O Service Worker já usa um cache próprio da 8.1.0.
