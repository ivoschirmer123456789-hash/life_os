# LIFE OS 6.7.0 — Guided Modules audit

## Escopo pedido
- Biblioteca prática de Finanças mais rica.
- Ajuda “Como funciona?” nas abas e microáreas.
- Mais orientação dentro das microáreas.
- KITCHEN OS / Minha Cozinha funcional.
- Receitas mais claras para executar.
- Fluxo do botão PRO mais robusto.

## Implementado
- 10 guias profundos de finanças com conceito, importância, exemplo diário, momento de uso, primeira ação, passos, erros e boas práticas.
- Modal de guia preparado para exibir conteúdo profundo.
- Ajuda contextual em `data-life-section` e em painéis principais, com fallback por área.
- Navegação real do KITCHEN OS: Explorar / Minha Cozinha / Favoritas / Compras.
- Despensa com quantidade e validade; lista manual; compatibilidade de ingredientes.
- Receitas editoriais e biblioteca com observações por etapa.
- Checkout com loading, erro visível, retry e fallback HTTP autenticado.
- Owner protegido contra cobrança do próprio painel.

## Validação estática
- JavaScript verificado com `node --check`.
- CSS analisado com `tinycss2`.
- IDs estáticos sem duplicação.
- Referências locais do index e Service Worker verificadas.
- Cache PWA: `life-os-6.7.0`.

## Dependência externa
A assinatura real requer que a Edge Function `mercadopago-create-subscription` esteja publicada e configurada no Supabase, com as credenciais privadas no backend. O front-end não inclui nem deve incluir segredo do Mercado Pago.
