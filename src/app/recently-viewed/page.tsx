import type { Metadata } from "next";
import { LocalProductCollection } from "@/components/local-product-collection";
import { catalogRepository } from "@/data/repository";

export const metadata: Metadata = { title: "Recently Viewed" };

export default async function RecentlyViewedPage() {
  const [products, stores] = await Promise.all([
    catalogRepository.listProducts(),
    catalogRepository.listStores(),
  ]);
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Continue exploring</p>
          <h1>Recently Viewed</h1>
          <p>Your latest product visits stay in this browser so you can return without an account.</p>
        </div>
      </header>
      <LocalProductCollection mode="recent" products={products} stores={stores} />
    </div>
  );
}
