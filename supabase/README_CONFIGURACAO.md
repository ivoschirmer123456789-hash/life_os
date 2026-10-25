# LIFE AI: ativação segura no Supabase

Apenas enviar os arquivos para a Vercel **não publica** a Edge Function.

1. No computador com Supabase CLI, entre no projeto do Supabase já usado pelo LIFE OS.
2. Instale/atualize a CLI e execute `supabase login`, `supabase link --project-ref SEU_PROJECT_REF`.
3. Configure os segredos **no Supabase**, nunca em `index.html`:
   - `supabase secrets set OPENAI_API_KEY=CHAVE_PRIVADA_DO_SERVIDOR`
   - `supabase secrets set OPENAI_MODEL=gpt-4.1-mini` (ou outro modelo habilitado para sua conta)
4. Execute `supabase functions deploy life-ai`.
5. Abra o aplicativo publicado, entre com uma conta de teste e pergunte algo que não esteja no motor local.
6. Valide a mensagem `Modelo conectado` **somente se houver resposta remota**.

Segurança: a função requer sessão Supabase, lê a assinatura do próprio banco sob RLS, ignora `plan` e `system_profile` enviados pelo navegador, restringe o contexto pessoal ao PRO/OWNER confirmado e não executa ações por conta própria.

O plano PRO e o pagamento **não são ativados por esta função**. A aprovação de pagamento continua dependendo da Edge Function e do webhook Mercado Pago do seu projeto. Nunca conceda PRO a partir de um clique no navegador.

Nota: se já houver uma função `life-ai` publicada, compare as versões e faça backup antes de substituir.


## LIFE OS 15.8.2 — pagamentos Mercado Pago (cartão, Pix e boleto)

**Não basta subir o ZIP na Vercel.** As duas Edge Functions precisam ser publicadas no
Supabase **que já atende o LIFE OS**, e o SQL da integração deve ser instalado antes.
Não configure acesso de produção sem revisar o esquema existente e fazer backup.

1. Confirme que sua conta Mercado Pago está regular e habilitada para receber pagamentos
   e que os meios de pagamento desejados aparecem no painel de Integrações.
   Utilize uma conta de titular que cumpra as exigências de idade e titularidade do provedor.
2. Faça backup do Supabase. No SQL Editor, revise e execute
   `database/mercadopago-billing-15.8.2.sql`. Requer a tabela `profiles` com `plan`,
   `pro_until` e `subscription_status`. Confirme também a política de proteção dos
   campos de assinatura em `database/security.sql` no esquema realmente publicado.
3. Com o Supabase CLI apontando para o projeto correto, configure estes **segredos somente no servidor**:
   - `MERCADOPAGO_ACCESS_TOKEN`: token privado da sua integração Mercado Pago
   - `MERCADOPAGO_WEBHOOK_SECRET`: assinatura secreta dos Webhooks na integração
   - `LIFE_BILLING_ENABLED=1`: habilite **somente após** instalar SQL, funções e webhook e fazer testes do fluxo
   - `LIFE_SITE_URL`: `https://seu-dominio.com/` (a URL pública HTTPS do LIFE)
   - `LIFE_ALLOWED_ORIGINS`: `https://seu-dominio.com` (origem exata; pode separar outras por vírgula)
   - Supabase fornece `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
     como segredos do projeto. Nunca inclua tokens no ZIP, no GitHub ou no navegador.
4. Publique os endpoints:
   ```sh
   supabase functions deploy mercadopago-create-subscription
   supabase functions deploy mercadopago-webhook --no-verify-jwt
   ```
   `mercadopago-create-subscription` **exige JWT do usuário** no próprio código.
   O webhook **não utiliza JWT de visitante** e exige assinatura HMAC autenticada.
5. No painel Mercado Pago > Integrações > Webhooks, informe a URL HTTPS:
   `https://SEU_PROJECT_REF.supabase.co/functions/v1/mercadopago-webhook`
   Configure `payment` para Checkout Pro e confirme no painel como habilitar notificações
   de Assinaturas (`subscription_preapproval` e `subscription_authorized_payment`),
   que podem exigir a configuração no próprio fluxo de assinatura. **Não pressuponha
   que configurar apenas o painel de Webhooks ativa eventos de assinaturas.** A mesma chave secreta
   deve estar em `MERCADOPAGO_WEBHOOK_SECRET`.
6. Publique o ZIP na Vercel, teste primeiro com usuário autorizado de teste e
   credenciais de ambiente de teste, inspecione status e redirecionamento.
   Faça um teste com pagamento real de valor baixo em ambiente autorizado antes
   de vender. Use **contas de teste**, não tente burlar validações de conta.

**Regras reais de cobrança**

- **Cartão:** assinatura recorrente no Mercado Pago, mensal; pagamento de fatura
  aprovado ativa/estende PRO. Cancelamento de renovação disponível no Perfil.
- **Pix:** Checkout Pro de R$29,90; após aprovação, acesso por 30 dias, sem
  cobrança automática no mês seguinte.
- **Boleto:** Checkout Pro de R$29,90; o acesso é liberado depois da confirmação
  da compensação. Vale 30 dias, sem renovação automática.
- O Mercado Pago pode oferecer a carteira própria no checkout mesmo que outros
  meios tenham sido excluídos; a autorização se baseia no pagamento aprovado,
  valor e pedido realmente consultados no servidor.
- **FREE e PRO são os dois níveis reais nesta versão.** Não existe PLUS separado.
- Contas que já têm PRO ativo não conseguem iniciar nova cobrança no checkout;
  assinaturas previamente configuradas fora desta integração precisam ser conciliadas pelo administrador antes da migração.
- Falhas, estornos, conflitos de contas, renovação atrasada e disputas precisam
  de acompanhamento operacional. Os dados em `life_mp_payments` registram créditos
  aplicados; trate estornos por reconciliação administrativa.

**Teste de aceitação obrigatório:** criar pagamento, ver pendente, pagar, confirmar
Webhook assinado, verificar `profiles.plan`/`pro_until`, fechar/reabrir sessão,
repetir webhook (não duplicar acesso), cancelar renovação e verificar expiração.
A página de retorno por si só **nunca** libera o PRO.

Documentação Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview
e https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications

### Auditoria 15.8.2 — pendências para ativar cobrança real

- Revise registros antigos em `life_mp_checkouts` antes do índice único de cartões.
  Caso existam tentativas de cobrança duplicadas, concilie manualmente os IDs no Mercado Pago
  **antes** de executar a migração. A migração falha com segurança se existirem duplicações.
- Use **titular de conta apto segundo as regras do provedor**, sem compartilhar credenciais.
- Confirme a entrega dos webhooks por `payment` para Pix/boleto **e** a associação da
  fatura autorizada à assinatura para cartão. A 15.8.2 também verifica notificações
  `payment` de cobranças recorrentes consultando `/authorized_payments/search`.
- Tentativas anteriores de cartão podem ser canceladas em Perfil. Uma tentativa
  que não chega a criar o checkout é marcada como falha para permitir outra.
- Em falhas depois de criar a assinatura no provedor, concilie o status do
  Mercado Pago e do Supabase manualmente antes de receber cobranças reais.
- Reembolsos, disputas e estornos precisam de reconciliação: **não há revogação
  automática comprovada do PRO** para esses eventos nesta versão.
- A migração nova não substitui políticas de segurança preexistentes de `profiles`.
  Confirme os privilégios e RLS em produção.
