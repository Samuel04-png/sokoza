# Thokozile seller import runbook

This import creates a real Supabase Auth seller, seller profile, draft Store, Store media, 28 draft products, 112 selected product images and zero-stock placeholder variants. It never publishes the Store or products. No WhatsApp or social URL is invented.

## Safety and idempotency

- The temporary password is read only from `THOKOZILE_TEMP_PASSWORD`; it is absent from source and logs.
- Existing Auth users retain their password and metadata.
- Existing Store copy is preserved unless the operator explicitly passes `--overwrite-store-copy`.
- Existing products are matched by Store and stable import slug, then skipped.
- All inferred prices and visually inferred catalog fields remain draft for seller review.
- Every placeholder variant has zero stock and is unavailable until the seller supplies real sizes and quantities.

## Run

Apply all Supabase migrations first. Validate local inputs without credentials:

```bash
npm run import:thokozile -- --dry-run
```

Then load the normal server environment and provide the password through a one-off shell environment variable:

```bash
THOKOZILE_TEMP_PASSWORD='provided-out-of-band' npm run import:thokozile
```

After import, sign in as `thokored18@gmail.com`, review every price, description, category, image order, size and stock value, add the real WhatsApp number, and only then publish eligible products and the Store.

## Post-import confirmation

On 9 August 2026 the seller supplied WhatsApp `+260972031552` and confirmed size Medium with quantity 12 for every imported product. The Store and all 28 products were published after verification. Each product retained its four-image gallery in this order: main image, secondary image, flat isolated shot and detail shot.

## Rollback

Do not delete the seller account casually. If rollback is required before seller edits begin, identify the exact Store owner and imported product slugs, export their records, then remove product media/records, Store media/record, seller profile and Auth user in that order. Once the seller has edited content, prefer archiving rather than deletion.
