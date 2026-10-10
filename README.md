# LIFE OS 10.0 — Experience Edition

**Base:** LIFE OS 9.4.2 Premium Performance. Este ZIP é um pacote completo para publicar, não apenas um patch.

## O que mudou

- Home FREE e PRO: bloco **LIFE SIGNAL** mostra planos reais concluídos, progresso e próximo passo de hoje.
- Nova **Central LIFE** com busca por ações/áreas, atalhos, navegação integrada ao roteador original e acesso via Ctrl+K.
- **Modo Imersão** com cronômetro de 15/25/45 minutos, pausar, continuar, reiniciar e histórico de sessões concluídas no navegador.
- **Capturas rápidas** de ideias com consulta, exclusão individual e exportação TXT. Guardadas apenas localmente, separadas pelo ID de conta no navegador (não sincronizadas com o Supabase).
- **Resumo Meu Dia** ligado às tarefas e compromissos reais existentes, com dados locais de foco.
- Ajustes da nova camada de UI: brilho Signature / Minimal e reduzir movimento.
- Refinamento visual do aplicativo e da landing, inclusive para celular, mantendo o tema Dia/Noite e os módulos originais.
- Camada visual com ícones independentes de fontes externas.

## Integrações existentes e limites

- Login, OWNER, assinaturas PRO, Supabase e LIFE AI **continuam usando as funções da 9.4.2**. Esta edição não cria um novo backend de IA nem garante o funcionamento de API externa.
- Alguns atalhos podem abrir telas PRO bloqueadas para plano FREE, obedecendo à regra original.
- O foco e as capturas da Central LIFE são **locais**. Não prometem sincronização em nuvem.
- Recursos prometidos em versões futuras (IA autônoma executando ações, automações externas, recomendações sofisticadas entre áreas) **não foram inventados** nesta edição.

## Publicar

1. Extraia o ZIP.
2. Envie **todos** os arquivos e pastas da raiz extraída para o repositório GitHub do LIFE OS, incluindo `assets`, `database`, `docs` e `manifest.webmanifest`.
3. Faça deploy na Vercel com framework `Other` e sem comando de build para esta versão estática.
4. Atualize o site e confira o cache PWA. O service worker usa `life-os-10.0-experience` para substituir o cache anterior.
5. Teste no domínio publicado: login, abertura da Home, atalhos, cobrança PRO, OWNER e chamadas LIFE AI usando uma conta de teste. Essas integrações reais dependem de serviços e permissões externas.

## Documentação

- `QA_REPORT_10.0.md` — verificações estáticas e os limites dos testes locais.
- `docs/history/` — histórico e relatórios anteriores preservados.
