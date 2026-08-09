# Analytics events

## Authoritative marketplace events

| Event | Meaning | Deduplication/evidence |
| --- | --- | --- |
| `product_viewed` raw | Product detail opened | Short repeat suppression; bots/self-view excluded where identifiable |
| `product_viewed` meaningful | Visible product detail after delay | One session/product per configured window |
| `saved_product` | Guest saved a product | Session/product window |
| `order_review_started` | Seller-specific review opened | Session/product window |
| `order_intent_created` | Database intent exists | Must reference an intent containing the product |
| `whatsapp_opened` | Outbound handoff opened | Must reference matching intent; delivery not proven |
| `buyer_marked_enquiry_sent` | Buyer asserted sending | Must reference matching intent; purchase not proven |

Additional server-owned activity includes `store_viewed`, `search_submitted`, `search_result_clicked`, `product_published`, and `inventory_confirmed`. Raw search text and viewer identity are not exposed to sellers.

Store operational events are recorded in `private.store_operational_events` only after an authoritative mutation succeeds: `store_created`, `store_updated`, `store_published`, `store_paused`, and `store_archived`. They include a backend request ID for deduplication/support diagnosis and are not buyer- or seller-readable raw event streams.

## Privacy and reliability

- Viewer/session keys are HMAC/SHA-256 hashes; seller analytics are aggregates only.
- Obvious crawlers, automation, and identifiable seller self-views are excluded.
- Event capture is same-origin, schema/size validated, and idempotent.
- PostHog may receive behavioral copies when configured, but ordering/ranking never query PostHog at render time and never depend on its availability.

## Aggregation

Raw eligible events roll into daily and 24-hour/7-day/30-day product metrics. The refresh function is designed for a five-minute `pg_cron` schedule. Seller Studio reads the owned aggregate RPC; product details read thresholded social proof; Discover reads a bounded ranking RPC.

No migration seeds traffic. With no real events all values are zero and the UI explains when metrics will appear.
