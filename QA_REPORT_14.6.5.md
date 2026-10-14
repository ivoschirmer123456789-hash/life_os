# LIFE OS 14.6.5 — Revisão da rolagem e do clima

## Base
Projeto completo 14.6.4 (FREE profissional / PRO Signature, cérebro integrado, projeções, autenticação, biblioteca e integrações) com modificações direcionadas a desktop e ao painel de previsão. Os arquivos de interface/serviço anteriores foram mantidos, exceto o JavaScript principal e o runtime corrigidos, mais a nova folha de estilos.

## Alterações
1. **Roda do mouse no desktop.** A camada de acessibilidade de janelas agora ignora elementos desconectados, ocultos por `aria-hidden`/`inert`, invisíveis ou fora da viewport. Isso impede falsos bloqueios da classe `life-modal-open`. A verificação da rolagem remove um bloqueio obsoleto quando não existe janela ativa.
2. **Menu lateral e cabeçalho fixos.** O scroll vertical da roda é direcionado à página quando o cursor está no menu/cabeçalho e não há área interna que ainda possa rolar. Se a barra lateral ou outro painel possui conteúdo rolável, o scroll nativo desse componente é preservado. `Ctrl+roda` e `Shift+roda` não são interceptados.
3. **Janelas reais mantêm o bloqueio.** A classe do elemento raiz `life-modal-active` impede que o HTML continue rolando por trás de diálogos verdadeiros.
4. **Clima.** O primeiro bloco do painel agora é “Conectar sua cidade”, trazendo busca, botão de cidade, geolocalização opcional e lista de resultados na mesma seção. As informações da previsão vêm depois. Nenhuma localização automática é iniciada ao abrir o painel.
5. **PWA.** Versão do HTML, config, manifest, asset queries e cache atualizados para 14.6.5. O código existente do cérebro local permanece, e a Edge Function remota não foi alterada nesta revisão.

## Testes locais
- `tests/brain-14.6.4.cjs`: 24 verificações aprovadas (incluindo versão de pacote atualizada).
- `tests/reliability-14.6.4.cjs`: 24 verificações aprovadas, incluindo 300 combinações de dados incompletos.
- `tests/usability-14.6.5.cjs`: 16 verificações de ordem do clima, navegação e proteção da rolagem.
- Chromium headless, 1440 px modo noite e dia: roda do mouse sobre sidebar, recuperação de bloqueio obsoleto e diálogo real bloqueando a rolagem — aprovados.
- Chromium headless, 390 px: recuperação de rolagem não intercepta navegação móvel.
- Chromium com CSS real, 390 e 1440 px × dia e noite: busca da cidade acima das informações de previsão e sem rolagem horizontal — 4 cenários aprovados.
- Sintaxe validada em 18 scripts do app + Service Worker; parse de 19 CSS; todas as 26 referências `assets` HTML e 57 caminhos do PWA verificados.

## Limitações
Os testes de rolagem utilizaram elementos representativos do layout com o runtime real e os testes do clima utilizaram HTML representativo com os estilos reais. Não houve teste autenticado fim a fim no domínio publicado. O comportamento em computadores específicos (drivers e extensões do navegador) e o clima via Open-Meteo precisam ser verificados no ambiente real. Login, pagamentos, IA remota e sincronização não foram testados novamente nesta atualização.

## Instalação
Faça backup da versão anterior. Extraia o ZIP e envie os arquivos com `index.html` na raiz do GitHub; a Vercel deverá publicar a nova versão sem alterar domínio ou DNS. Após abrir, teste a rolagem em várias abas, inclusive sobre o menu lateral; clique em “CLIMA” e confirme que a seleção da cidade surge primeiro.
