# Row Level Security matrix

All exposed public-schema tables enable RLS. Private analytics tables enable RLS and grant no browser roles.

| Resource | Anonymous | Authenticated seller | Service role |
| --- | --- | --- | --- |
| Active cities/categories | Read | Read | Full |
| Published/paused Store | Read | Read plus owned private draft | Full |
| Store mutation | None | Own Store only; status via validated RPC | Full |
| Verified public trust labels | Read verified labels | Read own submissions; insert own pending evidence | Full/review |
| Published/sold-out products and public children | Read | Read public plus all owned drafts | Full |
| Product mutation | None | Own Store only; publication/status via RPC | Full |
| Drops | Published/ended read | Own Store management; status via RPC | Full |
| Guest sessions | None | None | Server-only |
| Order intents/items | None | Read only intents for owned Store; constrained follow-up RPC | Server-only create/guest access |
| Reports | None | None | Server-only/operator |
| Raw events/config/aggregates | None | No direct access | Full |
| Seller aggregate metrics | None | RPC returns only products in own Store | Full |

## Required negative tests

- Anonymous insert/update/delete against products, Stores, variants, Drops, intents, and private tables fails.
- Seller A cannot select private Store B drafts, mutate Store B products/media, or read Store B enquiries.
- Seller publication cannot bypass readiness validation.
- Public callers cannot enumerate guest order intents.
- Verification documents never have anonymous read access.

## Remote verification — 8 August 2026

Executed against project `kzixedushlpthxehqoho`:

- Anonymous published Store and Product reads returned the expected public rows.
- Anonymous profile selection returned zero rows.
- Seller B updating Seller A's Store returned zero rows.
- Seller B uploading into Seller A's Storage root was denied (HTTP 400/RLS).
- Seller B directly changing Seller A's Product status was denied (HTTP 403/column grant).
- Seller A's owner-scoped Store/Product uploads and mutations succeeded.
- Store and Product publication succeeded only through their validated RPC paths.

Repeat these remote tests after any RLS, grant, Storage policy, or publication-function change; source inspection alone is not a substitute.
