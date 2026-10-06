# LIFE OS 8.4.2 — QA Performance + Weather

**Resultado: 18/18 verificações estáticas aprovadas.**

## Performance
- Observer principal deixou de acompanhar `class` e `style` do DOM inteiro.
- Acessibilidade de novos elementos é processada de forma ociosa e por escopo.
- Sincronização em nuvem passou de tentativa periódica incondicional para envio somente com mudanças locais, a cada 90 s.
- Relógio e checagens periódicas foram reduzidos quando a página não está visível.
- Troca de abas não segura mais a ação por 210 ms; em mobile a ação começa em ~24 ms.
- Em mobile/touch, blur, backdrop-filter e sombras mais caras são reduzidos.
- Clima não faz chamada externa no boot; só atualiza ao abrir a área.

## Clima
- Previsão: timeout máximo de uma tentativa de ~7 s.
- Busca de cidade: ~5,5 s por tentativa, com fallback de nome simples.
- Botões exibem `BUSCANDO…` e `CONECTANDO…`.
- Permissão negada, contexto sem HTTPS, offline e timeout recebem mensagens específicas.
- Última previsão válida continua disponível em cache.

## Observação
O ambiente de execução usado para empacotar não possui acesso DNS externo, então a disponibilidade ao vivo do Open-Meteo não pôde ser validada daqui. O fluxo, os timeouts, os estados de erro e as referências foram validados estaticamente; no deploy em HTTPS, a API pública é chamada diretamente pelo navegador.
