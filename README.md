# LIFE OS 7.2.1 — Connected Experience · Revised

A 7.2.1 revisa e estabiliza a 7.2: o LIFE em um sistema conectado: cada app continua independente, mas passa a compartilhar contexto através do histórico central.

## O que mudou
- LIFE Connect na Home PRO com atividade recente, métricas cruzadas e próximos passos.
- Fitness → Evolução/Receitas; Estudos → Notas/Evolução; Notas → Tarefas/Life; Finanças → Evolução; e outras pontes contextuais.
- Etapas dominadas no Study Engine entram no histórico central.
- Minha Cozinha e lista de compras registram mudanças úteis no histórico.
- Home reage ao que realmente aconteceu no LIFE, sem inventar dados.
- FREE mantém a arquitetura Starter (~20%); conexões profundas ficam no PRO.
- Cache/build/PWA atualizados para 7.2.1.
- Histórico central normalizado: registros inválidos/futuros antigos não distorcem LIFE Connect e Evolução.
- LIFE Connect ordena atividades por data, normaliza progresso de estudos, valores financeiros e listas antigas da Cozinha.
- Identificadores de atualização e páginas públicas alinhados com a versão real.

## Arquivos ativos
- assets/css/life-bundle-7.2.1.css
- assets/js/life-app-7.2.1.js
- assets/js/context-help-v721.js
- assets/js/config-7.2.1.js
- assets/js/supabase-auth-7.2.1.js
- assets/js/runtime-7.2.1.js

Serviços externos (Supabase, Mercado Pago, LIFE AI remoto e push) precisam ser validados no deploy real.
