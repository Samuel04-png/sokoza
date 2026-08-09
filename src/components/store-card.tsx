"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { verificationLabel } from "@/lib/format";
import type { Product, Store } from "@/lib/types";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { publicProductHref } from "@/lib/seller-studio-types";

export function StoreCard({ store: baseStore, products }: { store: Store; products: Product[] }) {
  const { state } = useSellerStudio();
  const store: Store = baseStore.id === state.store.id ? { ...baseStore, name: state.store.name, tagline: state.store.tagline, description: state.store.description, location: `${state.store.area}, ${state.store.city}`, coverImage: state.store.coverImage, avatarImage: state.store.avatarImage, categories: state.store.categories, status: state.store.operatingState === "published" ? "active" : "temporarily_closed", fulfilment: { collection: state.store.collection, delivery: state.store.delivery, exchanges: state.store.exchanges } } : baseStore;
  const topProducts = store.id === state.store.id ? state.products.filter((product) => product.status === "published").slice(0, 3) : products.filter((product) => product.storeId === store.id).slice(0, 3);
  const verification = store.verification.at(-1);

  return (
    <article className="store-card">
      <Link className="store-card-cover" href={`/stores/${store.slug}`}>
        <SmartImage
          alt={`${store.name} store collection`}
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
          src={store.coverImage}
        />
      </Link>
      <div className="store-card-content">
        <div className="store-card-identity">
          <div className="store-avatar">
            <SmartImage alt="" fill sizes="64px" src={store.avatarImage} />
          </div>
          <div>
            <Link href={`/stores/${store.slug}`}>
              <h3>{store.name}</h3>
            </Link>
            <p>{store.tagline}</p>
          </div>
        </div>
        <div className="store-meta">
          <span>
            <Icon name="location" size={16} /> {store.location}
          </span>
          {verification ? (
            <span title={verificationLabel(verification)}>
              <Icon name="tick" size={16} /> {verificationLabel(verification)}
            </span>
          ) : null}
          {store.status !== "active" ? (
            <span className="store-status">
              <Icon name="alert" size={16} />
              {store.status === "temporarily_closed" ? "Temporarily closed" : "Unavailable"}
            </span>
          ) : null}
        </div>
        <div className="store-product-preview" aria-label={`${store.name} product preview`}>
          {topProducts.map((product) => (
            <Link href={publicProductHref(product)} key={product.id}>
              <SmartImage alt={product.title} fill sizes="120px" src={product.images[0]} />
            </Link>
          ))}
        </div>
        <Link className="text-link" href={`/stores/${store.slug}`}>
          Visit store <Icon name="next" size={18} />
        </Link>
      </div>
    </article>
  );
}
