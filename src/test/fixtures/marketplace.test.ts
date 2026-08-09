import { describe, expect, it } from "vitest";
import { drops, products, stores } from "@/test/fixtures/marketplace";

describe("buyer catalog integrity", () => {
  it("uses stable unique identifiers and slugs", () => {
    expect(new Set(products.map((product) => product.id))).toHaveLength(products.length);
    expect(new Set(products.map((product) => product.slug))).toHaveLength(products.length);
    expect(new Set(stores.map((store) => store.id))).toHaveLength(stores.length);
    expect(new Set(stores.map((store) => store.slug))).toHaveLength(stores.length);
  });

  it("keeps every product connected to a valid seller and usable catalog data", () => {
    const storeIds = new Set(stores.map((store) => store.id));

    for (const product of products) {
      expect(storeIds.has(product.storeId), `${product.slug} has a valid store`).toBe(true);
      expect(product.price, `${product.slug} has a positive price`).toBeGreaterThan(0);
      expect(product.images.length, `${product.slug} has gallery coverage`).toBeGreaterThanOrEqual(2);
      expect(product.variants.length, `${product.slug} has at least one variant`).toBeGreaterThan(0);
      expect(new Set(product.variants.map((variant) => variant.id))).toHaveLength(
        product.variants.length,
      );

      const availableVariants = product.variants.filter((variant) => variant.available);
      if (product.availability === "sold") expect(availableVariants).toHaveLength(0);
      else expect(availableVariants.length).toBeGreaterThan(0);
    }
  });

  it("keeps every drop within one store and references existing products", () => {
    const productMap = new Map(products.map((product) => [product.id, product]));
    const storeIds = new Set(stores.map((store) => store.id));

    for (const drop of drops) {
      expect(storeIds.has(drop.storeId), `${drop.slug} has a valid store`).toBe(true);
      expect(drop.productIds.length).toBeGreaterThan(0);
      for (const productId of drop.productIds) {
        const product = productMap.get(productId);
        expect(product, `${drop.slug} references ${productId}`).toBeDefined();
        expect(product?.storeId).toBe(drop.storeId);
        expect(product?.dropId).toBe(drop.id);
      }
    }
  });

  it("stores valid international WhatsApp destinations", () => {
    for (const store of stores) {
      expect(store.whatsapp).toMatch(/^260\d{9}$/);
    }
  });
});
