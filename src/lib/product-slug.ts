function slugifyProductTitle(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 88);
}

/**
 * Product slugs are globally unique in PostgreSQL. Preserve an existing slug so
 * editing a title never breaks a public URL, and suffix new slugs with the
 * product id so two sellers may legitimately use the same product title.
 */
export function productSlug(title: string, productId: string, existingSlug?: string | null) {
  const stableSlug = existingSlug?.trim();
  if (stableSlug) return stableSlug;

  const suffix = productId.replace(/[^a-f0-9]/gi, "").slice(0, 8).toLocaleLowerCase();
  return `${slugifyProductTitle(title) || "piece"}-${suffix || "product"}`;
}

export function dropSlug(title: string, dropId: string, existingSlug?: string | null) {
  const stableSlug = existingSlug?.trim();
  if (stableSlug) return stableSlug;

  const suffix = dropId.replace(/[^a-f0-9]/gi, "").slice(0, 8).toLocaleLowerCase();
  return `${slugifyProductTitle(title) || "drop"}-${suffix || "collection"}`;
}
