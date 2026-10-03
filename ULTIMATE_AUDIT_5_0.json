# LIFE OS 3.3 — Mobile First Audit

## Escopo
Revisão focada em iPhone/mobile, navegação, sobreposição de botões, modais, Biblioteca global e consistência do PWA.

## Alterações principais
- Barra inferior mobile reorganizada em 5 alvos independentes: Hoje, Favoritos, Criar, LIFE AI e Mais.
- Botão flutuante redundante da LIFE AI escondido no mobile para não competir com a barra inferior.
- Cabeçalho mobile reduzido ao essencial para diminuir aglomeração.
- Menu Mais em uma coluna, com botão de abrir e coração de favorito como alvos separados.
- Modais, vídeos, receitas, guias e painéis elevados acima da navegação inferior.
- Painéis mobile limitados a ~80–82dvh, deixando backdrop livre; tocar fora fecha quando o componente oferece esse comportamento.
- Backdrop mais escuro/blur para impedir que botões atrás pareçam clicáveis.
- Inputs em 16px no mobile para evitar zoom automático do Safari.
- Biblioteca global criada: Guias, Estudos, Exercícios, Treinos e Receitas em uma única busca.
- Biblioteca com busca, filtros, atalhos e resultados em uma coluna no iPhone.
- Tutorial atualizado para explicar Biblioteca e coração de Favoritos.
- PWA atualizado para cache 3.3.0 e busca offline ignorando query string de versão.

## Validação estática
- JavaScript do app e runtimes: node --check sem erros.
- service-worker.js: node --check sem erros.
- CSS: 0 erros de parse em todos os arquivos.
- HTML: 0 IDs estáticos duplicados nas páginas públicas e app.
- Referências locais: 0 arquivos ausentes.
- manifest.webmanifest: JSON válido.
- Versão do runtime: 3.3.0.
- Cache do service worker: life-os-3.3.0.

## Validação visual mobile
Mock em viewport de iPhone (390px):
- Biblioteca sem overflow horizontal.
- Bottom navigation separada e legível.
- Modal de exercício acima da bottom navigation.
- Área externa do modal visível/tocável.
- X não fica sob a barra inferior; não é necessário depender dele quando o backdrop fecha o modal.

## Limitação do ambiente de teste
A navegação de um servidor localhost pelo Chromium deste ambiente é bloqueada por política administrativa. Por isso, não foi possível certificar E2E real de todos os cliques com backend. A validação foi feita com sintaxe, estrutura, referências, CSS, inspeção dos handlers e mocks de viewport mobile. Login, Supabase, Mercado Pago, LIFE AI remota e push continuam dependendo do ambiente publicado.
