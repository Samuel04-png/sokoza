# Backend architecture

SOKOZA remains a single Next.js application backed by Supabase. There are no microservices, custom auth servers, message queues, or payment claims.

```text
Buyer/Seller UI
  → domain components and application actions
    → centralized repositories or authenticated route handlers
      → Supabase Auth / PostgreSQL / Storage
        → server-owned aggregate and ranking functions
```

## Trust boundaries

- The browser receives only the Supabase URL and publishable key.
- The Supabase secret key is read only by `server-only` modules and Route Handlers.
- Public repositories use the anonymous publishable-key client and can see only RLS-eligible published data.
- Seller reads/writes use a cookie-bound SSR client. RLS remains authoritative even when a route handler validates the session first.
- Guest order intents use a high-entropy HttpOnly cookie. Only its HMAC/SHA-256-derived value is stored or sent to server-only RPCs.
- Commerce-critical behavior does not depend on PostHog. PostgreSQL holds authoritative intents and ranking aggregates.

## Runtime data paths

### Seller catalog

Seller Studio loads one authenticated seller profile, one owned Store, products/variants/images, Drops, order intents, preferences, and seller aggregate metrics. Writes pass through `/api/seller/studio`, validate with Zod, enforce same-origin requests, and rely on RLS/RPC ownership checks.

Store content and Store operating state use separate contracts. `save_store_draft` performs a deterministic owner-scoped insert or optimistic-version update; it does not publish. `publish_store`, `pause_store`, and `archive_store` validate owner/version state before invoking the corresponding database transition. A published Store's safe content edits remain published and trigger buyer-route revalidation.

### Buyer catalog

`src/data/repository.ts` maps normalized Supabase rows into stable domain entities. UI components do not query tables directly. Discover uses a bounded ranking RPC; searches and autosuggest use PostgreSQL full-text/trigram relevance.

### Order enquiry

The browser submits canonical product/variant IDs and quantities. A server-only RPC locks/revalidates current rows, calculates prices, stores immutable snapshots, and returns a seller-specific intent. The server then creates the WhatsApp message from those authoritative snapshots.

### Analytics

Buyer events are best-effort and never block ordering/navigation. The server rejects bots and seller self-views where identifiable, hashes viewer/session keys, and deduplicates meaningful events. Rolling metrics, not raw-event scans, serve Seller Studio, social proof, and ranking.

## Failure behavior

- Public repository failures return coherent empty states rather than fixture data.
- Seller write failures remain visible until dismissed/reloaded; “Saved” is not shown while writes are pending.
- Analytics failure never blocks WhatsApp.
- Price, variant, inventory, or version conflicts stop the affected mutation and return a specific corrective state.
- Seller validation returns 422, ownership/auth returns 401/403, optimistic conflicts return 409, and unexpected server failures include a request ID. Success UI is driven only by the authoritative response.
