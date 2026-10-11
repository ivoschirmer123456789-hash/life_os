# CHECKLIST DE PUBLICAÇÃO — LIFE OS 12.1

## Revisão funcional que precisa acontecer em ambiente real

- [ ] Limpe a aba de cache apenas se a versão antiga ainda aparecer, após publicar a 12.1.
- [ ] Login e logout com duas contas diferentes; confirmar que dados privados não se misturam.
- [ ] Conta FREE: apenas as funções permitidas. Prévia PRO sem permitir executar conteúdo bloqueado.
- [ ] Conta PRO ativa: abrir Fitness, Alimentação, Estudos, Finanças, Evolução, Conquistas e LIFE AI.
- [ ] Conta PRO vencida: retorna à visualização FREE sem perder os dados salvos.
- [ ] Conta OWNER: painel reservado e visualização FREE/PRO sem conceder acesso aos demais usuários.
- [ ] Criar tarefa na Home, concluir, recarregar e conferir persistência.
- [ ] Personalizar Home: ocultar e reexibir módulos; recarregar e conferir a seleção.
- [ ] Concluir séries com repetições, com e sem carga; verificar histórico em Fitness e Evolução.
- [ ] Usar foco, estudar e concluir tarefas; conferir contadores de conquistas.
- [ ] Abrir busca e executar “Modo foco”, “Criar tarefa”, “Ver conquistas”.
- [ ] Exportação/sincronização em duas sessões, sem sobrescrever dados mais novos.
- [ ] Publicar supabase/functions/life-ai; testar autenticação e resposta remota.
- [ ] Mercado Pago: assinatura de teste e atualização de `profiles.plan` apenas via webhook confirmado.
- [ ] Checar atualização de PWA e modo offline.

## Não substitui testes reais

O pacote contém validação de sintaxe e estrutura, mas não comprova que o ambiente publicado tenha secrets, autenticação, funções de pagamento, webhook ou dados de teste corretos.
