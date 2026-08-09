# SOKOZA Design Strategy

> Production update — Backend production integration was authorized by the product owner on 8 August 2026. Earlier mock-first/Supabase-gated language records the completed design phase and no longer limits production implementation.

**Status:** Accepted design source of truth; buyer navigation amended 8 August 2026  
**Applies to:** Buyer, seller, operator, responsive web, sheets, dialogs, empty/error/loading states  
**Design thesis:** A tactile Zambian fashion editorial with the clarity of a serious marketplace.

## 1. Strategic direction

SOKOZA must feel more considered than social classifieds without feeling distant, exclusive, or artificially luxurious. Fashion imagery supplies expression; the interface supplies confidence.

The experience should combine:

- **Editorial character** in Home, Discover, Drops, stories, and campaigns.
- **Marketplace rigor** in search results, product details, cart, order review, and seller tools.
- **Local warmth** through real stores, real photography, place, language, and seller identity.
- **Operational honesty** through explicit freshness, condition, verification, and WhatsApp boundaries.

The interface is not a gallery pasted onto generic rounded cards. It is a coherent system in which editorial composition becomes more restrained as the user's task becomes more transactional.

## 2. Experience principles

### 2.1 Product first

Photography, price, available size, seller, and freshness should answer the buyer's first questions. Decorative chrome must not compete with the item.

### 2.2 Editorial, not ornamental

Asymmetry is reserved for discovery and storytelling. Product comparison surfaces use consistent grids and stable data placement. Serif display type marks moments of identity; it does not make routine form labels harder to scan.

### 2.3 Trust is evidence

A checkmark is not decoration. Every badge has a specific meaning and explainer. Ratings, scarcity, popularity, and countdowns appear only when based on real data.

### 2.4 Conversation with preparation

WhatsApp is not a generic green escape button. SOKOZA prepares a seller-specific enquiry, preserves a reference, and explains what remains to be arranged.

### 2.5 Guest by default

Browsing, saving locally, recently viewed, cart, and order enquiry work without buyer registration. Authentication is for sellers in the MVP. Optional buyer identity may arrive later for sync or following.

### 2.6 Reach over spectacle

The experience must remain useful on smaller screens, mid-range Android devices, intermittent connections, keyboard input, screen readers, and reduced-motion settings.

### 2.7 No generic generated-product aesthetic

Avoid gradients used as decoration, glass blur, neon, excessive pills, oversized radii, floating cards, fake dashboards, emoji icons, sparkle symbols, and made-up “AI” affordances. These patterns dilute the brand and often obscure hierarchy.

## 3. Brand expression

### 3.1 Personality

SOKOZA is:

- assured, not boastful;
- fashion-aware, not fashion-exclusive;
- energetic, not frantic;
- locally grounded, not stereotyped;
- modern, not generically technological;
- warm, not cute;
- direct, not slang-dependent.

Avoid unproven superlatives (“premier,” “number one”), forced youth slang (“secure the drip”), and generic slogans (“Find it. Love it. Own it.”). Product language should help someone discover or act.

### 3.2 Wordmark and brand assets

The official SOKOZA wordmark is immutable. If an approved asset is unavailable, render `SOKOZA` as text rather than reconstructing, tracing, extruding, or stylizing a reference logo. The supplied three-dimensional render is reference imagery, not the official production wordmark.

### 3.3 Color system

The permanent constitution and the supplied design document support this foundation:

| Token | Value | Use |
|---|---:|---|
| `canvas` | `#FCF9F8` | main warm background |
| `surface` | `#FFFFFF` | focused utility surfaces where separation is needed |
| `surface-subtle` | `#F6F3F2` | grouped controls, quiet sections, skeletons |
| `ink` | `#1C1B1B` | primary text/icons |
| `ink-muted` | derived accessible neutral | secondary metadata |
| `terracotta-700` | `#A43619` | primary action, active state, links |
| `terracotta-600` | `#C54E2F` | selected/expressive accent where contrast permits |
| `olive-700` | `#556436` | Made Here, positive/confirmed status, complementary accent |
| `border` | derived warm neutral | dividers and input boundaries |
| `danger` | accessible deep red distinct from brand terracotta | destructive/error state |
| `focus` | high-contrast system token | visible keyboard focus |

Rules:

- Never rely on color alone for availability, selection, error, or verification.
- Run actual foreground/background combinations through WCAG contrast checks; palette values do not grant automatic accessibility.
- Keep terracotta for decisions and identity, not every icon and label.
- Use olive deliberately for local/made-here or success contexts, not as a second primary CTA color.
- Do not introduce purple, cyan, neon, iridescence, or glass effects.

### 3.4 Typography

| Role | Family | Guidance |
|---|---|---|
| Editorial display | Playfair Display | campaign headings, select page titles, large story statements |
| Brand/product heading | Sora | navigation, product names, store names, section labels, buttons |
| Utility/body | Inter | descriptions, metadata, forms, tables, help, seller tools |

Recommended discipline:

- Use Playfair sparingly. It should signal fashion editorial, not turn all headings into a luxury-magazine imitation.
- Keep product titles and operational headings in Sora for clarity.
- Keep body copy at 16px on primary reading surfaces; avoid 12px except concise noncritical metadata with adequate line height.
- Prefer sentence case. Uppercase is limited to short eyebrow labels with tracking.
- Use tabular numerals for prices, quantities, and seller dashboard figures.
- Prevent layout shifts by self-hosting or using framework font optimization and well-matched fallbacks.

## 4. Spatial and shape system

### 4.1 Base spacing

Use an 8px base with 4px half-steps:

`4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96`

The scale creates rhythm; it is not a reason to pad every container. Editorial pages may use generous section spacing, while seller tables and forms remain compact enough for work.

### 4.2 Radius hierarchy

| Element | Radius |
|---|---:|
| Editorial image edge / layout block | `0` |
| Tag or compact label | `4px` |
| Button, input, selector | `6–8px` |
| Product/store utility card | `8–10px` |
| Dialog/sheet | `12–16px` |
| Avatar, status dot, true pill | full |

Do not place every section in a rounded rectangle. Prefer whitespace, type, image crops, alignment, and thin dividers. Shadows are rare and functional: elevated sheets, sticky action regions over moving content, and focused overlays. Use borders or tonal changes elsewhere.

### 4.3 Page containers and responsive grid

Recommended starting system, to validate in implementation:

- Small mobile: 16px outer gutter.
- Large mobile/tablet: 24px gutter.
- Desktop: 32–48px gutter.
- Editorial content max width: approximately 1440px.
- Reading/form content max width: 640–760px.
- Desktop grid: 12 columns with consistent gaps.

Breakpoints should follow layout failure, not device labels. The practical modes are:

- **Compact:** bottom navigation, single-column flows, sheets, two-column product grid where item width remains usable.
- **Medium:** wider grids, persistent filter controls where space permits, split seller forms.
- **Wide:** persistent header, multi-column editorial composition, 7/5 product-detail split, sidebar filters, seller side navigation.

Desktop must recompose information. It must not merely widen mobile cards.

## 5. Image and content art direction

### 5.1 Photography hierarchy

1. Actual product image.
2. Seller-created lifestyle/editorial image tied to current inventory.
3. Store portrait, workspace, or environment.
4. Purposeful operator photography for campaigns.

Avoid generic stock models, unrelated AI fashion imagery, blurred placeholders masquerading as products, and photographs that hide condition or proportions.

### 5.2 Product image standards

- Publish requires at least two images of the actual item.
- Encourage 3–5: full view, alternate/back, fabric/detail, tag/measurement, visible flaw.
- First image must clearly identify one product or a clearly sold set.
- Variant imagery must match the selected color where supplied.
- Do not crop out crucial garment shape on the product grid.
- Use a consistent grid ratio—prefer `4:5` for apparel—while the PDP gallery can preserve controlled alternate ratios.
- Show condition faithfully. Do not retouch away defects.
- Detect or moderate watermarks, price overlays, phone numbers, collages, and unrelated promotional graphics.

### 5.3 Editorial crops

Home and Discover may use portrait, landscape, and tall story crops to create rhythm. Every editorial tile must still have a text label, legible contrast, and a clear destination. Image text must not be the only source of information.

### 5.4 Empty imagery

Do not fill empty states with random 3D icons or AI illustrations. Use concise type, a Hugeicon, and a next action. 3dicons are reserved for genuinely illustrative, noninteractive moments and must never replace product imagery or interface icons.

## 6. Icon system

Hugeicons through Iconify is the primary interface family. Iconoir is a fallback only when the required concept does not exist. The installed Iconify set exposes Hugeicons as a 24px stroke-oriented collection. [Iconify Hugeicons package](https://www.npmjs.com/package/%40iconify-json/hugeicons), [Hugeicons documentation](https://hugeicons.com/docs)

Implementation rules for the later UI phase:

- Create one typed icon registry mapping semantic names (`home`, `discover`, `store`, `search`, `cart`, `save`, `share`, `filter`, `back`, `more`, `warning`) to library identifiers.
- Components consume semantic icon names; they do not scatter raw collection strings.
- Default to the Hugeicons outline/stroke style at a visually consistent weight and 20–24px glyph box for standard controls; use 18–20px inside compact labeled buttons.
- An active navigation item may use the matching filled/solid glyph only when the geometry is a true pair. Otherwise keep the outline glyph and use label weight plus an accessible indicator; never swap to a different metaphor.
- Do not mix outline and filled styles randomly within one control group. Destructive and status icons do not become filled merely to create emphasis.
- Icons supporting critical actions include visible text unless universally understood and contextually obvious.
- Icon-only controls have accessible names and at least a 44px hit area.
- No Material Symbols, emoji, ad-hoc SVGs, or platform-inconsistent mixes.
- Brand marks are never substituted by an icon.

## 7. Navigation strategy

### 7.1 Mobile

The four persistent top-level destinations are Home, Discover, Stores, and Cart. Each has an icon and one-word label. Search is a prominent capability inside Discover, not a separate destination. The current location is indicated by more than color alone. Profile uses the header avatar.

The bottom bar:

- remains consistent across top-level views;
- does not become a toolbar for contextual actions;
- is hidden only for self-contained overlays or immersive story viewing;
- reserves badges for meaningful counts, such as cart quantity—not generic novelty dots;
- accounts for safe-area inset and does not cover sticky purchase actions.

### 7.2 Desktop

The header preserves the same four destinations, wordmark, location, a search affordance that opens Discover search mode, seller entry, and profile/avatar. Cart remains a destination rather than a popover-only experience.

### 7.3 Contextual navigation

- Back controls reflect history and have a stable fallback.
- Sheets use explicit titles and close controls.
- Store tabs are secondary navigation within a store; they never replace or relabel the primary navigation.
- Filter/sort controls persist in results state and show active counts.

## 8. Page composition

### 8.1 Home

Recommended order:

1. Compact identity/location header and a search entry that reuses Discover’s ranked visual entity suggestions before routing submitted queries into Discover.
2. Hot in Lusaka rail only when a current curated story exists; otherwise omit it without an empty shell.
3. Fresh Today.
4. Just Dropped.
5. Stores to Know.
6. Shop the Vibe.
7. Made Here.
8. Recently Viewed, only when locally available.
9. Wear it with / Complete the Fit in V1.1.

Use controlled asymmetry for selected hero and vibe modules. Use regular grids for product comparison. Do not show a huge introductory hero every visit if it delays current inventory.

### 8.2 Discover: browse, search, and results

Discover is browsable intent, not a duplicate Home feed:

- prominent search entry;
- Shop by Vibe as an editorial bento;
- categories and occasions;
- price entry points;
- local designers / Made Here;
- store and drop discovery;
- finite Vibe Check entry in V1.1.

Each module identifies whether it opens products, stores, a collection, or an experience. Focusing the search control changes the same surface from browse mode into focused search; it does not navigate to a competing top-level page.

Discover search should feel fast and calm:

- autofocus only after explicit entry when keyboard opening is expected;
- retain recent queries locally with a clear delete action;
- suggestions distinguish product, store, category, vibe, and live Drop through a typed entity model;
- use compact visual rows: product image/store/price/availability and store avatar/location/category context;
- rank exact entity names before prefixes, then strong catalog context; never use unsupported popularity;
- begin at two characters, debounce for roughly 150–250ms, and cancel stale requests;
- expose direct entity destinations, match highlighting, and one “See all results” path;
- implement the WAI-ARIA combobox/listbox keyboard model: Arrow Up/Down, Enter, Escape without query loss, and predictable Tab behavior;
- grouped suggestions omit empty groups and may include current Drops;
- results show query, result count, active filters, sort, and grid/list context;
- All, Pieces, and Stores tabs operate within the same `/discover` URL model;
- size and availability filters are prominent;
- applied filters are individually removable and include Clear all;
- mobile filters use a sheet with an explicit results count; desktop uses a sidebar or anchored panel.

Never erase results while applying filters without communicating loading. Preserve scroll and filter state when returning from a PDP.

### 8.3 Product cards

Minimum information:

- product image;
- store name;
- product title;
- `K` price;
- key status when necessary: sold, low stock, or recently confirmed;
- save action.

Do not show fake stars, review counts, “hot,” discount badges without a source price, or verification checks next to product titles. Condition/size may appear when they materially improve the browsing context, especially resale.

### 8.4 Product detail

Compact layout sequence:

1. gallery with position/status;
2. seller/store identity;
3. title, price, concise description;
4. condition and availability freshness;
5. optional recent unique-view social proof only when the configured evidence threshold is met;
6. color/variant and size selectors;
7. fulfillment summary;
8. primary action region;
9. details, measurements/material/care;
10. seller module and policies;
11. related products / Wear it with.

Wide layout uses a 7/5 or comparable gallery/content split, with the decision column sticky only while it remains fully usable. The gallery must not repeat the same crop at different sizes.

Variant selectors use labeled buttons or swatches paired with text. Unavailable sizes remain visible and disabled with an explanation. Baymard recommends buttons rather than ambiguous dropdowns for modest size sets. [Size-selection controls](https://baymard.com/blog/use-buttons-for-size-selection)

Primary action behavior:

- `Add to Cart` is the default when multiple products may be combined from one seller.
- `Review order` may be a direct secondary path.
- `Order on WhatsApp` is not placed beside `Add to Cart` if it bypasses required variant validation.
- A sticky mobile action area must not hide content, keyboard, error text, or bottom navigation.

Product-view social proof is subordinate to price, availability, size, seller, and order actions. It uses recent meaningful unique viewers, never lifetime totals or raw refreshable page views. Below the configured threshold the UI renders nothing. Product Cards remain count-free; a dedicated `What’s Moving` rail may appear only when recent qualified signals and current availability meet its definition.

### 8.5 Store profile

Structure:

- cover/editorial image and avatar/mark;
- store name, location, concise proposition;
- exact verification status and explainer;
- WhatsApp/contact action;
- tabs or sections for Shop, Drops, and About, rendered after the complete hero in normal flow;
- product grid with filters/sort where needed;
- fulfillment, exchange/return, and condition policies;
- report action.

On wide screens, the identity hero is a deliberate split composition inside the 1440px page system: a dominant editorial cover and a narrower identity/action column. The avatar, proposition, category context, verification, contact/share controls, and optional fulfilment preview stay visually connected. Shop/Drops/About begins directly beneath the full split. At compact breakpoints, preserve the cover-first stack and overlapping avatar; optional desktop detail must disappear before it delays the catalog or causes clipping.

Follow is V1.1. Follower counts, star ratings, sales totals, and response claims remain absent until substantiated.

### 8.6 Cart and order review

Cart groups products by seller. Each group has:

- items and selected variants;
- editable quantity only where quantity is meaningful;
- remove/save actions;
- availability/price-change state;
- seller subtotal labeled `Item value`;
- one `Review order` action.

Do not show a grand total across sellers because delivery, payment, and fulfilment are separate. A summary may state “2 sellers · 4 items” without monetarily combining them.

Order Review is a focused seller-specific surface:

- seller identity and contact;
- revalidated item snapshot;
- unresolved changes requiring acknowledgement;
- preferred delivery/collection note;
- editable buyer note;
- `Open WhatsApp` primary action;
- `Copy message` fallback;
- clear statement that availability, payment, and fulfilment are confirmed with the seller.

### 8.7 Install / Add to Home Screen

Installation is a contextual convenience, not acquisition theatre:

- offer only after the second session or meaningful engagement such as several product views, saves, or Cart activity;
- use the browser-native install prompt on supported Android/desktop browsers;
- on iPhone/iPad, show concise Safari `Share` → `Add to Home Screen` instructions and never mention an APK;
- use a compact bottom-left card above safe areas/navigation, with accessible dismissal and no focus stealing;
- suppress a dismissal for 21 days and stop all prompts in standalone display mode;
- do not show the floating suggestion on Product, Cart, Order Review, or other high-intent handoff surfaces;
- keep an action in Settings only when the platform can act;
- cache static framework assets only; dynamic catalog truth always refreshes from its source.

An official square application icon remains a brand dependency. Do not reconstruct the text wordmark or supplied 3D reference to satisfy manifest icon requirements.

### 8.8 Profile

Use a calm editorial list, not a SaaS dashboard. Guest/local profile includes:

- Saved;
- Recently Viewed;
- Enquiries;
- location and browsing preferences;
- Sell on SOKOZA;
- Help, safety, terms, and privacy;
- clear explanation of what is stored on this device.

Do not promise order tracking or personalized recommendations in the MVP. Seller identity switches into a distinct seller workspace.

### 8.9 Seller workspace

Seller screens prioritize work over editorial flourish. Use Sora/Inter, structured lists, clear forms, and restrained status color.

Seller home order:

1. setup or verification blockers;
2. urgent stale/low/unavailable inventory tasks;
3. new enquiries;
4. product publishing action;
5. factual activity metrics.

Avoid generic KPI cards. Each number needs a defined period, provenance, and action. “Product views,” “Saved,” and “Order reviews started” are valid; “Sales” and “Revenue” are not without transaction confirmation.

### 8.10 Buttons and controls

Buttons are compact decisions, not oversized decorative pills.

- **Primary:** terracotta fill, accessible foreground, 6–8px radius; one dominant primary action per decision region.
- **Secondary:** transparent or subtle surface with clear border; never visually equal to the primary by accident.
- **Quiet/text:** for reversible or low-priority actions such as Clear, Skip, or See all.
- **Destructive:** explicit label and danger treatment; confirmation only when impact is difficult to reverse.
- **Icon-only:** only for established contextual actions; 44px hit area, accessible name, tooltip on hover-capable devices.
- **Loading:** retains width and action label context, disables duplicate activation, and exposes progress semantically.
- **Disabled:** used only when the reason is apparent or explained; validation should often guide rather than silently disable.

Button labels use verbs and outcomes: `Add to Cart`, `Review order`, `Open WhatsApp`, `Publish product`, `Confirm available`.

### 8.11 Product and store cards

Product cards prioritize image, store, title, price, and necessary availability. They use consistent image ratios in comparison grids and may expand into more expressive crops only in labelled editorial contexts. Save remains a secondary action with a large hit target. The entire card must not compete with nested controls or create invalid nested links.

Store cards are visually different from product cards: cover/identity image, store mark/name, service area or style proposition, exact verification label when relevant, and a small current-inventory preview. They must not use fabricated follower, rating, or sales counts. A store card routes to the store; a contextual WhatsApp action belongs on the store page, not on every discovery tile.

### 8.12 Sheets and dialogs

Use a sheet when a compact task modifies the current context and benefits from preserving it: filters, sort, location, size guide, share, report, and a short variant choice. Use a full page when the task needs a durable URL, substantial review, multistep recovery, or keyboard-heavy entry: product, store, cart, order review, and seller product editing.

Sheets require:

- visible title and close control;
- focus containment and restoration;
- non-drag close alternative;
- stable action region that respects keyboard/safe area;
- explicit Apply/Clear behavior for filters;
- 12–16px top radii only, not a fully floating pill panel.

Dialogs are reserved for narrow confirmations, destructive choices, and blocking status—not generic detail pages.

### 8.13 Stories, Drops, and Vibe Check

**Stories / Hot in Lusaka:** Full-bleed media may temporarily hide primary navigation in the self-contained viewer. Always show close, pause, previous/next, seller attribution, and a linked product list/tag. Progress is real, finite, and pausable. The V1.1 feature excludes comments and public like counts.

**Drops:** A Drop page is store-owned editorial merchandising: cover/title, store identity, live/past status, optional seller note, and a normal product grid. MVP never shows a countdown or reminder without scheduling infrastructure. Sold items use normal sold treatment.

**Vibe Check:** V1.1 uses a finite centered card with visible `Pass` and `Keep` controls, progress count, details link, and an exit that retains saved results. Gesture rotation should be subtle; reduced motion uses direct replacement. Keep adopts the standard Save feedback. Pass is visually neutral, not punitive.

## 9. Component strategy

Build components around product semantics rather than screenshot fragments:

- `AppHeader`, `PrimaryNav`, `BottomNav`
- `ProductCard`, `ProductGrid`, `ProductGallery`
- `StoreIdentity`, `StoreCard`, `VerificationBadge`
- `Price`, `AvailabilityLabel`, `FreshnessLabel`, `ConditionLabel`
- `VariantSelector`, `SizeSelector`, `FulfilmentSummary`
- `SaveButton`, `CartGroup`, `OrderReview`
- `FilterBar`, `FilterSheet`, `AppliedFilters`, `SortMenu`
- `EditorialTile`, `DropCard`, `StoryViewer`
- `EmptyState`, `ErrorState`, `Skeleton`, `OfflineNotice`, `InlineAlert`
- seller-specific `ProductEditor`, `InventoryRow`, `EnquiryCard`, `SetupChecklist`

Seller Store setup mirrors this clarity: structured Collection/Delivery controls precede two concise editable templates and a buyer-facing preview. WhatsApp enquiry preview remains a separate block because fulfilment explains how an item is received, while the generated enquiry preserves the authoritative order reference, item, variant, quantity, and displayed price.

The components should consume typed entities and repository interfaces. Static mock data stays outside rendering components so Supabase can replace the repository later without rewriting the UI.

## 10. Interaction and motion

Motion clarifies spatial change; it does not decorate every event.

Recommended durations:

- immediate state feedback: 80–120ms;
- control and small layout transition: 140–200ms;
- sheet/dialog entry: 180–240ms;
- immersive editorial transition: up to 320ms only where orientation remains clear.

Use opacity and transforms that avoid layout thrash. Avoid continuous background movement, parallax, elastic overshoot, and autoplay video by default.

Specific rules:

- Save and cart actions respond immediately, then reconcile failures with clear rollback.
- Swipe gestures always have visible button alternatives.
- Story progress pauses when the story is paused, obscured, or loses focus.
- `prefers-reduced-motion` removes nonessential movement and replaces swipes/transitions with direct state changes.
- Skeletons match final geometry and do not pulse aggressively.
- Never animate fake numerical growth or fabricated engagement.

## 11. Accessibility

Target WCAG 2.2 AA across customer and seller experiences. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Interaction

- Design primary touch targets at least 44×44 CSS pixels; WCAG 2.2 AA defines a 24×24 minimum with spacing exceptions, while larger targets improve mobile use. [WCAG target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [Apple accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- All functions work by keyboard and single pointer.
- Visible focus style is never removed.
- Focus returns sensibly when sheets/dialogs close.
- No drag-only, hover-only, or swipe-only action.
- Sticky UI does not obscure focused controls.

### Semantics

- Use native controls and landmarks before ARIA.
- Product cards have one clear primary link; secondary controls do not create nested interactive elements.
- Price changes, cart additions, and form errors use appropriate live announcements without excessive chatter.
- Icons have accessible names only when they carry meaning; decorative icons are hidden.
- Verification badge text remains available to assistive technology.

### Visual and content

- Contrast meets AA in actual states.
- Zoom to 200% and reflow to 320 CSS pixels without two-dimensional scrolling, except legitimate media.
- Avoid text baked into images; provide equivalent adjacent content.
- Product alt text describes the item and view, not marketing language.
- Error messages say what happened and how to recover.
- Availability and condition never rely on color alone.

### Story/carousel controls

Follow the WAI carousel pattern where relevant: named region, previous/next controls, pause behavior, keyboard access, and understandable slide changes. [ARIA carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)

## 12. Performance and low-data strategy

Fashion is image-heavy, so performance is part of the visual system.

### Image delivery

- Generate responsive image candidates and correct `sizes` attributes; sending desktop-sized images to mobile can multiply transferred data. [Responsive images](https://web.dev/articles/serve-responsive-images)
- Use modern formats where supported and preserve a reliable fallback.
- Give images intrinsic dimensions or aspect-ratio boxes to prevent layout shift.
- Prioritize the real above-fold LCP image; do not lazy-load it.
- Lazy-load below-fold images and stop fetching unseen carousel slides aggressively. [Lazy-loading guidance](https://web.dev/learn/performance/lazy-load-images-and-iframe-elements)
- Use Next.js image optimization only with explicit remote-host policy and secure configuration. [Next.js Image](https://nextjs.org/docs/pages/api-reference/components/image)

### Page behavior

- Server-render public catalog metadata where useful for first load and sharing.
- Keep client JavaScript focused on interactions; editorial pages should not hydrate every static block.
- Cache public catalog reads with an explicit freshness strategy.
- Provide useful skeletons and preserve prior results during filter transitions.
- Offer a user-controlled reduced-data setting if field research supports it; `Save-Data` can be a progressive hint but is not universally available. [Save-Data header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Save-Data)
- Never auto-play product video on cellular by default.

### Initial performance budgets — implementation targets

- Core Web Vitals in the “good” range at the 75th percentile on target mobile conditions.
- No unoptimized original product image loaded into grid thumbnails.
- Route JavaScript budgets reviewed in CI once the application exists.
- Test on a throttled mid-range Android profile and a real device before release.

These are quality targets, not claims about current performance.

## 13. State design matrix

Every major surface needs intentional states before implementation sign-off.

| Surface | Required states |
|---|---|
| Home/Discover | loading, sparse launch supply, no current story/drop, partial module error, offline cache |
| Discover search/results | empty query, recent/quick starts, grouped suggestions, loading, mixed results, no result, filtered no result, service error, offline |
| Install experience | first session, earned eligibility, native prompt unavailable, iOS instructions, dismissed, installed/standalone, storage unavailable |
| Product | available, low stock, sold, stale, variant unavailable, changed price, suspended seller, deleted/not found |
| Store | active, pending verification, temporarily closed, suspended, no products, no drops |
| Saved/Recent | empty, restored local state, removed product, unavailable product |
| Cart | empty, grouped, item changed, item removed, seller suspended, local-storage failure |
| Order Review | valid, revalidating, price/variant change, no longer available, WhatsApp unavailable, copied, open returned |
| Seller list | draft, active, stale, low stock, sold, rejected, archived, loading/error |
| Forms | pristine, partial draft, validating, upload progress, recoverable failure, success, conflict |

Sparse supply must not be disguised by fake content. Use curation, education, wait-list signals, or narrower navigation.

## 14. Content and microcopy

### Preferred language

- “Order enquiry” rather than “purchase” before seller confirmation.
- “Review order” before WhatsApp.
- “Open WhatsApp” for the outbound action.
- “Item value” or “Subtotal” before delivery/payment are resolved.
- “Confirmed today” rather than “In stock” when evidence is freshness-based.
- “Collection” and “Delivery arranged with seller.”
- `K350` price format.
- Exact verification labels.

### Avoid

- “Checkout,” “Place order,” or “Order confirmed” when only opening WhatsApp.
- “Track your orders” in a system that only records enquiries.
- “Trusted seller,” “100% authentic,” or “safe” as blanket promises.
- “Trending,” “Best seller,” or “Popular” without a defined threshold and real data.
- “Only one left” unless quantity is current and seller-confirmed.
- “Ready to secure the drip?” and other borrowed slang.
- AI, personalization, or recommendation claims before the system exists.

## 15. Design QA checklist

Before a surface is accepted:

- It follows the four-destination information architecture.
- It uses the approved wordmark handling and currency.
- It contains no fabricated commerce or social proof.
- Product/store data comes through typed repository contracts.
- Loading, empty, error, stale, unavailable, and suspended states are handled where relevant.
- It has a composed wide layout as well as compact layout.
- Keyboard, screen reader, 200% zoom, reduced motion, and 44px target checks pass.
- Focus is visible and logical through overlays.
- Images have correct dimensions, sources, alt behavior, and loading priority.
- Icons come from the centralized Hugeicons-first registry.
- Radii and shadows follow the hierarchy rather than a global card aesthetic.
- WhatsApp language distinguishes opened, sent, accepted, and completed.
- At least one target Android device and one iPhone-sized viewport have been tested.

## 16. Design approval boundary

Approval of this strategy authorizes detailed UI design and mock-repository implementation. It does **not** authorize Supabase schema changes, authentication wiring, production storage, messaging, payments, or deployment. Those remain later gates.
