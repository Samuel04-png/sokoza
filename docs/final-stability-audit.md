# Final stability audit

Date: 8 August 2026  
Scope: buyer marketplace, Seller Studio, Supabase persistence, publication, media, responsive layout, and release regression.

## Release result

The production schema is applied to Supabase project `kzixedushlpthxehqoho`. The live database contains canonical city/category reference data, 18 public marketplace tables, three media buckets, and five recorded migrations. The marketplace began empty and contains no seeded/demo sellers or products.

Temporary Seller A and Seller B records were used only for the golden path and security tests. Their exact test data and media are removed after verification.

## Root-cause record

### Onboarding reset and duplicate writes

- Observed: Account could appear to advance, then Store/WhatsApp returned to an earlier step or showed an unsaved error.
- Root cause: onboarding used the generic optimistic write queue and split one Continue action into entity/progress writes. After initial Store insertion, the form also retained its pre-save blank Store ID/version, so the next step attempted another insert.
- Files changed: `src/components/seller-onboarding.tsx`, `src/components/seller-studio-provider.tsx`, `src/app/api/seller/studio/route.ts`.
- Database: progress is persisted with the Store/Product mutation for that step.
- UI: Continue validates, waits for one authoritative response, advances only on success, and keeps typed data on failure. Back is local; unreached steps remain disabled.
- Regression: tests cover one-request failure, draft retention, successful advancement, canonical selectors, and `visibilitychange` stability.
- Verification: the live Account → Store → WhatsApp → Selling → Product → Preview path completed and resumed correctly after reload.

### 422 responses

- Observed: valid-looking city/category input produced validation failures.
- Root cause: UI free text and backend canonical UUID expectations were inconsistent, while the live project initially lacked the referenced `cities` and `categories` schema/data.
- Files changed: onboarding/editor components, Seller Studio API route, and repository reference loader.
- Database: live reference data now contains four active cities and eight active categories.
- UI: city is a select and categories use supported taxonomy controls. UUIDs are persisted while names remain buyer-facing.
- Verification: invalid IDs receive structured field/code responses; Lusaka/Dresses persisted in the golden path.

### 503 responses

- Observed: ordinary write/validation failures appeared as service outages.
- Root cause: the API failure helper classified unknown database errors as dependency outages.
- Files changed: `src/app/api/seller/studio/route.ts`.
- UI: retry language is reserved for genuine dependency/connectivity failures.
- Verification: conflicts/validation use 409/422, unknown server errors use 500, and only missing-schema/connection/timeout errors use 503.

### WhatsApp save failure

- Observed: a valid `+260…` number passed UI validation but failed the live Store update.
- Root cause: PostgreSQL standard strings preserved the doubled backslash in the E.164 expression, so the constraint looked for a backslash instead of a literal plus.
- Files changed: core/order-intent migrations and `20260808220000_fix_e164_validation.sql`.
- Database: Store/order-intent constraints and publication/order-intent function definitions were repaired.
- Verification: `+260971234567` saved and the Store publication RPC succeeded.

### Storage 400 and media rendering

- Observed: seller media uploads failed or an enquiry later crashed while rendering a snapshot path.
- Root cause: paths were not consistently organized beneath the authenticated seller root; Seller Enquiries passed a storage-relative path directly to `next/image`; and the Supabase hostname was absent from Next image configuration.
- Files changed: `src/lib/supabase/media.ts`, `src/data/seller-studio-repository.ts`, Store/Product editors, and `next.config.ts`.
- RLS/Storage: the first object-key segment must equal `auth.uid()`; public reads are limited to approved public buckets.
- UI: uploads expose progress/errors, previews receive public URLs, and no fictional runtime Product image is substituted.
- Verification: authenticated Store/Product uploads returned 200 and rendered; Seller B’s upload into Seller A’s root returned 400.

### Publication and propagation

- Observed risk: a local published badge could disagree with the database and buyer catalog.
- Root cause: optimistic status could be shown before validated RPC completion.
- Files changed: Store/Product controls, provider reconciliation, API route, and publication migrations.
- Database: publication uses validated security-definer RPCs; direct status-column mutation is not granted.
- UI: controls await persistence, revert on failure, and show success only after the authoritative response.
- Verification: Store and Product appeared immediately on Home, Discover, Stores, Store Detail, and Product Details. Seller B’s direct status mutation returned 403.

### Missing Home imagery

- Observed: an empty marketplace left half of the desktop hero blank.
- Root cause: the right visual depended on inventory even though empty-marketplace editorial presentation is a separate concern.
- Files changed: `src/app/page.tsx`, `src/data/editorial-data.ts`, responsive CSS.
- UI: Home always has a purposeful SOKOZA editorial visual; Product cards still require real published inventory.
- Verification: visually inspected at 1440×900 and 390×844 while empty and after publication.

### Wrong Sell imagery

- Observed: Sell used an industrial/tool image unrelated to fashion.
- Root cause: the asset used a generic maker metaphor rather than SOKOZA’s fashion-specific editorial rules.
- Files changed: `src/app/sell/page.tsx`, `src/data/editorial-data.ts`, Sell CSS.
- UI: current-fashion editorial imagery and laptop spacing keep both calls to action visible.
- Verification: visually inspected at desktop and mobile widths.

### Seller sign-up overlap

- Observed: the editorial heading collided with body/form content on laptop.
- Root cause: fixed display sizing and line metrics did not account for available column height.
- Files changed: `src/app/globals.css`, `src/components/seller-auth-form.tsx`.
- UI: bounded responsive type, normal document flow, show/hide password, and pending submit state.
- Verification: visually inspected at 1440×900 and 390×844 without overlap or clipped controls.

## Golden-path verification

1. Created and authenticated Seller A.
2. Saved every onboarding step using canonical Lusaka/Dresses values.
3. Uploaded owner-scoped Store and Product media.
4. Reloaded/resumed onboarding and completed it.
5. Published the Store and Product in Seller Studio.
6. Confirmed buyer propagation across Home, Discover, Stores, Store Detail, and Product Details.
7. Added the Product to Cart, opened its seller-specific Review order, and created one truthful order intent by copying the prepared message.
8. Confirmed the Product/enquiry appeared in Seller Studio with snapshot pricing and no claim of payment/message delivery.
9. Created Seller B: foreign Store update returned zero rows, foreign-root upload was denied, and direct Product status mutation returned 403.
10. Confirmed anonymous access returns the published Store/Product and zero private profile rows.

## Release checks

- TypeScript: passed.
- ESLint: passed.
- Vitest: 13 files and 51 tests passed.
- Responsive inspection: 390×844, 768×1024, 1024×768, and 1440×900, with special attention to laptop composition.
- Truthfulness: insufficient Product activity exposes no buyer-facing count; Seller analytics is aggregate-only.
- Production build: passed after test-data cleanup (48 static pages generated; dynamic routes compiled).

## Asset protection rule

Editorial assets belong to the SOKOZA interface and are not marketplace records. Marketplace cleanup may delete exact test sellers, Stores, Products, intents, and their owner-scoped uploads only. It must never delete `src/data/editorial-data.ts`, branded interface assets, or editorial media because the marketplace is empty.

## Final Store operations addendum — 9 August 2026

### Exact 500 causes

- **Save Store:** the previous `save_store` branch mixed content persistence with operating-state changes. Saving an already-published Store updated its fields and then called `publish_store()` again because the client supplied `operatingState: published`. The RPC intentionally updates only `draft` or `paused` rows, so it matched no row, raised `STORE_NOT_READY`, and the old generic failure path surfaced that expected state mismatch as an unexplained 500. Save is now a deterministic insert-or-owned-versioned-update and never changes operating state.
- **Publish Store:** the previous publication readiness predicate required both legacy `collection_details` and `delivery_details` to be non-empty. That contradicted the approved UX, where Collection only or Delivery only is valid. A complete single-mode Store therefore matched no row in `publish_store()`, raised `STORE_NOT_READY`, and was reported generically. Publication now validates enabled structured modes: at least one mode, and copy only for each enabled mode.
- Both cases were amplified by one overloaded request shape. The route now has explicit `save_store_draft`, `publish_store`, `pause_store`, and `archive_store` operations, each with ownership/version checks and a fresh persisted Store response. Validation is 422, auth/ownership is 401/403, version conflict is 409, genuine dependency failure is 503, and unexpected 500 responses include a safe request ID while development logs retain the original server error.

### Feedback and fulfilment contract

- “Saved” is authoritative: local edits show `Unsaved changes`, requests show `Saving…`, success shows `Saved`, and failures retain every field with `Save failed` plus retry guidance.
- The first persisted Store receives one creation milestone; the first successful publication receives one “You’re live” milestone. Routine saves, republishes, pauses, and archives use the shared accessible snackbar. Pause and archive require confirmation.
- Fulfilment is stored as structured Collection/Delivery flags, area, delivery scope, fee mode, optional nonnegative fixed fee, and buyer-facing copy. Two concise templates per mode resolve safe variables without `eval`; exact home addresses are never requested.
- WhatsApp tone/preview is a separate system. Core order-reference, item, option, quantity, and price fields remain SOKOZA-controlled. “Test WhatsApp” opens a harmless setup message and creates no order intent.
- Successful saves to a published Store revalidate Home, Discover, Stores, and the public Store route; sellers do not republish safe content edits.
- Operational events are written only after confirmed backend changes: `store_created`, `store_updated`, `store_published`, `store_paused`, and `store_archived`.

### Authenticated golden path

Using an isolated temporary seller against project `kzixedushlpthxehqoho`, the release pass created the first Store, observed the post-response creation milestone, persisted Lusaka/Kabulonga plus Collection and Delivery templates, configured a safe WhatsApp preview, uploaded owner-scoped logo/cover media, saved the draft, published it, observed the post-response first-publication milestone, opened the buyer Store, updated the live description, confirmed immediate buyer propagation, paused with confirmation, and republished with routine feedback. No Store operation returned 500. The temporary seller, Store, operational events, and media were removed after evidence collection.

### Updated release checks

- Vitest: 15 files and 66 tests passed, including creation/update/publish failure truthfulness, first-publication milestone, pause/archive confirmation, and fulfilment combinations/templates.
- TypeScript, ESLint, and production build: passed.
- Responsive Store editor: visually inspected at 390×844 and desktop; edit/preview switching and seller navigation remain usable.
- Live Supabase migration `20260809090000`: applied and verified.

### Existing seller provisioning incident — 9 August 2026

Two seller Auth accounts had been created before the core `on_auth_user_created` trigger was deployed. They therefore existed in `auth.users` but had no matching `public.profiles` or `public.seller_profiles` rows. Because `stores.owner_id` references `seller_profiles.user_id`, the first Store INSERT failed with PostgreSQL foreign-key error `23503`; the previous development logger emitted an object that Next's log formatter reduced to `{}`, leaving only a generic 500 in the browser.

Both existing seller accounts were backfilled, after which the same Lima’s Closet form saved and published successfully. Migration `20260809093000_backfill_seller_profiles.sql` preserves the repair for other environments, while `/api/seller/studio` now defensively provisions a missing seller domain profile before a first Store save. Development errors are logged as a request-ID-bearing string so the original database code/message remains visible. The final live checks confirmed `Store updated.`, published status/version persistence, the buyer Store route, real logo/cover rendering, and Collection-only presentation without an empty Delivery section.
