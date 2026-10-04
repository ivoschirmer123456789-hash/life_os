# LIFE OS 6.8 — Product Architecture

## Princípio
O LIFE continua sendo um ecossistema, mas cada aba deve se comportar como um aplicativo individual: propósito claro, entrada própria, ciclo de uso, microáreas coerentes, ajuda contextual, estados vazios, conteúdo e navegação que não dependem de o usuário conhecer a arquitetura interna.

## Camada FREE
A FREE funciona como demonstração utilizável. Ela não é um site vazio e também não replica o PRO. O objetivo é permitir que a pessoa entenda a proposta de cada app com o mínimo necessário.

| App | FREE | PRO |
|---|---|---|
| Hoje | checklist essencial | organização/contexto conectado |
| Tarefas | captura + 4 visíveis | central, projetos, planejamento e revisão |
| Notas | captura + 4 recentes | busca, transformação e biblioteca completa |
| Estudos | 6 assuntos + 2 etapas | catálogo, trilhas, mastery, revisões e mapa |
| Fitness | 3 sessões starter | biblioteca, híbridos, programas, personalizados e progresso |
| Receitas | 4 receitas starter | Kitchen, Minha Cozinha, compras, favoritos e descoberta |
| Finanças | registro + saldo + 3 recentes | histórico, orçamento, metas, Biblioteca Prática e análises |
| LIFE AI | chat simples | contexto, workspace, memória, ações e conexões |
| Planner | metas simples | projetos, hábitos, agenda e semana |
| Evolução | resumo 7 dias | tendências e análise cruzada |
| Biblioteca | 6 amostras | hub universal completo |
| Favoritos | contadores | coleções e abertura de itens |
| Meu LIFE | 3 recentes | cockpit conectado |
| Archive | 5 registros | exploração histórica completa |

## Persuasão sem urgência falsa
O FREE exibe prévias organizadas do PRO, explica o benefício concreto e mostra o que muda no fluxo. Não há contagem regressiva inventada, vagas falsas ou alegação de desconto inexistente.

## Gates centrais
Conteúdo premium é protegido tanto na interface quanto nas rotas de abertura:
- receitas;
- treinos e híbridos;
- exercício fora das sessões starter;
- Guia LIFE;
- busca universal;
- treinos personalizados;
- LIFE AI contextual;
- áreas avançadas.

Isso impede que o usuário contorne o plano abrindo um item pelo histórico, favoritos, cards da IA ou resultados de busca.

## LIFE AI FREE
O chat FREE recebe contexto mínimo do backend. Não recebe automaticamente registros pessoais, memória, catálogo interno completo ou contexto cruzado. Ações retornadas pelo backend são ignoradas no FREE. O workspace completo é PRO.

## Apps como produtos
Cada app recebe um ciclo explícito. A camada visual usa um tema próprio, mas conserva navegação, tipografia e padrões de interação do LIFE para não parecer um conjunto de sites desconectados.

## Limites de validação
A auditoria estática valida referências, sintaxe, cache, CSS, IDs e regras presentes no front-end. Login real, RLS, Supabase, Mercado Pago, push real e comportamento em dispositivos físicos exigem teste no deploy com os serviços conectados.
