# LIFE OS 15.0.1 — Auditoria e correções

## Base
LIFE OS 15.0.0 — aba Projetos com roteiros semanais. O build foi auditado e corrigido sem alterar arquivos de pagamentos, Supabase, consultas remotas ou regras de assinatura.

## Problemas identificados e corrigidos
1. **Projetos antigos sem `id`:** a ação de concluir uma etapa comparava apenas `p.id`, enquanto a seleção da pasta aceitava `p.id || p.n`. Agora a atualização usa a mesma chave em ambos os caminhos.
2. **Datas locais inconsistentes:** `toLocaleDateString('en-CA')` nem sempre retorna `YYYY-MM-DD`. O código usa formato local explícito e valida dia/mês/ano, rejeitando datas inexistentes (como 30/02).
3. **Prazo final da semana:** a última semana do projeto não apresenta um intervalo além do período escolhido.
4. **Dados antigos ou incompletos:** cronogramas malformados deixam de derrubar a página; o sistema permite anexar um guia novamente. O salvamento das etapas preserva registros que não foram modificados.
5. **Cronogramas extensos:** só as semanas do mês selecionado são exibidas; o usuário escolhe o mês em uma barra horizontal com progresso de cada mês. Ao reabrir a pasta, a etapa incompleta mais próxima é selecionada.
6. **Durações:** agora a lista permite escolher qualquer prazo inteiro de 1 a 12 meses.
7. **Integração com o LIFE:** o projeto novo atualiza sua porcentagem e próximo passo nos campos de planejamento existentes; em projetos antigos, esses campos são preservados e o progresso do guia é guardado separadamente.
8. **Ícones e aparência:** controles da aba Projetos possuem símbolos que não dependem da fonte remota e foram incluídos estilos para o modo claro, mantendo a linguagem visual escura/laranja no modo noturno.
9. **Cache:** HTML, arquivos locais, manifesto, configuração e Service Worker passam a identificar o build `15.0.1` para reduzir mistura de versões.

## Testes realizados
- 13 suítes locais `.cjs` aprovadas, cobrindo Cérebro, IA local, planos de treino/dieta, menus, memória e integridade.
- Validação de datas, calendário completo de 1–12 meses e quantidade de modelos em 36 casos do motor de projetos.
- Chromium em testes **isolados da aba Projetos** com React renderizado e camada de hooks de teste: 320, 390, 768 e 1366 px. Criação de pasta, alternância de mês, checklist, reabertura e ausência de rolagem horizontal nos cenários testados.
- Compatibilidade de projeto antigo sem identificador e recuperação de guia histórico malformado testadas no Chromium isolado.
- Inspeção do estilo da aba no modo claro.
- `node --check` passou para 22 scripts JavaScript; 32 referências locais de HTML e 67 caminhos de precache validados; CSS novo analisado com `tinycss2`.
- ZIP: `index.html` diretamente na raiz, até 100 arquivos, teste de CRC.

## Limites importantes
Não foram feitos testes no domínio publicado com login de uma conta real, pagamentos efetivos, permissões Supabase em produção, sincronização entre dispositivos ou reprodução de todos os vídeos externos. Os testes de Chromium foram realizados em uma montagem isolada da aba Projetos, e **não** equivalem a um teste ponta a ponta da aplicação autenticada. A ausência de defeitos nos testes acima não garante ausência de falhas em cenários não testados.

## Conteúdo preservado
Todas as áreas, planos FREE/PRO, geração de treinos, apresentações de fichas, vídeos, dietas, conteúdo do Cérebro e arquivos remotos permanecem presentes no projeto. Dados dos projetos existentes não são redefinidos por esta atualização.
