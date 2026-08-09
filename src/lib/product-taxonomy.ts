export const PRODUCT_CATEGORIES = ["Dresses", "Sneakers", "Sets", "Shirts", "Trousers", "Jewelry", "Thrift", "Cardigans", "Sleepwear"] as const;
export const PRODUCT_OCCASIONS = ["Everyday", "Work", "Weekend", "Dinner", "Event"] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
export type ProductOccasion = typeof PRODUCT_OCCASIONS[number];

export interface ProductTaxonomySignals {
  title: string;
  category: string;
  color: string;
  description: string;
  details: string[];
  condition: string;
  occasions: string[];
}

const categoryPatterns: Array<{ category: ProductCategory; terms: RegExp }> = [
  { category: "Sleepwear", terms: /\b(pyjamas?|pajamas?|sleepwear|nightwear|nightdress|robe)\b/i },
  { category: "Cardigans", terms: /\b(cardigans?|dusters?|open[- ]knit|knit layers?|longline knit)\b/i },
  { category: "Sets", terms: /\b(co-ord|co ord|two[- ]piece|matching set|tracksuit|romper|jumpsuit|playsuit|set)\b/i },
  { category: "Dresses", terms: /\b(dress(?:es)?|gown)\b/i },
  { category: "Sneakers", terms: /\b(sneakers?|trainers?|shoes?|heels?|sandals?|boots?|loafers?|slippers?|footwear)\b/i },
  { category: "Shirts", terms: /\b(shirts?|blouses?|tees?|t-shirts?|tshirts?|crop tops?|tank tops?|camisoles?|sweaters?|hoodies?)\b/i },
  { category: "Trousers", terms: /\b(trousers?|pants|jeans|denim|skirts?|shorts|cargos?|leggings)\b/i },
  { category: "Jewelry", terms: /\b(jewelry|jewellery|earrings?|necklaces?|bracelets?|rings?|pendants?|bangles?|chains?|anklets?)\b/i },
];

const legacyCategoryNames: Record<string, ProductCategory> = {
  footwear: "Sneakers",
  tops: "Shirts",
  bottoms: "Trousers",
  accessories: "Jewelry",
};

export function classifyProductCategory(product: ProductTaxonomySignals): ProductCategory {
  if (/like new|good/i.test(product.condition)) return "Thrift";

  // The listing title is the strongest product-type signal. Descriptions often
  // contain styling suggestions (for example, "pair with sneakers") that must
  // not reclassify a dress as footwear.
  const titleMatch = categoryPatterns.find((rule) => rule.terms.test(product.title));
  if (titleMatch) return titleMatch.category;

  const current = PRODUCT_CATEGORIES.find((category) => category.toLocaleLowerCase() === product.category.toLocaleLowerCase());
  if (current) return current;
  const legacy = legacyCategoryNames[product.category.toLocaleLowerCase()];
  if (legacy) return legacy;

  const supportingText = [product.description, ...product.details].join(" ");
  return categoryPatterns.find((rule) => rule.terms.test(supportingText))?.category ?? "Dresses";
}

export function classifyProductOccasions(product: ProductTaxonomySignals): ProductOccasion[] {
  const text = [product.title, product.category, product.description, ...product.details, ...product.occasions].join(" ");
  const occasions: ProductOccasion[] = [];

  if (/\b(everyday|daily|casual|daytime|daywear|easy[- ]?to[- ]?wear|effortless|errands|versatile)\b/i.test(text)) occasions.push("Everyday");
  if (/\b(work|office|professional|corporate|business|tailored|tuxedo|blazer)\b/i.test(text)) occasions.push("Work");
  if (/\b(weekend|brunch|vacation|holiday|resort|day out|sandals)\b/i.test(text)) occasions.push("Weekend");
  if (/\b(dinners?|date nights?|evening meals?|restaurants?)\b/i.test(text)) occasions.push("Dinner");
  if (/\b(events?|weddings?|party|parties|birthdays?|galas?|ceremon(?:y|ies)|special occasions?|occasion wear)\b/i.test(text)) occasions.push("Event");

  return occasions.length ? occasions : ["Everyday"];
}

export function classifyProductTaxonomy(product: ProductTaxonomySignals) {
  return {
    category: classifyProductCategory(product),
    occasions: classifyProductOccasions(product),
  };
}
