import { SellerDropEditor } from "@/components/seller-drops";

export default async function SellerDropPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellerDropEditor dropId={id} />;
}
