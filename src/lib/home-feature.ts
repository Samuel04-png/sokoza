import type { Product } from "@/lib/types";

export type HomeFeatureReason = "momentum" | "editorial" | "ranked";

export interface HomeFeatureSelection {
  product: Product;
  reason: HomeFeatureReason;
  label: string;
}

const isEligible = (product: Product) => product.availability !== "sold" && product.images.length > 0;

/**
 * Homepage feature hierarchy:
 * 1. A product with qualified recent marketplace momentum.
 * 2. An explicitly curated editorial product.
 * 3. The highest product from the marketplace's deterministic ranked catalog.
 *
 * The ranked catalog already weights enquiry intent above saves and meaningful
 * unique views, with inventory freshness and listing quality safeguards.
 */
export function selectHomeFeature(products: Product[], movingProducts: Product[]): HomeFeatureSelection | null {
  const moving = movingProducts.find(isEligible);
  if (moving) return { product: moving, reason: "momentum", label: "Getting attention" };

  const editorial = products.find((product) => product.featured && isEligible(product));
  if (editorial) return { product: editorial, reason: "editorial", label: "Selected by SOKOZA" };

  const ranked = products.find(isEligible);
  return ranked ? { product: ranked, reason: "ranked", label: "Recommended now" } : null;
}
