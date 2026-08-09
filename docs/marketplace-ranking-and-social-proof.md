# SOKOZA Marketplace Ranking and Product-View Social Proof

**Status:** Approved implementation architecture  
**Ranking version:** `ranking_v1`  
**Date:** 8 August 2026  
**Scope:** Buyer search, Discover, Product Details, Seller Studio Insights, analytics ingestion, and PostgreSQL aggregates.

## Product outcome

SOKOZA ranks for usefulness now, not accumulated popularity. Search first retrieves products that match the query and its structured filters; only similarly relevant candidates are re-ranked with current marketplace evidence. Discover has no explicit query, so recent qualified intent, smoothed engagement, inventory freshness, catalog quality, controlled exploration, and seller diversity can carry more weight.

Buyer-facing product-view social proof is a separate presentation decision. It uses only recent, deduplicated, meaningful unique viewers. If the verified count does not cross the configured threshold, the Product Details page shows nothing.

## Research translated into decisions

- PostgreSQL full-text search supports weighted document fields and relevance functions that consider frequency, structure, and proximity, while explicitly allowing application-specific factors to be combined after text relevance. SOKOZA therefore treats title/category/color relevance as a retrieval and ordering constraint, not one weak input in a popularity sum. [PostgreSQL full-text ranking](https://www.postgresql.org/docs/current/textsearch-controls.html)
- Amazon Personalize documents configurable exploration for new or low-interaction items and separates exploration weight from the item-age cutoff. SOKOZA adopts the principle, not the service: exploration is a bounded configurable slot policy, never unrestricted randomization. [Amazon Personalize exploration](https://docs.aws.amazon.com/personalize/latest/dg/create-recommender-configure-exploration.html)
- PostgreSQL materialized views persist query results and can be indexed, and Supabase Cron can refresh database work on a schedule. SOKOZA therefore keeps append-only events as evidence and serves ranking/social proof from rolling aggregates rather than scanning events on each page render. [PostgreSQL materialized views](https://www.postgresql.org/docs/current/rules-materializedviews.html), [Supabase Cron](https://supabase.com/features/supabase-cron)
- Supabase recommends data-layer Row Level Security and warns that exposed schemas require deliberate policies. Raw marketplace events and ranking configuration therefore live outside anonymous table access; ingestion and seller metrics use scoped server/database functions. [Supabase data API and RLS](https://supabase.com/blog/simplify-backend-with-data-api)

## Event contract

Allowed product funnel events, from weakest to strongest:

1. `product_viewed`
2. `saved_product`
3. `order_review_started`
4. `order_intent_created`
5. `whatsapp_opened`
6. `buyer_marked_enquiry_sent`

`product_viewed` records two distinguishable observations:

- `raw`: one Product Details mount after client hydration; useful for diagnostics, never direct social proof;
- `meaningful`: the page remained visible for the configured dwell period, the viewer was not a detectable bot, the seller was not viewing their own product where identifiable, and the same session/product was not counted inside the deduplication window.

The browser generates an ephemeral session key. The production endpoint HMAC-hashes viewer/session keys before storage. Events contain product/store identifiers and bounded operational metadata only—never viewer names, email addresses, phone numbers, profiles, raw IP addresses, or raw search text.

## Aggregates

The authoritative backend owns:

- raw views and meaningful unique viewers for 24-hour, 7-day, and 30-day windows;
- unique saves, order reviews, order intents, WhatsApp opens, and buyer-marked sent enquiries;
- previous-window comparisons only when a valid comparison sample exists;
- the last qualifying event time and metric refresh time.

PostHog may receive the same privacy-minimized event names for product analysis, but buyer pages, ranking, and Seller Studio do not query PostHog. They read SOKOZA-owned aggregates.

## Buyer social proof

Initial configurable thresholds:

- today: at least 10 meaningful unique viewers;
- this week: at least 22 meaningful unique viewers.

The today label takes precedence when both qualify. Approved output is limited to:

- `Viewed by 18 shoppers today`
- `42 people viewed this piece this week`

No lifetime totals, named viewers, “live now” presence, random values, fake countdowns, purchase claims, emoji icons, or normal Product Card counts are permitted.

## Ranking model

All weights, priors, thresholds, freshness curves, exploration share, and diversity constraints live in one versioned configuration object/table.

### Eligibility gate

Normal organic eligibility requires:

- published product;
- published/active Store;
- valid current variant state;
- not archived/hidden;
- not sold, except on an explicitly unavailable-inclusive surface.

Stale inventory remains discoverable where product policy permits, but receives lower confidence. Staleness alone does not silently mark an item unavailable.

### Search

1. Match every query token against weighted title, category, color, attributes, description, styles, occasions, sizes, and Store name.
2. Apply explicit filters and eligibility.
3. Calculate a relevance band.
4. Within similarly relevant results, use availability, inventory freshness, current qualified enquiry momentum, smoothed rates, saves, engagement, catalog quality, and a small newness signal.

A marketplace score cannot rescue an irrelevant product. Explicit Store filters and exact Store searches also disable seller-diversity intervention.

### Discover

Discover combines:

- decayed qualified enquiry momentum;
- smoothed enquiry, order-review, and save rates;
- meaningful unique views as a weak interest signal;
- availability and inventory freshness;
- catalog completeness;
- a bounded new/low-exposure exploration candidate;
- seller diversity with a configurable maximum consecutive run.

Views cannot dominate: later funnel signals carry materially more weight, and rate signals are normalized against meaningful exposure.

### Small-sample protection

Observed rates use a Beta-prior equivalent:

`smoothed_rate = (successes + prior_rate × prior_strength) / (exposures + prior_strength)`

This stops `1 enquiry / 1 view` from behaving like certain 100% performance. Priors are versioned hypotheses, reviewed with outcome data, and never presented as proven marketplace truths.

### Exploration and diversity

`ranking_v1` reserves at most 15% of eligible Discover positions for recent, low-exposure inventory and uses a deterministic daily rotation. The cap is configurable. Organic ordering is then diversity re-ranked to avoid more than two consecutive products from one Store when equally useful alternatives exist.

## Explainability and experimentation

The ranking service returns internal components for tests and operator debugging:

- relevance;
- availability;
- inventory freshness;
- enquiry momentum;
- smoothed enquiry/save/review rates;
- product engagement;
- catalog quality;
- exploration reason;
- diversity adjustment;
- ranking version.

Buyers and sellers never see an algorithm score or rank. Experiment analysis records the ranking version and evaluates saves, order reviews, qualified enquiries, no-result recovery, diversity, and inventory freshness—not clicks alone.

## Seller guidance

Seller Studio shows aggregate product rows with raw views, meaningful unique viewers, saves, review starts, WhatsApp opens, and buyer-marked sent enquiries. A percentage change appears only when the previous comparison window has a sufficient sample.

Guidance is conditional and non-causal:

- high current interest + stale/low stock → `Confirm availability`;
- high views + low later intent → ask the seller to review sizes, photos, description, price, and freshness without claiming which factor caused the drop;
- insufficient evidence → show the supported totals and no diagnosis.

## Release boundary

The repository includes a local privacy-preserving event adapter so interactions and UI states can be tested without a production database. Buyer social proof starts empty and is never seeded with invented public counts. The Supabase migration is the production evidence boundary. It must be applied only after the core Store/Product/Order Intent schema exists and the remote schema has been inspected.

The current Supabase CLI can list the `Sokoza` project, but linking fails while parsing its API-key metadata. No remote schema or data was changed. The migration remains local until that external CLI/API issue is resolved.
