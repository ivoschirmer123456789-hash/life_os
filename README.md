# LIFE OS 7.2.3 — Connected Experience · PRO Preview QA

Esta versão parte da 7.2.2 e corrige os caminhos PRO para que a experiência FREE nunca pareça quebrada ou genérica.

## Regra de produto
1. Usuário FREE toca em um recurso PRO.
2. O LIFE abre uma prévia **daquele recurso específico**.
3. A prévia mostra como funciona, passos, exemplo de tela e benefício.
4. O usuário pode continuar no FREE.
5. Só **Ver planos e assinar** abre o comparativo/checkout.

## Correções desta versão
- Busca inteligente de receitas agora mostra o Recipe Finder, não a busca de treino.
- Mapa de Conhecimento ganhou prévia própria.
- LIFE AI separa Planejador, Memória, Ações, Guia e organização do Hoje.
- Upgrade sugerido pela LIFE AI preserva a origem do recurso.
- Treinos personalizados salvos/recentes não caem mais em preview genérico.
- Plano alimentar personalizado sempre informa seu contexto ao abrir o PRO.
- Exercícios avançados mostram a Exercise Library, não Programas de Treino.
- Favoritos PRO, Biblioteca de Conhecimento e Guias da Biblioteca ganharam previews próprios.
- Teasers FREE de Tarefas, Notas, Estudos, Finanças e Planner são contextuais.
- Nenhuma chamada `openLifePro()` ativa ficou sem contexto.

## Arquivos ativos
- assets/css/life-bundle-7.2.3.css
- assets/js/life-app-7.2.3.js
- assets/js/context-help-v723.js
- assets/js/config-7.2.3.js
- assets/js/supabase-auth-7.2.3.js
- assets/js/runtime-7.2.3.js

## Validação
Veja `docs/QA_7_2_3.md` e `docs/STATIC_AUDIT_7_2_3.json`.

Supabase real, Mercado Pago, LIFE AI remoto e push precisam de validação após o deploy.
