# SOKOZA Product Decisions

> Production update — Backend production integration was authorized by the product owner on 8 August 2026. PD-025’s mock-first restriction is complete and superseded for runtime code; fictional entities may remain only as explicit test fixtures. Supabase is now the production source of truth.

**Status:** Current decision register; explicit amendments override earlier proposals  
**Date:** 8 August 2026  
**Precedence:** Current user direction → approved decisions here → permanent product constitution → design strategy → components → supplied screenshots → generic conventions.

This file converts research into durable product choices. “Accepted” below means recommended for approval, not yet implemented.

## Decision index

| ID | Decision | Status | Earliest phase |
|---|---|---|---|
| PD-001 | Launch Lusaka-first and fashion-only | Proposed | MVP |
| PD-002 | Position as discovery + WhatsApp-assisted ordering | Proposed | MVP |
| PD-003 | Keep exactly four buyer navigation destinations; search belongs to Discover | Accepted by user amendment | MVP |
| PD-004 | Guest-first buyer experience; seller-only auth | Proposed | MVP |
| PD-005 | One seller per order review and WhatsApp handoff | Proposed | MVP |
| PD-006 | Record order intent, never infer a completed purchase | Proposed | MVP |
| PD-007 | Use a seller-grouped local cart without cross-seller total | Proposed | MVP |
| PD-008 | Make freshness a first-class inventory signal | Proposed | MVP |
| PD-009 | Use specific verification levels, not generic trust badges | Proposed | MVP |
| PD-010 | Defer ratings and reviews | Proposed | V2 |
| PD-011 | Retain Drops in a reduced live-collection form | Proposed | MVP-lite |
| PD-012 | Change Vibe Check and defer it | Proposed | V1.1 experiment |
| PD-013 | Defer Hot in Lusaka as a managed commerce story | Proposed | V1.1 |
| PD-014 | Defer Complete the Fit; allow simple Wear it with | Proposed | V1.1 |
| PD-015 | Do not require or promise integrated payments/delivery | Proposed | Later pilot |
| PD-016 | Treat search, size, availability, and condition as core | Proposed | MVP |
| PD-017 | Require structured, actual-item listings | Proposed | MVP |
| PD-018 | Preserve seller identity and policies | Proposed | MVP |
| PD-019 | Curate early supply; do not fabricate popularity | Proposed | MVP |
| PD-020 | Use an action-focused seller workspace | Proposed | MVP |
| PD-021 | Separate editorial and transactional composition | Proposed | MVP |
| PD-022 | Use a centralized Hugeicons-first icon registry | Proposed | MVP |
| PD-023 | Measure qualified enquiries, not sales | Proposed | MVP |
| PD-024 | Use typed repositories between UI and data | Proposed | UI phase |
| PD-025 | Build UI with mocks before Supabase | Accepted by supplied brief | UI phase |
| PD-026 | Preserve the immutable brand and currency conventions | Accepted by constitution | All phases |
| PD-027 | Make accessibility and low-data behavior release criteria | Proposed | MVP |
| PD-028 | Use the approved TypeScript/Next/Tailwind/Supabase stack | Accepted by user | All phases |
| PD-029 | Use ranked visual autosuggest inside Discover | Accepted by user amendment | Buyer MVP |
| PD-030 | Recompose Store Detail into a true wide split layout | Accepted by user amendment | Buyer MVP |
| PD-031 | Add an earned, native-first web-app install experience | Accepted by user amendment | Buyer MVP |
| PD-032 | Use relevance-first, momentum-aware ranking and thresholded meaningful-view social proof | Accepted by user amendment | Buyer/Seller MVP |
| PD-033 | Separate Store persistence/publication and guide structured fulfilment | Accepted by user amendment | Seller MVP |

## Alternatives considered

The detailed sections below state each decision's rationale and implications. This matrix records the rejected alternatives and phase explicitly.

| ID | Alternatives considered | Why rejected | Phase |
|---|---|---|---|
| PD-001 | Nationwide launch; general classifieds | Both disperse early liquidity and weaken fashion relevance | MVP |
| PD-002 | Full ecommerce checkout; social feed; link directory | Checkout is operationally premature; feeds/directories do not resolve structured discovery and availability | MVP |
| PD-003 | Separate Search destination; Profile as a tab; seller-specific buyer-nav changes | A separate Search tab fragments one discovery job, Profile is secondary, and per-screen changes make navigation unstable | MVP |
| PD-004 | Mandatory buyer account; anonymous browsing only until WhatsApp | Account wall adds friction; browse-only prevents useful local retention | MVP |
| PD-005 | One combined checkout/message; “order all” loop | Implies coordination across sellers that SOKOZA does not provide | MVP |
| PD-006 | Mark ordered after deep-link open; ignore intent state | First is false, second prevents attribution/recovery/idempotency | MVP |
| PD-007 | Cross-seller grand total; one flat cart | Misrepresents unresolved costs and seller responsibility | MVP |
| PD-008 | Binary stock only; no freshness; auto-expire all stale products | Binary seller data goes stale; no signal is unsafe; auto-expiry may erase available supply | MVP |
| PD-009 | Generic verified/trusted badge; no verification | Generic badge overclaims; no verification leaves avoidable uncertainty | MVP |
| PD-010 | Launch empty ratings; seed testimonials; unlock on WhatsApp open | Empty ratings add little; seeded reviews deceive; open does not prove purchase | V2 |
| PD-011 | Full scheduled drop/reminders in MVP; remove Drops | Full version adds infrastructure; removal loses a useful low-cost seller collection concept | MVP-lite |
| PD-012 | Make swiping core; preserve permanent dislikes; remove entirely | Core swipe is gimmick-prone; permanent signal is too strong; finite later test preserves learning value | V1.1 experiment |
| PD-013 | Stories/comments/likes in MVP; remove stories permanently | MVP lacks content/moderation capacity; permanent removal discards a potentially valuable commerce format | V1.1 |
| PD-014 | Multi-seller “add all” in MVP; no related merchandising | First creates transaction confusion; second loses a useful later fashion pattern | V1.1 |
| PD-015 | Build payment/mobile-money and delivery at launch | Adds fraud, settlement, disputes, regulation, refunds, and logistics before discovery is validated | Later pilot |
| PD-016 | Feed-first browse; unstructured seller descriptions | Neither reliably answers size, price, condition, and availability | MVP |
| PD-017 | One image/minimal fields; studio-grade requirements | First creates buyer uncertainty; second blocks small sellers | MVP |
| PD-018 | Flatten sellers under products; unrestricted storefront themes | First removes identity; second fragments accessibility and brand consistency | MVP |
| PD-019 | Algorithmic trending/personalization; random order only | Early data is too thin; random-only prevents purposeful quality curation | MVP |
| PD-020 | Shopify-like admin; vanity KPI dashboard | Too much operational scope and misleading metrics | MVP |
| PD-021 | Asymmetry everywhere; identical grid everywhere | Both misuse one composition mode across incompatible tasks | MVP |
| PD-022 | Material Symbols; arbitrary SVGs; mixed icon packs | Conflicts with approved identity and creates inconsistency/maintenance cost | MVP |
| PD-023 | GMV/revenue north star; WhatsApp opens only | Unverifiable purchase claims; opens alone are too weak | MVP |
| PD-024 | Supabase calls in components; inline per-screen mocks | Both make later data replacement and state testing brittle | UI phase |
| PD-025 | Schema/backend first; UI and backend together | Encodes unresolved product choices and violates the approved phase gate | UI phase |
| PD-026 | Rebuild 3D logo; alternate currency abbreviations | Brand is immutable; variations conflict with canonical customer language | All phases |
| PD-027 | Accessibility/performance polish after launch | Core interaction and reach defects become architectural and exclude target users | MVP |
| PD-028 | Different frontend framework; custom database/auth; full WhatsApp Business API in MVP | Adds divergence and operating scope without improving first validation | All phases |
| PD-029 | Text-only suggestions; separate Search destination; popularity ranking | Adds navigation steps, hides entity identity, or fabricates evidence | Buyer MVP |
| PD-030 | Stretch the compact store layout; place identity below a full-width banner | Wastes wide space and weakens the relationship between store identity and inventory | Buyer MVP |
| PD-031 | Immediate modal; repeated banner; APK download; fake app icon | Interrupts buyers, creates trust risk, and violates brand/install platform conventions | Buyer MVP |

## PD-001 — Launch Lusaka-first and fashion-only

**Decision:** SOKOZA starts with a curated Lusaka market and fashion categories only. Location architecture remains extensible, but public supply is not spread nationwide at launch.

**Why:** A marketplace needs dense, relevant supply. Zambia's urban/rural access and income gaps also argue against treating the whole country as one homogeneous starting market. A local wedge improves collection feasibility and seller curation.

**Implications:**

- Default discovery context is Lusaka, with a visible location control.
- Stores provide a public service area, not an exact private address by default.
- National campaign language is avoided until multiple cities have real liquidity.
- Initial category coverage is apparel, footwear, accessories, designers, boutiques, thrift, and adjacent fashion—not general classifieds.

**Validation:** Search-success rate, active products per category, buyer travel/collection tolerance, and unmet location queries.

## PD-002 — Position as discovery + WhatsApp-assisted ordering

**Decision:** The MVP value proposition is current local fashion discovery with a prepared WhatsApp order enquiry.

**Why:** WhatsApp is already familiar and preserves the seller relationship. SOKOZA improves everything before chat: structured inventory, search, comparison, trust context, and message preparation.

**Implications:**

- Avoid checkout/payment language.
- Public terms explain the seller—not SOKOZA—confirms availability, payment, delivery/collection, exchanges, and completion.
- WhatsApp is an integrated end of the MVP funnel, not a floating universal button.

## PD-003 — Keep exactly four buyer navigation destinations

**Decision:** Primary buyer navigation is always Home, Discover, Stores, Cart. Search is a first-class capability and state inside Discover; it is not a fifth destination. Profile is accessed through the header avatar.

**Why:** Browse-led and query-led discovery are two modes of the same buyer job. Keeping both under one durable `/discover` route reduces navigation competition, preserves visual browsing, and makes results/filter state shareable without inventing another destination. This decision was explicitly amended and accepted by the product owner on 8 August 2026.

**Implications:**

- Same information architecture on compact and wide layouts.
- Discover supports browse, focused/empty-search, grouped autocomplete, and result modes.
- Legacy search URLs redirect to the equivalent Discover state while preserving query parameters.
- Seller workspace uses its own authenticated navigation.
- Saved, Recently Viewed, Enquiries, Settings, and Sell are reached through Profile or contextual links.
- Bottom-navigation items are destinations, never one-off commands.

## PD-004 — Guest-first buyer experience; seller-only auth

**Decision:** Buyers can browse, save locally, keep recently viewed items, build a cart, and create an enquiry without authentication. Only sellers authenticate in the MVP.

**Why:** Forced account creation adds friction before SOKOZA has earned trust. Guest checkout research from larger ecommerce markets reinforces the general usability risk, though its exact abandonment percentages should not be projected onto Zambia. [Baymard guest checkout](https://baymard.com/blog/make-guest-checkout-prominent)

**Implications:**

- Local state needs versioning, expiry, migration, and failure handling.
- Optional contact details can be included in the WhatsApp message but are not a platform buyer account.
- Cross-device sync, following, and preferences can motivate an optional account in V1.1.
- Seller and buyer concepts remain distinct in data and language.

## PD-005 — One seller per order review and WhatsApp handoff

**Decision:** Every order review contains products from exactly one seller and opens exactly that seller's WhatsApp number.

**Why:** Each seller owns availability, price confirmation, payment, fulfillment, and policy. Combining sellers would create a fictional transaction SOKOZA cannot coordinate.

**Implications:**

- Cart groups by seller and provides one `Review order` action per group.
- A buyer ordering from two stores completes two review flows and two conversations.
- Related looks spanning sellers label those sellers and never offer a universal “add all and checkout.”
- Each prepared item line includes its authoritative product details, public SOKOZA product link, and product-photo link. Product pages expose the cover image for compatible WhatsApp link previews; deep links never pretend to attach a media file automatically.

## PD-006 — Record order intent, never infer a completed purchase

**Decision:** SOKOZA records the validated intent and outbound action. It does not infer that the buyer sent the message or bought the products.

**State vocabulary:**

- `draft`
- `ready`
- `whatsapp_opened`
- `buyer_marked_sent`
- `seller_acknowledged` when later supported
- `cancelled` / `expired`

“Paid,” “purchased,” “delivered,” and “completed” require separate evidence and are excluded from the MVP.

**Implications:**

- Enquiry history shows enquiry status, not order tracking.
- Seller metrics say enquiries, not orders or sales.
- Reviews cannot be unlocked merely by a WhatsApp open.
- Backend creation will later be server-side and idempotent.

## PD-007 — Use a seller-grouped local cart without cross-seller total

**Decision:** Cart state is local for guests and organized into seller groups. Show each group's `Item value`; do not show a grand monetary total across stores.

**Why:** Delivery, payment, discounts, and availability remain seller-specific. A combined total implies a unified checkout.

**Implications:**

- Cart summary can show item count and seller count.
- Recalculate item value from current data at order review.
- Handle removed products, unavailable variants, price changes, suspended stores, and local-storage errors.
- `Send order` is replaced by `Review order`.

## PD-008 — Make freshness a first-class inventory signal

**Decision:** Every active product carries an availability state and last-confirmed time. Freshness affects labels and ranking.

**Initial hypothesis:** prompt confirmation after three days for low-stock/fast-moving items and seven days for standard items.

**Implications:**

- Buyer labels describe evidence: `Confirmed today`, `Confirmed within 3 days`, or `Not recently confirmed`.
- Stale is not identical to unavailable.
- Seller home prioritizes stale inventory.
- Order review revalidates product, variant, price, and seller status.
- Thresholds remain configurable and must be validated with sellers.

## PD-009 — Use specific verification levels, not generic trust badges

**Decision:** Verification labels are `WhatsApp number verified`, `Identity verified`, and `Business verified`, each backed by an operational process.

**Why:** A generic badge overstates what was checked and can be interpreted as authenticity or transaction protection.

**Implications:**

- Verification components expose definition and last relevant review where appropriate.
- `Trusted seller`, generic blue checks, and blanket safety promises are prohibited.
- Verification does not replace reporting, moderation, condition disclosure, or policies.

## PD-010 — Defer ratings and reviews

**Decision:** MVP and V1.1 do not show star ratings, review counts, or fabricated testimonials. Review infrastructure begins only after a credible transaction-confirmation path exists.

**Why:** An order intent proves neither purchase nor experience. Empty reviews are preferable to invented trust.

**Implications:**

- Remove fake stars and customer reviews from supplied PDP references.
- MVP trust uses verification, policies, freshness, condition, seller identity, and reporting.
- A later review is labeled by its real evidence, potentially `Order confirmed` rather than `Verified purchase`.

## PD-011 — Retain Drops in a reduced live-collection form

**Decision:** An MVP Drop is a seller-owned named collection of currently published products. It may be live or past.

**Why:** Drops support fashion storytelling and give sellers a launch moment without requiring a social graph or notification platform.

**Implications:**

- MVP has no scheduled countdown or reminder promise.
- A countdown is shown only after V1.1 scheduling exists and has a real start time.
- Sold products remain visibly sold only when useful to collection context.
- Drop items inherit normal product truth and freshness rules.

## PD-012 — Change Vibe Check and defer it

**Decision:** Vibe Check becomes an optional finite discovery experiment in V1.1, not the primary navigation or onboarding mechanism.

**Behavior:** 10–12 cards; Keep saves; Pass affects the session and at most a weak private ranking signal; card tap is neutral; visible buttons duplicate all swipe actions.

**Why:** The supplied concept is memorable but risks swipe fatigue, weak preference inference, inaccessible drag dependence, and novelty without catalog depth.

**Implications:**

- No permanent dislike or public voting.
- No AI/personality claims.
- Test completion, saves, PDP opens, repetition, and later search quality before expanding.
- Disable the entry when catalog density cannot support a useful session.

## PD-013 — Defer Hot in Lusaka as a managed commerce story

**Decision:** Hot in Lusaka is a V1.1 editorial pilot, published by SOKOZA or approved sellers and linked to real products/stores.

**Why:** The supplied story design is visually strong, but a daily/weekly story surface requires reliable content operations and freshness. Comments and public likes add moderation work without improving the first commerce loop.

**Implications:**

- Finite frames, progress, pause, previous/next, close, keyboard and reduced-motion support.
- No comments or public like counts.
- `Hot` means editorially selected, not algorithmically trending, and the curation is disclosed.
- Omit the module when no current story exists.

## PD-014 — Defer Complete the Fit; allow simple Wear it with

**Decision:** MVP may show a basic related-product rail. Interactive styled looks and hotspots are V1.1.

**Why:** Looks can deepen discovery, but hotspots add content authoring and accessibility complexity, and multi-seller looks conflict with one-seller ordering.

**Implications:**

- Prefer same-seller related items initially.
- Multi-seller looks identify each seller and split cart/order actions.
- Hotspots always have an adjacent accessible item list.

## PD-015 — Do not require or promise integrated payments/delivery

**Decision:** MVP has no SOKOZA checkout, escrow, wallet, payment collection, courier booking, or buyer protection claim.

**Why:** These require fraud, dispute, refund, settlement, identity, legal, and logistics operations. Mobile-money familiarity does not remove those responsibilities.

**Implications:**

- Seller provides collection/delivery and payment information.
- SOKOZA may structure buyer preference but does not confirm fulfillment.
- Later pilots require separate discovery, legal, operational, security, and unit-economics approval.

## PD-016 — Treat search, size, availability, and condition as core

**Decision:** Structured product data and retrieval ship before social engagement features.

**Implications:**

- Search understands products, stores, categories, vibes, colors, and occasions.
- Filters include availability, size, category, price, condition, color, store, location, fulfillment, and Made Here where applicable.
- Size is prominent for apparel; filters support multi-select and visible applied state.
- No-results recovery is designed, not treated as an edge case.

## PD-017 — Require structured, actual-item listings

**Decision:** Publishing requires at least two actual-item images, title, category, price, condition, color, size/variant or one-size state, availability, seller, and fulfilment context.

**Why:** These fields eliminate common pre-chat uncertainty while keeping first publishing achievable on a phone.

**Implications:**

- Encourage 3–5 images without making polished studio photography a barrier.
- Require flaw disclosure for used items.
- Product imagery cannot be generated or unrelated stock imagery.
- New sellers and high-risk categories may require manual moderation before public visibility.

## PD-018 — Preserve seller identity and policies

**Decision:** Store identity is a primary marketplace object, not metadata beneath products.

**Implications:**

- Stores have public profiles, location area, description, catalog, drops, contact, verification, fulfillment, return/exchange, and reporting.
- Seller cover/avatar treatment remains visually strong.
- Verification and policies are not buried below recommendations.
- “Follow” is optional V1.1; follower counts are absent initially.

## PD-019 — Curate early supply; do not fabricate popularity

**Decision:** Home/Discover combine explicitly labeled editorial curation with `ranking_v1` organic ordering once recent qualified evidence exists. Freshness-only and editorial modules keep their own definitions.

**Why:** Sparse early data cannot support trustworthy `Trending`, `Best seller`, or personalized rankings.

**Implications:**

- Use `Fresh Today`, `Just Dropped`, `Stores to Know`, `Made Here`, and `Selected by SOKOZA`.
- Establish explicit selection rules and rotation so a few sellers do not monopolize attention.
- Behavioral ranking uses current qualified enquiry momentum, smoothed rates, freshness, bounded exploration, and seller diversity; raw views alone cannot define popularity.
- Keep manual merchandising auditable and separately labeled from organic interest.
- The Home hero deterministically selects qualified momentum first, then explicit editorial curation, then the highest eligible `ranking_v1` result. Its label discloses which mode is active; it never describes an unverified product as trending or Made Here.

## PD-020 — Use an action-focused seller workspace

**Decision:** Seller Home prioritizes setup, verification, stale stock, drafts, low stock, and enquiries. It is not a vanity analytics dashboard.

**Implications:**

- Every metric has a timeframe and definition.
- `Views`, `Saves`, `Order reviews started`, and `Enquiries` are valid.
- `Sales`, `Revenue`, `Conversion to purchase`, and `Average order value` are prohibited without verified transaction data.
- Analytics expansion is V1.1 after basic publishing and refresh reliability.

## PD-021 — Separate editorial and transactional composition

**Decision:** Home, Discover, Drops, and stories may use controlled asymmetry; search results, PDP decisions, Cart, Order Review, and seller tools use stable grids and hierarchy.

**Why:** Discovery benefits from surprise, while comparison and action benefit from predictability.

**Implications:**

- No global bento-grid design.
- No rounded-card wrapper around every section.
- Desktop layouts are separately composed.
- Reference screenshots guide mood and hierarchy, not literal implementation.

## PD-022 — Use a centralized Hugeicons-first icon registry

**Decision:** Hugeicons via Iconify is primary. Iconoir is fallback only for a missing concept. 3dicons are noninteractive illustration only.

**Implications:**

- Typed semantic registry.
- No Material Symbols, emojis, scattered raw icon identifiers, or ad-hoc SVG style mixtures.
- Consistent stroke, size, labels, hit areas, and accessible names.

## PD-023 — Measure qualified enquiries, not sales

**Decision:** The initial north-star candidate is weekly qualified order enquiries, supported by buyer, seller, and liquidity metrics.

**Why:** SOKOZA controls discovery and the handoff, not the full transaction.

**Implications:**

- Separate `order_review_started`, `order_intent_created`, `whatsapp_opened`, `buyer_marked_enquiry_sent`, and later `seller_acknowledged` events.
- Never relabel them as purchases.
- Use product unavailability at review and seller freshness as core quality metrics.

## PD-024 — Use typed repositories between UI and data

**Decision:** Components depend on typed domain models and repository interfaces, not Supabase calls or inline mock arrays.

**Expected domains:** products, stores, drops, discovery modules, local buyer state, seller products, enquiries, verification, and order intents.

**Implications:**

- Mock repositories power every route and state during UI approval.
- Repository methods return defined success/error/state shapes.
- Later Supabase repositories implement the same contracts.
- Presentation components do not know table names or query syntax.

## PD-025 — Build UI with mocks before Supabase

**Decision:** Production UI and all required states are implemented against mock repositories first. Supabase begins only after a separate approval.

**Why:** This is explicitly required by the supplied product and UI briefs and reduces the risk of encoding unresolved product choices into the schema.

**Implications:**

- No authentication, database, storage, RLS, edge function, or production project changes during UI phase.
- Use representative but clearly fictional mock content; never present it as live platform evidence.
- UI review must include desktop, mobile, accessibility, error, sparse, and unavailable states.

## PD-026 — Preserve the immutable brand and currency conventions

**Decision:** Brand/logo assets are not redrawn or altered. Customer-facing currency uses `K` without decimals by default unless actual price precision requires them.

**Implications:**

- `K350`, not `ZK350`, `ZMW 350`, `$350`, or `K 350` unless an approved style change says otherwise.
- If no approved logo file exists, use a text wordmark.
- Supplied 3D logo art is not a production brand mark.
- No unsupported superlative or slogan becomes brand copy.

## PD-027 — Make accessibility and low-data behavior release criteria

**Decision:** WCAG 2.2 AA, keyboard/screen-reader operation, reduced motion, responsive image delivery, and weak-network recovery are part of completion—not optional polish.

**Implications:**

- 44px design target for interactive controls.
- Single-pointer alternative to drag/swipe.
- Visible focus, correct semantics, contrast, 200% zoom/reflow.
- Above-fold LCP image prioritized; below-fold images lazy-loaded with correct responsive sizing.
- Explicit offline, failed-image, upload-retry, and partial-data states.

## PD-028 — Use the approved TypeScript/Next/Tailwind/Supabase stack

**Decision:** Use TypeScript, React with Next.js App Router, Tailwind CSS, and Supabase/PostgreSQL. Use WhatsApp deep links for the MVP rather than the WhatsApp Business API.

**Why:** This is the stack explicitly selected by the product owner. It is adequate for responsive UI, server-rendered public catalog surfaces, typed repository boundaries, seller authentication, relational catalog data, object storage, secure server-side order-intent creation, and a lightweight external handoff.

**Implications:**

- Production source is TypeScript; avoid an untyped JavaScript parallel architecture.
- Next.js owns routes, server/client boundaries, metadata, and image policy.
- Tailwind expresses the approved semantic design tokens and responsive system; utility classes do not excuse inconsistent component semantics.
- Supabase integration waits for UI approval, then follows reviewed migrations, RLS, seller-only auth, Storage policies, server-only privileged operations, and secure environment handling.
- WhatsApp Business API, automated messaging, payments, and delivery remain outside the MVP.

## PD-029 — Use ranked visual autosuggest inside Discover

**Decision:** The Discover search system provides typed, grouped suggestions for products, stores, categories, vibes, and current Drops. Its Home-page search entry uses the same ranked visual suggestion contract and sends a submitted query into `/discover`; it is an invocation of Discover, not a separate search destination. Rows use real entity imagery and useful metadata; an exact or prefix store/product name outranks weaker contextual matches.

**Why:** A buyer who types a known store such as `NOIR` should recognize its avatar and current pieces immediately, then navigate directly without a search-results detour. This makes Search-inside-Discover an intentional information architecture rather than a removed navigation item.

**Implications:**

- Begin suggestions at two characters, debounce requests, and cancel stale work.
- Suggest only orderable products, active stores, and live Drops; never invent popularity.
- Preserve direct entity links plus one truthful “See all results” path.
- Use a typed async source contract so mock lookup can later become a repository/server search without rewriting the interaction.
- Support combobox/listbox semantics, Arrow Up/Down, Enter, Escape, predictable Tab behavior, visible focus, and match highlighting.
- Product suggestions include image, store, price, and availability; store suggestions include avatar, location, and real category context.

## PD-030 — Recompose Store Detail into a true wide split layout

**Decision:** At wide breakpoints the Store Detail hero is a centered split composition: a dominant editorial cover on the left and an integrated store identity/action/fulfilment column on the right. Both columns form one intrinsic-height section with one bottom edge; Shop / Drops / About follows that section in normal document flow and never intersects it. Compact layouts retain the stacked cover/avatar flow.

**Implications:**

- Use the 1440px page system with 32–48px desktop gutters and an approximately 1.55fr / 0.75fr split.
- Keep avatar, location, proposition, category links, exact verification, contact/share actions, and—where height permits—real fulfilment summaries in the identity column.
- Place Shop/Drops/About directly beneath the full hero, aligned with the same container.
- Never create a giant floating identity card or leave the desktop right side as unused whitespace.
- At constrained laptop widths, omit optional preview detail before allowing clipping or internal hero scrolling.

## PD-031 — Add an earned, native-first web-app install experience

**Decision:** SOKOZA may offer installation only after a return visit or meaningful shopping engagement. Supported browsers use their native PWA prompt; iPhone/iPad users receive contextual Safari Home Screen instructions. No APK is distributed.

**Implications:**

- Never show an install modal on entry, during order review, or over a product/Cart decision region.
- A dismissal suppresses the floating suggestion for 21 days; Settings retains the action when the platform can actually use it.
- Detect installed/standalone state and stop prompting after installation.
- Cache only versioned static framework assets. Product, store, price, availability, images, API data, and navigations remain network-driven.
- The manifest uses approved brand colors and copy. Because no approved square SOKOZA icon was supplied, the icon field remains intentionally absent until brand provides it; do not derive one from the 3D reference or text wordmark.
- Installation is an access convenience, not an “app download” claim and not a substitute for offline catalog integrity.

## Canonical terminology

| Use | Do not use in MVP |
|---|---|
| Order enquiry | Completed order, purchase |
| Review order | Checkout |
| Open WhatsApp | Place order |
| Buyer marked enquiry sent | Order confirmed |
| Item value / Subtotal | Total across sellers |
| Confirmed today / within 3 days | Guaranteed in stock |
| WhatsApp number verified | Trusted seller |
| Identity verified | Authentic seller/product |
| Delivery arranged with seller | SOKOZA delivery |
| Enquiries | Sales |
| Selected by SOKOZA | Trending, unless data-defined |

## Canonical MVP surface list

### Buyer/public

- Home
- Discover
- Stores directory
- Store profile
- Discover search, grouped suggestions, results, filters, and sort
- Product detail
- Live Drop detail
- Cart grouped by seller
- Seller-specific Order Review
- Saved
- Recently Viewed
- Enquiries
- Profile/Settings/Help/Safety/Sell entry

### Seller

- Authentication and recovery
- Store setup and preview
- Verification
- Product list, create, edit, archive, availability refresh
- Live drop collection management
- Enquiries
- Policies/settings
- Action-focused seller home

### Operator-required, even if minimally implemented

- Seller review and status
- Listing moderation
- Reports
- Curation/feature controls
- Audit trail for sensitive decisions

## Phase gates

### UI phase may begin when

- PD-001 through PD-027 are approved or amended.
- Reference-audit synthesis is approved.
- Any official logo/brand files are supplied or text-wordmark fallback is approved.

### Supabase phase may begin when

- UI routes and state behavior are approved.
- Repository interfaces are stable enough to implement.
- Backend data/RLS plan is reviewed against the separate backend master prompt.
- Environment and target-project handling are explicitly authorized.

### Public beta may begin when

- Launch supply and freshness thresholds are met.
- Verification/moderation/reporting operations exist.
- WhatsApp handoff is tested across target devices.
- Accessibility and performance checks pass.
- Terms, privacy, seller policies, prohibited items, and marketplace disclosures receive appropriate legal review.

## Open approval questions

These are not blockers to research completion, but need a product-owner decision before the affected build phase:

1. Should the public MVP include live Drop pages, or should Drops move wholly to V1.1?
2. Which exact verification evidence will SOKOZA operationally review at launch?
3. Will SOKOZA provide seller photography assistance during the Lusaka concierge phase?
4. Which seller categories are launch priorities, and which products are prohibited or require enhanced review?
5. Does the approved official wordmark asset exist outside the supplied ZIP?

## PD-028 — Replace the Stage 1 seller workspace with Seller Studio

**Decision:** The seller product uses a light, editorial fashion-commerce workspace with a compact navigation rail/workspace bar, shared working state, image-led operating queues, complete catalog/inventory/enquiry/Store/Drop workflows, truthful insights, and direct public-Store feedback.

**Why:** The Stage 1 shell was technically coherent but visually generic, exposed implementation language, split data across isolated drafts, and left primary routes as placeholders. It did not match the quality or character of the approved buyer experience.

**Consequences:**

- `seller-redesign-audit.md`, `seller-redesign-research.md`, and `seller-design-constitution.md` govern current seller UI.
- Store readiness is a named checklist, never an arbitrary percentage.
- Every primary seller route is functional; unavailable future capability is stated rather than simulated.
- Product, inventory, enquiry, Drop, notification, preference and Store changes share one versioned adapter and record local audit events.
- Published local seller changes feed back into NOIR buyer surfaces on the same device.
- Supabase authentication, schema, RLS, Storage and cross-device persistence remain a separately authorized backend gate.

## PD-032 — Use relevance-first marketplace ranking and truthful product-view social proof

**Decision:** Search relevance remains the primary ordering constraint. Discover may re-rank eligible products with recent qualified enquiry momentum, smoothed exposure-normalized rates, saves, meaningful unique views, inventory freshness, catalog quality, bounded exploration, and seller diversity. Product Details exposes recent unique-view counts only after configurable minimum thresholds.

**Why:** Lifetime popularity and raw views create self-reinforcing winners and misleading social proof. Recent later-funnel signals are more useful, while statistical smoothing, exploration, and diversity protect new and smaller Stores.

**Consequences:**

- `marketplace-ranking-and-social-proof.md` is the governing metric/ranking definition.
- `ranking_v1` centralizes weights, priors, thresholds, freshness, exploration, and diversity.
- Raw views and meaningful unique viewers are stored and reported separately.
- Repeat sessions, detectable bots, and seller self-views are excluded from meaningful social proof where identifiable.
- Buyer Product Details shows no count below threshold and Product Cards remain count-free.
- Seller Studio receives aggregate product funnel metrics without viewer identity or purchase claims.
- Ranking and social proof read SOKOZA-owned aggregates; PostHog may analyze events but is not a serving dependency.

## PD-033 — Separate Store persistence, publication, and guided fulfilment

**Decision:** Saving Store content, publishing, pausing, and archiving are distinct authoritative operations. Seller fulfilment begins with structured Collection/Delivery choices, safe resolved templates, optional editing, and a buyer preview. The WhatsApp enquiry preview is separate and keeps order snapshot fields under SOKOZA control.

**Why:** A single mutation made valid live edits re-run publication rules, obscured create versus update behavior, and produced false/unhelpful failure feedback. Large blank fulfilment fields also forced first-time sellers to invent policy language and risk publishing private addresses or unsupported delivery promises.

**Consequences:**

- A new Store Save inserts once and returns its real ID/version; later saves are owner-scoped optimistic-version updates.
- Save never changes operating state. Publish validates readiness in PostgreSQL and succeeds before any “You’re live” UI appears.
- First creation/publication use milestone feedback; routine operations use one accessible snackbar system; pause/archive require confirmation.
- Collection only, Delivery only, or both are valid. Disabled modes have no irrelevant required fields; neither is publication-invalid.
- Published safe-content updates remain live and revalidate buyer Store surfaces immediately.
- Exact private collection points are agreed in WhatsApp; public copy exposes only area/city by default.
