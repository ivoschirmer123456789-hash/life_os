# LIFE OS 15.8.3 — Auditoria do Checkout Pro hospedado

## Requisito que orientou a correção
O comprador deve clicar em DESBLOQUEAR O SISTEMA COMPLETO no LIFE e ser enviado diretamente a uma página HTTPS oficial do Mercado Pago. **É no Mercado Pago que escolhe Pix, cartão ou boleto** (dependendo da disponibilidade e das regras da conta do vendedor), não dentro do LIFE.

## Mudanças implementadas
- Botão da prévia PRO chama `startLifeProCheckout` diretamente e sinaliza “ABRINDO MERCADO PAGO…”.
- Janela de assinatura do LIFE contém **um único botão** “IR PARA O MERCADO PAGO”. Os três botões de métodos específicos foram retirados.
- A função `mercadopago-create-subscription` agora cria uma única preferência `POST /checkout/preferences` com `items`, `payer`, `external_reference`, URLs de retorno, notificações e **sem excluir métodos**. O frontend redireciona para `init_point` somente se a URL for de domínio confiável.
- Preço: **R$ 29,90 por 30 dias**. O cartão nessa experiência, como Pix e boleto, é **pagamento único, renovação manual**. Assinaturas recorrentes antigas permanecem na base para reconciliação, mas a experiência nova não cria recorrência automática.
- Migração `database/mercadopago-billing-15.8.3.sql` permite o método `checkout` sem apagar dados de cartão/Pix/boleto legados. O webhook só credita PRO após verificar a notificação assinada e a cobrança aprovada, com confirmação da quantia, moeda e vínculo ao pedido; a função SQL impede crédito duplo para o mesmo pagamento.
- Nenhum segredo privado é enviado ao navegador. Contas sem sessão precisam entrar antes de pagar. Em caso de falha de backend, o usuário recebe uma mensagem, não uma cobrança simulada.
- Versão, bundles e cache atualizados para `15.8.3`.

## Testes executados
- **13/13 suítes gerais** do LIFE OS passaram com referências de versão ajustadas.
- **26 testes simulados do provedor e webhook** em `/mnt/data/test_life1583_hosted.cjs` passaram, incluindo URL de checkout oficial, ausência de métodos excluídos, formas de pagamento diferentes, pedido pendente, pagamento aprovado, webhook falso rejeitado e notificação repetida sem crédito duplicado.
- Sintaxe JavaScript e referências de arquivos internos verificadas; integridade do ZIP conferida.

## Pendências importantes
- **Não foi possível executar cobranças reais nem autenticar no Supabase do proprietário.** O backend precisa ser publicado, o SQL instalado e as credenciais/webhooks configurados no projeto correto. Só atualizar a Vercel não é suficiente.
- A exibição real de Pix e boleto é responsabilidade do Checkout Pro conforme conta do vendedor; conferir habilitação e chave Pix no Mercado Pago.
- Assinaturas antigas, reembolsos, disputas, chargebacks e conciliação de renovações exigem revisão operacional. Não afirmar que os recebimentos estão 100% prontos antes de validar com provedor e conta habilitada.
- Testes locais de função são simulados, não prova da integração em produção.

## Documentação
Consulte `supabase/README_CONFIGURACAO.md` para migração, Edge Functions, variáveis privadas e testes autorizados. Não compartilhe senhas, Access Tokens nem `service_role`.
