# LIFE OS 15.6.1 — Auditoria corretiva

Base: ZIP completo da versão 15.6.0. Objetivo: identificar problemas semelhantes aos previamente encontrados na geração, classificação e salvamento de dados sem trocar a arquitetura existente.

## Problemas reproduzidos e corrigidos

1. **Planejador do Dia — prioridade vinculada:** a prioridade digitada podia corresponder a uma tarefa cadastrada para 80 min, mas a proposta reservava só 15 min e excluía a tarefa completa. Corrigido para respeitar a duração cadastrada, manter `taskId` e recusar silenciosos encurtamentos quando não cabe no tempo disponível. Uma prioridade sem tarefa continua com estimativa de 15 min, agora identificada.
2. **Finanças — IDs duplicados:** um lançamento inválido com ID repetido podia consumir o ID e descartar um lançamento válido na sequência. O ID só é reservado depois de validar o lançamento.
3. **Receitas — restrições combinadas:** a lógica podia reconhecer uma alergia conhecida mas ignorar outra desconhecida informada junto, exibindo receitas como compatíveis. Agora qualquer trecho de restrição não reconhecido impede a classificação automática. Filtros são somente heurísticos; jamais dispensam leitura do rótulo e checagem de contato cruzado.
4. **Estudos — IDs históricos:** relatórios contavam uma etapa já concluída como pendente quando o ID numérico havia sido salvo como texto; etapas duplicadas no histórico podiam inflar os totais. IDs são normalizados apenas para comparação do diagnóstico, sem modificar dados guardados.
5. **Minha Cozinha — falha silenciosa:** alterações na despensa, preferências, compras e favoritos eram mostradas na interface antes da confirmação de gravação. Agora o mecanismo de verificação por leitura após escrita bloqueia a mudança em caso de falha e exibe um aviso. Mensagens de atividade só aparecem após gravar com sucesso.
6. **Despensa e validade:** produtos cuja validade informada passou não aparecem mais em “Use primeiro”, e recebem aviso separado para verificar segurança alimentar.
7. **Mensagem do catálogo:** cobertura da despensa não é sinônimo de compatibilidade nutricional nem de segurança para alérgenos; o rótulo foi esclarecido.

## Testes

- 13/13 suítes JavaScript existentes aprovadas (`TZ=America/Campo_Grande`).
- 106 verificações anteriores do motor LIFE 15.6.0 preservadas e aprovadas.
- 18 verificações novas para duração de prioridades, lançamentos repetidos, restrições misturadas, registros antigos e alerta de gravação. Verificações diretas do motor e checagens estáticas do fluxo de salvamento; não são testes de conta autenticada.
- Todos os scripts locais verificados com `node --check`.
- ZIP com até 100 arquivos, CRC validado, `index.html` na raiz, referências HTML/PWA presentes e versionamento de cache atualizado.

## Fora da abrangência dos testes

- Não houve validação ponta a ponta autenticada no domínio ou com conta PRO.
- Não houve execução real de pagamento, sincronização Supabase, serviços externos de IA ou vídeos.
- A proteção local depende do armazenamento do navegador e não equivale a recuperação em nuvem.
- Classificação de receitas não certifica ausência de alérgenos ou elimina a necessidade de orientações clínicas quando cabíveis.

## Roteiro de teste em produção de teste

1. Em Minha Cozinha, registrar um ingrediente, atualizar preferências e reabrir a página.
2. Testar duas restrições juntas, incluindo uma não reconhecida; confirmar que não há receita declarada segura.
3. No Planejador, selecionar uma prioridade já cadastrada com duração maior do que o tempo disponível; conferir o aviso.
4. Em Finanças, verificar extrato mensal com dados antigos; em Estudos, conferir índices salvos antes da atualização.
5. Conferir FREE/PRO, login, salvamento após recarregar e sincronização entre dispositivos antes de publicar no domínio principal.
