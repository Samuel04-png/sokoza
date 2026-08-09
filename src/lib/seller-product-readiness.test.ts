import { describe, expect, it } from "vitest";
import { canonicalVariantAvailability, hasSellableVariant, normalizeProductVariants } from "@/lib/seller-product-readiness";

const variant = { id: "variant-1", label: "Midi", color: "Black", colorHex: "#000000", available: false, quantity: 1 };

describe("seller product readiness", () => {
  it("uses current quantity instead of a stale client availability flag", () => {
    expect(canonicalVariantAvailability("available", "New", 1)).toBe("available");
    expect(normalizeProductVariants([variant], "available", "New")[0].available).toBe(true);
    expect(hasSellableVariant([variant], "available", "New")).toBe(true);
  });

  it("does not publish an ordinary out-of-stock option", () => {
    expect(canonicalVariantAvailability("available", "New", 0)).toBe("unavailable");
    expect(hasSellableVariant([{ ...variant, quantity: 0 }], "available", "New")).toBe(false);
  });

  it("allows a made-to-order option without on-hand stock", () => {
    expect(canonicalVariantAvailability("available", "Made to order", 0)).toBe("made_to_order");
    expect(hasSellableVariant([{ ...variant, quantity: 0 }], "available", "Made to order")).toBe(true);
  });

  it("never treats sold or stale products as sellable", () => {
    expect(canonicalVariantAvailability("sold", "New", 4)).toBe("unavailable");
    expect(canonicalVariantAvailability("stale", "Made to order", 0)).toBe("unavailable");
  });
});
