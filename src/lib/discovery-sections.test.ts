import { describe, expect, it } from "vitest";
import { buildCurrentReleases, hasExplicitMadeHereEvidence } from "@/lib/discovery-sections";
import { products, stores } from "@/test/fixtures/marketplace";

describe("automatic Discover sections", () => {
  it("builds a store-specific current release when no explicit Drop exists", () => {
    const releases = buildCurrentReleases([], products, stores);
    expect(releases[0]).toMatchObject({ automatic: true, drop: { storeId: stores[0].id } });
    expect(releases[0].href).toContain(`store=${encodeURIComponent(stores[0].id)}`);
  });

  it("does not duplicate a Store that already has a live explicit Drop", () => {
    const explicit = { id: "drop-1", slug: "new-edit", storeId: stores[0].id, title: "New Edit", subtitle: "Current", status: "live" as const, coverImage: products[0].images[0], productIds: [products[0].id], publishedAt: "2026-08-09" };
    const releases = buildCurrentReleases([explicit], products, stores);
    expect(releases.filter((release) => release.drop.storeId === stores[0].id)).toHaveLength(1);
    expect(releases[0].automatic).toBe(false);
  });

  it("requires explicit local-production evidence", () => {
    expect(hasExplicitMadeHereEvidence({ title: "Linen dress", description: "Designed and made in Zambia.", details: [] })).toBe(true);
    expect(hasExplicitMadeHereEvidence({ title: "Linen dress", description: "Available from a Lusaka store.", details: [] })).toBe(false);
  });
});
