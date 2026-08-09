import type { Availability } from "@/lib/types";

interface PersistedVariantStock {
  availability: string;
  stock_quantity: number;
  stock_reference_quantity?: number;
}

export function deriveProductAvailability(
  status: string,
  confirmedAt: string | null,
  variants: PersistedVariantStock[],
  now = Date.now(),
): Availability {
  const sellable = variants.filter((variant) =>
    variant.availability !== "unavailable" &&
    (variant.stock_quantity > 0 || variant.availability === "made_to_order")
  );

  if (status === "sold_out" || !sellable.length) return "sold";
  if (!confirmedAt || now - new Date(confirmedAt).getTime() > 14 * 24 * 60 * 60 * 1000) return "stale";
  const explicitlyLow = sellable.some((variant) => variant.availability === "low");
  const automaticallyLow = sellable.some((variant) => {
    const referenceQuantity = variant.stock_reference_quantity ?? variant.stock_quantity;
    return referenceQuantity >= 3 && variant.stock_quantity <= 3 && variant.stock_quantity < referenceQuantity;
  });
  return explicitlyLow || automaticallyLow ? "low" : "available";
}
