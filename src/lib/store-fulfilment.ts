export type DeliveryScope = "within_city" | "selected_areas" | "zambia_wide";
export type DeliveryFeeMode = "whatsapp" | "fixed" | "free";

export interface FulfilmentTemplateInput {
  city: string;
  area: string;
  deliveryScope: DeliveryScope;
  deliveryFeeMode: DeliveryFeeMode;
  deliveryFee?: number;
}

function values(input: FulfilmentTemplateInput) {
  return {
    city: input.city.trim() || "your city",
    area: input.area.trim() || "your area",
  };
}

export function collectionTemplates(input: FulfilmentTemplateInput) {
  const { city, area } = values(input);
  return [
    {
      id: "simple" as const,
      label: "Simple",
      text: `Collection is available around ${area}, ${city}. Timing and exact location are confirmed on WhatsApp.`,
    },
    {
      id: "arrangement" as const,
      label: "By arrangement",
      text: `Collection can be arranged in ${area}, ${city}. Message the Store on WhatsApp to confirm the collection point and time.`,
    },
  ];
}

export function deliveryTemplates(input: FulfilmentTemplateInput) {
  const { city } = values(input);
  const fee = input.deliveryFeeMode === "free"
    ? "Delivery is free."
    : input.deliveryFeeMode === "fixed"
      ? `The delivery fee is K${Math.max(0, input.deliveryFee ?? 0).toLocaleString("en-ZM")}.`
      : "Delivery fee and timing are confirmed on WhatsApp.";
  const scope = input.deliveryScope === "zambia_wide"
    ? "Zambia-wide delivery by courier can be arranged."
    : input.deliveryScope === "selected_areas"
      ? `Delivery is available in selected areas around ${city}. Send your location on WhatsApp to confirm availability.`
      : `Delivery is available within ${city}.`;
  return [
    { id: "simple" as const, label: "Simple", text: `${scope} ${fee}` },
    {
      id: "location" as const,
      label: "Location based",
      text: `Delivery is available in selected areas around ${city}. Send your location on WhatsApp for the delivery fee and estimated time.`,
    },
  ];
}

export function hasValidFulfilment(input: {
  collectionEnabled: boolean;
  deliveryEnabled: boolean;
  collection: string;
  delivery: string;
  deliveryFeeMode: DeliveryFeeMode;
  deliveryFee?: number;
}) {
  if (!input.collectionEnabled && !input.deliveryEnabled) return false;
  if (input.collectionEnabled && !input.collection.trim()) return false;
  if (input.deliveryEnabled && !input.delivery.trim()) return false;
  if (input.deliveryEnabled && input.deliveryFeeMode === "fixed" && (input.deliveryFee === undefined || input.deliveryFee < 0)) return false;
  return true;
}

export function whatsappPreview(input: { storeName: string; tone: "standard" | "warm" | "concise"; fulfilment: "collection" | "delivery" | "none" }) {
  const greeting = input.tone === "concise"
    ? `Hi ${input.storeName}. SOKOZA enquiry SZ-4821:`
    : input.tone === "warm"
      ? `Hi ${input.storeName} — I found this piece on SOKOZA and I'd like to check availability.`
      : `Hi ${input.storeName},\n\nI found this piece on SOKOZA.`;
  const fulfilment = input.fulfilment === "collection"
    ? "\nI'd like to collect this item."
    : input.fulfilment === "delivery"
      ? "\nI'd like delivery to Kabulonga."
      : "";
  return `${greeting}\n\nOrder ref: SZ-4821\nItem: Black Midi Dress\nSize: M\nQuantity: 1\nPrice shown: K450${fulfilment}\n\nIs it available?`;
}
