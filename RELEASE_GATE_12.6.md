# LIFE OS 12.6 — Portão de homologação comercial

**Situação padrão: BLOQUEADO para vendas.** O ZIP é candidato a teste, não aprovação automática.

## Pendente — comprovante externo exigido

- [ ] Supabase: SQL de cotas instalado em homologação, confirmar que `consume_life_ai_quota` não aceita incremento arbitrário e impede acesso anônimo.
- [ ] LIFE AI: teste remoto com contas FREE/PRO/OWNER, status expirado/reembolsado, CORS configurado e limite diário atingido. Nenhuma chave privada no frontend.
- [ ] Banco: consulta `database/READONLY_AUDIT_12.5.sql`; verificar políticas RLS, dados privados de usuários, não acesso de conta B a conta A e ausência de escrita direta em `plan` / `life_data`.
- [ ] Risco OWNER: a política legada `life_profiles_read_own_or_owner` autoriza leitura de linhas completas de `profiles`, possivelmente incluindo `life_data`. Revisar desenho administrativo para restringir campos e finalidade antes de uso comercial.
- [ ] Sincronização: testar duas sessões/abas competindo pelo mesmo perfil, RLS, offline/online, falta de espaço, restaurar backup e desfazer restauração.
- [ ] Mercado Pago: preço exibido **exatamente igual** ao do checkout real no servidor; verificar criação, assinatura paga, pendente, recusada, renovada, cancelada, reembolsada, chargeback e repetição/atraso de webhook; confirmar idempotência. A 12.6 protege o *frontend*, não certifica o backend.
- [ ] Navegadores: fluxos autenticados Chrome/Firefox/Safari (360, 390, 768, 1440px), tabulação e leitor de tela, formulários principais e troca de contas.
- [ ] PWA: instalação, atualização e rollback, cache ao alternar versões, reload offline, falha de rede e retorno.
- [ ] Privacidade: consentimento, exportação/remoção de dados, política de retenção, revisão de acessos administrativos e tratamento de menores.
- [ ] Operação: monitoramento de incidentes, responsável por suporte, deploy preview e link/artefato de rollback testado.

## Script de bloqueio

`node check-production-gate-12.6.cjs` retorna status **2** se alguma verificação externa não estiver declarada como concluída. Para marcar cada item, configure as variáveis de ambiente descritas no script **somente depois de anexar evidências reais**. O script não executa pagamentos nem verifica a autenticidade das declarações.

## Alterações que exigem backup e revisão humana

- `database/ai-quota-12.6.sql` cria tabela e função novas; revise privilégios antes de executar. Não rode automaticamente em produção.
- `supabase/functions/life-ai/index.ts` substitui a função LIFE AI anterior. Depende da tabela/cota e `LIFE_ALLOWED_ORIGINS` configuradas.
- `vercel.json` passa a devolver CSP limitada e X-Frame-Options. Teste redirecionamentos externos e autenticação.
- Preço PRO não é controlado por esta atualização; confira o servidor e telas comerciais.
