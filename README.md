# LIFE OS 14.3 — Power Premium (app completo)

Esta versão é o LIFE OS completo construído a partir do pacote funcional 14.2.1, **não** o protótipo visual com uma imagem só.

## O que mudou
- Home reconstruída com elementos HTML/React reais: painel panorâmico, status do dia, progresso, captura de tarefa, atalhos ilustrados, agenda, tarefas e central de áreas
- Navegação existente preservada (mesmas áreas, ordem e regras FREE/PRO/OWNER) com ícones visuais mais fortes
- Identidade Power Premium: preto profundo, botões laranja, luz cálida, painéis sólidos e toques ciano/dourado
- Figuras decorativas recortadas do conceito visual aprovado, sem usar a screenshot como um botão falso
- Cache PWA atualizado e boot loader da 14.2.1 mantido
- CSS de aplicação mantido em apenas um arquivo consolidado

## Como publicar
1. Extraia o ZIP. O arquivo `index.html` deve ficar na raiz do repositório.
2. Faça uma implantação de teste na Vercel sem substituir seu domínio de produção.
3. Entre com uma conta de teste e abra **Hoje**. O dashboard da imagem aparece após a autenticação, com dados reais da conta.
4. Teste abas FREE e PRO, entrada de tarefa, progresso, formulários, assinatura e sincronização conforme seus serviços estejam configurados.

## Importante
- O design é uma recriação interativa inspirada na imagem. Não é uma screenshot colada; detalhes variam com tela e dados.
- Sem login, o site exibe a tela de autenticação como antes; não foi removida a proteção dos dados.
- A validação local **não** aprova pagamentos reais, webhooks, LIFE AI remota ou Supabase sem implantação e credenciais.
- O cartão visual Sono leva à área **Planejamento**, que reúne rotina e sono.
- Mantenha a versão 14.2.1 como backup até confirmar a nova implantação.
