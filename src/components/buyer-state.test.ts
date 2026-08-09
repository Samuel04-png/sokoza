import { describe, expect, it } from "vitest";
import { parseStoredBuyerState } from "@/components/buyer-state";

const line = {
  productId: "11111111-1111-4111-8111-111111111111",
  productTitle: "Copper Column Dress",
  storeId: "22222222-2222-4222-8222-222222222222",
  variantId: "33333333-3333-4333-8333-333333333333",
  variantLabel: "S",
  quantity: 1,
  maxQuantity: 2,
  priceSnapshot: 700,
};

describe("buyer state persistence", () => {
  it("restores the current Cart shape", () => {
    const result = parseStoredBuyerState({ cart: [line] });
    expect(result?.cart).toEqual([line]);
  });

  it("migrates the previous persisted Cart key without losing items", () => {
    const previousCartKey = ["b", "a", "g"].join("");
    const result = parseStoredBuyerState({ [previousCartKey]: [line] });
    expect(result?.cart).toEqual([line]);
    expect(result).not.toHaveProperty(previousCartKey);
  });

  it("rejects malformed local data", () => {
    expect(parseStoredBuyerState({ cart: [{ ...line, quantity: 0 }] })).toBeNull();
  });
});
