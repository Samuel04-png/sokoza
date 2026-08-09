import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "Verify your seller account" };

export default async function SellVerifyPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <div className="page compact seller-public-verify">
      <div className="seller-verification-icon"><Icon name="shield" /></div>
      <p className="eyebrow">Account verification</p>
      <h1>Check your email.</h1>
      <p>Open the protected verification link{email ? ` sent to ${email}` : " we sent you"}. It will return you to the resumable Store setup.</p>
      <div className="inline-alert neutral"><Icon name="info" /><p>If it is not visible yet, check spam before requesting another message.</p></div>
      <Link className="button primary" href="/seller/sign-in">Return to seller sign in</Link>
    </div>
  );
}
