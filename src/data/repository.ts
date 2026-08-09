import "server-only";

import { createSupabasePublicClient } from "@/lib/supabase/public";
import { deriveProductAvailability } from "@/lib/product-availability";
import type {
  Availability,
  CatalogRepository,
  Condition,
  Drop,
  Product,
  ProductVariant,
  Store,
  VerificationLevel,
} from "@/lib/types";

type PublicStoreRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
  tagline: string;
  description: string;
  area: string;
  logo_path: string | null;
  cover_path: string | null;
  category_tags: string[] | null;
  style_tags: string[] | null;
  whatsapp_e164: string;
  facebook_url: string;
  tiktok_url: string;
  collection_details: string;
  delivery_details: string;
  exchange_policy: string;
  created_at: string;
  city: { name: string } | null;
  store_verifications?: Array<{ verification_type: string; state: string }>;
};

type PublicProductRow = {
  id: string;
  slug: string;
  store_id: string;
  title: string;
  description: string;
  details: string[] | null;
  condition: string;
  regular_price: number | string;
  promotion_price: number | string | null;
  promotion_starts_at: string | null;
  promotion_ends_at: string | null;
  primary_colour: string;
  style_tags: string[] | null;
  occasion_tags: string[] | null;
  audience: string;
  made_here: boolean;
  featured: boolean;
  status: string;
  last_availability_confirmed_at: string | null;
  created_at: string;
  category: { name: string } | null;
  product_images?: Array<{ storage_path: string; sort_order: number; is_cover: boolean }>;
  product_variants?: Array<{
    id: string;
    label: string;
    stock_quantity: number;
    stock_reference_quantity: number;
    availability: string;
    last_availability_confirmed_at: string | null;
  }>;
};

type PublicDropRow = {
  id: string;
  slug: string;
  store_id: string;
  title: string;
  subtitle: string;
  status: string;
  cover_path: string | null;
  published_at: string | null;
  created_at: string;
  drop_products?: Array<{ product_id: string; sort_order: number }>;
};

const productSelect = `
  id, slug, store_id, title, description, details, condition, regular_price,
  promotion_price, promotion_starts_at, promotion_ends_at, primary_colour,
  style_tags, occasion_tags, audience, made_here, featured, status,
  last_availability_confirmed_at, created_at,
  category:categories(name),
  product_images(storage_path, sort_order, is_cover),
  product_variants(id, label, stock_quantity, stock_reference_quantity, availability, last_availability_confirmed_at)
`;

const storeSelect = `
  id, slug, name, status, tagline, description, area, logo_path, cover_path,
  category_tags, style_tags, whatsapp_e164, facebook_url, tiktok_url, collection_details, delivery_details,
  exchange_policy, created_at, city:cities(name),
  store_verifications(verification_type, state)
`;

function publicMediaUrl(bucket: "product-media" | "store-media", path: string | null | undefined) {
  if (!path) return "";
  return createSupabasePublicClient().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function currentPrice(row: PublicProductRow) {
  const now = Date.now();
  const promotionActive = row.promotion_price !== null
    && (!row.promotion_starts_at || new Date(row.promotion_starts_at).getTime() <= now)
    && (!row.promotion_ends_at || new Date(row.promotion_ends_at).getTime() > now);
  return Number(promotionActive ? row.promotion_price : row.regular_price);
}

function mapCondition(value: string): Condition {
  if (value === "like_new") return "Like new";
  if (value === "good") return "Good";
  if (value === "made_to_order") return "Made to order";
  return "New";
}

function mapAvailability(row: PublicProductRow): Availability {
  return deriveProductAvailability(row.status, row.last_availability_confirmed_at, row.product_variants ?? []);
}

function mapVariant(row: PublicProductRow, variant: NonNullable<PublicProductRow["product_variants"]>[number]): ProductVariant {
  return {
    id: variant.id,
    label: variant.label,
    color: row.primary_colour,
    colorHex: "#6f665f",
    available: variant.availability !== "unavailable" && (variant.stock_quantity > 0 || variant.availability === "made_to_order"),
    quantity: variant.stock_quantity,
  };
}

function mapProduct(row: PublicProductRow): Product {
  const images = [...(row.product_images ?? [])]
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
    .map((image) => publicMediaUrl("product-media", image.storage_path));
  const price = currentPrice(row);
  const regularPrice = Number(row.regular_price);
  return {
    id: row.id,
    slug: row.slug,
    storeId: row.store_id,
    title: row.title,
    price,
    previousPrice: price < regularPrice ? regularPrice : undefined,
    category: row.category?.name ?? "Uncategorised",
    audience: row.audience,
    condition: mapCondition(row.condition),
    color: row.primary_colour,
    description: row.description,
    details: row.details ?? [],
    images,
    variants: (row.product_variants ?? []).map((variant) => mapVariant(row, variant)),
    availability: mapAvailability(row),
    confirmedAt: row.last_availability_confirmed_at ?? row.created_at,
    madeHere: row.made_here,
    featured: row.featured,
    vibes: row.style_tags ?? [],
    occasions: row.occasion_tags ?? [],
  };
}

function mapStore(row: PublicStoreRow): Store {
  const verification = (row.store_verifications ?? [])
    .filter((item) => item.state === "verified" && ["whatsapp", "identity", "business"].includes(item.verification_type))
    .map((item) => item.verification_type as VerificationLevel);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status === "paused" ? "temporarily_closed" : row.status === "published" ? "active" : "suspended",
    tagline: row.tagline,
    description: row.description,
    location: [row.area, row.city?.name].filter(Boolean).join(", "),
    serviceAreas: row.city?.name ? [row.city.name] : [],
    whatsapp: row.whatsapp_e164,
    socialLinks: {
      facebook: row.facebook_url || undefined,
      tiktok: row.tiktok_url || undefined,
    },
    verification,
    joinedAt: row.created_at,
    coverImage: publicMediaUrl("store-media", row.cover_path),
    avatarImage: publicMediaUrl("store-media", row.logo_path),
    categories: [...new Set([...(row.category_tags ?? []), ...(row.style_tags ?? [])])],
    fulfilment: {
      collection: row.collection_details,
      delivery: row.delivery_details,
      exchanges: row.exchange_policy,
    },
  };
}

function mapDrop(row: PublicDropRow): Drop {
  return {
    id: row.id,
    slug: row.slug,
    storeId: row.store_id,
    title: row.title,
    subtitle: row.subtitle,
    status: row.status === "published" ? "live" : "past",
    coverImage: publicMediaUrl("store-media", row.cover_path),
    productIds: [...(row.drop_products ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((item) => item.product_id),
    publishedAt: row.published_at ?? row.created_at,
  };
}

async function rankedProductIds(movingOnly = false) {
  const { data, error } = await createSupabasePublicClient().rpc("get_ranked_marketplace_products", { p_limit: movingOnly ? 8 : 60, p_moving_only: movingOnly });
  if (error || !Array.isArray(data)) return null;
  return data.map((row) => typeof row === "object" && row && "product_id" in row ? String(row.product_id) : "").filter(Boolean);
}

async function listProducts(ids?: string[], movingOnly = false) {
  const supabase = createSupabasePublicClient();
  const rankedIds = ids ?? await rankedProductIds(movingOnly);
  if (movingOnly && rankedIds === null) return [];
  let query = supabase.from("products").select(productSelect).in("status", ["published", "sold_out"]);
  if (rankedIds) {
    if (!rankedIds.length) return [];
    query = query.in("id", rankedIds);
  }
  else query = query.order("published_at", { ascending: false }).limit(60);
  const { data, error } = await query;
  if (error || !data) return [];
  const products = (data as unknown as PublicProductRow[]).map(mapProduct);
  if (!rankedIds) return products;
  const order = new Map(rankedIds.map((id, index) => [id, index]));
  return products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

async function searchEntityIds(query: string, entityType: "product" | "store") {
  const clean = query.trim().slice(0, 120);
  if (!clean) return [];
  const { data, error } = await createSupabasePublicClient().rpc("search_marketplace", { p_query: clean, p_limit: 30 });
  if (error || !Array.isArray(data)) return [];
  return data.filter((row) => typeof row === "object" && row && "entity_type" in row && row.entity_type === entityType)
    .map((row) => String((row as Record<string, unknown>).entity_id));
}

async function searchRelatedStoreIds(query: string) {
  const clean = query.trim().slice(0, 120);
  if (!clean) return [];
  const { data, error } = await createSupabasePublicClient().rpc("search_marketplace", { p_query: clean, p_limit: 30 });
  if (error || !Array.isArray(data)) return [];
  return [...new Set(data.map((row) => typeof row === "object" && row && "store_id" in row ? String(row.store_id) : "").filter(Boolean))];
}

async function listStores(ids?: string[]) {
  const supabase = createSupabasePublicClient();
  if (ids && !ids.length) return [];
  let query = supabase.from("stores").select(storeSelect).in("status", ["published", "paused"]);
  if (ids) query = query.in("id", ids);
  else query = query.order("published_at", { ascending: false }).limit(60);
  const { data, error } = await query;
  if (error || !data) return [];
  const stores = (data as unknown as PublicStoreRow[]).map(mapStore);
  if (!ids) return stores;
  const order = new Map(ids.map((id, index) => [id, index]));
  return stores.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export const catalogRepository: CatalogRepository = {
  listProducts: () => listProducts(),
  listMovingProducts: () => listProducts(undefined, true),
  async searchProducts(query) {
    return listProducts(await searchEntityIds(query, "product"));
  },
  async getProductBySlug(slug) {
    const { data, error } = await createSupabasePublicClient().from("products").select(productSelect).eq("slug", slug).in("status", ["published", "sold_out"]).maybeSingle();
    return error || !data ? null : mapProduct(data as unknown as PublicProductRow);
  },
  async getProductSocialProof(productId) {
    const { data, error } = await createSupabasePublicClient().rpc("get_product_social_proof", { p_product_ids: [productId] });
    if (error || !Array.isArray(data) || !data[0]) return null;
    const row = data[0] as Record<string, unknown>;
    const count = Number(row.unique_viewers);
    if (!Number.isFinite(count) || count < 1) return null;
    return row.window_label === "today" ? `Viewed by ${count} shoppers today` : `${count} people viewed this piece this week`;
  },
  listStores: () => listStores(),
  async searchStores(query) {
    return listStores(await searchRelatedStoreIds(query));
  },
  async getStoreBySlug(slug) {
    const { data, error } = await createSupabasePublicClient().from("stores").select(storeSelect).eq("slug", slug).in("status", ["published", "paused"]).maybeSingle();
    return error || !data ? null : mapStore(data as unknown as PublicStoreRow);
  },
  async getStoreById(id) {
    const { data, error } = await createSupabasePublicClient().from("stores").select(storeSelect).eq("id", id).in("status", ["published", "paused"]).maybeSingle();
    return error || !data ? null : mapStore(data as unknown as PublicStoreRow);
  },
  async listDrops() {
    const { data, error } = await createSupabasePublicClient().from("drops").select("id, slug, store_id, title, subtitle, status, cover_path, published_at, created_at, drop_products(product_id, sort_order)").in("status", ["published", "ended"]).order("published_at", { ascending: false }).limit(40);
    return error || !data ? [] : (data as unknown as PublicDropRow[]).map(mapDrop);
  },
  async getDropBySlug(slug) {
    const { data, error } = await createSupabasePublicClient().from("drops").select("id, slug, store_id, title, subtitle, status, cover_path, published_at, created_at, drop_products(product_id, sort_order)").eq("slug", slug).in("status", ["published", "ended"]).maybeSingle();
    return error || !data ? null : mapDrop(data as unknown as PublicDropRow);
  },
  getProductsByIds(ids) {
    return ids.length ? listProducts(ids) : Promise.resolve([]);
  },
};
