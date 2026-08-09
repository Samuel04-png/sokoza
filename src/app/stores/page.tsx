import type { Metadata } from "next";
import { catalogRepository } from "@/data/repository";
import { StoreCard } from "@/components/store-card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Stores" };
export const revalidate = 60;

export default async function StoresPage() {
  const [stores, products] = await Promise.all([
    catalogRepository.listStores(),
    catalogRepository.listProducts(),
  ]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Independent fashion in Lusaka</p>
          <h1>Stores</h1>
          <p>
            Discover each store’s current pieces, service area, fulfilment information and exact
            verification status.
          </p>
        </div>
      </header>
      {stores.length ? <div className="store-grid stores-directory">
        {stores.map((store) => (
          <StoreCard key={store.id} products={products} store={store} />
        ))}
      </div> : <EmptyState body="Stores will appear here as real sellers complete setup and publish current inventory." icon="store" title="Stores are joining SOKOZA." />}
    </div>
  );
}
