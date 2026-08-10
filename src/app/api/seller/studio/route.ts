import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSellerSession } from "@/lib/seller-session";
import { getMarketplaceAdminClient } from "@/lib/marketplace-event-server";
import { normalizeZambianWhatsApp } from "@/lib/seller-store";
import { normalizeStoreSocialUrl } from "@/lib/store-socials";
import { canonicalVariantAvailability, hasSellableVariant } from "@/lib/seller-product-readiness";
import { classifyProductVibes } from "@/lib/product-vibes";
import { classifyProductTaxonomy } from "@/lib/product-taxonomy";
import { hasExplicitMadeHereEvidence } from "@/lib/discovery-sections";
import { productSlug } from "@/lib/product-slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const storeSchema = z.object({
  id: z.string(), version: z.number().int().positive(), slug: z.string(), name: z.string().trim().min(2).max(100),
  tagline: z.string().max(90), description: z.string().max(1000), city: z.string().min(2).max(100), area: z.string().max(120),
  categories: z.array(z.string().max(80)).max(10), whatsapp: z.string().max(40), collection: z.string().max(1000), delivery: z.string().max(1000),
  facebookUrl: z.string().max(500).default(""), tiktokUrl: z.string().max(500).default(""),
  exchanges: z.string().max(1500), cancellation: z.string().max(1500), replyExpectation: z.string().max(180),
  avatarImage: z.string().max(3000), coverImage: z.string().max(3000), operatingState: z.enum(["draft", "published", "paused", "archived"]), updatedAt: z.string(),
  cityId: z.uuid().optional(), categoryIds: z.array(z.uuid()).max(10).optional(),
  whatsappTone: z.enum(["standard", "warm", "concise"]).default("standard"),
  collectionEnabled: z.boolean().default(false), collectionArea: z.string().max(120).default(""),
  deliveryEnabled: z.boolean().default(false), deliveryScope: z.enum(["within_city", "selected_areas", "zambia_wide"]).default("within_city"),
  deliveryFeeMode: z.enum(["whatsapp", "fixed", "free"]).default("whatsapp"), deliveryFee: z.number().min(0).max(100_000_000).optional(),
});

const variantSchema = z.object({
  id: z.string(), label: z.string().trim().min(1).max(160), color: z.string().max(80), colorHex: z.string(), available: z.boolean(), quantity: z.number().int().min(0).max(1_000_000).optional(),
});

const productSchema = z.object({
  id: z.string().optional(), version: z.number().int().positive().optional(), title: z.string().max(140), price: z.number().nonnegative().max(100_000_000),
  previousPrice: z.number().positive().max(100_000_000).optional(), category: z.string().min(2).max(80), audience: z.string().max(80),
  condition: z.enum(["New", "Like new", "Good", "Made to order"]), color: z.string().max(80), description: z.string().max(3000),
  details: z.array(z.string().max(300)).max(30), images: z.array(z.string().max(3000)).max(6), variants: z.array(variantSchema).min(1).max(100),
  availability: z.enum(["available", "low", "sold", "stale"]), madeHere: z.boolean(), vibes: z.array(z.string().max(80)).max(20),
  occasions: z.array(z.string().max(80)).max(20), fulfilmentNote: z.string().max(1000), status: z.enum(["draft", "published", "hidden", "sold_out", "archived"]),
  categoryId: z.uuid().optional(),
});

const onboardingProgressSchema = z.object({
  onboardingStep: z.number().int().min(0).max(6),
  onboardingComplete: z.boolean(),
});

const dropSchema = z.object({
  id: z.uuid(), slug: z.string().max(120), title: z.string().trim().min(2).max(120), subtitle: z.string().max(240),
  coverImage: z.string().max(3000), productIds: z.array(z.uuid()).max(100), status: z.enum(["draft", "live", "past"]),
  publishedAt: z.string().optional(),
});

const payloadSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("save_store"), store: storeSchema, onboarding: onboardingProgressSchema.optional() }),
  z.object({ operation: z.literal("save_store_draft"), store: storeSchema }),
  z.object({ operation: z.literal("publish_store"), storeId: z.uuid(), expectedVersion: z.number().int().positive() }),
  z.object({ operation: z.literal("pause_store"), storeId: z.uuid(), expectedVersion: z.number().int().positive() }),
  z.object({ operation: z.literal("archive_store"), storeId: z.uuid(), expectedVersion: z.number().int().positive() }),
  z.object({ operation: z.literal("save_product"), product: productSchema, onboarding: onboardingProgressSchema.optional() }),
  z.object({ operation: z.literal("set_product_status"), productId: z.uuid(), status: z.enum(["draft", "published", "hidden", "sold_out", "archived"]), expectedVersion: z.number().int().positive() }),
  z.object({ operation: z.literal("set_availability"), productIds: z.array(z.uuid()).min(1).max(100), availability: z.enum(["available", "low", "sold", "stale"]) }),
  z.object({ operation: z.literal("save_drop"), drop: dropSchema }),
  z.object({ operation: z.literal("archive_drop"), dropId: z.uuid() }),
  z.object({ operation: z.literal("set_enquiry_status"), enquiryId: z.uuid(), status: z.enum(["new", "contacted", "awaiting_buyer", "completed_elsewhere", "closed"]) }),
  z.object({ operation: z.literal("update_preferences"), preferences: z.object({ enquiryAlerts: z.boolean(), freshnessReminders: z.boolean(), weeklySummary: z.boolean(), compactCatalog: z.boolean() }).partial() }),
  z.object({ operation: z.literal("update_account"), sellerName: z.string().trim().min(2).max(120) }),
  z.object({ operation: z.literal("update_onboarding"), onboardingStep: z.number().int().min(0).max(6), onboardingComplete: z.boolean(), sellerName: z.string().min(2).max(120).optional() }),
]);

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

function slugify(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 100);
}

function storagePath(value: string, bucket: "product-media" | "store-media") {
  if (!value) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = value.indexOf(marker);
  if (index < 0) return null;
  try { return decodeURIComponent(value.slice(index + marker.length)); } catch { return null; }
}

function ownedStoragePath(value: string, bucket: "product-media" | "store-media", sellerId: string) {
  const path = storagePath(value, bucket);
  return path?.startsWith(`${sellerId}/`) ? path : null;
}

function condition(value: "New" | "Like new" | "Good" | "Made to order") {
  return value === "Like new" ? "like_new" : value === "Good" ? "good" : value === "Made to order" ? "made_to_order" : "new";
}

function failure(error: { message?: string; code?: string; details?: string } | null, fallback = "SAVE_FAILED", requestId = randomUUID()) {
  if (process.env.NODE_ENV !== "production") console.error(`[seller-studio] requestId=${requestId} fallback=${fallback} code=${error?.code ?? "unknown"} message=${error?.message ?? "unknown"} details=${error?.details ?? "none"}`);
  const typed = error?.message?.match(/(VERSION_CONFLICT|PRODUCT_NOT_READY|STORE_NOT_READY|FORBIDDEN|INVALID_[A-Z_]+|ORDER_INTENT_NOT_FOUND)/)?.[1];
  if (typed) return NextResponse.json({ error: typed }, { status: typed === "FORBIDDEN" ? 403 : typed.includes("CONFLICT") ? 409 : 422 });
  if (error?.code === "23505") return NextResponse.json({ error: "SLUG_CONFLICT" }, { status: 409 });
  const dependencyUnavailable = error?.code === "42P01" || error?.code === "PGRST205" || /timeout|connection|schema cache/i.test(error?.message ?? "");
  return NextResponse.json({ error: fallback, code: fallback, requestId }, { status: dependencyUnavailable ? 503 : 500 });
}

async function persistOnboardingProgress(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  sellerId: string,
  onboarding: z.infer<typeof onboardingProgressSchema> | undefined,
) {
  if (!onboarding) return null;
  const { error } = await supabase.from("seller_profiles").update({
    onboarding_step: onboarding.onboardingStep,
    onboarding_complete: onboarding.onboardingComplete,
  }).eq("user_id", sellerId);
  return error;
}

async function ensureSellerProfile(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  seller: { sellerId: string; sellerName: string },
) {
  const { data, error } = await supabase.from("seller_profiles").select("user_id").eq("user_id", seller.sellerId).maybeSingle();
  if (error || data) return error;
  const admin = getMarketplaceAdminClient();
  if (!admin) return { code: "SELLER_PROVISIONING_UNAVAILABLE", message: "Seller account provisioning is unavailable." };
  const { error: profileError } = await admin.from("profiles").upsert({
    id: seller.sellerId,
    full_name: seller.sellerName.slice(0, 120),
    role: "seller",
  });
  if (profileError) return profileError;
  const { error: sellerError } = await admin.from("seller_profiles").upsert(
    { user_id: seller.sellerId },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  return sellerError;
}

async function captureSellerActivity(eventType: "product_published" | "inventory_confirmed", sellerId: string, storeId: string, productId: string) {
  const admin = getMarketplaceAdminClient();
  if (!admin) return;
  await admin.rpc("capture_marketplace_activity_server", {
    p_event_type: eventType,
    p_product_id: productId,
    p_store_id: storeId,
    p_actor_seller_id: sellerId,
    p_session_key_hash: null,
    p_idempotency_key: randomUUID(),
  });
}

async function captureStoreOperation(eventType: "store_created" | "store_updated" | "store_published" | "store_paused" | "store_archived", sellerId: string, storeId: string, requestId: string) {
  const admin = getMarketplaceAdminClient();
  if (!admin) return;
  const { error } = await admin.rpc("capture_store_operational_event_server", {
    p_event_type: eventType,
    p_store_id: storeId,
    p_actor_seller_id: sellerId,
    p_request_id: requestId,
  });
  if (error && process.env.NODE_ENV !== "production") console.error("[seller-store-event]", { requestId, eventType, code: error.code, message: error.message });
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  if (!sameOrigin(request)) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 512_000) return NextResponse.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_SELLER_UPDATE", issues: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) }, { status: 422 });
  const session = await getSellerSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const supabase = await createSupabaseServerClient();

  if (parsed.data.operation === "save_store" || parsed.data.operation === "save_store_draft") {
    const provisioningError = await ensureSellerProfile(supabase, session);
    if (provisioningError) return failure(provisioningError, "SELLER_PROFILE_UNAVAILABLE", requestId);
    const store = parsed.data.store;
    const normalized = normalizeZambianWhatsApp(store.whatsapp);
    const facebookUrl = normalizeStoreSocialUrl(store.facebookUrl, "facebook");
    const tiktokUrl = normalizeStoreSocialUrl(store.tiktokUrl, "tiktok");
    if (facebookUrl === null || tiktokUrl === null) return NextResponse.json({ error: "INVALID_SOCIAL_URL", code: "INVALID_SOCIAL_URL", message: "Use a secure Facebook or TikTok profile link." }, { status: 422 });
    const cityQuery = supabase.from("cities").select("id, name").eq("active", true);
    const { data: city, error: cityError } = store.cityId
      ? await cityQuery.eq("id", store.cityId).maybeSingle()
      : await cityQuery.ilike("name", store.city).maybeSingle();
    if (cityError) return failure(cityError, "REFERENCE_DATA_UNAVAILABLE");
    if (!city) return NextResponse.json({ error: "INVALID_CITY", code: "INVALID_CITY", field: "cityId", message: "Choose a supported city." }, { status: 422 });
    let categoryNames = store.categories;
    if (store.categoryIds) {
      if (!store.categoryIds.length) return NextResponse.json({ error: "CATEGORY_REQUIRED", code: "CATEGORY_REQUIRED", field: "categoryIds", message: "Choose at least one category." }, { status: 422 });
      const { data: categories, error: categoryError } = await supabase.from("categories").select("id, name").eq("active", true).in("id", store.categoryIds);
      if (categoryError) return failure(categoryError, "REFERENCE_DATA_UNAVAILABLE");
      if (!categories || categories.length !== new Set(store.categoryIds).size) return NextResponse.json({ error: "INVALID_CATEGORY", code: "INVALID_CATEGORY", field: "categoryIds", message: "Choose supported categories." }, { status: 422 });
      categoryNames = categories.map((category) => category.name);
    }
    const canonicalSlug = store.id ? slugify(store.slug || store.name) : `${slugify(store.name)}-${session.sellerId.slice(0, 6)}`;
    const values = {
      slug: canonicalSlug, name: store.name, tagline: store.tagline, description: store.description,
      city_id: city.id, area: store.area, category_tags: categoryNames, whatsapp_e164: normalized.valid ? normalized.e164 : "",
      facebook_url: facebookUrl, tiktok_url: tiktokUrl,
      collection_details: store.collection, delivery_details: store.delivery, exchange_policy: store.exchanges,
      cancellation_policy: store.cancellation, reply_expectation: store.replyExpectation,
      logo_path: ownedStoragePath(store.avatarImage, "store-media", session.sellerId), cover_path: ownedStoragePath(store.coverImage, "store-media", session.sellerId),
      whatsapp_tone: store.whatsappTone,
      collection_enabled: store.collectionEnabled, collection_area: store.collectionArea,
      delivery_enabled: store.deliveryEnabled, delivery_scope: store.deliveryScope,
      delivery_fee_mode: store.deliveryFeeMode, delivery_fee: store.deliveryEnabled && store.deliveryFeeMode === "fixed" ? store.deliveryFee ?? 0 : null,
    };
    let saved: { id: string; version: number; slug: string; status?: string } | null = null;
    let created = false;
    if (!store.id) {
      const { data, error } = await supabase.from("stores").insert({ ...values, owner_id: session.sellerId }).select("id, version, slug, status").single();
      if (error || !data) return failure(error, "STORE_SAVE_FAILED", requestId);
      saved = { ...data, slug: canonicalSlug };
      created = true;
    } else {
      const { data, error } = await supabase.from("stores").update(values).eq("id", store.id).eq("owner_id", session.sellerId).eq("version", store.version).select("id, version, slug, status").maybeSingle();
      if (error) return failure(error, "STORE_SAVE_FAILED", requestId);
      if (!data) return NextResponse.json({ error: "VERSION_CONFLICT" }, { status: 409 });
      saved = data;
    }
    const onboardingError = parsed.data.operation === "save_store" ? await persistOnboardingProgress(supabase, session.sellerId, parsed.data.onboarding) : null;
    if (onboardingError) return failure(onboardingError, "ONBOARDING_SAVE_FAILED", requestId);
    await captureStoreOperation(created ? "store_created" : "store_updated", session.sellerId, saved.id, requestId);
    if (saved.status === "published" || saved.status === "paused") {
      revalidatePath("/");
      revalidatePath("/discover");
      revalidatePath("/stores");
      revalidatePath(`/stores/${saved.slug}`);
    }
    return NextResponse.json({ ok: true, created, requestId, store: { id: saved.id, version: saved.version, slug: saved.slug, status: saved.status ?? store.operatingState } });
  }

  if (parsed.data.operation === "publish_store" || parsed.data.operation === "pause_store" || parsed.data.operation === "archive_store") {
    const { data: existing, error: readError } = await supabase.from("stores").select("id, version, slug, status, published_at").eq("id", parsed.data.storeId).eq("owner_id", session.sellerId).maybeSingle();
    if (readError) return failure(readError, "STORE_STATUS_FAILED", requestId);
    if (!existing) return NextResponse.json({ error: "FORBIDDEN", requestId }, { status: 403 });
    if (existing.version !== parsed.data.expectedVersion) return NextResponse.json({ error: "VERSION_CONFLICT", requestId }, { status: 409 });
    if (parsed.data.operation === "publish_store" && existing.status === "published") return NextResponse.json({ ok: true, firstPublication: false, requestId, store: existing });
    const target = parsed.data.operation === "publish_store" ? "published" : parsed.data.operation === "pause_store" ? "paused" : "archived";
    const { data, error } = parsed.data.operation === "publish_store"
      ? await supabase.rpc("publish_store")
      : await supabase.rpc("set_store_operating_status", { p_status: target });
    if (error) return failure(error, "STORE_STATUS_FAILED", requestId);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.id) return failure(null, "STORE_STATUS_FAILED", requestId);
    const event = parsed.data.operation === "publish_store" ? "store_published" : parsed.data.operation === "pause_store" ? "store_paused" : "store_archived";
    await captureStoreOperation(event, session.sellerId, String(row.id), requestId);
    revalidatePath("/");
    revalidatePath("/discover");
    revalidatePath("/stores");
    if (typeof row.slug === "string") revalidatePath(`/stores/${row.slug}`);
    return NextResponse.json({ ok: true, firstPublication: parsed.data.operation === "publish_store" && !existing.published_at, requestId, store: row });
  }

  if (parsed.data.operation === "save_product") {
    if (!session.storeId) return NextResponse.json({ error: "STORE_REQUIRED" }, { status: 422 });
    const input = parsed.data.product;
    const productId = input.id && z.uuid().safeParse(input.id).success ? input.id : randomUUID();
    const taxonomy = classifyProductTaxonomy(input);
    const classifiedInput = { ...input, category: taxonomy.category, occasions: taxonomy.occasions, madeHere: input.madeHere || hasExplicitMadeHereEvidence(input) };
    const categoryQuery = supabase.from("categories").select("id, name").eq("active", true);
    const { data: category, error: categoryError } = await categoryQuery.ilike("name", taxonomy.category).maybeSingle();
    if (categoryError) return failure(categoryError, "REFERENCE_DATA_UNAVAILABLE");
    if (!category) return NextResponse.json({ error: "INVALID_CATEGORY", code: "INVALID_CATEGORY", field: "categoryId", message: "Choose a supported category." }, { status: 422 });
    const imagePaths = input.images.map((image) => ownedStoragePath(image, "product-media", session.sellerId)).filter((path): path is string => Boolean(path));
    if (input.status === "published") {
      const { data: store, error: storeError } = await supabase.from("stores").select("status").eq("id", session.storeId).eq("owner_id", session.sellerId).maybeSingle();
      if (storeError) return failure(storeError, "STORE_READ_FAILED", requestId);
      const publishReady =
        store?.status === "published" &&
        input.title.trim().length >= 2 &&
        input.description.trim().length >= 20 &&
        input.price > 0 &&
        imagePaths.length > 0 &&
        hasSellableVariant(input.variants, input.availability, input.condition);
      if (!publishReady) {
        return NextResponse.json({
          error: "PRODUCT_NOT_READY",
          code: "PRODUCT_NOT_READY",
          message: "Check the Store, photos, title, description, price, stock and availability before publishing.",
          requestId,
        }, { status: 422 });
      }
    }
    const { data: existingProduct, error: existingProductError } = await supabase
      .from("products")
      .select("id, status, slug, version")
      .eq("id", productId)
      .eq("store_id", session.storeId)
      .maybeSingle();
    if (existingProductError) return failure(existingProductError, "PRODUCT_READ_FAILED", requestId);

    const reduced = input.previousPrice !== undefined && input.previousPrice > input.price;
    const values = {
      store_id: session.storeId, category_id: category.id, slug: productSlug(input.title, productId, existingProduct?.slug),
      title: input.title, description: input.description, details: input.details.map((item) => item.trim()).filter(Boolean),
      condition: condition(input.condition), regular_price: reduced ? input.previousPrice : input.price,
      promotion_price: reduced ? input.price : null, primary_colour: input.color, style_tags: input.vibes,
      occasion_tags: taxonomy.occasions, audience: input.audience, made_here: classifiedInput.madeHere,
    };
    values.style_tags = classifyProductVibes(classifiedInput);
    let saved: { id: string; version: number; slug: string } | null = null;
    if (existingProduct) {
      const { store_id: _storeId, ...updateValues } = values;
      void _storeId;
      let query = supabase.from("products").update(updateValues).eq("id", productId).eq("store_id", session.storeId);
      if (input.version) query = query.eq("version", input.version);
      const { data, error } = await query.select("id, version, slug").maybeSingle();
      if (error) return failure(error, "PRODUCT_SAVE_FAILED", requestId);
      if (!data) {
        const { data: current } = await supabase.from("products").select("version, status").eq("id", productId).eq("store_id", session.storeId).maybeSingle();
        return NextResponse.json({ error: "VERSION_CONFLICT", code: "VERSION_CONFLICT", currentVersion: current?.version, currentStatus: current?.status, requestId }, { status: 409 });
      }
      saved = data;
    } else {
      const { data, error } = await supabase.from("products").insert({ id: productId, ...values }).select("id, version, slug").single();
      if (error || !data) return failure(error, "PRODUCT_SAVE_FAILED", requestId);
      saved = data;
    }

    const variantIds = input.variants.map((variant) => z.uuid().safeParse(variant.id).success ? variant.id : randomUUID());
    const { data: existingVariants } = await supabase.from("product_variants").select("id").eq("product_id", productId);
    const removeIds = (existingVariants ?? []).map((item) => item.id).filter((id) => !variantIds.includes(id));
    if (removeIds.length) {
      const { error } = await supabase.from("product_variants").delete().in("id", removeIds);
      if (error) return failure(error, "VARIANT_SAVE_FAILED");
    }
    for (const [index, variant] of input.variants.entries()) {
      const quantity = variant.quantity ?? 0;
      const variantAvailability = canonicalVariantAvailability(input.availability, input.condition, quantity);
      const { error } = await supabase.from("product_variants").upsert({ id: variantIds[index], product_id: productId, label: variant.label, stock_quantity: quantity, availability: variantAvailability, last_availability_confirmed_at: input.availability === "stale" ? null : new Date().toISOString() });
      if (error) return failure(error, "VARIANT_SAVE_FAILED");
    }

    const { error: deleteImagesError } = await supabase.from("product_images").delete().eq("product_id", productId);
    if (deleteImagesError) return failure(deleteImagesError, "IMAGE_SAVE_FAILED");
    if (imagePaths.length) {
      const { error } = await supabase.from("product_images").insert(imagePaths.map((path, index) => ({ product_id: productId, storage_path: path, sort_order: index, is_cover: index === 0, alt_text: input.title })));
      if (error) return failure(error, "IMAGE_SAVE_FAILED");
    }

    const statusChanged = existingProduct ? input.status !== existingProduct.status : input.status !== "draft";
    if (statusChanged) {
      const functionName = input.status === "published" ? "publish_product" : "set_product_status";
      const args = input.status === "published"
        ? { p_product_id: productId, p_expected_version: saved.version }
        : { p_product_id: productId, p_status: input.status, p_expected_version: saved.version };
      const { data, error } = await supabase.rpc(functionName, args);
      if (error) {
        const { data: current } = await supabase.from("products").select("version, status").eq("id", productId).eq("store_id", session.storeId).maybeSingle();
        const typed = error.message?.match(/(VERSION_CONFLICT|PRODUCT_NOT_READY|STORE_NOT_READY|FORBIDDEN|INVALID_[A-Z_]+)/)?.[1];
        if (typed) {
          return NextResponse.json({
            error: typed,
            code: typed,
            message: typed === "PRODUCT_NOT_READY"
              ? "The product was saved as a draft, but publishing still needs a published Store, a photo, a complete description, a valid price and an in-stock option."
              : undefined,
            currentVersion: current?.version,
            currentStatus: current?.status,
            requestId,
          }, { status: typed.includes("CONFLICT") ? 409 : typed === "FORBIDDEN" ? 403 : 422 });
        }
        return failure(error, "PRODUCT_STATUS_FAILED", requestId);
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (row?.version) saved.version = row.version;
    }
    if (input.availability !== "stale") {
      const { error } = await supabase.rpc("confirm_product_inventory", { p_product_id: productId });
      if (error) return failure(error, "INVENTORY_SAVE_FAILED");
      const { data: refreshed } = await supabase.from("products").select("version").eq("id", productId).single();
      if (refreshed?.version) saved.version = refreshed.version;
    }
    if (input.status === "published" && existingProduct?.status !== "published") {
      await captureSellerActivity("product_published", session.sellerId, session.storeId, productId);
    }
    const onboardingError = await persistOnboardingProgress(supabase, session.sellerId, parsed.data.onboarding);
    if (onboardingError) return failure(onboardingError, "ONBOARDING_SAVE_FAILED");
    return NextResponse.json({ ok: true, id: productId, version: saved.version, slug: saved.slug, variantIds });
  }

  if (parsed.data.operation === "set_product_status") {
    const previous = await supabase.from("products").select("store_id, status").eq("id", parsed.data.productId).maybeSingle();
    const { data, error } = await supabase.rpc("set_product_status", { p_product_id: parsed.data.productId, p_status: parsed.data.status, p_expected_version: parsed.data.expectedVersion });
    if (error) return failure(error, "PRODUCT_STATUS_FAILED");
    if (parsed.data.status === "published" && previous.data?.status !== "published" && typeof previous.data?.store_id === "string") {
      await captureSellerActivity("product_published", session.sellerId, previous.data.store_id, parsed.data.productId);
    }
    return NextResponse.json({ ok: true, product: data });
  }

  if (parsed.data.operation === "set_availability") {
    if (!session.storeId) return NextResponse.json({ error: "STORE_REQUIRED" }, { status: 422 });
    const { data: owned } = await supabase.from("products").select("id, version, status").eq("store_id", session.storeId).in("id", parsed.data.productIds);
    if (!owned || owned.length !== parsed.data.productIds.length) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    const { data: variants, error: variantReadError } = await supabase.from("product_variants").select("id, stock_quantity").in("product_id", parsed.data.productIds);
    if (variantReadError) return failure(variantReadError, "INVENTORY_SAVE_FAILED");
    for (const variant of variants ?? []) {
      const next = parsed.data.availability === "sold" || variant.stock_quantity < 1 ? "unavailable" : parsed.data.availability === "low" ? "low" : "available";
      const { error } = await supabase.from("product_variants").update({ availability: next, last_availability_confirmed_at: new Date().toISOString() }).eq("id", variant.id);
      if (error) return failure(error, "INVENTORY_SAVE_FAILED");
    }
    for (const product of owned) {
      const status = parsed.data.availability === "sold" ? "sold_out" : product.status === "sold_out" ? "published" : product.status;
      if (status !== product.status) {
        const { error } = await supabase.rpc("set_product_status", { p_product_id: product.id, p_status: status, p_expected_version: product.version });
        if (error) return failure(error, "INVENTORY_SAVE_FAILED");
      }
      await supabase.rpc("confirm_product_inventory", { p_product_id: product.id });
      await captureSellerActivity("inventory_confirmed", session.sellerId, session.storeId, product.id);
    }
    const { data: refreshedProducts } = await supabase.from("products").select("id, version").in("id", parsed.data.productIds);
    return NextResponse.json({ ok: true, products: refreshedProducts ?? [] });
  }

  if (parsed.data.operation === "save_drop") {
    if (!session.storeId) return NextResponse.json({ error: "STORE_REQUIRED" }, { status: 422 });
    const drop = parsed.data.drop;
    const ownedProducts = drop.productIds.length
      ? (await supabase.from("products").select("id, status").eq("store_id", session.storeId).in("id", drop.productIds)).data ?? []
      : [];
    if (ownedProducts.length !== drop.productIds.length || (drop.status === "live" && ownedProducts.some((product) => product.status !== "published"))) return NextResponse.json({ error: "INVALID_DROP_PRODUCTS" }, { status: 422 });
    const values = {
      id: drop.id, store_id: session.storeId, slug: slugify(drop.slug || drop.title), title: drop.title, subtitle: drop.subtitle,
      cover_path: ownedStoragePath(drop.coverImage, "store-media", session.sellerId),
    };
    const { data: existingDrop } = await supabase.from("drops").select("id").eq("id", drop.id).eq("store_id", session.storeId).maybeSingle();
    const dropWrite = existingDrop
      ? supabase.from("drops").update({ slug: values.slug, title: values.title, subtitle: values.subtitle, cover_path: values.cover_path }).eq("id", drop.id).eq("store_id", session.storeId)
      : supabase.from("drops").insert(values);
    const { data, error } = await dropWrite.select("id, version, slug, status, published_at").single();
    if (error || !data) return failure(error, "DROP_SAVE_FAILED");
    const { error: clearError } = await supabase.from("drop_products").delete().eq("drop_id", drop.id);
    if (clearError) return failure(clearError, "DROP_PRODUCTS_SAVE_FAILED");
    if (drop.productIds.length) {
      const { error: linkError } = await supabase.from("drop_products").insert(drop.productIds.map((productId, index) => ({ drop_id: drop.id, product_id: productId, sort_order: index })));
      if (linkError) return failure(linkError, "DROP_PRODUCTS_SAVE_FAILED");
    }
    const canonicalStatus = drop.status === "live" ? "published" : drop.status === "past" ? "ended" : "draft";
    const { data: statusData, error: statusError } = await supabase.rpc("set_drop_status", { p_drop_id: drop.id, p_status: canonicalStatus });
    if (statusError) return failure(statusError, "DROP_STATUS_FAILED");
    return NextResponse.json({ ok: true, drop: statusData ?? data });
  }

  if (parsed.data.operation === "archive_drop") {
    if (!session.storeId) return NextResponse.json({ error: "STORE_REQUIRED" }, { status: 422 });
    const { data, error } = await supabase.rpc("set_drop_status", { p_drop_id: parsed.data.dropId, p_status: "ended" });
    if (error) return failure(error, "DROP_SAVE_FAILED");
    if (!data) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.operation === "set_enquiry_status") {
    const canonical = parsed.data.status === "completed_elsewhere" ? "seller_marked_sold" : parsed.data.status === "closed" ? "cancelled" : null;
    const followup = parsed.data.status === "completed_elsewhere" || parsed.data.status === "closed" ? "closed" : parsed.data.status;
    const { error } = await supabase.rpc("set_seller_order_intent_state", { p_order_intent_id: parsed.data.enquiryId, p_followup_status: followup, p_canonical_status: canonical });
    if (error) return failure(error, "ENQUIRY_SAVE_FAILED");
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.operation === "update_preferences") {
    const { data: current } = await supabase.from("seller_profiles").select("preferences").eq("user_id", session.sellerId).single();
    const preferences = current?.preferences && typeof current.preferences === "object" && !Array.isArray(current.preferences) ? current.preferences : {};
    const { error } = await supabase.from("seller_profiles").update({ preferences: { ...preferences, ...parsed.data.preferences } }).eq("user_id", session.sellerId);
    if (error) return failure(error, "PREFERENCES_SAVE_FAILED");
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.operation === "update_account") {
    const provisioningError = await ensureSellerProfile(supabase, session);
    if (provisioningError) return failure(provisioningError, "SELLER_PROFILE_UNAVAILABLE", requestId);
    const { error } = await supabase.from("profiles").update({ full_name: parsed.data.sellerName }).eq("id", session.sellerId);
    if (error) return failure(error, "PROFILE_SAVE_FAILED", requestId);
    const { error: metadataError } = await supabase.auth.updateUser({ data: { full_name: parsed.data.sellerName } });
    if (metadataError && process.env.NODE_ENV !== "production") {
      console.error("[seller-account-metadata]", { requestId, message: metadataError.message });
    }
    return NextResponse.json({ ok: true, sellerName: parsed.data.sellerName, requestId });
  }

  const profileValues: Record<string, unknown> = { onboarding_step: parsed.data.onboardingStep, onboarding_complete: parsed.data.onboardingComplete };
  const { error: onboardingError } = await supabase.from("seller_profiles").update(profileValues).eq("user_id", session.sellerId);
  if (onboardingError) return failure(onboardingError, "ONBOARDING_SAVE_FAILED");
  if (parsed.data.sellerName) {
    const { error } = await supabase.from("profiles").update({ full_name: parsed.data.sellerName }).eq("id", session.sellerId);
    if (error) return failure(error, "PROFILE_SAVE_FAILED");
  }
  return NextResponse.json({ ok: true });
}
