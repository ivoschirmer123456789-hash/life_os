# LIFE OS 15.0.1 — Planos e pastas revisados

Projeto **completo**, baseado na 14.9.7. Extraia o ZIP e mantenha o `index.html` na raiz do repositório ao publicar no GitHub/Vercel.

## O que foi melhorado

- Treinos **prontos** agora usam a mesma visualização dos personalizados: uma sessão por vez e dias numa barra horizontal no topo.
- Treinos **salvos** aparecem como pastas claras, inclusive na tela de busca/foco. O dia selecionado abre separado, com as informações do próprio dia.
- Trocar de dia reinicia a posição da ficha e desmonta o conteúdo do dia anterior.
- Vídeos são carregados **somente** ao abrir a pasta; ao fechar, a reprodução para.
- Sessões de corrida recebem explicações e exemplos práticos. Sem um vídeo específico, a busca é **opcional**, não o destaque principal.
- Exercícios sem imagem verificada usam uma capa gráfica limpa, sem mostrar uma foto do movimento errado.
- Corrigidos botões, contraste, abas e rolagem interna nas larguras de celular, tablet e computador.
- Atualizada a versão de HTML, `config`, manifest e cache do service worker para **15.0.1**.

## Preservado

Abas, Cérebro LIFE AI, treinos existentes, planos alimentares, autenticação, configuração de pagamento, estruturas FREE/PRO, Supabase e dados do usuário. O upgrade **não apaga** registros locais; mantenha backup antes de atualizar a produção.

## Testes e limites

A aprovação local engloba 13 suítes do repositório, 12 verificações de mudança de dia e 12 cenários de layout em navegador (320–1920 px, temas claro/escuro). Veja `QA_REPORT_15.0.1.md`.

Os testes não substituem validação com login real e ambiente remoto: vídeos do YouTube podem ser retirados ou bloquear incorporação; pagamentos, sincronização e autenticação dependem da configuração do seu servidor. Valide primeiro num deploy de teste antes de substituir o domínio atual.


## Destaque 15.0.1 — Projetos
Abra **Projetos** na navegação. Escolha um modelo ou crie um roteiro livre, selecione prazo e inicie sua pasta. Consulte `QA_REPORT_15.0.1.md` para detalhes e limitações de validação.


## Revisão 15.0.1
Correções na aba Projetos: datas válidas, compatibilidade com projetos antigos, checklist, navegação mensal, modo claro e cache atualizado. Consulte `QA_REPORT_15.0.1.md`.
