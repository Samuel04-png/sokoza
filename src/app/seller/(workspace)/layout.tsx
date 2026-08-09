import { SellerShell } from "@/components/seller-shell";
import { SellerStudioProvider } from "@/components/seller-studio-provider";
import { getSellerStudioState } from "@/data/seller-studio-repository";
import { requireSellerSession } from "@/lib/seller-session";

export default async function SellerWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSellerSession();
  const initialState = await getSellerStudioState(session);
  return <SellerStudioProvider initialState={initialState}><SellerShell session={session}>{children}</SellerShell></SellerStudioProvider>;
}
