"use client";

import Link from "next/link";
import { useEffect } from "react";
import { DropCard } from "@/components/drop-card";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { ProductGrid } from "@/components/product-card";
import { ShareButton } from "@/components/share-button";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { useMarketplaceSignals } from "@/components/marketplace-signals-provider";
import { formatDate, verificationLabel } from "@/lib/format";
import type { Drop, Product, Store } from "@/lib/types";

export function PublicStorePage({ baseStore, baseProducts, baseDrops, allStores }: { baseStore: Store; baseProducts: Product[]; baseDrops: Drop[]; allStores: Store[] }) {
  const { state } = useSellerStudio();
  const { captureActivity } = useMarketplaceSignals();
  const isStudioStore = baseStore.id === state.store.id;
  const store: Store = isStudioStore ? {
    ...baseStore,
    name: state.store.name,
    tagline: state.store.tagline,
    description: state.store.description,
    location: `${state.store.area}, ${state.store.city}`,
    whatsapp: state.store.whatsapp.replace(/\D/g, ""),
    socialLinks: { facebook: state.store.facebookUrl || undefined, tiktok: state.store.tiktokUrl || undefined },
    categories: state.store.categories,
    coverImage: state.store.coverImage,
    avatarImage: state.store.avatarImage,
    status: state.store.operatingState === "published" ? "active" : "temporarily_closed",
    fulfilment: { collection: state.store.collection, delivery: state.store.delivery, exchanges: state.store.exchanges },
  } : baseStore;
  const storeProducts = isStudioStore ? state.products.filter((product) => product.status === "published") : baseProducts;
  const storeDrops: Drop[] = isStudioStore ? state.drops.filter((drop) => drop.status === "live").map((drop) => ({ id: drop.id, slug: drop.slug, storeId: store.id, title: drop.title, subtitle: drop.subtitle, status: "live", coverImage: drop.coverImage, productIds: drop.productIds, publishedAt: drop.publishedAt ?? drop.updatedAt })) : baseDrops;
  const stores = allStores.map((item) => item.id === store.id ? store : item);

  useEffect(() => {
    captureActivity("store_viewed", { storeId: baseStore.id });
  }, [baseStore.id, captureActivity]);

  return (
    <div className="store-page">
      <section className="store-hero">
        <div className="store-hero-cover"><SmartImage alt={`${store.name} collection`} fill priority sizes="(max-width: 1023px) 100vw, (max-width: 1536px) 62vw, 880px" src={store.coverImage} /></div>
        <div className="store-hero-content">
          <div className="store-avatar large"><SmartImage alt={`${store.name} profile`} fill sizes="96px" src={store.avatarImage} /></div>
          <div className="store-title-block"><p className="eyebrow">{store.location}</p><h1>{store.name}</h1><p>{store.tagline}</p></div>
          <p className="store-hero-description">{store.description}</p>
          <div aria-label="Store categories" className="store-category-list">{store.categories.map((category) => <Link href={`/discover?category=${encodeURIComponent(category)}`} key={category}>{category}</Link>)}</div>
          <div className="store-actions">{store.status === "active" ? <a className="button whatsapp" href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Hello ${store.name}, I found your Store on SOKOZA and have a question.`)}`} rel="noreferrer" target="_blank"><Icon name="whatsapp" size={19} /> Contact Store</a> : <span aria-disabled="true" className="button disabled"><Icon name="whatsapp" size={19} /> Contact paused</span>}<ShareButton label={store.name} text={`${store.name} on SOKOZA`} /></div>
          {store.socialLinks?.tiktok || store.socialLinks?.facebook ? <div aria-label="Store social profiles" className="store-social-links">{store.socialLinks?.tiktok ? <a href={store.socialLinks.tiktok} rel="noopener noreferrer" target="_blank">TikTok <span aria-hidden="true">↗</span></a> : null}{store.socialLinks?.facebook ? <a href={store.socialLinks.facebook} rel="noopener noreferrer" target="_blank">Facebook <span aria-hidden="true">↗</span></a> : null}</div> : null}
          {store.status !== "active" ? <div className="inline-alert warning store-status-alert" role="status"><Icon name="alert" /><p>{store.status === "temporarily_closed" ? "This Store has temporarily paused new enquiries. Its catalog remains visible for reference." : "This Store is currently unavailable on SOKOZA. Contact and ordering are disabled."}</p></div> : null}
          <div aria-label="Store verification" className="verification-list">{store.verification.map((level) => <span key={level}><Icon name="tick" size={16} /> {verificationLabel(level)}</span>)}</div>
          <div aria-label="Store fulfilment summary" className="store-hero-fulfilment">{store.fulfilment.collection ? <div><Icon name="location" size={19} /><span><strong>Collection</strong><small>{store.fulfilment.collection}</small></span></div> : null}{store.fulfilment.delivery ? <div><Icon name="delivery" size={19} /><span><strong>Delivery</strong><small>{store.fulfilment.delivery}</small></span></div> : null}</div>
        </div>
      </section>

      <nav aria-label={`${store.name} sections`} className="store-tabs"><a href="#shop">Shop</a>{storeDrops.length ? <a href="#drops">Drops</a> : null}<a href="#about">About</a></nav>
      <div className="page store-body">
        <section id="shop"><div className="section-heading"><div><p className="eyebrow">{storeProducts.length} current pieces</p><h2>Shop {store.name}</h2></div></div>{storeProducts.length ? <ProductGrid products={storeProducts} stores={stores} /> : <EmptyState action="Browse other stores" body="This Store has no current pieces published. Its About and policy information remains available below." href="/stores" icon="store" title="No current pieces" />}</section>
        {storeDrops.length ? <section className="section" id="drops"><div className="section-heading"><div><p className="eyebrow">Store collections</p><h2>Live Drops</h2></div></div><div className="horizontal-scroller">{storeDrops.map((drop) => <DropCard drop={drop} key={drop.id} store={store} />)}</div></section> : null}
        <section className="section store-about" id="about"><div><p className="eyebrow">About the Store</p><h2>{store.tagline}</h2><p>{store.description}</p><p className="small muted">On SOKOZA since {formatDate(store.joinedAt)}</p></div><div className="policy-list">{store.fulfilment.collection ? <div><Icon name="location" /><div><h3>Collection</h3><p>{store.fulfilment.collection}</p></div></div> : null}{store.fulfilment.delivery ? <div><Icon name="delivery" /><div><h3>Delivery</h3><p>{store.fulfilment.delivery}</p></div></div> : null}<div><Icon name="refresh" /><div><h3>Exchanges</h3><p>{store.fulfilment.exchanges}</p></div></div></div><div className="trust-note"><Icon name="info" /><p>Verification describes what SOKOZA checked; it does not guarantee products or fulfilment. Confirm the item, price and arrangements with the Store before paying.</p></div><Link className="text-link danger-link" href="/safety">Report or get safety help</Link></section>
      </div>
    </div>
  );
}
