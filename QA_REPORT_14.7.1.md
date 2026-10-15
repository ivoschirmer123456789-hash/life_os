# LIFE OS 14.7.1 — Auditoria de manutenção do Cognitive Engine

Base: projeto integral 14.7.0. Não houve remodelação visual, remoção de abas, alteração de Supabase ou pagamentos.

## Correções reais
- Teste de regressão ainda verificava a versão 14.6.5 no manifest/index, apesar de anunciar a versão 14.7.0. Expectativas alinhadas ao build atual.
- Prioridades agora reconhecem datas ISO com horário (`YYYY-MM-DDTHH:mm...`) além de datas simples.
- O bônus de feedback positivo agora opera sobre cópias de sugestões retornadas pelo motor base, evitando mutação inadvertida das sugestões originais.
- Ordenação das sugestões tolera prioridades ausentes ou não numéricas.

## Verificações
- 4 suítes de testes do build 14.7.0: concluídas com saída 0.
- Sintaxe JavaScript/CJS: todos os scripts locais verificados com `node --check`.
- Referências de HTML e recursos pré-cacheados no Service Worker: sem ausências.
- ZIP com integridade CRC verificada e index.html na raiz.

## Limitações
- Não foi executado teste ponta a ponta com contas autenticadas FREE, PRO ou OWNER no site publicado.
- Não foram testados cobrança real, webhooks, Supabase remoto, dados de diferentes dispositivos, serviços de clima ou IA externa.
- Os testes existentes são sobretudo estáticos e isolados; a ausência de falhas neles não garante ausência de defeitos em produção.
- Esta revisão não implementa os recursos avançados ainda pendentes do roadmap de 17 melhorias.
