import { describe, expect, it } from "vitest";
import { buildWhatsAppOrderLink, buildWhatsAppOrderMessage, type AuthoritativeOrderIntent } from "@/lib/whatsapp-order";

const intent: AuthoritativeOrderIntent = {
  id: "intent-1",
  reference: "SZ-TEST123",
  storeId: "store-1",
  storeName: "Lima’s Closet",
  whatsapp: "+260971234567",
  status: "ready",
  subtotal: 700,
  createdAt: "2026-08-09T10:00:00.000Z",
  items: [{
    id: "line-1",
    productId: "product-1",
    variantId: "variant-1",
    title: "Gold Metallic Maxi Dress",
    variantLabel: "M",
    productUrl: "https://sokoza.example/products/gold-metallic-maxi-dress",
    imageUrl: "https://images.example/gold-dress.jpg",
    unitPrice: 350,
    quantity: 2,
    subtotal: 700,
  }],
};

describe("WhatsApp order enquiry", () => {
  it("identifies every item with its product page and photo", () => {
    const message = buildWhatsAppOrderMessage(intent, "delivery");
    expect(message).toContain("Gold Metallic Maxi Dress — M — 2 × K350");
    expect(message).toContain("Product: https://sokoza.example/products/gold-metallic-maxi-dress");
    expect(message).toContain("Photo: https://images.example/gold-dress.jpg");
  });

  it("encodes the complete visual enquiry into the WhatsApp deep link", () => {
    const message = buildWhatsAppOrderMessage(intent);
    const link = buildWhatsAppOrderLink(intent, message);
    expect(link).toContain("https://wa.me/260971234567?text=");
    expect(decodeURIComponent(link ?? "")).toContain(intent.items[0].productUrl);
    expect(decodeURIComponent(link ?? "")).toContain(intent.items[0].imageUrl);
  });
});
