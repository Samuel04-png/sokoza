import type { Availability, Condition, ProductVariant } from "@/lib/types";

export type PersistedVariantAvailability = "available" | "low" | "made_to_order" | "unavailable";

export function canonicalVariantAvailability(
  productAvailability: Availability,
  productCondition: Condition,
  quantity = 0,
): PersistedVariantAvailability {
  if (productAvailability === "sold" || productAvailability === "stale") return "unavailable";
  if (productCondition === "Made to order") return "made_to_order";
  if (quantity < 1) return "unavailable";
  return productAvailability === "low" ? "low" : "available";
}

export function normalizeProductVariants(
  variants: ProductVariant[],
  productAvailability: Availability,
  productCondition: Condition,
) {
  return variants.map((variant) => ({
    ...variant,
    available: canonicalVariantAvailability(
      productAvailability,
      productCondition,
      variant.quantity ?? 0,
    ) !== "unavailable",
  }));
}

export function hasSellableVariant(
  variants: ProductVariant[],
  productAvailability: Availability,
  productCondition: Condition,
) {
  return variants.some((variant) =>
    Boolean(variant.label.trim()) &&
    canonicalVariantAvailability(productAvailability, productCondition, variant.quantity ?? 0) !== "unavailable"
  );
}
