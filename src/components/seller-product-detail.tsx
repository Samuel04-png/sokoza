"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { formatPrice } from "@/lib/format";
import { publicProductHref } from "@/lib/seller-studio-types";
import { emptyProductMetrics, validComparisonChange } from "@/lib/marketplace-ranking";

export function SellerProductDetail({ productId }: { productId: string }) {
  const searchParams = useSearchParams();
  const { state, setAvailability } = useSellerStudio();
  const [now] = useState(() => new Date());
  const product = state.products.find((item) => item.id === productId);

  if (!product) return <div className="seller-page"><div className="seller-empty-state"><Icon name="package" size={30} /><h1>Product not found</h1><p>It may have been removed from this Store.</p><Link className="button secondary" href="/seller/products">Return to products</Link></div></div>;

  const marketplace = state.productMetrics[product.id] ?? emptyProductMetrics(product.id);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const enquiries = state.enquiries.filter((enquiry) =>
    new Date(enquiry.createdAt) >= sevenDaysAgo &&
    enquiry.lines.some((line) => line.productId === product.id),
  );
  const orderReviews = enquiries.length;
  const whatsappOpens = enquiries.filter((enquiry) => ["whatsapp_opened", "buyer_marked_sent"].includes(enquiry.buyerSignal)).length;
  const buyerMarkedSent = enquiries.filter((enquiry) => enquiry.buyerSignal === "buyer_marked_sent").length;
  const viewChange = validComparisonChange(marketplace.uniqueViewers7d, marketplace.previousUniqueViewers7d);
  const stockNeedsAttention = ["low", "stale"].includes(product.availability) && orderReviews + buyerMarkedSent >= 2;
  const highViewsLowEnquiry = marketplace.uniqueViewers7d >= 10 && orderReviews < 2;

  return (
    <div className="seller-page seller-product-detail-page">
      {searchParams.get("published") ? <div className="seller-inline-success" role="status"><Icon name="tick" size={18} /> {product.title} is now published.<Link href={publicProductHref(product)}>View product ↗</Link></div> : null}
      <header className="seller-detail-header"><div><Link className="seller-back-link" href="/seller/products"><Icon name="back" size={17} /> Products</Link><span className={`seller-state-badge state-${product.status}`}>{product.status}</span><h1>{product.title}</h1><p>{product.category} · {product.condition} · {product.color}</p></div><div><Link className="button secondary" href={`/seller/products/${product.id}/edit`}>Edit product</Link>{product.status === "published" ? <Link className="button primary" href={publicProductHref(product)}>View public</Link> : null}</div></header>
      <div className="seller-product-detail-grid">
        <section className="seller-product-gallery"><div><SmartImage alt={product.title} fill priority sizes="(max-width: 899px) 100vw, 52vw" src={product.images[0]} /></div>{product.images.slice(1).map((image, index) => <span key={image}><SmartImage alt={`${product.title} view ${index + 2}`} fill sizes="140px" src={image} /></span>)}</section>
        <aside className="seller-product-detail-copy"><p className="eyebrow">Current price</p><h2>{formatPrice(product.price)}</h2>{product.previousPrice ? <del>{formatPrice(product.previousPrice)}</del> : null}<p>{product.description}</p><ul>{product.details.filter(Boolean).map((detail, index) => <li key={`${detail}-${index}`}>{detail}</li>)}</ul><div className="seller-product-state-control"><div><strong>Public availability</strong><small>Last confirmed {new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lusaka" }).format(new Date(product.confirmedAt))}</small></div><div>{(["available", "low", "sold"] as const).map((status) => <button aria-pressed={product.availability === status} key={status} onClick={() => setAvailability([product.id], status)} type="button">{status === "low" ? "Low" : status[0].toUpperCase() + status.slice(1)}</button>)}</div></div></aside>
      </div>
      <section className="seller-product-options"><div className="seller-section-heading"><div><p className="eyebrow">Options</p><h2>Current quantities</h2></div><Link href="/seller/inventory">Open Inventory</Link></div><div>{product.variants.map((variant) => <article key={variant.id}><span style={{ background: variant.colorHex }} /><div><strong>{variant.label}</strong><small>{variant.color}</small></div><em>{variant.quantity ?? "Made to order"}</em><b>{variant.available ? "Available" : "Unavailable"}</b></article>)}</div></section>
      <section className="seller-product-signal-strip"><div><span>Views</span><strong>{marketplace.rawViews7d}</strong><small>Page opens · 7 days</small></div><div><span>Unique viewers</span><strong>{marketplace.uniqueViewers7d}</strong><small>{viewChange === null ? "Meaningful sessions" : `${viewChange >= 0 ? "+" : ""}${viewChange}% vs previous 7 days`}</small></div><div><span>Saves</span><strong>{marketplace.saves7d}</strong><small>Unique recent saves</small></div><div><span>Order reviews</span><strong>{orderReviews}</strong><small>Not completed orders</small></div><div><span>WhatsApp opens</span><strong>{whatsappOpens}</strong><small>Message delivery not proven</small></div><div><span>Buyer marked sent</span><strong>{buyerMarkedSent}</strong><small>Qualified enquiry signal</small></div></section>
      {stockNeedsAttention ? <section className="seller-product-insight"><Icon name="alert" size={24} /><div><p className="eyebrow">High interest</p><h2>Confirm availability</h2><p>{product.title} has recent order-review activity while its availability needs closer attention. Check the remaining options before more buyers prepare an enquiry.</p></div><Link className="button secondary" href="/seller/inventory">Check inventory</Link></section> : highViewsLowEnquiry ? <section className="seller-product-insight"><Icon name="view" size={24} /><div><p className="eyebrow">High views · low enquiry</p><h2>Review the product decision details</h2><p>People are viewing this piece but few are starting an order review. Check available sizes, photos, description, price, and inventory freshness; the data does not identify one specific cause.</p></div><Link className="button secondary" href={`/seller/products/${product.id}/edit`}>Review listing</Link></section> : null}
    </div>
  );
}
