# LIFE OS 14.6.2 — Relatório de revisão

Base: 14.6.1 FREE Profissional / PRO Signature.

## Corrigido na 14.6.2

1. **Guia básico de Estudos (FREE)**: a interface tinha um botão válido para `Guia de Estudos`, mas a lista de rotas permitidas no FREE excluía essa área; ao entrar, a aplicação podia retornar à Home. Rota agora autorizada para o guia básico, sem liberar opções PRO.
2. **Recuperação de senha**: quando a recuperação abria com uma sessão temporária do Supabase, o portão `Continuar nesta conta` podia substituir o formulário de nova senha. A prioridade da tela de recuperação foi corrigida inclusive para falha ao consultar o perfil.
3. **Tentativa de login inválida**: `lifeExplicitAuth` era acionado antes de confirmar credenciais. Agora só é ativado após retorno de login bem-sucedido.
4. **Rótulo antigo na Home PRO**: ainda aparecia `14.5.9` no painel e rodapé; alinhado para 14.6.2.
5. **Tarefas FREE com rascunhos antigos**: proteção para não acionar marcação de conclusão com identificador ausente.
6. **Atualização/PWA**: versionamento da aplicação atualizado. Os caminhos de CSS/JS são conferidos antes de publicar, evitando apontar para uma folha inexistente. O arquivo `free-product-grade-14.6.1.css` mantém seu nome original (e o conteúdo foi preservado).

## Preservado

- Identidade visual FREE da 14.6.1: todos os **17 arquivos CSS** foram mantidos byte a byte.
- PRO Signature, Home cinematográfica, tema Aurora, prévias PRO e planos FREE/PRO/OWNER.
- Módulos Fitness, Estudos, Alimentação, Finanças, LIFE AI e fluxos de dados existentes.
- Estrutura para GitHub/Vercel com `index.html` na raiz e menos de 100 arquivos.

## Testes locais

- **8 cenários em Chromium** para sessões, recuperação de senha, falha no perfil, login inválido e login válido (Supabase simulado).
- **141 verificações** de estrutura, sintaxe, caminhos e apresentação FREE em 7 combinações de tema/largura: 360, 390, 768, 1024, 1440 px (dia) e 390, 1440 px (noite). O layout visual é uma fixture isolada com CSS real e conteúdo de amostra.
- Regressões de geradores (268 asserções), qualidade (119), integridade (38), produção (23), checkout simulado (6), LIFE 13.0 (16) e interface de agenda (passou).
- **20 testes de release** com uma expectativa antiga do cache revisada para refletir o Service Worker atual de arquivos versionados.
- Verificações adicionais de referências, JSON, sintaxe JavaScript, integridade e estrutura do ZIP.

## Limites e próximos passos

Não houve autenticação real em conta de cliente nem execução de pagamentos, webhooks, serviços de IA ou sincronização entre dispositivos na Vercel. A verificação local **não garante** ausência de falhas na publicação.

Após subir no GitHub e aguardar a Vercel, faça testes com contas FREE e PRO/OWNER: Guia de Estudos básico, login incorreto/correto, recuperação de senha, mudança de tema, Fitness, troca de contas e upgrades. Valide cobrança real somente em ambiente de testes do provedor. Mantenha um backup da 14.6.1.
