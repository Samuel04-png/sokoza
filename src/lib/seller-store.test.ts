import { describe, expect, it } from "vitest";
import { calculateStoreCompletion, normalizeZambianWhatsApp } from "@/lib/seller-store";

describe("seller store normalization", () => {
  it.each([
    ["+260 97 123 4567", "+260971234567"],
    ["0971234567", "+260971234567"],
    ["971234567", "+260971234567"],
    ["260-97-123-4567", "+260971234567"],
  ])("normalizes %s to E.164", (input, expected) => {
    expect(normalizeZambianWhatsApp(input)).toEqual({
      digits: expected.slice(1),
      e164: expected,
      valid: true,
    });
  });

  it("rejects an incomplete or non-Zambian number", () => {
    expect(normalizeZambianWhatsApp("0971").valid).toBe(false);
    expect(normalizeZambianWhatsApp("+27 82 123 4567").valid).toBe(false);
  });

  it("derives setup completion from concrete publish-readiness fields", () => {
    const complete = {
      name: "NOIR",
      tagline: "Quiet forms.",
      description: "A considered Lusaka wardrobe studio.",
      city: "Lusaka",
      area: "Kabulonga",
      categories: ["Dresses"],
      whatsapp: "+260971234567",
      collection: "By arrangement.",
      delivery: "Seller-arranged.",
      exchanges: "Within 48 hours.",
      cancellation: "Before payment.",
      avatarImage: "/avatar.jpg",
      coverImage: "/cover.jpg",
    };

    expect(calculateStoreCompletion(complete)).toBe(100);
    expect(calculateStoreCompletion({ ...complete, cancellation: "" })).toBe(92);
  });
});
