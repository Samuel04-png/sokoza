export const PRODUCT_VIBES = ["Minimal", "Street Ease", "After Dark"] as const;
export type ProductVibe = typeof PRODUCT_VIBES[number];

export interface ProductVibeSignals {
  title: string;
  category: string;
  color: string;
  description: string;
  details: string[];
  occasions: string[];
}

const rules: Array<{ vibe: ProductVibe; terms: RegExp }> = [
  {
    vibe: "Minimal",
    terms: /\b(minimal(?:ist)?|monochrome|clean|sleek|streamlined|tailored|structured|polished|understated|quiet|simple|classic|neutral|ribbed|tonal)\b/i,
  },
  {
    vibe: "Street Ease",
    terms: /\b(everyday|casual|relaxed|easy[- ]?to[- ]?wear|effortless|daytime|daywear|street|sneaker|denim|cargo|hoodie|tee|t-shirt|romper|sandals|brunch|vacation|weekend|resort)\b/i,
  },
  {
    vibe: "After Dark",
    terms: /\b(after dark|evening|party|parties|night|nightlife|date night|dinner|dinners|cocktail|occasion wear|special occasion|metallic|shimmer|bodycon|statement|gala|wedding|weddings)\b/i,
  },
];

export function classifyProductVibes(product: ProductVibeSignals): ProductVibe[] {
  const haystack = [
    product.title,
    product.category,
    product.color,
    product.description,
    ...product.details,
    ...product.occasions,
  ].join(" ");
  const matches = rules.filter((rule) => rule.terms.test(haystack)).map((rule) => rule.vibe);
  if (matches.length) return matches;

  return /sneaker|shirt|top|trouser|jean|short|set/i.test(product.category)
    ? ["Street Ease"]
    : ["Minimal"];
}
