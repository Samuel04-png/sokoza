# SOKOZA brand asset audit

Audited 9 August 2026. The approved standalone SOKOZA mark is `public/assets/sokoza logo/Untitled design (5).png`. It is square, legible at small sizes and does not replace the text wordmark in the product header. `sokoza logo.png` is a full lock-up/environmental composition and is retained as source art, not used as an app icon.

The supplied `favicon (1).zip` contained a coherent derivative set. The production mappings are:

| Surface | Production asset | Size / format | Status |
|---|---|---:|---|
| Browser favicon | `src/app/favicon.ico` | multi-size ICO | Installed |
| Vector favicon | `public/icons/sokoza.svg` | SVG | Installed |
| Apple touch icon | `src/app/apple-icon.png` | 180×180 PNG | Installed |
| PWA icon | `public/icons/sokoza-192.png` | 192×192 PNG | Installed |
| PWA icon | `public/icons/sokoza-512.png` | 512×512 PNG | Installed |

`src/app/layout.tsx` declares browser/Apple icons and `src/app/manifest.ts` declares PWA icons. No native Android project exists in this repository, so there are no launcher/adaptive-icon resources to update. A native Android package should derive its foreground/background assets from the same approved standalone mark when one is introduced.
