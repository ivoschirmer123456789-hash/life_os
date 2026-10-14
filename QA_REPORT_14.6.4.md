# LIFE OS 14.6.4 · Auditoria de estabilidade e projeções

## Base e escopo
- Evolução incremental da 14.6.3 completa. O design FREE/PRO, os cenários, a navegação e as regras de acesso foram preservados; os estilos principais e imagens-chave foram comparados byte a byte com a versão anterior.
- Nenhuma informação do Supabase, Mercado Pago ou de usuários reais foi acessada ou alterada nesta auditoria.

## Defeitos efetivamente corrigidos
1. **Falha por registros antigos/incompletos:** o motor de recomendações podia quebrar ao encontrar projetos ou treinos com valores nulos, tipos inesperados ou campos ausentes. As coleções agora filtram registros inválidos.
2. **LIFE AI travada após erro:** a operação de enviar mensagem não liberava obrigatoriamente o indicador de envio se a resposta, um comando ou a interpretação local lançasse exceção. O fluxo agora usa `try/catch/finally` em torno de toda a análise e mostra uma mensagem de recuperação.
3. **Prazo somente de data:** uma tarefa com prazo `AAAA-MM-DD` para o dia de hoje podia aparecer como atrasada logo de manhã. Datas sem hora agora são comparadas por dia; datas impossíveis são ignoradas.
4. **Sugestão financeira vazia:** contexto de Finanças com valores zerados podia ser tratado como existência de registros. A indicação exige movimentações, valor registrado ou saldo real.
5. **Análise redundante:** a Home PRO calculava o cérebro duas vezes (uma ao construir o contexto, outra ao montar recomendações). A análise visual agora pode pedir o contexto sem incluir uma análise interna duplicada.
6. **Versão inconsistente:** o arquivo de configuração ainda indicava 14.6.2. Agora HTML, configuração, manifest, asset queries e PWA refletem 14.6.4.
7. **Contexto remoto truncado:** a Edge Function cortava a string JSON no limite de caracteres, gerando contexto incompleto e podendo perder dados relevantes. O novo empacotamento monta um JSON íntegro, dentro do orçamento de caracteres, priorizando as conexões.

## Projeções que faltavam
- **Simulação de tempo apenas no PRO:** soma apenas durações válidas (1 a 480 minutos) das tarefas abertas e divide pelo tamanho do bloco escolhido nas perguntas do PRO (10, 20 ou 30 min).
- **Transparência:** indica quantas tarefas entraram na conta, quantas ficaram sem duração e que a estimativa não inclui imprevistos, descanso ou agenda; não é previsão de conclusão.
- **Dados insuficientes:** não gera valores fictícios; orienta como registrar durações ou preferências.
- A LIFE AI local passa a responder perguntas sobre estimativa e projeção com essas ressalvas. A função remota pode receber o resumo da projeção **somente depois de implantada no Supabase e com as permissões adequadas**.

## Verificações realizadas
- `tests/brain-14.6.4.cjs`: **24** verificações de motor, integração e arquivos, aprovadas.
- `tests/reliability-14.6.4.cjs`: **24** verificações adicionais, aprovadas, incluindo **300 combinações de dados legados/incompletos** sem exceção.
- **8** cenários visuais isolados (360, 390, 768, 1440 px × modo dia e noite); sem largura excedente. Teste do **componente contextual com CSS real**, não captura de uma sessão autenticada completa.
- Sintaxe de **todos os 18 scripts JavaScript**, mais Service Worker, aprovada.
- **3 funções TypeScript** transpiladas sem erros de sintaxe.
- **18 folhas de estilo** parseadas; **56 caminhos estáticos do PWA e 25 referências de assets do HTML** existentes.
- CSS de FREE e Aurora, CSS principal e imagens-base comparados com 14.6.3; **6 arquivos críticos idênticos byte a byte**.

## Limitações explícitas
- Nenhum teste fim a fim autenticado foi executado na Vercel. Os testes não garantem ausência de todos os problemas.
- **Publicar no GitHub não atualiza a Edge Function** `supabase/functions/life-ai/index.ts`. Ela exige implantação separada, com revisão das origens `LIFE_ALLOWED_ORIGINS`, configuração de segredo de API e verificação de quota.
- Pagamentos Mercado Pago, ativação/cancelamento reais de PRO, troca entre dispositivos, links de e-mail, modelos remotos, notificações push e chamadas externas ainda exigem validação na infraestrutura publicada.
- A capacidade de tempo é uma **simulação baseada nas durações registradas**, não um resultado provável do usuário, nem uma projeção médica, financeira ou psicológica.

## Publicação recomendada
1. Faça backup da versão anterior, extraia o ZIP e envie os arquivos com `index.html` na raiz do repositório.
2. Publique em staging, teste login FREE e OWNER/PRO, e só então atualize produção.
3. No PRO: teste tarefas com/sem duração, os botões das sugestões, a visualização da estimativa, a LIFE AI em modo local e a troca de contas.
4. Teste o modo dia/noite, offline e login novamente após atualização de cache.
5. Só implante a função remota e habilite pagamentos após testar ambiente de homologação.
