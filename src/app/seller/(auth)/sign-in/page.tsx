import Link from "next/link";
import { redirect } from "next/navigation";
import { SellerSignInForm } from "@/components/seller-auth-form";
import { startSellerStudioSession } from "@/app/seller/actions";
import { getSellerPreviewSession, safeSellerDestination } from "@/lib/seller-session";

export default async function SellerSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; signedOut?: string; expired?: string; rateLimited?: string; delayed?: string; invalid?: string; backendPending?: string }>;
}) {
  const [{ next, signedOut, expired, rateLimited, delayed, invalid, backendPending }, session] = await Promise.all([
    searchParams,
    getSellerPreviewSession(),
  ]);
  const destination = safeSellerDestination(next);
  if (session) redirect(destination);

  return (
    <section className="seller-auth-card" aria-labelledby="seller-sign-in-title">
      <p className="eyebrow">SOKOZA Seller Studio</p>
      <h1 id="seller-sign-in-title">Welcome back.</h1>
      <p className="seller-auth-intro">Keep your Store current, follow buyer interest, and bring the next collection to life.</p>
      {signedOut ? <div className="seller-auth-success" role="status">You’re signed out.</div> : null}
      {expired ? (
        <div className="seller-auth-notice" role="alert">
          Your session expired. Sign in again to return to your work.
        </div>
      ) : null}
      {rateLimited ? (
        <div className="seller-auth-notice" role="alert">
          Too many sign-in attempts. Wait a few minutes before trying again; recovery remains available.
        </div>
      ) : null}
      {delayed ? (
        <div className="seller-auth-notice" role="status">
          Sign-in email delivery is taking longer than expected. Do not request repeated links yet.
        </div>
      ) : null}
      {invalid ? <div className="seller-auth-notice" role="alert">The email or password was not accepted. Check the details or reset your password.</div> : null}
      {backendPending ? <div className="seller-auth-notice" role="alert">Your account is valid, but Seller Studio data setup is temporarily unavailable. Try again shortly.</div> : null}
      <SellerSignInForm next={destination} startSession={startSellerStudioSession} />
      <p className="seller-auth-support">
        New to SOKOZA? <Link href="/sell/sign-up">Create a seller account</Link>. Have an invitation? <Link href="/seller/invite">Accept it here</Link>.
      </p>
    </section>
  );
}
