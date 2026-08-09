import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const GUEST_COOKIE = "sokoza_guest_session";

export async function getOrCreateGuestSession() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_COOKIE)?.value;
  const rawToken = existing && existing.length >= 32 ? existing : randomBytes(32).toString("base64url");
  return {
    rawToken,
    tokenHash: createHash("sha256").update(rawToken).digest("hex"),
    isNew: !existing,
  };
}

export function setGuestSessionCookie(response: Response & { cookies?: { set(name: string, value: string, options: Record<string, unknown>): void } }, rawToken: string) {
  response.cookies?.set(GUEST_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    priority: "high",
  });
}

