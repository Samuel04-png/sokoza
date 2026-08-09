import { describe, expect, it } from "vitest";
import { products, stores } from "@/test/fixtures/marketplace";
import {
  aggregateMarketplaceEvents,
  buyerProductViewSocialProof,
  emptyProductMetrics,
  isDuplicateMarketplaceEvent,
  rankMarketplaceProducts,
  smoothedRate,
  type MarketplaceEvent,
} from "@/lib/marketplace-ranking";

const now = new Date("2026-08-08T14:00:00+02:00");

function metric(productId: string, patch: Partial<ReturnType<typeof emptyProductMetrics>>) {
  return { ...emptyProductMetrics(productId), ...patch };
}

describe("marketplace event aggregation", () => {
  it("separates raw views from unique meaningful viewers", () => {
    const events: MarketplaceEvent[] = [
      { id: "1", eventType: "product_viewed", productId: "p-001", storeId: "store-noir", sessionId: "a", occurredAt: now.toISOString(), viewKind: "raw" },
      { id: "2", eventType: "product_viewed", productId: "p-001", storeId: "store-noir", sessionId: "a", occurredAt: now.toISOString(), viewKind: "raw" },
      { id: "3", eventType: "product_viewed", productId: "p-001", storeId: "store-noir", sessionId: "a", occurredAt: now.toISOString(), viewKind: "meaningful" },
      { id: "4", eventType: "product_viewed", productId: "p-001", storeId: "store-noir", sessionId: "a", occurredAt: now.toISOString(), viewKind: "meaningful" },
      { id: "5", eventType: "product_viewed", productId: "p-001", storeId: "store-noir", sessionId: "b", occurredAt: now.toISOString(), viewKind: "meaningful" },
    ];
    const result = aggregateMarketplaceEvents(events, ["p-001"], now).get("p-001")!;
    expect(result.rawViews24h).toBe(2);
    expect(result.uniqueViewers24h).toBe(2);
  });

  it("deduplicates repeated qualified actions from the same session", () => {
    const events: MarketplaceEvent[] = ["1", "2", "3"].map((id) => ({
      id,
      eventType: "buyer_marked_enquiry_sent" as const,
      productId: "p-001",
      storeId: "store-noir",
      sessionId: "same-session",
      occurredAt: now.toISOString(),
      intentKey: `attempt-${id}`,
    }));
    const result = aggregateMarketplaceEvents(events, ["p-001"], now).get("p-001")!;
    expect(result.buyerMarkedSent7d).toBe(1);
  });

  it("deduplicates meaningful views inside the short session window", () => {
    const event: MarketplaceEvent = {
      id: "view",
      eventType: "product_viewed",
      productId: "p-001",
      storeId: "store-noir",
      sessionId: "same-session",
      occurredAt: now.toISOString(),
      viewKind: "meaningful",
    };
    expect(isDuplicateMarketplaceEvent([event], event, new Date(now.getTime() + 10 * 60 * 1000))).toBe(true);
    expect(isDuplicateMarketplaceEvent([event], event, new Date(now.getTime() + 31 * 60 * 1000))).toBe(false);
  });

  it("suppresses buyer social proof below configurable minimums", () => {
    expect(buyerProductViewSocialProof(metric("p-001", { uniqueViewers24h: 9, uniqueViewers7d: 21 }))).toBeNull();
    expect(buyerProductViewSocialProof(metric("p-001", { uniqueViewers24h: 10 }))).toBe("Viewed by 10 shoppers today");
    expect(buyerProductViewSocialProof(metric("p-001", { uniqueViewers7d: 22 }))).toBe("22 people viewed this piece this week");
  });
});

describe("marketplace ranking", () => {
  it("does not allow a popular irrelevant sneaker to outrank a relevant dress", () => {
    const dress = products.find((product) => product.id === "p-001")!;
    const sneaker = products.find((product) => product.category === "Sneakers")!;
    const metrics = new Map([
      [dress.id, metric(dress.id, { uniqueViewers7d: 25, buyerMarkedSent7d: 1 })],
      [sneaker.id, metric(sneaker.id, { uniqueViewers7d: 10_000, buyerMarkedSent7d: 500 })],
    ]);
    const ranked = rankMarketplaceProducts({ products: [sneaker, dress], stores, metrics, query: "copper dress", mode: "search", now });
    expect(ranked[0].product.id).toBe(dress.id);
  });

  it("protects small samples with prior smoothing", () => {
    const oneForOne = smoothedRate(1, 1, { rate: 0.025, strength: 40 });
    const twentyForFiveHundred = smoothedRate(20, 500, { rate: 0.025, strength: 40 });
    expect(oneForOne).toBeLessThan(0.06);
    expect(oneForOne).not.toBe(1);
    expect(twentyForFiveHundred).toBeCloseTo(0.04, 2);
  });

  it("penalizes stale inventory despite recent enquiry momentum", () => {
    const current = { ...products[0], id: "current", confirmedAt: "2026-08-08T09:00:00+02:00" };
    const stale = { ...products[0], id: "stale", confirmedAt: "2026-07-01T09:00:00+02:00", availability: "stale" as const };
    const metrics = new Map([
      [current.id, metric(current.id, { buyerMarkedSent7d: 4, uniqueViewers7d: 40 })],
      [stale.id, metric(stale.id, { buyerMarkedSent7d: 6, uniqueViewers7d: 40 })],
    ]);
    const ranked = rankMarketplaceProducts({ products: [stale, current], stores, metrics, mode: "discover", now, preserveSingleStore: true });
    expect(ranked[0].product.id).toBe(current.id);
  });

  it("breaks long seller runs when alternatives exist", () => {
    const storeA = stores[0];
    const storeB = stores[1];
    const candidates = [0, 1, 2, 3].map((index) => ({
      ...products[0],
      id: `a-${index}`,
      storeId: index === 3 ? storeB.id : storeA.id,
      confirmedAt: "2026-07-01T09:00:00+02:00",
    }));
    const metrics = new Map(candidates.map((product, index) => [product.id, metric(product.id, { buyerMarkedSent7d: 10 - index, uniqueViewers7d: 40 })]));
    const ranked = rankMarketplaceProducts({ products: candidates, stores, metrics, mode: "discover", now });
    expect(ranked.slice(0, 3).map((item) => item.product.storeId)).toContain(storeB.id);
  });

  it("excludes sold products and products from suspended stores", () => {
    const sold = { ...products[0], id: "sold", availability: "sold" as const };
    const suspendedStore = { ...stores[1], status: "suspended" as const };
    const suspended = { ...products[1], id: "suspended", storeId: suspendedStore.id };
    const current = { ...products[0], id: "current" };
    const ranked = rankMarketplaceProducts({ products: [sold, suspended, current], stores: [stores[0], suspendedStore], mode: "discover", now });
    expect(ranked.map((item) => item.product.id)).toEqual(["current"]);
  });

  it("lets a recent enquiry spike overtake old momentum", () => {
    const recent = { ...products[0], id: "recent" };
    const old = { ...products[0], id: "old" };
    const metrics = new Map([
      [recent.id, metric(recent.id, { buyerMarkedSent24h: 4, buyerMarkedSent7d: 4, buyerMarkedSent30d: 4, uniqueViewers7d: 40 })],
      [old.id, metric(old.id, { buyerMarkedSent30d: 20, uniqueViewers7d: 40 })],
    ]);
    const ranked = rankMarketplaceProducts({ products: [old, recent], stores, metrics, mode: "discover", now, preserveSingleStore: true });
    expect(ranked[0].product.id).toBe("recent");
  });
});
