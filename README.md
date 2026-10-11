LIFE OS 12.1 — REVISÃO FUNCIONAL
=================================

Versão derivada da 12.0, preservando o aplicativo, autenticação, perfis FREE/PRO/OWNER e as rotas existentes.

Corrigido
- Falha real de sintaxe JavaScript presente no JS da 12.0, que impedia o carregamento.
- Service Worker de versão antiga (11.2) e exclusão do CSS 12.0 do cache offline.
- Manifest, configuração e etiquetas da versão atualizados.
- Query de cache renovada para scripts alterados.

Novo
- Registro opcional de carga (kg) e repetições por série, vinculado ao exercício real.
- Histórico de séries com primeiro/último registro em Fitness e Evolução.
- Conquistas entre áreas calculadas de registros já feitos.
- Painel de atividade por área em 7 e 30 dias (sem dados fictícios).
- Comandos rápidos reais na pesquisa universal.
- Home personalizável: escolha que módulos mostrar/ocultar.
- Função Supabase life-ai para resposta remota autenticada, condicionada à publicação no seu projeto e segredo OPENAI_API_KEY.

Publicação
1. Extraia o ZIP; envie os arquivos da pasta life_os_12_1_functional para o repositório que a Vercel publica.
2. Não mude caminhos de assets, database ou supabase.
3. Publique; atualize totalmente o navegador uma vez para ativar o Service Worker 12.1.
4. Se quiser usar o modelo remoto, siga supabase/README_CONFIGURACAO.md.
5. Teste login, logout, acesso FREE/PRO, confirmação de assinatura e IA no ambiente real.

Limitações
- Ferramentas de assinatura/webhook Mercado Pago não foram provisionadas ou modificadas automaticamente.
- A implantação da Edge Function não ocorre ao publicar na Vercel.
- Os testes neste pacote são estáticos; não substituem fluxos reais no navegador publicado.
