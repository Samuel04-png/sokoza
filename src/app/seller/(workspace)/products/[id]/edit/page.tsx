import { SellerProductEditor } from "@/components/seller-product-editor";
import { getSellerReferenceData } from "@/data/seller-studio-repository";

export default async function EditSellerProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const referenceData = await getSellerReferenceData();
  return <SellerProductEditor productId={id} referenceData={referenceData} />;
}
