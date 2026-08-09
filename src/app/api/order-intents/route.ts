import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateGuestSession, setGuestSessionCookie } from "@/lib/guest-session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hashMarketplaceViewerKey } from "@/lib/marketplace-event-server";
import {
  buildWhatsAppOrderLink,
  buildWhatsAppOrderMessage,
  type AuthoritativeOrderIntent,
} from "@/lib/whatsapp-order";

const itemSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid(),
  quantity: z.number().int().min(1).max(20),
  expectedPrice: z.number().nonnegative().max(100_000_000),
});

const createSchema = z.object({
  storeId: z.uuid(),
  idempotencyKey: z.uuid(),
  items: z.array(itemSchema).min(1).max(20),
  note: z.string().trim().max(1000).optional(),
  fulfilment: z.enum(["ask", "collection", "delivery"]).default("ask"),
}).superRefine((value, context) => {
  const keys = value.items.map((item) => `${item.productId}:${item.variantId}`);
  if (new Set(keys).size !== keys.length) context.addIssue({ code: "custom", message: "Duplicate variants are not allowed.", path: ["items"] });
});

const updateSchema = z.object({
  orderIntentId: z.uuid(),
  status: z.enum(["whatsapp_opened", "buyer_marked_sent"]),
});

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

function publicSiteOrigin(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin;
}

function mapIntent(value: unknown): AuthoritativeOrderIntent | null {
  const parsed = z.object({
    id: z.uuid(), reference: z.string(), storeId: z.uuid(), storeName: z.string(), whatsapp: z.string(),
    status: z.string(), subtotal: z.coerce.number(), buyerNote: z.string().nullable().optional(), createdAt: z.string(),
    items: z.array(z.object({
      id: z.uuid(), productId: z.uuid(), variantId: z.uuid(), title: z.string(), variantLabel: z.string(),
      productUrl: z.string().nullable().optional(), imageUrl: z.string().nullable().optional(), unitPrice: z.coerce.number(), quantity: z.number().int(), subtotal: z.coerce.number(),
    })),
  }).safeParse(value);
  return parsed.success ? parsed.data : null;
}

async function resolveIntentProducts(
  intent: AuthoritativeOrderIntent,
  admin: ReturnType<typeof createSupabaseAdminClient>,
  siteOrigin: string,
) {
  const productIds = [...new Set(intent.items.map((item) => item.productId))];
  const { data } = await admin.from("products").select("id, slug").in("id", productIds);
  const slugs = new Map((data ?? []).map((product) => [product.id, product.slug]));
  return {
    ...intent,
    items: intent.items.map((item) => ({
      ...item,
      productUrl: slugs.get(item.productId)
        ? new URL(`/products/${slugs.get(item.productId)}`, siteOrigin).toString()
        : null,
      imageUrl: item.imageUrl && !item.imageUrl.startsWith("http")
        ? admin.storage.from("product-media").getPublicUrl(item.imageUrl).data.publicUrl
        : item.imageUrl,
    })),
  };
}

async function captureQualifiedIntentEvents(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  intent: AuthoritativeOrderIntent,
  eventType: "order_intent_created" | "whatsapp_opened" | "buyer_marked_enquiry_sent",
  sessionHash: string,
) {
  const intentHash = hashMarketplaceViewerKey(intent.id);
  if (!intentHash) return;
  await Promise.all(intent.items.map((item) => admin.rpc("capture_marketplace_event_server", {
    p_event_type: eventType,
    p_product_id: item.productId,
    p_store_id: intent.storeId,
    p_session_key_hash: sessionHash,
    p_viewer_key_hash: sessionHash,
    p_view_kind: null,
    p_order_intent_id: intent.id,
    p_intent_key_hash: intentHash,
    p_idempotency_key: crypto.randomUUID(),
  })));
}

function databaseFailure(error: { message?: string } | null) {
  const code = error?.message?.match(/(PRICE_CHANGED|PRODUCT_UNAVAILABLE|VARIANT_UNAVAILABLE|INSUFFICIENT_STOCK|STORE_UNAVAILABLE|INVALID_[A-Z_]+|ORDER_INTENT_NOT_FOUND)/)?.[1];
  if (code) return NextResponse.json({ error: code }, { status: code === "ORDER_INTENT_NOT_FOUND" ? 404 : 409 });
  return NextResponse.json({ error: "ORDER_SERVICE_UNAVAILABLE" }, { status: 503 });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 16_384) return NextResponse.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_ORDER_REVIEW" }, { status: 400 });

  const guest = await getOrCreateGuestSession();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("create_order_intent_server", {
    p_guest_token_hash: guest.tokenHash,
    p_store_id: parsed.data.storeId,
    p_items: parsed.data.items.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
    p_idempotency_key: parsed.data.idempotencyKey,
    p_buyer_note: parsed.data.note ?? null,
  });
  if (error) return databaseFailure(error);
  const mappedIntent = mapIntent(data);
  if (!mappedIntent) return NextResponse.json({ error: "INVALID_ORDER_RESPONSE" }, { status: 503 });
  const intent = await resolveIntentProducts(mappedIntent, admin, publicSiteOrigin(request));
  await captureQualifiedIntentEvents(admin, intent, "order_intent_created", guest.tokenHash);
  const expected = new Map(parsed.data.items.map((item) => [`${item.productId}:${item.variantId}`, item.expectedPrice]));
  const priceChanges = intent.items.flatMap((item) => {
    const previous = expected.get(`${item.productId}:${item.variantId}`);
    return previous !== undefined && previous !== item.unitPrice ? [{ productId: item.productId, variantId: item.variantId, previousPrice: previous, currentPrice: item.unitPrice }] : [];
  });
  const message = buildWhatsAppOrderMessage(intent, parsed.data.fulfilment);
  const response = NextResponse.json({ intent, priceChanges, whatsappUrl: buildWhatsAppOrderLink(intent, message), message });
  if (guest.isNew) setGuestSessionCookie(response, guest.rawToken);
  return response;
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_STATUS_UPDATE" }, { status: 400 });
  const guest = await getOrCreateGuestSession();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("update_guest_order_intent_status_server", {
    p_guest_token_hash: guest.tokenHash,
    p_order_intent_id: parsed.data.orderIntentId,
    p_status: parsed.data.status,
  });
  if (error) return databaseFailure(error);
  const mappedIntent = mapIntent(data);
  if (!mappedIntent) return NextResponse.json({ error: "INVALID_ORDER_RESPONSE" }, { status: 503 });
  const intent = await resolveIntentProducts(mappedIntent, admin, publicSiteOrigin(request));
  await captureQualifiedIntentEvents(admin, intent, parsed.data.status === "whatsapp_opened" ? "whatsapp_opened" : "buyer_marked_enquiry_sent", guest.tokenHash);
  const response = NextResponse.json({ intent });
  if (guest.isNew) setGuestSessionCookie(response, guest.rawToken);
  return response;
}

export async function GET(request: Request) {
  const guest = await getOrCreateGuestSession();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("list_guest_order_intents_server", { p_guest_token_hash: guest.tokenHash });
  if (error) return databaseFailure(error);
  const mappedIntents = (Array.isArray(data) ? data : []).map(mapIntent).filter((intent): intent is AuthoritativeOrderIntent => Boolean(intent));
  const intents = await Promise.all(mappedIntents.map((intent) => resolveIntentProducts(intent, admin, publicSiteOrigin(request))));
  const response = NextResponse.json({ intents });
  if (guest.isNew) setGuestSessionCookie(response, guest.rawToken);
  return response;
}
