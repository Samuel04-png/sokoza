import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSellerSession } from "@/lib/seller-session";
import type { SellerVerificationItem, SellerVerificationRepository } from "@/lib/seller-types";

const labels = {
  whatsapp: { id: "phone", label: "WhatsApp number", publicLabel: "WhatsApp number verified" },
  identity: { id: "identity", label: "Seller identity", publicLabel: "Identity verified" },
  business: { id: "business", label: "Business details", publicLabel: "Business verified" },
} as const;

export const sellerVerificationRepository: SellerVerificationRepository = {
  async listCurrent() {
    const session = await requireSellerSession("/seller/verification");
    if (!session.storeId) {
      return Object.values(labels).map((item) => ({ ...item, state: "not_started" as const, detail: "Complete Store setup before submitting this check." }));
    }
    const { data } = await (await createSupabaseServerClient())
      .from("store_verifications")
      .select("verification_type, state, reviewed_at, public_label")
      .eq("store_id", session.storeId);
    const rows = new Map((data ?? []).map((row) => [row.verification_type, row]));
    return (Object.keys(labels) as Array<keyof typeof labels>).map((type) => {
      const row = rows.get(type);
      const base = labels[type];
      const state = row?.state === "verified" ? "verified" : row?.state === "pending" ? "pending" : row?.state === "rejected" ? "requires_update" : "not_started";
      return {
        id: base.id,
        label: base.label,
        state,
        checkedAt: row?.reviewed_at ?? undefined,
        detail: state === "verified" ? "This check was reviewed and is current." : state === "pending" ? "Evidence is awaiting review." : state === "requires_update" ? "Updated evidence is required before this label is public." : "This check has not been submitted.",
        publicLabel: state === "verified" ? row?.public_label || base.publicLabel : undefined,
      } satisfies SellerVerificationItem;
    });
  },
};

