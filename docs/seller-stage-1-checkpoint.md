# SOKOZA Seller Stage 1 Checkpoint

> Historical checkpoint. Backend production integration was authorized by the product owner on 8 August 2026. Representative seller runtime data and mock authentication described below have been replaced by Supabase-backed state; explicit test fixtures remain for automated UI tests.

**Status:** Rejected and superseded by the complete Seller Studio redesign on 8 August 2026; historical record only  
**Date:** 8 August 2026  
**Implementation basis:** approved `seller-platform-research.md` and `seller-platform-implementation-plan.md`

> Do not use this checkpoint as a UI source of truth. The current seller system is governed by `seller-redesign-audit.md`, `seller-redesign-research.md`, and `seller-design-constitution.md`.

## 1. Outcome

The seller UI foundation is implemented against typed representative mocks. It is visually and structurally separate from the buyer application, keeps SOKOZA’s palette/type/interaction language, and behaves as an action-focused mobile commerce workbench rather than a generic analytics dashboard.

No remote Supabase project, production data, authentication provider, Storage bucket, or backend schema was read or mutated during this stage.

## 2. Buyer corrections closed before Phase 2

- Home now invokes the same ranked visual entity autosuggest used by Discover.
- Exact `NOIR` input exposes the Store avatar and current product imagery, supports direct links, and supports Arrow Up/Down, Enter, and Escape behavior.
- Submitted Home queries enter `/discover?q=…`; Home did not become a separate search destination.
- Store Detail at 1024px and above uses one intrinsic-height cover/identity/fulfilment hero.
- Collection and Delivery remain inside that hero at laptop widths.
- Shop / Drops / About begins at the exact hero bottom in normal document flow, with no negative margin, translated, absolute, or manual offset overlap.

## 3. Stage 1 delivered routes

Public authentication presentation:

- `/seller/sign-in`
- `/seller/recover`
- `/seller/invite`

Protected seller workspace:

- `/seller` — prioritized action Home with truthful, defined demo activity
- `/seller/onboarding` — resumable four-step guided setup and publish-readiness review
- `/seller/store` — Store basics, WhatsApp normalization, fulfilment, policies, pause/resume presentation, and responsive public preview
- `/seller/verification` — exact phone, identity, and business verification states/labels
- `/seller/settings` — session, communication, support, and future data-request presentation
- `/seller/products`, `/seller/drops`, `/seller/enquiries` — protected navigation foundations that explicitly stop at their approved later implementation stages

The five persistent work destinations are Home, Products, Drops, Enquiries, and Store. Verification and Settings are secondary on wide screens. Compact layouts retain all five destinations without borrowing buyer navigation.

## 4. Session and authorization boundary

Stage 1 follows the approved mock-first sequence and does not claim live authentication.

- An HTTP-only, `SameSite=Lax`, path-scoped, four-hour preview cookie opens representative NOIR data.
- Proxy performs a fast optimistic redirect and preserves the complete safe intended `/seller/**` path and query.
- Server-side repositories and protected leaf components independently require the preview session close to data access.
- Sign out expires the matching path-scoped cookie.
- External/open redirect destinations are rejected.
- Sign-in, recovery, invite, expired session/link, delivery delay, and rate-limit presentation states are represented honestly.

The preview cookie is intentionally labeled as non-production authentication. Supabase session validation replaces it in approved backend Stage 6 after the remote audit, schema, RLS, and Storage gates.

## 5. Typed boundaries and integrity work

Added contracts for:

- `SellerSessionRepository`
- `SellerStoreRepository`
- `SellerVerificationRepository`
- `SellerActivityRepository`

The Stage 1 repository returns seller-scoped DTOs rather than database-shaped rows. Product, inventory, Drop, enquiry, opportunity, and operator contracts remain assigned to their planned stages rather than receiving premature behavior.

WhatsApp input is normalized to Zambian E.164 form and tested against local/international formatting. Setup completion is derived from concrete public-readiness fields, not an arbitrary score. Browser-draft saves are explicitly local and never imply a public catalog mutation.

## 6. Home content integrity

Seller Home orders information by operational value:

1. setup blocker;
2. low-stock action;
3. buyer-marked enquiry signal;
4. unfinished draft;
5. quick actions;
6. current catalog state;
7. factual activity definitions.

Activity is visibly labeled representative demo data. Store views, product views, saves, order reviews, WhatsApp opens, and buyer-marked-sent signals each include their definition and evidence limitation. No sales, revenue, GMV, payment, purchase conversion, or completed-order claim appears.

## 7. Responsive and accessibility review

Verified through the in-app browser:

- compact `390 × 844` seller Home, onboarding, and Store management;
- `720px` reflow (equivalent to a 1440px layout at 200% browser zoom);
- `1024px` laptop navigation and verification;
- `1440px` Home and Store management;
- `1920px` wide Settings;
- zero horizontal overflow at every checked width;
- exactly one document `main` landmark;
- semantic seller/auth navigation labels and current-page states;
- persistent compact actions do not intersect the seller bottom navigation;
- unauthenticated private-route requests render no private workspace UI and preserve the intended destination through preview entry.

## 8. Automated evidence

- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm test` — 12 test files, 40 tests passed
- `npm run build` — passed on Next.js 16.3.0; 54 application pages generated and seller routes correctly emitted as dynamic server routes behind Proxy

Seller-specific tests cover WhatsApp normalization, setup-completion derivation, honest auth/recovery presentation, and onboarding progression/readiness. Buyer regression tests remain green.

## 9. Deliberately not started

Stage 2 product list/editor/inventory/bulk workflows, Stage 3 Drops/Enquiries/operator workflows, and every live Supabase/backend stage remain untouched. The three primary destination foundations say which approved stage supplies their functionality rather than presenting fake controls.

The next implementation action is Stage 2 only after this checkpoint is accepted.
