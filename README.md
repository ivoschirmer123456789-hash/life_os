# LIFE OS 14.2.1 — correção de carregamento

Correções:
- React e ReactDOM carregados de forma sequencial, aguardando confirmação antes de iniciar o aplicativo.
- Tentativas em três CDNs, sem corrida entre scripts.
- Modo de recuperação visível com opção de atualizar os arquivos estáticos do site.
- Recuperação limpa somente Cache Storage do próprio LIFE OS e registrações de service workers do escopo; NÃO apaga dados no localStorage nem IndexedDB.
- Cache PWA atualizado para nova versão.
- Abas, projetos, formularios, tema grafite, planos e banco de dados preservados.

Se o site publicado continuar sem abrir, envie a URL pública e uma captura de tela com a mensagem exibida; sem acesso ao ambiente publicado não é possível afirmar que a causa no servidor foi corrigida.

Publicação: envie o conteúdo do ZIP para a raiz do projeto no GitHub/Vercel, mantendo index.html na raiz.
