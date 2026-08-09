# Order-intent and WhatsApp flow

SOKOZA does not provide cross-seller checkout or claim payment completion. Cart items remain grouped by seller and each Store has a separate Review order.

1. The buyer selects an available canonical variant and adds it to the guest Cart with a display-only price snapshot.
2. Review order submits Store ID, product IDs, variant IDs, quantities, buyer note, and a UUID idempotency key to `/api/order-intents`.
3. The server creates/reads a high-entropy HttpOnly guest cookie and hashes it; the raw token is never stored in PostgreSQL.
4. A service-role-only PostgreSQL function validates one published Store, published products, Store ownership, current variants, quantities, availability, and current promotion price.
5. The function creates one order intent plus immutable line snapshots in one database transaction. A repeated idempotency key returns the original result.
6. The Route Handler compares current prices with browser snapshots and returns explicit changes; the database amount remains authoritative.
7. The server generates one seller-specific WhatsApp message from stored snapshots and the canonical intent reference.
8. Opening WhatsApp changes the intent to `whatsapp_opened`; buyer confirmation may change it to `buyer_marked_sent`. Neither state proves message delivery, payment, fulfilment, or purchase.
9. Seller Studio reads only intents for its owned Store and may set an internal follow-up state. Canonical terminal changes are constrained.

The order-intent table stores Store name/number, product title, variant label, image, unit price, quantity, subtotal, and buyer note snapshots so later catalog edits do not rewrite historical enquiry evidence.
