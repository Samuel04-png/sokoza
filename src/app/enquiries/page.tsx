import type { Metadata } from "next";
import { EnquiryHistory } from "@/components/enquiry-history";
import { catalogRepository } from "@/data/repository";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage() {
  const [products, stores] = await Promise.all([
    catalogRepository.listProducts(),
    catalogRepository.listStores(),
  ]);
  return (
    <div className="page compact-wide">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your protected guest history</p>
          <h1>Enquiries</h1>
          <p>Seller-specific references connected to this browser’s private guest session. These are not purchases or receipts.</p>
        </div>
      </header>
      <EnquiryHistory products={products} stores={stores} />
    </div>
  );
}
