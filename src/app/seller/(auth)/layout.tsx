import Link from "next/link";

export default function SellerAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="seller-auth-shell">
      <header>
        <Link aria-label="SOKOZA home" className="wordmark" href="/">
          SOKOZA
        </Link>
        <span className="seller-auth-brand-label">Seller Studio</span>
        <Link href="/">Back to shopping</Link>
      </header>
      <div className="seller-auth-main">{children}</div>
      <p className="seller-auth-footnote">
        Seller access is separate from buyer shopping. Never share your password or verification documents in WhatsApp.
      </p>
    </div>
  );
}
