import { SellerOnboarding } from "@/components/seller-onboarding";
import { getSellerReferenceData } from "@/data/seller-studio-repository";

export default async function SellerOnboardingPage() {
  const referenceData = await getSellerReferenceData();
  return <SellerOnboarding referenceData={referenceData} />;
}
