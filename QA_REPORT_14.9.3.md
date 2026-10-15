# LIFE OS 14.9.3 — Fichas e motor de planos

## Objetivo
Aprimorar o Cérebro e os planos de treino sem modificar a navegação principal, a identidade FREE/PRO ou o backend. Base: LIFE OS 14.9.2 com 97 arquivos.

## Recursos implementados
1. **Treino pronto:** agora abre uma ficha antes de iniciar; contém resumo, lista de movimentos, séries, repetições, pausa e um botão para iniciar cada sessão. Modelos com `weeklyItems` exibem seus dias individualmente.
2. **Treinos personalizados:** as fichas continuam abrindo de `Meus treinos`, com a mesma apresentação de cartões e consulta de vídeo. Há um pequeno resumo inteligente das informações do plano.
3. **Player de treino:** o exercício em execução apresenta o mesmo cartão com demonstração/busca de tutorial, incluindo os movimentos não encontrados na biblioteca.
4. **Vídeos:** cada cartão possui botão de vídeo. Quando o exercício corresponde precisamente a um vídeo do catálogo, abre o tutorial dentro do LIFE. Quando a biblioteca oferece somente um vídeo de referência para uma família de movimentos, a tela identifica essa diferença. Se não há uma demonstração identificada, o botão abre uma **busca específica no YouTube**, não um vídeo inventado. Uma busca pelo exercício exato está sempre disponível. Thumbnails dependem de internet.
5. **Melhor correspondência:** a lógica usa nomes exatos e uma lista de variações explicitamente mapeadas; deixou de selecionar qualquer exercício que tivesse apenas a primeira palavra semelhante.
6. **Planejamento mais prudente:** o motor `LifeIntelligence149.refineTrainingPlan` confere estrutura, preserva os exercícios, normaliza prescrições e reduz o número de séries quando o usuário informa pouco sono, recuperação limitada ou retorno após pausa. Para menores de 18 anos, limita a quantidade de séries por exercício e indica supervisão/técnica; não cria metas corporais ou recomenda cargas máximas.
7. **Auditoria contextual do treino:** `analyzeWorkoutPlan` informa quantidade de sessões e movimentos efetivamente presentes, motivos, perguntas de acompanhamento e advertências quando faltam dados. O resumo foi conectado às fichas e ao relatório local da LIFE AI.
8. **Design:** hierarquia de títulos mais clara, miniaturas com selo de vídeo e ícone de reprodução, quatro indicadores do treino, cartões por sessão, botões de ação destacados, layout responsivo e compatibilidade com modo claro/escuro.

## Limitações importantes
- A biblioteca local não contém vídeos **exatos e verificados para todos os milhares de exercícios**. Para os demais, o site fornece uma referência identificada ou busca. Uma busca não garante vídeo existente, específico ou correto; o usuário deverá verificar a execução e a fonte.
- Imagens de miniaturas do YouTube e vídeos incorporados exigem conexão, permissão do navegador e disponibilidade externa.
- O navegador completo com login real, integração remota LIFE AI, Supabase, assinaturas e pagamentos **não foram validados**. A interface foi testada em HTML representativo em Chromium, não no site autenticado.
- `refineTrainingPlan` aplica regras conservadoras, não treinamento personalizado por profissional ou IA remota universal. As decisões devem ser revistas diante de dores, condições médicas ou dúvidas de segurança.
- O motor de IA local não acessa outras contas nem compartilha dados; publicação da Edge Function do Supabase continua separada da Vercel.

## Testes
- 24 testes novos em `tests/plan-14.9.3.cjs`: vídeo exato, vídeo de referência, busca, cards, cardio, séries, não mutação de dados, juventude, recuperação, entrada dos treinos prontos, contexto PRO.
- Testes preexistentes de inteligência, lógica, cognição, nutrição e regressões executados. Comparações antigas de número de release foram atualizadas nos arquivos de teste para 14.9.3; as verificações funcionais não foram removidas. Um teste de datas depende de `TZ=America/Campo_Grande`.
- 4 testes de viewport de uma amostra fiel do HTML/CSS novo via Chromium/Playwright (`320`, `390`, `768`, `1440` px), sem overflow horizontal. O ambiente bloqueou navegação direta `file://`, por isso foi usado `page.set_content`.
- Sintaxe dos JS, caminhos de assets locais no HTML, recursos de precache, integridade CRC do ZIP e contagem de arquivos conferidos.

## Implantação
O ZIP coloca `index.html` diretamente na raiz e mantém **menos de 100 arquivos**. Faça backup, implante primeiro numa URL de testes, verifique exercícios sem vídeo exato, ficha pronta, ficha personalizada, player, dietas, salvamento e acesso FREE/PRO. Atualize o cache PWA após deploy.
