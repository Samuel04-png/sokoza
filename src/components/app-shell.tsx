"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/icon";
import { useBuyerState } from "@/components/buyer-state";
import { AccessibleDialog } from "@/components/accessible-dialog";
import { buyerDestinations, isBuyerDestinationActive } from "@/lib/buyer-navigation";

const destinationIcons: Record<(typeof buyerDestinations)[number]["href"], IconName> = {
  "/": "home",
  "/discover": "discover",
  "/stores": "store",
  "/cart": "cart",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cart, preferences, updatePreferences } = useBuyerState();
  const [locationOpen, setLocationOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const update = () => setOnline(window.navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.reducedData = String(preferences.reducedData);
    return () => {
      delete document.documentElement.dataset.reducedData;
    };
  }, [preferences.reducedData]);

  if (pathname.startsWith("/seller")) {
    return (
      <>
        <a className="skip-link" href="#main-content">
          Skip to seller workspace
        </a>
        {!online ? (
          <div className="offline-bar" role="status">
            <Icon name="offline" size={18} />
            You’re offline. Keep this page open; unsaved seller changes may need to be retried.
          </div>
        ) : null}
        <main className="seller-root-main" id="main-content">
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {!online ? (
        <div className="offline-bar" role="status">
          <Icon name="offline" size={18} />
          You’re offline. Saved shopping data remains available on this device.
        </div>
      ) : null}
      <header className="site-header">
        <div className="header-inner">
          <Link aria-label="SOKOZA home" className="wordmark" href="/">
            SOKOZA
          </Link>
          <button
            aria-haspopup="dialog"
            className="location-button"
            onClick={() => setLocationOpen(true)}
            type="button"
          >
            <Icon name="location" size={18} />
            <span>{preferences.location}</span>
            <Icon name="down" size={16} />
          </button>
          <nav aria-label="Primary" className="desktop-nav">
            {buyerDestinations.map((item) => {
              const active = isBuyerDestinationActive(item.href, pathname);
              return (
                <Link aria-current={active ? "page" : undefined} href={item.href} key={item.href}>
                  {item.label}
                  {item.label === "Cart" && cartCount > 0 ? (
                    <span aria-label={`${cartCount} ${cartCount === 1 ? "item" : "items"}`} className="desktop-nav-badge">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="header-actions">
            <Link
              aria-label="Search in Discover"
              className="icon-button desktop-only"
              href="/discover?mode=search"
            >
              <Icon name="search" />
            </Link>
            <Link aria-label="Your profile" className="profile-button" href="/profile">
              <Icon name="user" size={22} />
            </Link>
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div>
          <Link className="wordmark wordmark-footer" href="/">
            SOKOZA
          </Link>
          <p>Local fashion, clearly discovered.</p>
        </div>
        <div className="footer-links">
          <Link href="/help">Help</Link>
          <Link href="/safety">Safety</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/sell">Sell on SOKOZA</Link>
        </div>
        <p className="footer-note">
          SOKOZA helps you discover products and prepare enquiries. Payment and fulfilment are
          arranged directly with each store.
        </p>
      </footer>
      <nav aria-label="Primary" className="bottom-nav">
        {buyerDestinations.map((item) => {
          const active = isBuyerDestinationActive(item.href, pathname);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={active ? "active" : undefined}
              href={item.href}
              key={item.href}
            >
              <span className="nav-icon-wrap">
                <Icon name={destinationIcons[item.href]} size={22} />
                {item.label === "Cart" && cartCount > 0 ? (
                  <span aria-label={`${cartCount} ${cartCount === 1 ? "item" : "items"}`} className="nav-badge">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                ) : null}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {locationOpen ? (
        <AccessibleDialog labelledBy="location-title" onClose={() => setLocationOpen(false)}>
            <div className="sheet-handle" />
            <div className="sheet-heading">
              <div>
                <p className="eyebrow">Shopping area</p>
                <h2 id="location-title">Choose your location</h2>
              </div>
              <button
                aria-label="Close location chooser"
                className="icon-button"
                onClick={() => setLocationOpen(false)}
                type="button"
              >
                <Icon name="close" />
              </button>
            </div>
            <p className="muted">
              The public pilot is Lusaka-first. Other cities are shown as future locations and do
              not contain active inventory yet.
            </p>
            <div className="radio-list">
              {["Lusaka", "Kitwe — coming later", "Ndola — coming later"].map((location) => {
                const disabled = location !== "Lusaka";
                return (
                  <label className={disabled ? "disabled" : ""} key={location}>
                    <input
                      checked={preferences.location === location}
                      disabled={disabled}
                      name="location"
                      onChange={() => updatePreferences({ location })}
                      type="radio"
                    />
                    <span>{location}</span>
                  </label>
                );
              })}
            </div>
            <button className="button primary full" onClick={() => setLocationOpen(false)}>
              Continue in Lusaka
            </button>
        </AccessibleDialog>
      ) : null}
    </>
  );
}
