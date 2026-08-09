"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AccessibleDialog } from "@/components/accessible-dialog";
import { Icon, type IconName } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import type { SellerSession } from "@/lib/seller-types";

const globalDestinations: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/seller", label: "Home", icon: "home" },
  { href: "/seller/products", label: "Products", icon: "package" },
  { href: "/seller/enquiries", label: "Enquiries", icon: "whatsapp" },
  { href: "/seller/store", label: "Store", icon: "store" },
  { href: "/seller/insights", label: "Insights", icon: "view" },
];

const catalogDestinations = [
  { href: "/seller/products", label: "Products" },
  { href: "/seller/inventory", label: "Inventory" },
  { href: "/seller/drops", label: "Drops" },
  { href: "/seller/promotions", label: "Promotions" },
];

const utilityDestinations: Array<{ href: string; label: string; icon: IconName; detail: string }> = [
  { href: "/seller/inventory", label: "Inventory", icon: "refresh", detail: "Keep availability current" },
  { href: "/seller/drops", label: "Drops", icon: "calendar", detail: "Build visual collections" },
  { href: "/seller/promotions", label: "Promotions", icon: "bookmark", detail: "Manage reduced prices" },
  { href: "/seller/insights", label: "Insights", icon: "view", detail: "Understand buyer signals" },
  { href: "/seller/notifications", label: "Notifications", icon: "alert", detail: "Review recent activity" },
  { href: "/seller/verification", label: "Verification", icon: "shield", detail: "Manage your trust profile" },
  { href: "/seller/settings", label: "Settings", icon: "settings", detail: "Preferences and access" },
  { href: "/seller/help", label: "Help", icon: "help", detail: "Guides and support" },
];

function isActive(href: string, pathname: string) {
  return href === "/seller" ? pathname === href : pathname.startsWith(href);
}

function SellerNavLink({
  href,
  icon,
  label,
  pathname,
  onClick,
}: {
  href: string;
  icon: IconName;
  label: string;
  pathname: string;
  onClick?: () => void;
}) {
  const active = isActive(href, pathname);
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={active ? "active" : undefined}
      href={href}
      onClick={onClick}
    >
      <Icon name={icon} size={20} />
      <span>{label}</span>
    </Link>
  );
}

function CreateChoices({ close }: { close: () => void }) {
  return (
    <div className="seller-create-choices">
      <Link href="/seller/products/new" onClick={close}>
        <span className="seller-choice-icon"><Icon name="package" /></span>
        <span><strong>New product</strong><small>Photograph, describe and publish a piece</small></span>
        <Icon name="next" size={18} />
      </Link>
      <Link href="/seller/drops/new" onClick={close}>
        <span className="seller-choice-icon"><Icon name="calendar" /></span>
        <span><strong>New Drop</strong><small>Bring current pieces into one collection</small></span>
        <Icon name="next" size={18} />
      </Link>
    </div>
  );
}

export function SellerShell({ children, session }: { children: React.ReactNode; session: SellerSession }) {
  const pathname = usePathname();
  const { state, pendingWrites, persistenceError, clearPersistenceError } = useSellerStudio();
  const [createOpen, setCreateOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unread = state.notifications.filter((notification) => !notification.read).length;
  const catalogContext = catalogDestinations.some((item) => isActive(item.href, pathname));

  return (
    <div className="seller-shell">
      <aside className="seller-rail">
        <Link aria-label="SOKOZA Seller Studio Home" className="seller-rail-wordmark" href="/seller">
          <span>S</span><small>Studio</small>
        </Link>
        <nav aria-label="Seller Studio" className="seller-rail-nav">
          {globalDestinations.map((item) => (
            <SellerNavLink {...item} key={item.href} pathname={pathname} />
          ))}
        </nav>
        <Link aria-label="Seller settings" className="seller-rail-settings" href="/seller/settings">
          <Icon name="settings" size={20} /><span>Settings</span>
        </Link>
      </aside>

      <div className="seller-workspace">
        <header className="seller-workspace-bar">
          <div className="seller-mobile-brand">
            <Link aria-label="SOKOZA Seller Studio Home" className="wordmark" href="/seller">SOKOZA</Link>
            <span>Seller Studio</span>
          </div>
          <Link className="seller-store-identity" href="/seller/store">
            <span className="seller-store-avatar">
              <SmartImage alt="" fill sizes="40px" src={state.store.avatarImage} />
            </span>
            <span>
              <strong>{state.store.name}</strong>
              <small><i aria-hidden="true" className={`state-${state.store.operatingState}`} /> {state.store.operatingState === "published" ? "Store live" : state.store.operatingState === "paused" ? "Store paused" : "Store draft"}</small>
            </span>
          </Link>
          <div className="seller-workspace-actions">
            <button className="button primary seller-create-button" onClick={() => setCreateOpen(true)} type="button">
              <Icon name="plus" size={18} /> <span>Create</span>
            </button>
            <Link aria-label={unread ? `${unread} unread notifications` : "Notifications"} className="icon-button seller-notification-button" href="/seller/notifications">
              <Icon name="alert" size={20} />
              {unread ? <span>{unread > 9 ? "9+" : unread}</span> : null}
            </Link>
            <button aria-label="Open seller profile menu" className="seller-profile-trigger" onClick={() => setProfileOpen(true)} type="button">
              {state.sellerName.slice(0, 1)}
            </button>
          </div>
        </header>

        {persistenceError ? <div className="seller-persistence-banner" role="alert"><Icon name="alert" size={18} /><span><strong>Change not saved</strong><small>{persistenceError}</small></span><button onClick={() => window.location.reload()} type="button">Reload</button><button aria-label="Dismiss save error" onClick={clearPersistenceError} type="button"><Icon name="close" size={16} /></button></div> : pendingWrites ? <div aria-live="polite" className="seller-persistence-status"><Icon name="clock" size={16} /> Saving {pendingWrites === 1 ? "change" : `${pendingWrites} changes`}…</div> : null}

        {catalogContext ? (
          <nav aria-label="Catalog workspace" className="seller-context-tabs">
            {catalogDestinations.map((item) => (
              <Link aria-current={isActive(item.href, pathname) ? "page" : undefined} className={isActive(item.href, pathname) ? "active" : undefined} href={item.href} key={item.href}>{item.label}</Link>
            ))}
          </nav>
        ) : null}

        <div className="seller-workspace-content">{children}</div>
      </div>

      <nav aria-label="Seller Studio" className="seller-bottom-nav">
        {globalDestinations.slice(0, 4).map((item) => (
          <SellerNavLink {...item} key={item.href} pathname={pathname} />
        ))}
        <button aria-current={utilityDestinations.some((item) => isActive(item.href, pathname)) ? "page" : undefined} className={utilityDestinations.some((item) => isActive(item.href, pathname)) ? "active" : undefined} onClick={() => setMoreOpen(true)} type="button">
          <Icon name="more" size={20} /><span>More</span>
        </button>
      </nav>

      {createOpen ? (
        <AccessibleDialog labelledBy="seller-create-title" onClose={() => setCreateOpen(false)}>
          <div className="sheet-handle" />
          <div className="seller-dialog-heading">
            <div><p className="eyebrow">Create in {state.store.name}</p><h2 id="seller-create-title">What are you making?</h2></div>
            <button aria-label="Close create menu" className="icon-button" onClick={() => setCreateOpen(false)} type="button"><Icon name="close" /></button>
          </div>
          <CreateChoices close={() => setCreateOpen(false)} />
        </AccessibleDialog>
      ) : null}

      {moreOpen ? (
        <AccessibleDialog labelledBy="seller-more-title" onClose={() => setMoreOpen(false)}>
          <div className="sheet-handle" />
          <div className="seller-dialog-heading">
            <div><p className="eyebrow">{state.store.name}</p><h2 id="seller-more-title">More tools</h2></div>
            <button aria-label="Close more tools" className="icon-button" onClick={() => setMoreOpen(false)} type="button"><Icon name="close" /></button>
          </div>
          <nav aria-label="More seller tools" className="seller-more-grid">
            {utilityDestinations.map((item) => (
              <Link href={item.href} key={item.href} onClick={() => setMoreOpen(false)}>
                <Icon name={item.icon} size={21} />
                <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                <Icon name="next" size={17} />
              </Link>
            ))}
          </nav>
        </AccessibleDialog>
      ) : null}

      {profileOpen ? (
        <AccessibleDialog labelledBy="seller-profile-title" onClose={() => setProfileOpen(false)}>
          <div className="sheet-handle" />
          <div className="seller-dialog-heading">
            <div><p className="eyebrow">Seller profile</p><h2 id="seller-profile-title">{state.sellerName}</h2></div>
            <button aria-label="Close profile menu" className="icon-button" onClick={() => setProfileOpen(false)} type="button"><Icon name="close" /></button>
          </div>
          <div className="seller-profile-card">
            <span className="seller-store-avatar large"><SmartImage alt="" fill sizes="64px" src={state.store.avatarImage} /></span>
            <div><strong>{state.store.name}</strong><small>{state.accountEmail}</small></div>
          </div>
          <div className="seller-profile-links">
            <Link href={session.storeSlug ? `/stores/${session.storeSlug}` : "/seller/onboarding"} onClick={() => setProfileOpen(false)}><Icon name="view" size={19} /> {session.storeSlug ? "View Store" : "Complete Store setup"} <Icon name="next" size={17} /></Link>
            <Link href="/seller/settings" onClick={() => setProfileOpen(false)}><Icon name="settings" size={19} /> Settings <Icon name="next" size={17} /></Link>
            <Link href="/" onClick={() => setProfileOpen(false)}><Icon name="back" size={19} /> Back to shopping <Icon name="next" size={17} /></Link>
          </div>
        </AccessibleDialog>
      ) : null}
    </div>
  );
}
