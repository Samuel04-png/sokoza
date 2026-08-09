import { z } from "zod";
import { getMarketplaceAdminClient, hashMarketplaceViewerKey, isLikelyAutomatedRequest } from "@/lib/marketplace-event-server";
import { getSellerSession } from "@/lib/seller-session";

const activitySchema = z.object({
  eventType: z.enum(["store_viewed", "search_submitted", "search_result_clicked"]),
  productId: z.uuid().optional(),
  storeId: z.uuid().optional(),
  sessionKey: z.string().min(16).max(120),
  idempotencyKey: z.uuid(),
}).superRefine((value, context) => {
  if (value.eventType === "store_viewed" && !value.storeId) context.addIssue({ code: "custom", message: "Store required", path: ["storeId"] });
  if (value.eventType === "search_result_clicked" && !value.productId && !value.storeId) context.addIssue({ code: "custom", message: "Result required", path: ["productId"] });
});

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 2_048) return Response.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  const parsed = activitySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "INVALID_ACTIVITY_EVENT" }, { status: 400 });
  if (isLikelyAutomatedRequest(request.headers.get("user-agent") ?? "")) return Response.json({ accepted: false }, { status: 202 });
  const admin = getMarketplaceAdminClient();
  const sessionHash = hashMarketplaceViewerKey(parsed.data.sessionKey);
  if (!admin || !sessionHash) return Response.json({ accepted: true, persistence: "unavailable" }, { status: 202 });
  const seller = await getSellerSession();
  if (parsed.data.eventType === "store_viewed" && seller?.storeId === parsed.data.storeId) return Response.json({ accepted: false, reason: "seller_self_view" }, { status: 202 });
  const { error } = await admin.rpc("capture_marketplace_activity_server", {
    p_event_type: parsed.data.eventType,
    p_product_id: parsed.data.productId ?? null,
    p_store_id: parsed.data.storeId ?? null,
    p_actor_seller_id: null,
    p_session_key_hash: sessionHash,
    p_idempotency_key: parsed.data.idempotencyKey,
  });
  return error ? Response.json({ error: "ACTIVITY_NOT_RECORDED" }, { status: 503 }) : Response.json({ accepted: true }, { status: 202 });
}
