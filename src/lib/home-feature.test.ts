import { describe, expect, it } from "vitest";
import { selectHomeFeature } from "@/lib/home-feature";
import { products } from "@/test/fixtures/marketplace";

describe("homepage product feature selection", () => {
  it("prioritizes qualified marketplace momentum", () => {
    const selection = selectHomeFeature(products, [products[2]]);
    expect(selection).toMatchObject({ product: products[2], reason: "momentum", label: "Getting attention" });
  });

  it("uses explicit editorial curation before the organic fallback", () => {
    const ranked = products.map((product) => ({ ...product, featured: false }));
    ranked[1] = { ...ranked[1], featured: true };
    expect(selectHomeFeature(ranked, [])).toMatchObject({ product: ranked[1], reason: "editorial" });
  });

  it("uses the first eligible ranked product when evidence is sparse", () => {
    const ranked = products.map((product) => ({ ...product, featured: false }));
    expect(selectHomeFeature(ranked, [])).toMatchObject({ product: ranked[0], reason: "ranked", label: "Recommended now" });
  });

  it("never features a sold product or a listing without an image", () => {
    const ranked = products.map((product) => ({ ...product, featured: false }));
    ranked[0] = { ...ranked[0], availability: "sold" };
    ranked[1] = { ...ranked[1], images: [] };
    expect(selectHomeFeature(ranked, [])?.product.id).toBe(ranked[2].id);
  });
});
