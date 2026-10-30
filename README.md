# LIFE OS 15.8.5 — Auditoria de gráficos, vídeos e geração + ativação PRO

**Versão 15.8.5 · 100 arquivos · baseada na 15.7.2 mais recente (modo convidado + design Power Premium)**

## Revisão adicional 15.8.5 (28/10/2026)

- Correção de **gráficos por data**: registros armazenados como `AAAA-MM-DD` passam a ser interpretados como data local, sem deslocar atividades para o dia anterior em fusos negativos; o cálculo de sete dias usa datas do calendário, inclusive na mudança de horário de verão.
- **Vídeos**: as pastas continuam com visualização incorporada, técnica e busca exata; adicionados links **ABRIR NO YOUTUBE** nos cards e nos detalhes para quando o proprietário do vídeo impedir a incorporação. Alguns vídeos são *referências do mesmo movimento*, e não tutoriais exatos; disponibilidade remota não foi comprovada.
- **Pagamento**: RPC do checkout aceita evento aprovado que chegue antes de a preferência mudar de `pending` para `created`, somente após validação dos dados do Mercado Pago pelo backend. Mantém idempotência.
- Foram preservados os geradores, abas, propostas, planilhas e relatórios locais. Os testes automatizados não substituem navegação E2E com autenticação verdadeira, visualização de vídeos remotos nem confirmações de pagamento em produção.
- **Migração incremental**: se a versão 15.8.4 já foi aplicada no Supabase, executar novamente a migração revisada após backup e revisão, para incorporar a proteção contra evento antecipado; as funções existentes com sufixo `_v1584` não devem ser renomeadas porque são identificadores de banco persistentes.

## Resultado da auditoria local

Cobertura: lógica do cérebro LIFE, regras de planos e questionários, nutrição, pasta de planilha, sessão convidada, exportação CSV, gráficos de evolução e datas, assets e cache offline, modais de vídeo, regras FREE/PRO, verificação de permissões e integridade dos arquivos. Inclui cenários de entradas incompletas e navegabilidade de layouts isolados em diferentes larguras de tela.

**Limites**: esta auditoria não comprova todos os vídeos do YouTube ao vivo, autenticação real, integração Mercado Pago/Supabase já publicada, serviços AI remotos, nem E2E completo da aplicação em Chrome com React 18, porque o navegador automatizado da infraestrutura bloqueia a navegação de rede/arquivos. Antes de substituir o site de produção, teste uma prévia na Vercel com conta FREE/PRO e aparelho móvel, confira os logs dos webhooks e valide os pagamentos antigos sem nova cobrança. **Não há garantia de zero defeitos.**

## O que esta correção faz

- **Checkout único do Mercado Pago**: o comprador escolhe Pix, cartão ou boleto na página oficial, se estiverem disponíveis na conta do vendedor. R$ 29,90 por **30 dias de acesso**, pagamento avulso com renovação manual — não é débito automático.
- **Confirmação obrigatória no servidor**: a notificação assinada chega em `mercadopago-webhook`, o backend busca o pagamento real, valida valor, moeda, referência e aprovação, e grava o PRO por RPC transacional no Supabase. Voltar ao site não libera acesso por si só.
- **Recuperação de pagamentos aprovados**: a função autenticada `mercadopago-create-subscription` aceita `action=reconcile` para consultar somente pedidos do próprio usuário registrados em `life_mp_checkouts` e em `life_pix_orders`. Ela consulta a API oficial e aplica com idempotência pagamentos que não foram refletidos pelo webhook. A interface executa esse processo ao voltar do checkout e quando a pessoa seleciona **VERIFICAR PAGAMENTO / PRO** no Perfil.
- **Recibos em duplicidade** não adicionam tempo duas vezes. Estornos/chargebacks do checkout novo têm reversão idempotente; o webhook Pix legado permanece preservado para pagamentos antigos.
- **Guest/FREE e todas as abas** mantidos, com o projeto em 100 arquivos.

## Para ativar no projeto real (OBRIGATÓRIO, nesta ordem)

1. Faça backup do banco Supabase e da versão do site que está publicada. Não realize outro pagamento real enquanto a ativação atual não estiver corrigida.
2. No **mesmo Supabase que o LIFE usa**, abra **SQL Editor** e execute `database/life-pix-payments.sql` após revisar. É uma migração cumulativa com as tabelas antigas Pix e novas `life_mp_*`, sem apagar pedidos. Confirme as colunas `profiles.plan`, `profiles.pro_until`, `profiles.subscription_status` e a política de leitura do próprio perfil.
3. Em **Supabase → Edge Functions → Secrets**, configure os nomes **exatos**:
   - `MERCADOPAGO_ACCESS_TOKEN` (token privado da aplicação correta, de teste ou produção)
   - `MERCADOPAGO_WEBHOOK_SECRET` (assinatura secreta dos Webhooks da mesma aplicação)
   - `LIFE_SITE_URL` (endereço HTTPS público do LIFE, incluindo barra final)
   - `LIFE_ALLOWED_ORIGINS` (origem HTTPS do LIFE, sem barra final; se forem vários, separar por vírgula)
   - `LIFE_BILLING_ENABLED=1` **apenas após** instalar a função, a migração e validar a configuração.
   - O Supabase fornece os segredos padrão `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`. **Não cole segredos no navegador, HTML, GitHub ou em um chat**. O webhook Pix legado, se ainda em uso, usa os nomes antigos `MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET`.
4. Publique pelo Supabase CLI as funções:

   ```sh
   supabase functions deploy mercadopago-create-subscription
   supabase functions deploy mercadopago-webhook --no-verify-jwt
   supabase functions deploy mercadopago-pix-webhook --no-verify-jwt
   ```

   **Atenção:** as funções webhook são públicas somente para receber notificações de máquinas, mas verificam HMAC e consultam a API antes de aplicar o pagamento. A função de criação/reconciliação exige um usuário autenticado. O comando `--no-verify-jwt` deve ser usado *somente* nos webhooks, nunca na função de checkout.
5. Na aplicação do **Mercado Pago → Webhooks → Produção**, habilite o evento **Pagamentos (`payment`)** e registre esta URL do seu projeto Supabase: `https://SEU_PROJECT_REF.supabase.co/functions/v1/mercadopago-webhook`. A assinatura secreta deve ser a mesma do segredo `MERCADOPAGO_WEBHOOK_SECRET`. Não substitua a configuração antiga Pix se houver pedidos pendentes sem antes planejar a transição; o checkout novo já possui `notification_url` própria.
6. Ative `LIFE_BILLING_ENABLED=1` e publique **este ZIP com `index.html` na raiz da Vercel**. Ao abrir, confira a versão 15.8.5; se ainda aparecer uma anterior, faça atualização forçada/limpe o cache do aplicativo instalado.
7. **Sem cobrar novamente**, entre na mesma conta que realizou o pagamento anterior e toque em **Perfil → VERIFICAR PAGAMENTO / PRO**. Confirme que o perfil muda para `PRO` e que `pro_until` foi preenchido; um pedido pago registrado nas duas tabelas pode ser reconciliado. Se não mudar, confira os **Logs** de ambas as Edge Functions e os dados do pedido no Supabase. Para pagamentos antigos de cartão que não têm pedido registrado nessas tabelas, é necessária conciliação administrativa com recibo oficial e número da transação; não force o plano pelo navegador.
8. Antes de vender, faça **testes autorizados em ambiente de teste do Mercado Pago** para Pix e cartão. Verifique que uma notificação duplicada não dobra o período, um pagamento pendente não ativa PRO, a falha do webhook é recuperada pela reconciliação, o perfil de outra pessoa permanece FREE e o estorno altera o acesso corretamente. Não realize transações reais repetidas para diagnóstico. A conta de vendedor deve atender aos requisitos oficiais de titularidade e idade; quando necessário, use a de um responsável autorizado.

## O que ainda NÃO foi validado

Esta cópia foi inspecionada e testada localmente: sintaxe JavaScript, modo convidado, principais módulos e arquivos referenciados. **Não temos acesso ao Supabase nem às credenciais ou aos eventos reais do Mercado Pago**, portanto não é possível afirmar que o webhook, a aplicação correta, o perfil, o SQL ou a liberação PRO já estejam funcionando no ambiente publicado. A migração e os deploys acima são imprescindíveis; somente trocar o ZIP não resolve o erro.

Referência oficial de eventos assinados: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications
Referência oficial da pesquisa por external_reference: https://www.mercadopago.com.br/developers/pt/reference/online-payments/subscriptions/search-payments/get

---

## Histórico das versões anteriores (registro; as instruções de instalação atuais são as acima)

# LIFE OS 15.7.2 — Pix, cartão e modo convidado (100 arquivos)

Versão completa baseada na 15.7.0, com 100 arquivos e `index.html` na raiz.

Esta atualização corrige falhas detectadas em gravação e confirmação de planos alimentares, diário/check-out de Fitness, lista de compras, proteção de armazenamento, bibliografia opcional em Estudos e validação de treinos antes de salvar.

Não muda os módulos, o visual preto e laranja, os planos FREE/PRO, o contrato de cobrança nem as funções do Supabase. É recomendável testar num projeto temporário na Vercel e manter a 15.7.0 como backup.

Consulte a seção **Auditoria da versão 15.7.1** abaixo para os testes, correções e limitações.

## Histórico anterior: Pagamento Pix + cartão (adaptação)

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


---

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


---

# LIFE OS 15.7.1 — Cartão recorrente + Pix avulso por 30 dias

## Importante

- Este ZIP mantém **100 arquivos**. O pagamento por cartão atual (`mercadopago-create-subscription`) foi **preservado** e continua existindo **apenas no projeto Supabase já publicado**; ele não estava no ZIP recebido.
- O novo botão **ASSINAR COM CARTÃO** chama a função atual. O botão **PAGAR 30 DIAS COM PIX** usa a nova função `mercadopago-create-pix`, que gera uma preferência do Checkout Pro. Outros meios de pagamento podem aparecer no checkout do Mercado Pago, conforme disponibilidade da conta.
- **Pix NÃO renova automaticamente nesta implementação**. O cliente compra acesso por 30 dias e, quando vencer, precisa comprar novamente. O botão de cartão mantém o fluxo de assinatura anterior.
- O preço de **R$ 29,90** está fixado em `assets/js/life-app-15.7.1.js`, na Edge Function e no SQL. Antes de publicar, confirme que este é o preço que deseja cobrar. Não é possível definir o valor no navegador.
- **Não substitua a função antiga de cartão.** Adicione apenas as duas novas funções.
- Este arquivo é um pacote de código. Nenhuma função ou alteração SQL foi publicada no seu Supabase por este ZIP.

## Configuração necessária, nesta ordem

1. **Faça backup** do banco e das funções do Supabase usados pelo LIFE OS. Confira que a tabela `public.profiles` tem `id`, `plan`, `pro_until`, `subscription_status`. Não rode o SQL de referência legado.
2. No Supabase **SQL Editor**, execute `database/life-pix-payments.sql` uma vez, no projeto de produção **correto**. Ele cria a tabela privada `life_pix_orders` e RPCs atômicas; não altera o fluxo de cartão existente.
3. No Supabase > **Edge Functions > Secrets** configure:
   - `MP_ACCESS_TOKEN` — token privado de produção da sua aplicação Mercado Pago (se já existe, mantenha).
   - `MP_WEBHOOK_SECRET` — chave secreta de Webhooks da aplicação Mercado Pago. Não confundir com access token.
   - `LIFE_PUBLIC_ORIGIN` — somente a origem HTTPS exata do site, por exemplo `https://seusite.com.br` (sem barra final).
   - `LIFE_CHECKOUT_RETURN_URL` — URL HTTPS do app para onde o Mercado Pago retorna, por exemplo `https://seusite.com.br/index.html`.
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` são fornecidos pelo ambiente Supabase e devem continuar restritos ao backend. Não coloque o service role no frontend.
4. Publique as funções no mesmo projeto Supabase que o site usa. Com a Supabase CLI vinculada ao projeto:
   ```bash
   supabase functions deploy mercadopago-create-pix --no-verify-jwt
   supabase functions deploy mercadopago-pix-webhook --no-verify-jwt
   ```
   - O Pix **exige login** e valida o token do usuário com `auth.getUser`, independentemente do `--no-verify-jwt` do gateway.
   - O webhook é **público para receber eventos**, mas rejeita mensagens sem assinatura HMAC válida e consulta a API do Mercado Pago antes de aplicar pagamento.
5. No **Mercado Pago Developers > Sua aplicação > Webhooks**, habilite o evento **Pagamentos** e obtenha a chave secreta usada em `MP_WEBHOOK_SECRET`. A preferência Pix informa a `notification_url` da função nova, sem precisar trocar a URL de webhook que possa ser usada pela assinatura por cartão. Confirme que a conta Mercado Pago aceita Pix no Checkout Pro.
6. Faça upload do ZIP atualizado à Vercel. Não publique os segredos nem execute pagamentos reais para teste antes de verificar a configuração.

## Testes obrigatórios antes de vender

1. Em uma conta FREE de teste autenticada, abra PRO e confirme que **Cartão** inicia a assinatura existente e **Pix** abre Checkout Pro sem mostrar erro. Nunca faça pagamento sem perceber valor e quem recebe.
2. Pague um Pix de teste com autorização apropriada, observe **Edge Functions > Logs** e o evento de Webhook. Confira `life_pix_orders.status = 'paid'` e o perfil PRO com `pro_until` 30 dias após a aprovação. Repetir o mesmo evento **não** deve adicionar novos 30 dias.
3. Retorne ao site e clique **VERIFICAR ASSINATURA** (o site também faz polling após checkout). Somente aprovação no servidor deve liberar PRO.
4. Teste pagamento pendente, recusa, mesma conta já PRO, usuário não autenticado, falha de rede e expiração do PRO (sem cobrança automática do Pix).
5. Simule estorno/chargeback e confira retorno para FREE se a única autorização vigente era o Pix. Em casos de sobreposição com outras assinaturas, faça conciliação manual e examine os logs.

## Advertências técnicas

- As assinaturas por cartão continuam dependentes do **webhook e status** já publicados fora deste arquivo. Não foi possível auditá-los com o ZIP enviado.
- O checkout Pix usa o Checkout Pro de pagamento único, não o endpoint `/preapproval_plan`. Pix no Checkout Pro depende de elegibilidade e configuração do Mercado Pago.
- Os arquivos SQL e Edge Functions **precisam** ser implantados separadamente da Vercel.
- Para desfazer a alteração no frontend, restaure o ZIP anterior. Para reverter o backend, interrompa somente as novas funções, preservando os registros financeiros e logs (não apague pagamentos históricos).
- O webhook confere assinatura, existência de pedido e valor/moeda, e obtém status na API. Ainda assim, para uso comercial, execute testes de integração e conciliação com um responsável pelo negócio. Não há confirmação de ambiente produtivo nesta entrega.


## Patch de checkout (30/10/2026) — pré-publicação, NÃO ativado

Este pacote mantém a base LIFE OS 15.8.5 e a estrutura original de 100 arquivos.
A interface agora chama a Edge Function **mercadopago-create-checkout** nas ações de
criar checkout, consultar status e reconciliar pagamentos, em vez da função antiga.
A segunda tentativa HTTP de criar checkout foi retirada para evitar pedidos
duplicados quando a primeira resposta não é recebida. O service worker usa novo
cache para entregar o JavaScript atualizado.

**Não publicar nem habilitar novas cobranças sem validação:** a função
mercadopago-create-checkout implantada no Supabase deve ser revisada para chamar
a RPC `life_apply_checkout_payment_v1585`, e a função
mercadopago-checkout-webhook deve ter Verify JWT desativado e assinatura HMAC
válida. Mantenha `LIFE_BILLING_ENABLED=0` até testes em ambiente de testes
e autorização do responsável pela conta comercial. A publicação do site não publica
Edge Functions automaticamente e não prova que Pix/cartão estão disponíveis.

O código de referência legado em `supabase/functions/mercadopago-create-subscription`
foi preservado para histórico; não use esse arquivo para substituir a função nova.
