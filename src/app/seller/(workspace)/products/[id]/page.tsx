import { SellerProductDetail } from "@/components/seller-product-detail";

export default async function SellerProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellerProductDetail productId={id} />;
}
