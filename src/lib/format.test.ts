import { describe, expect, it, vi } from "vitest";
import {
  availabilityLabel,
  createReference,
  formatPrice,
  verificationLabel,
} from "@/lib/format";

describe("buyer-facing formatting", () => {
  it("formats whole-number Zambian kwacha without a fake currency conversion", () => {
    expect(formatPrice(350)).toBe("K350");
    expect(formatPrice(1200)).toBe("K1,200");
  });

  it("uses factual availability and verification language", () => {
    expect(availabilityLabel("low")).toBe("Low stock · confirmed today");
    expect(availabilityLabel("stale")).toBe("Not recently confirmed");
    expect(verificationLabel("whatsapp")).toBe("WhatsApp number verified");
    expect(verificationLabel("business")).toBe("Business verified");
  });

  it("creates short SOKOZA enquiry references", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_754_646_400_000);
    expect(createReference()).toMatch(/^SKZ-[A-Z0-9]{5}$/);
    vi.restoreAllMocks();
  });
});
