# LIFE OS 3.3 — Mobile First Edition


## O que subir
Suba **a pasta inteira** deste projeto para um repositório GitHub. A Vercel usa `index.html` como entrada automaticamente.

Estrutura principal:
- `index.html` — aplicativo e login
- `landing.html` — página pública de apresentação
- `privacy.html`, `terms.html`, `support.html` — páginas públicas
- `assets/css/` — design do aplicativo e landing
- `assets/js/` — lógica do LIFE, autenticação e runtimes
- `assets/icons/` — ícones PWA
- `manifest.webmanifest` + `service-worker.js` — instalação/offline/push
- `database/` — SQL de referência/segurança/analytics
- `vercel.json` — headers de produção

## Publicação simples (GitHub + Vercel)
1. Crie um repositório vazio no GitHub.
2. Faça upload de **todos os arquivos e pastas deste diretório**, mantendo a estrutura.
3. Na Vercel, `Add New → Project` e importe o repositório.
4. Framework Preset: `Other`.
5. Não defina Build Command.
6. Deploy.

## Antes de vender
- Testar login, recuperação de senha e sincronização em dois dispositivos.
- Testar Mercado Pago em conta real/sandbox conforme sua configuração.
- Executar/revisar os SQLs em `database/` no Supabase.
- Validar Edge Functions `life-ai`, `mercadopago-create-subscription`, `life-notification-sync`, `life-push-config`, `life-push-register`.
- Revisar juridicamente `privacy.html` e `terms.html` e adicionar contato oficial da operação.

## Sobre chaves
A chave pública/anon do Supabase pode existir no frontend desde que RLS/policies estejam corretas. **Nunca coloque `service_role`, segredos de Mercado Pago ou outras chaves privadas nesses arquivos.**


## Final visual correction
The 3.1 Mobile First Edition includes a rebuilt light theme, a deliberately minimal Today screen, quieter global navigation, and release-level visual overrides in `assets/css/final.css`. See `docs/FINAL_AUDIT.md`.


## 3.3 Mobile First
- Navegação móvel reorganizada para iPhone e Android.
- LIFE AI flutuante removida no celular para não cobrir a barra inferior.
- Modais e vídeos ficam acima da navegação e deixam uma área externa tocável para voltar.
- Safe areas do iPhone respeitadas com viewport-fit=cover.
- Nova Biblioteca LIFE global: guias, estudos, exercícios, treinos e receitas em uma busca única.
- Menu “Mais” agora também expõe Biblioteca, Tutorial e Configurações como destinos independentes.


## Mobile First 3.3
- iPhone/mobile navigation decluttered.
- LIFE AI floating control no longer overlaps the bottom navigation.
- Dialogs and exercise videos sit above navigation and support backdrop dismissal where applicable.
- Universal Biblioteca combines guides, studies, exercises, workouts and recipes.
- Favorites hearts are independent touch targets in area selection.
- PWA cache bumped to 3.3.0.
