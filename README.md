# LIFE OS 8.4.2 — Performance + Weather Reliability Edition

Baseada na 8.4.1 PRO Refined.

## Corrigido
- fluxo de clima com timeouts menores e feedback imediato;
- localização exige contexto seguro e trata permissão negada sem ficar carregando;
- clima não dispara requisições pesadas no boot; atualização acontece sob demanda;
- busca por cidade mantém fallback e dados salvos;
- observadores de DOM não reprocessam mais o documento inteiro a cada mudança visual;
- sincronização em nuvem ocorre somente quando há alterações locais pendentes e em intervalo maior;
- verificações de notificação são reduzidas quando a página não está visível;
- transições de abas ficaram mais rápidas;
- efeitos GPU caros são reduzidos em mobile/touch, preservando o design PRO.

Use o pacote completo no deploy para que o cache 8.4.2 substitua a versão anterior.
