import type { Availability, Condition, Drop, Product, Store } from "@/lib/types";
import { rankMarketplaceProducts, type ProductRollingMetrics } from "@/lib/marketplace-ranking";

export type DiscoverResultTab = "all" | "pieces" | "stores";
export type FulfilmentFilter = "collection" | "delivery";

export interface DiscoverFilters {
  q: string;
  category: string;
  vibe: string;
  occasion: string;
  madeHere: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort: string;
  availabilityOnly: boolean;
  sizes: string[];
  conditions: Condition[];
  colors: string[];
  storeIds: string[];
  locations: string[];
  fulfilment: FulfilmentFilter[];
  tab: DiscoverResultTab;
}

interface DiscoverSuggestionBase {
  id: string;
  href: string;
  label: string;
  score: number;
}

export type DiscoverSuggestion =
  | (DiscoverSuggestionBase & {
      type: "product";
      image: string;
      storeName: string;
      price: number;
      availability: Availability;
    })
  | (DiscoverSuggestionBase & {
      type: "store";
      image: string;
      location: string;
      descriptor: string;
    })
  | (DiscoverSuggestionBase & { type: "category" })
  | (DiscoverSuggestionBase & { type: "vibe" })
  | (DiscoverSuggestionBase & {
      type: "drop";
      image: string;
      storeName: string;
    });

export interface DiscoverSuggestionGroup {
  label: "Pieces" | "Stores" | "Categories" | "Vibes" | "Drops";
  items: DiscoverSuggestion[];
}

export interface DiscoverSuggestionRequest {
  query: string;
  products: Product[];
  stores: Store[];
  drops: Drop[];
  signal?: AbortSignal;
}

export interface DiscoverSuggestionSource {
  suggest: (request: DiscoverSuggestionRequest) => Promise<DiscoverSuggestionGroup[]>;
}

export const defaultDiscoverFilters = (): DiscoverFilters => ({
  q: "",
  category: "",
  vibe: "",
  occasion: "",
  madeHere: false,
  minPrice: undefined,
  maxPrice: undefined,
  sort: "recommended",
  availabilityOnly: true,
  sizes: [],
  conditions: [],
  colors: [],
  storeIds: [],
  locations: [],
  fulfilment: [],
  tab: "all",
});

const normalize = (value: string) => value.trim().toLocaleLowerCase();

const matchesQuery = (haystack: string, query: string) => {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const normalizedHaystack = normalize(haystack);
  return tokens.length === 0 || tokens.every((token) => normalizedHaystack.includes(token));
};

function matchScore(primary: string, secondary: string, query: string) {
  const clean = normalize(query);
  const normalizedPrimary = normalize(primary);
  const normalizedSecondary = normalize(secondary);
  const tokens = clean.split(/\s+/).filter(Boolean);

  if (!clean) return Number.POSITIVE_INFINITY;
  if (normalizedPrimary === clean) return 0;
  if (normalizedPrimary.startsWith(clean)) return 8;
  if (normalizedPrimary.split(/\s+/).some((word) => word.startsWith(clean))) return 14;
  if (tokens.every((token) => normalizedPrimary.includes(token))) return 22;
  if (normalizedSecondary === clean) return 30;
  if (normalizedSecondary.split(/\s+/).some((word) => word.startsWith(clean))) return 36;
  if (tokens.every((token) => normalizedSecondary.includes(token))) return 44;
  return Number.POSITIVE_INFINITY;
}

export function filterAndSortProducts(
  products: Product[],
  stores: Store[],
  filters: DiscoverFilters,
  options: { metrics?: ReadonlyMap<string, ProductRollingMetrics>; now?: Date } = {},
) {
  const storeMap = new Map(stores.map((store) => [store.id, store]));
  const filtered = products.filter((product) => {
    const store = storeMap.get(product.storeId);
    const haystack = [
      product.title,
      product.category,
      product.audience,
      product.color,
      product.description,
      ...product.vibes,
      ...product.occasions,
      ...product.variants.flatMap((variant) => [variant.label, `size ${variant.label}`]),
      store?.name ?? "",
    ].join(" ");

    return (
      matchesQuery(haystack, filters.q) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.vibe || product.vibes.includes(filters.vibe)) &&
      (!filters.occasion || product.occasions.includes(filters.occasion)) &&
      (!filters.madeHere || product.madeHere) &&
      (filters.minPrice === undefined || product.price >= filters.minPrice) &&
      (filters.maxPrice === undefined || product.price <= filters.maxPrice) &&
      store?.status !== "suspended" &&
      (!filters.availabilityOnly ||
        (product.availability !== "sold" &&
          store?.status === "active" &&
          product.variants.some((variant) => variant.available))) &&
      (filters.sizes.length === 0 ||
        product.variants.some(
          (variant) => variant.available && filters.sizes.includes(variant.label),
        )) &&
      (filters.conditions.length === 0 || filters.conditions.includes(product.condition)) &&
      (filters.colors.length === 0 || filters.colors.includes(product.color)) &&
      (filters.storeIds.length === 0 || filters.storeIds.includes(product.storeId)) &&
      (filters.locations.length === 0 ||
        Boolean(
          store &&
            filters.locations.some(
              (location) =>
                store.location === location || store.serviceAreas.includes(location),
            ),
        )) &&
      (filters.fulfilment.length === 0 ||
        Boolean(
          store &&
            filters.fulfilment.every((method) => Boolean(store.fulfilment[method].trim())),
        ))
    );
  });

  const explicitlySingleStore = filters.storeIds.length === 1 || stores.some(
    (store) => normalize(filters.q) === normalize(store.name),
  );
  if (filters.sort === "recommended") {
    return rankMarketplaceProducts({
      products: filtered,
      stores,
      metrics: options.metrics,
      query: filters.q,
      mode: filters.q.trim() ? "search" : "discover",
      now: options.now,
      preserveSingleStore: explicitlySingleStore,
      includeUnavailable: !filters.availabilityOnly,
    }).map((item) => item.product);
  }

  return [...filtered].sort((a, b) => {
    if (filters.sort === "price-low") return a.price - b.price;
    if (filters.sort === "price-high") return b.price - a.price;
    if (filters.sort === "fresh") return +new Date(b.confirmedAt) - +new Date(a.confirmedAt);
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  });
}

export function findMatchingStores(stores: Store[], filters: DiscoverFilters) {
  const hasStoreSignal = Boolean(
    filters.q ||
      filters.category ||
      filters.storeIds.length ||
      filters.locations.length ||
      filters.fulfilment.length ||
      filters.tab === "stores",
  );
  if (!hasStoreSignal) return [];

  return stores.filter(
    (store) =>
      matchesQuery(
        [store.name, store.tagline, store.description, ...store.categories].join(" "),
        filters.q,
      ) &&
      (!filters.category || store.categories.includes(filters.category)) &&
      (filters.storeIds.length === 0 || filters.storeIds.includes(store.id)) &&
      (filters.locations.length === 0 ||
        filters.locations.some(
          (location) => store.location === location || store.serviceAreas.includes(location),
        )) &&
      (filters.fulfilment.length === 0 ||
        filters.fulfilment.every((method) => Boolean(store.fulfilment[method].trim()))) &&
      (!filters.availabilityOnly || store.status === "active"),
  );
}

export function buildDiscoverHref(filters: DiscoverFilters) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.vibe) params.set("vibe", filters.vibe);
  if (filters.occasion) params.set("occasion", filters.occasion);
  if (filters.madeHere) params.set("madeHere", "true");
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  if (!filters.availabilityOnly) params.set("availability", "all");
  for (const size of filters.sizes) params.append("size", size);
  for (const condition of filters.conditions) params.append("condition", condition);
  for (const color of filters.colors) params.append("color", color);
  for (const storeId of filters.storeIds) params.append("store", storeId);
  for (const location of filters.locations) params.append("location", location);
  for (const method of filters.fulfilment) params.append("fulfilment", method);
  if (filters.tab !== "all") params.set("tab", filters.tab);
  const query = params.toString();
  return query ? `/discover?${query}` : "/discover";
}

export function buildDiscoverSuggestionGroups(
  query: string,
  products: Product[],
  stores: Store[],
  drops: Drop[],
): DiscoverSuggestionGroup[] {
  const clean = normalize(query);
  if (clean.length < 2) return [];
  const activeStores = stores.filter((store) => store.status === "active");
  const storeMap = new Map(activeStores.map((store) => [store.id, store]));
  const orderableProducts = products.filter(
    (product) => product.availability !== "sold" && storeMap.has(product.storeId),
  );
  const liveDrops = drops.filter(
    (drop) => drop.status === "live" && storeMap.has(drop.storeId),
  );
  const uniqueCategories = Array.from(
    new Set(orderableProducts.map((product) => product.category)),
  );
  const uniqueVibes = Array.from(
    new Set(orderableProducts.flatMap((product) => product.vibes)),
  );

  const groups: DiscoverSuggestionGroup[] = [
    {
      label: "Pieces",
      items: orderableProducts
        .map((product) => ({
          product,
          score:
            matchScore(
              product.title,
              [
                product.category,
                product.color,
                ...product.vibes,
                ...product.variants.flatMap((variant) => [variant.label, `size ${variant.label}`]),
                storeMap.get(product.storeId)?.name ?? "",
              ].join(" "),
              clean,
            ) + (product.availability === "available" ? -2 : 0),
        }))
        .filter(({ score }) => Number.isFinite(score))
        .sort((a, b) => a.score - b.score)
        .slice(0, 4)
        .map(({ product, score }) => ({
          id: `product-${product.id}`,
          type: "product" as const,
          label: product.title,
          image: product.images[0],
          storeName: storeMap.get(product.storeId)?.name ?? "Store",
          price: product.price,
          availability: product.availability,
          score,
          href: `/products/${product.slug}`,
        })),
    },
    {
      label: "Stores",
      items: activeStores
        .map((store) => ({
          store,
          score: matchScore(
            store.name,
            [store.tagline, store.location, ...store.categories].join(" "),
            clean,
          ),
        }))
        .filter(({ score }) => Number.isFinite(score))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map(({ store, score }) => ({
          id: `store-${store.id}`,
          type: "store" as const,
          label: store.name,
          image: store.avatarImage,
          location: store.location,
          descriptor: store.categories.slice(0, 2).join(" · "),
          score,
          href: `/stores/${store.slug}`,
        })),
    },
    {
      label: "Categories",
      items: uniqueCategories
        .map((category) => ({ category, score: matchScore(category, "", clean) }))
        .filter(({ score }) => Number.isFinite(score))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map(({ category, score }) => ({
          id: `category-${category}`,
          type: "category" as const,
          label: category,
          score,
          href: `/discover?category=${encodeURIComponent(category)}`,
        })),
    },
    {
      label: "Vibes",
      items: uniqueVibes
        .map((vibe) => ({ vibe, score: matchScore(vibe, "", clean) }))
        .filter(({ score }) => Number.isFinite(score))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map(({ vibe, score }) => ({
          id: `vibe-${vibe}`,
          type: "vibe" as const,
          label: vibe,
          score,
          href: `/discover?vibe=${encodeURIComponent(vibe)}`,
        })),
    },
    {
      label: "Drops",
      items: liveDrops
        .map((drop) => ({
          drop,
          score: matchScore(
            drop.title,
            [drop.subtitle, storeMap.get(drop.storeId)?.name ?? ""].join(" "),
            clean,
          ),
        }))
        .filter(({ score }) => Number.isFinite(score))
        .sort((a, b) => a.score - b.score)
        .slice(0, 2)
        .map(({ drop, score }) => ({
          id: `drop-${drop.id}`,
          type: "drop" as const,
          label: drop.title,
          image: drop.coverImage,
          storeName: storeMap.get(drop.storeId)?.name ?? "Store",
          score,
          href: `/drops/${drop.slug}`,
        })),
    },
  ];

  return groups
    .filter((group) => group.items.length > 0)
    .sort(
      (a, b) =>
        Math.min(...a.items.map((item) => item.score)) -
        Math.min(...b.items.map((item) => item.score)),
    );
}

export const localDiscoverSuggestionSource: DiscoverSuggestionSource = {
  async suggest({ drops, products, query, signal, stores }) {
    if (signal?.aborted) throw new DOMException("Search cancelled", "AbortError");
    const groups = buildDiscoverSuggestionGroups(query, products, stores, drops);
    if (signal?.aborted) throw new DOMException("Search cancelled", "AbortError");
    return groups;
  },
};

export const productionDiscoverSuggestionSource: DiscoverSuggestionSource = {
  async suggest(request) {
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(request.query)}`, {
        signal: request.signal,
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error("Suggestion service unavailable");
      const body = await response.json() as { groups?: DiscoverSuggestionGroup[] };
      return Array.isArray(body.groups) ? body.groups : [];
    } catch (error) {
      if (request.signal?.aborted) throw error;
      return localDiscoverSuggestionSource.suggest(request);
    }
  },
};
