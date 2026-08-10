import { describe, expect, it } from "vitest";
import { productSlug } from "@/lib/product-slug";

describe("productSlug", () => {
  it("allows separate products to share the same title", () => {
    expect(productSlug("Floral Ruched Crop Top", "81cf8ec7-9445-4c16-8245-43d91e446705"))
      .toBe("floral-ruched-crop-top-81cf8ec7");
    expect(productSlug("Floral Ruched Crop Top", "9fa44745-688b-4cb4-8a8e-b2aa993897a1"))
      .toBe("floral-ruched-crop-top-9fa44745");
  });

  it("preserves the public URL when a product title changes", () => {
    expect(productSlug("A completely new title", "81cf8ec7-9445-4c16-8245-43d91e446705", "original-piece"))
      .toBe("original-piece");
  });
});
