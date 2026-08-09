import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { catalogRepository } from "@/data/repository";

export const metadata: Metadata = { title: "Your Cart" };

export default async function CartPage() {
  const [products, stores] = await Promise.all([
    catalogRepository.listProducts(),
    catalogRepository.listStores(),
  ]);
  return (
    <div className="page compact-wide">
      <header className="page-header">
        <div>
          <p className="eyebrow">Grouped by store</p>
          <h1>Your Cart</h1>
          <p>Review and contact one store at a time. Delivery and payment are not included here.</p>
        </div>
      </header>
      <CartView products={products} stores={stores} />
    </div>
  );
}
