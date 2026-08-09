import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderReview } from "@/components/order-review";
import { catalogRepository } from "@/data/repository";

export const metadata: Metadata = { title: "Review order" };

interface OrderReviewPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function OrderReviewPage({ params }: OrderReviewPageProps) {
  const { storeId } = await params;
  const [store, products] = await Promise.all([
    catalogRepository.getStoreById(storeId),
    catalogRepository.listProducts(),
  ]);
  if (!store) notFound();
  return (
    <div className="page compact-wide">
      <header className="page-header review-page-header">
        <div>
          <p className="eyebrow">One store · one clear message</p>
          <h1>Review order</h1>
          <p>We’ve rechecked the current catalog information before preparing your enquiry.</p>
        </div>
      </header>
      <OrderReview products={products} store={store} />
    </div>
  );
}
