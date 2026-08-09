import type { Metadata } from "next";
import Link from "next/link";
import { SellerSignUpForm } from "@/components/seller-auth-form";
import { signUpSeller } from "@/app/seller/actions";

export const metadata: Metadata = { title: "Create a seller account" };

export default async function SellerSignUpPage({ searchParams }: { searchParams: Promise<{ invalid?: string; rateLimited?: string; backendPending?: string; exists?: string }> }) {
  const { invalid, rateLimited, backendPending, exists } = await searchParams;
  return (
    <div className="page seller-public-auth-page">
      <section className="seller-public-auth-copy">
        <p className="eyebrow">SOKOZA Seller Studio</p>
        <h1>Build a Store worth discovering.</h1>
        <p>Create your account, shape the public Store, connect WhatsApp and publish your first product in one resumable setup.</p>
        <ul><li>Keep your buyer relationship</li><li>Publish structured fashion listings</li><li>Track only trustworthy marketplace signals</li></ul>
      </section>
      <section aria-labelledby="seller-sign-up-title" className="seller-auth-card seller-public-auth-card">
        <p className="eyebrow">Create account</p><h2 id="seller-sign-up-title">Your private seller access</h2><p className="seller-auth-intro">Buyers will see your Store name—not your personal account details.</p>
        {invalid ? <div className="seller-auth-notice" role="alert">Check your name, email, and password, then try again.</div> : null}
        {rateLimited ? <div className="seller-auth-notice" role="alert">Supabase has temporarily reached its verification-email limit. Wait before retrying. A custom SOKOZA email provider is required before launch.</div> : null}
        {exists ? <div className="seller-auth-notice" role="alert">That email already has an account. Sign in instead, or use a different email address.</div> : null}
        {backendPending ? <div className="seller-auth-notice" role="alert">Your account was created, but Seller Studio setup is temporarily unavailable. Try signing in shortly.</div> : null}
        <SellerSignUpForm startSession={signUpSeller} />
        <p className="seller-auth-support">Already have a Store? <Link href="/seller/sign-in">Sign in</Link>.</p>
      </section>
    </div>
  );
}
