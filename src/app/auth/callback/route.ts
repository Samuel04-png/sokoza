import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeSellerDestination } from "@/lib/seller-session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const destination = safeSellerDestination(url.searchParams.get("next") ?? "/seller/onboarding");

  if (!code) return NextResponse.redirect(new URL("/seller/sign-in?expired=1", url));
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/seller/sign-in?expired=1", url));
  return NextResponse.redirect(new URL(destination, url));
}

