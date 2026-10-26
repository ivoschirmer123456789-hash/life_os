# LIFE OS 15.7.1 — Auditoria de Fluxos

Versão completa baseada na 15.7.0, com 100 arquivos e `index.html` na raiz.

Esta atualização corrige falhas detectadas em gravação e confirmação de planos alimentares, diário/check-out de Fitness, lista de compras, proteção de armazenamento, bibliografia opcional em Estudos e validação de treinos antes de salvar.

Não muda os módulos, o visual preto e laranja, os planos FREE/PRO, o contrato de cobrança nem as funções do Supabase. É recomendável testar num projeto temporário na Vercel e manter a 15.7.0 como backup.

Leia `QA_REPORT_15.7.1.md` para os testes executados, detalhes de correção e limitações ainda pendentes de verificação em produção.

## Pagamento Pix + cartão (adaptação)

Incluídas opções de **cartão recorrente** e **Pix avulso de 30 dias**, com webhook seguro para confirmação e ativação. Para colocar o Pix em funcionamento, execute as etapas em `supabase/README_CONFIGURACAO.md`. A Vercel não publica funções Supabase. A integração existente de cartão no Supabase não veio neste ZIP.
