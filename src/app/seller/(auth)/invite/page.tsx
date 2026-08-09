import Link from "next/link";
import { Icon } from "@/components/icon";

export default function SellerInvitePage() {
  return (
    <section className="seller-auth-card" aria-labelledby="seller-invite-title">
      <p className="eyebrow">Seller invitation</p>
      <h1 id="seller-invite-title">Use the protected link in your email.</h1>
      <p className="seller-auth-intro">A valid invitation identifies its Store on the server. SOKOZA does not provide a reusable demonstration invitation.</p>
      <div className="seller-auth-notice"><Icon name="shield" size={18} /> If your invitation expired, ask the SOKOZA operator who invited you to issue a new one.</div>
      <Link className="button primary full" href="/sell/sign-up">Create your own Store</Link>
      <Link className="seller-auth-back" href="/seller/sign-in">← Back to sign in</Link>
    </section>
  );
}
