import { z } from "zod";
import {
  getMarketplaceAdminClient,
  hashMarketplaceViewerKey,
  isLikelyAutomatedRequest,
} from "@/lib/marketplace-event-server";
import { MARKETPLACE_EVENT_TYPES } from "@/lib/marketplace-ranking";
import { getSellerSession } from "@/lib/seller-session";

const eventSchema = z.object({
  eventType: z.enum(MARKETPLACE_EVENT_TYPES),
  productId: z.string().min(1).max(100),
  storeId: z.string().min(1).max(100),
  sessionKey: z.string().min(16).max(120),
  viewKind: z.enum(["raw", "meaningful"]).optional(),
  intentKey: z.string().max(120).optional(),
  orderIntentId: z.uuid().optional(),
  idempotencyKey: z.uuid(),
}).superRefine((value, context) => {
  if (value.eventType === "product_viewed" && !value.viewKind) {
    context.addIssue({ code: "custom", message: "Product views require a view kind.", path: ["viewKind"] });
  }
  if (value.eventType !== "product_viewed" && value.viewKind) {
    context.addIssue({ code: "custom", message: "Only product views accept a view kind.", path: ["viewKind"] });
  }
});

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid event origin." }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 4_096) return Response.json({ error: "Event payload too large." }, { status: 413 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid event payload." }, { status: 400 });
  }
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid event payload." }, { status: 400 });

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isLikelyAutomatedRequest(userAgent)) return Response.json({ accepted: false, reason: "automated" }, { status: 202 });

  const admin = getMarketplaceAdminClient();
  const sessionHash = hashMarketplaceViewerKey(parsed.data.sessionKey);
  const intentHash = parsed.data.intentKey ? hashMarketplaceViewerKey(parsed.data.intentKey) : null;
  if (!admin || !sessionHash) {
    return Response.json({ accepted: true, persistence: "local" }, { status: 202 });
  }

  if (!z.uuid().safeParse(parsed.data.productId).success || !z.uuid().safeParse(parsed.data.storeId).success) {
    return Response.json({ error: "Production events require canonical entity identifiers." }, { status: 422 });
  }

  const sellerSession = await getSellerSession();
  const sellerSelfView = parsed.data.eventType === "product_viewed" && sellerSession?.storeId === parsed.data.storeId;
  if (sellerSelfView) return Response.json({ accepted: false, reason: "seller_self_view" }, { status: 202 });

  const { error } = await admin.rpc("capture_marketplace_event_server", {
    p_event_type: parsed.data.eventType,
    p_product_id: parsed.data.productId,
    p_store_id: parsed.data.storeId,
    p_session_key_hash: sessionHash,
    p_viewer_key_hash: sessionHash,
    p_view_kind: parsed.data.viewKind ?? null,
    p_order_intent_id: parsed.data.orderIntentId ?? null,
    p_intent_key_hash: intentHash,
    p_idempotency_key: parsed.data.idempotencyKey,
  });
  if (error) return Response.json({ error: "Event could not be recorded." }, { status: 503 });
  return Response.json({ accepted: true }, { status: 202 });
}
