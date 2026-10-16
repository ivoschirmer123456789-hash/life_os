# LIFE OS 15.4.0 — Correções reais de experiência e confiabilidade

Projeto completo para GitHub/Vercel, com o arquivo `index.html` na raiz. Mantidas as abas existentes e o tema preto profundo com laranja.

### Destaques

- Projetos e Tarefas têm atualização de conclusão nos dois sentidos **quando há vínculo explícito**; não criam itens automaticamente nem fazem correspondência só pelo nome.
- O Cérebro local destaca prazos informados e ajuda a abrir diretamente a área relevante.
- Um erro ao salvar é mostrado na tela. Falhas de leitura bloqueiam sobrescrita por dados padrão para proteger a informação local.
- Melhorias de acessibilidade, legibilidade e navegação móvel sem refazer os fluxos existentes.
- Testes de lógica e regressão automatizados; relatório técnico em `QA_REPORT_15.4.0.md`.

### Publicação segura

1. Guarde a versão publicada como backup.
2. Extraia o ZIP na raiz do repositório e faça deploy primeiro em um ambiente de teste.
3. Teste com uma conta real: criar projeto → enviar etapa → marcar em Tarefas → voltar a Projetos, reverter, sair/entrar, conferir dados e sincronização.
4. Teste checkout/assinaturas, login, banco, vídeos e uso em celular antes de substituir o domínio principal.

**Importante:** a versão não modifica o backend Supabase nem configura pagamentos. Não é uma garantia de operação sem defeitos ou de sincronização validada na nuvem.
