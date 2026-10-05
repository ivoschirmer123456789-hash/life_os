# LIFE OS 6.9.0 — Stability & Performance

## Objetivo
Esta versão é uma revisão de estabilidade e otimização da arquitetura 6.8. Não adiciona uma nova camada visual pesada: corrige problemas de runtime/cache/armazenamento e reduz arquivos duplicados sem remover os módulos ativos.

## Correções reais encontradas
- O `index.html` apagava todos os caches `life-os-*` em toda abertura. Isso foi removido; o Service Worker agora controla o ciclo de cache.
- O runtime de PWA ainda sobrescrevia `window.LIFE_BUILD` como `6.3.2 / Signature System`. A versão agora permanece consistente em `6.9.0 / Stability & Performance`.
- O Service Worker antigo podia guardar qualquer navegação (Privacidade, Suporte etc.) como `index.html`. Cada documento agora é armazenado sob a própria URL.
- Leituras/gravações de storage foram endurecidas para navegadores com armazenamento indisponível, cheio ou restrito.
- O login/tema/preview OWNER também usa acesso protegido ao storage.
- Corrigido um caractere de controle dentro da regex de saudação do LIFE AI FREE que fazia cumprimentos simples não serem reconhecidos corretamente.
- O Error Boundary foi alinhado à versão atual e mantém diagnóstico copiável sem apagar dados.
- Manifest, cache, build e assets foram alinhados para 6.9.0.

## Otimização
- Os 17 CSS ativos foram consolidados, na mesma ordem de cascata, em `assets/css/life-bundle-6.9.0.css`.
- Os runtimes auxiliares ativos foram consolidados em `assets/js/runtime-bundle-6.9.0.js`.
- Foram removidas cópias históricas de `life-app`, configs, auth, runtimes e CSS que não eram referenciadas pelo site atual.
- Assets versionados usam cache `immutable` na Vercel; `index.html`, manifest e Service Worker continuam atualizáveis.
- O pacote caiu de aproximadamente 14 MB descompactado (6.8) para cerca de 2.6 MB antes da compactação, sem remover os recursos ativos.

## Validação executada
- Todos os JS locais ativos e o Service Worker passaram em `node --check`.
- Os três CSS ativos passaram no parser CSS sem erros.
- Todos os arquivos locais referenciados pelos HTMLs existem.
- Nenhum ID duplicado foi encontrado no HTML principal.
- Todas as entradas do shell do Service Worker existem.
- Matriz simulada de renderização FREE / PRO / OWNER: 0 falhas síncronas.
- Auditoria simulada de cliques em todas as abas FREE e PRO: 0 exceções síncronas.

## Limites da validação local
Supabase, Mercado Pago, LIFE AI remoto, push real e políticas RLS dependem de serviços externos e precisam ser validados no deploy com as funções e credenciais corretas. O frontend não inclui segredos privados.
