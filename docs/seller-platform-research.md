# SOKOZA Seller Platform Research

**Status:** Superseded for current benchmarks and release assignment by `seller-redesign-research.md`; retained as the deeper original domain/architecture study  
**Research date:** 8 August 2026  
**Scope:** Seller experience, growth system, and production architecture  
**Constraint:** This document records research and planning; implementation authority came from the separate Phase 2 approval on 8 August 2026

> Current Seller Studio product decisions, benchmark links and MVP/V1.1/later assignments live in `seller-redesign-research.md`.

## 1. Governing product position

This research treats `product-research.md`, `product-decisions.md`, `design-strategy.md`, and `reference-design-audit.md` as the source of truth.

SOKOZA remains a Lusaka-first fashion discovery marketplace with WhatsApp-assisted ordering. Buyers do not need an account in the MVP. Sellers authenticate. SOKOZA controls catalog discovery, order review, creation of an order intent, and the outbound WhatsApp handoff; it does not control payment, delivery, or completion.

The seller product must therefore optimize for four outcomes:

1. Current, structured, visually credible inventory.
2. Less repetitive work for a phone-first seller.
3. More qualified buyer enquiries, without fabricating sales.
4. Operational trust: clear status, ownership, history, and recovery.

The recommended seller product is an **action-focused mobile workbench**, not a miniature Shopify admin and not a vanity analytics dashboard.

## 2. Research method

The study focused on official product documentation from Shopify, Etsy, eBay, Square, Meta/Instagram, WhatsApp Business, Supabase, and PostgreSQL. These products are not direct market equivalents, but each provides a mature pattern relevant to one seller job.

Evidence is interpreted through SOKOZA's constraints:

- A checkout platform can verify orders and revenue; SOKOZA cannot yet.
- A POS can automatically decrement stock; a WhatsApp enquiry cannot.
- A customer directory built from card transactions has identity evidence SOKOZA does not possess.
- A social platform can support continuous publishing and moderation at a scale SOKOZA should not assume.
- A bulk editor is only safe when concurrency, validation, ownership, and audit history are designed with it.

## 3. Seller jobs and failure risks

### Core seller jobs

- Establish a credible, recognizable storefront.
- Publish a good product from a phone without learning database concepts.
- Reuse sizes, colours, fulfilment terms, and prior listing structure.
- Know which items are stale, incomplete, low, sold, or blocked.
- Change many items without losing control of what changed.
- Create a commercial moment around a drop or genuine price reduction.
- Understand which listings create qualified interest.
- Respond to enquiries without SOKOZA pretending the sale completed.
- Pause safely when unavailable.
- Learn what to improve next.

### Principal failure risks

- A second catalog becomes more work than Instagram or WhatsApp.
- Stale availability sends buyers into disappointing chats.
- Sellers publish visually appealing but insufficiently structured listings.
- Bulk changes overwrite newer work or destroy inventory history.
- Promotion tools promise checkout behavior that does not exist.
- Analytics relabel outbound clicks as sales.
- “Customer insights” expose or imply identities SOKOZA has not earned.
- Generic verification or response badges overstate trust.
- A seller suspension accidentally deletes historical enquiry context.

## 4. Competitive findings

### 4.1 Seller home: show work, not decoration

[Etsy's Shop Manager dashboard](https://help.etsy.com/hc/en-us/articles/360000343908-How-to-Use-Your-Dashboard-to-Manage-Your-Shop) prioritizes tasks that need attention—messages, listings, orders, and shop-advisor reminders—before deeper statistics. [eBay Seller Hub](https://www.ebay.com/help/selling/selling-tools/seller-hub?id=4095) centralizes listing work, performance, and operations in one workspace.

**Why the pattern exists:** a seller opens a dashboard to decide what to do next. Unordered KPI cards require interpretation; a prioritized task can be completed.

**SOKOZA adaptation:** Seller Home begins with blockers and time-sensitive actions: finish setup, resolve verification, refresh stale stock, fix publish errors, respond to new enquiries, or publish the next item. Factual activity is secondary and always linked to an action.

### 4.2 Store management: identity, policies, and a safe pause

[Etsy shop policies](https://help.etsy.com/hc/en-us/articles/115014372467-How-to-Set-Up-Your-Shop-Policies) separate returns/exchanges, cancellation, and privacy expectations. Etsy also preserves policy history at the transaction boundary. Its [Vacation Mode guidance](https://help.etsy.com/hc/en-us/articles/360000336327-How-to-Manage-Your-Shop-In-Case-of-Emergency) exists because continuing to accept demand while a seller is unavailable damages trust. [Shopify roles and permissions](https://help.shopify.com/en/manual/your-account/users) and [activity logs](https://help.shopify.com/en/manual/shopify-admin/activity-logs) show why growing stores eventually need least-privilege access and a record of material changes.

**Why these features exist:** buyers need terms before contact; sellers need to stop new demand without destroying work; teams need accountability.

**SOKOZA adaptation:**

- MVP store setup includes name, proposition, imagery, service area, fulfilment modes, collection/delivery details, exchange/return position, typical reply expectation, and WhatsApp verification.
- `Pause store` is reversible. The public catalog remains understandable, but new enquiry creation is blocked and the reason is clear.
- Platform restriction and suspension are separate from seller pause.
- Team roles wait until later, but sensitive mutations record an actor so the data model can support them.

### 4.3 Product creation: structured, progressive, reusable

[Shopify product management](https://help.shopify.com/en/manual/products) starts with a small required core and layers media, variants, inventory, tags, and custom data. [Square option sets](https://squareup.com/help/us/en/article/6689-item-options) generate reusable combinations such as size and colour. Etsy's 2026 seller updates describe clearer form grouping, selective prefilling, and attribute suggestions, while warning sellers to review inferred values ([Etsy seller updates](https://help.etsy.com/hc/en-us/articles/10603291042967-Newly-Crafted-Etsy-Updates-for-Your-Shop?segment=selling)).

**Why the pattern exists:** flat, universal forms are slow and error-prone. Reusable structured attributes reduce typing and improve buyer filters.

**SOKOZA adaptation:**

- A staged editor moves through Photos → Essentials → Options & availability → Fulfilment → Review.
- Category determines relevant fields; size and shoe systems are not treated as generic free text.
- The first saved state is a draft. Publishing is a separate, validated transition.
- Sellers can duplicate one of their own products to reuse structure, but the duplicate starts as a draft with a new identity and no historical metrics.
- Reusable option sets and store defaults reduce repeated work without silently publishing inferred data.
- A listing-quality checklist explains missing evidence; it does not claim a secret ranking score.

### 4.4 Listing states: say why an item is missing

Etsy distinguishes active, inactive, expired, sold, and removed listings and points sellers to the relevant state when an item appears missing ([Etsy listing states](https://help.etsy.com/hc/en-us/articles/360000344948-How-to-Find-a-Missing-Listing)).

**Why the pattern exists:** an overloaded “status” field makes recovery and support difficult. Sellers need to know whether they hid an item, it sold, it failed review, or the platform removed it.

**SOKOZA adaptation:** keep publication, availability, and moderation separate:

- publication: draft, published, hidden, archived;
- availability: available, low, sold out, made to order;
- moderation: pending, approved, rejected, removed;
- freshness: derived from the last confirmed timestamp.

The UI can then explain the exact cause and the permitted next action.

### 4.5 Inventory: multiple operating models and an audit trail

[Shopify's inventory setup](https://help.shopify.com/en/manual/products/inventory/setup/initial-inventory-setup) recognizes that made-to-order goods do not behave like ordinary tracked stock. [Square inventory adjustments](https://squareup.com/help/us/en/article/8331-set-up-inventory-tracking) require adjustment reasons, while [Square stock history](https://squareup.com/help/us/en/article/6061-view-stock-adjustment-history-with-square-for-retail) preserves what changed. [Square low-stock alerts](https://squareup.com/help/us/en/article/8333-create-inventory-alerts) turn inventory into a task before a stockout.

**Why the pattern exists:** not every fashion seller knows or wants exact quantities, but every buyer needs an honest availability signal. A current balance without history cannot explain mistakes.

**SOKOZA adaptation:** support three modes:

1. `tracked` — exact quantity per variant; a one-off item is a tracked preset starting at one.
2. `status_only` — seller confirms Available, Low stock, or Sold out without a count.
3. `made_to_order` — no on-hand quantity; requires a stated lead-time range.

Every tracked adjustment records delta, resulting balance, reason, actor, and time. Every status-only or made-to-order confirmation records a freshness event. Creating an order intent does not reserve or decrement stock because a WhatsApp conversation is not a sale.

### 4.6 Bulk work: optimize repeated tasks, then protect them

[Shopify's bulk inventory editor](https://help.shopify.com/en/manual/products/inventory/adjusting-inventory/bulk-editing-inventory) uses a table, fill controls, multi-change save, and a conflict dialog when inventory changed during editing. Its documentation also warns that an absolute bulk overwrite may not produce movement history. [Square's bulk editor](https://squareup.com/help/us/en/article/8228-bulk-edit-items-in-square-dashboard) supports configurable columns and reports conflicts when another update wins. [Etsy bulk listing edits](https://help.etsy.com/en-gb/articles/360000337307-Can-I-Create-or-Edit-Multiple-Listings-at-Once) use selection plus bounded actions, and copying a listing reduces repeated entry.

**Why the pattern exists:** seller time is consumed by repeated changes, but bulk work multiplies the damage of an error.

**SOKOZA adaptation:**

- MVP includes selection-based actions: Confirm available, Mark low, Mark sold, Publish, Hide, Archive, Add/remove from Drop.
- Every action has a review summary, reports partial failure per item, and creates audit records.
- V1.1 adds a spreadsheet-style editor for price, compare-at price, quantity/status, category, and freshness.
- Each edited row carries an expected version. Conflicts never silently overwrite newer data; the seller chooses current, proposed, or skip.
- An absolute stock set is converted into a ledger delta with a reason so history remains intact.
- CSV import waits until the schema and validation language are stable.

### 4.7 Saved views and recurring work

[Shopify product filters and saved views](https://help.shopify.com/en/manual/products/searching-filtering) let sellers preserve recurring filters and take bulk actions on the resulting set.

**Why the pattern exists:** “show me stale footwear” or “drafts missing photos” is recurring operational work, not a one-time query.

**SOKOZA adaptation:** useful built-in views arrive before arbitrary saved views: Needs attention, Drafts, Live, Stale, Low stock, Sold, Hidden. User-created saved views can wait for V1.1 after seller behavior shows which combinations repeat.

### 4.8 Promotions: separate display pricing from checkout discounts

[Shopify's discount guidance](https://help.shopify.com/en/manual/discounts/discounts-faq) distinguishes sale pricing shown through compare-at prices from codes applied in cart or checkout. [eBay Discounts Manager](https://www.ebay.com/help/selling/selling-tools/discounts-manager?id=4094) frames promotions around clearing stock, raising basket size, and repeat buying, with schedules and item selection.

**Why the pattern exists:** a promotion needs a business objective, eligibility rules, a start/end lifecycle, and measurement. Checkout discounts additionally require an engine that enforces redemption.

**SOKOZA adaptation:**

- MVP supports a truthful product markdown: current price plus an optional genuine prior/compare-at price. It is display and enquiry context, not a platform coupon.
- A markdown cannot be presented as a percentage saving unless both prices satisfy database rules.
- V1.1 adds scheduled product/collection sale windows and reusable campaign links. Active price is resolved server-side and snapshotted in the order intent.
- Discount codes, Buy X Get Y, order-level discounts, free-delivery offers, redemption limits, and stackability wait for controlled checkout or a seller-confirmation model that can actually enforce them.
- Paid placement waits until inventory density, attribution, ranking fairness, and seller value are measurable.

### 4.9 Drops: a manageable commercial moment

The source-of-truth documents already define a Drop as a seller-owned named collection. This is the right MVP abstraction because it packages inventory without requiring notifications, countdown services, or social engagement.

**Why it exists:** stores need a shareable launch moment and buyers need a coherent collection entry point.

**SOKOZA adaptation:** MVP supports draft, live, ended, and archived Drops; a product grid remains the transactional core. V1.1 adds scheduling, accurate countdowns, reminders, and story packaging only after the scheduler and notification consent model exist.

### 4.10 Stories: finite commerce media, not a second social network

Meta documents that Stories disappear from the ordinary surface after 24 hours unless preserved, and that story insights can remain available after the media expires ([Instagram story lifetime](https://www.facebook.com/help/1729008150678239/), [Meta story insights](https://www.facebook.com/help/www/249460088951927)).

**Why the pattern exists:** temporary full-screen media creates urgency and a sequence, but it requires ongoing content, expiry rules, accessibility, and moderation.

**SOKOZA adaptation:** Stories are a V1.1 managed pilot, not MVP. An approved seller or operator creates a finite sequence tied to visible products or a live Drop. Each story has start and expiry times, pause/previous/next/close, text alternatives, reduced-motion handling, and a linked-product list. There are no comments, public likes, follower counts, or unsupported “trending” claims. Expired media can remain in seller insights for a defined retention period without remaining publicly active.

### 4.11 WhatsApp: keep product context before the handoff

[WhatsApp Business catalog guidance](https://whatsappbusiness.com/products/business-app-features/) highlights catalogs, collections, product links, carts, and business entry points because repeated exchange of product photos and prices is inefficient. Its [catalog guidance](https://whatsappbusiness.com/resources/resource-library/whatsapp-business-app-resources-whatsapp-business-catalog/) recommends multiple product views and complete information.

**Why the pattern exists:** chat works best after the customer already understands the item.

**SOKOZA adaptation:** the seller catalog lives in SOKOZA, where it is searchable and comparable. The prepared message carries a stable reference, products, selected variants, quantities, and authoritative item value. Seller Home emphasizes complete listings and clear fulfilment so WhatsApp can focus on confirmation, payment, and handover.

### 4.12 Analytics: use an evidence ladder

[Etsy Stats](https://help.etsy.com/hc/en-us/articles/115015774268-How-to-Use-Etsy-Stats-for-Your-Shop) connects listing views and favorites to orders and revenue because Etsy controls checkout. [Square Online reports](https://squareup.com/help/us/en/article/6948-insights) similarly defines conversion against verified orders and warns that traffic can include bots.

**Why the pattern exists:** a metric is useful only if its event, denominator, timeframe, filtering, and confidence are understood.

**SOKOZA adaptation:** every metric has a glossary and evidence strength:

| Signal | What SOKOZA can claim | Evidence |
|---|---|---|
| Product impression | The product card entered a measurable viewport | Weak discovery signal; sampled/deduplicated |
| Product view | A product detail was opened | Controlled platform event |
| Store view | A store profile was opened | Controlled platform event |
| Save action | A buyer added the product to local Saved | Intent signal; not a purchase |
| Order review started | Buyer opened a seller-specific review | Stronger structured intent |
| Intent created | Server validated and snapshotted an order intent | Authoritative platform record |
| WhatsApp opened | SOKOZA triggered the outbound link | Handoff only; message not proven |
| Buyer marked sent | Buyer self-reported sending the enquiry | Self-reported, not sale evidence |
| Seller acknowledged | Seller confirmed the enquiry reached them | V1.1; strongest later SOKOZA enquiry evidence |
| Seller marked sold | Seller changed catalog/enquiry status | Seller-declared outcome, not payment proof |

MVP Seller Home may show product views, store views, save actions, order reviews, intents, buyer-marked-sent enquiries, and freshness. A dedicated V1.1 analytics surface adds trends, seller acknowledgement, and response health. SOKOZA must not display sales, GMV, revenue, purchase conversion, average order value, payment success, delivery success, or ROAS.

### 4.13 Customer insights: aggregate demand, not people

[Shopify customer segments](https://help.shopify.com/en/manual/customers/customer-segmentation/create-customer-segments) and [Square Customer Directory](https://squareup.com/help/us/en/article/5498-manage-your-customer-directory-online) rely on authenticated checkout, bookings, loyalty, or card-linked transactions. Those systems have identity and purchase evidence SOKOZA lacks.

**Why the pattern exists:** known customer history can support retention, but misidentification, duplicates, consent, and sensitive notes create privacy and operational risk.

**SOKOZA adaptation:** MVP does not provide a named customer directory, export guest identities, import WhatsApp contacts, or claim purchase history. Sellers receive aggregated demand signals only:

- top viewed and saved products;
- common selected sizes and price bands;
- popular categories/colours within their store;
- normalized search terms that led to their products;
- no-result demand relevant to their catalog;
- service-area interest only when voluntarily supplied and sufficiently aggregated;
- new versus returning browsing sessions only after privacy review and minimum thresholds.

Small cohorts are suppressed. Raw search strings are not exposed if they could contain personal information. A future named customer feature requires an optional buyer account, explicit consent, access/deletion controls, and a real value exchange.

### 4.14 Demand gaps: turn marketplace search into seller opportunity

[Etsy Marketplace Insights](https://help.etsy.com/hc/en-us/articles/35122361353239-How-Do-I-Use-Etsy-s-Marketplace-Insights-Tool?segment=selling) compares buyer search demand with listing supply to inform products and listing optimization.

**Why the pattern exists:** analytics should help a seller choose what to stock or publish, not merely describe yesterday.

**SOKOZA adaptation:** V1.1 introduces privacy-safe Demand Gaps:

- rising searches with insufficient current local results;
- missing sizes or price bands in a store's strongest category;
- searches that reach a product but frequently encounter stale/sold inventory;
- demand by category and service area only above a minimum sample;
- recommended listing fields derived from buyer filters, not opaque AI claims.

The opportunity engine uses explainable rules and confidence labels. It does not guarantee sales or expose another store's private performance.

## 5. Features that help stores grow

Growth should come from reducing friction and improving catalog-market fit, not from adding a generic marketing tab.

| Growth feature | Why it exists | Phase |
|---|---|---|
| Setup checklist with preview | Gets a store to a credible public baseline and shows what buyers will see | MVP |
| Listing quality checklist | Improves images, structured filters, measurement clarity, and fulfilment confidence | MVP |
| Freshness queue | Prevents trust loss from stale items and makes refresh a fast daily habit | MVP |
| Enquiry readiness check | Finds invalid WhatsApp, missing policies, unpublished variants, or paused status before demand arrives | MVP |
| Duplicate product | Reduces work for recurring cuts, colours, or restocks while preserving independent history | MVP |
| Drop builder | Gives sellers a shareable collection and launch moment | MVP-lite |
| Share kit | Creates a stable Store/Product/Drop link plus concise share copy for WhatsApp Status and Instagram | MVP |
| Weekly action summary | Prioritizes stale items, incomplete listings, unacknowledged enquiries, and top opportunities | V1.1; opt-in delivery later |
| Demand Gaps | Shows under-served searches, sizes, and price bands with confidence thresholds | V1.1 |
| Listing diagnostics | Explains why a product is hard to find: missing category, size, images, stale status, weak title | MVP rules; richer V1.1 |
| Scheduled campaign/drop | Lets sellers coordinate real launch timing and reuse the same collection | V1.1 |
| Story from Drop | Repackages existing work instead of requiring a separate daily content system | V1.1 pilot |
| Related-item sets | Helps increase seller-specific basket intent without pretending cross-seller checkout | V1.1 |
| Response-health coaching | Helps sellers acknowledge enquiries promptly once enough timestamps exist | V1.1 |
| Buyer follow/notifications | Supports retention only after optional buyer identity and consent exist | Later |
| Paid placement | Monetizes demand only after fairness, attribution, and seller value are defensible | Later |

## 6. Recommended phase allocation

### MVP

- Seller authentication and recovery.
- Guided store onboarding, preview, policies, WhatsApp verification, pause/resume.
- Exact public verification labels and verification workflow state.
- Action-focused Seller Home.
- Product list with built-in operational views.
- Draft, create, edit, preview, publish, hide, archive, and duplicate.
- Actual-item image upload, ordering, alt text, retry, and removal.
- Flexible options and variants.
- `tracked`, `status_only`, and `made_to_order` inventory modes.
- Freshness confirmation and adjustment history.
- Selection-based bulk actions with preview and per-item result reporting.
- Manual truthful compare-at price; no coupon or checkout discount.
- Live/past Drop management without countdowns or reminders.
- Enquiry list based on order intents and seller-declared inventory/outcome changes.
- Basic factual activity and metric glossary.
- Listing-quality, freshness, and enquiry-readiness recommendations.
- Stable share links and share copy.
- Minimum operator review, moderation, reports, curation, and audit trail.

### V1.1

- Spreadsheet-style conflict-aware bulk editor.
- Saved product views and reusable option sets if usage justifies them.
- Scheduled product/collection price campaigns.
- Scheduled Drops, real countdowns, and opt-in reminders.
- Managed shoppable Stories with expiry and product taps.
- Dedicated analytics with trends, evidence-labeled funnel, source categories, and definitions.
- Explicit seller acknowledgement after the core enquiry flow is stable.
- Demand Gaps and store-specific opportunity recommendations.
- Response-health indicators after minimum eligible volume.
- Related-item sets and same-seller look merchandising.
- Optional buyer accounts, follows, and cross-device Saved data only if separately approved.

### Later

- Seller teams, roles, and delegated permissions.
- Multi-location inventory and transfers.
- CSV import/export after schema maturity and dry-run validation.
- Named customer CRM and campaigns only with identity, consent, and deletion controls.
- Discount codes, volume/order discounts, redemptions, and stackability after controlled checkout.
- Reviews after defensible transaction confirmation.
- Automated WhatsApp Business API messaging.
- Payments, escrow, delivery orchestration, and verified revenue analytics.
- Paid promotion and auctions after ranking fairness and attribution are proven.

## 7. Architecture and integrity findings

[Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security) requires RLS on exposed tables and recommends indexed policy columns and explicit roles. [Supabase Storage](https://supabase.com/docs/guides/storage) supports RLS-controlled media, transformations, and resumable uploads. [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) provide checks, unique keys, primary keys, and foreign keys that enforce invariants beneath TypeScript. [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html) explains why concurrent work needs explicit consistency handling.

The recommended shape is deliberately simple:

- Next.js App Router remains the application boundary.
- UI components continue using typed repositories.
- Public catalog reads use server-side repositories and intentional cache tags.
- Authenticated seller media uploads use Supabase Storage with ownership paths and RLS.
- Seller mutations use validated server actions or route handlers plus RLS.
- Multi-row catalog publishing, bulk inventory updates, and order-intent creation use database functions/transactions.
- Anonymous clients never write arbitrary analytics or order-intent rows directly.
- The service secret remains server-only and is not a substitute for RLS.
- All schema changes are migrations; production data is never reset.
- Inventory and sensitive status changes are auditable and soft-deleted where history matters.
- Optimistic versions prevent lost updates; idempotency prevents duplicate submissions.
- Public views must obey RLS (`security_invoker` where appropriate).
- Aggregates can begin as indexed queries and daily summaries; partitioning, queues, read replicas, or separate analytics infrastructure wait for measured scale.

## 8. Research conclusion

SOKOZA should win seller trust by being lighter than a full commerce suite and more structured than a social feed. The MVP should help a store publish credible inventory, keep it fresh, turn demand into precise WhatsApp enquiries, and know what action matters next.

The seller platform should not borrow features merely because mature checkout platforms have them. SOKOZA's strongest product discipline is to preserve the difference between a view, an intent, a WhatsApp handoff, an acknowledged enquiry, and a completed sale.
