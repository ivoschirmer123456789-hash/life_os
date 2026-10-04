# LIFE OS 6.4 — App Suite + Hybrid Week

## Objetivo
Esta build transforma as áreas principais do LIFE em mini-apps visualmente distintos, mantendo a mesma conta, dados, navegação e identidade central do LIFE OS.

## Treino híbrido
- Todo item classificado como `Híbrido` passa pelo normalizador `ensureHybridWorkout` antes de abrir.
- A biblioteca automática gera uma semana completa (`weeklyItems`) com dias separados de musculação e corrida/cardio.
- O fluxo personalizado prioriza templates híbridos completos.
- Treinos híbridos antigos salvos sem cardio são migrados automaticamente na primeira abertura desta versão.
- A tela de detalhes mostra a semana antes de iniciar e identifica cada sessão como `MUSCULAÇÃO` ou `CORRIDA/CARDIO`.
- Dias de cardio usam estrutura própria de cardio em vez de séries/repetições de musculação.

## Identidade por área
- Hoje → TODAY OS
- Tarefas → ACTION OS
- Notas → NOTES OS
- Estudos / Guia de Estudos → STUDY OS
- Fitness → FITNESS OS
- Receitas → KITCHEN OS
- Finanças → MONEY OS
- LIFE AI → LIFE AI
- Life → PLANNER OS
- Evolução → INSIGHTS OS
- Biblioteca → LIBRARY OS
- Favoritos → LAUNCHER OS
- Meu LIFE → PERSONAL OS
- Archive → ARCHIVE OS
- Perfil / Configurações → ACCOUNT OS
- Tutorial → ACADEMY OS

Cada área recebe cor, superfície, hero, geometria, microtipografia e estados próprios por meio de `assets/css/app-suite-v64.css`, carregado por último para reduzir risco de regressão funcional.

## Preservado
- Login e recuperação
- Supabase e sincronização
- Assinatura FREE / PRO
- Permissões e área Owner
- Dados locais existentes
- Navegação e rotas atuais
- PWA / Service Worker

## Validação estática
A build final deve passar em:
- `node --check` nos JavaScripts ativos;
- referências locais do `index.html` existentes;
- referências do Service Worker existentes;
- ausência de IDs duplicados no HTML;
- parsing do CSS novo sem erros;
- presença das rotas híbridas e da migração de planos antigos.

Integrações externas como Supabase, pagamento e notificações push ainda precisam de teste no domínio publicado.
