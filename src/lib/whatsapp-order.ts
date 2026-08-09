import { formatPrice } from "@/lib/format";

export interface AuthoritativeOrderIntent {
  id: string;
  reference: string;
  storeId: string;
  storeName: string;
  whatsapp: string;
  status: string;
  subtotal: number;
  buyerNote?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    title: string;
    variantLabel: string;
    productUrl?: string | null;
    imageUrl?: string | null;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
}

export function buildWhatsAppOrderMessage(
  intent: AuthoritativeOrderIntent,
  fulfilment: "ask" | "collection" | "delivery" = "ask",
) {
  const preference = fulfilment === "ask" ? "Please advise" : fulfilment === "collection" ? "Collection" : "Delivery";
  const productLines = intent.items.flatMap((item, index) => [
    `${index + 1}. ${item.title} — ${item.variantLabel} — ${item.quantity} × ${formatPrice(item.unitPrice)}`,
    item.productUrl ? `Product: ${item.productUrl}` : "",
    item.imageUrl ? `Photo: ${item.imageUrl}` : "",
  ].filter(Boolean));
  return [
    `Hello ${intent.storeName}, I found these items on SOKOZA.`,
    "",
    `Order enquiry ${intent.reference}`,
    ...productLines,
    "",
    `Item value: ${formatPrice(intent.subtotal)}`,
    `Preferred fulfilment: ${preference}`,
    intent.buyerNote ? `Note: ${intent.buyerNote}` : "",
    "",
    "Please confirm availability and next steps. Payment and fulfilment will be arranged with you.",
  ].filter((line, index, all) => line !== "" || all[index - 1] !== "").join("\n");
}

export function buildWhatsAppOrderLink(intent: AuthoritativeOrderIntent, message: string) {
  const destination = intent.whatsapp.replace(/[^0-9]/g, "");
  if (!/^\d{10,15}$/.test(destination)) return null;
  return `https://wa.me/${destination}?text=${encodeURIComponent(message)}`;
}
