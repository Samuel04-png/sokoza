# Supabase schema

Source-controlled migrations live in `supabase/migrations` and must be applied in timestamp order.

## Public domain tables

| Table | Purpose | Important integrity rules |
| --- | --- | --- |
| `profiles` | Private user profile and role | One row per Auth user |
| `seller_profiles` | Seller onboarding and preferences | One row per seller user |
| `cities`, `categories` | Production taxonomy | Unique slugs; only active values public |
| `stores` | One public Store per seller | Unique owner and slug; constrained status; optimistic version |
| `store_verifications` | WhatsApp/identity/business evidence state | Unique type per Store; evidence path private |
| `products` | Canonical sellable listing | Owned Store, status, prices, freshness, generated search vector, version |
| `product_images` | Ordered Storage references | One cover per product |
| `product_options`, `product_option_values` | Normalized option definitions | Product-scoped uniqueness |
| `product_variants`, `product_variant_values` | Stock-bearing choices | Nonnegative quantity; constrained availability; version |
| `drops`, `drop_products` | Store collections | Store-owned products only; constrained status |
| `guest_sessions` | Hashed guest capability | No raw guest token; expiry required |
| `order_intents`, `order_intent_items` | Seller-specific authoritative enquiry | Idempotency, snapshots, one Store, immutable item evidence |
| `reports` | Safety reports | Server-only acceptance; never public enumeration |

## Private analytics tables

| Table | Purpose |
| --- | --- |
| `private.marketplace_events` | Hashed, deduplicated product-ranking evidence |
| `private.product_metric_daily` | Recent per-day aggregates |
| `private.product_metric_rolling` | 24-hour/7-day/30-day serving metrics |
| `private.marketplace_ranking_config` | Versioned thresholds and exploration configuration |
| `private.marketplace_activity_events` | Store/search/seller operational activity without raw search text |
| `private.store_operational_events` | Successful Store create/update/publish/pause/archive evidence with request-level deduplication |

## Server/RPC boundaries

- Store/product/Drop publication and status transitions use validated functions.
- Inventory confirmation uses owned-product functions.
- Order-intent create/read/update functions are service-role only.
- Marketplace event capture functions are service-role only.
- Social proof and ranked product functions expose only eligible aggregates/IDs.
- Seller metric functions filter by `auth.uid()` and return aggregates only.
- Store fulfilment is structured on `stores` (`collection_enabled`, `collection_area`, `delivery_enabled`, `delivery_scope`, `delivery_fee_mode`, optional `delivery_fee`) while resolved buyer copy remains in the public collection/delivery text fields.

## Seed policy

Migrations seed only production taxonomy (`Lusaka`, `Ndola`, `Kitwe`, `Livingstone` and the approved categories). They do not seed sellers, Stores, products, enquiries, views, saves, or verification claims.
