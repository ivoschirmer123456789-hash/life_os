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


---

# LIFE OS 15.7.1 — Cartão recorrente + Pix avulso por 30 dias

## Importante

- Este ZIP mantém **100 arquivos**. O pagamento por cartão atual (`mercadopago-create-subscription`) foi **preservado** e continua existindo **apenas no projeto Supabase já publicado**; ele não estava no ZIP recebido.
- O novo botão **ASSINAR COM CARTÃO** chama a função atual. O botão **PAGAR 30 DIAS COM PIX** usa a nova função `mercadopago-create-pix`, que gera uma preferência do Checkout Pro. Outros meios de pagamento podem aparecer no checkout do Mercado Pago, conforme disponibilidade da conta.
- **Pix NÃO renova automaticamente nesta implementação**. O cliente compra acesso por 30 dias e, quando vencer, precisa comprar novamente. O botão de cartão mantém o fluxo de assinatura anterior.
- O preço de **R$ 29,90** está fixado em `assets/js/life-app-15.7.1.js`, na Edge Function e no SQL. Antes de publicar, confirme que este é o preço que deseja cobrar. Não é possível definir o valor no navegador.
- **Não substitua a função antiga de cartão.** Adicione apenas as duas novas funções.
- Este arquivo é um pacote de código. Nenhuma função ou alteração SQL foi publicada no seu Supabase por este ZIP.

## Configuração necessária, nesta ordem

1. **Faça backup** do banco e das funções do Supabase usados pelo LIFE OS. Confira que a tabela `public.profiles` tem `id`, `plan`, `pro_until`, `subscription_status`. Não rode o SQL de referência legado.
2. No Supabase **SQL Editor**, execute `database/life-pix-payments.sql` uma vez, no projeto de produção **correto**. Ele cria a tabela privada `life_pix_orders` e RPCs atômicas; não altera o fluxo de cartão existente.
3. No Supabase > **Edge Functions > Secrets** configure:
   - `MP_ACCESS_TOKEN` — token privado de produção da sua aplicação Mercado Pago (se já existe, mantenha).
   - `MP_WEBHOOK_SECRET` — chave secreta de Webhooks da aplicação Mercado Pago. Não confundir com access token.
   - `LIFE_PUBLIC_ORIGIN` — somente a origem HTTPS exata do site, por exemplo `https://seusite.com.br` (sem barra final).
   - `LIFE_CHECKOUT_RETURN_URL` — URL HTTPS do app para onde o Mercado Pago retorna, por exemplo `https://seusite.com.br/index.html`.
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` são fornecidos pelo ambiente Supabase e devem continuar restritos ao backend. Não coloque o service role no frontend.
4. Publique as funções no mesmo projeto Supabase que o site usa. Com a Supabase CLI vinculada ao projeto:
   ```bash
   supabase functions deploy mercadopago-create-pix --no-verify-jwt
   supabase functions deploy mercadopago-pix-webhook --no-verify-jwt
   ```
   - O Pix **exige login** e valida o token do usuário com `auth.getUser`, independentemente do `--no-verify-jwt` do gateway.
   - O webhook é **público para receber eventos**, mas rejeita mensagens sem assinatura HMAC válida e consulta a API do Mercado Pago antes de aplicar pagamento.
5. No **Mercado Pago Developers > Sua aplicação > Webhooks**, habilite o evento **Pagamentos** e obtenha a chave secreta usada em `MP_WEBHOOK_SECRET`. A preferência Pix informa a `notification_url` da função nova, sem precisar trocar a URL de webhook que possa ser usada pela assinatura por cartão. Confirme que a conta Mercado Pago aceita Pix no Checkout Pro.
6. Faça upload do ZIP atualizado à Vercel. Não publique os segredos nem execute pagamentos reais para teste antes de verificar a configuração.

## Testes obrigatórios antes de vender

1. Em uma conta FREE de teste autenticada, abra PRO e confirme que **Cartão** inicia a assinatura existente e **Pix** abre Checkout Pro sem mostrar erro. Nunca faça pagamento sem perceber valor e quem recebe.
2. Pague um Pix de teste com autorização apropriada, observe **Edge Functions > Logs** e o evento de Webhook. Confira `life_pix_orders.status = 'paid'` e o perfil PRO com `pro_until` 30 dias após a aprovação. Repetir o mesmo evento **não** deve adicionar novos 30 dias.
3. Retorne ao site e clique **VERIFICAR ASSINATURA** (o site também faz polling após checkout). Somente aprovação no servidor deve liberar PRO.
4. Teste pagamento pendente, recusa, mesma conta já PRO, usuário não autenticado, falha de rede e expiração do PRO (sem cobrança automática do Pix).
5. Simule estorno/chargeback e confira retorno para FREE se a única autorização vigente era o Pix. Em casos de sobreposição com outras assinaturas, faça conciliação manual e examine os logs.

## Advertências técnicas

- As assinaturas por cartão continuam dependentes do **webhook e status** já publicados fora deste arquivo. Não foi possível auditá-los com o ZIP enviado.
- O checkout Pix usa o Checkout Pro de pagamento único, não o endpoint `/preapproval_plan`. Pix no Checkout Pro depende de elegibilidade e configuração do Mercado Pago.
- Os arquivos SQL e Edge Functions **precisam** ser implantados separadamente da Vercel.
- Para desfazer a alteração no frontend, restaure o ZIP anterior. Para reverter o backend, interrompa somente as novas funções, preservando os registros financeiros e logs (não apague pagamentos históricos).
- O webhook confere assinatura, existência de pedido e valor/moeda, e obtém status na API. Ainda assim, para uso comercial, execute testes de integração e conciliação com um responsável pelo negócio. Não há confirmação de ambiente produtivo nesta entrega.
