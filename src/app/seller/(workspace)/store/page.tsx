import { SellerStoreEditor } from "@/components/seller-store-editor";
import { getSellerReferenceData } from "@/data/seller-studio-repository";

export default async function SellerStorePage() {
  const referenceData = await getSellerReferenceData();
  return <SellerStoreEditor referenceData={referenceData} />;
}
