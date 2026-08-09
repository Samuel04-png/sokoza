# SOKOZA Product Research

> Production update — Backend production integration was authorized by the product owner on 8 August 2026. The research conclusions remain authoritative; the historical mock-first sequencing step is complete.

**Status:** Accepted product source of truth; buyer navigation amended 8 August 2026  
**Research date:** 8 August 2026  
**Launch frame:** Zambia-first, Lusaka-first, mobile-first fashion discovery marketplace  
**Constraint:** This document defines the product contract governing UI and later Supabase implementation.

## 1. Executive recommendation

SOKOZA should launch as **the reliable discovery layer for local fashion activity**, not as a conventional checkout marketplace and not as another social feed.

Today, local fashion discovery is scattered across Instagram posts, Facebook pages, WhatsApp statuses, chats, and physical word of mouth. Those channels are socially familiar but weak at structured comparison: size, condition, stock, price, seller location, and whether an item is still available are often missing or stale. SOKOZA's first job is to make that fragmented inventory browsable and trustworthy while preserving the seller relationship. WhatsApp remains the transaction channel for the MVP.

The launch proposition is:

> Discover current fashion from local Zambian stores, confirm what is available, and send one clear order enquiry to the seller on WhatsApp.

The defensible asset is not a swipe gesture or an editorial visual style. It is a growing graph of **structured local products, recognizable stores, availability freshness, and measurable buyer intent**.

The MVP should therefore prioritize:

1. A dense, curated Lusaka catalog with consistently good imagery.
2. Search and filters that answer fashion-specific questions quickly.
3. Strong store identity and explicit, truthful trust signals.
4. Product pages that resolve size, condition, availability, collection, and delivery uncertainty.
5. A seller-specific order-review flow that creates an order intent before opening WhatsApp.
6. Lightweight seller tools for publishing and refreshing inventory.

Full social mechanics, reviews, buyer accounts, integrated payments, delivery orchestration, and recommendation claims should wait until real marketplace behavior justifies them.

## 2. Research method and evidence quality

This research combines four evidence types. They must not be treated as equally certain.

| Label | Meaning | How it is used |
|---|---|---|
| **Fact** | Supported by a cited primary or credible source | Market context and established usability constraints |
| **Observation** | Directly visible in supplied references or current competitor products | Product and interface comparison |
| **Assumption** | A plausible but unverified belief about SOKOZA's users or operations | Explicit launch hypothesis to test |
| **Recommendation** | A product choice derived from the above | Proposed scope or behavior, subject to approval |

Limitations:

- Zambia-specific fashion-commerce behavior is under-documented. National connectivity data cannot prove demand for SOKOZA.
- Some national indicators are from 2022–2025 and should be interpreted as context, not a live dashboard.
- Empor evidence is mostly founder-authored and therefore directional. The archived listing indicates that the app was no longer active by April 2026, but does not establish why.
- Baymard findings are mostly based on larger international ecommerce sites. The interaction problems are relevant; exact percentages should not be projected onto Zambia.
- Reddit and older local surveys are anecdotes only and are not used as market-size evidence.

## 3. Zambia market context

### 3.1 Facts

- DataReportal estimated **7.13 million internet users** in Zambia in early 2025, representing **33% internet penetration**, alongside 19.9 million cellular connections. It also estimated 3.70 million social-media user identities. These are modeled digital indicators, not unique verified shoppers. [Digital 2025: Zambia](https://datareportal.com/reports/digital-2025-zambia)
- The same report estimated that 47.2% of the population lived in urban centres and described a very young population. ZamStats separately reported a median age of 18.3 from the 2022 census analysis. [ZamStats analytical census report](https://www.zamstats.gov.zm/zamstats-launches-the-2022-national-analytical-census-report/)
- The U.S. International Trade Administration identifies WhatsApp as a primary channel for private and business communication in Zambia and notes that many businesses use Facebook and Instagram in place of standalone websites. It also identifies mobile money and cards among common online-payment methods. [Zambia ecommerce guide](https://www.trade.gov/country-commercial-guides/zambia-ecommerce)
- GSMA reported a substantial access gap: in 2022, 41% of people aged ten and above owned a mobile phone, but only 17.7% owned a smartphone; smartphone ownership was about 36% in urban areas and 7% in rural areas. It also reported that network coverage exceeded actual use, pointing to device affordability, skills, and cost barriers. [GSMA, Driving Digitalisation of the Zambian Economy](https://www.gsma.com/aboutus/regions/sub-saharan-africa/wp-content/uploads/2024/10/GSMA_Zambia-Report_Oct-2024_Final.pdf)
- Bank of Zambia reported that mobile-payment transaction value rose 7.6% in 2024 to K486.3 billion and volume rose 33.4% to 2.99 billion transactions. This demonstrates payment familiarity; it does not demonstrate appetite for marketplace checkout. [Bank of Zambia 2024 National Payment Systems Report](https://www.boz.zm/2024NPSAnnualReport.pdf)
- ZamStats' 2022 Living Conditions survey reported a large urban/rural income gap, with average monthly household income of K5,546.60 in urban areas and K2,112.20 in rural areas. The figures are older, household-level averages and not fashion budgets, but they reinforce the need for price clarity and low-data access. [2022 Living Conditions Monitoring Survey findings](https://www.zamstats.gov.zm/findings-from-the-2022-living-conditions-monitoring-survey/)

### 3.2 Observations

- Current local digital commerce is strongly conversational. Discovery may happen publicly, while availability, negotiation, collection, delivery, and payment are resolved in private chat.
- Broad Zambian marketplaces such as [SellZM](https://sellzm.com/), [Famuza Market](https://www.famuzamarket.com/), and [Topstore eMarket](https://topstoreemarket.com/) emphasize range, listing, delivery, or payment. Their public presentation is general-marketplace rather than fashion-editorial.
- [Peza](https://www.peza.africa/) demonstrates the regional relevance of chat-led commerce, but operates as a broad marketplace rather than a structured local-fashion discovery product.
- Instagram and WhatsApp already provide audience and direct relationships. SOKOZA must improve the pre-chat decision process, not ask sellers to abandon those channels.

### 3.3 Assumptions to validate

- The initial high-intent buyer is an urban, mobile-first shopper who already discovers fashion through social media and is frustrated by repeated questions about size, stock, price, and seller legitimacy.
- Independent sellers and boutiques will keep listings fresh when the task is materially faster than reposting and responding to repeated questions.
- Buyers will accept SOKOZA as the discovery and preparation layer even when the final conversation happens in WhatsApp.
- A curated Lusaka supply base will produce more repeat value than a thin nationwide catalog.
- Image quality, current availability, and seller credibility will matter more at launch than sophisticated personalization.

### 3.4 Implications

- Launch in **Lusaka**, with location filtering designed to expand later.
- Make primary shopping useful without an account.
- Keep initial pages and images efficient on modest devices and networks.
- Show prices as `K350`, never `ZK`, `ZMW`, or dollars in customer-facing copy.
- Make collection/delivery terms explicit before WhatsApp.
- Do not imply payment protection, delivery guarantees, or completed purchases that SOKOZA does not control.

## 4. Target participants and jobs to be done

### 4.1 Primary buyer: the local style seeker

Likely profile: a Lusaka-based, socially active shopper, initially concentrated around ages 18–34 but not restricted by age or gender.

Core jobs:

- “Show me fashion that is actually available near me.”
- “Help me search by size, price, occasion, condition, and style without opening dozens of chats.”
- “Let me understand who the seller is before I contact them.”
- “Let me collect possibilities and return later without being forced to sign up.”
- “Prepare a precise message so the seller knows exactly what I want.”

Primary anxieties:

- The item was sold already.
- The listed size is ambiguous.
- The image does not represent the item.
- The seller or store is not legitimate.
- Delivery/collection will be difficult or expensive.
- The WhatsApp exchange will require repeating all product details.

### 4.2 Primary seller: the independent fashion operator

Likely profile: a boutique, thrift curator, sneaker seller, designer, tailor, accessories business, or Instagram/WhatsApp-first seller.

Core jobs:

- “Help qualified buyers find my current inventory.”
- “Reduce repetitive availability, size, and price questions.”
- “Preserve my store identity and WhatsApp relationship.”
- “Let me publish and refresh products quickly from a phone.”
- “Show me which products generate genuine enquiries.”

Primary anxieties:

- Another platform adds work but no buyers.
- Buyers send vague or unserious messages.
- Store identity is flattened into generic listings.
- An outdated listing damages trust.
- Platform metrics claim sales it cannot verify.

### 4.3 Marketplace operator/editor

Core jobs:

- Curate launch-quality supply.
- Verify sellers and resolve reports.
- Keep home and discovery surfaces fresh without fabricating popularity.
- Diagnose supply gaps by category, price, size, and location.
- Measure whether WhatsApp handoffs become genuine enquiries.

## 5. Competitive and adjacent-product findings

### 5.1 Empor: what matters and what does not

Empor was positioned as a student-exclusive marketplace around McGill University. Founder-authored material describes a fast launch, early revenue, and a concentrated student user base; another team post emphasized safer exchange inside a university community. An archived App Store record shows the app was released in 2025 and archived by April 2026. Sources: [founder launch post](https://www.linkedin.com/posts/erik-cupsa_empor-studentmarketplace-startuplife-activity-7260463099827179521-M7d5), [founder profile](https://ca.linkedin.com/in/erik-cupsa), [team trust post](https://www.linkedin.com/posts/emporca_over-the-weekend-our-team-had-the-privilege-activity-7290091774037884930-XwTY), [archived listing](https://appshunter.io/ios/app/6743862980).

Useful lessons:

- **Atomic community:** a bounded population increases relevance, density, and the chance of convenient exchange.
- **Identity can narrow uncertainty:** a known affiliation can make a marketplace feel safer, though it is not proof of honest behavior.
- **Fast validation:** a focused wedge can test whether supply and demand meet before building broad infrastructure.
- **Social discovery can make classifieds feel current:** a “For You” or “Hot” surface may increase browsing if the underlying inventory is dense.

Do not copy:

- Student exclusivity; SOKOZA's identity boundary is local fashion, not an institution.
- Swipe mechanics as the main value proposition.
- Claimed traction as a forecast for Zambia.
- Institutional identity as a substitute for marketplace safety operations.

The archive is a warning: concentrated launch energy and attractive mechanics are not themselves durable liquidity.

### 5.2 Fashion marketplaces

| Product | Useful pattern | SOKOZA adaptation | Avoid copying now |
|---|---|---|---|
| Depop | Seller-led identity, visual listings, buyer protection messaging | Preserve store voice; make seller status and item data visible | Global shipping/payment expectations SOKOZA cannot meet. [Depop buyer support example](https://depophelp.zendesk.com/hc/en-gb/articles/360001791607-The-seller-I-bought-from-is-no-longer-active) |
| Vinted | Clear condition and protection model | Use explicit condition fields and plain-language responsibilities | “Buyer Protection” without controlled payment/delivery. [Vinted safety](https://www.vinted.com/help/82-is-it-safe-to-buy) |
| StockX | Verification is a defined operational process | Name each SOKOZA verification level exactly | Generic checkmarks or authentication claims. [StockX verification](https://stockx.com/help/articles/what-does-the-verification-process-entail-for-sellers) |
| Yaga | Integrated payment, courier, and escrow create a coherent trust loop | Treat this as a later maturity benchmark | Simulating escrow or protected checkout in the MVP. [How Yaga works](https://support.yaga.co.za/hc/en-us/articles/22459331693213-How-Yaga-works) |
| ANKA | African sellers, storefronts, payment and logistics infrastructure | Validate seller operations locally before adding infrastructure | Building a continental logistics platform first. [What is ANKA?](https://support.anka.africa/en/article/what-is-anka-3m8tav/) |
| SSENSE | Editorial restraint, strong photography, product hierarchy | Use editorial typography and selective asymmetry on inspiration surfaces | Luxury distance, tiny controls, or image-heavy pages that ignore local network costs |

### 5.3 Discovery platforms

Pinterest separates inspiration from action: people can save ideas, open related products, and use visual search. Its product model shows that exploration works when each visual object remains actionable. [Pinterest visual search](https://help.pinterest.com/en/article/use-visual-search-features), [interacting with Pins](https://help.pinterest.com/en/article/interact-with-pins).

Instagram Stories show why immersive, temporary narratives are compelling, but they also create operational pressure: a story expires after 24 hours unless preserved. SOKOZA should not make sellers maintain a second daily social channel during the MVP. [About Instagram Stories](https://www.facebook.com/help/1035095153255339/)

Implication: SOKOZA should use editorial modules to route into real products and stores. It should not optimize for comments, likes, passive time spent, or endless swiping before it can reliably answer “is this item available?”

## 6. Product definition

### 6.1 Category

SOKOZA is a **local fashion discovery marketplace with WhatsApp-assisted ordering**.

It is not:

- a social network;
- a payment processor;
- a courier;
- a guarantor of completed purchases;
- a generic classifieds site;
- an AI stylist;
- a seller CRM in the MVP.

### 6.2 Value exchange

Buyer receives:

- current local inventory in one place;
- structured fashion search and comparison;
- stronger seller and product context;
- saved/recent browsing without an account;
- a prepared, precise WhatsApp enquiry.

Seller receives:

- qualified local discovery;
- a branded store surface;
- fewer repetitive pre-sale questions;
- demand signals based on product views, saves, and enquiries;
- simple inventory-refresh tools.

SOKOZA receives:

- a structured inventory graph;
- permissioned seller relationships;
- demand and liquidity signals;
- an evidence base for later payments, logistics, accounts, or recommendations.

## 7. Information architecture

### 7.1 Canonical buyer navigation

Mobile persistent navigation has exactly four destinations:

1. Home
2. Discover
3. Stores
4. Cart

Search is a first-class capability inside Discover rather than a separate destination. Profile is reached from the header avatar. Tabs remain stable across primary destinations; empty destinations explain their state instead of disappearing. This aligns with platform guidance that tab bars represent top-level areas and should remain predictable. [Apple tab bar guidance](https://developer.apple.com/design/human-interface-guidelines/tab-bars)

Desktop uses a persistent header with the same information architecture. It is a responsive composition, not a stretched phone layout.

### 7.2 Proposed routes

Public and local-state routes:

- `/` — Home
- `/discover` — browse, focused search, grouped suggestions, results, filters, sort, and no-results recovery; query/filter state is represented in the URL
- `/stores` — store directory
- `/stores/[slug]` — store profile
- `/products/[slug]` — product detail
- `/drops/[slug]` — a live seller drop collection
- `/cart` — products grouped by seller
- `/order-review/[storeId]` — one seller-specific order review
- `/saved`, `/recently-viewed`, `/enquiries`, `/profile`, `/settings`
- `/sell` — seller value proposition and authentication entry

Seller routes:

- `/seller` — action-focused home
- `/seller/products`
- `/seller/products/new`
- `/seller/products/[id]/edit`
- `/seller/enquiries`
- `/seller/store`
- `/seller/drops`
- `/seller/verification`
- `/seller/settings`

Secondary tasks such as filters, sort, size guidance, location, share, report, and sign-in may appear as sheets or dialogs on small screens, with route-safe fallbacks where deep linking matters.

## 8. Core journeys

### 8.1 Browse to WhatsApp enquiry

1. Buyer lands on Home or a shared product/store link.
2. Buyer browses Fresh Today, Just Dropped, Stores to Know, or search results.
3. Product detail resolves price, seller, images, available variants, condition, availability freshness, and seller-provided collection/delivery information.
4. Buyer selects a valid variant and adds it to the local cart or proceeds to order review.
5. Cart groups items by seller and never presents a cross-seller checkout.
6. Buyer reviews one seller group. SOKOZA rechecks current catalog data, creates a reference, and snapshots the selected items.
7. SOKOZA opens a `wa.me` deep link with an encoded message. A copy-message fallback remains visible.
8. Returning to SOKOZA prompts the buyer to mark the enquiry as sent, not the purchase as completed.

Opening WhatsApp is an outbound action, not evidence that a message was sent, accepted, paid, delivered, or completed.

### 8.2 Seller publishes first product

1. Seller authenticates and verifies phone/WhatsApp ownership.
2. Seller creates a store identity with public location area, contact channel, and collection/delivery policy.
3. Seller uploads product images from a phone.
4. Guided fields capture title, category, price, condition, color, size/variant, quantity state, and fulfillment information.
5. Seller previews and publishes.
6. Seller later receives a short inventory-refresh prompt with one-tap “Available,” “Low stock,” or “Sold.”

**Operating target, not researched fact:** assisted first publish under 15 minutes and self-serve first publish under 30 minutes. Measure before enforcing additional requirements.

### 8.3 Search and store-discovery flow

`Open Discover → focus search → enter/select query → inspect grouped suggestions → Discover results → apply size/availability/price/store filters → product detail → return to the preserved URL and results state`

`Open Stores → filter/browse stores → store profile → Shop or live Drop → product detail → return to the same store context`

No-results recovery is `preserve query → explain active constraints → remove one or all filters → show relevant categories/stores → edit query`. It must not silently substitute unrelated results.

### 8.4 Cart and out-of-stock flow

`Add valid variant → Cart seller group → Review order → revalidation detects unavailable item → identify exact item/variant → remove, save, or select another real variant → revalidate remaining seller group → create order intent`

Other seller groups remain untouched. The application does not substitute a size, color, product, price, or quantity without buyer acknowledgement.

### 8.5 WhatsApp failure and return flow

`Order intent ready → Open WhatsApp fails or app unavailable → show copy message + seller number + WhatsApp Web/retry where supported → preserve review and reference`

`Open WhatsApp succeeds → SOKOZA records opened → buyer returns → ask whether the enquiry was sent → Yes records buyer-marked sent; Not yet preserves the ready/opened intent`

Neither path marks a purchase complete.

## 9. Feature prioritization

### 9.1 MVP

**Buyer**

- Home: location, Fresh Today, Just Dropped, Stores to Know, Shop the Vibe, Made Here, Recently Viewed.
- Discover: browse-led vibes/categories/occasion/price/stores/drops/Made Here plus focused search, grouped autocomplete, result tabs, filters, sort, and recovery.
- Stores directory and complete store profiles.
- Discover search with grouped suggestions, typo-tolerant matching where feasible, result tabs, sort, and fashion-relevant filters.
- Product detail with two or more real product photos, price, seller, condition, variant/size, stock state, freshness, description, and delivery/collection information.
- Guest/local Saved, Recently Viewed, and seller-grouped Cart.
- Seller-specific Order Review, order-intent reference, WhatsApp deep link, copy fallback, and return confirmation.
- Enquiry history on the current device.
- Reporting and clear seller verification labels.
- Loading, empty, error, offline/weak-network, unavailable, suspended-store, changed-price, and stale-inventory states.

**Seller**

- Seller-only authentication.
- Store setup and phone/WhatsApp verification.
- Product CRUD, variants, availability, and freshness confirmation.
- Live drop collection grouping without countdowns or reminders.
- Enquiry list based on SOKOZA-created order intents.
- Action-focused home: incomplete setup, stale inventory, unavailable products, and recent enquiries.

**Operator**

- Seller review/verification, listing moderation, reports, feature/curation controls, and basic liquidity views.

### 9.2 Version 1.1

- Hot in Lusaka: operator- or approved-seller-published commerce stories with product/store links; no comments or public like counts.
- Vibe Check finite-session experiment.
- Scheduled/upcoming drops, countdowns only against a real start time, and opt-in reminders.
- “Wear it with” / Complete the Fit editorial collections.
- Optional buyer account for cross-device saved items, follows, and preferences; never required to browse or enquire.
- Seller response-time indicators after sufficient eligible data.
- Seller analytics focused on views, saves, order reviews, and enquiries.
- Seller bulk inventory refresh and duplicate-product workflow.

### 9.3 Version 2

- Confirmed-order feedback/reviews after a defensible buyer-and-seller confirmation mechanism.
- Personalization based on meaningful behavior, with transparent controls.
- Store following and useful notifications.
- Richer editorial tooling and campaign collections.
- Seller teams and roles.
- Limited payment or delivery pilots only after legal, operational, fraud, dispute, and unit-economics validation.

### 9.4 Later or explicitly excluded

- Public comments, follower counts, vanity leaderboards, and popularity theater.
- Endless swipe feeds.
- AI stylist or AI-generated taste claims without evidence and user control.
- Buyer account requirement.
- Cross-seller checkout in a WhatsApp-led model.
- Fake reviews, fake ratings, fake “trending,” fake sales, fake scarcity, or fake verification.
- Platform-wide claims such as “Zambia's premier marketplace” before independently supportable.
- Full WhatsApp Business API, automated chat agents, marketplace payments, escrow, or delivery orchestration in the MVP.

## 10. Decisions on high-risk features

### 10.1 Vibe Check — change and defer to V1.1

The supplied concept is visually distinctive but can become a gimmick or an inaccessible Tinder imitation.

Recommended behavior:

- An optional, finite session of 10–12 cards.
- `Keep` saves the item; `Pass` removes it only from the current session and creates, at most, a weak negative signal.
- Tapping the card opens details and is preference-neutral.
- Visible Keep and Pass buttons are always available; dragging is optional. WCAG requires a single-pointer alternative to dragging. [WCAG 2.2 dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- Products dominate; occasional stores or complete looks may appear only when visually distinct and clearly labeled.
- No permanent dislike, public score, attractiveness language, or “AI knows your style” claim.
- Completion returns useful saved items and routes into normal catalog browsing.

Launch only if the ordinary catalog already has enough relevant inventory to populate multiple sessions without repetition.

### 10.2 Complete the Fit — simplify and defer

The editorial concept can increase discovery, but multi-seller outfits conflict with a one-seller-at-a-time WhatsApp transaction.

- MVP may show a plain “Wear it with” rail, preferably from the same seller.
- V1.1 may add styled looks with transparent seller grouping.
- Never imply “add all” creates a single transaction when products belong to different sellers.
- Product hotspots require keyboard/touch alternatives and an adjacent item list.

### 10.3 Hot in Lusaka — editorial pilot in V1.1

It should be a shoppable editorial surface, not a second social network.

- Publish only when there is real, current linked inventory.
- Use a finite story sequence with pause, previous/next, close, and product controls.
- Pause on focus/hover where relevant and honor reduced motion. [WAI carousel guidance](https://www.w3.org/WAI/tutorials/carousels/)
- No comments, public likes, or unsupported “hot/trending” ranking. “Hot in Lusaka” is an editorial title; the selection must be labeled curated.
- If at least five anchor sellers cannot sustain weekly content, keep the feature out of the primary launch UI.

### 10.4 Drops — retain an MVP-lite form

A Drop is initially a seller-curated live collection with an optional cover, title, and products. This gives sellers a launch moment without notification or scheduling infrastructure.

- MVP: live/past states; no fake countdown; no reminder promise.
- V1.1: scheduled state, real countdown, reminders, and story packaging.
- Sold-out products remain visible only when they help tell the collection story, and are visibly non-orderable.

## 11. Search, filtering, and catalog quality

Search is a core utility, not a decorative destination. Users should search product title, seller/store, category, brand/designer when supplied, style/vibe, color, occasion, and location.

Recommended filters:

- availability;
- size;
- category;
- price range;
- condition;
- color;
- store;
- location/collection area;
- delivery/collection options;
- Made in Zambia / local designer;
- drop membership when relevant.

Size belongs near the top for apparel. Baymard's apparel studies show that unavailable sizes cause major frustration and recommend making size filters prominent; results also support multi-select filters and visible applied-filter summaries. These are international findings and should be locally tested. [Apparel size filtering](https://baymard.com/blog/apparel-put-size-filter-near-top-and-expand-for-sidebar-filtering), [multi-select filters](https://baymard.com/blog/allow-applying-of-multiple-filter-values), [applied filters](https://baymard.com/blog/how-to-design-applied-filters).

Sort options should be truthful:

- Recommended — only when the ranking logic can be explained internally;
- Newest;
- Price: Low to High;
- Price: High to Low;
- Availability recently confirmed.

Do not show “Best selling,” “Most popular,” or “Trending” without adequate, defined data.

No-results recovery should preserve the query, identify active constraints, offer one-tap filter removal, suggest related categories/stores, and make a new search easy. It must not silently replace the user's query.

## 12. Listing quality and inventory freshness

### 12.1 Publish requirements

Every product requires:

- at least two images of the actual item;
- concise title;
- category;
- price;
- condition;
- color;
- at least one size/variant or explicit one-size status;
- availability state;
- seller/store association;
- collection/delivery information inherited from the store or overridden for the product.

Field policy:

| Field | Policy |
|---|---|
| Images, title, category, price, condition, primary color, availability | Required for every product |
| Size/variant | Required for apparel/footwear; explicit `One size` or `Not applicable` only where valid |
| Quantity | Optional when seller uses simple available/low/sold; required for quantity-aware variants |
| Description | Optional at publish, strongly prompted when title/structured fields do not explain material, fit, or included pieces |
| Brand/designer | Optional unless authenticity/moderation policy makes it necessary for a category |
| Measurements | Strongly prompted for thrift, tailoring, and nonstandard sizing; category-specific fields for garment length, waist, chest, inseam, or shoe system |
| Material/care | Optional initially; category-specific prompt |
| Flaws | Required when condition is not new and a flaw exists |
| Style/vibe tags | Seller can suggest from a controlled vocabulary; moderation/editorial can reconcile; no free-form hashtag wall |
| Location/fulfillment | Inherit from Store, with explicit product override |
| Drop | Optional association with one live collection in MVP |

The product editor should encourage 3–5 images: full item, alternate angle, detail/texture, label or measurements, and any flaw. Apparel guidance across marketplaces consistently emphasizes actual-item images, multiple angles, accurate condition, size, and visible flaws. [Whatnot apparel guidance](https://help.whatnot.com/hc/en-us/articles/29232352751885-Apparel-on-Whatnot-Best-Practices), [Amazon apparel image guidance](https://sellercentral.amazon.com/seller-forums/discussions/t/7de2d128-be39-4961-899f-f29240ec5d9f).

SOKOZA should not impose Amazon-style white-background photography. Local seller identity and high-quality user-generated imagery are part of the product. It should reject misleading collages, unrelated stock imagery, unreadable images, and undisclosed heavy alteration.

### 12.2 Freshness model

**Proposed operating hypothesis:** prompt sellers to reconfirm fast-moving or low-stock products after three days and ordinary products after seven days. Test these windows with real seller behavior.

Buyer-facing labels should describe the evidence:

- “Confirmed today”
- “Confirmed within 3 days”
- “Not recently confirmed — check with seller”
- “Low stock” only when seller-declared or quantity-derived
- “Sold” / “Unavailable”

Stale products rank lower after the chosen threshold but are not automatically described as unavailable. Order review revalidates variant, price, and store status. A stale listing may continue to WhatsApp with a warning; an explicitly unavailable item cannot.

## 13. Trust and safety

### 13.1 Trust ladder

Badges state exactly what SOKOZA checked:

1. **WhatsApp number verified** — control of the contact number.
2. **Identity verified** — identity evidence reviewed under a documented process.
3. **Business verified** — business evidence reviewed under a documented process.

“Verified seller,” “trusted,” “authentic,” or a generic blue check must not collapse these meanings. Verification reduces uncertainty; it does not guarantee conduct, product authenticity, fulfillment, or refunds.

### 13.2 MVP trust surfaces

- Store join date and general service location.
- Exact verification labels with an explainer.
- Seller-provided delivery, collection, exchange, and return policies.
- Product condition and flaws.
- Availability freshness.
- Report product/store and block future local recommendations where applicable.
- Clear statement that price, payment, delivery, and final agreement occur with the seller on WhatsApp.
- Moderation states for pending, rejected, suspended, and appealed sellers/listings.

Marketplace consumer-protection guidance emphasizes seller traceability, transparency, reporting, and platform responsibility. European and OECD frameworks are useful design principles but are not asserted here as Zambian legal requirements. [OECD marketplace consumer protection](https://www.oecd.org/content/dam/oecd/en/publications/reports/2022/07/the-role-of-online-marketplaces-in-protecting-and-empowering-consumers_07af735e/9d8cc586-en.pdf), [EU Digital Services Act overview](https://digital-strategy.ec.europa.eu/en/policies/digital-services-act).

### 13.3 Reviews

Do not launch star ratings. SOKOZA cannot yet prove a transaction occurred, and early empty or fabricated reviews would be actively misleading. The FTC's rule against fake reviews applies in the United States, not automatically in Zambia, but demonstrates the product-integrity risk of manufactured or improperly represented testimonials. [FTC fake-review rule](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials)

Version 2 may permit feedback only after:

- a SOKOZA order intent exists;
- buyer and seller independently confirm a completed exchange, or another defensible confirmation exists;
- moderation, dispute, edit, and removal policies are operational;
- the UI labels the basis accurately, such as “Order confirmed,” rather than “Verified purchase” unless payment itself is verified.

## 14. WhatsApp handoff specification

The MVP uses a seller-specific `wa.me` deep link with an E.164-format number containing digits only and an encoded `text` query. Prefilled text is editable and is not automatically sent. [Click-to-WhatsApp implementation summary](https://wha.tools/blog/how-to-create-click-to-whatsapp-link-wa-me)

Recommended message:

```text
Hello {storeName}, I found these items on SOKOZA.

Order enquiry {reference}
1. {productTitle} — {variant} — K{price}
2. {productTitle} — {variant} — K{price}

Item value: K{subtotal}
Preferred fulfilment: {collectionOrDeliveryOrAskSeller}

Please confirm availability and next steps. Payment and fulfilment will be arranged with you.
{shortOrderUrl}
```

Rules:

- One seller per message and order intent.
- Use “Item value” or “Subtotal,” not “Total,” because delivery and negotiated changes are unresolved.
- Snapshot the displayed product, variant, and price when the intent is created.
- Revalidate before creating the deep link and show changes for buyer acceptance.
- Provide `Copy message`, `Open WhatsApp`, and a clear manual contact fallback.
- Record “WhatsApp opened” separately from “Buyer marked enquiry sent.”
- Do not mark paid, purchased, delivered, or completed based only on an outbound link.

## 15. Cold-start plan

Marketplace liquidity improves when launch scope is constrained. Marketplace guidance consistently recommends establishing a strong initial network in one geography or vertical instead of dispersing early supply. [Sharetribe focus guidance](https://www.sharetribe.com/academy/focus-marketplace-one-city-one-vertical/), [a16z network-effect metrics](https://a16z.com/16-ways-to-measure-network-effects/).

### Proposed operating targets — assumptions, not market facts

- Recruit 15–25 anchor Lusaka stores across complementary categories.
- Require or assist toward 8–12 active, high-quality products per anchor seller.
- Reach roughly 200–300 genuinely orderable products before a public campaign.
- Ensure no critical launch category is represented by only one seller.
- Run a weekly assisted inventory-refresh session for the first six weeks.
- Curate Home manually and label editorial selections as curated.

### Launch phases

1. **Concierge supply:** onboard sellers directly, photograph or improve weak listings, and test seller workflows.
2. **Closed buyer pilot:** 50–100 invited shoppers complete search-to-WhatsApp tasks; capture where uncertainty remains.
3. **Lusaka public beta:** only after freshness and enquiry reliability pass agreed thresholds.
4. **Category/location expansion:** based on unmet searches, repeat buyers, active supply, and seller response—not vanity registration counts.

## 16. Success measures

### 16.1 North-star candidate

**Weekly qualified order enquiries**: unique order intents that pass validation, open the correct seller handoff, and are marked sent by the buyer or acknowledged by the seller.

This remains an enquiry metric, not sales.

### 16.2 Buyer funnel

- Search/discovery session → product detail rate.
- Product detail → valid variant selection.
- Product detail → order review.
- Order review → WhatsApp open.
- WhatsApp open → buyer-marked sent / seller-acknowledged enquiry.
- Seven-day and 30-day returning buyers on the same device/account.
- No-result rate and filter-removal recovery.
- Unavailable-item rate encountered during order review.

### 16.3 Seller health

- Time to first published product.
- Sellers with at least eight active products.
- Percentage of active products confirmed within the freshness window.
- Median eligible seller response time, once measurable.
- Enquiries per active seller and distribution across sellers.
- Seller weekly return to refresh, publish, or respond.
- Listing rejection and report resolution rates.

### 16.4 Marketplace liquidity

- Search success by category, size, price, and location.
- Percentage of meaningful queries with at least 20 relevant active results — initial hypothesis, adjust by research.
- Supply concentration: share of impressions/enquiries captured by top sellers.
- Repeat enquiry rate.
- Buyer requests with no matching current supply.

Never report revenue, sales, conversion to purchase, or average order value unless SOKOZA can validate the completed transaction.

## 17. Key risks and mitigations

| Risk | Early signal | Mitigation |
|---|---|---|
| Thin inventory | repeated products, no-result searches | Lusaka/category focus; supply targets before public launch |
| Stale listings | order-review changes, buyer reports | reconfirmation prompts; freshness labels; ranking decay |
| Seller workload | abandoned onboarding, low refresh rate | phone-first editor; inherited policies; bulk reconfirmation |
| Low trust | product views without enquiries | explicit verification, condition, policies, reporting, freshness |
| WhatsApp attribution gap | many opens, few confirmations | return prompt, seller acknowledgement, honest funnel names |
| Low-data abandonment | slow image loads, high early exits | responsive formats, restrained media, skeletons, data-conscious mode |
| Editorial emptiness | repeated stories or fake “hot” claims | postpone story mechanics; label operator curation |
| Multi-seller confusion | cart/order-review drop-off | seller grouping; one seller per flow; no universal checkout |
| Counterfeit/prohibited goods | reports, identity disputes | category policy, seller verification, manual review, sanctions |
| Premature feature sprawl | low use across many surfaces | phase gates tied to real supply and enquiry behavior |

## 18. Research still required before public launch

1. Interview 12–15 Lusaka fashion shoppers across different budgets and shopping habits.
2. Shadow 8–10 sellers as they publish inventory and handle a prepared enquiry.
3. Inventory audit of 20 prospective sellers: image quality, size data, stock volatility, and delivery/collection practices.
4. Usability test search, PDP, cart grouping, order review, and WhatsApp return with at least five participants per iteration.
5. Test product terminology in local use: “cart,” “order enquiry,” “collection,” “drop,” “vibe,” and condition labels.
6. Validate how buyers interpret each verification badge.
7. Validate freshness windows and whether sellers can reliably reconfirm at scale.
8. Obtain Zambian legal advice for marketplace terms, privacy, seller verification data, prohibited items, consumer disclosures, and any later payment pilot.
9. Establish WhatsApp deep-link behavior across common Android devices, iPhone, WhatsApp Business, desktop, missing-app, and weak-network scenarios.

## 19. Discovery strategy by buyer intent

SOKOZA must serve three distinct modes without turning each into a separate product.

### Intent A — “I know what I want”

Examples: black dress, size 42 sneakers, cargo pants under K500.

**Who/problem:** A high-intent buyer needs to eliminate irrelevant or unavailable products quickly.  
**Mechanism:** Search, query suggestions, category/size/price/availability filters, explicit applied state, and predictable product grids.  
**Why not a feed:** A feed makes the buyer inspect too many wrong products.  
**MVP:** Yes.  
**Risk:** Weak product tagging or missing sizes destroys confidence.  
**Evidence:** Apparel search research makes size and availability prominent; see Section 11.

### Intent B — “I want to shop, but I am undecided”

**Who/problem:** A buyer has category-level or mood-level interest but not a specific query.  
**Mechanism:** Discover with Shop by Vibe, occasions, price entry points, Made Here, stores, and live Drops.  
**Why not only search:** The buyer cannot formulate the exact query yet.  
**MVP:** Yes, using human-readable curation rather than personalization claims.  
**Risk:** Editorial labels become vague or repetitive.  
**Evidence:** Pinterest's actionable visual objects and fashion editorial patterns show the value of guided exploration when every image routes to real inventory.

### Intent C — “I am browsing fashion”

**Who/problem:** A low-immediacy visitor wants to see what local stores are doing and may build future intent.  
**Mechanism:** Home's Fresh Today, Just Dropped, Stores to Know, Made Here, and Recently Viewed; later, commerce stories and a finite Vibe Check.  
**Why not an endless social feed:** SOKOZA cannot initially sustain the content volume, recommendation quality, or moderation cost, and passive engagement does not necessarily improve liquidity.  
**MVP:** Current-inventory modules; stories/Vibe Check later.  
**Risk:** Sparse content exposes the cold start.  
**Evidence:** Empor reinforces the atomic-network lesson; marketplace cold-start guidance reinforces density before breadth.

### Recommended Home architecture

| Order | Module | Format | Rationale |
|---:|---|---|---|
| 1 | Identity, Lusaka context, search | compact header | Immediate orientation and route to known-item intent |
| 2 | Hot in Lusaka, only when current | compact story rail, V1.1 | Timely editorial activity; omit entirely when empty |
| 3 | Fresh Today | first row + product grid | Strongest truthful “what is happening now” signal |
| 4 | Just Dropped | one feature + horizontal products | Seller launch identity without a full social feed |
| 5 | Stores to Know | mixed-ratio store feature | Builds store recognition and repeat routes |
| 6 | Shop the Vibe | controlled asymmetric tile group | Guided discovery for undecided shoppers |
| 7 | Made Here | full-width editorial feature + products | Distinctive local-fashion value, based on seller/product evidence |
| 8 | Recently Viewed | horizontal products, conditional | Resumes an existing guest journey; never show empty filler |
| 9 | Wear it with | V1.1 | Merchandising depth after the core catalog works |

Above the first meaningful scroll, show the search path and at least one current product/store signal. Only one module at a time deserves full-width photography. Alternate editorial moments with regular product grids so the page remains shoppable. Home answers “what is happening now”; Discover answers “how would you like to explore?”

## 20. Seller experience recommendation

The simplest seller workspace is:

1. **Home** — blockers and next actions.
2. **Products** — draft, active, stale, low, sold, archived.
3. **Enquiries** — order-intent snapshots and current status.
4. **Drops** — live collections only in MVP.
5. **Store** — identity, WhatsApp, service area, policies, preview.
6. **Settings/Verification** — account, evidence, safety, support.

Insights are a small factual section in Home during MVP, not a primary destination. They may become a destination in V1.1 if sellers use them to improve inventory.

Setup-friction controls:

- save progress after each meaningful step;
- verify WhatsApp once and reuse it;
- inherit store location and fulfillment policy into products;
- provide category-aware fields only when relevant;
- upload/compress images in parallel and allow retry per image;
- duplicate an existing product as a draft;
- allow publication after minimum truth fields, then show a quality checklist;
- make bulk freshness confirmation possible from the product list.

Controlled store customization includes cover image, avatar/mark, description, approved categories, visual emphasis color from a constrained accessible set, and curated product/drop ordering. It excludes arbitrary CSS, fonts, background colors, animated cursors, embedded scripts, or navigation changes.

## 21. Brand, inspiration, and anti-generic constitution

### Brand critique

- **Name:** SOKOZA is short, memorable, and suited to a local marketplace. Do not over-explain it in every surface.
- **Logo:** supplied references are inconsistent; the 3D render is visually expressive but not an approved utility wordmark. Preserve an official asset or use text.
- **Palette:** warm canvas, terracotta, olive, and ink are distinctive and appropriate. Maintain sufficient contrast and avoid making terracotta a universal decoration.
- **Typography:** Playfair creates editorial fashion character; Sora keeps brand/product language current; Inter supports utility. Overusing Playfair risks imported luxury distance.
- **Photography:** strongest differentiator when it is real, local, varied, and tied to inventory. Generic model photography would make the product feel culturally interchangeable.
- **Graphic language:** the best reference layouts use image scale and type, not heavy effects. Stitch/weave motifs should not become a clichéd marker of “African” identity.
- **Tone:** section names such as Fresh Today, Stores to Know, Made Here, Drops, Hot in Lusaka, Vibe Check, and Complete the Fit are concise and ownable. The latter three need product-stage constraints described earlier.

### SOKOZA anti-generic design constitution

**Prohibited**

- rounded cards around every section;
- identical center-aligned tiles across unrelated functions;
- gradient, glass, glow, purple/cyan/neon, sparkles, or AI-assistant decoration;
- generic stock imagery or generated products presented as real inventory;
- random pills, decorative tags, giant empty hero spacing, fake dashboards, and invented numbers;
- mixed icon families, emoji controls, Material Symbols, or arbitrary custom SVG controls;
- symmetrical monotony on editorial pages and chaotic asymmetry on comparison pages;
- borrowed startup copy, forced slang, and unsupported superlatives;
- dashboards with sales/revenue or popularity that SOKOZA cannot measure;
- repeated `Card` components as the only layout idea.

**Encouraged**

- actual products and store people/places as the visual center;
- image crops that reveal construction, styling, and condition;
- asymmetry for campaign/vibe/store discovery, then regular grids for comparison;
- typography, spacing, thin dividers, and crop contrast before containers/shadows;
- varying but systematic components for product, store, drop, story, and utility content;
- truthful sparse states and operator-labelled curation;
- local specificity through real names, neighborhoods/service areas, designers, garments, and seller stories—not generic motifs.

**Content-density rule:** every viewport should help someone orient, compare, or act. Large whitespace is justified only by a strong editorial image or reading hierarchy. Product and seller tools favor information density over mood.

The detailed implementation constitution is in `design-strategy.md`; reference-specific violations are in `reference-design-audit.md`.

## 22. Mobile, desktop, accessibility, and data rules

### Mobile

- Five stable bottom destinations; header owns wordmark, location, and profile/avatar.
- Use sheets for reversible contextual tasks such as filters, sort, location, size guidance, share, and report.
- Use full pages for Product, Store, Cart, Order Review, Enquiries, and multistep seller creation where deep linking/recovery matter.
- Galleries support tap controls and thumbnails/dots; no swipe-only requirement.
- Sticky actions account for bottom navigation, safe area, keyboard, zoom, and errors.
- Keep frequent controls in comfortable thumb reach without moving primary navigation per screen.

### Desktop

- Persistent header with the same IA.
- Search/results use a filter sidebar or stable anchored panel and a denser grid.
- PDP uses a gallery/decision split, with seller/policy depth below.
- Store profile uses a wide identity header plus catalog grid and secondary tabs.
- Seller workspace uses side navigation, lists/tables, and split editors where beneficial.
- Content widths are constrained; imagery expands through composition, not stretched card width.

### Accessibility

- WCAG 2.2 AA target, 44px designed hit areas, visible focus, keyboard/screen-reader paths, reflow at zoom, sufficient contrast, labels beyond color.
- Drag, swipe, and hotspots have direct control/list alternatives.
- Stories pause and expose previous/next/close; reduced motion removes nonessential transitions.
- Swatches have color names; sizes are real labeled buttons; disabled choices state why.
- Sheets trap focus correctly, expose a name, close predictably, and restore focus.

### Performance/data

- Responsive image candidates, correct `sizes`, modern formats, intrinsic dimensions.
- Prioritize the true LCP image and lazy-load below-fold images; never preload hidden story/carousel media indiscriminately.
- No autoplay video on mobile data by default.
- Preserve meaningful text and controls while images load or fail.
- Server-render/cache public catalog where appropriate and limit client hydration.
- Test throttled target devices and consider a user-controlled reduced-data mode after field validation.

## 23. SOKOZA copy guide

**Voice:** short, confident, fashion-aware, local, human, and operationally honest.

| Context | Preferred | Avoid |
|---|---|---|
| Discovery | Fresh Today; Stores to Know; Made Here | Discover endless possibilities |
| Product action | Add to Cart; Review order | Buy now when no checkout exists |
| Handoff | Open WhatsApp; Copy message | Place order; Order complete |
| Inventory | Confirmed today; Check with seller | Guaranteed in stock |
| Trust | WhatsApp number verified | Trusted Seller |
| Empty saved state | Save pieces to find them here | Unlock your style |
| Seller benefit | Help new shoppers find your current pieces | Grow seamlessly with AI |
| Error | We couldn't refresh this item. Try again. | Something went wrong! |

Use specific verbs. Say who performs the next step. Avoid exclamation marks as a substitute for warmth. Section labels may be evocative; instructions and trust language must be literal.

## 24. Complete screen inventory

| Type | Surface/state | Phase |
|---|---|---|
| Core page | Home | MVP |
| Core page | Discover | MVP |
| Core page | Stores directory | MVP |
| Discover state | focused/empty search, grouped suggestions, results, filters, no-results recovery | MVP |
| Core page | Cart grouped by seller | MVP |
| Nested page | Product detail | MVP |
| Nested page | Store profile: Shop/About/live Drops | MVP |
| Nested page | Live Drop detail | MVP-lite |
| Nested page | Seller-specific Order Review | MVP |
| Nested page | Saved | MVP local |
| Nested page | Recently Viewed | MVP local |
| Nested page | Enquiries | MVP local |
| Nested page | Profile, Settings, Help, Safety, Terms, Privacy, Sell entry | MVP |
| Sheet | Filters, Sort, Location, Size guide, Variant choice, Share, Report | MVP |
| Dialog | Remove item, discard seller draft, sign out seller, destructive product action | MVP |
| Dialog/sheet | WhatsApp unavailable / copy fallback / returned-from-WhatsApp confirmation | MVP |
| State | page/card skeletons, image failure, offline, partial module error | MVP |
| State | empty Home module omitted; empty Discover results/Saved/Recent/Cart/Enquiries/Products | MVP |
| State | stale, sold, price-changed, variant unavailable, deleted product, suspended seller | MVP |
| Seller | sign in/up, recovery, callback/error | MVP |
| Seller | store setup/preview, WhatsApp setup, verification | MVP |
| Seller | Home, product list, product create/edit, archive, bulk refresh | MVP |
| Seller | enquiry list/detail, live Drop list/editor, policies/settings | MVP |
| Operator | seller/listing review, reports, curation, audit history | MVP operational minimum |
| Page/overlay | Hot in Lusaka viewer and publishing | V1.1 |
| Page/overlay | Vibe Check session/results | V1.1 experiment |
| Page | scheduled/upcoming Drop and reminder preferences | V1.1 |
| Page/overlay | Complete the Fit/look detail and authoring | V1.1 |
| Page | optional buyer account, following, notification preferences | V1.1 |
| Seller | expanded Insights, team/bulk tooling | V1.1/V2 |
| Page | confirmed-order feedback/reviews and moderation | V2 |
| System | personalization controls and recommendation explanation | V2 |
| System | integrated payment/delivery pilot flows | Later, separately approved |

## 25. MVP interaction inventory

| Interaction | Trigger | Result and feedback | Failure/recovery |
|---|---|---|---|
| Save | Tap save on card/PDP | Immediate local saved state and accessible announcement | Revert with reason if storage fails |
| Add to Cart | Tap after valid variant | Add/merge seller item; update cart badge; `View Cart` option | Keep selection, focus missing field or show storage error |
| Variant/size | Tap labeled choice | Update image/price/availability; selected and disabled states explicit | Explain unavailable combination; never silently substitute |
| Gallery | swipe, arrows, thumbnail, keyboard | Change image and announce position when needed | Failed image offers retry and preserves other images |
| Store discovery | tap store identity/card | Open store with Stores context and return state | Suspended/missing store explains status and safe alternatives |
| Cart group review | tap `Review order` | Validate only that seller's items and open review | Inline changed/unavailable items; unaffected groups remain |
| Remove/undo | remove item | Remove immediately with short Undo opportunity | Restore if undo; explain storage conflict |
| Filters | open sheet/sidebar, choose values | Preview/count or apply; visible chips; preserve query/scroll | Keep prior results on failure and offer retry/reset |
| Location | choose service area | Update context and explain result impact | Invalid/offline choice preserves previous location |
| Order Review | confirm current seller group | Create idempotent intent and render prepared message | Resolve duplicate to same intent; show validation errors |
| WhatsApp handoff | tap `Open WhatsApp` | Record open, launch seller link, retain copy fallback | If unavailable/invalid, expose copy, number, retry, edit path |
| Return from WhatsApp | page becomes active | Ask `Did you send the enquiry?` | `Not yet` preserves intent; never infer success |
| Inventory refresh | seller taps status | Update last-confirmed/status with timestamp | Optimistic state rolls back and remains retryable |
| Product publish | seller completes minimum fields | Validate, preview, publish, show discoverability state | Per-field errors; uploads retry independently; draft retained |
| Story navigation | tap/keyboard/swipe in V1.1 | next/previous/pause; progress updates | media failure allows skip/retry; product link remains listed |
| Vibe Check | Keep/Pass buttons or optional swipe | Keep saves; Pass advances current finite session | failed save pauses advance or clearly allows retry |
| Fit hotspot | hotspot or adjacent list in V1.1 | reveal linked product without losing look context | unavailable item is labeled; list remains usable |

## 26. Edge-case register

| Edge case | Required behavior |
|---|---|
| Multiple sellers in Cart | Separate groups and review actions; no combined monetary total or message |
| Same product added twice | Merge only identical variants; otherwise distinct lines; never exceed known quantity |
| Price changes | Show old and new values at review; require acceptance before intent |
| Size/variant becomes unavailable | Block that line, suggest other real variants, allow remove/save; never substitute |
| Product removed/deleted | Preserve enough local context to explain; make non-orderable; offer store/Discover recovery |
| Shared deleted product URL | Friendly not-found with reason when safe, Store/Discover links, no fabricated replacement |
| Seller suspended | Block ordering/contact through SOKOZA; explain neutral status; preserve report/support route |
| Seller missing/invalid WhatsApp | Block publish/order review until seller corrects it; do not guess country code |
| WhatsApp not installed | WhatsApp Web where supported, copy message, visible number, return to review |
| Network failure | Preserve current content/draft, show offline/retry, avoid duplicate intent or upload |
| Slow/failed image | Stable aspect box, useful alt/context, per-image retry; no blank layout jump |
| No search results | Preserve query; show active constraints; remove filters; related categories/stores |
| Guest storage cleared | Honest empty state; do not imply account loss; optional future sync explanation |
| Local storage unavailable/full | Continue browsing; explain saves/cart cannot persist; offer retry |
| Seller stock stale | Label uncertainty, rank lower, revalidate at review; do not call it sold |
| Duplicate order intent/tap | Idempotency returns original reference/message; disable while creating |
| User switches city | Preserve cart; warn which products/stores serve the old location; do not silently delete |
| Seller changes price during PDP | Review is authoritative; explain change and require acceptance |
| Store temporarily closed | Products browsable if appropriate, ordering disabled or delayed exactly as seller state says |
| Quantity exceeds current stock | Clamp only after buyer acknowledgement; show available quantity |
| WhatsApp opens but message not sent | Keep `whatsapp_opened`; ask on return; do not mark sent/completed |
| Buyer sends edited message | Treat SOKOZA snapshot as intent only; seller resolves actual conversation |
| Seller changes phone after intent | Existing intent keeps snapshot/audit; new open uses validated current contact only under defined policy |
| Image upload partially fails | Retain successful uploads and draft order; retry/remove failed files individually |
| Duplicate listing | Warn seller and moderation queue; allow legitimate size/color variants in one structured product |
| Counterfeit/prohibited report | Hide or limit under policy, preserve audit evidence, notify seller, support appeal |
| Comments/review abuse | Comments absent MVP; later feedback requires eligibility, report, moderation, rate limit, appeal |
| Seller deletes account/store | Define retention and buyer-enquiry visibility in privacy/legal design before implementation |

## 27. Roadmap evaluation by feature

| Feature | Who/problem | Mechanism | Phase | Cost/risk |
|---|---|---|---|---|
| Fresh Today | all buyers need current stock | freshness-qualified product module | MVP | requires seller refresh discipline |
| Stores to Know | buyers need seller discovery | labelled editorial rotation | MVP | curation fairness |
| Shop by Vibe | undecided buyers need vocabulary-light browse | curated style filters/collections | MVP | vague/inconsistent tagging |
| Made Here | shoppers seek local designers/makers | evidence-based product/store attribute | MVP | seller claim verification |
| Drops | sellers need a launch collection | live named product group | MVP-lite | content can be thin |
| Saved | guests need to retain intent | local state | MVP | clearing/device limits |
| Recently Viewed | return journeys | local ordered history | MVP | privacy/device clarity |
| Basic seller metrics | seller needs attention signals | views, saves, reviews-started, enquiries | MVP | event definitions/vanity |
| Hot in Lusaka | browsers need current narrative | managed shoppable stories | V1.1 | publishing/moderation/data |
| Vibe Check | exploratory shoppers need playful finite discovery | Keep/Pass optional session | V1.1 experiment | gimmick, poor inference, accessibility |
| Complete the Fit/Looks | styling-oriented shoppers need complements | curated same-/multi-store look with grouping | V1.1 | authoring and ordering complexity |
| Following | repeat buyers need store updates | optional account relationship | V1.1 | empty notifications/follower vanity |
| Notifications | followers need useful events | opt-in drops/back-in-stock | V1.1 | permission fatigue/spam |
| Buyer accounts | cross-device users need sync | optional identity | V1.1 | conversion friction/privacy |
| Reviews | buyers need experience evidence | confirmed-order feedback | V2 | eligibility, abuse, disputes |
| Recommendations | repeat users need relevance at scale | explainable behavior/catalog ranking | V2 | cold data, bias, opaque claims |
| Comments/social feed | no core MVP job | public discussion/feed | Later or remove | moderation, distraction |
| Integrated payments | later buyers may need protection/convenience | controlled payment and dispute flow | Later pilot | fraud, regulation, refunds, settlement |
| Delivery integration | later users may need reliability | defined courier/service workflow | Later pilot | geography, cost, liability |

## 28. Final recommendations

1. Invest first in catalog quality and seller freshness; they are more defensible than a novel browsing gesture.
2. Treat Store as a top-level object and destination, not an attribution line.
3. Make search/size/availability excellent enough that users open SOKOZA before asking Instagram sellers repetitive questions.
4. Keep the WhatsApp relationship, but make the handoff structured, validated, attributable, and honest.
5. Launch with a small set of strong Lusaka sellers and enough current inventory to avoid repetitive browsing.
6. Use editorial modules to expose commerce, never to fabricate activity.
7. Postpone stories, Vibe Check, looks, reviews, and buyer social mechanics until the operating conditions for each exist.
8. Build the complete responsive UI and state system against typed mocks, then seek a separate Supabase approval.

## 29. Approval gates

Before UI production begins, approve:

- the Lusaka-first scope;
- the four-item buyer navigation and search-inside-Discover model;
- the exact MVP/V1.1/V2 split;
- seller-specific WhatsApp ordering language;
- the decision to postpone reviews and most social mechanics;
- verification levels and buyer-facing disclaimers;
- inventory freshness policy as a testable hypothesis;
- route and data implications captured in `product-decisions.md`.

Before Supabase integration begins, separately approve the UI prototype, repository contracts, and backend plan.

## 30. Final buyer-phase research amendments

The product owner accepted three pre-seller additions on 8 August 2026.

### 30.1 Visual autosuggest closes the known-entity gap

**Observation:** Merging Search into Discover reduces navigation competition, but a plain text suggestion list still makes a buyer identify a store, open results, and find it again.

**Recommendation:** A query such as `NOIR` should immediately show the active store avatar and its current orderable products. This behavior applies to the Home search entry and focused Discover search through one shared suggestion model; Home submission continues into Discover results. Exact entity names rank above prefix and contextual matches; active/current evidence may break ties, while popularity is excluded because SOKOZA has no defensible popularity signal. The UI needs real imagery and metadata, not generic icons for every row.

**Validation:** suggestion-to-entity open rate, search-all rate after suggestions, empty-suggestion rate, keyboard completion, response time, and zero navigation to suspended/unpublished entities.

### 30.2 Store identity must use desktop space intentionally

**Observation:** The supplied NOIR reference provides a strong compact identity pattern but no credible laptop/desktop composition. A full-width banner followed by a stretched mobile identity stack creates unused space and separates the seller from the catalog.

**Recommendation:** Preserve the mobile cover/avatar stack, but use a centered cover/identity split at 1024px and above. The cover remains dominant; the identity column carries real store context through Collection and Delivery. The two columns form one intrinsic-height hero with one bottom edge, and tabs follow it in normal flow without overlap or clipping.

**Validation:** scan path at 1024–1920px, first-product visibility, contact comprehension, 125–200% reflow, no hero clipping, and mobile catalog reach.

### 30.3 Installation must be earned and platform-native

**Observation:** Returning buyers may benefit from faster Home Screen access, but immediate install interstitials ask for commitment before value and APK language creates unnecessary security risk.

**Recommendation:** Offer a small dismissible prompt after a return session or meaningful local engagement. Use `beforeinstallprompt` only when the browser exposes it; show Safari instructions on iOS; suppress for 21 days after dismissal and whenever already installed. Never cache mutable catalog truth merely to claim offline behavior.

**Known dependency:** No approved square production icon exists in the supplied materials. The manifest and interaction foundation may ship for review, but full Chromium installability remains gated on a brand-approved icon asset. The 3D reference must not be repurposed.
