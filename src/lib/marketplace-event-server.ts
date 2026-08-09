import "server-only";

import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export function getMarketplaceAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function hashMarketplaceViewerKey(value: string) {
  const secret = process.env.MARKETPLACE_EVENT_SALT ?? process.env.SUPABASE_SECRET_KEY;
  if (!secret) return null;
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function isLikelyAutomatedRequest(userAgent: string) {
  return /bot|crawler|spider|headless|lighthouse|preview|slurp|bingpreview/i.test(userAgent);
}
