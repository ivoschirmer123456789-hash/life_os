# LIFE OS 14.6.4 — Power Premium · Inteligência revisada

Projeto completo para GitHub/Vercel, baseado na versão 14.6.3.

### Principais melhorias
- Tratamento de registros incompletos sem bloquear o painel PRO.
- LIFE AI libera o botão de envio depois de erro inesperado e informa a falha.
- Projeção **estimada** de blocos de tempo a partir de tarefas com duração registrada e preferência do usuário, sem prometer conclusão.
- Prazos de tarefas sem hora comparados corretamente por dia.
- Melhor empacotamento JSON do contexto para a IA remota, que deve ser implantada separadamente no Supabase.
- Versão e Service Worker atualizados.

### Design e conteúdo
- FREE Profissional e PRO Signature permanecem visualmente iguais à versão aprovada.
- O novo bloco de projeção existe **somente na Home PRO**. Não desbloqueia funcionalidades pagas para contas FREE.
- Nenhuma compra, alteração de banco ou edição de tarefas é executada automaticamente pelo cérebro.

### Como publicar
1. Faça backup do repositório GitHub.
2. Extraia este ZIP e envie **os arquivos internos**, sem a pasta contenedora. `index.html` deve ficar na raiz.
3. Aguarde o deploy da Vercel e teste com contas FREE e PRO/OWNER em `www.uselifeos.com.br`.
4. Para atualizar a LIFE AI **remota**, trate `supabase/functions/life-ai/index.ts` como uma etapa **separada** e valide segredos e origens autorizadas. Publicar o ZIP não implanta o Supabase.

### Testes e limitações
Leia `QA_REPORT_14.6.4.md`. Os testes fornecidos são locais e de componentes. Não foram realizados testes end-to-end autenticados, compras reais, ou sincronização entre dispositivos.
