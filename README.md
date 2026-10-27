# LIFE OS 15.7.2 — Pix, cartão e modo convidado (100 arquivos)

Versão completa baseada na 15.7.0, com 100 arquivos e `index.html` na raiz.

Esta atualização corrige falhas detectadas em gravação e confirmação de planos alimentares, diário/check-out de Fitness, lista de compras, proteção de armazenamento, bibliografia opcional em Estudos e validação de treinos antes de salvar.

Não muda os módulos, o visual preto e laranja, os planos FREE/PRO, o contrato de cobrança nem as funções do Supabase. É recomendável testar num projeto temporário na Vercel e manter a 15.7.0 como backup.

Consulte a seção **Auditoria da versão 15.7.1** abaixo para os testes, correções e limitações.

## Pagamento Pix + cartão (adaptação)

Incluídas opções de **cartão recorrente** e **Pix avulso de 30 dias**, com webhook seguro para confirmação e ativação. Para colocar o Pix em funcionamento, execute as etapas em `supabase/README_CONFIGURACAO.md`. A Vercel não publica funções Supabase. A integração existente de cartão no Supabase não veio neste ZIP.

## Atualização 15.7.2 — Entrar como convidado

Esta edição mantém como base a versão 15.7.1 Pix + cartão e adiciona **ENTRAR COMO CONVIDADO** na tela de login e na confirmação de conta anterior. Os dados temporários do convidado ficam **somente na memória do navegador**, separados dos registros de contas cadastradas; atualizar a página ou sair elimina as alterações feitas como convidado. Ao sair, as contas já usadas no navegador permanecem intactas.

A versão FREE é aberta sem autenticação. Plano PRO, sincronização, cobrança e funções dependentes de conta continuam exigindo autenticação verdadeira. Não houve alteração nas funções Supabase ou no checkout do Mercado Pago.

Implantação: publique o ZIP completo na Vercel, mantendo o `index.html` na raiz. A versão do cache PWA foi alterada para ativar os arquivos novos. Confira a seção **Auditoria do modo convidado 15.7.2** deste README antes de publicar para clientes.

---

# Documentação consolidada

A documentação de auditoria e do banco foi unificada neste README para manter o pacote com exatamente 100 arquivos sem remover funcionalidades ou testes.

---

## Auditoria da versão 15.7.1

# LIFE OS 15.7.1 — Auditoria dirigida de geradores, salvamento e recuperação

## Base

Atualização incremental sobre o ZIP completo da 15.7.0. Estrutura, módulos FREE/PRO, treinos em pastas por dia, UI preto/laranja e backend/checkout existentes foram preservados. Os 100 arquivos originais foram mantidos por substituição e renomeação, sem dependência nova.

## Defeitos corrigidos

1. **Plano alimentar pelo questionário Fitness (fluxo antigo/pessoal):** a interface anteriormente mostrava sucesso e fechava o resultado usando apenas `setSavedMealPlans()`. Agora faz leitura, valida os itens, grava com leitura de volta, preserva os planos anteriores e só fecha após confirmar. Em caso de falha, informa o problema e mantém a ficha.
2. **Diário de Fitness:** a inclusão manual só limpa a nota após confirmação; o check-out de sessão concluída só fecha a janela após gravar. Falha de armazenamento mantém o conteúdo e mostra erro.
3. **Compras geradas de dieta:** a função antes criava sempre a mesma lista genérica de 7 itens, com alegação de que vinha do plano, podendo conflitar com preferências. Agora usa apenas os ingredientes explicitamente associados ao plano, remove repetições, exige confirmação para substituir lista existente e valida a persistência. Planos sem lista verificável não geram itens inventados.
4. **Proteção da gravação escopada da aplicação:** antes não validava chave previamente marcada com erro de leitura, não evitava gravação idêntica e não verificava leitura de volta. Essas proteções foram adicionadas junto ao aviso de erro.
5. **Geração de Estudos:** exceções na bibliografia ou no relatório *opcionais* deixaram de interromper a criação da trilha principal; em vez disso, a trilha mantém as referências de base.
6. **Alimentação detalhada:** falhas em diagnóstico nutricional auxiliar deixam uma observação explícita e não derrubam o plano gerado. Planos marcados como bloqueados por restrições não verificadas não podem ser salvos como planos personalizados validados.
7. **Treino gerado:** confirmação de salvamento reforçada com leitura da lista existente, validação da presença de exercícios nas sessões e gravação verificada, sem encerrar o questionário quando há falha.
8. **Atualização:** caminhos dos assets principais, versão visível, manifest e cache do service worker atualizados para 15.7.1, inclusive removendo um número de versão visual antigo em um rodapé.

## Verificações realizadas

- 13/13 suítes de regressão Node do repositório, com `TZ=America/Campo_Grande`. Foram atualizadas as referências literais de versão dos testes e uma expectativa que exigia uma chamada de relatório sem proteção, para a nova chamada opcional segura; os demais testes permanecem.
- 15/15 testes adicionais de ações executadas em JavaScript/VM para geração de registros persistentes: salvar dieta com sucesso, falha de armazenamento, dado antigo inválido, dieta bloqueada/vazia; lista de compras real, ausente, cancelada e falha; diário com sucesso e falha; checagem dos caminhos de check-out, segurança e fallback.
- `node --check` aprovado em todos os scripts JS da versão.
- Revisão estática de caminhos de arquivos HTML/manifest/SW e integridade do ZIP ao empacotar.

## Limitações importantes

- Não foram executados testes E2E na aplicação autenticada conectada ao Supabase ou à Vercel. Não foi testado checkout, status efetivo PRO, sincronização entre aparelhos, IA remota ou vídeos externos.
- Os testes novos são de ações isoladas usando o **código real das funções** num ambiente JavaScript controlado; não são comprovação de cliques no aplicativo inteiro.
- Planos de treino e alimentação são orientações geradas por regras: não equivalem a prescrição profissional individualmente revisada. Casos médicos, alergias e lesões devem ser avaliados por profissional habilitado.
- A validação de integridade do projeto e o progresso na confiabilidade não significam que todos os fluxos estejam 100% livres de erro.

## Próxima validação recomendada antes de comercializar

1. Publicar numa implantação de testes da Vercel, manter backup da 15.7.0 e conferir versão 15.7.1 no app.
2. Entrar com conta FREE e PRO de teste; gerar treino, trilha de Estudos, plano alimentar e Projeto; salvar, fechar, recarregar, reabrir e marcar uma etapa.
3. Forçar falha de armazenamento em ambiente controlado e verificar que o formulário permanece aberto e o registro anterior é preservado.
4. Conferir que a lista de compras corresponde ao plano, e que plano bloqueado por restrições não vira uma recomendação alimentar validada.
5. Testar login, pagamentos e sincronização com contas de teste antes de publicar para clientes reais.

## Adendo: Pix + cartão (integração preparada em 26/10/2026)

- Preservada a chamada existente `mercadopago-create-subscription` para cartão. Novo botão de Pix chama `mercadopago-create-pix`; o retorno só libera PRO após aprovação do webhook no Supabase.
- Novos arquivos: `supabase/functions/mercadopago-create-pix/index.ts`, `supabase/functions/mercadopago-pix-webhook/index.ts`, `database/life-pix-payments.sql`. Para preservar o limite de 100 arquivos, foram excluídas três cópias **byte a byte idênticas** de suítes de testes, mantendo as versões originais.
- Verificados `node --check` para o app/SW, 10/10 suítes Node (TZ America/Campo_Grande), os três testes Python do repositório e ensaios isolados simulados das Edge Functions Pix (criação de preferência, autenticação, bloqueio de origem, validação de assinatura HMAC, pagamento aprovado). As verificações são locais, não bancárias.
- Limitação: não foi possível publicar as funções, executar SQL, realizar transações nem validar credenciais reais Mercado Pago/Supabase. O botão Pix só passa a operar depois da configuração descrita em `supabase/README_CONFIGURACAO.md`.

---

## Resultado da revisão complementar (27/10/2026)

**Testes automatizados: 14/14 aprovados** (11 suítes JavaScript/Node e 3 Python), usando TZ=America/Campo_Grande. Sintaxe de 23 scripts JavaScript aprovada. Verificados 33 links de arquivos no HTML e 68 caminhos do cache do service worker; todos existem. Verificado armazenamento efêmero do convidado (entrada, dados separados, refresh, saída) e inicialização FREE sem SDK Supabase.

**Pendências de validação externa:** sem navegação E2E completa em produção, sem validação real de cartão/Pix ou ativação por webhook, sem banco Supabase conectado, sem IA remota, sem teste de sincronização entre dispositivos, sem teste de vídeo externo. A existência das funções no ZIP não significa que foram publicadas. Não declarar esta versão 100% validada em produção antes dos testes externos.

## Auditoria complementar — revisão de confiabilidade

- Corrigida a inicialização em convidado: não exige baixar o SDK do Supabase; o botão de saída continua funcionando independentemente da rede.
- Padronizadas as versões `?v=15.7.2` dos arquivos referenciados pelo HTML com o cache do service worker, evitando reutilização indevida de módulos antigos.
- Teste de integridade atualizado para conferir a versão **15.7.2**, e não a 15.7.1 antiga; integridade de links locais validada.
- Essas verificações e testes automatizados **não são testes reais de pagamentos, banco Supabase, login remoto, sincronização na nuvem ou de navegação E2E no navegador publicado**. Necessário validar esses fluxos com credenciais de teste antes de comercializar.

## Auditoria do modo convidado 15.7.2

# LIFE OS 15.7.2 — Acesso como convidado (base 15.7.1 Pix + Cartão)

## Escopo

Base: `LIFE_OS_15_7_1_PIX_CARTAO_100_ARQUIVOS.zip`. Todos os arquivos existentes foram preservados; mudanças restritas à tela de acesso, ao estado de entrada, ao armazenamento para o convidado, ao cache e aos metadados de versão. Não houve alteração no SQL, funções Supabase, motor de planos ou código das integrações Pix/cartão.

## Comportamento

- A tela inicial oferece **ENTRAR**, **CRIAR CONTA** e **ENTRAR COMO CONVIDADO**.
- A confirmação de sessão salva também oferece entrar como convidado, preservando os dados da conta cadastrada.
- O acesso convidado abre a versão **FREE**, sem cadastro ou autenticação Supabase.
- Enquanto convidado, leituras e gravações de `localStorage` e `sessionStorage` nesta página usam repositórios **somente na memória**; informações da conta usada anteriormente no navegador não ficam visíveis na sessão convidada.
- Não há sincronização na nuvem sem autenticação; `pushLifeCloud` bloqueia explicitamente acesso convidado.
- Ao atualizar, sair ou fechar a página, os dados criados como convidado são descartados; a única marca real em `sessionStorage` define que esta aba deve continuar em modo convidado até a saída. A marca não contém dados pessoais.
- O botão de sair no canto superior permite deixar o modo convidado, limpar a marca de seleção e abrir novamente o login/estado de sessão normal.
- Para contratar PRO, é necessário entrar numa conta real. O painel PRO existente pode ser pré-visualizado pelo convidado conforme as regras FREE já presentes, mas não autoriza recursos pagos.
- A página continua usando o design preto e laranja da 15.7.1.

## Arquivos principais

- Novo: `assets/js/guest-session-15.7.2.js` — ativação e armazenamento efêmero isolado antes do carregamento dos demais scripts.
- Editados: `index.html`, `assets/js/supabase-auth-9.4.2.js`, `assets/js/life-app-15.7.1.js`, `assets/css/mobile-clarity-15.7.1.css`, `service-worker.js`, `manifest.webmanifest`, `assets/js/config-15.7.1.js` e documentação/testes para nova versão.
- Teste novo: `tests/guest-mode-15.7.2.cjs`.

## Verificações concluídas

- **11 de 11 suítes Node** passam usando `TZ=America/Campo_Grande`, incluindo os cenários de geradores, lógica, qualidade, planos, confiabilidade e acesso convidado.
- Os testes do convidado executam o script real em JavaScript/VM e confirmam: dados anteriores intactos; dados de convidado invisíveis no storage real; dados temporários apagados após recarga; saída restaura a visualização do armazenamento original.
- Todos os arquivos JavaScript passam `node --check`.
- Arquivos HTML, URLs de assets e conteúdo do ZIP revisados estaticamente.

## Limitações a validar na implantação de testes

- O teste de navegação visual completa no Chromium não pôde ser executado nesta infraestrutura por restrição do ambiente do navegador; portanto, não há alegação de aprovação E2E.
- Confirmar numa implantação de teste Vercel e em celular: entrada, criação de tarefa temporária, recarga, saída, retomada de conta cadastrada, acesso FREE/PRO, recuperação de senha e ausência de mistura de dados.
- As funções Supabase de Pix, assinatura por cartão e atualização de plano permanecem externas ao ZIP da Vercel e não foram publicadas ou validadas em produção nesta mudança.
- O modo convidado não oferece garantia de anonimato de rede; apenas evita criar conta e persistir registros do app no navegador/nuvem. Recursos remotos públicos continuam dependendo do funcionamento normal do serviço.

---

## Notas sobre o banco de dados

# Banco — LIFE OS 3.2

Arquivos preservados da versão anterior:

1. `schema-reference.sql` — referência do schema usado pelo LIFE.
2. `security.sql` — RLS, OWNER e proteção dos perfis.
3. `product-analytics.sql` — eventos de produto/analytics.

Antes de executar qualquer SQL em um banco que já possui usuários, faça backup e revise o estado atual do Supabase. Não execute cegamente scripts antigos sobre um schema que tenha mudado manualmente.
