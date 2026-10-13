# LIFE OS 14.6.1 — Qualidade visual FREE / PRO

## Erro corrigido
O documento da versão 14.6.0 usava `data-life-apex="9"`, porém a folha da FREE continuava exigindo `data-life-apex="8"`. Com isso, 123 seletores de acabamento não correspondiam à página. Corrigido o escopo, preservando a distinção por plano.

## Design
A Home FREE ganhou cabeçalho editorial, sidebar mais legível, cards com melhor hierarquia, formulários e botões robustos, estados de tarefa claros, paleta sóbria nos temas claro e escuro e controle do espaço em dispositivos móveis. Sem cenário na Home FREE; prévia do PRO permanece identificada e funcional. Foi eliminada uma segunda comparação repetida na página. Nenhuma funcionalidade básica foi propositalmente removida e o PRO mantém suas áreas e design exclusivos.

## Testes locais
- **141 verificações**: sintaxe, caminhos, Service Worker, versões, escopo FREE/PRO e simulações visuais.
- **7 simulações de layout da Home FREE** em 360, 390, 768, 1024 e 1440 px, claro/escuro, sem rolagem horizontal ou imagem de cenário na Home.
- **Comparação de estilos PRO** antes/depois da nova folha em dia e noite: cores e fundos idênticos nos componentes comparados.
- Suítes de regressão aprovadas: geradores (268), qualidade (119), checkout simulado (6), integridade (38), produção (23), LIFE (16) e diálogo semanal (1). Testes baseados em versões anteriores foram executados em diretório isolado com caminhos apontados ao pacote atual.
- ZIP abaixo do limite de 100 arquivos no envio web do GitHub.

## Limitações
As prévias de CSS usam conteúdo demonstrativo e não capturas autenticadas; ainda são necessários testes com contas FREE/PRO/OWNER reais, checkout Mercado Pago, Supabase e sincronização no endereço publicado. O CSS é uma melhoria de apresentação, não uma alteração em regras de permissão/assinatura.
