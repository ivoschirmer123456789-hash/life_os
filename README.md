# LIFE OS 6.3.2 — Cache Break Fix

Esta build usa nomes de arquivos JavaScript únicos para escapar de Service Workers antigos que ignoravam a query string e podiam continuar entregando o LIFE 6.3.

Se a tela de recuperação ainda aparecer nesta build, ela exibirá o diagnóstico real do erro.

# LIFE OS 6.0 — Signature System

Versão focada em identidade visual, valor do FREE e expansão do Study OS.

## Principais mudanças
- Redesign global `Signature System 6.0` para todas as áreas e telas internas.
- Nova landing page com linguagem visual própria do LIFE.
- `Study Universe`: catálogo amplo com dezenas de assuntos e filtros.
- Catálogo de assuntos liberado no FREE; PRO passa a vender profundidade, mastery, mapas, histórico e contexto ampliado.
- Conteúdos financeiros educativos: bolsa, renda fixa, ETFs, fundos, opções, cripto, macro/microeconomia e outros.
- `Opções binárias` é tratada exclusivamente como educação sobre risco, probabilidade, regulação e golpes.
- Card contextual de FREE → PRO sem urgência falsa ou dark patterns.
- Nova linguagem de cores por mini-app mantendo o laranja como assinatura central.
- PWA/cache `6.0.0`.

## Publicação
Envie o projeto inteiro mantendo as pastas. Para atualizar um repositório que já contém a versão anterior, use o pacote `Update_Only` fornecido junto da entrega.

## Testes externos ainda necessários
Supabase, Mercado Pago, LIFE AI remota, notificações push e sincronização entre dispositivos precisam ser validados no domínio publicado.
