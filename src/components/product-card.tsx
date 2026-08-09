"use client";

import Link from "next/link";
import { SmartImage } from "@/components/smart-image";
import { SaveButton } from "@/components/save-button";
import { availabilityLabel, formatPrice } from "@/lib/format";
import type { Product, Store } from "@/lib/types";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { publicProductHref } from "@/lib/seller-studio-types";

export function ProductCard({
  product: baseProduct,
  store: baseStore,
  priority = false,
}: {
  product: Product;
  store: Store;
  priority?: boolean;
}) {
  const { state } = useSellerStudio();
  const sellerProduct = baseProduct.storeId === state.store.id
    ? state.products.find((product) => product.id === baseProduct.id)
    : undefined;
  if (sellerProduct && sellerProduct.status !== "published") return null;
  const product = sellerProduct ?? baseProduct;
  const store: Store = baseStore.id === state.store.id
    ? {
        ...baseStore,
        name: state.store.name,
        tagline: state.store.tagline,
        description: state.store.description,
        location: `${state.store.area}, ${state.store.city}`,
        whatsapp: state.store.whatsapp.replace(/\D/g, ""),
        categories: state.store.categories,
        coverImage: state.store.coverImage,
        avatarImage: state.store.avatarImage,
        status: state.store.operatingState === "published" ? "active" : "temporarily_closed",
        fulfilment: { collection: state.store.collection, delivery: state.store.delivery, exchanges: state.store.exchanges },
      }
    : baseStore;
  const productHref = publicProductHref(product);
  return (
    <article className={`product-card ${product.availability === "sold" ? "sold" : ""}`}>
      <div className="product-card-media">
        <Link href={productHref} tabIndex={-1} aria-hidden="true">
          <SmartImage
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            src={product.images[0]}
          />
        </Link>
        <SaveButton productId={product.id} storeId={product.storeId} />
        {product.madeHere ? <span className="media-label olive">Made Here</span> : null}
        {product.availability === "sold" ? <span className="sold-overlay">Sold</span> : null}
      </div>
      <div className="product-card-body">
        <Link className="store-kicker" href={`/stores/${store.slug}`}>
          {store.name}
        </Link>
        <Link className="product-card-title" href={productHref}>
          {product.title}
        </Link>
        <div className="product-card-price">
          <strong>{formatPrice(product.price)}</strong>
          {product.previousPrice ? <s>{formatPrice(product.previousPrice)}</s> : null}
        </div>
        <p className={`availability ${store.status === "active" ? product.availability : "stale"}`}>
          {store.status === "active"
            ? availabilityLabel(product.availability)
            : store.status === "temporarily_closed"
              ? "Store temporarily closed"
              : "Store unavailable"}
        </p>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  stores,
  priorityCount = 0,
}: {
  products: Product[];
  stores: Store[];
  priorityCount?: number;
}) {
  const storeMap = new Map(stores.map((store) => [store.id, store]));
  return (
    <div className="product-grid">
      {products.map((product, index) => {
        const store = storeMap.get(product.storeId);
        if (!store) return null;
        return (
          <ProductCard
            key={product.id}
            product={product}
            store={store}
            priority={index < priorityCount}
          />
        );
      })}
    </div>
  );
}
