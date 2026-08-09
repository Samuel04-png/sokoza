import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SellerSession } from "@/lib/seller-types";

export const getSellerSession = cache(async (): Promise<SellerSession | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as Record<string, unknown> | undefined;
  const sellerId = typeof claims?.sub === "string" ? claims.sub : null;
  if (error || !sellerId) return null;

  const verifiedClaims = claims ?? {};
  const userMetadata = verifiedClaims.user_metadata && typeof verifiedClaims.user_metadata === "object"
    ? verifiedClaims.user_metadata as Record<string, unknown>
    : {};
  const fallbackName = typeof userMetadata.full_name === "string" ? userMetadata.full_name : "Seller";

  const [{ data: profile }, { data: store }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", sellerId).maybeSingle(),
    supabase.from("stores").select("id, name, slug").eq("owner_id", sellerId).maybeSingle(),
  ]);

  return {
    sellerId,
    storeId: typeof store?.id === "string" ? store.id : "",
    sellerName: typeof profile?.full_name === "string" && profile.full_name ? profile.full_name : fallbackName,
    storeName: typeof store?.name === "string" && store.name ? store.name : "Your Store",
    storeSlug: typeof store?.slug === "string" ? store.slug : "",
    mode: "production",
  };
});

export const getSellerPreviewSession = getSellerSession;

export async function requireSellerSession(intendedPath = "/seller"): Promise<SellerSession> {
  const session = await getSellerSession();
  if (!session) {
    const safePath = safeSellerDestination(intendedPath);
    redirect(`/seller/sign-in?next=${encodeURIComponent(safePath)}`);
  }
  return session;
}

export const requireSellerPreviewSession = requireSellerSession;

export function safeSellerDestination(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") return "/seller";
  if (!value.startsWith("/seller") || value.startsWith("//")) return "/seller";
  if (value.startsWith("/seller/sign-in") || value === "/seller/recover") return "/seller";
  return value;
}
