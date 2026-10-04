# LIFE OS 6.2 — Layout fixes

## Problema corrigido
O Guia de Estudos usava uma grade de 3 colunas para as etapas e, dentro de cada etapa, outra grade de 3 colunas para o conteúdo detalhado. Em assuntos com etapas mais descritivas (por exemplo Marketing / Tráfego Pago / anúncios), isso espremia os temas em cartões estreitos e prejudicava a leitura.

## Alterações
- Etapas do Guia de Estudos agora ocupam a largura de leitura completa.
- Blocos “O que dominar”, “Como fazer” e “Entrega + critério” usam 3 colunas apenas quando há espaço e viram 1 coluna em telas menores.
- Textos longos podem quebrar linha sem estourar ou ficar presos em caixas pequenas.
- Guia LIFE, prévia de assunto, biblioteca e cartões ricos ganharam proteção de `min-width`/quebra de texto.
- Mobile mantém ações em largura completa e conteúdo empilhado.
- Nenhuma regra de negócio, assinatura, login, Supabase ou geração da trilha foi alterada.

## Implementação
A correção está isolada em `assets/css/layout-fixes-v62.css`, carregada por último. O cache PWA foi incrementado para `life-os-6.2.0` para evitar que estilos antigos permaneçam ativos após o deploy.
