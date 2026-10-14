# LIFE OS 14.6.5 — Clima, navegação de aplicativo e guias conectados

## Base e entrega
Evolução da versão completa 14.6.4, mantendo intactos os arquivos do visual FREE/PRO aprovado; somente o novo CSS e as novas áreas do PRO foram adicionados. A versão contém todas as páginas, geradores, scripts anteriores, banco de dados e código das funções Supabase.

## Mudanças confirmadas
1. **Clima:** o botão no topo abre a escolha de localização sem chamadas de rede ou pedidos de GPS; consulta por cidade ou uso de localização opcional. Previsão detalhada aparece após escolha da cidade ou ao clicar em “Ver previsão salva”. O fluxo tem timeout e opção manual para erro/permissão negada.
2. **Navegação:** `overscroll-behavior-y: none` impede o overscroll de recarga em navegadores compatíveis. Fallback de `touchmove` só bloqueia o gesto vertical descendente no topo; não bloqueia a rolagem normal nem listas internas que já estão deslocadas.
3. **Estudos:** catálogo editorial com 16 conjuntos de assuntos, livros com título e autoria identificados e pesquisas de vídeos por tema, canal e etapa atual. São resultados de busca do YouTube — o conteúdo individual não foi validado ao vivo.
4. **PRO:** painel de seis apoios (Fitness, Alimentação, Estudos, Rotina, Bem-estar, Finanças), com atalhos reais de conversa com LIFE AI. A orientação sobre bem-estar é geral, sem diagnóstico; alimentação sem dietas restritivas; treino gradual sem avaliação clínica.
5. **Cérebro contextual:** preservados dados autorizados, tarefas e projeções explicáveis da versão 14.6.4. Conteúdo educativo específico é avaliado antes das respostas contextuais genéricas.
6. **Cache:** Service Worker atualizado para 14.6.5, incluindo novos scripts/CSS; nomes históricos de componentes reutilizados não foram alterados.

## Testes locais realizados
- `tests/assistant-14.6.5.cjs`: **24** verificações novas aprovadas (clima, livros, vídeos, escopo PRO, tratamento de privacidade, referências HTML/Service Worker).
- `tests/brain-14.6.4.cjs`: **24** verificações aprovadas.
- `tests/reliability-14.6.4.cjs`: **24** verificações aprovadas, incluindo 300 combinações de dados incompletos.
- `node --check`: scripts JavaScript locais aprovados.
- Navegador Chromium / Playwright: seletor de clima em **360, 390, 768 e 1440 px**, sem transbordamento horizontal (prévia isolada com CSS real).
- Eventos de toque reais em Chromium: descida no topo bloqueada; subida normal permitida; rolagem de lista interna permitida.
- Validação de integridade ZIP e comparação de arquivos FREE/PRO em relação à versão de origem.

## Limites / pendências de validação real
- Clima depende do serviço Open-Meteo e permissão de geolocalização do navegador; sem teste de API externo em produção. Bloqueio do gesto de atualização pode variar em versões antigas de Safari e navegadores incorporados.
- Nenhum fluxo fim-a-fim autenticado no domínio oficial, Supabase, Mercado Pago, chat remoto e sincronização entre dispositivos foi testado. Publicação do ZIP no GitHub **não atualiza a Edge Function** do Supabase, que exige uma publicação separada.
- As recomendações de livros são editoriais; disponibilidades e edições devem ser conferidas. Links para vídeos são pesquisas, não vídeos conferidos um por um.
- O LIFE OS reúne ferramentas de apoio educacional e organização; **não substitui nutricionista, psicólogo, médico, educador físico ou consultor financeiro qualificado** e não deve anunciar esses atendimentos como profissionais licenciados.

## Publicação
1. Faça backup do repositório atual.
2. Extraia o ZIP e envie todos os arquivos extraídos, com `index.html` na raiz, mantendo a estrutura de pastas.
3. Aguarde a implantação na Vercel e teste em uma conta PRO: abrir Clima -> procurar cidade -> escolher resultado -> ver previsão; depois testar GPS opcional, rolagem em celular, troca de contas, Estudos e LIFE AI.
4. Se a interface antiga persistir, feche e reabra o aplicativo após a atualização de cache.
5. Antes de vender assinaturas reais, valide o fluxo de pagamento e acesso PRO em ambiente de testes.
