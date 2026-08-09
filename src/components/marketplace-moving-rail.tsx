import { ProductGrid } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import type { Product, Store } from "@/lib/types";

export function MarketplaceMovingRail({ products, stores }: { products: Product[]; stores: Store[] }) {
  if (!products.length) return null;
  return (
    <section className="section marketplace-moving">
      <SectionHeading
        body="Current pieces with enough recent, qualified marketplace interest and recently checked availability."
        eyebrow="Getting attention"
        href="/discover?sort=recommended"
        title="What’s Moving"
      />
      <ProductGrid products={products.slice(0, 4)} stores={stores} />
    </section>
  );
}
