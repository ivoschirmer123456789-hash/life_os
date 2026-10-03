# LIFE OS 3.2 — Final Edition / release audit

## What changed in the final visual correction
- Today is intentionally minimal: greeting/status, today's checklist, progress, quick add, and one LIFE AI action.
- FREE upgrade messaging no longer competes with Today. Plan messaging is scoped to Profile or relevant locked/advanced areas.
- Global smart search / advanced hub no longer appears on Today.
- Floating LIFE AI and floating create button no longer overlap Today; IA remains a dedicated destination.
- Header is quieter: FREE and normal sync state are no longer repeated as persistent badges.
- Light mode was rebuilt around neutral white/graphite surfaces with orange used as an accent only; the old beige/brown canvas and dark vignette are overridden.
- Dark mode was tightened for stronger hierarchy and less visual noise.
- Page changes use a compact destination transition instead of a loading-screen-like takeover.
- The cinematic intro is shown once after this release and then follows the user's opening setting / per-session behavior.

## Static verification
- All executable JavaScript files pass `node --check`.
- All CSS files parse without syntax errors.
- HTML pages have no duplicate static IDs.
- No referenced local assets are missing.
- Service worker shell references resolve to existing project files.

## Production checks still required after upload
The following depend on the live backend/account and must be verified on the published domain: Supabase sign-in/session, cloud sync with two devices, Mercado Pago checkout/callback, remote LIFE AI Edge Function, and background push configuration.
