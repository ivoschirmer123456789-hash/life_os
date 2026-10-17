# LIFE OS 15.4.7 — Revisão de planos, pastas, início e salvamento

## Origem e escopo

Base: LIFE OS 15.4.6. Revisão direcionada ao fluxo Fitness **pastas por dia → abrir um único dia → iniciar uma sessão → voltar às pastas**, com verificação de dados antigos e persistência. Mantidos as demais abas, identidade preto e laranja, FREE/PRO e projeto completo.

## Falhas concretas corrigidas

1. **Dias explícitos trocados em planos antigos.** Quando sessões misturavam `DIA 1` com `SEG` ou `SEX`, o cálculo de descanso podia ocupar um dia antes de reconhecer um nome explícito mais adiante. Agora os dias realmente nomeados ou registrados são reservados primeiro; os marcadores genéricos preenchem as vagas restantes.
2. **Histórico de treino legado desvinculado.** A normalização substituía `DIA 1` por `Segunda-feira` e podia mudar a chave do acompanhamento. Agora o nome original fica preservado em `lifeOriginalDayKey` para reabrir os registros anteriores.
3. **Treinos temporários com falso sucesso de salvamento.** A ação atualizava o estado visual antes de confirmar a gravação. Agora a versão persistida é conferida, a pasta permanece aberta se falhar e o acesso PRO é novamente verificado antes de salvar.
4. **Início sem exercícios reais.** Sessões vazias podiam iniciar usando o título do dia como exercício e o modal fechava de qualquer forma. Agora uma ficha sem movimentos válidos mostra aviso e mantém a pasta aberta; planos prontos com vários dias não reutilizam a lista inteira como se fosse o treino do dia.
5. **Exercícios legados no formato `{move: ...}`.** O player ignorava o campo `move` e não encontrava o exercício. Agora aceita formatos antigos e atuais (`t`, `name`, `move`, `exercise`, `label`).
6. **Acompanhamento registrado apenas visualmente.** A avaliação da sessão agora confere se foi salva e mostra aviso caso a gravação falhe, sem contar uma avaliação não persistida.
7. **Pasta antiga vazia.** Planos sem sessões válidas agora exibem uma explicação visível, sem simular dias existentes ou apagar o plano antigo.

## Testes executados

- 13/13 suítes de regressão JavaScript incluídas no projeto, usando o fuso America/Campo_Grande.
- 26/26 verificações adicionais de calendário misto, preservação dos dados, salvamento temporário com falha simulada, acesso PRO, início com exercícios em formato legado, e bloqueio de sessão vazia.
- 49/49 verificações da organização semanal (1 a 7 dias, dias explícitos e FREE/PRO).
- 15/15 verificações de interação do componente de pastas de planos prontos e salvos.
- 80/80 verificações no Chromium local em 320, 390, 768 e 1366px, com planos de 3 e 6 dias: abrir pasta, ver apenas os exercícios do dia, voltar, verificar ausência de transbordamento horizontal.
- 22/22 scripts JavaScript com sintaxe válida (`node --check`); 22 arquivos CSS presentes; 32 referências de recursos no HTML e 67 recursos no precache presentes; PWA, manifest e HTML alinhados com 15.4.7.
- ZIP criado com exatamente 100 arquivos, `index.html` na raiz e teste CRC de integridade.

## Limitações

Os testes no navegador usaram uma montagem isolada com o componente e os estilos reais, **não o aplicativo inteiro autenticado**. Não foram verificados pagamentos reais, sincronização Supabase entre aparelhos, liberação de assinatura PRO em produção, vídeos externos nem o domínio público. O sucesso em testes locais não garante inexistência de falhas em produção.

## Como verificar depois do deploy

1. Publicar o **conteúdo completo** do ZIP e confirmar `V15.4.7` no questionário de Fitness.
2. Criar plano de três dias. A primeira tela deve ter pastas de segunda, quarta e sexta, sem exercícios empilhados.
3. Abrir quarta, verificar a ficha exclusiva de quarta, clicar voltar e abrir sexta.
4. Salvar (PRO), reabrir a pasta e iniciar a sessão escolhida. Fechar e reabrir o navegador para confirmar persistência.
5. Para plano antigo com nomes de dias mistos, conferir se dias já nomeados mantêm o calendário e os registros anteriores.
6. Se algo falhar, conferir a versão efetivamente carregada e enviar foto do problema.
