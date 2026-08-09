# Production readiness

**Current status: blocked on remote database deployment and verification.**

## Source checks

- [x] Runtime buyer repositories use Supabase and coherent empty/error fallbacks.
- [x] Seller Auth uses Supabase SSR and server route protection.
- [x] Seller writes and media uploads target authenticated Supabase services.
- [x] Guest order intents are authoritative, seller-specific, snapshot-based, and idempotent.
- [x] Runtime fictional sellers/products and demo analytics removed.
- [x] Test fixtures live under `src/test/fixtures`.
- [x] Server secret is absent from public environment variables and source.
- [x] TypeScript, ESLint, automated tests, and production build are required on every handoff.

## Remote gates

- [ ] Apply migrations cleanly to `kzixedushlpthxehqoho`.
- [ ] Generate database types from the applied remote schema.
- [ ] Verify every RLS policy with anonymous, Seller A, Seller B, and service-role clients.
- [ ] Verify public/private Storage behavior and cross-seller denial.
- [ ] Complete first seller sign-up → onboarding → Store publish.
- [ ] Complete first product draft → media → variants → publish → public discovery.
- [ ] Complete buyer Cart → revalidation → intent → WhatsApp → seller enquiry.
- [ ] Confirm aggregate refresh, truthful Seller Insights, thresholded social proof, and ranked Discover.
- [ ] Confirm no fictional marketplace rows or unclassified legacy records exist remotely.
- [ ] Rotate the server secret and configure production site URL/email redirects.

## Required deployment input

Because project linking fails and the supplied server secret cannot access the Management API, provide a direct `SUPABASE_DB_URL` (or database password sufficient to construct one). Do not send it into client code or commit it. After deployment, run generated-type, RLS, Storage, two-seller, and end-to-end smoke checks before calling the backend production ready.
