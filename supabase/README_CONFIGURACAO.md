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


## LIFE OS 15.8.3 — Checkout Pro hospedado no Mercado Pago

**NOVO FLUXO:** LIFE OS → clique em DESBLOQUEAR → Supabase cria `POST /checkout/preferences` → LIFE redireciona a `init_point` → cliente escolhe Pix, cartão ou boleto **no próprio Mercado Pago**. O LIFE não escolhe nem exclui métodos; a conta do vendedor e a disponibilidade do Checkout Pro determinam as opções apresentadas. Uma chave Pix habilitada na conta pode ser necessária para exibir Pix.

**Preços e renovação:** o checkout desta versão compra **30 dias de LIFE PRO por R$ 29,90**, com **renovação manual para todos os meios**, inclusive cartão. Checkout Pro não cria assinatura de débito automático; o fluxo legado de cartão recorrente da 15.8.2 é preservado para assinaturas já cadastradas, mas não é oferecido a novos usuários nesta jornada. Boletos só ativam PRO depois da compensação; não anuncie renovação automática.

**A publicação do ZIP na Vercel não instala as funções do Supabase.** É obrigatório:

1. Usar uma conta Mercado Pago com vendedor titular apto e meios de pagamento habilitados, seguindo requisitos de idade, identidade e titularidade.
2. Fazer backup do banco e revisar/executar `database/mercadopago-billing-15.8.3.sql` no **mesmo projeto Supabase** do LIFE. Esta migração aceita método `checkout` sem excluir métodos históricos `card`, `pix`, `boleto`.
3. Nas configurações privadas de Edge Functions, definir `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `LIFE_SITE_URL`, `LIFE_ALLOWED_ORIGINS`. O Supabase fornece `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Nunca colocar segredos no HTML, GitHub ou conversa.
4. Publicar `supabase functions deploy mercadopago-create-subscription` e `supabase functions deploy mercadopago-webhook --no-verify-jwt`. A função do comprador exige sessão JWT e o webhook verifica a assinatura HMAC, recupera o pagamento no Mercado Pago e só então ativa o PRO no banco.
5. Mercado Pago > Suas integrações > Webhooks: configurar `payment` para `https://SEU_PROJECT_REF.supabase.co/functions/v1/mercadopago-webhook`. A assinatura secreta do webhook deve corresponder a `MERCADOPAGO_WEBHOOK_SECRET`.
6. Manter `LIFE_BILLING_ENABLED` **desativado** até testar migração, funções e webhooks em ambiente autorizado. Só depois configurar `LIFE_BILLING_ENABLED=1` no Supabase.
7. Publicar o novo front-end na Vercel, confirmar que a tela mostra `15.8.3`, testar com uma conta FREE autorizada: clique → **URL oficial Mercado Pago** → método disponível → pagamento pendente/aprovado → webhook assinado → `profiles.plan` e `pro_until` → recarregar/entrar novamente. Repetir a notificação não deve liberar PRO duas vezes.

**Segurança:** a resposta `checkout_url` é validada para domínio HTTPS oficial do Mercado Pago. A página de retorno **nunca** concede o PRO sozinha. A liberação ocorre apenas pelo pagamento confirmado no backend. Estornos, disputas, cobranças de versões antigas e acesso expirado exigem conciliação operacional; **não estão integralmente automatizados nem validados em produção**.

**Quando o botão não abrir o Mercado Pago:** se aparecer `Checkout Pro não está publicado no Supabase`, o motivo provável é função ausente, banco não migrado ou configuração incorreta. Confira a seção Functions → Logs do Supabase; não adianta alterar somente o ZIP. Se Pix não aparecer **dentro** do Mercado Pago, conferir Pix ativo/chave Pix e configuração da conta; o frontend já não restringe esse método.

Documentação oficial: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/overview
https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/create-payment-preference
