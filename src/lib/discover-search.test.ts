import { describe, expect, it } from "vitest";
import { drops, products, stores } from "@/test/fixtures/marketplace";
import {
  buildDiscoverHref,
  buildDiscoverSuggestionGroups,
  defaultDiscoverFilters,
  filterAndSortProducts,
  findMatchingStores,
} from "@/lib/discover-search";

describe("Discover search state", () => {
  it("serializes a durable, shareable result URL", () => {
    expect(
      buildDiscoverHref({
        ...defaultDiscoverFilters(),
        q: "black dress",
        category: "Dresses",
        sizes: ["M", "L"],
        storeIds: ["store-noir"],
        tab: "pieces",
      }),
    ).toBe(
      "/discover?q=black+dress&category=Dresses&size=M&size=L&store=store-noir&tab=pieces",
    );
  });

  it("matches products across piece, store, category, color, and variant language", () => {
    const noir = filterAndSortProducts(products, stores, {
      ...defaultDiscoverFilters(),
      q: "noir copper M",
    });
    expect(noir.map((product) => product.title)).toEqual(["Copper Column Dress"]);

    const localShirts = filterAndSortProducts(products, stores, {
      ...defaultDiscoverFilters(),
      category: "Shirts",
      madeHere: true,
    });
    expect(localShirts.map((product) => product.title)).toContain("Mwezi Box Shirt");
  });

  it("applies supported store, fulfilment, availability, and sort constraints", () => {
    const filtered = filterAndSortProducts(products, stores, {
      ...defaultDiscoverFilters(),
      storeIds: ["store-noir"],
      fulfilment: ["collection"],
      sort: "price-high",
    });
    expect(filtered.every((product) => product.storeId === "store-noir")).toBe(true);
    expect(filtered[0].price).toBeGreaterThanOrEqual(filtered.at(-1)?.price ?? 0);
    expect(filtered.every((product) => product.availability !== "sold")).toBe(true);
  });

  it("returns relevant stores and omits empty autocomplete groups", () => {
    const filters = { ...defaultDiscoverFilters(), q: "noir" };
    expect(findMatchingStores(stores, filters).map((store) => store.name)).toEqual(["NOIR"]);

    const groups = buildDiscoverSuggestionGroups("noir", products, stores, drops);
    expect(groups.map((group) => group.label)).toContain("Stores");
    expect(groups.flatMap((group) => group.items).some((item) => item.label === "NOIR")).toBe(true);
    expect(groups.every((group) => group.items.length > 0)).toBe(true);
    expect(groups[0].label).toBe("Stores");
    expect(groups[0].items[0]).toMatchObject({
      type: "store",
      image: expect.any(String),
      href: "/stores/noir-lusaka",
    });
  });

  it("waits for a useful query and excludes unavailable entities from suggestions", () => {
    expect(buildDiscoverSuggestionGroups("n", products, stores, drops)).toEqual([]);
    const unavailableStores = stores.map((store) =>
      store.id === "store-noir" ? { ...store, status: "suspended" as const } : store,
    );
    const groups = buildDiscoverSuggestionGroups("NOIR", products, unavailableStores, drops);
    expect(groups.flatMap((group) => group.items).some((item) => item.label === "NOIR")).toBe(false);
    expect(groups.flatMap((group) => group.items).some((item) => item.type === "product" && item.storeName === "NOIR")).toBe(false);
  });

  it("returns a genuine empty result for impossible constraints", () => {
    const results = filterAndSortProducts(products, stores, {
      ...defaultDiscoverFilters(),
      q: "not-a-current-sokoza-piece",
      maxPrice: 1,
    });
    expect(results).toEqual([]);
  });
});
