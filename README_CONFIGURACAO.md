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
