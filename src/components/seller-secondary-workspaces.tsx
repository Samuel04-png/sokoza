"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { endSellerStudioSession } from "@/app/seller/actions";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { formatPrice } from "@/lib/format";
import { emptyProductMetrics, validComparisonChange } from "@/lib/marketplace-ranking";
import { sellerEmailChangeMessage } from "@/lib/seller-account";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SellerPromotions() {
  const { state, setProductPromotion } = useSellerStudio();
  const published = state.products.filter((product) => product.status === "published");
  const eligible = published.filter((product) => !product.previousPrice);
  const [productId, setProductId] = useState(eligible[0]?.id ?? "");
  const [price, setPrice] = useState(eligible[0]?.price ? Math.max(1, eligible[0].price - 100) : 0);
  const [notice, setNotice] = useState("");
  const selected = eligible.find((product) => product.id === productId);
  const promoted = published.filter((product) => product.previousPrice && product.previousPrice > product.price);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function startPromotion() {
    if (!selected || price <= 0 || price >= selected.price) return;
    setSaving(true);
    setError("");
    const result = await setProductPromotion(selected.id, price);
    setSaving(false);
    if (!result.saved) {
      setError(result.error ?? "The promotion could not be saved.");
      return;
    }
    setNotice(`${selected.title} now shows a promotional price of ${formatPrice(price)}.`);
    const next = eligible.find((product) => product.id !== selected.id);
    setProductId(next?.id ?? "");
    setPrice(next ? Math.max(1, next.price - 100) : 0);
  }

  async function endPromotion(productId: string) {
    const product = state.products.find((item) => item.id === productId);
    if (!product?.previousPrice) return;
    setSaving(true);
    setError("");
    const result = await setProductPromotion(productId, null);
    setSaving(false);
    if (!result.saved) {
      setError(result.error ?? "The promotion could not be ended.");
      return;
    }
    setNotice(`${product.title} returned to its previous current price.`);
  }

  return (
    <div className="seller-page seller-promotions-page">
      <header className="seller-page-header"><div><p className="eyebrow">Truthful price promotion</p><h1>Promotions</h1><p>Show a real current reduction on selected products. SOKOZA displays both prices clearly.</p></div></header>
      {notice ? <div className="seller-inline-success" role="status"><Icon name="tick" size={18} /> {notice}<button aria-label="Dismiss" onClick={() => setNotice("")} type="button"><Icon name="close" size={16} /></button></div> : null}
      {error ? <div className="seller-inline-error" role="alert"><Icon name="alert" size={18} /> {error}</div> : null}
      <div className="seller-promotions-layout">
        <section className="seller-promotion-builder"><p className="eyebrow">Create a promotion</p><h2>Reduce one current price</h2><label>Product<select disabled={saving || !eligible.length} onChange={(event) => { const next = eligible.find((product) => product.id === event.target.value); setProductId(event.target.value); setPrice(next ? Math.max(1, next.price - 100) : 0); }} value={productId}>{eligible.length ? eligible.map((product) => <option key={product.id} value={product.id}>{product.title} · {formatPrice(product.price)}</option>) : <option value="">No published products available</option>}</select></label>{selected ? <div className="seller-promotion-product"><span><SmartImage alt="" fill sizes="84px" src={selected.images[0]} /></span><div><strong>{selected.title}</strong><small>Current price {formatPrice(selected.price)}</small></div></div> : null}<label>Promotional price (ZMW)<div className="seller-money-input"><span>K</span><input disabled={saving || !selected} max={selected ? selected.price - 1 : undefined} min="1" onChange={(event) => setPrice(Number(event.target.value))} type="number" value={price || ""} /></div></label>{selected && price >= selected.price ? <p className="seller-validation invalid"><Icon name="alert" size={17} /> Promotional price must be below {formatPrice(selected.price)}.</p> : null}<button className="button primary full" disabled={saving || !selected || price <= 0 || price >= selected.price} onClick={() => void startPromotion()} type="button">{saving ? "Saving…" : "Start promotion"}</button><small>There is no coupon code. Buyers see the price reduction before they prepare an enquiry.</small></section>
        <section><div className="seller-section-heading"><div><p className="eyebrow">Current</p><h2>Active promotions</h2></div><span>{promoted.length}</span></div>{promoted.length ? <div className="seller-active-promotions">{promoted.map((product) => <article key={product.id}><span><SmartImage alt="" fill sizes="72px" src={product.images[0]} /></span><div><strong>{product.title}</strong><p><del>{formatPrice(product.previousPrice!)}</del> {formatPrice(product.price)}</p><small>{Math.round((1 - product.price / product.previousPrice!) * 100)}% lower</small></div><button className="seller-text-action" disabled={saving} onClick={() => void endPromotion(product.id)} type="button">End promotion</button></article>)}</div> : <div className="seller-empty-state compact"><Icon name="bookmark" size={28} /><h3>No active promotions</h3><p>A reduced price will appear here and on the buyer product card.</p></div>}</section>
      </div>
      <section className="seller-future-note"><div><Icon name="info" size={24} /></div><div><p className="eyebrow">Later release</p><h2>Coupons need reliable redemption evidence.</h2><p>Manual WhatsApp confirmation cannot consistently prove whether a code was redeemed. Coupon creation stays unavailable until orders and redemptions can be attributed safely.</p></div></section>
    </div>
  );
}

export function SellerInsights() {
  const { state } = useSellerStudio();
  const published = state.products.filter((product) => product.status === "published");
  const [now] = useState(() => new Date());
  const windowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const currentEnquiries = state.enquiries.filter((enquiry) => new Date(enquiry.createdAt) >= windowStart);
  const productSignals = published.map((product) => {
    const marketplace = state.productMetrics[product.id] ?? emptyProductMetrics(product.id);
    const enquiries = currentEnquiries.filter((enquiry) => enquiry.lines.some((line) => line.productId === product.id));
    return {
      product,
      marketplace,
      orderReviews: enquiries.length,
      whatsappOpens: enquiries.filter((enquiry) => ["whatsapp_opened", "buyer_marked_sent"].includes(enquiry.buyerSignal)).length,
      buyerMarkedSent: enquiries.filter((enquiry) => enquiry.buyerSignal === "buyer_marked_sent").length,
    };
  });
  const marketplaceTotals = productSignals.reduce((result, signal) => ({
    rawViews: result.rawViews + signal.marketplace.rawViews7d,
    uniqueViewers: result.uniqueViewers + signal.marketplace.uniqueViewers7d,
    saves: result.saves + signal.marketplace.saves7d,
  }), { rawViews: 0, uniqueViewers: 0, saves: 0 });
  const totals = {
    ...marketplaceTotals,
    orderReviews: currentEnquiries.length,
    whatsappOpens: currentEnquiries.filter((enquiry) => ["whatsapp_opened", "buyer_marked_sent"].includes(enquiry.buyerSignal)).length,
    buyerMarkedSent: currentEnquiries.filter((enquiry) => enquiry.buyerSignal === "buyer_marked_sent").length,
  };
  const metricDefinitions = [
    { label: "Product views", value: totals.rawViews, definition: "Product-detail opens after detectable bots and seller self-views are excluded; repeat opens may remain." },
    { label: "Unique viewers", value: totals.uniqueViewers, definition: "Meaningful session/product pairs; repeats inside the deduplication window count once." },
    { label: "Saves", value: totals.saves, definition: "Unique recent save actions per product and session." },
    { label: "Order reviews", value: totals.orderReviews, definition: "Seller-specific order reviews containing a published piece." },
    { label: "WhatsApp opens", value: totals.whatsappOpens, definition: "Outbound handoff links opened; message delivery is not proven." },
    { label: "Buyer marked sent", value: totals.buyerMarkedSent, definition: "Buyers said they sent the prepared enquiry; this is not a completed purchase." },
  ];
  const sortedSignals = [...productSignals].sort((a, b) =>
    (b.buyerMarkedSent * 8 + b.whatsappOpens * 5 + b.orderReviews * 3 + b.marketplace.saves7d * 2 + b.marketplace.uniqueViewers7d * 0.25) -
    (a.buyerMarkedSent * 8 + a.whatsappOpens * 5 + a.orderReviews * 3 + a.marketplace.saves7d * 2 + a.marketplace.uniqueViewers7d * 0.25),
  );
  return (
    <div className="seller-page seller-insights-page">
      <header className="seller-page-header"><div><p className="eyebrow">Buyer-interest signals</p><h1>Insights</h1><p>See what drew attention, with the limits of every signal kept visible.</p></div><span className="seller-range-readout">Last 7 days</span></header>
      <div className="seller-insight-notice"><Icon name="info" size={20} /><p><strong>{new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeZone: "Africa/Lusaka" }).format(windowStart)}–{new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeZone: "Africa/Lusaka" }).format(now)} · Africa/Lusaka.</strong> These aggregate actions show marketplace interest, not purchases, revenue, or viewer identity.</p></div>
      <section className="seller-insight-grid">{metricDefinitions.map((metric) => <article key={metric.label}><div><span>{metric.label}</span><strong>{metric.value}</strong><small>7-day total</small></div><p>{metric.definition}</p></article>)}</section>
      <div className="seller-insights-split">
        <section><div className="seller-section-heading"><div><p className="eyebrow">Product evidence</p><h2>Your pieces getting attention</h2></div><Link href="/seller/products">Manage products</Link></div><div className="seller-top-products">{sortedSignals.map((signal, index) => { const change = validComparisonChange(signal.marketplace.uniqueViewers7d, signal.marketplace.previousUniqueViewers7d); return <Link href={`/seller/products/${signal.product.id}`} key={signal.product.id}><span className="seller-rank">{String(index + 1).padStart(2, "0")}</span><span className="seller-top-product-image"><SmartImage alt="" fill sizes="72px" src={signal.product.images[0]} /></span><span><strong>{signal.product.title}</strong><small>{signal.marketplace.rawViews7d} views · {signal.marketplace.uniqueViewers7d} unique · {signal.marketplace.saves7d} saves · {signal.orderReviews} reviews</small>{change !== null ? <em>{change >= 0 ? "+" : ""}{change}% unique viewers vs previous 7 days</em> : null}</span><Icon name="next" size={17} /></Link>; })}</div></section>
        <aside className="seller-growth-opportunities"><p className="eyebrow">Useful next moves</p><h2>Grow from what you can prove.</h2>{sortedSignals[0] ? <Link href={`/seller/products/${sortedSignals[0].product.id}`}><Icon name="view" size={21} /><span><strong>Review the leading signal</strong><small>{sortedSignals[0].product.title} has the strongest supported mix of recent enquiry actions.</small></span><Icon name="next" size={16} /></Link> : null}<Link href="/seller/inventory"><Icon name="refresh" size={21} /><span><strong>Protect current interest</strong><small>Confirm low or stale availability before more buyers review a piece.</small></span><Icon name="next" size={16} /></Link><Link href="/seller/products"><Icon name="image" size={21} /><span><strong>Improve thin listings</strong><small>Use fit, detail, size, price, and condition information before guessing at a traffic problem.</small></span><Icon name="next" size={16} /></Link></aside>
      </div>
      <section className="seller-signal-funnel"><div><p className="eyebrow">Evidence boundary</p><h2>Interest signals are not sales.</h2></div><ol><li><span>{totals.uniqueViewers}</span><small>Unique viewers</small></li><li><Icon name="next" size={16} /><span>{totals.saves}</span><small>Saves</small></li><li><Icon name="next" size={16} /><span>{totals.orderReviews}</span><small>Order reviews</small></li><li><Icon name="next" size={16} /><span>{totals.whatsappOpens}</span><small>WhatsApp opens</small></li><li><Icon name="next" size={16} /><span>{totals.buyerMarkedSent}</span><small>Buyer marked sent</small></li></ol><p>These totals describe supported actions in the selected window. They are not a same-session conversion cohort and do not prove payment or fulfilment.</p></section>
    </div>
  );
}

export function SellerNotifications() {
  const { state, markAllNotificationsRead, markNotification } = useSellerStudio();
  return (
    <div className="seller-page seller-notifications-page"><header className="seller-page-header"><div><p className="eyebrow">Recent Store activity</p><h1>Notifications</h1><p>One place for buyer signals, stock reminders and trust updates.</p></div><button className="button secondary" disabled={!state.notifications.some((notification) => !notification.read)} onClick={markAllNotificationsRead} type="button">Mark all read</button></header>
      <div className="seller-notification-list">{state.notifications.map((notification) => <article className={notification.read ? "is-read" : ""} key={notification.id}><span className={`seller-notification-kind kind-${notification.kind}`}><Icon name={notification.kind === "enquiry" ? "whatsapp" : notification.kind === "inventory" ? "refresh" : notification.kind === "store" ? "shield" : "view"} size={20} /></span><div><small>{new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lusaka" }).format(new Date(notification.createdAt))}</small><h2>{notification.title}</h2><p>{notification.body}</p></div><Link href={notification.href} onClick={() => markNotification(notification.id)}>Open <Icon name="next" size={16} /></Link><button aria-label={notification.read ? `Mark ${notification.title} unread` : `Mark ${notification.title} read`} className="seller-text-action" onClick={() => markNotification(notification.id, !notification.read)} type="button">{notification.read ? "Mark unread" : "Mark read"}</button></article>)}</div>
    </div>
  );
}

export function SellerSettings() {
  const { state, updatePreferences, updateSellerName } = useSellerStudio();
  const [notice, setNotice] = useState("");
  const [accountError, setAccountError] = useState("");
  const [sellerName, setSellerName] = useState(state.sellerName);
  const [email, setEmail] = useState(state.accountEmail);
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [requestedEmail, setRequestedEmail] = useState("");
  const pendingEmail = requestedEmail || state.accountPendingEmail;

  async function saveSellerName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = sellerName.trim();
    if (normalizedName.length < 2) {
      setAccountError("Enter a seller name with at least 2 characters.");
      return;
    }
    setSavingName(true);
    setAccountError("");
    setNotice("");
    const result = await updateSellerName(normalizedName);
    setSavingName(false);
    if (result.saved) setNotice("Seller name updated.");
    else setAccountError(result.error ?? "We couldn't update your seller name.");
  }

  async function requestEmailChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLocaleLowerCase();
    if (!normalizedEmail || normalizedEmail === state.accountEmail.toLocaleLowerCase()) {
      setAccountError(normalizedEmail ? "Enter a different email address." : "Enter a valid email address.");
      return;
    }
    if (normalizedEmail === pendingEmail.toLocaleLowerCase()) {
      setAccountError("That email change is already awaiting confirmation. Check both inboxes for Supabase verification messages.");
      return;
    }
    setSavingEmail(true);
    setAccountError("");
    setNotice("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser(
      { email: normalizedEmail },
      { emailRedirectTo: `${window.location.origin}/auth/callback?next=/seller/settings` },
    );
    setSavingEmail(false);
    if (error) {
      setAccountError(sellerEmailChangeMessage(error));
      return;
    }
    setRequestedEmail(normalizedEmail);
    setNotice(`Verification sent to ${normalizedEmail}. Confirm the messages sent to both email addresses before using the new sign-in.`);
  }

  return (
    <div className="seller-page seller-settings-page"><header className="seller-page-header"><div><p className="eyebrow">Account and workspace</p><h1>Settings</h1><p>Control operational notifications, display preferences and secure access.</p></div></header>
      {notice ? <div className="seller-inline-success" role="status"><Icon name="tick" size={18} /> {notice}<button aria-label="Dismiss" onClick={() => setNotice("")} type="button"><Icon name="close" size={16} /></button></div> : null}
      <section className="seller-settings-section"><div className="seller-form-section-heading"><span>01</span><div><h2>Seller profile</h2><p>Your seller name is private workspace identity. Your email is the credential used to sign in.</p></div></div>
        {accountError ? <p className="seller-validation invalid" role="alert"><Icon name="alert" size={17} /> {accountError}</p> : null}
        {pendingEmail ? <div className="seller-account-pending" role="status"><Icon name="clock" size={18} /><span><strong>Email change awaiting confirmation</strong><small>{pendingEmail} cannot be used to sign in yet. Open the Supabase confirmation messages sent to both {state.accountEmail} and {pendingEmail}.</small></span></div> : null}
        <div className="seller-account-edit-grid">
          <form onSubmit={saveSellerName}><label htmlFor="seller-name">Seller name</label><div><input autoComplete="name" id="seller-name" maxLength={120} minLength={2} onChange={(event) => setSellerName(event.target.value)} required value={sellerName} /><button className="button secondary" disabled={savingName || sellerName.trim() === state.sellerName} type="submit">{savingName ? "Saving…" : "Save name"}</button></div><small>Shown only inside Seller Studio. This does not rename your public Store.</small></form>
          <form onSubmit={requestEmailChange}><label htmlFor="seller-email">Sign-in email</label><div><input autoComplete="email" id="seller-email" maxLength={254} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /><button className="button secondary" disabled={savingEmail || email.trim().toLocaleLowerCase() === state.accountEmail.toLocaleLowerCase()} type="submit">{savingEmail ? "Sending…" : "Change email"}</button></div><small>We’ll send a verification link. Your current email stays active until the new address is confirmed.</small></form>
        </div>
        <dl className="seller-account-summary"><div><dt>Public Store</dt><dd>{state.store.name}</dd></div></dl><div className="seller-settings-inline-actions"><Link className="button secondary" href={`/stores/${state.store.slug}`}>View Store</Link><Link className="button secondary" href="/seller/verification">Trust profile</Link></div></section>
      <section className="seller-settings-section"><div className="seller-form-section-heading"><span>02</span><div><h2>Notifications</h2><p>Choose which operating reminders appear in Seller Studio.</p></div></div>{[
        ["enquiryAlerts", "Buyer enquiry alerts", "When a buyer marks a prepared enquiry as sent."],
        ["freshnessReminders", "Inventory freshness reminders", "When published availability should be checked again."],
        ["weeklySummary", "Weekly signal summary", "A concise view of supported marketplace actions."],
      ].map(([key, label, detail]) => <label className="seller-toggle-row" key={key}><span><strong>{label}</strong><small>{detail}</small></span><input checked={state.preferences[key as keyof typeof state.preferences] as boolean} onChange={(event) => { updatePreferences({ [key]: event.target.checked }); setNotice("Notification preference saved."); }} type="checkbox" /></label>)}</section>
      <section className="seller-settings-section"><div className="seller-form-section-heading"><span>03</span><div><h2>Workspace</h2><p>Adjust product-list density and review this Store’s saved state.</p></div></div><label className="seller-toggle-row"><span><strong>Compact product list</strong><small>Reduce row spacing when managing a larger catalog.</small></span><input checked={state.preferences.compactCatalog} onChange={(event) => { updatePreferences({ compactCatalog: event.target.checked }); setNotice("Workspace preference saved."); }} type="checkbox" /></label><div className="seller-settings-links"><Link href="/seller/help">Seller help <span>↗</span></Link><button aria-describedby="export-future" disabled type="button">Request data export <small id="export-future">Available after secure account verification</small></button></div></section>
      <section className="seller-settings-section"><div className="seller-form-section-heading"><span>04</span><div><h2>Access</h2><p>Sign out when you finish on a shared device.</p></div></div><form action={endSellerStudioSession}><button className="button secondary" type="submit">Sign out</button></form></section>
    </div>
  );
}

const helpTopics = [
  { title: "Publish a product", body: "Add photos, details, price, options, stock and fulfilment. Review the buyer view, then publish.", href: "/seller/products/new" },
  { title: "Confirm availability", body: "Use Inventory for one-tap states or select several pieces and review one bulk change.", href: "/seller/inventory" },
  { title: "Understand an enquiry", body: "The snapshot records what the buyer reviewed. WhatsApp opens and buyer-marked sent are intent signals, not completed orders.", href: "/seller/enquiries" },
  { title: "Pause the Store", body: "Store settings include a reversible pause that keeps public context while disabling new enquiry actions.", href: "/seller/store#status" },
  { title: "Read Insights", body: "Every metric includes a window and definition. Seller Studio never turns a handoff into a sales claim.", href: "/seller/insights" },
  { title: "Improve verification", body: "Open your trust profile to see what is public, what stays private and when an update is needed.", href: "/seller/verification" },
];

export function SellerHelp() {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => helpTopics.filter((topic) => !query.trim() || `${topic.title} ${topic.body}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [query]);
  return (
    <div className="seller-page seller-help-page"><header className="seller-page-header"><div><p className="eyebrow">Practical Store guidance</p><h1>How can we help?</h1><p>Find the shortest path through a Seller Studio task.</p></div></header><label className="seller-help-search"><Icon name="search" size={21} /><span className="sr-only">Search seller help</span><input autoFocus onChange={(event) => setQuery(event.target.value)} placeholder="Search products, enquiries, inventory…" type="search" value={query} /></label><div className="seller-help-grid">{visible.map((topic) => <article key={topic.title}><Icon name="help" size={22} /><h2>{topic.title}</h2><p>{topic.body}</p><Link href={topic.href}>Open this workspace <Icon name="next" size={16} /></Link></article>)}</div>{!visible.length ? <div className="seller-empty-state"><Icon name="search" size={28} /><h2>No matching guide</h2><p>Try a broader phrase, or contact seller support below.</p><button className="button secondary" onClick={() => setQuery("")} type="button">Clear search</button></div> : null}<section className="seller-support-card"><div><p className="eyebrow">Still stuck?</p><h2>Contact seller support</h2><p>Include your Store name, the page you were using and what you expected to happen. Never attach identity evidence to ordinary support email.</p></div><a className="button primary" href="mailto:sellers@sokoza.example?subject=Seller%20Studio%20help">Email seller support</a></section></div>
  );
}
