# LIFE OS 14.9.3 — Fichas de treino e raciocínio de planos

Base 14.9.2, até 100 arquivos, sem alteração da navegação principal. Treinos prontos, personalizados e player oferecem cartões com séries, execução e vídeo ou busca de vídeo específico. O motor local revê recuperação e apresenta limitações. Ver `QA_REPORT_14.9.3.md`.

---

# LIFE OS 14.9.0 — Cérebro mais inteligente

O projeto preserva o design 14.8.1. Adiciona perguntas diagnósticas, relatórios explicáveis, bibliografia curada, personalização de treinos e contexto remoto consentido. Ver `QA_REPORT_14.9.0.md` para escopo, testes e limites. A função Supabase remota requer implantação separada.

---

# LIFE OS 14.7.2 — Revisão de confiabilidade do Cérebro

Esta atualização mantém a estrutura FREE/PRO e corrige prioridades, datas, isolamento de preferências por usuário e vazamentos de contexto de áreas desligadas na LIFE AI. Consulte `QA_REPORT_14.7.2.md` para testes e limitações.

---

# LIFE OS 14.6.5 — Scroll desktop e conexão de cidade

Versão completa baseada na 14.6.4 (motor inteligente, projeções, modos FREE/PRO) com ajustes focados em:

- Roda do mouse em desktop, inclusive ao apontar o menu lateral quando ele está no limite de rolagem.
- Detecção de janelas ocultas sem bloquear indevidamente a rolagem da página.
- Painel de clima com busca e conexão da cidade no topo, antes dos detalhes meteorológicos.
- Cache atualizado.

## Publicação
Extraia os arquivos do ZIP para a raiz do repositório (index.html na raiz), envie ao GitHub e confirme o novo deploy na Vercel. Mantenha a versão antiga como backup até verificar os dois pontos no site publicado. As melhorias da Edge Function life-ai continuam dependendo de publicação separada no Supabase.
