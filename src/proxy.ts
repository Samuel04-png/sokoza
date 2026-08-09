import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

const sellerAuthPaths = new Set([
  "/seller/sign-in",
  "/seller/recover",
  "/seller/recover/update",
  "/seller/invite",
]);

export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSupabaseSession(request);
  const { pathname, search } = request.nextUrl;
  const isSellerWorkspace = pathname.startsWith("/seller") && !sellerAuthPaths.has(pathname);

  if (isSellerWorkspace && !claims?.sub) {
    const signInUrl = new URL("/seller/sign-in", request.url);
    signInUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (claims?.sub && pathname === "/seller/sign-in") {
    return NextResponse.redirect(new URL("/seller", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)"],
};
