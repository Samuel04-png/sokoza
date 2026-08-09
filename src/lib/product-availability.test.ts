import { describe, expect, it } from "vitest";
import { deriveProductAvailability } from "@/lib/product-availability";

const now = new Date("2026-08-09T10:00:00+02:00").getTime();
const confirmedAt = "2026-08-09T09:00:00+02:00";

describe("persisted product availability", () => {
  it("keeps an explicitly available one-off piece available", () => {
    expect(deriveProductAvailability("published", confirmedAt, [{ availability: "available", stock_quantity: 1 }], now)).toBe("available");
  });

  it("shows low only when the seller explicitly selected low", () => {
    expect(deriveProductAvailability("published", confirmedAt, [{ availability: "low", stock_quantity: 8 }], now)).toBe("low");
  });

  it("automatically shows low after stock held above 3 and falls to 3", () => {
    expect(deriveProductAvailability("published", confirmedAt, [{ availability: "available", stock_quantity: 3, stock_reference_quantity: 8 }], now)).toBe("low");
  });

  it("does not treat an original one-off quantity as low", () => {
    expect(deriveProductAvailability("published", confirmedAt, [{ availability: "available", stock_quantity: 1, stock_reference_quantity: 1 }], now)).toBe("available");
  });

  it("activates automatic low stock after a later restock above 3", () => {
    expect(deriveProductAvailability("published", confirmedAt, [{ availability: "available", stock_quantity: 2, stock_reference_quantity: 5 }], now)).toBe("low");
  });

  it("activates after a quantity of 3 later drops below its reference", () => {
    expect(deriveProductAvailability("published", confirmedAt, [{ availability: "available", stock_quantity: 2, stock_reference_quantity: 3 }], now)).toBe("low");
  });

  it("shows sold when no option is sellable", () => {
    expect(deriveProductAvailability("published", confirmedAt, [{ availability: "unavailable", stock_quantity: 0 }], now)).toBe("sold");
  });

  it("keeps made-to-order products sellable without on-hand stock", () => {
    expect(deriveProductAvailability("published", confirmedAt, [{ availability: "made_to_order", stock_quantity: 0 }], now)).toBe("available");
  });

  it("preserves the inventory freshness warning", () => {
    expect(deriveProductAvailability("published", "2026-07-01T09:00:00+02:00", [{ availability: "available", stock_quantity: 1 }], now)).toBe("stale");
  });
});
