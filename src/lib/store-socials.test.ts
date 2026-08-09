import { describe, expect, it } from "vitest";
import { normalizeStoreSocialUrl } from "@/lib/store-socials";

describe("normalizeStoreSocialUrl", () => {
  it("normalizes approved social hosts", () => {
    expect(normalizeStoreSocialUrl("tiktok.com/@tkays", "tiktok")).toBe("https://tiktok.com/@tkays");
    expect(normalizeStoreSocialUrl("https://www.facebook.com/tkays#about", "facebook")).toBe("https://www.facebook.com/tkays");
  });

  it("rejects lookalike, insecure and wrong-network URLs", () => {
    expect(normalizeStoreSocialUrl("https://tiktok.com.evil.example/@tkays", "tiktok")).toBeNull();
    expect(normalizeStoreSocialUrl("http://tiktok.com/@tkays", "tiktok")).toBeNull();
    expect(normalizeStoreSocialUrl("https://facebook.com/tkays", "tiktok")).toBeNull();
  });
});
