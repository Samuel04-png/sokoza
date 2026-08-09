import { SellerProductEditor } from "@/components/seller-product-editor";
import { getSellerReferenceData } from "@/data/seller-studio-repository";

export default async function NewSellerProductPage() {
  const referenceData = await getSellerReferenceData();
  return <SellerProductEditor referenceData={referenceData} />;
}
