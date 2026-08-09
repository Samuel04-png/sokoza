# SOKOZA Seller Studio Redesign Audit

**Status:** Complete baseline audit for the Seller Studio rebuild  
**Audited:** 8 August 2026  
**Scope:** Seller acquisition, access, onboarding, workspace routes, buyer feedback loops, data boundaries, responsive behavior, and production-readiness gaps.

## 1. Executive finding

The existing seller area is a useful technical shell, but it is not a credible product for a fashion store operator. It presents a dark generic administration sidebar, several non-functional route boundaries, implementation terminology, isolated browser drafts, and a report-like Home. The buyer experience is visually expressive; the seller experience feels like internal tooling. That discontinuity is the core redesign problem.

The rebuild must preserve the sound parts—typed entities, protected workspace routing, explicit store status, truthful event definitions, WhatsApp-first commerce, and public-store preview—while replacing the surface, information architecture, route coverage, and local prototype state model.

## 2. Route inventory and disposition

| Route | Current state | Problem | Redesign disposition |
|---|---|---|---|
| `/sell` | Static informational page | Says onboarding is closed; no application path or visual proof | Editorial seller landing with benefit story, workflow, trust requirements, FAQ, sign-up and sign-in paths |
| `/sell/sign-up` | Missing | Acquisition stops before account creation | Add polished account-creation route and understandable validation states |
| `/sell/sign-in` | Missing | Public acquisition and private access do not feel continuous | Canonical public sign-in route; preserve `/seller/sign-in` as compatibility entry |
| `/seller/sign-in` | Form plus preview bypass | Exposes stage and implementation language | Product-quality sign-in with a safe local Studio entry until Supabase is authorized |
| `/seller/recover` | Simulated response | Exposes backend staging details | Calm recovery request/confirmation states without raw provider language |
| `/seller/invite` | Simulated invitation | Exposes mock/stage language | Branded invitation acceptance with expired-link recovery affordance |
| `/seller/onboarding` | Four-step browser draft | Arbitrary percentage, isolated store draft, no first product | Resumable six-step flow: account, store, WhatsApp, selling basics, first product, preview |
| `/seller` | Task list and small metrics | Generic report; no visual inventory or enquiry context | Operational command center with visual attention queue, create menu, readiness checklist, current signals |
| `/seller/products` | Placeholder | No catalog workflow | Searchable/filterable/sortable catalog with row actions and selection-based bulk actions |
| `/seller/products/new` | Missing | No creation workflow | Multi-step product editor with media, details, price, options, stock, fulfilment, review and publish |
| `/seller/products/[id]` | Missing | No product workspace | Product summary, public-state explanation, inventory and engagement context |
| `/seller/products/[id]/edit` | Missing | No editing workflow | Same structured editor, prefilled, with save/publish/archive safeguards |
| `/seller/inventory` | Missing | Availability is buried | Dedicated freshness workspace with one-tap state changes and reviewed bulk confirmation |
| `/seller/enquiries` | Placeholder | No seller follow-up workflow | Search/filter list with buyer-marked status and immutable item snapshots |
| `/seller/enquiries/[reference]` | Missing | No evidence-preserving detail | Detailed snapshot, WhatsApp handoff, internal status, timeline and buyer-signal caveats |
| `/seller/store` | Functional local editor | Developer copy; saving does not update buyer Store | Autosaving store editor with device preview, readiness checklist, publish/pause and public feedback loop |
| `/seller/drops` | Placeholder | No collection workflow | Visual Drop grid with live/draft/past states and contextual actions |
| `/seller/drops/new` | Missing | No Drop creation | Drop editor for title, cover, product selection, schedule and review |
| `/seller/drops/[id]` | Missing | No Drop management | Editable detail workspace with public link and lifecycle controls |
| `/seller/promotions` | Missing | Price reductions cannot be managed coherently | Truthful product-level promotional pricing; coupons explicitly deferred |
| `/seller/insights` | Missing | Home metrics are too thin and look synthetic | Defined marketplace signals, time window, trend context, top pieces and next actions—never revenue claims |
| `/seller/notifications` | Missing | No attention inbox | Working notification center with read state and routed actions |
| `/seller/verification` | Mostly complete | Sterile; little explanation of value and privacy | Trust profile showing private/public boundaries, state, benefit and next step |
| `/seller/settings` | Partial | Preferences are not persisted; stage language | Persisted preferences, profile menu, access, public store link and reversible store controls |
| `/seller/help` | Missing | Sellers have no product-specific support | Searchable help topics and contact path; unavailable live support is stated honestly |

## 3. Component audit

### Preserve and evolve

- `AppShell`: its buyer/seller separation is sound. Seller offline copy should become action-oriented and avoid internal implementation detail.
- `SellerShell`: keep route-awareness and public-store feedback link; replace the full-height black rail with a compact workspace header, desktop rail, contextual tabs and mobile navigation.
- `SellerStoreEditor`: preserve edit-left/preview-right on wide screens, WhatsApp normalization, fulfilment and reversible pause semantics. Replace isolated storage, developer labels and percentage completion.
- `SellerOnboarding`: preserve resumability and progressive disclosure. Expand it and connect it to the shared Studio state.
- typed catalog/store models and repository boundaries: retain domain shapes and ensure the UI never imports database rows.

### Replace

- `SellerStageBoundary`: remove completely. A primary route may not exist as a placeholder.
- `seller-demo-label`, stage/provenance UI and mock-version badges: remove from all seller-visible surfaces.
- current large dark `.seller-rail`: replace with a compact, light, brand-continuous shell.
- isolated component-specific localStorage keys: replace with one versioned Studio state and deliberate draft records.

## 4. Navigation inconsistencies

The existing desktop rail has five primary destinations while mobile exposes the same five without access to Inventory, Insights, Verification, Notifications, Settings or Help. This is not a scalable hierarchy. The new model is:

- global workspace: Home, Products, Enquiries, Store, Insights;
- contextual catalog tabs: Products, Inventory, Drops, Promotions;
- utility destinations: Notifications, Verification, Settings, Help;
- mobile bottom navigation: Home, Products, Enquiries, Store, More;
- one Create menu: Product or Drop. A single trigger prevents competing primary actions.

## 5. Data and integrity audit

### Current strengths

- buyer product, store, Drop, cart and enquiry records are typed;
- product prices and cart prices already use snapshots;
- seller activity definitions explicitly avoid claiming sales or payment proof;
- proxy-level session gating prevents casual rendering of private workspace routes;
- store pause is modeled as reversible rather than destructive.

### Current gaps

- seller products, inventory, Drops and enquiries do not have working repositories;
- store and onboarding drafts do not share state;
- local seller mutations cannot update the buyer Store or product cards;
- enquiry records do not include all immutable store/product presentation fields needed by a seller detail screen;
- there is no optimistic concurrency token beyond a store version number;
- there are no audit events for publish, price, availability, archive or store-state changes;
- there is no owner-scoped Supabase schema or RLS implementation in the working app;
- the preview cookie is an optimistic local-access mechanism, not identity or authorization.

The UI rebuild therefore uses one versioned local Studio adapter with explicit event history and immutable enquiry snapshots. This is a production-shaped prototype boundary, not a substitute for the approved Supabase migration, RLS, Storage and server authorization work.

## 6. Buyer feedback-loop audit

The public Store and seller editor currently show the same seeded NOIR identity but do not share mutations. The redesign requires:

- published edits to identity and fulfilment to appear in public Store presentation on the same device;
- seller product price, status and archive changes to alter public cards/details where the local adapter can safely apply them;
- a persistent “View Store” route from the workspace and after publish actions;
- published seller-created products to join the local public NOIR collection without inventing remote persistence;
- drafts and archived pieces never appearing publicly.

Server-rendered discovery data remains the fallback seed. Supabase later becomes the authoritative shared repository for every client and device.

## 7. Responsive and accessibility findings

- Existing seller mobile navigation reaches five destinations but has no scalable “More” layer.
- Desktop’s 250px dark rail consumes too much width at 1024px and visually disconnects from SOKOZA.
- Several forms have small helper text, sparse focus hierarchy and no unsaved-leave warning.
- Placeholder routes have little useful keyboard or screen-reader behavior because they contain no workflows.
- The Store editor’s sticky preview is directionally correct, but the status bar and fixed rail create excessive competing sticky regions.

The rebuild must support 390, 430, 768, 1024, 1280, 1440, 1536 and 1920 widths, 44px minimum interactive targets, visible focus, logical headings, labelled dialogs, reduced-motion preferences, and no horizontal page overflow.

## 8. Release gate

The seller UI is ready for review only when:

1. no seller-visible staging, mock, version or implementation language remains;
2. every route above renders a complete state and every visible action works or is clearly labeled for a future release;
3. create/edit, bulk inventory, enquiry follow-up, store publishing, Drop management, notifications and settings persist within the local adapter;
4. destructive actions require confirmation and can be recovered where the product promises recovery;
5. buyer-facing NOIR views reflect published local changes coherently;
6. automated tests, type checking, lint and production build pass;
7. critical routes pass visual and interaction QA at mobile and desktop sizes.
