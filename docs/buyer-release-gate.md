# SOKOZA Buyer UI Release Gate

> Superseded on 8 August 2026 for backend scope: the product owner authorized production Supabase integration. This document remains the historical buyer-UI gate; current backend readiness is tracked in `production-readiness.md`.

**Status:** Revalidated after final buyer search, Store Detail, and install corrections  
**Date:** 8 August 2026  
**Scope:** Buyer/public experience only  
**Governing sources:** `product-research.md`, `product-decisions.md`, `design-strategy.md`, and `reference-design-audit.md`

## 1. Gate decision

The buyer UI is complete enough to release into the next product phase. The approved experience is coherent from discovery through a seller-specific WhatsApp enquiry, includes realistic failure and recovery states, preserves the four canonical buyer destinations, provides direct visual entity discovery, and deliberately recomposes Store Detail across compact and wide layouts.

This gate means the frontend behavior and mock repository are production-shaped. It does **not** mean that live Supabase data, seller authentication, production moderation, legal review, or public deployment are complete.

No seller workspace implementation began before this gate passed.

## 2. End-to-end journey coverage

The buyer can:

1. Enter through Home, Discover, Stores, Cart, a shared Store URL, a Drop URL, or a Product URL.
2. Browse truthful fictional inventory with consistent product, seller, price, size, condition, availability, and imagery.
3. Search from Home or within Discover, recognize visual product/store/Drop suggestions, open a known entity directly, or continue into Discover results and refine by category, size, condition, color, store, location, fulfilment, price, availability, and Made Here status.
4. Open a product, inspect images and size guidance, select an available variant, and add it to the Cart.
5. Review Cart items grouped by seller, with no misleading cross-seller monetary total.
6. Start an order review for one seller only.
7. Reconcile a changed price, unavailable variant, deleted item, stale listing, or paused store before handoff.
8. Open WhatsApp with a prepared enquiry or use Web, copy-message, and manual-number fallbacks.
9. Return to SOKOZA and record whether the enquiry was sent without implying a completed purchase.
10. Revisit local Saved items, Recently Viewed items, Cart state, and Enquiries without creating an account.
11. Add SOKOZA to a supported device after an earned prompt, or use explicit Safari Home Screen instructions on iPhone/iPad, without an APK or interruption during order review.

## 3. Canonical routes

### Primary buyer destinations

- `/` — Home
- `/discover` — browse, focused search, grouped autocomplete, mixed result tabs, filters, sort, and recovery
- `/stores` — stores directory
- `/cart` — seller-grouped Cart

Previous search URLs permanently redirect into equivalent `/discover` query state. The previous cart URL permanently redirects to `/cart`; neither appears in buyer-facing navigation or copy.

### Supporting public and local-state routes

- `/stores/[slug]`
- `/drops/[slug]`
- `/products/[slug]`
- `/order-review/[storeId]`
- `/saved`
- `/recently-viewed`
- `/enquiries`
- `/profile`
- `/settings`
- `/sell`
- `/help`
- `/safety`
- `/terms`
- `/privacy`

The `/sell` route is a buyer-facing seller proposition and entry point only. It is not a seller dashboard implementation.

## 4. Inconsistencies resolved

| Area | Resolved behavior |
|---|---|
| Navigation | Home, Discover, Stores, and Cart are the four canonical buyer destinations on mobile and desktop. Search is contained within Discover; Profile is reached from the avatar. |
| Store context | Store pages activate Stores, not Search or Profile. |
| Currency | All buyer prices use `K350`-style presentation. |
| Transaction language | The UI uses Cart, Review order, Open WhatsApp, order enquiry, and buyer-marked sent; it never calls a handoff a completed purchase. |
| Seller grouping | Cart and order review operate per seller. Other seller groups are preserved after a handoff. |
| Totals | Only seller-specific item value is shown; there is no cross-seller grand total. |
| Trust | Exact verification language replaces generic trusted/verified badges. Ratings, review counts, sales counts, and fake popularity are absent. |
| Availability | Freshness, stale, low-stock, sold, unavailable variant, paused store, and changed-price states are explicit. |
| WhatsApp | Handoff follows review and validation. Failure, Web, copy, manual-number, and return states are available. |
| Product identity | Images, titles, variants, price, availability, and seller refer to the same entity. |
| Icons | Controls use the typed Hugeicons-first registry rather than mixed icon systems. |
| Dialogs | Shared accessible dialogs provide focus containment, Escape handling, focus restoration, and inert background behavior. |
| Responsive behavior | Wide layouts recompose rather than stretch mobile layouts; compact actions do not obscure content or bottom navigation. |
| Low data | Reduced-data mode lowers image quality and motion while preserving meaningful product imagery and recovery. |
| Missing media | Images retry once, then expose a stable fallback without blocking product information. |
| Discover suggestions | Home and Discover use the same typed product/store/category/vibe/Drop rows with real imagery and metadata, ranked by match evidence rather than fake popularity, with direct links and complete combobox keyboard behavior. |
| Store Detail | Compact cover/avatar flow is preserved; 1024px+ layouts use one intrinsic-height dominant-cover/identity/fulfilment hero. Tabs start only after its shared bottom edge. |
| Install experience | Native prompt where available, iOS Safari instructions, standalone detection, 21-day dismissal, earned timing, Settings access, and no APK language. |
| PWA cache integrity | The service worker caches only versioned static framework assets and never intercepts dynamic catalog/navigation/API/image truth. |

## 5. State coverage

The UI includes:

- loading and route-level failure;
- offline and retry behavior;
- empty Saved, Recently Viewed, Enquiries, Cart, and Discover results;
- image failure and retry;
- local-storage validation, migration defaults, and failure feedback;
- unavailable and deleted Cart items;
- price changes requiring acknowledgement;
- stale products and availability warnings;
- seller-paused ordering and contact blocking;
- invalid WhatsApp number and unavailable-app fallbacks;
- duplicate-action prevention and undo for Cart removal;
- accessible modal, gallery, filter, location, size-guide, and reset behavior.
- one-character search threshold, pending suggestions, no close match, stale-request cancellation, direct suggestion navigation, and keyboard dismissal;
- install first-session suppression, engagement eligibility, unsupported native prompt, iOS instructions, dismissal, and standalone suppression.

## 6. Responsive and accessibility checks

The principal journeys were checked at a compact `390 × 844` viewport and wide `1440px` composition. Store Detail was additionally rendered at `430`, `768`, `1024`, `1280`, `1366`, `1536`, and `1920` CSS pixels, plus 125%, 150%, and 200% zoom-equivalent reflow widths. Home, Discover browse/search/results, Product Detail, Store, Cart, Order Review, gallery, dialogs, and Settings were visually exercised.

Release criteria include:

- keyboard-operable controls and dialogs;
- visible focus and accessible names;
- non-color state indicators;
- a 44px interaction-size target;
- WCAG AA contrast for body and secondary text;
- reduced-motion support;
- responsive image sizing, eager above-fold imagery, and lazy below-fold imagery;
- no persistent action covering navigation or product content.

## 7. Verification evidence

The buyer UI passed:

- `npm run typecheck`
- `npm run lint`
- `npm test` — 9 buyer test files, 31 buyer tests, including navigation, shared Home/Discover visual autosuggest, rich ranking/interaction, install policy, persistence migration, offline recovery, and route-error retry
- `npm run build` — 43 generated pages with canonical, compatibility, and manifest routes
- a production route crawl covering 23 canonical, compatibility, manifest, and service-worker responses plus the intentional missing-product recovery UI
- browser QA including Home and Discover visual `NOIR` autosuggest on desktop/mobile, Arrow Down + Enter direct store navigation, Store Detail at the width/reflow matrix above with exact hero/tab edge alignment, query-preserving redirects, result return-state, Cart grouping, and seller-specific order review
- manifest response inspection and service-worker cache/header verification

## 8. Remaining gates outside this phase

Before a public beta, SOKOZA still needs:

- the remaining approved seller UI stages and seller operating model gates after the completed Stage 1 foundation;
- Supabase migrations, RLS, Storage policies, and server-side order intents;
- seller verification, moderation, reporting, and curation operations;
- production content and launch-supply freshness checks;
- target-device WhatsApp testing;
- a brand-approved square application icon followed by real-device PWA installability testing;
- legal review of terms, privacy, prohibited items, marketplace disclosures, and seller policies;
- deployment, monitoring, backup, and incident procedures.
