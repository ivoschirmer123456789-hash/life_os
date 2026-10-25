# LIFE OS 15.8.3 — Mercado Pago / Pix / Cartão / Boleto

**Código completo do site**, baseado na 15.7.1, mantendo a identidade preto/laranja, o sistema FREE/PRO, a navegação móvel e as pastas de treino. O ZIP preserva 100 arquivos e contém `index.html` na raiz.

## LIFE OS 15.8.3 — Checkout Pro oficial (uma só entrada)

- **Clique em DESBLOQUEAR O SISTEMA COMPLETO → abertura da página oficial do Mercado Pago**. As opções Pix/cartão/boleto aparecem **lá**, não em três botões no LIFE.
- PRO custa **R$ 29,90 por 30 dias**, **renovação manual** para os três meios de pagamento. Uma compra por cartão neste checkout **não** é uma assinatura mensal automática.
- O servidor cria uma preferência via `POST /checkout/preferences`, sem exclusão de métodos, e retorna somente a URL oficial validada. Webhook assinado, confirmação da cobrança e crédito idempotente continuam obrigatórios.
- Nova migração `database/mercadopago-billing-15.8.3.sql` adiciona `checkout` sem apagar dados ou assinaturas históricas. Edge Functions estão em `supabase/functions`.
- `index.html` na raiz, 100 arquivos no ZIP, menu e abas anteriores preservados, cache atualizado.

**Obrigatório antes de receber dinheiro:** executar o SQL e publicar as Edge Functions no Supabase atual, configurar credenciais privadas e webhook, e validar a compra em ambiente autorizado. Apenas subir o ZIP na Vercel não ativa Checkout Pro.

Veja `supabase/README_CONFIGURACAO.md` e `QA_REPORT_15.8.3.md`.
