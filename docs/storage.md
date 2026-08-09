# Supabase Storage

## Buckets

| Bucket | Visibility | Maximum | MIME types |
| --- | --- | --- | --- |
| `product-media` | Public read | 8 MB | JPEG, PNG, WebP, AVIF |
| `store-media` | Public read | 8 MB | JPEG, PNG, WebP, AVIF |
| `verification-documents` | Private | 10 MB | JPEG, PNG, PDF |

## Object keys

Seller uploads use:

```text
<auth-user-id>/<entity-id>/<purpose>/<random-uuid>.<validated-extension>
```

The browser validates size/type, obtains the authenticated user ID from verified claims, creates a non-guessable filename, and uploads with `upsert: false`. Database records store object paths, not base64 payloads or arbitrary external image URLs.

## Policies

- Public media can be read anonymously.
- Insert requires the first path segment to equal `auth.uid()`.
- Update/delete requires Storage ownership and preserves the authenticated path prefix.
- Verification evidence can be read only by the owning authenticated user (and privileged reviewers through server access).
- Cross-seller overwrite/delete is denied even if an entity UUID is guessed.

Unused/orphan cleanup should be an operator maintenance task after a safe age threshold; a failed form save must not immediately destroy uploaded evidence.

## Asset classes and cleanup safety

SOKOZA editorial assets are interface content, not marketplace demo data. Emptying or reseeding the marketplace must never remove editorial constants/assets used by Home, Sell, authentication, or empty states.

Seller uploads use owner-scoped paths such as:

- `store-media/{sellerId}/{storeId}/{logo|cover}/{uuid}.{ext}`
- `product-media/{sellerId}/{productId}/product/{uuid}.{ext}`
- `verification-documents/{sellerId}/...`

Cleanup scripts must target an exact seller/entity ID. Do not recursively delete an entire bucket or shared editorial asset directory.
