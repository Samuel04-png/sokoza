import { describe, expect, it } from "vitest";
import { classifyProductTaxonomy } from "@/lib/product-taxonomy";

const base = { title: "Piece", category: "Dresses", color: "Black", description: "", details: [], condition: "New", occasions: [] };

describe("automatic product taxonomy", () => {
  it("recognizes product types from listing content", () => {
    expect(classifyProductTaxonomy({ ...base, title: "Leather trainers" }).category).toBe("Sneakers");
    expect(classifyProductTaxonomy({ ...base, title: "Linen shirt" }).category).toBe("Shirts");
    expect(classifyProductTaxonomy({ ...base, title: "Wide-leg jumpsuit" }).category).toBe("Sets");
    expect(classifyProductTaxonomy({ ...base, title: "Gold pendant necklace" }).category).toBe("Jewelry");
    expect(classifyProductTaxonomy({ ...base, title: "Longline knit cardigan" }).category).toBe("Cardigans");
    expect(classifyProductTaxonomy({ ...base, title: "Heart satin pyjama set" }).category).toBe("Sleepwear");
  });

  it("does not let styling suggestions override an explicit product title", () => {
    expect(classifyProductTaxonomy({ ...base, title: "Floral maxi dress", description: "Pair with sandals and a denim jacket." }).category).toBe("Dresses");
    expect(classifyProductTaxonomy({ ...base, title: "Weekend romper", description: "Style with sneakers." }).category).toBe("Sets");
  });

  it("uses Thrift for pre-owned conditions", () => {
    expect(classifyProductTaxonomy({ ...base, condition: "Like new" }).category).toBe("Thrift");
  });

  it("can assign multiple supported occasions", () => {
    expect(classifyProductTaxonomy({ ...base, description: "An effortless brunch dress for dinners and weddings." }).occasions).toEqual(["Everyday", "Weekend", "Dinner", "Event"]);
  });

  it("always assigns an occasion fallback", () => {
    expect(classifyProductTaxonomy(base).occasions).toEqual(["Everyday"]);
  });
});
