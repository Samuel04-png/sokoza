import { SellerEnquiryDetail } from "@/components/seller-enquiries";

export default async function SellerEnquiryPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return <SellerEnquiryDetail reference={reference} />;
}
