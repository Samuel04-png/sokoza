# SOKOZA PWA Install Foundation

**Status:** Buyer-phase interaction and technical foundation complete; approved icon asset outstanding  
**Date:** 8 August 2026

## Product behavior

- Android/desktop installation uses the browser-provided `beforeinstallprompt` event only when available.
- iPhone/iPad uses a SOKOZA dialog explaining Safari Share → Add to Home Screen.
- The floating prompt is earned by a second session or meaningful shopping activity.
- It is suppressed on Product, Cart, and Order Review surfaces, after installation, and for 21 days after dismissal.
- Settings shows the action only when the current platform/browser can act.
- SOKOZA does not distribute or suggest an APK.

## Manifest and service worker

`/manifest.webmanifest` defines the production name, short name, standalone display, `/` scope/start URL, approved cream theme/background color, and shortcuts to Discover, Stores, and Cart.

`/sw.js` caches only same-origin versioned `/_next/static/` framework assets. It deliberately does not intercept or cache:

- page navigations or rendered catalog HTML;
- product, store, price, availability, Drop, Cart, or enquiry data;
- API/Supabase requests;
- product/store images;
- WhatsApp links.

This keeps mutable marketplace truth network-driven and avoids presenting stale price or availability as offline truth.

## Brand asset blocker

The supplied archive contains a 3D logo reference but no approved square application icon. The design constitution prohibits redrawing or deriving an icon from that reference. Therefore the manifest intentionally omits `icons` until brand supplies approved maskable and standard PNG assets.

Required final assets:

- `public/icons/sokoza-192.png` — 192×192 PNG, purpose `any`;
- `public/icons/sokoza-512.png` — 512×512 PNG, purpose `any`;
- `public/icons/sokoza-maskable-512.png` — 512×512 PNG with approved safe zone, purpose `maskable`;
- an approved Apple touch icon if brand requires a platform-specific crop.

Once supplied, add them to `src/app/manifest.ts` and Next metadata, then re-run installability checks in Android Chrome/Samsung Internet, desktop Chromium, and iOS/iPadOS Safari. Until then, the native Chromium install event may correctly remain unavailable because the browser controls installability.
