import { describe, expect, it } from "vitest";
import { buyerDestinations, isBuyerDestinationActive } from "@/lib/buyer-navigation";

describe("canonical buyer navigation", () => {
  it("contains exactly the four approved destinations in order", () => {
    expect(buyerDestinations).toEqual([
      { href: "/", label: "Home" },
      { href: "/discover", label: "Discover" },
      { href: "/stores", label: "Stores" },
      { href: "/cart", label: "Cart" },
    ]);
  });

  it("keeps contextual buyer routes under their parent destination", () => {
    expect(isBuyerDestinationActive("/discover", "/discover?q=noir")).toBe(true);
    expect(isBuyerDestinationActive("/discover", "/drops/after-hours")).toBe(true);
    expect(isBuyerDestinationActive("/stores", "/stores/noir-lusaka")).toBe(true);
    expect(isBuyerDestinationActive("/cart", "/order-review/store-noir")).toBe(true);
    expect(isBuyerDestinationActive("/", "/discover")).toBe(false);
  });
});
