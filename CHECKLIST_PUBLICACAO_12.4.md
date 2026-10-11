# LIFE OS 12.4 — checklist antes de vender

## Antes de publicar
- [ ] Criar backup completo do projeto, banco e configurações do Supabase.
- [ ] Garantir que `database/security.sql` está refletido nas políticas atuais; **não executar scripts antigos cegamente**.
- [ ] Confirmar `database/sync-cas-12.3.sql` e revogação do escritor de sincronização legado.
- [ ] Comparar preços escritos no site com o checkout real (há textos legados de assinatura dentro do app).
- [ ] Verificar a função LIFE AI e secrets do servidor; nunca publicar `OPENAI_API_KEY` no frontend.
- [ ] Verificar `mercadopago-create-subscription`, assinatura do webhook e permissões que alteram o plano.
- [ ] Publicar em URL de homologação antes do ambiente principal.

## Contas e dados
- [ ] FREE: criar tarefa e backup; impedir recursos PRO por permissão no backend.
- [ ] PRO: ações legítimas com confirmação e histórico; vencimento preserva dados.
- [ ] OWNER: painel restrito; dados de outros usuários inacessíveis por contas normais.
- [ ] Trocar de conta no mesmo aparelho: confirmar isolamento/backup e que dados não se misturam.
- [ ] Importar backup válido e inválido; conferir que não ocorre sincronização automática de dados desconhecidos.
- [ ] Dois aparelhos alteram a mesma conta: CAS identifica conflito; nenhum estado do usuário é apagado automaticamente.

## Agenda, exportação e experiência
- [ ] Testar planejador com compromissos, tarefas concluídas, tarefas com prazo, dias úteis/fim de semana.
- [ ] Confirmar que aprovar agenda uma segunda vez não duplica blocos.
- [ ] Abrir CSV de tarefas/atividades no Excel/Sheets, conferir texto com acentos e valores iniciados por `=`.
- [ ] Testar layout 360, 390, 768, 1280, 1440 px e navegação por teclado.
- [ ] Testar offline, reconexão e substituição controlada do Service Worker.
- [ ] Verificar atualização de Evolução após mudanças reais em tarefas, estudos e treinos.

## Cobrança real (somente sandbox/ambiente de teste primeiro)
- [ ] FREE abre checkout do destino esperado; OWNER/PRO não iniciam cobrança duplicada.
- [ ] Pagamento aprovado, pendente, recusado, reembolsado, cancelado, renovado, vencido.
- [ ] Confirmar plano pela base de dados assinada/atualizada pelo webhook, não por URL de retorno.
- [ ] Conferir privacidade e regras aplicáveis para usuários menores de idade.

**Publicação não certificada:** testes reais de integrações e pagamentos só podem ser realizados com acesso ao ambiente publicado e credenciais/test accounts pertinentes.
