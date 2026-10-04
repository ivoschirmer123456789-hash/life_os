# LIFE OS 6.1 — Safe Polish Layer

This pass intentionally preserves the LIFE OS 6.0 application architecture and adds a small final override/runtime layer.

## User-visible changes
- Settings use a lighter graphite surface in night mode with stronger text and control contrast.
- Clicking outside Settings now returns to Profile when Settings is open as a page, and closes it when used as a modal.
- The duplicate floating OWNER button is hidden. Owner access remains available from Profile through LIFE Control.
- Owner panel can close by backdrop click or Escape.
- Profile hierarchy, touch targets, mobile bottom navigation, modals, empty states and interaction feedback were polished.
- Reduced-motion support and focus-visible treatment were strengthened.
- Existing search, favorites, notifications, offline/PWA, history, sync, PRO/FREE and other application features are preserved rather than duplicated.

## Safety approach
- No database schema was changed.
- No Supabase URL/key or subscription rules were changed.
- Existing 6.0 CSS/JS files remain in place; the polish layer loads last.
- Only small localized edits were made in life-app.js and supabase-auth.js for Settings exit behavior and the relocated Owner entry point.
