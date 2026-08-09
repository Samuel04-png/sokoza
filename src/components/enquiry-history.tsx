"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBuyerState } from "@/components/buyer-state";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { formatDate, formatPrice } from "@/lib/format";
import type { Product, Store } from "@/lib/types";
import type { AuthoritativeOrderIntent } from "@/lib/whatsapp-order";

const statusLabels = {
  ready: "Ready to send",
  whatsapp_opened: "WhatsApp opened",
  buyer_marked_sent: "You marked this sent",
};

export function EnquiryHistory({ products, stores }: { products: Product[]; stores: Store[] }) {
  const { enquiries, hydrated, storeEnquiry } = useBuyerState();
  const [serverLoaded, setServerLoaded] = useState(false);
  const productMap = new Map(products.map((product) => [product.id, product]));
  const storeMap = new Map(stores.map((store) => [store.id, store]));

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    void fetch("/api/order-intents", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ intents: AuthoritativeOrderIntent[] }> : { intents: [] })
      .then(({ intents }) => {
        if (!active) return;
        intents.forEach((intent) => storeEnquiry({
          id: intent.id,
          reference: intent.reference,
          storeId: intent.storeId,
          storeName: intent.storeName,
          createdAt: intent.createdAt,
          status: intent.status === "buyer_marked_sent" ? "buyer_marked_sent" : intent.status === "whatsapp_opened" ? "whatsapp_opened" : "ready",
          lines: intent.items.map((item) => ({
            productId: item.productId,
            productTitle: item.title,
            storeId: intent.storeId,
            variantId: item.variantId,
            variantLabel: item.variantLabel,
            quantity: item.quantity,
            maxQuantity: item.quantity,
            priceSnapshot: item.unitPrice,
          })),
        }));
      })
      .finally(() => { if (active) setServerLoaded(true); });
    return () => { active = false; };
  }, [hydrated, storeEnquiry]);

  if (!hydrated || !serverLoaded) return <div className="enquiries-skeleton" aria-label="Loading enquiries" />;
  if (!enquiries.length) {
    return (
      <EmptyState
        action="Explore current pieces"
        body="After you prepare a seller-specific order enquiry, its reference and status will stay connected to this protected guest session."
        href="/discover"
        icon="whatsapp"
        title="No enquiries yet"
      />
    );
  }

  return (
    <div className="enquiry-list">
      {enquiries.map((enquiry) => {
        const store = storeMap.get(enquiry.storeId);
        const storeName = store?.name ?? enquiry.storeName ?? "Store";
        const itemValue = enquiry.lines.reduce(
          (total, line) => total + line.priceSnapshot * line.quantity,
          0,
        );
        const itemCount = enquiry.lines.reduce((total, line) => total + line.quantity, 0);
        return (
          <article className="enquiry-card" key={enquiry.id}>
            <header>
              <div>
                <p className="eyebrow">{enquiry.reference}</p>
                <h2>{storeName}</h2>
              </div>
              <span className={`status-badge ${enquiry.status}`}>{statusLabels[enquiry.status]}</span>
            </header>
            <div className="enquiry-products">
              {enquiry.lines.slice(0, 3).map((line) => {
                const product = productMap.get(line.productId);
                if (!product) return null;
                return (
                  <div key={`${line.productId}-${line.variantId}`}>
                    <SmartImage alt="" fill sizes="64px" src={product.images[0]} />
                  </div>
                );
              })}
              <p>
                {itemCount} {itemCount === 1 ? "item" : "items"} · {formatPrice(itemValue)} item value
              </p>
            </div>
            <footer>
              <span>
                <Icon name="calendar" size={16} /> {formatDate(enquiry.createdAt)}
              </span>
              <div className="button-row">
                {store ? <Link className="button secondary" href={`/stores/${store.slug}`}>View store</Link> : null}
                {store && enquiry.status !== "buyer_marked_sent" ? (
                  <Link className="button primary" href={`/order-review/${store.id}`}>
                    Resume enquiry
                  </Link>
                ) : null}
              </div>
            </footer>
            <p className="enquiry-disclaimer">
              This is an enquiry record, not proof of payment, fulfilment or purchase completion.
            </p>
          </article>
        );
      })}
    </div>
  );
}
