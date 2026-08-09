import type { Metadata } from "next";
import { LocalProductCollection } from "@/components/local-product-collection";
import { catalogRepository } from "@/data/repository";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const [products, stores] = await Promise.all([
    catalogRepository.listProducts(),
    catalogRepository.listStores(),
  ]);
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Stored on this device</p>
          <h1>Saved</h1>
          <p>Keep pieces without creating an account. Availability may change before you enquire.</p>
        </div>
      </header>
      <LocalProductCollection mode="saved" products={products} stores={stores} />
    </div>
  );
}
