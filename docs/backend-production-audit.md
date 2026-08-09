# Backend production audit

**Audit date:** 8 August 2026  
**Target project:** `kzixedushlpthxehqoho`  
**Region:** `eu-west-2` (London)  
**Authorization:** Backend production integration authorized by the product owner on 8 August 2026.

## Source-of-truth review

The implementation was reviewed against `product-research.md`, `product-decisions.md`, `design-strategy.md`, `reference-design-audit.md`, the seller research/implementation documents, the ranking and social-proof specification, and the backend production master prompt. Historical mock-first gates are retained as history but are superseded for production runtime code.

## Pre-integration application state

- Buyer and seller UI were built around typed domain entities, but production reads and seller writes were disconnected from a live database.
- Seller authentication used preview behavior rather than a verified Supabase session.
- Seller catalog/media edits could exist only in browser state and data URLs.
- Product analytics were derived from browser-local events and could not serve marketplace-wide ranking or truthful seller analytics.
- Fictional marketplace entities existed in a runtime mock module.

## Remote project observations

Read-only HTTP audits found:

- no exposed marketplace tables in the REST OpenAPI document;
- no Storage buckets;
- 13 existing Auth users;
- no remotely queryable Store or Product rows.

The Auth users were preserved because there is no evidence that they are demo records. The requested remote product/Store cleanup is therefore a verified no-op: there were no marketplace tables or rows to delete. Unknown remote data was not mutated.

The supplied server secret authenticates server-side Supabase data APIs but does not authorize the Supabase Management API. Project linking is known to fail in this environment, no database password/direct connection string was provided, and the local Docker daemon is unavailable. Consequently, source-controlled migrations have been prepared and reviewed but have **not** been applied to the remote project in this workspace.

## Implemented replacement

- Supabase SSR clients, cookie session refresh, protected seller routes, callback exchange, sign-up/sign-in/sign-out/recovery/reset flows.
- Production schema migrations for sellers, Stores, products, variants, inventory, Drops, order intents, storage policies, events, aggregates, social proof, and ranking.
- Supabase-backed public catalog repository; fictional catalog data moved to `src/test/fixtures`.
- Authenticated Seller Studio reads/writes with optimistic-version checks and visible persistence errors.
- Storage-backed Store, product, and Drop media uploads.
- Authoritative seller-specific order-intent creation, price/variant/stock revalidation, snapshots, idempotency, guest history, and WhatsApp message generation.
- Server-owned event capture, deduplication, aggregate metrics, social-proof thresholds, and ranked catalog serving.
- Database-backed relevance search and rich autosuggest.

## Open deployment blockers

1. Apply all migrations to the target project using a direct database URL or restored project linking.
2. Generate TypeScript database types from the applied remote schema.
3. Execute remote RLS, Storage, two-seller isolation, and first-real-seller integration tests.
4. Enable/schedule the aggregate refresh job if `pg_cron` is not already active.
5. Rotate the server secret before launch because it was shared through a conversational channel.

These blockers prevent a truthful “production ready” declaration; they do not justify falling back to demo runtime data.
