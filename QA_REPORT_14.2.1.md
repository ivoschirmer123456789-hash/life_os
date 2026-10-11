# LIFE OS 14.2.1 — Auditoria do carregamento

## Defeito confirmado
`life-app-9.4.2.js` usa `window.LifeGeneratorRules122.makeWeeklyPlan` na construção de dados iniciais, mas o `index.html` 14.2 **não carregava** `assets/js/generator-rules-12.2.js`. Isso dispara exceção JavaScript antes da montagem da Home e mantém o carregamento na tela.

## Correções
- Carregar `generator-rules-12.2.js` antes de `life-app-9.4.2.js`.
- Carregar React e ReactDOM de forma sequencial aguardando cada biblioteca, com alternativas em CDNs.
- Esperar o cliente Supabase antes da inicialização de login, com URLs alternativas.
- Mensagem de recuperação quando biblioteca/arquivo não abre; recarregamento e botão opcional de atualizar caches estáticos do LIFE sem limpar localStorage ou IndexedDB.
- Nova versão de cache de PWA e manifest 14.2.1.
- Mantida a interface grafite e todas as abas e lógicas dos formulários existentes.

## Testes
- Reprodução do erro anterior em navegador com React simulado: `Cannot read properties of undefined (reading 'makeWeeklyPlan')`.
- Após correção, início bem-sucedido com bibliotecas React/ReactDOM simuladas, sem erro de script.
- Falha de bibliotecas simulada: exibe mensagem e ação de atualização.
- `node --check` passou para todos os arquivos JS.
- 8 suítes herdadas passaram: geradores, qualidade, recursos da 13.0, produção, lançamento, UI, integridade e checkout simulado.
- HTML, referências dos arquivos e ordem de inicialização verificados.

## Limites
Não foi possível testar a conta e o link publicado do usuário, nem pagamentos e Supabase reais. Sem a URL pública, a confirmação depende do deploy.
