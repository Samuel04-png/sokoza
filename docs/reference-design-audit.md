# SOKOZA Reference Design Audit

> Production update — Backend production integration was authorized by the product owner on 8 August 2026. References to a mock entity describe design-consistency review, not current runtime data.

**Status:** Complete design-reference audit; buyer synthesis accepted  
**Archive audited:** `sokoza design ideas .zip`  
**Audit date:** 8 August 2026

## 1. Audit scope

Every file in the supplied archive was inspected. For each screen folder, both the rendered `screen.png` and its `code.html` were reviewed; the images establish visual intent while the HTML exposes labels, navigation, colors, icon choices, layout assumptions, and hidden inconsistencies.

The archive contains reference concepts, not production specifications. Where references conflict, the permanent constitution and approved product decisions take precedence.

## 2. Artifact inventory

| Artifact | Files inspected | Role | Disposition |
|---|---|---|---|
| Discover Local Style | `discover_local_style/screen.png`, `code.html` | mobile Discover concept | Keep structure; refine density and system compliance |
| Welcome to SOKOZA | `welcome_to_sokoza/screen.png`, `code.html` | onboarding | Change substantially; optional only |
| Brand board | `chatgpt_image_aug_7_2026_10_43_02_pm.png/screen.png` | visual/motion/icon/logo mood board | Photography mood only; reject as system source |
| 3D logo render | `chatgpt_image_aug_7_2026_10_45_10_pm.png/screen.png` | brand-mark concept | Do not use as production wordmark |
| Product Details Canonical | `product_details_canonical/screen.png`, `code.html` | long mobile PDP | Keep depth and trust sequence; correct false data and layout |
| Store NOIR Profile | `store_noir_profile/screen.png`, `code.html` | store identity and catalog | Keep store framing; correct navigation/currency/trust |
| Your Cart | grouped-cart reference screen and HTML in the archive | grouped cart | Keep grouping; correct math and order semantics |
| Your SOKOZA Profile | `your_sokoza_profile/screen.png`, `code.html` | guest profile concept | Replace dashboard/card treatment |
| Product Details Refined | `product_details_refined/screen.png`, `code.html` | responsive PDP direction | Best PDP shell; combine with canonical depth |
| Hot in Lusaka Story Canonical | `hot_in_lusaka_story_canonical/screen.png`, `code.html` | immersive story | Keep visual language; defer and reduce social mechanics |
| Your SOKOZA Profile Canonical | `your_sokoza_profile_canonical/screen.png`, `code.html` | editorial guest profile | Best profile basis; fix promises/state |
| Modern Heritage design note | `sokoza_modern_heritage/DESIGN.md` | tokens and visual principles | Use selectively under permanent rules |

No archive artifact is accepted unchanged.

## 3. Cross-reference findings

### 3.1 What the references consistently get right

- Warm off-white canvas, terracotta accent, dark ink, and olive support create a distinctive alternative to generic tech-marketplace palettes.
- Fashion imagery leads. Store and product identity feel more important than platform chrome.
- Playfair/Sora/Inter can produce an editorial-but-readable hierarchy when used selectively.
- Store pages and product pages recognize that seller identity matters.
- Product discovery benefits from controlled asymmetry and strong image crops.
- The grouped Cart concept already reflects seller-specific commerce.
- The refined PDP demonstrates a credible wide-screen direction rather than merely stretching a phone layout.

### 3.2 System contradictions

| Topic | Conflicting reference behavior | Canonical resolution |
|---|---|---|
| Navigation | Reference tab counts and active destinations vary by screen | Always Home, Discover, Stores, Cart; search lives inside Discover; Stores is active on store pages |
| Currency | Some screens use `K`; NOIR uses `ZK` | Always `K350` style |
| Icons | Material Symbols, custom line icons, 3D icons, and mixed styles | Hugeicons via Iconify; Iconoir fallback; 3dicons illustrative only |
| Radius | Some concepts wrap nearly everything in large rounded cards | Architectural radius hierarchy; whitespace/dividers first |
| Trust | Fake stars, review counts, generic checks | Exact verification evidence; no ratings until defensible |
| Orders | `Send Order`, instant WhatsApp, implied tracked orders | `Review order` → intent → `Open WhatsApp`; enquiries, not completed orders |
| Social | likes, comments, follow, swipe judgments | Defer; retain only commerce-supporting, accessible forms |
| Brand | two different color palettes and a 3D wordmark | Constitution palette; approved immutable logo or text wordmark |
| Copy | “premier,” “secure the drip,” “Find it. Love it. Own it.” | Plain, specific, supportable product language |
| Desktop | mostly narrow phone exports | Recompose for wide layouts; refined PDP is directional evidence |

### 3.3 Generic symptoms and missing work by artifact

| Artifact | Generic or inconsistent symptoms | Important missing work |
|---|---|---|
| Discover Local Style | pills/circles used as default containers; generic category imagery; Material icons | wide composition, no/low inventory, result destinations, image failure |
| Welcome | stock-like hero treatment, generic marketplace slogan, oversized rounded CTA | optional/skip logic, deep-link bypass, location and WhatsApp education |
| Brand board | Tinder hearts, mixed icons, four-tab nav, alternate palette/type | production tokens, accessibility, commerce states, official logo status |
| 3D logo render | dimensional startup-logo treatment when used as utility branding | approved vector/wordmark variants and ownership confirmation |
| Product canonical | fake stars/reviews, mismatched product content, cramped export | freshness, condition, variant errors, price changes, wide layout |
| NOIR store | generic verification/follow pattern, wrong nav/currency | About/policies, reporting, suspended/closed/empty states, wide layout |
| Cart | hardcoded wrong total, borrowed slang, `Send Order` | item controls, unavailable/change states, one-seller review and fallbacks |
| Profile | rounded KPI dashboard, recommendation promise | guest/local persistence explanation, enquiries, privacy/help states |
| Product refined | generic shipping/returns accordion and excessive lower whitespace | transaction truth, content depth, unavailable/stale states, Add to Cart |
| Hot in Lusaka | copied story engagement controls and generic blue check | pause/keyboard/reduced motion, publishing policy, expiry, moderation scope |
| Profile canonical | aesthetically stronger but still generic account/order promises | Recently Viewed, local state, enquiry status, seller workspace switch |
| Modern Heritage note | roundedness and motifs risk becoming a theme kit | semantic/accessibility tokens, components, states, responsive rules |

## 4. Detailed artifact review

### 4.1 Discover Local Style

**Observed design**

A long compact layout opens with the SOKOZA wordmark, location, a large `Discover` title, a pill-like search control, an asymmetric `Shop by Vibe` bento, circular categories, large store features, a `Made in Zambia` image-led feature, and a persistent bottom navigation.

**Keep**

- Strong title and location orientation.
- Search near the top.
- Shop by Vibe as an image-led, asymmetric editorial entry.
- Store discovery as a first-class module.
- Made in Zambia / Made Here as a meaningful merchandising dimension.
- Search placed prominently within Discover.

**Change**

- Reduce the dominance of very large store cards on small screens so more than one useful decision appears per viewport.
- Convert circular generic categories into clearer labeled controls with larger reliable hit areas. Circular crops can hide garments and are better suited to avatars than categories.
- Make every module's destination clear: products, stores, category, vibe, or collection.
- Replace Material Symbols with the approved icon registry.
- Use a search control with visible accessible text and durable Discover query state.
- Design wide-screen Discover as a composed editorial grid with adjacent utilities, not a centered narrow column.

**Remove/avoid**

- Repeated decorative pill shapes.
- Any empty or repeated editorial module used merely to make the page feel busy.

**Canonical use**

This is the strongest Discover reference. Preserve its section-level concept, then apply the design system, responsive composition, and current product scope.

### 4.2 Welcome to SOKOZA

**Observed design**

Full-bleed fashion photography supports a three-step introduction. Copy describes SOKOZA as “Zambia's premier fashion discovery marketplace” and uses “Find it. Love it. Own it.” A large rounded action advances the slides.

**Keep**

- Photography-first introduction.
- Maximum of three concise moments.
- A clear skip action.
- One primary action at a time.

**Change**

- Make onboarding optional and show it only when it provides immediate value, such as location choice and a concise explanation of seller-led ordering.
- Replace broad marketing with product truth: local fashion, current stores, order enquiry via WhatsApp.
- Avoid requesting notification, account, or contact permissions before their value is clear.
- Replace Material Symbols and oversized pill styling.

**Remove**

- “Zambia's premier” unless independently supportable.
- “Find it. Love it. Own it.” as a production slogan.
- Any implication that an item is owned immediately after discovery.

**Canonical use**

Treat as optional first-run education, not a gate. A shared product link must never be intercepted by a compulsory carousel.

### 4.3 Brand board

**Observed design**

The board contains a separate rust/green palette, Clash Display, a dimensional logo, hand-drawn or mixed icons, full-bleed photography, rounded controls, a four-item navigation, and a Tinder-like swipe motif with hearts.

**Keep**

- Photography should feel tactile, styled, and culturally located.
- The product can be expressive without gradients or neon.
- Terracotta and olive are compatible complementary accents.

**Change**

- Reconcile all colors and typography to the constitution.
- Replace custom/mixed interface icons with Hugeicons-first registry.
- Translate swipe imagery into the finite, optional Vibe Check experiment only.

**Remove/reject**

- Four-tab navigation.
- Hearts as primary marketplace semantics.
- Clash Display as a new production type dependency.
- Rounded-everything behavior.
- This board's logo as an authority over the official wordmark.

**Canonical use**

Photography and overall warmth only. It is not a design-system specification.

### 4.4 3D logo render

**Observed design**

A dimensional, textured SOKOZA wordmark is presented as a visual asset.

**Keep**

- It may inform campaign mood if brand leadership later approves it as campaign artwork.

**Remove/reject**

- Do not use it as the header wordmark, app mark, favicon, loading icon, or basis for a reconstructed logo.
- Do not create matching 3D interface elements.

**Canonical use**

None in production UI without explicit brand approval. Use the approved immutable asset; if unavailable, render a text wordmark.

### 4.5 Product Details Canonical

**Observed design**

A deep mobile PDP includes gallery, store identity, title and price, star rating, color and size controls, Delivery & Collection, seller information, customer reviews, and a sticky `Add to Cart` / WhatsApp action region.

**Keep**

- Long-form product depth.
- Seller identity near the product header.
- Visible color and size controls.
- Delivery & Collection before the end of the page.
- Seller module and policies.
- Sticky mobile decision support when it does not cover content.

**Change**

- Align product imagery, title, color, and metadata to the same actual item.
- Put condition and freshness alongside the decision data.
- Change fulfillment text to seller-provided facts; WhatsApp is the enquiry channel, not itself a fulfillment method.
- Replace the immediate generic WhatsApp button with validated Add to Cart / Review order behavior.
- Add unavailable/disabled variant states and size guidance.
- Recompose at realistic mobile widths; the supplied narrow export is too compressed to define production spacing.
- Replace Material Symbols.

**Remove**

- Fake star ratings, review counts, and customer review content.
- Duplicate primary actions that allow WhatsApp to bypass size/variant validation.
- Any `Shipping & Returns` language unless a seller actually provides shipping and a return policy.

**Canonical use**

Use its content depth and trust sequence beneath the refined PDP's stronger responsive shell.

### 4.6 Store NOIR Profile

**Observed design**

The store page uses a strong cover, circular avatar, identity details, verification mark, tabs, follow/action controls, and a product grid. The bottom navigation has only Discover, Search, Cart, and Profile; Search appears selected. Prices use `ZK`.

**Keep**

- Strong store cover/avatar identity.
- Store proposition and service location.
- Shop / Drops / About structure.
- Product grid attached to store identity.
- Direct seller contact as a contextual action.

**Change**

- Restore the canonical four-item navigation and mark Stores active.
- Format prices with `K`.
- Replace generic verification with an exact level.
- Add seller policies, availability expectations, join date, report action, and clear WhatsApp boundary.
- Use real product imagery and ensure each card includes consistent minimum data.
- Defer Follow until it produces an actual saved relationship and useful notification behavior.

**Remove**

- Profile as a primary navigation replacement.
- Vague checkmark or “trusted” implications.
- Any fake follower/product/review metrics.

**Canonical use**

This is the best store identity reference, once its system and trust errors are corrected.

### 4.7 Your Cart

**Observed design**

Items are correctly grouped under NOIR and KicksZM, with subtotals and seller-specific actions. The screen displays a combined `K1,950` although the visible group subtotals total K1,900. It uses `Send Order` and the phrase “Ready to secure the drip?”

**Keep**

- Seller grouping.
- Seller-specific action for each group.
- Item, variant, and price visibility.
- Compact mobile hierarchy.

**Change**

- Correct all calculations and derive values from data, never hardcoded text.
- Label monetary grouping `Item value` or `Subtotal`.
- Replace `Send Order` with `Review order`.
- Add change/remove/save actions and clear unavailable, price-changed, stale, and suspended-seller states.
- Show item and seller counts instead of a misleading cross-seller grand total.
- Preserve other sellers' groups after one group moves to order review.

**Remove**

- “Ready to secure the drip?”
- Any universal checkout implication.

**Canonical use**

The grouping model is correct and should survive. The transactional wording and arithmetic must not.

### 4.8 Your SOKOZA Profile

**Observed design**

This earlier profile uses a series of large rounded modules and KPI-like panels. Copy says “Keep Your Style With You” and mentions personalized recommendations.

**Keep**

- Access to saved content, recently viewed items, preferences, support, and seller entry.
- Clear guest/account education.

**Change**

- Use an editorial list rather than a generic SaaS dashboard.
- Explain what is stored on the device and what an optional future account would add.
- Reduce visual containers and unnecessary metrics.

**Remove**

- Personalized-recommendation promises in the MVP.
- Generic KPI cards and excessive rounded panels.
- Any order-tracking promise.

**Canonical use**

Use only as a functional inventory of possible profile links. Prefer the canonical profile's visual direction.

### 4.9 Product Details Refined

**Observed design**

A more mature responsive PDP uses a strong gallery, seller/title/description/price stack, visible color swatches and size controls, store module, detail accordions, Complete the Fit, and a sticky `Order on WhatsApp` action. The wide layout has a clearer image/information split.

**Keep**

- Best overall PDP hierarchy.
- Strong responsive gallery/decision split.
- Visible rather than hidden variant choices.
- Seller module and progressive product details.
- Editorial related-product potential.

**Change**

- Add `Add to Cart` as the normal path and make direct review validate choices.
- Insert condition, freshness, and fulfillment earlier.
- Fill the lower page with meaningful product measurements, seller policies, and related inventory—not whitespace.
- Adapt Complete the Fit into a later accessible, seller-aware form.
- Replace generic `Shipping & Returns` with `Delivery & Collection` and actual seller policy.
- Ensure the sticky column/action remains usable at zoom and on shorter screens.

**Remove**

- Immediate `Order on WhatsApp` if required variants are unresolved.
- Any policy title that implies SOKOZA-controlled shipping or returns.

**Canonical use**

This is the primary PDP shell. Combine it with the canonical PDP's longer content sequence and the approved product semantics.

### 4.10 Hot in Lusaka Story Canonical

**Observed design**

An immersive fashion image supports story progress, seller identity, product tag, action controls, and social affordances including like/comment/share.

**Keep**

- Full-screen visual impact.
- Story progress and direct product/store route.
- Visible close and navigation controls.
- Seller attribution.

**Change**

- Defer to V1.1 after content operations are proven.
- Make story selection explicitly editorial.
- Add pause behavior, keyboard support, accessible progress, reduced motion, and non-gesture alternatives.
- Ensure the product tag does not obscure key garment content.
- Use current product availability and sold-state handling.

**Remove**

- Comments and public likes in early versions.
- Generic blue verification.
- Autoplay behavior that cannot be paused.
- “Hot” interpreted as fabricated algorithmic popularity.

**Canonical use**

Preserve the immersive commerce-story art direction for a later managed pilot.

### 4.11 Your SOKOZA Profile Canonical

**Observed design**

The canonical profile uses a restrained editorial composition, fewer enclosing cards, saved/profile functions, and clearer hierarchy. It still refers to tracking orders and implies account-like continuity that the MVP does not provide.

**Keep**

- The editorial hierarchy and reduced container count.
- Simple grouped navigation.
- Clear Saved and selling entry points.

**Change**

- Use `Enquiries`, not orders.
- Add Recently Viewed.
- Distinguish local-device state from signed-in seller state.
- Provide Help, Safety, Terms, Privacy, location, and data controls.
- Explain optional future account value without blocking the guest.

**Remove**

- Order tracking promise.
- Recommendations claim before implementation.

**Canonical use**

This is the preferred profile basis.

### 4.12 Modern Heritage `DESIGN.md`

**Observed direction**

The note proposes a warm neutral/terracotta/olive palette, Playfair/Sora/Inter, an 8px base, editorial asymmetry, tactile imagery, restrained shadows, rounded elements, and stitch/weave motifs.

**Keep**

- Palette: `#FCF9F8`, `#A43619`, `#C54E2F`, `#556436`, `#1C1B1B`, `#F6F3F2`.
- Playfair/Sora/Inter roles.
- Base-8 rhythm.
- Editorial asymmetry on discovery surfaces.
- Tactile, photography-led visual direction.
- Restraint in shadows.

**Change**

- Apply the permanent radius hierarchy instead of generalized roundedness.
- Use motifs only in approved campaign art or nonfunctional illustration, not utility icons or borders.
- Define accessible semantic tokens and states beyond the mood palette.
- Add responsive, accessibility, state, and performance behavior.

**Remove/reject**

- Stitch/weave utility icons.
- Ornament that competes with actual Zambian fashion imagery.
- Any interpretation of “heritage” as a visual stereotype.

**Canonical use**

This note is the strongest foundation reference, subordinate to the permanent constitution and the approved design strategy.

## 5. Canonical synthesis by surface

| Surface | Primary reference | Secondary reference | Final direction |
|---|---|---|---|
| Home | no complete reference | Discover + Modern Heritage | new composition using Fresh Today, drops, stores, vibes, Made Here |
| Discover | Discover Local Style | Modern Heritage | preserve editorial modules; add ranked visual entity suggestions and fix density/system/responsive behavior |
| Product detail | Product Details Refined | Product Details Canonical | refined shell + canonical depth + approved trust/order semantics |
| Store | Store NOIR Profile | Modern Heritage | retain compact identity/tabs; add original cover/identity split for laptop and desktop; fix nav/currency/verification/policies |
| Cart | Your Cart | product decisions | retain grouping; rebuild math/states/wording |
| Profile | Profile Canonical | earlier Profile functional list | editorial list with guest/local clarity and enquiries |
| Hot in Lusaka | Story Canonical | accessibility strategy | V1.1 managed shoppable story, no comments/likes |
| Onboarding | Welcome | product research | optional 2–3 moment education with truthful copy |
| Seller workspace | no adequate visual reference | design strategy | design new action-focused work UI |

## 6. Missing references that require original design

The archive does not adequately specify:

- Home as a complete page.
- Stores directory.
- Discover focused-search, grouped suggestions, results, filtering, sort, and no-results recovery.
- Drop detail and seller drop management.
- Order Review and WhatsApp fallback/return states.
- Saved, Recently Viewed, and Enquiries.
- Seller authentication, onboarding, verification, product editor, inventory, enquiries, and settings.
- Operator moderation and curation.
- Wide layouts for most buyer pages.
- Loading, empty, error, offline, stale, suspended, conflict, and upload-recovery states.

These should be designed from the approved product and design documents, not invented by extending screenshot patterns mechanically.

## 7. Production guardrails derived from the audit

1. Screenshots are mood and hierarchy evidence, not source code to paste.
2. Reference HTML must not be promoted to production; it uses inconsistent icons, dimensions, data, and semantics.
3. No fake product ratings, seller counts, availability, discount, engagement, or totals survive.
4. Every product image, title, variant, price, and seller must describe the same mock entity.
5. Every wide layout receives a deliberate composition.
6. The canonical four-item navigation is never reinterpreted per screen; search remains inside Discover.
7. WhatsApp appears only after a coherent seller-specific flow.
8. The approved wordmark and Hugeicons-first system replace reference brand/icon improvisation.
9. Editorial asymmetry ends where structured comparison begins.
10. Sparse or missing data receives an honest state, not filler.

## 8. Audit conclusion

The archive contains a compelling seed: warm editorial art direction, fashion-led discovery, strong store identity, and a socially familiar commerce handoff. Its best parts can become a distinctive product only after correcting inconsistent navigation, currency, iconography, fabricated trust, rounded-card excess, transaction wording, and incomplete responsive/state design.

The approved synthesis should be:

- Discover from `Discover Local Style`;
- PDP shell from `Product Details Refined` plus content depth from `Product Details Canonical`;
- store identity from `Store NOIR Profile`;
- seller grouping from `Your Cart`;
- profile composition from `Your SOKOZA Profile Canonical`;
- later immersive storytelling from `Hot in Lusaka Story Canonical`;
- palette/type/rhythm from `Modern Heritage`, governed by the permanent constitution.

The buyer UI follows this synthesis. The final buyer amendments add one shared visual autosuggest system invoked from Home and Discover, a genuinely recomposed Store Detail desktop layout whose complete cover/identity/fulfilment hero precedes its tabs in normal flow, and an earned native-first install experience. These additions are original production design because the archive contains no adequate search-suggestion or PWA reference and no complete wide Store Detail reference. They inherit the approved palette, type, radius, evidence, and accessibility rules rather than extrapolating the screenshot HTML.

Seller implementation and backend integration remain gated by their separate approved plans and explicit authorization.
