import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icon";

export const metadata: Metadata = { title: "Your SOKOZA" };

const links: Array<{ href: string; label: string; body: string; icon: IconName }> = [
  { href: "/saved", label: "Saved", body: "Pieces kept on this device", icon: "save" },
  { href: "/recently-viewed", label: "Recently Viewed", body: "Return to products you opened", icon: "clock" },
  { href: "/enquiries", label: "Enquiries", body: "Your prepared WhatsApp references", icon: "whatsapp" },
  { href: "/settings", label: "Settings", body: "Location, data use and local storage", icon: "settings" },
];

export default function ProfilePage() {
  return (
    <div className="page compact profile-page">
      <header className="profile-hero">
        <div className="profile-monogram">S</div>
        <p className="eyebrow">Guest profile</p>
        <h1>Your SOKOZA</h1>
        <p>
          Browse, save and prepare order enquiries without a buyer account. Your shopping state stays
          in this browser.
        </p>
      </header>
      <nav aria-label="Your SOKOZA" className="profile-links">
        {links.map((item) => (
          <Link href={item.href} key={item.href}>
            <Icon name={item.icon} />
            <span>
              <strong>{item.label}</strong>
              <small>{item.body}</small>
            </span>
            <Icon name="next" />
          </Link>
        ))}
      </nav>
      <section className="seller-invite">
        <p className="eyebrow">For local fashion stores</p>
        <h2>Bring your current pieces to new shoppers.</h2>
        <p>Learn what SOKOZA will require before seller onboarding opens.</p>
        <Link className="button primary" href="/sell">
          Sell on SOKOZA
        </Link>
      </section>
      <nav aria-label="Help and legal" className="utility-links">
        <Link href="/help">Help <Icon name="next" size={18} /></Link>
        <Link href="/safety">Safety <Icon name="next" size={18} /></Link>
        <Link href="/terms">Terms <Icon name="next" size={18} /></Link>
        <Link href="/privacy">Privacy <Icon name="next" size={18} /></Link>
      </nav>
    </div>
  );
}
