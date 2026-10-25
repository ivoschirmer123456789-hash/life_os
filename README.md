# LIFE OS 15.8.2 — Mercado Pago / Pix / Cartão / Boleto

**Código completo do site**, baseado na 15.7.1, mantendo a identidade preto/laranja, o sistema FREE/PRO, a navegação móvel e as pastas de treino. O ZIP preserva 100 arquivos e contém `index.html` na raiz.

## Correção urgente 15.8.2 — botão DESBLOQUEAR O SISTEMA COMPLETO

- Corrigido o z-index da janela de escolha de pagamento, que podia abrir atrás da prévia PRO.
- Eliminada a concorrência do listener nativo (captura do clique) com o onClick do React: a recuperação agora é atrasada e executada somente quando a janela não abre.
- Eliminado o checkout automático de cartão pelo controlador de emergência; o cliente deve escolher explicitamente Pix, cartão ou boleto.
- A prévia e a escolha de pagamento deixam de ser renderizadas simultaneamente.
- Se a Edge Function não está publicada, o usuário vê uma explicação e um botão de tentar novamente, em vez de um fluxo silencioso.
- Novo nome do arquivo JS principal e atualização de cache: `life-app-15.8.2.js`.

**Publicação:** só subir o ZIP para a Vercel não instala a integração de cobrança. Use também o SQL e as Edge Functions do pacote. Não faça pagamentos de produção sem validar os fluxos no Mercado Pago e Supabase.

## O que foi acrescentado e revisado

- Seleção real de pagamento no paywall LIFE PRO por R$ 29,90, consultando os meios ativos do Mercado Pago.
- **Cartão:** assinatura mensal de renovação automática via API `/preapproval` do Mercado Pago.
- **Pix:** checkout de um período de 30 dias, sem renovação automática.
- **Boleto:** checkout de 30 dias, sem renovação automática; PRO liberado depois da compensação.
- Status das cobranças e botão de cancelamento de renovação no Perfil.
- Edge Functions `mercadopago-create-subscription` e `mercadopago-webhook` com sessão autenticada, assinatura criptográfica no webhook e consulta do pagamento no provedor.
- SQL `database/mercadopago-billing-15.8.2.sql` com identificação única de pagamentos, alteração de acesso PRO atômica e bloqueio de alterações de plano pelo usuário.
- Cache e identificação visual atualizados para 15.8.2.

## Instalação obrigatória (leia antes de usar)

1. Faça backup do Supabase e do site publicado.
2. Revise e execute `database/mercadopago-billing-15.8.2.sql` no Supabase que o LIFE usa.
3. Siga **`supabase/README_CONFIGURACAO.md`** para configurar segredos, publicar as **duas Edge Functions** e registrar os eventos Webhook no Mercado Pago.
4. Publique o front-end na Vercel e teste com contas autorizadas de teste. **Só o ZIP do frontend não ativa a cobrança.**

Não publique tokens do Mercado Pago ou a chave `service_role` no GitHub, no HTML ou nesta conversa.

## Verificações e limites

- 13/13 suítes de regressão existentes: passaram.
- 15/15 cenários isolados de checkout e webhook com provedor simulado: passaram.
- Sintaxe dos scripts e das novas funções: validada.
- Layout do seletor verificado isoladamente em 320/390/768/1366 px.
- Integridade do ZIP e referências locais: verificadas.

**Não foi possível confirmar um pagamento real na sua conta Mercado Pago.** A implantação exige configuração de credenciais e webhooks. A segurança do banco de dados, reembolsos/estornos, sincronização e fluxo ao vivo devem ser validados antes da comercialização. O LIFE segue com somente **FREE e PRO**; não criamos um plano PLUS fictício. Leia `QA_REPORT_15.8.2.md`.

## Auditoria adicional 15.8.2

O código de cobrança foi fortalecido após localizar riscos de duplicação de assinaturas
por cartão, tentativas abandonadas e notificações de pagamentos recorrentes. Os
controles de banco incluem índice único por checkout de cartão ativo, marcação de
falhas do provedor e cancelamento de tentativas pendentes. Uma notificação comum de
pagamento recorrente só credita PRO quando a fatura correspondente é confirmada
pela API `/authorized_payments/search` do Mercado Pago.

**Não use esta versão como prova de pagamentos reais funcionando.** A implantação
continua dependendo de credenciais seguras, conta habilitada, migração, Edge Functions,
webhooks e testes efetivos no ambiente publicado.
