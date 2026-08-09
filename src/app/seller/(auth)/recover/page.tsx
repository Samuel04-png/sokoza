import Link from "next/link";
import { sendSellerRecovery } from "@/app/seller/actions";
import { SellerRecoveryForm } from "@/components/seller-auth-form";
import { Icon } from "@/components/icon";

export default async function SellerRecoverPage({ searchParams }: { searchParams: Promise<{ expired?: string; sent?: string; email?: string }> }) {
  const { expired, sent, email } = await searchParams;
  return (
    <section className="seller-auth-card" aria-labelledby="seller-recover-title">
      <p className="eyebrow">Account recovery</p>
      <h1 id="seller-recover-title">Reset your access.</h1>
      <p className="seller-auth-intro">
        Enter the email attached to your Store. We’ll send a time-limited recovery link if the account exists.
      </p>
      {expired ? <div className="seller-auth-notice" role="alert">This recovery link has expired or was already used. Request a new one below.</div> : null}
      {sent ? <div className="seller-auth-success" role="status"><Icon name="tick" size={22} /><div><strong>Check your email</strong><p>If {email || "that address"} belongs to a seller account, a protected recovery link is on its way.</p></div></div> : null}
      <SellerRecoveryForm recover={sendSellerRecovery} />
      <Link className="seller-auth-back" href="/seller/sign-in">
        ← Back to sign in
      </Link>
    </section>
  );
}
