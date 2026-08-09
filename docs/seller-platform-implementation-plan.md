# SOKOZA Seller Platform Implementation Plan

> Production update — Backend production integration was authorized by the product owner on 8 August 2026. The mock-first stages below are retained as implementation history; runtime repositories, seller authentication, media, and order intents now target Supabase.

**Status:** Superseded for seller UI by `seller-redesign-audit.md`, `seller-redesign-research.md`, and `seller-design-constitution.md`; retained for backend sequencing and domain history  
**Date:** 8 August 2026  
**Applies to:** Seller UI, operator minimum, Supabase integration, and buyer-data replacement  
**Precedence:** Current product-owner direction → source-of-truth documents → backend master implementation prompt → this plan

> On 8 August 2026 the product owner rejected the Stage 1 visual/workflow checkpoint and authorized a complete Seller Studio redesign. Any Stage sequencing or UI treatment below that conflicts with the three seller-redesign documents is historical, not current instruction.

## 1. Intended outcome

Build a mobile-first seller workspace that lets an authenticated fashion seller create and manage one public store, maintain structured current inventory, package products into Drops, understand qualified demand, and manage SOKOZA order enquiries without suggesting that SOKOZA processed a sale.

The implementation must preserve the completed buyer experience and its repository boundaries. Seller work begins against mocks, passes a complete UI/state review, then connects to Supabase through reviewed migrations and RLS.

## 2. Non-goals

The MVP will not include:

- buyer authentication requirements;
- SOKOZA checkout, payments, escrow, delivery booking, or refunds;
- stock reservation when an order intent is created;
- revenue, GMV, AOV, purchase conversion, or verified sales reporting;
- public ratings or reviews;
- comments, public likes, follower counts, or popularity theater;
- named customer CRM or WhatsApp contact import;
- discount codes or automatic order discounts;
- team roles, multi-location inventory, or CSV imports;
- full WhatsApp Business API messaging;
- microservices, Redis, Kafka, or a separate application backend.

## 3. Product principles for implementation

1. **Action before metric.** Seller Home answers “what should I do now?”
2. **Draft before public.** Work can be saved safely before it satisfies publish rules.
3. **Structure without rigidity.** Category-aware fields and flexible options improve buyer search without forcing every seller into exact stock counts.
4. **No silent overwrite.** Bulk and concurrent edits expose conflicts.
5. **History survives change.** Archive products; snapshot order intents; record inventory and sensitive status changes.
6. **One truth per concept.** Publication, availability, moderation, and freshness are separate.
7. **Evidence-labeled analytics.** Every number has a definition, timeframe, and known limitation.
8. **Phone-first, desktop-efficient.** Core tasks work on mobile; dense bulk work progressively improves on wide screens.
9. **Seller scope everywhere.** Server authorization and RLS both prove store ownership.
10. **Buyer UI remains stable.** Supabase repositories satisfy existing contracts instead of leaking database shape into components.

## 4. Seller information architecture

### 4.1 Persistent navigation

The seller workspace is visually and structurally distinct from the buyer application.

Compact layouts use five stable destinations:

1. Home
2. Products
3. Drops
4. Enquiries
5. Store

Wide layouts use the same destinations in a side rail. Verification and Settings sit below the primary work destinations. A clearly labeled `View store` exits to the public storefront; `Back to shopping` exits to the buyer experience.

Inventory is a Products subview rather than a competing top-level model. Activity/analytics begins on Home and receives a dedicated route only in V1.1.

### 4.2 Planned routes

#### MVP seller routes

- `/seller/sign-in`
- `/seller/recover`
- `/seller/onboarding`
- `/seller` — action-focused Home
- `/seller/products`
- `/seller/products/new`
- `/seller/products/[id]/edit`
- `/seller/products/bulk` — review/result route for bounded bulk actions
- `/seller/drops`
- `/seller/drops/new`
- `/seller/drops/[id]/edit`
- `/seller/enquiries`
- `/seller/enquiries/[reference]`
- `/seller/store`
- `/seller/store/policies`
- `/seller/verification`
- `/seller/settings`

#### V1.1 routes

- `/seller/products/bulk/edit`
- `/seller/analytics`
- `/seller/opportunities`
- `/seller/stories`
- `/seller/stories/new`
- `/seller/stories/[id]/edit`
- `/seller/promotions`

Operator surfaces may live under `/operator/**` and require a server-controlled role. They are not placed in seller navigation.

## 5. Core screen specifications

### 5.1 Authentication and recovery

Purpose: establish a verified seller session without changing guest buyer behavior.

Required behavior:

- sign in, sign up/invite acceptance as approved, sign out, recovery, expired-link recovery, and session-expired return;
- server-verified identity for every `/seller/**` request;
- preserve the safe intended seller destination after authentication;
- never redirect to an arbitrary external URL;
- clear rate-limit and delivery-delay states;
- no secret or token in rendered output, logs, or URLs beyond provider-required short-lived values.

Acceptance:

- unauthenticated users cannot render private seller data;
- an expired browser session is rejected server-side;
- client navigation does not weaken protection;
- Seller A cannot access Seller B via a guessed URL.

### 5.2 Onboarding

Purpose: reach a credible store baseline without making the first session feel like a compliance form.

Steps:

1. Seller identity and contact.
2. Store name, slug, proposition, city, and service area.
3. Logo/cover with upload recovery.
4. Collection/delivery and exchange/return terms.
5. WhatsApp E.164 number and verification state.
6. Public preview and submit/publish eligibility.

The seller can leave and resume. The checklist differentiates required-to-save, required-to-publish, and recommended fields.

### 5.3 Seller Home

Purpose: select the next highest-value action.

Order:

1. Blocking setup, verification, moderation, or contact issues.
2. Inventory tasks: stale, sold, low, missing variants, failed image, unpublished changes.
3. New buyer-marked-sent enquiries and intents that need catalog follow-up.
4. `Add product` and `Create Drop` actions.
5. Factual activity for a labeled timeframe.
6. Growth recommendations with a visible reason.

Empty/new state: explain the path to the first public product.  
Healthy state: show a short “all caught up” summary plus the next commercial action.  
Restricted state: explain exactly what can still be edited and how review works.

### 5.4 Store management

Purpose: maintain public identity, fulfilment truth, and store operating state.

Sections:

- Basics: name, slug, tagline, description, category/style tags.
- Media: logo and cover.
- Location: city, public area, collection areas.
- Fulfilment: collection/delivery modes, fees/ranges only when seller-supplied, lead-time text.
- Policies: exchanges, returns, cancellation position, privacy disclosure.
- Contact: normalized WhatsApp number and verification result.
- Status: published, paused, resume, archive request.
- Preview: compact and wide public store preview.

`Pause store` is reversible and requires a short buyer-facing notice or default. It blocks new order-intent creation. Platform restriction/suspension cannot be overridden by the seller.

### 5.5 Product list and Inventory subview

Purpose: scan catalog health and act on many products.

Built-in views:

- Needs attention
- Drafts
- Live
- Stale
- Low stock
- Sold out
- Hidden
- Archived

List rows/cards show image, title, variants, effective price, publication state, availability/freshness, Drop membership, and last update. Filters persist during detail round trips. Mobile uses concise cards with selection mode; desktop uses a compact table.

Bulk actions in MVP:

- Confirm available now
- Mark low stock
- Mark sold out
- Publish
- Hide
- Archive
- Add to Drop
- Remove from Drop

Each action shows selected count, affected variants where relevant, consequences, and a result summary. Partial failure does not conceal successful and failed rows.

### 5.6 Product editor

Purpose: create a searchable, trustworthy listing with minimal repeated work.

Sections:

1. Photos
2. Essentials
3. Details and condition
4. Options and variants
5. Availability
6. Fulfilment override
7. Merchandising
8. Review and publish

Behavior:

- first save creates a draft;
- autosave is explicit about saving/saved/offline/conflict state;
- images upload individually with progress, retry, reorder, removal, role, and alt text;
- category changes warn before removing incompatible structured data;
- options can be reordered; variant combinations are generated and deduplicated;
- effective price is visible per variant;
- inventory mode controls the relevant fields;
- preview shows the real buyer card and product-detail summary;
- publish validates all source-of-truth requirements transactionally;
- duplicate creates a fresh draft and copies no metrics, history, or publication dates.

Publish requirements:

- at least two actual-item images;
- non-empty title and active category;
- exact non-negative current price;
- condition and primary colour;
- valid size/variant or explicit one-size/not-applicable state;
- available inventory state or made-to-order lead time;
- seller/store and fulfilment context;
- visible flaw information when applicable;
- approved moderation state where the policy requires pre-review.

### 5.7 Inventory editor and history

Purpose: make availability easy without treating every seller as a warehouse.

Modes:

- `tracked`: quantity per variant, optional low-stock threshold;
- `status_only`: Available, Low stock, Sold out;
- `made_to_order`: orderable status plus lead-time range.

Adjustments require a reason: received/restocked, correction, damaged, lost, sold outside SOKOZA, returned, or other with note. The history shows actor, time, delta/status, prior value, resulting value, and source.

Order intents never decrement or reserve stock. A seller marking an enquiry sold may optionally trigger a reviewed inventory adjustment; it is not automatic when WhatsApp opens.

### 5.8 Drops

Purpose: create a shareable seller collection without social-network overhead.

MVP editor:

- cover, name, optional note;
- select only products from the seller's store;
- reorder products;
- draft, live, ended, archived lifecycle;
- preview and stable public link;
- ending a Drop does not alter product publication.

MVP excludes scheduled countdown and reminders. V1.1 adds real start/end times, timezone display, reminders, and story reuse.

### 5.9 Enquiries

Purpose: expose SOKOZA-controlled intent evidence and help sellers keep inventory truthful.

The list shows reference, created time, item count, item value, and current evidence state. Detail shows immutable item snapshots beside current catalog state.

Allowed seller actions:

- Mark item(s) sold
- Mark unavailable
- Mark cancelled/no longer active
- Open WhatsApp using the seller's own app where feasible

MVP does not claim that merely opening this record proves the WhatsApp message arrived. Wording never implies payment. Seller changes are timestamped and recorded in status history. Historical snapshots remain readable if a product or variant is archived. Explicit `seller_acknowledged` arrives in V1.1 with the response-health model.

### 5.10 Verification

Purpose: reduce specific uncertainty without granting a generic trust promise.

States:

- not started;
- phone pending / phone verified;
- identity pending / identity verified / rejected;
- business pending / business verified / rejected;
- expired or requires update.

Public labels state exactly what was verified. Verification documents use private storage and are never returned by public queries. Rejection includes a reason category and resubmission path without exposing internal fraud rules.

### 5.11 Settings and account state

Includes sign-out, session/security, communication preferences, data export request, account deletion request, and support. Destructive actions explain what is archived, anonymized, retained for marketplace history, and recoverable.

## 6. V1.1 screen specifications

### 6.1 Conflict-aware bulk editor

Desktop uses a spreadsheet-like table; mobile uses a row-by-row review rather than squeezing the grid.

Editable attributes:

- current and compare-at price;
- category;
- availability status or quantity;
- low-stock threshold;
- selected merchandising fields;
- freshness confirmation.

Every row sends an expected `version`. Server responses classify success, validation error, permission error, or conflict. Conflict UI shows current server value, seller proposal, and last-update metadata. The seller may apply current, apply proposal after review, or skip. There is no blind “overwrite all.”

### 6.2 Promotions

Scheduled promotions apply only to product or collection display pricing that SOKOZA can resolve. The editor captures objective, products, current promotional price, optional compare-at evidence, start, end, and share link. Server price resolution and order-intent snapshots are authoritative.

No redemption code, basket rule, free-delivery promise, or order-level condition is introduced.

### 6.3 Stories

The managed Story editor supports finite media items, caption, product link, alt text, order, start, and expiry. It previews reduced-motion and image-failure behavior. Publication requires at least one currently visible product or live Drop. Public playback pauses when hidden or unfocused.

### 6.4 Analytics and Opportunities

Analytics presents:

- activity trend by evidence stage;
- product and store discovery;
- enquiry funnel through seller acknowledgement;
- top products by separately labeled views, saves, reviews, and intents;
- source categories and normalized search terms;
- freshness and unavailable-at-review quality;
- Drop and Story performance when enabled.

Opportunities presents explainable actions:

- demand gaps;
- missing size/price coverage;
- listings receiving views but blocked by stale/unavailable status;
- strong saves without review starts;
- products with incomplete buyer-decision information.

Every recommendation states the input window, minimum sample, and why it appears. Small cohorts are suppressed.

## 7. Lifecycle models

### 7.1 Seller profile

`draft → pending_review → active → restricted → suspended`

- `restricted` retains safe access to correction tasks.
- `suspended` blocks seller mutations except appeal/support paths.
- reactivation is an audited operator transition.

### 7.2 Store operating state

`draft → published ↔ paused → archived`

Platform enforcement is not encoded as seller pause. A seller may pause/resume; only an operator can restrict/suspend.

Public behavior:

- draft: owner preview only;
- published: browsable and orderable subject to product state;
- paused: storefront/catalog may remain viewable, new contacts/intents blocked with notice;
- archived: removed from discovery; historical snapshots remain.

### 7.3 Product

Separate fields prevent ambiguous status:

- publication: `draft | published | hidden | archived`;
- moderation: `pending | approved | rejected | removed`;
- inventory mode: `tracked | status_only | made_to_order`;
- derived availability: `available | low_stock | sold_out | unavailable`;
- freshness: derived from last confirmation and configurable thresholds.

Public visibility requires published store + published product + permitted moderation state. Orderability additionally requires active seller/store, valid WhatsApp, an orderable variant/status, and acceptable current data.

### 7.4 Drop

MVP: `draft | live | ended | archived`  
V1.1: add `scheduled`, with `starts_at < ends_at` where an end exists.

### 7.5 Order intent

MVP: `ready → whatsapp_opened → buyer_marked_sent`

V1.1 may extend the evidence chain to `seller_acknowledged`.

Terminal/recovery states:

- unavailable;
- seller_marked_sold;
- cancelled;
- expired where a future policy defines it.

Opening WhatsApp never advances beyond `whatsapp_opened`. Status transitions are append-only in history even when a current-state column is cached.

### 7.6 Story

V1.1: `draft | scheduled | active | expired | archived | removed`. Public activity is derived from approval plus time window, not a client clock alone.

## 8. Data architecture

### 8.1 Existing backend-master core

Retain the planned core:

- `profiles`
- `cities`
- `seller_profiles`
- `stores`
- `categories`
- `products`
- `product_images`
- `product_options`
- `product_option_values`
- `product_variants`
- `product_variant_values`
- `drops`
- `drop_products`
- `order_intents`
- `order_intent_items`

### 8.2 MVP additions/refinements

#### `store_policies`

One-to-one with store. Structured fulfilment flags plus clear seller text and `updated_at`. Order intents snapshot relevant policy text only if later required; current MVP public store reads the live policy.

#### `inventory_adjustments`

Append-only:

- `id bigint generated identity`
- `store_id`, `product_id`, `variant_id`
- `delta`, `balance_after`
- `reason`, `note`
- `actor_user_id`
- `source` (`single_edit`, `bulk_edit`, `enquiry_outcome`, `import_later`)
- `idempotency_key`
- `created_at`

Exact stock mutations occur through a transaction that locks/validates the variant, changes the cached balance, and inserts the ledger row.

#### `availability_confirmations`

Append-only confirmation history for status-only, made-to-order, and catalog freshness. Records product/variant scope, resulting status, actor, source, and timestamp.

#### `order_intent_status_history`

Append-only event history with order intent, prior state, new state, actor type/id where available, reason, and timestamp.

#### `verification_requests`

Private workflow record separate from the public `verification_status`. Document paths reference the private bucket; public repositories never select them.

#### `reports`

Private buyer/seller report submissions with target, reason, details, state, and resolution timestamps.

#### `audit_events`

Append-only sensitive administrative history for store status, seller status, verification, moderation, role changes later, and destructive requests. This is not the high-volume analytics table.

#### `marketplace_events`

Append-only, server-ingested allowed event taxonomy. It stores pseudonymous guest session hashes where needed, minimal metadata, and no arbitrary client event name.

### 8.3 V1.1 tables

- `promotions` and `promotion_products`
- `stories` and `story_items`
- daily seller metric summaries or materialized aggregates
- saved product views if observed use justifies them
- buyer-account saved/follow tables only after separate approval

### 8.4 Later tables

- `store_memberships`, roles, and invitations;
- locations and per-location inventory;
- named customer/consent records;
- review/transaction-confirmation structures;
- checkout/payment/fulfilment structures only after a separate architecture decision.

## 9. Database invariants

Database rules complement TypeScript and Zod validation:

- UUID primary keys and `timestamptz` timestamps.
- Exact money as `numeric(12,2)` and canonical currency `ZMW`.
- `base_price >= 0`; `compare_at_price` is null or greater than current effective price.
- `stock_quantity` and `balance_after >= 0` when present.
- `quantity > 0`; line totals equal authoritative snapshot calculation in the transactional function.
- one primary store per owner in MVP.
- lowercase unique store/product/drop slugs.
- variant key unique within a product.
- option values unique within their option; variant-option combinations cannot duplicate.
- Drop products belong to the same store as the Drop.
- Story product tags belong to the Story's store and point to a publicly eligible product.
- promotion window start precedes end.
- story start precedes expiry.
- published products satisfy cross-row requirements through the publish transaction; raw row updates cannot bypass it.
- order-intent items retain snapshots and use `ON DELETE SET NULL` for product/variant references.
- stores and products archive by default; hard delete is restricted.
- every idempotent public/server mutation has a unique idempotency key.
- editable seller entities carry a monotonically increasing `version` for optimistic concurrency.

Cross-row invariants use transaction functions, foreign keys, composite keys, or triggers where appropriate—not unsupported cross-table `CHECK` constraints.

## 10. Authorization and RLS plan

RLS is enabled on every exposed table.

### Public/anonymous

May read only:

- active cities/categories;
- public-safe fields for published or intentionally paused stores;
- published, approved products belonging to public stores;
- associated public images/options/variants;
- live public Drops and, in V1.1, active approved Stories.

May not read drafts, private seller settings, verification requests/documents, reports, audit history, raw analytics, or any order-intent table.

### Authenticated seller

May manage only a store they own and rows whose ownership resolves through that store. RLS verifies ownership independently of any supplied `store_id`. Seller enquiry reads are scoped to their store. Sellers cannot update public verification or moderation status directly.

### Public server endpoints

Order intents, reports, guest enquiry access, and analytics ingestion use validated server endpoints. Anonymous browser clients do not receive broad insert policies on private tables.

### Operator

Operator authorization uses a dedicated roles table or server-controlled app metadata, never user-editable metadata. Privileged clients live in `server-only` modules. Operator actions create audit events.

### Storage

- `store-media` and `product-media`: public read, authenticated owner-prefix writes.
- `verification-docs`: private; owner access only where policy permits and operator/service access server-side.
- deterministic UUID paths begin with authenticated seller ID and store ID.
- MIME, size, count, and ownership validation applies before publish.

The implementation must produce `docs/rls-matrix.md` and test policies with anon, Seller A, and Seller B sessions—not only an admin connection.

## 11. Mutation boundaries and concurrency

### Server actions / route handlers

Use for:

- authentication-adjacent onboarding transitions;
- store publish/pause/resume requests;
- product publish and archive transitions;
- bounded and spreadsheet bulk edits;
- order-intent creation/status changes;
- report submission;
- analytics ingestion;
- verification submission metadata.

### Database transactions/functions

Use for:

- product publication across product, images, options, variants, and status;
- exact inventory adjustment plus ledger entry;
- bulk changes where all-or-per-row semantics are explicitly selected;
- order intent plus immutable item snapshots;
- seller outcome changes plus status history;
- scheduled promotion price resolution where necessary.

### Optimistic concurrency

- Reads return `version` and `updated_at`.
- Mutations include expected version.
- `UPDATE ... WHERE id = ? AND version = ?` increments version.
- zero updated rows becomes a structured conflict, not a generic server error.
- bulk results identify conflicts per entity.

### Idempotency

- Order intents use a client-generated UUID reused on retry.
- Product publish, inventory adjustment, bulk apply, and analytics batches use scoped idempotency where duplicate network delivery would be harmful.
- A repeated key returns the original result where safe.

## 12. Repository plan

The UI does not import Supabase queries directly.

Interfaces to add or stabilize:

- `SellerSessionRepository`
- `SellerStoreRepository`
- `SellerProductRepository`
- `SellerInventoryRepository`
- `SellerDropRepository`
- `SellerEnquiryRepository`
- `SellerVerificationRepository`
- `SellerActivityRepository`
- `SellerOpportunityRepository` (rules in MVP, demand data in V1.1)
- `OperatorReviewRepository`

Each method returns typed success/error/conflict shapes. Mock and Supabase implementations satisfy the same contracts. Public buyer repositories are migrated domain by domain after seller-backed data exists; approved buyer components are not rewritten around table rows.

## 13. Analytics specification

### 13.1 Event collection rules

- Server endpoint accepts only an allowlist.
- Validate associated public entities and store ownership relationships.
- Attach server time; do not trust a client timestamp as canonical.
- Use an ephemeral/pseudonymous session key for deduplication where needed.
- Do not store raw IP by default.
- Strip arbitrary metadata and reject oversized payloads.
- Rate-limit abuse and bot-like floods.
- Record order-intent lifecycle from authoritative backend changes, not client analytics calls.

### 13.2 Event names

MVP:

- `store_viewed`
- `product_impression`
- `product_viewed`
- `saved_product`
- `discover_suggestion_opened`
- `discover_search_all_opened`
- `discover_result_opened`
- `drop_viewed`
- `order_review_started`
- `order_intent_created`
- `whatsapp_opened`
- `buyer_marked_enquiry_sent`
- `seller_marked_sold`
- `seller_marked_unavailable`
- `pwa_install_prompt_shown`
- `pwa_install_prompt_dismissed`
- `pwa_install_prompt_accepted`

Discover suggestion events send only entity type/id, result position, query length, and match class (`exact`, `prefix`, or `contextual`); raw query text is excluded from this client event stream. PWA events describe the web-app prompt lifecycle and must never be named `app_download` because no binary application is downloaded.

V1.1:

- `seller_acknowledged`
- `story_viewed`
- `story_product_opened`
- `promotion_opened`
- reminder/follow events only after consented features exist.

### 13.3 Metric glossary

Every displayed metric includes:

- exact event(s);
- unique-versus-total definition;
- date range and timezone;
- bot/filtering note;
- comparison period where shown;
- minimum sample or privacy suppression;
- link to the underlying product/enquiry action.

The MVP evidence funnel ends at the `buyer_marked_enquiry_sent` event. The operational intent state remains `buyer_marked_sent`. In V1.1 the funnel may extend to `seller_acknowledged`. `seller_marked_sold` is a separately labeled seller-declared catalog outcome, not verified platform revenue.

## 14. Customer-insight privacy rules

- No named guest list.
- No cross-store customer identity.
- No exact individual browsing timeline for sellers.
- No WhatsApp number or contact export from buyer handoff.
- No raw query display below a privacy threshold or when it may contain personal data.
- Aggregate dimensions use bounded vocabularies where possible: category, size, colour, price band, service area.
- Minimum cohort size is configurable; start conservatively and review with legal/privacy owners.
- Retention differs by purpose: operational order-intent history, aggregate analytics, verification documents, and audit evidence do not share one default.
- Optional buyer identity, marketing consent, export, correction, and deletion require a separate V1.1/later design.

## 15. Performance and scale plan

### MVP

- Server-render public catalog pages through selective repository queries.
- Fetch cover image and card fields only for lists; fetch full relations on detail/editor routes.
- Cursor pagination for catalogs and events; no unbounded lists.
- Index foreign keys, slugs, publication/availability state, freshness time, owner IDs, event store/time, and all RLS ownership paths.
- Cache public reads by store/product/drop tags and invalidate after successful publish/status mutations.
- Keep seller/private reads uncached where freshness matters.
- Use responsive Storage transformations and authenticated direct uploads; resumable upload for larger/unstable transfers where needed.
- Measure London-region latency from Zambia and use CDN/server caching for public media/catalog before proposing a new region or replica.

### Growth thresholds

- Daily aggregate tables/materialized summaries when raw event scans exceed target response time.
- Partition `marketplace_events` by time only after measured volume warrants it.
- Queue/outbox only when reliable asynchronous notifications, scheduled exports, or external delivery are introduced.
- Read replica/search service only after Postgres indexes and search vectors no longer meet documented targets.
- Preserve the ability to move analytics without coupling the core order-intent transaction to it.

## 16. Error and recovery model

All repositories/mutations map to stable categories:

- validation;
- unauthenticated;
- unauthorized;
- not found;
- conflict;
- rate limited;
- media upload;
- network/offline;
- dependency unavailable;
- unexpected with request ID.

Seller UX behavior:

- drafts remain locally/form-state recoverable after network loss;
- uploads retry individually and never force the entire form to restart;
- publishing failures identify the exact section and preserve data;
- bulk partial results remain visible and exportable/copyable;
- conflicts explain what changed and never discard the seller proposal;
- expired auth returns to the same safe task after re-authentication;
- destructive transitions require consequences and typed/explicit confirmation proportional to risk.

## 17. Accessibility and responsive release criteria

- WCAG 2.2 AA, visible focus, semantic tables/forms, error summaries, and screen-reader status announcements.
- Mobile core workflows do not require hover, drag, spreadsheet interaction, or fine pointer control.
- Desktop bulk tables support keyboard movement without trapping focus.
- Image reorder has non-drag controls.
- Status is never communicated by colour alone.
- Autosave and upload progress are announced without noisy repeated updates.
- Story playback provides pause, previous, next, close, text alternative, focus handling, and reduced motion.
- At 200% zoom, no essential form action or row result is lost.
- Low-data mode affects seller previews and upload guidance without obscuring actual errors.

## 18. Operator minimum

The seller MVP is unsafe without a small operator surface or equivalent controlled workflow.

Required capabilities:

- review seller and verification state;
- view private evidence through controlled access;
- approve/reject/request changes;
- review products requiring moderation;
- restrict/suspend/reactivate sellers and remove listings;
- triage reports;
- curate Home/Discover/featured Drops through explicit rules;
- inspect audit history;
- add internal reason and public-safe reason separately.

Operator access is audited and unavailable to ordinary sellers. A manual operational workflow is acceptable at pilot scale; undocumented dashboard edits are not.

## 19. Implementation sequence

No stage begins until the preceding gate passes.

### Stage 0 — Plan approval

Deliverables:

- approve/amend this plan and seller research;
- decide open product/operations questions;
- confirm that seller UI implementation may begin.

Gate: no unresolved decision that would change the seller IA, listing schema, or launch operating model.

### Stage 1 — Seller UI foundation against mocks

Deliverables:

- seller shell and five-destination navigation;
- auth/recovery states without live auth;
- onboarding, Home, Store, Verification, Settings;
- typed seller repository contracts and representative fictional states.

Gate: compact/wide navigation, accessibility, route protection presentation, and all setup states reviewed.

**Checkpoint — 8 August 2026:** Implemented and passed the documented automated build gate plus compact, 200%-reflow-equivalent, laptop, and wide browser review. See `docs/seller-stage-1-checkpoint.md`. Work pauses here before Stage 2 as required by the staged delivery model.

### Stage 2 — Catalog UI against mocks

Deliverables:

- product list/views/selection;
- product editor, preview, images, options, variants;
- inventory modes, adjustment history, freshness;
- MVP bounded bulk actions and conflict/result states.

Gate: a seller can model one-off, quantity-tracked, status-only, and made-to-order products; every destructive/error/offline/conflict state is recoverable.

### Stage 3 — Drops, Enquiries, growth, and operator UI against mocks

Deliverables:

- Drop list/editor;
- Enquiry list/detail/status history;
- factual Seller Home activity and listing-quality recommendations;
- minimum operator review/reporting/curation workflow.

Gate: complete seller UI route/state matrix passes mobile, desktop, keyboard, reduced-motion, and content-integrity review.

### Stage 4 — Backend audit and foundation

Follows backend master phases A–B:

- inspect remote project `kzixedushlpthxehqoho` read-only first;
- document existing schema/environment risk in `docs/backend-audit.md`;
- configure current Supabase browser, server, and server-only admin clients;
- implement current Next.js session refresh/proxy approach;
- validate environment variables without exposing values.

Gate: connectivity/auth proof, no credential leakage, no destructive remote action.

### Stage 5 — Core schema, integrity, RLS, and Storage

Follows backend master phases C–E:

- source-controlled migrations for core and approved refinement tables;
- constraints, indexes, triggers/functions, versioning, and seed data for local development only;
- RLS and `docs/rls-matrix.md`;
- public/private buckets and owner-prefix policies;
- generated database types.

Gate: anon/Seller A/Seller B cross-tenant tests, private-document tests, migration replay, and rollback/recovery review pass.

### Stage 6 — Seller auth, store, and catalog integration

Follows backend master phases F–G:

- live seller auth/session/recovery;
- onboarding/store/policies/verification;
- product/media/options/variants/publish;
- inventory ledger/freshness/bulk actions;
- replace mock seller repositories domain by domain.

Gate: Seller A cannot mutate Seller B; concurrent edits conflict safely; failed publish leaves no partial public product.

### Stage 7 — Public marketplace data integration

Follows backend master phase H:

- replace buyer mock reads for Stores, Products, Discover search/results, Drops, and Home;
- preserve approved buyer components, states, navigation, and local Cart/Saved behavior;
- implement cache invalidation from seller mutations.

Gate: buyer regression suite and visual route/state audit pass against real local Supabase data.

### Stage 8 — Order intents and Enquiries

Follows backend master phases I–J:

- server-authoritative seller-specific validation;
- transactional snapshots and idempotency;
- protected guest enquiry history;
- WhatsApp deep-link generation/status endpoints;
- seller enquiry isolation and outcome history.

Gate: mixed-seller, price change, variant change, out-of-stock, suspended/paused store, duplicate submit, invalid number, special-character message, and guest-isolation tests pass.

### Stage 9 — Events, recommendations, moderation, and pilot hardening

- server-ingested event allowlist;
- basic Seller Home activity and metric glossary;
- listing-quality/freshness rules;
- operator report/verification/moderation audit;
- rate limits, security review, performance budgets, backups, logs, and operating runbooks.

Gate: public-beta checklist in the source-of-truth documents and backend master prompt passes.

### Stage 10 — V1.1 experiments

Only after MVP reliability and seller behavior are measured:

- conflict-aware spreadsheet bulk editor;
- scheduled promotions and Drops;
- Stories pilot;
- dedicated analytics and Demand Gaps;
- explicit seller acknowledgement;
- response-health indicators;
- optional account/follow work only after separate approval.

Each experiment has a removal criterion and does not weaken MVP integrity.

## 20. Test strategy

### Unit

- schemas and normalization;
- price/compare-at resolution;
- variant combination keys;
- freshness derivation;
- inventory balance and reasons;
- event and metric definitions;
- WhatsApp formatting;
- state transition guards.

### Repository/contract

- mock and Supabase implementations return compatible domain shapes;
- error/conflict variants are exhaustive;
- public repositories never expose private columns.

### Database

- constraints and foreign keys;
- transaction rollback;
- idempotency replay;
- version conflict;
- same-store Drop/Story/Order invariants;
- archive/history behavior;
- anonymous/public visibility rules.

### RLS and Storage

- anonymous, Seller A, Seller B, operator, and privileged server matrix;
- own-folder upload and cross-owner denial;
- public media read and private verification denial;
- seller enquiry isolation and no direct anonymous order-intent insert.

### End to end

- first seller publish;
- edit and republish;
- offline/retry upload;
- status-only, tracked, one-off preset, made-to-order;
- mobile selection/bulk action;
- desktop bulk conflict;
- pause/resume store;
- Drop lifecycle;
- buyer discovery from seller publication;
- buyer order review through a seller-managed outcome;
- operator restriction and public behavior.

### Accessibility/performance

- automated checks plus keyboard/screen-reader spot checks;
- 390px compact, medium reflow, 1440px wide, and 200% zoom;
- slow network/upload retry;
- catalog/query budgets and image payload checks;
- production TypeScript, lint, unit, integration, and build gates.

## 21. Observability and operations

- Structured server errors include operation, request ID, and safe entity IDs.
- Never log secrets, tokens, passwords, complete verification evidence, or unnecessary buyer data.
- Monitor auth failures, publish failures, upload failures, order-intent validation failures, bulk conflicts, stale inventory coverage, unavailable-at-review rate, WhatsApp-open failure, and enquiry acknowledgement time.
- Alert on sustained failure-rate thresholds, not isolated expected validation errors.
- Daily database backups are not sufficient for Storage objects; document media recovery separately.
- Maintain runbooks for key rotation, failed migration, seller suspension, leaked media, verification-document access, and incident communication.

## 22. Product and operational success measures

Primary candidate:

- weekly qualified enquiries: buyer-marked sent in MVP, strengthened to seller-acknowledged in V1.1.

Supporting:

- sellers reaching first published product;
- time to first publish;
- stores with valid WhatsApp and complete policies;
- live inventory confirmed within target freshness window;
- unavailable-at-order-review rate;
- product views reaching review and intent stages, labeled separately;
- enquiry acknowledgement rate/time after V1.1 acknowledgement exists;
- active sellers publishing or refreshing weekly;
- seller task completion from recommendations;
- buyer repeat browsing and no-result rate at aggregate marketplace level.

Guardrails:

- report rate;
- moderation rejection/removal rate;
- cross-tenant/RLS incidents;
- upload/publish failure rate;
- misleading-price corrections;
- opt-out/support burden;
- search cohort privacy suppression.

## 23. Open decisions before Stage 1 or affected stage

These are approval choices, not reasons to weaken the plan:

1. Exact launch seller categories and prohibited/enhanced-review products.
2. Evidence required for phone, identity, and business verification.
3. Whether a paused store remains publicly browseable with contact blocked—the current buyer UI assumes yes.
4. Exact seller policy fields and legally reviewed default wording.
5. Whether Drops remain MVP-lite or move wholly to V1.1.
6. Initial freshness thresholds by inventory/category; current hypothesis is three days for fast/low stock and seven days otherwise.
7. Whether SOKOZA provides photography/onboarding assistance during the concierge pilot.
8. Seller authentication channel at launch after cost, deliverability, and recovery review.
9. Initial privacy threshold for seller-visible search/customer cohorts.
10. Which operator role holders may review identity/business evidence.

## 24. Definition of seller MVP complete

The seller MVP is complete only when:

- all Stage 1–9 gates pass;
- no seller code bypasses typed repositories or RLS;
- a seller can authenticate, create a store, verify WhatsApp, publish a structured product with images/variants/inventory, keep it fresh, create a live Drop, and manage an enquiry;
- an unauthenticated buyer can discover that live data, create one server-validated seller-specific intent, open a correct WhatsApp message, and preserve protected local enquiry history;
- the seller can inspect the enquiry and truthfully update availability/outcome;
- no screen claims a payment, completed order, revenue, verified purchase, generic trust, or unsupported popularity;
- operator review, reporting, suspension, and audit exist at pilot scale;
- security, accessibility, performance, failure recovery, and production build checks pass;
- legal and operating owners approve public-beta readiness.
