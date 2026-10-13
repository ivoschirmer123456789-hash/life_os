# LIFE OS 14.6.0 — Auditoria de estabilidade e proteção de dados

## Defeitos concretos corrigidos

1. **Proteção ao retomar sessão** — a ação "Continuar nesta conta" tinha um caminho para abrir o LIFE após detectar login, sem repetir o bloqueio dos dados de outra conta. Agora compara o UID autenticado com o dono dos dados locais e, se houver diferença, exige separação de contas; dados antigos sem identificação também acionam a verificação.
2. **Backup antes de separar contas** — o botão de separar dados locais podia ser habilitado mesmo quando a preparação do arquivo de backup falhava. Agora a exportação retorna sucesso/falha e o botão é liberado somente após sucesso. Ainda é necessário confirmar manualmente que o arquivo foi efetivamente salvo no dispositivo.
3. **Estados antigos ao sair da conta** — janelas temporárias de PRO e preferências pessoais passam a ser limpas no logout, evitando mostrar informações desatualizadas durante a troca de usuário.
4. **Tema da tela de verificação** — o estado inicial de autenticação respeita o tema Dia ou Noite; antes sempre usava fundo preto.
5. **Versão desatualizada** — `LIFE_BUILD` ainda anunciava 14.5.5. Agora mostra 14.6.0, alinhado ao HTML e cache do Service Worker.
6. **Referências de arquivos** — a folha do PRO mantém o nome físico `pro-understands-you-14.5.9.css`; o build atualiza apenas a query de versão. Corrigido no empacotamento depois que o teste detectou o caminho ausente.

## Revisões locais realizadas

- **11 cenários funcionais simulados** de troca de sessão, dados locais antigos, falha de perfil, preparação/falha de backup, logout e tema.
- **107 verificações** de estrutura, referências de HTML, SHELL do Service Worker, sintaxe dos arquivos JS e JSON.
- Seis suítes de regressão existentes foram executadas e passaram: **geradores (268 assertions), qualidade (119), integridade (38), produção (23), checkout simulado (6) e diálogo semanal (1)**.
- **5 cenários visuais isolados** para componente PRO em desktop, tablet e celular, dia e noite, sem rolagem horizontal nos elementos testados.
- ZIP conferido com CRC e `index.html` na raiz. **68 arquivos incluindo este relatório**, abaixo dos 100 do envio web do GitHub.

## Limites importantes

- Os testes de navegador utilizaram conteúdo demonstrativo e CSS real, **não** login autenticado do sistema completo.
- **Não é possível garantir "100% sem erros"**: ainda requer verificação ao vivo do Supabase, permissões no banco, pagamento Mercado Pago, ativação e cancelamento da assinatura, IA, sincronização em dois dispositivos e fluxo PWA/Service Worker após deploy.
- Algumas suítes históricas procuravam manifestos e versões antigas, por isso não foram tratadas como testes atuais de aceitação. Os novos testes de regressão visam especificamente as correções desta versão.

## Como atualizar

1. Guarde um backup dos seus dados do LIFE OS e do repositório anterior.
2. Extraia o ZIP e envie seu **conteúdo** ao GitHub, com `index.html` na raiz; não envie só o ZIP.
3. Aguarde a Vercel publicar em `www.uselifeos.com.br`. Não é necessário modificar DNS ou o domínio.
4. Faça um teste de login com uma conta FREE e uma PRO, troca de conta em navegador de teste, navegação Fitness/Receitas, modo dia/noite e checkout em sandbox.
