import { describe, expect, it } from "vitest";
import { collectionTemplates, deliveryTemplates, hasValidFulfilment, whatsappPreview } from "@/lib/store-fulfilment";

const input = { city: "Lusaka", area: "Kabulonga", deliveryScope: "within_city" as const, deliveryFeeMode: "whatsapp" as const };

describe("Store fulfilment templates", () => {
  it("resolves collection variables into buyer-ready copy", () => {
    expect(collectionTemplates(input)[0].text).toContain("Kabulonga, Lusaka");
    expect(collectionTemplates(input)[0].text).not.toContain("{area}");
  });

  it("supports location-based delivery without unsupported promises", () => {
    const options = deliveryTemplates({ ...input, deliveryScope: "selected_areas" });
    expect(options[0].text).toContain("selected areas around Lusaka");
    expect(options[0].text).toContain("confirmed on WhatsApp");
  });

  it.each([
    [{ collectionEnabled: true, deliveryEnabled: false, collection: "Collection copy", delivery: "", deliveryFeeMode: "whatsapp" as const }, true],
    [{ collectionEnabled: false, deliveryEnabled: true, collection: "", delivery: "Delivery copy", deliveryFeeMode: "whatsapp" as const }, true],
    [{ collectionEnabled: true, deliveryEnabled: true, collection: "Collection copy", delivery: "Delivery copy", deliveryFeeMode: "whatsapp" as const }, true],
    [{ collectionEnabled: false, deliveryEnabled: false, collection: "", delivery: "", deliveryFeeMode: "whatsapp" as const }, false],
  ])("validates enabled fulfilment combinations", (value, expected) => {
    expect(hasValidFulfilment(value)).toBe(expected);
  });

  it("keeps authoritative preview fields while adapting fulfilment", () => {
    const message = whatsappPreview({ storeName: "THOKOZILE", tone: "warm", fulfilment: "collection" });
    expect(message).toContain("Order ref: SZ-4821");
    expect(message).toContain("Price shown: K450");
    expect(message).toContain("I'd like to collect this item.");
    expect(message).not.toContain("Colour:");
  });
});
