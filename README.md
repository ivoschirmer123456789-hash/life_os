# LIFE OS 7.6.1 — READY BUILD

Versão completa consolidada a partir do LIFE OS 7.0 Constellation com as melhorias cumulativas 7.1, 7.2, 7.4 e 7.6 incorporadas ao pacote principal.

## O que já está dentro deste pacote
- Aplicação principal completa (`index.html` + todos os módulos antigos da Constellation).
- Visual premium/mobile da linha 7.x, incluindo Home/Hoje, Central de Ajuda e Painel Owner.
- Assets de mídia e CSS das atualizações 7.1–7.6 incluídos localmente.
- PWA/service worker atualizado para 7.6.1.
- Cache offline com todas as dependências locais usadas pelo `index.html`.
- Correção de inconsistências de versão entre UI, diagnóstico, PWA e cache.
- Melhor tratamento de modais/overlays e fechamento por ESC no desktop.
- Compatibilidade de montagem ReactDOM com `createRoot` e fallback para `render` quando disponível.
- Configuração Vercel endurecida para evitar HTML/manifest antigos em cache.

## Publicação
Este ZIP é um pacote **completo**, não é “Update Only”.

1. Extraia a pasta.
2. Envie todo o conteúdo para o repositório conectado à Vercel, substituindo os arquivos antigos.
3. Faça o commit/deploy.
4. Depois do deploy, abra o site e recarregue uma vez para o novo service worker assumir o cache 7.6.1.

## Dependências online
Login/sincronização usam Supabase. Clima, LIFE AI remota, pagamento, push e sincronização entre aparelhos dependem dos serviços externos configurados no ambiente publicado.
