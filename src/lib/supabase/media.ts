"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type SellerMediaBucket = "product-media" | "store-media" | "verification-documents";

const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export async function uploadSellerImage(file: File, bucket: Exclude<SellerMediaBucket, "verification-documents">, entityId: string, purpose = "product") {
  const extension = imageTypes.get(file.type);
  if (!extension) throw new Error("Choose a JPG, PNG, WebP or AVIF image.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Images must be 8 MB or smaller.");

  const supabase = createSupabaseBrowserClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null;
  if (claimsError || !userId) throw new Error("Your seller session expired. Sign in and try again.");

  const safeEntity = entityId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80) || "identity";
  const safePurpose = purpose.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40) || "media";
  const path = `${userId}/${safeEntity}/${safePurpose}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error("The image could not be uploaded. Please try again.");
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
