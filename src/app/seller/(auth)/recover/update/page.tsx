import Link from "next/link";
import { updateSellerPassword } from "@/app/seller/actions";

export default async function SellerPasswordUpdatePage({ searchParams }: { searchParams: Promise<{ invalid?: string }> }) {
  const { invalid } = await searchParams;
  return (
    <section className="seller-auth-card" aria-labelledby="seller-password-title">
      <p className="eyebrow">Secure account recovery</p>
      <h1 id="seller-password-title">Choose a new password.</h1>
      <p className="seller-auth-intro">Use at least eight characters and avoid a password you use elsewhere.</p>
      {invalid ? <div className="seller-auth-notice" role="alert">Enter a password with at least eight characters.</div> : null}
      <form action={updateSellerPassword} className="seller-auth-form">
        <label htmlFor="new-password">New password</label>
        <input autoComplete="new-password" id="new-password" minLength={8} name="password" required type="password" />
        <button className="button primary full" type="submit">Save new password</button>
      </form>
      <Link className="seller-auth-back" href="/seller/sign-in">← Return to sign in</Link>
    </section>
  );
}
