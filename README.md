# LIFE OS 14.9.6 — Revisão de estabilidade

Atualização baseada na versão 14.9.4. Preserva abas, autenticação, pagamentos, Cérebro e divisão FREE/PRO.

- **Fichas de treinos prontos e personalizados:** cada exercício tem nome, séries, repetições e descanso em card largo, com vídeo num painel `Vídeo salvo nesta pasta` expansível. A foto é capa, não reprodução do vídeo.
- **Capas fotográficas:** quatro imagens artísticas originais para supino reto com barra, supino inclinado com halteres, crossover/crucifixo na polia e paralelas. Demais exercícios usam imagens existentes ou ilustração de fallback. Não há fotografia específica verificada para toda a biblioteca.
- **Vídeo:** quando existe um ID conhecido, o player fica embutido e se abre sob demanda. Referências genéricas são identificadas; a busca do vídeo exato continua disponível. A disponibilidade de cada vídeo externo depende do YouTube.
- **Menu lateral no desktop:** modo completo, compacto ou oculto; ajuste de 240 a 380 px por controle deslizante ou arrastando a borda. Há botão para restaurar o menu oculto, e a escolha fica salva neste navegador. No celular, permanece o menu simplificado da 14.9.4.
- **Layout responsivo:** exercício usa uma ficha por linha para impedir colunas estreitas e texto vertical; vídeo 16:9, mobile em coluna única.

**Publicação:** o ZIP está pronto para ser extraído com `index.html` na raiz do repositório GitHub/Vercel. Configure o backend Supabase em ambiente seguro; o ZIP não realiza alterações no Supabase remoto. Não descarte a 14.9.4 antes de validar a nova versão no seu domínio.

**Limites de validação:** verificações de JavaScript, referências de arquivos, testes locais e layout não equivalem a teste fim a fim de login, pagamento, sincronização e vídeo online.


**Correção 14.9.6:** ocultar o menu agora o retira visualmente e devolve largura ao conteúdo; os modos compacto e completo ajustam a área de trabalho; fechar a pasta de vídeo interrompe a reprodução. Veja `QA_REPORT_14.9.6.md`.
