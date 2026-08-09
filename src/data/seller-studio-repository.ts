import "server-only";

import { emptySellerStudioState as initialSellerStudioState } from "@/lib/seller-studio-empty-state";
import { deriveProductAvailability } from "@/lib/product-availability";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SellerSession } from "@/lib/seller-types";
import type {
  SellerEnquiryStatus,
  SellerProductStatus,
  SellerStudioEnquiry,
  SellerStudioProduct,
  SellerStudioState,
} from "@/lib/seller-studio-types";
import type { Availability, Condition } from "@/lib/types";

export interface SellerReferenceOption {
  id: string;
  name: string;
  slug: string;
}

export interface SellerReferenceData {
  cities: SellerReferenceOption[];
  categories: SellerReferenceOption[];
}

type SellerStoreRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  area: string;
  category_tags: string[] | null;
  whatsapp_e164: string;
  facebook_url: string;
  tiktok_url: string;
  whatsapp_tone: "standard" | "warm" | "concise";
  collection_enabled: boolean;
  collection_area: string;
  collection_details: string;
  delivery_enabled: boolean;
  delivery_scope: "within_city" | "selected_areas" | "zambia_wide";
  delivery_fee_mode: "whatsapp" | "fixed" | "free";
  delivery_fee: number | string | null;
  delivery_details: string;
  exchange_policy: string;
  cancellation_policy: string;
  reply_expectation: string;
  logo_path: string | null;
  cover_path: string | null;
  status: string;
  seller_followup_status: string;
  version: number;
  updated_at: string;
  city: { id: string; name: string } | null;
};

type SellerProductRow = {
  id: string;
  slug: string;
  store_id: string;
  title: string;
  regular_price: number | string;
  promotion_price: number | string | null;
  category: { name: string } | null;
  audience: string;
  condition: string;
  primary_colour: string;
  description: string;
  details: string[] | null;
  status: string;
  last_availability_confirmed_at: string | null;
  made_here: boolean;
  featured: boolean;
  style_tags: string[] | null;
  occasion_tags: string[] | null;
  version: number;
  updated_at: string;
  product_images: Array<{ storage_path: string; sort_order: number; is_cover: boolean }>;
  product_variants: Array<{ id: string; label: string; stock_quantity: number; stock_reference_quantity: number; availability: string }>;
};

type SellerIntentRow = {
  id: string;
  reference: string;
  created_at: string;
  status: string;
  seller_followup_status: string;
  buyer_note: string | null;
  whatsapp_opened_at: string | null;
  buyer_marked_sent_at: string | null;
  order_intent_items: Array<{
    id: string;
    product_id: string | null;
    product_title_snapshot: string;
    variant_label_snapshot: string;
    image_url_snapshot: string | null;
    quantity: number;
    unit_price: number | string;
  }>;
};

function blankState(session: SellerSession, accountEmail: string, accountPendingEmail = ""): SellerStudioState {
  return {
    ...initialSellerStudioState,
    sellerName: session.sellerName,
    accountEmail,
    accountPendingEmail,
    store: { ...initialSellerStudioState.store },
    products: [],
    enquiries: [],
    drops: [],
    notifications: [],
    preferences: { ...initialSellerStudioState.preferences },
    audit: [],
  };
}

function publicUrl(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, bucket: "product-media" | "store-media", path: string | null) {
  return path ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : "";
}

function condition(value: string): Condition {
  if (value === "like_new") return "Like new";
  if (value === "good") return "Good";
  if (value === "made_to_order") return "Made to order";
  return "New";
}

function availability(row: SellerProductRow): Availability {
  return deriveProductAvailability(row.status, row.last_availability_confirmed_at, row.product_variants);
}

function mapProduct(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, row: SellerProductRow): SellerStudioProduct {
  const images = [...row.product_images].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order).map((image) => publicUrl(supabase, "product-media", image.storage_path));
  const status = (["draft", "published", "hidden", "sold_out", "archived"].includes(row.status) ? row.status : "draft") as SellerProductStatus;
  const effectivePrice = row.promotion_price === null ? Number(row.regular_price) : Number(row.promotion_price);
  return {
    id: row.id,
    slug: row.slug,
    storeId: row.store_id,
    title: row.title,
    price: effectivePrice,
    previousPrice: row.promotion_price === null ? undefined : Number(row.regular_price),
    category: row.category?.name ?? "Uncategorised",
    audience: row.audience,
    condition: condition(row.condition),
    color: row.primary_colour,
    description: row.description,
    details: row.details ?? [],
    images,
    variants: row.product_variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      color: row.primary_colour,
      colorHex: "#6f665f",
      available: variant.availability !== "unavailable" && (variant.stock_quantity > 0 || variant.availability === "made_to_order"),
      quantity: variant.stock_quantity,
    })),
    availability: availability(row),
    confirmedAt: row.last_availability_confirmed_at ?? row.updated_at,
    madeHere: row.made_here,
    featured: row.featured,
    vibes: row.style_tags ?? [],
    occasions: row.occasion_tags ?? [],
    status,
    updatedAt: row.updated_at,
    fulfilmentNote: "Availability and fulfilment are confirmed with the buyer before the WhatsApp handoff.",
    version: row.version,
  };
}

function mapEnquiry(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  row: SellerIntentRow,
): SellerStudioEnquiry {
  let status: SellerEnquiryStatus = "new";
  if (row.seller_followup_status === "contacted") status = "contacted";
  if (row.seller_followup_status === "awaiting_buyer") status = "awaiting_buyer";
  if (row.seller_followup_status === "closed") status = "closed";
  if (row.status === "seller_marked_sold") status = "completed_elsewhere";
  if (["unavailable", "cancelled", "expired"].includes(row.status)) status = "closed";
  const buyerSignal = row.buyer_marked_sent_at ? "buyer_marked_sent" : row.whatsapp_opened_at ? "whatsapp_opened" : "order_intent_created";
  const timeline = [{ id: `${row.id}-ready`, label: "Buyer created a seller-specific order review", at: row.created_at }];
  if (row.whatsapp_opened_at) timeline.push({ id: `${row.id}-opened`, label: "WhatsApp handoff opened", at: row.whatsapp_opened_at });
  if (row.buyer_marked_sent_at) timeline.push({ id: `${row.id}-sent`, label: "Buyer marked the enquiry as sent", at: row.buyer_marked_sent_at });
  return {
    id: row.id,
    reference: row.reference,
    createdAt: row.created_at,
    status,
    buyerSignal,
    buyerNote: row.buyer_note ?? undefined,
    lines: row.order_intent_items.map((item) => ({
      id: item.id,
      productId: item.product_id ?? "archived-product",
      title: item.product_title_snapshot,
      image: item.image_url_snapshot?.startsWith("http")
        ? item.image_url_snapshot
        : publicUrl(supabase, "product-media", item.image_url_snapshot),
      variantLabel: item.variant_label_snapshot,
      quantity: item.quantity,
      price: Number(item.unit_price),
    })),
    timeline,
  };
}

export async function getSellerStudioState(session: SellerSession): Promise<SellerStudioState> {
  const supabase = await createSupabaseServerClient();
  const [{ data: userData }, { data: sellerProfile }, { data: storeData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("seller_profiles").select("onboarding_step, onboarding_complete, preferences").eq("user_id", session.sellerId).maybeSingle(),
    supabase.from("stores").select("id, slug, name, tagline, description, area, category_tags, whatsapp_e164, facebook_url, tiktok_url, whatsapp_tone, collection_enabled, collection_area, collection_details, delivery_enabled, delivery_scope, delivery_fee_mode, delivery_fee, delivery_details, exchange_policy, cancellation_policy, reply_expectation, logo_path, cover_path, status, version, updated_at, city:cities(id,name)").eq("owner_id", session.sellerId).maybeSingle(),
  ]);
  const authUser = userData.user as (typeof userData.user & { new_email?: string }) | null;
  const state = blankState(session, authUser?.email ?? "", authUser?.new_email ?? "");
  state.onboardingStep = typeof sellerProfile?.onboarding_step === "number" ? sellerProfile.onboarding_step : 0;
  state.onboardingComplete = Boolean(sellerProfile?.onboarding_complete);
  if (sellerProfile?.preferences && typeof sellerProfile.preferences === "object" && !Array.isArray(sellerProfile.preferences)) {
    state.preferences = { ...state.preferences, ...(sellerProfile.preferences as Partial<typeof state.preferences>) };
  }
  if (!storeData) return state;

  const store = storeData as unknown as SellerStoreRow;
  state.store = {
    id: store.id,
    slug: store.slug,
    name: store.name,
    tagline: store.tagline,
    description: store.description,
    city: store.city?.name ?? "",
    cityId: store.city?.id ?? "",
    area: store.area,
    categories: store.category_tags ?? [],
    whatsapp: store.whatsapp_e164,
    facebookUrl: store.facebook_url,
    tiktokUrl: store.tiktok_url,
    whatsappTone: store.whatsapp_tone ?? "standard",
    collectionEnabled: store.collection_enabled,
    collectionArea: store.collection_area,
    collection: store.collection_details,
    deliveryEnabled: store.delivery_enabled,
    deliveryScope: store.delivery_scope ?? "within_city",
    deliveryFeeMode: store.delivery_fee_mode ?? "whatsapp",
    deliveryFee: store.delivery_fee === null ? undefined : Number(store.delivery_fee),
    delivery: store.delivery_details,
    exchanges: store.exchange_policy,
    cancellation: store.cancellation_policy,
    replyExpectation: store.reply_expectation,
    avatarImage: publicUrl(supabase, "store-media", store.logo_path),
    coverImage: publicUrl(supabase, "store-media", store.cover_path),
    operatingState: store.status === "published" ? "published" : store.status === "paused" ? "paused" : store.status === "archived" ? "archived" : "draft",
    updatedAt: store.updated_at,
    version: store.version,
  };

  const [{ data: productData }, { data: intentData }, { data: dropData }, { data: metricData }] = await Promise.all([
    supabase.from("products").select("id, slug, store_id, title, regular_price, promotion_price, category:categories(name), audience, condition, primary_colour, description, details, status, last_availability_confirmed_at, made_here, featured, style_tags, occasion_tags, version, updated_at, product_images(storage_path, sort_order, is_cover), product_variants(id, label, stock_quantity, stock_reference_quantity, availability)").eq("store_id", store.id).order("updated_at", { ascending: false }),
    supabase.from("order_intents").select("id, reference, created_at, status, seller_followup_status, buyer_note, whatsapp_opened_at, buyer_marked_sent_at, order_intent_items(id, product_id, product_title_snapshot, variant_label_snapshot, image_url_snapshot, quantity, unit_price)").eq("store_id", store.id).order("created_at", { ascending: false }).limit(100),
    supabase.from("drops").select("id, slug, title, subtitle, cover_path, status, published_at, updated_at, drop_products(product_id, sort_order)").eq("store_id", store.id).order("updated_at", { ascending: false }),
    supabase.rpc("get_seller_product_metrics"),
  ]);

  state.products = ((productData ?? []) as unknown as SellerProductRow[]).map((row) => mapProduct(supabase, row));
  state.productMetrics = Object.fromEntries(((metricData ?? []) as unknown as Array<Record<string, unknown>>).map((metric) => {
    const productId = String(metric.product_id);
    return [productId, {
      productId,
      rawViews7d: Number(metric.raw_views_7d ?? 0),
      uniqueViewers7d: Number(metric.unique_viewers_7d ?? 0),
      previousUniqueViewers7d: Number(metric.previous_unique_viewers_7d ?? 0),
      saves7d: Number(metric.unique_saves_7d ?? 0),
      orderReviews7d: Number(metric.order_reviews_7d ?? 0),
      orderIntents7d: Number(metric.order_intents_7d ?? 0),
      whatsappOpens7d: Number(metric.whatsapp_opens_7d ?? 0),
      buyerMarkedSent7d: Number(metric.buyer_marked_sent_7d ?? 0),
      refreshedAt: typeof metric.refreshed_at === "string" ? metric.refreshed_at : undefined,
    }];
  }));
  state.enquiries = ((intentData ?? []) as unknown as SellerIntentRow[]).map((row) => mapEnquiry(supabase, row));
  state.drops = ((dropData ?? []) as unknown as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: String(row.subtitle ?? ""),
    coverImage: publicUrl(supabase, "store-media", typeof row.cover_path === "string" ? row.cover_path : null),
    productIds: Array.isArray(row.drop_products) ? (row.drop_products as Array<{ product_id: string; sort_order: number }>).sort((a, b) => a.sort_order - b.sort_order).map((item) => item.product_id) : [],
    status: row.status === "published" ? "live" : row.status === "draft" ? "draft" : "past",
    publishedAt: typeof row.published_at === "string" ? row.published_at : undefined,
    updatedAt: String(row.updated_at),
  }));
  state.notifications = [
    ...state.enquiries.filter((enquiry) => enquiry.status === "new").slice(0, 5).map((enquiry) => ({ id: `enquiry-${enquiry.id}`, kind: "enquiry" as const, title: "New buyer enquiry", body: `${enquiry.reference} · ${enquiry.lines[0]?.title ?? "Order review"}`, href: `/seller/enquiries/${enquiry.reference}`, createdAt: enquiry.createdAt, read: false })),
    ...state.products.filter((product) => product.status === "published" && product.availability === "low").slice(0, 5).map((product) => ({ id: `stock-${product.id}`, kind: "inventory" as const, title: `${product.title} is running low`, body: "Confirm the remaining options before more buyers prepare an enquiry.", href: `/seller/products/${product.id}`, createdAt: product.confirmedAt, read: false })),
  ];
  return state;
}

export async function getSellerReferenceData(): Promise<SellerReferenceData> {
  const supabase = await createSupabaseServerClient();
  const [{ data: cities, error: cityError }, { data: categories, error: categoryError }] = await Promise.all([
    supabase.from("cities").select("id, name, slug").eq("active", true).order("name"),
    supabase.from("categories").select("id, name, slug").eq("active", true).order("sort_order"),
  ]);
  if (cityError || categoryError) throw new Error("SELLER_REFERENCE_DATA_UNAVAILABLE");
  return { cities: cities ?? [], categories: categories ?? [] };
}
