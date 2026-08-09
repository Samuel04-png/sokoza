"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { formatPrice } from "@/lib/format";
import { emptyProductMetrics } from "@/lib/marketplace-ranking";
import { hasValidFulfilment } from "@/lib/store-fulfilment";

export function SellerHome() {
  const { state } = useSellerStudio();
  const [now] = useState(() => new Date());
  const newEnquiries = state.enquiries.filter((enquiry) => enquiry.status === "new");
  const lowStock = state.products.filter((product) => product.status === "published" && product.availability === "low");
  const drafts = state.products.filter((product) => product.status === "draft");
  const primaryEnquiry = newEnquiries[0];
  const lowProduct = lowStock[0];
  const draft = drafts[0];
  const fulfilmentReady = hasValidFulfilment(state.store);
  const storeChecks = [state.store.description, state.store.whatsapp, fulfilmentReady, state.store.exchanges && state.store.cancellation, state.products.some((product) => product.status === "published")];
  const readyCount = storeChecks.filter(Boolean).length;
  const published = state.products.filter((product) => product.status === "published");
  const marketplaceTotals = published.reduce((totals, product) => {
    const productMetrics = state.productMetrics[product.id] ?? emptyProductMetrics(product.id);
    return {
      rawViews: totals.rawViews + productMetrics.rawViews7d,
      uniqueViewers: totals.uniqueViewers + productMetrics.uniqueViewers7d,
      saves: totals.saves + productMetrics.saves7d,
    };
  }, { rawViews: 0, uniqueViewers: 0, saves: 0 });
  const recentEnquiries = state.enquiries.filter((enquiry) => now.getTime() - new Date(enquiry.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000);
  const signals = [
    { label: "Product views", value: marketplaceTotals.rawViews, detail: "Detail-page opens", href: "/seller/insights" },
    { label: "Unique viewers", value: marketplaceTotals.uniqueViewers, detail: "Meaningful session/product pairs", href: "/seller/insights" },
    { label: "Saves", value: marketplaceTotals.saves, detail: "Unique recent save actions", href: "/seller/insights" },
    { label: "Buyer marked sent", value: recentEnquiries.filter((enquiry) => enquiry.buyerSignal === "buyer_marked_sent").length, detail: "Qualified enquiry signals", href: "/seller/insights" },
  ];
  const lowProductEnquiries = lowProduct ? recentEnquiries.filter((enquiry) => enquiry.lines.some((line) => line.productId === lowProduct.id)).length : 0;
  const windowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekday = new Intl.DateTimeFormat("en-ZM", { weekday: "long", timeZone: "Africa/Lusaka" }).format(now);
  const attentionCount = Number(Boolean(primaryEnquiry)) + Number(Boolean(lowProduct)) + Number(Boolean(draft));

  return (
    <div className="seller-page seller-home-page">
      <header className="seller-page-header seller-home-header">
        <div><p className="eyebrow">{weekday} · {state.store.area}</p><h1>Good afternoon, {state.sellerName}.</h1><p>Start with the buyer conversations and pieces that need your attention.</p></div>
        <Link className="seller-view-store-link" href={`/stores/${state.store.slug}`}><Icon name="view" size={18} /> View Store</Link>
      </header>

      <section aria-labelledby="seller-attention-title" className="seller-attention">
        <div className="seller-section-heading"><div><p className="eyebrow">Today in {state.store.name}</p><h2 id="seller-attention-title">{attentionCount ? `${attentionCount} useful next ${attentionCount === 1 ? "move" : "moves"}` : "Nothing needs immediate attention"}</h2></div><span>Ordered by buyer impact</span></div>
        <div className="seller-command-list">
          {!attentionCount ? (
            <div className="seller-attention-clear"><Icon name="tick" size={22} /><div><strong>Your published Store is current.</strong><p>No new buyer-marked enquiries, low-stock pieces or unfinished drafts need action. You can review Insights or add another current piece.</p><span><Link href="/seller/insights">Review Insights</Link><Link href="/seller/products/new">Add a product</Link></span></div></div>
          ) : null}
          {primaryEnquiry ? (
            <Link className="seller-command-row is-urgent" href={`/seller/enquiries/${primaryEnquiry.reference}`}>
              <span className="seller-command-image"><SmartImage alt="" fill sizes="96px" src={primaryEnquiry.lines[0].image} /></span>
              <span className="seller-command-copy"><small>New enquiry · {primaryEnquiry.reference}</small><strong>Follow up on {primaryEnquiry.lines[0].title}</strong><em>The buyer marked the prepared WhatsApp enquiry as sent.</em></span>
              <span className="seller-command-action">Review enquiry <Icon name="next" size={17} /></span>
            </Link>
          ) : null}
          {lowProduct ? (
            <Link className="seller-command-row" href="/seller/inventory?status=low">
              <span className="seller-command-image"><SmartImage alt="" fill sizes="96px" src={lowProduct.images[0]} /></span>
              <span className="seller-command-copy"><small>{lowProductEnquiries >= 2 ? "High interest · low availability" : "Low availability"}</small><strong>Confirm {lowProduct.title}</strong><em>{lowProductEnquiries >= 2 ? `${lowProductEnquiries} recent order reviews make a current stock check useful.` : `${lowProduct.variants.filter((variant) => variant.available).length} options are currently available.`}</em></span>
              <span className="seller-command-action">Check inventory <Icon name="next" size={17} /></span>
            </Link>
          ) : null}
          {draft ? (
            <Link className="seller-command-row" href={`/seller/products/${draft.id}/edit`}>
              <span className="seller-command-image"><SmartImage alt="" fill sizes="96px" src={draft.images[0]} /></span>
              <span className="seller-command-copy"><small>Product draft</small><strong>Finish {draft.title}</strong><em>Add the remaining product detail, then review the buyer view.</em></span>
              <span className="seller-command-action">Continue draft <Icon name="next" size={17} /></span>
            </Link>
          ) : null}
        </div>
      </section>

      <div className="seller-home-split">
        <section className="seller-current-store" aria-labelledby="seller-current-title">
          <div className="seller-section-heading"><div><p className="eyebrow">Current Store</p><h2 id="seller-current-title">What buyers can shop now</h2></div><Link href="/seller/products">Manage products</Link></div>
          <div className="seller-current-grid">
            {state.products.filter((product) => product.status === "published").slice(0, 3).map((product) => (
              <Link href={`/seller/products/${product.id}`} key={product.id}>
                <span><SmartImage alt="" fill sizes="(max-width: 639px) 42vw, 180px" src={product.images[0]} /></span>
                <small>{product.status === "draft" && product.availability === "sold" ? "Needs stock review" : product.availability === "low" ? "Low stock" : product.availability === "sold" ? "Sold" : "Available"}</small>
                <strong>{product.title}</strong><em>{formatPrice(product.price)}</em>
              </Link>
            ))}
          </div>
        </section>

        <aside className="seller-readiness-card">
          <p className="eyebrow">Store readiness</p><h2>{readyCount} of {storeChecks.length} ready</h2><p>Clear contact, fulfilment and policies help buyers move confidently into WhatsApp.</p>
          <ul>{[
            ["Store story", Boolean(state.store.description)],
            ["WhatsApp contact", Boolean(state.store.whatsapp)],
            ["Collection or delivery", fulfilmentReady],
            ["Buyer policies", Boolean(state.store.exchanges && state.store.cancellation)],
            ["Published product", state.products.some((product) => product.status === "published")],
          ].map(([label, ready]) => <li key={String(label)}><Icon name={ready ? "tick" : "alert"} size={17} /> {label}</li>)}</ul>
          <Link className="button secondary full" href="/seller/store">Review Store</Link>
        </aside>
      </div>

      <section className="seller-signal-section" aria-labelledby="seller-signal-title">
        <div className="seller-section-heading"><div><p className="eyebrow">{new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeZone: "Africa/Lusaka" }).format(windowStart)}–{new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeZone: "Africa/Lusaka" }).format(now)} · Africa/Lusaka</p><h2 id="seller-signal-title">Signals, not sales</h2></div><Link href="/seller/insights">Open Insights</Link></div>
        <div className="seller-signal-grid">{signals.map((signal) => <Link href={signal.href} key={signal.label}><small>{signal.label}</small><strong>{signal.value}</strong><span>{signal.detail}</span></Link>)}</div>
        <p className="seller-metric-guardrail">These are marketplace actions. They do not prove payment, fulfilment or a completed order.</p>
      </section>
    </div>
  );
}
