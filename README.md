# LIFE OS 14.6.0 — Revisão de segurança e estabilidade

Projeto completo, baseado no LIFE OS 14.5.9, com os módulos FREE/PRO/OWNER, Fitness, Estudos, Receitas, Finanças e LIFE AI preservados.

## Correções verificadas
- Uma entrada de sessão existente (`enterSavedLife`) agora bloqueia abertura de dados locais se o UID conectado não corresponder ao dono do navegador ou se houver dados antigos sem dono identificado.
- Falha ao preparar o backup **não desbloqueia** a etapa de separar dados locais entre contas. O botão exige uma exportação iniciada com sucesso e uma confirmação manual de que o arquivo foi salvo.
- Ao trocar de conta ou desconectar, estados temporários de PRO e do formulário de preferências são descartados.
- O estado inicial `checking` obedece ao tema dia/noite; antes tinha sempre fundo preto.
- Metadado LIFE_BUILD sincronizado com a versão da publicação; cache do Service Worker recebe novo nome/versão.

## Publicação
- Extrair e enviar **os arquivos internos** ao repositório, com `index.html` na raiz, não a pasta externa.
- Não modificar DNS ou domínio (`www.uselifeos.com.br`).
- Verifique FREE, PRO e OWNER com contas **de teste**; confirme banco e pagamentos em staging antes de produção.

## Limites da validação
Testes locais de sintaxe, regressões e componentes simulados NÃO equivalem a login, Supabase, checkout ou notificações reais. Não é possível garantir ausência total de erros em produção.
