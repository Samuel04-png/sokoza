"use client";

import { useBuyerState } from "@/components/buyer-state";
import { EmptyState } from "@/components/empty-state";
import { ProductGrid } from "@/components/product-card";
import type { Product, Store } from "@/lib/types";

export function LocalProductCollection({
  products,
  stores,
  mode,
  compactEmpty = false,
}: {
  products: Product[];
  stores: Store[];
  mode: "saved" | "recent";
  compactEmpty?: boolean;
}) {
  const { hydrated, recentIds, savedIds } = useBuyerState();
  const ids = mode === "saved" ? savedIds : recentIds;
  const order = new Map(ids.map((id, index) => [id, index]));
  const selected = products
    .filter((product) => order.has(product.id))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  if (!hydrated) {
    return <div aria-label="Loading local shopping data" className="skeleton-grid" />;
  }
  if (selected.length === 0 && compactEmpty) return null;
  if (selected.length === 0) {
    return (
      <EmptyState
        action={mode === "saved" ? "Discover pieces" : "Explore current fashion"}
        body={
          mode === "saved"
            ? "Save pieces as you browse and they’ll stay here on this device."
            : "Products you open will appear here on this device, ready for another look."
        }
        href="/discover"
        icon={mode === "saved" ? "save" : "clock"}
        title={mode === "saved" ? "Nothing saved yet" : "No recently viewed pieces"}
      />
    );
  }
  return <ProductGrid products={selected} stores={stores} />;
}
