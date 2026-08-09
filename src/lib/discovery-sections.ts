import type { Drop, Product, Store } from "@/lib/types";

export interface CurrentRelease {
  drop: Drop;
  href: string;
  automatic: boolean;
}

/**
 * Keep explicit seller Drops intact, then give every other active Store a
 * truthful current-release group built from its available published catalog.
 */
export function buildCurrentReleases(drops: Drop[], products: Product[], stores: Store[]): CurrentRelease[] {
  const explicitStoreIds = new Set(drops.filter((drop) => drop.status === "live").map((drop) => drop.storeId));
  const explicit = drops
    .filter((drop) => drop.status === "live")
    .map((drop) => ({ drop, href: `/drops/${drop.slug}`, automatic: false }));
  const automatic = stores.flatMap((store) => {
    if (store.status !== "active" || explicitStoreIds.has(store.id)) return [];
    const current = products
      .filter((product) => product.storeId === store.id && product.availability !== "sold" && product.images[0])
      .slice(0, 8);
    if (!current.length) return [];
    const latest = current.map((product) => product.confirmedAt).sort((a, b) => +new Date(b) - +new Date(a))[0];
    const drop: Drop = {
      id: `current-${store.id}`,
      slug: `current-${store.slug}`,
      storeId: store.id,
      title: `Latest from ${store.name}`,
      subtitle: `${current.length} current ${current.length === 1 ? "piece" : "pieces"}, grouped automatically`,
      status: "live",
      coverImage: current[0].images[0],
      productIds: current.map((product) => product.id),
      publishedAt: latest,
    };
    return [{ drop, href: `/discover?store=${encodeURIComponent(store.id)}&sort=fresh`, automatic: true }];
  });
  return [...explicit, ...automatic];
}

export function hasExplicitMadeHereEvidence(product: Pick<Product, "title" | "description" | "details">) {
  const evidence = [product.title, product.description, ...product.details].join(" ");
  return /\b(made|designed|cut|sewn|crafted|produced)\s+(?:here|locally|in zambia|in lusaka)\b/i.test(evidence)
    || /\bzambian[- ]made\b/i.test(evidence);
}
