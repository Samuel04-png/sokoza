"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useBuyerState } from "@/components/buyer-state";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { SaveButton } from "@/components/save-button";
import { SmartImage } from "@/components/smart-image";
import { formatPrice } from "@/lib/format";
import type { CartLine, Product, Store } from "@/lib/types";

export function CartView({ products, stores }: { products: Product[]; stores: Store[] }) {
  const { addToCart, announce, cart, hydrated, removeFromCart, updateCartQuantity } = useBuyerState();
  const [removedLine, setRemovedLine] = useState<CartLine | null>(null);
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const storeMap = useMemo(() => new Map(stores.map((store) => [store.id, store])), [stores]);
  const groups = useMemo(() => {
    const map = new Map<string, typeof cart>();
    cart.forEach((line) => {
      const product = productMap.get(line.productId);
      if (!product || !storeMap.has(product.storeId)) return;
      map.set(product.storeId, [...(map.get(product.storeId) ?? []), line]);
    });
    return Array.from(map.entries());
  }, [cart, productMap, storeMap]);
  const orphanLines = cart.filter((line) => {
    const product = productMap.get(line.productId);
    return !product || !storeMap.has(product.storeId);
  });

  useEffect(() => {
    if (!removedLine) return;
    const timeout = window.setTimeout(() => setRemovedLine(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [removedLine]);

  function removeLine(line: CartLine) {
    removeFromCart(line.productId, line.variantId);
    setRemovedLine(line);
  }

  const undoNotice = removedLine ? (
    <div className="undo-banner" role="status">
      <span>{removedLine.productTitle || "Product"} removed from your Cart.</span>
      <button
        onClick={() => {
          addToCart(removedLine);
          announce("Restored to Cart");
          setRemovedLine(null);
        }}
        type="button"
      >
        Undo
      </button>
    </div>
  ) : null;

  if (!hydrated) return <div className="cart-skeleton" aria-label="Loading your Cart" />;
  if (cart.length === 0) {
    return (
      <>
        <EmptyState
          action="Discover current pieces"
          body="Add an available size from a product page. Your Cart stays on this device and groups pieces by store."
          href="/discover"
          icon="cart"
          title="Your cart is empty"
        />
        {undoNotice}
      </>
    );
  }

  return (
    <>
      <div className="cart-groups">
      {orphanLines.length ? (
        <section className="cart-group cart-orphans">
          <header className="cart-store-heading">
            <div>
              <p className="eyebrow">Catalog update</p>
              <h2>Unavailable pieces</h2>
            </div>
            <span>{orphanLines.length} {orphanLines.length === 1 ? "item" : "items"}</span>
          </header>
          {orphanLines.map((line) => (
            <div className="cart-missing-line" key={`${line.productId}-${line.variantId}`}>
              <Icon name="alert" />
              <div>
                <strong>{line.productTitle || "Product no longer listed"}</strong>
                <p>{line.variantLabel || "Selected option"} · Last known price {formatPrice(line.priceSnapshot)}</p>
              </div>
              <button onClick={() => removeLine(line)} type="button">Remove</button>
            </div>
          ))}
          <p className="line-error">Remove these pieces before preparing a store enquiry.</p>
        </section>
      ) : null}
      {groups.map(([storeId, lines]) => {
        const store = storeMap.get(storeId);
        if (!store) return null;
        const groupProducts = lines.map((line) => productMap.get(line.productId)).filter(Boolean) as Product[];
        const itemValue = lines.reduce((total, line) => {
          const product = productMap.get(line.productId);
          return total + (product?.price ?? line.priceSnapshot) * line.quantity;
        }, 0);
        const groupCount = lines.reduce((total, line) => total + line.quantity, 0);
        const blocking = lines.some((line) => {
          const product = productMap.get(line.productId);
          const variant = product?.variants.find((item) => item.id === line.variantId);
          return (
            store.status !== "active" ||
            !product ||
            product.availability === "sold" ||
            !variant?.available ||
            line.quantity > (variant.quantity ?? 9)
          );
        });
        return (
          <section className="cart-group" key={storeId}>
            <header className="cart-store-heading">
              <div>
                <p className="eyebrow">Store order</p>
                <Link href={`/stores/${store.slug}`}>
                  <h2>{store.name}</h2>
                </Link>
              </div>
              <span>{groupCount} {groupCount === 1 ? "item" : "items"}</span>
            </header>
            <div className="cart-lines">
              {lines.map((line) => {
                const product = productMap.get(line.productId);
                if (!product) {
                  return (
                    <div className="cart-missing-line" key={`${line.productId}-${line.variantId}`}>
                      <Icon name="alert" />
                      <p>This product is no longer available in the catalog.</p>
                      <button onClick={() => removeLine(line)}>Remove</button>
                    </div>
                  );
                }
                const variant = product.variants.find((item) => item.id === line.variantId);
                const unavailable = product.availability === "sold" || !variant?.available;
                const changed = product.price !== line.priceSnapshot;
                const maxQuantity = variant?.quantity ?? 9;
                const exceedsStock = line.quantity > maxQuantity;
                return (
                  <article className="cart-line" key={`${line.productId}-${line.variantId}`}>
                    <Link className="cart-line-image" href={`/products/${product.slug}`}>
                      <SmartImage alt={product.title} fill sizes="120px" src={product.images[0]} />
                    </Link>
                    <div className="cart-line-content">
                      <Link href={`/products/${product.slug}`}>
                        <h3>{product.title}</h3>
                      </Link>
                      <p>{variant?.label ?? "Variant no longer found"} · {product.color}</p>
                      <strong>{formatPrice(product.price)}</strong>
                      {changed ? (
                        <p className="line-warning">
                          Price changed from {formatPrice(line.priceSnapshot)}. Review before sending.
                        </p>
                      ) : null}
                      {unavailable ? (
                        <p className="line-error">This selected size is no longer available.</p>
                      ) : null}
                      {exceedsStock ? (
                        <p className="line-error">
                          Only {maxQuantity} {maxQuantity === 1 ? "piece is" : "pieces are"} currently available. Reduce the quantity before review.
                        </p>
                      ) : null}
                      <div className="cart-line-actions">
                        <div aria-label={`Quantity for ${product.title}`} className="quantity-control">
                          <button
                            aria-label="Decrease quantity"
                            disabled={line.quantity <= 1}
                            onClick={() =>
                              updateCartQuantity(line.productId, line.variantId, line.quantity - 1)
                            }
                          >
                            <Icon name="minus" size={16} />
                          </button>
                          <span>{line.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            disabled={line.quantity >= maxQuantity}
                            onClick={() =>
                              updateCartQuantity(line.productId, line.variantId, line.quantity + 1)
                            }
                          >
                            <Icon name="plus" size={16} />
                          </button>
                        </div>
                        <SaveButton productId={product.id} quiet storeId={product.storeId} />
                        <button
                          aria-label={`Remove ${product.title} from Cart`}
                          className="icon-button"
                          onClick={() => removeLine(line)}
                        >
                          <Icon name="delete" size={19} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <footer className="cart-group-footer">
              <div>
                <span>Item value</span>
                <strong>{formatPrice(itemValue)}</strong>
                <small>Delivery and payment are arranged with {store.name}.</small>
              </div>
              {blocking ? (
                <div className="cart-blocked">
                  <p>
                    {store.status !== "active"
                      ? `${store.name} is not accepting enquiries right now.`
                      : "Remove or change unavailable pieces before review."}
                  </p>
                  <button className="button primary" disabled>
                    Review order with {store.name}
                  </button>
                </div>
              ) : (
                <Link className="button primary" href={`/order-review/${store.id}`}>
                  Review order with {store.name}
                </Link>
              )}
            </footer>
            <p className="sr-only">Products in this group: {groupProducts.map((item) => item.title).join(", ")}</p>
          </section>
        );
      })}
      <aside className="cart-explainer">
        <Icon name="info" />
        <div>
          <h2>Why orders stay separate</h2>
          <p>
            Each store confirms its own availability, payment and fulfilment. Review and contact one
            store at a time—there is no combined checkout.
          </p>
        </div>
      </aside>
      </div>
      {undoNotice}
    </>
  );
}
