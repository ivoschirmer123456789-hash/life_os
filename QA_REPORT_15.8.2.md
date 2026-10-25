# LIFE OS 15.8.2 — Auditoria do botão de assinatura

## Contexto
Usuário relatou que clicar em **DESBLOQUEAR O SISTEMA COMPLETO** na prévia FREE/PRO não abria nenhuma janela. A versão 15.8.2 usa a 15.8.1 como base e mantém 100 arquivos.

## Problemas identificados e correções

1. A prévia PRO usava `z-index: 100320`, enquanto a escolha de pagamento usava `100300`. A escolha pode ficar atrás da prévia em condições de sobreposição. A nova classe `.life-billing-visible-v1582` coloca o modal em `100345`, acima da prévia.
2. O fallback do runtime capturava o clique na fase **capture** do `document`, antes do evento de clique do React, e chamava a troca de tela antecipadamente. Agora dá ao React a primeira oportunidade e tenta recuperar apenas se o paywall não apareceu.
3. Na falha extrema, o runtime tentava iniciar o checkout sem a escolha explícita do método. Agora não inicia cobrança: tenta reabrir a seleção e, caso não consiga, informa o problema.
4. Renderização da prévia e seleção passaram a ser mutuamente exclusivas.
5. Se o Supabase não informa nenhum método habilitado, a tela explica que as funções precisam ser instaladas e permite nova consulta.
6. Atualizadas URL do JavaScript principal, CSS de ajustes, config, release, manifest e service worker para **15.8.2** para evitar cache antigo.

## Testes executados

- **13/13 suítes de regressão** (TZ=America/Campo_Grande): passaram.
- **8/8 verificações específicas** da transição, ordem de camadas, fallback, identificação da build, mensagem de indisponibilidade e prevenção de checkout sem escolha: passaram.
- Sintaxe do JavaScript principal, runtime e service worker: passou no `node --check`.
- **100 arquivos** no pacote, integridade ZIP verificada.

## Limitações

- O fluxo com conta autenticada no site publicado ainda **não foi testado**. Testes de lógica isolada não comprovam pagamento real.
- A disponibilidade de Pix/cartão/boleto depende da publicação das Edge Functions, migração SQL, segredos e configuração da conta Mercado Pago no Supabase.
- Nenhum pagamento real foi realizado nesta auditoria.
- O preço apresentado é R$ 29,90, conforme código atual; confirme o preço antes da publicação.
