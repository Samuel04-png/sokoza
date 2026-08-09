# Ranking system

**Current version:** `ranking_v1`

Search is relevance-first. PostgreSQL full-text search, exact/prefix matches, and trigram similarity identify eligible Stores, products, and Drops. Marketplace signals may break close ties but cannot override a poor text match.

Discover uses a bounded server function over published products in published Stores. Approximate weight order is:

1. current sellability and availability;
2. inventory freshness;
3. recent buyer-marked sent, WhatsApp, and order-intent momentum;
4. order reviews and saves;
5. catalog quality and new-listing exploration;
6. meaningful views as a weak interest signal.

Views alone cannot create “What’s Moving.” That module requires recent qualified intent, or a supported combination of reviews and saves. Products from one Store receive a diversity penalty after its first two high-ranked pieces. Listings published in the last 21 days receive a small, capped exploration boost so new sellers are not permanently buried.

## Social proof

Buyer-facing counts use unique meaningful viewers only. Initial configurable thresholds are 10 today or 22 this week. Below threshold the UI shows nothing. Counts are recent, never lifetime totals, and never claim real-time presence.

## Configuration and explainability

Thresholds, priors, exploration share, and diversity limits are versioned in `private.marketplace_ranking_config`. The serving RPC emits `ranking_v1`. Weight changes require a new documented version and offline/production evaluation; they must not silently reinterpret historical data.
