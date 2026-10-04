# LIFE OS 6.5 — Cross-tab Audit

## Escopo
Revisão de falhas em que uma ação específica abria conteúdo genérico, parcial ou da área errada, além de uma camada visual específica por módulo.

## Fluxos corrigidos
- Biblioteca: atalhos internos filtram a biblioteca; prateleiras avançadas levam ao recurso certo.
- Notas: resultados/itens recentes podem abrir a nota correspondente.
- Finanças: registros recentes apontam para a movimentação correta e recebem destaque temporário.
- Arquivo: registros recentes apontam para o item correto e recebem destaque temporário.
- Receitas: “Favoritas” é um filtro real, não uma rota para a biblioteca completa.
- Planejamento/Organização: metas, hábitos e agenda encontrados na busca chegam ao setor correto.
- Cozinha: despensa/lista de compras ficam em Receitas/KITCHEN OS.
- Fitness: treino híbrido continua usando a rota de semana completa; atalhos de biblioteca usam a rota canônica.
- LIFE AI: Workspace abre a aba Workspace quando disponível.

## Identidade visual
A camada `app-suite-v65.css` reforça uma gramática própria por app e cobre desktop/mobile. O objetivo foi evitar a sensação de que todas as abas são o mesmo dashboard recolorido.

## Preservado
Autenticação, Owner, Supabase, pagamento e schema de banco não foram alterados.
