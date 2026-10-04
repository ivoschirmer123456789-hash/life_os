# LIFE OS 6.3.3 — Effect cleanup fix

- Diagnóstico observado: `c is not a function`.
- Causa: `save()` retornava `true/false` e era retornado por callbacks de `React.useEffect`.
- React tratava o boolean como cleanup e tentava executá-lo em uma atualização posterior.
- Correção: `save()` não retorna valor; efeitos de persistência usam bloco explícito.
- Helpers globais seguros `load/save` foram adicionados para componentes independentes que já os referenciavam.
- Efeitos de persistência convertidos: 38.
