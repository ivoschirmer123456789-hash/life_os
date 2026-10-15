# LIFE OS 14.7.0 — Cognitive Engine (evolução conservadora)

Base: ZIP completo 14.6.5, estrutura FREE/PRO, layout, clima, rolagem e demais módulos preservados.

## Implementado neste pacote
- Prioridades calculadas por prazo real e prioridade explicitamente registrada.
- Relações entre tarefas e projetos por IDs reais, sem adivinhar vínculos.
- Sugestões cruzando agenda e tarefas com fonte explicável.
- Simulações aritméticas de blocos para duração de tarefas registrada.
- Respostas locais contextualizadas para cenários e organização de prioridades.
- API local de memória, preferências e feedback com escopo por usuário; exige chamada explícita, sem gravação ou alteração automática de dados.
- Capacidade de esquecer a memória local explicitamente por usuário.
- Não envia informações para serviços externos nem executa ações automaticamente.

## O que ainda não foi concluído
As 17 ideias são um roadmap maior que este incremento. Este pacote NÃO inclui telas novas de gerenciamento da memória/feedback, planejamento multietapas persistido, aprendizagem estatística longitudinal, proatividade agendada ou agentes executando ações. A API de memória só passa a ser utilizada ao conectá-la explicitamente a fluxos da interface. Não foi implantado novo backend remoto.

## Validação
- Testes históricos de cérebro e usabilidade adaptados apenas para a nova versão passaram.
- Testes novos: cenários de prioridades, vínculo explícito, simulação, memória por usuário, feedback e exclusão passaram.
- Validada sintaxe dos JS e referências dos assets.
- Sem autenticação real, checkout, Supabase online ou teste de usuário PRO em produção. Faça deploy primeiro em homologação.
