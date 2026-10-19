# LIFE OS 15.7.1 — Auditoria dirigida de geradores, salvamento e recuperação

## Base

Atualização incremental sobre o ZIP completo da 15.7.0. Estrutura, módulos FREE/PRO, treinos em pastas por dia, UI preto/laranja e backend/checkout existentes foram preservados. Os 100 arquivos originais foram mantidos por substituição e renomeação, sem dependência nova.

## Defeitos corrigidos

1. **Plano alimentar pelo questionário Fitness (fluxo antigo/pessoal):** a interface anteriormente mostrava sucesso e fechava o resultado usando apenas `setSavedMealPlans()`. Agora faz leitura, valida os itens, grava com leitura de volta, preserva os planos anteriores e só fecha após confirmar. Em caso de falha, informa o problema e mantém a ficha.
2. **Diário de Fitness:** a inclusão manual só limpa a nota após confirmação; o check-out de sessão concluída só fecha a janela após gravar. Falha de armazenamento mantém o conteúdo e mostra erro.
3. **Compras geradas de dieta:** a função antes criava sempre a mesma lista genérica de 7 itens, com alegação de que vinha do plano, podendo conflitar com preferências. Agora usa apenas os ingredientes explicitamente associados ao plano, remove repetições, exige confirmação para substituir lista existente e valida a persistência. Planos sem lista verificável não geram itens inventados.
4. **Proteção da gravação escopada da aplicação:** antes não validava chave previamente marcada com erro de leitura, não evitava gravação idêntica e não verificava leitura de volta. Essas proteções foram adicionadas junto ao aviso de erro.
5. **Geração de Estudos:** exceções na bibliografia ou no relatório *opcionais* deixaram de interromper a criação da trilha principal; em vez disso, a trilha mantém as referências de base.
6. **Alimentação detalhada:** falhas em diagnóstico nutricional auxiliar deixam uma observação explícita e não derrubam o plano gerado. Planos marcados como bloqueados por restrições não verificadas não podem ser salvos como planos personalizados validados.
7. **Treino gerado:** confirmação de salvamento reforçada com leitura da lista existente, validação da presença de exercícios nas sessões e gravação verificada, sem encerrar o questionário quando há falha.
8. **Atualização:** caminhos dos assets principais, versão visível, manifest e cache do service worker atualizados para 15.7.1, inclusive removendo um número de versão visual antigo em um rodapé.

## Verificações realizadas

- 13/13 suítes de regressão Node do repositório, com `TZ=America/Campo_Grande`. Foram atualizadas as referências literais de versão dos testes e uma expectativa que exigia uma chamada de relatório sem proteção, para a nova chamada opcional segura; os demais testes permanecem.
- 15/15 testes adicionais de ações executadas em JavaScript/VM para geração de registros persistentes: salvar dieta com sucesso, falha de armazenamento, dado antigo inválido, dieta bloqueada/vazia; lista de compras real, ausente, cancelada e falha; diário com sucesso e falha; checagem dos caminhos de check-out, segurança e fallback.
- `node --check` aprovado em todos os scripts JS da versão.
- Revisão estática de caminhos de arquivos HTML/manifest/SW e integridade do ZIP ao empacotar.

## Limitações importantes

- Não foram executados testes E2E na aplicação autenticada conectada ao Supabase ou à Vercel. Não foi testado checkout, status efetivo PRO, sincronização entre aparelhos, IA remota ou vídeos externos.
- Os testes novos são de ações isoladas usando o **código real das funções** num ambiente JavaScript controlado; não são comprovação de cliques no aplicativo inteiro.
- Planos de treino e alimentação são orientações geradas por regras: não equivalem a prescrição profissional individualmente revisada. Casos médicos, alergias e lesões devem ser avaliados por profissional habilitado.
- A validação de integridade do projeto e o progresso na confiabilidade não significam que todos os fluxos estejam 100% livres de erro.

## Próxima validação recomendada antes de comercializar

1. Publicar numa implantação de testes da Vercel, manter backup da 15.7.0 e conferir versão 15.7.1 no app.
2. Entrar com conta FREE e PRO de teste; gerar treino, trilha de Estudos, plano alimentar e Projeto; salvar, fechar, recarregar, reabrir e marcar uma etapa.
3. Forçar falha de armazenamento em ambiente controlado e verificar que o formulário permanece aberto e o registro anterior é preservado.
4. Conferir que a lista de compras corresponde ao plano, e que plano bloqueado por restrições não vira uma recomendação alimentar validada.
5. Testar login, pagamentos e sincronização com contas de teste antes de publicar para clientes reais.
