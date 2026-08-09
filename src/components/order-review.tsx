"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useBuyerState } from "@/components/buyer-state";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { AccessibleDialog } from "@/components/accessible-dialog";
import { SmartImage } from "@/components/smart-image";
import { formatPrice } from "@/lib/format";
import type { EnquiryRecord, Product, Store } from "@/lib/types";
import { useMarketplaceSignals } from "@/components/marketplace-signals-provider";
import type { AuthoritativeOrderIntent } from "@/lib/whatsapp-order";

interface PreparedIntentResponse {
  intent: AuthoritativeOrderIntent;
  priceChanges: Array<{ productId: string; variantId: string; previousPrice: number; currentPrice: number }>;
  whatsappUrl: string | null;
  message: string;
}

export function OrderReview({ store, products }: { store: Store; products: Product[] }) {
  const router = useRouter();
  const { capture } = useMarketplaceSignals();
  const {
    cart,
    clearStoreFromCart,
    hydrated,
    storeEnquiry,
    updateEnquiryStatus,
    announce,
  } = useBuyerState();
  const [fulfilment, setFulfilment] = useState<"ask" | "collection" | "delivery">("ask");
  const [note, setNote] = useState("");
  const [activeEnquiry, setActiveEnquiry] = useState<EnquiryRecord | null>(null);
  const [returnPrompt, setReturnPrompt] = useState(false);
  const [priceChangesAccepted, setPriceChangesAccepted] = useState(false);
  const [serverPriceChanges, setServerPriceChanges] = useState<PreparedIntentResponse["priceChanges"]>([]);
  const [intentError, setIntentError] = useState("");
  const [intentLoading, setIntentLoading] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const storeProductIds = useMemo(
    () => products.filter((product) => product.storeId === store.id).map((product) => product.id),
    [products, store.id],
  );
  const lines = useMemo(
    () => cart.filter((line) => storeProductIds.includes(line.productId)),
    [cart, storeProductIds],
  );
  const lineSignalKey = lines.map((line) => `${line.productId}:${line.variantId}`).sort().join("|");
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const lineIssues = lines.flatMap((line) => {
    const product = productMap.get(line.productId);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    if (!product) return [`A product was removed from ${store.name}.`];
    if (product.availability === "sold" || !variant?.available)
      return [`${product.title} · ${variant?.label ?? "selected variant"} is unavailable.`];
    if (line.quantity > (variant.quantity ?? 9))
      return [`${product.title} · only ${variant.quantity ?? 9} currently available.`];
    return [];
  });
  const storeIssues =
    store.status === "active"
      ? []
      : [
          store.status === "temporarily_closed"
            ? `${store.name} has temporarily paused enquiries.`
            : `${store.name} is currently unavailable on SOKOZA.`,
        ];
  const issues = [...storeIssues, ...lineIssues];
  const itemValue = lines.reduce(
    (total, line) => total + (productMap.get(line.productId)?.price ?? line.priceSnapshot) * line.quantity,
    0,
  );
  const hasPriceChanges = lines.some(
    (line) => productMap.get(line.productId)?.price !== line.priceSnapshot,
  );
  const handoffBlocked = Boolean(issues.length) || ((hasPriceChanges || serverPriceChanges.length > 0) && !priceChangesAccepted);
  const validPhone = /^\+?\d{10,15}$/.test(store.whatsapp);

  function asLocalEnquiry(intent: AuthoritativeOrderIntent): EnquiryRecord {
    return {
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
    };
  }

  async function prepareIntent() {
    setIntentError("");
    setIntentLoading(true);
    try {
      const response = await fetch("/api/order-intents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          idempotencyKey,
          fulfilment,
          note: note.trim() || undefined,
          items: lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
            expectedPrice: line.priceSnapshot,
          })),
        }),
      });
      const data = await response.json() as PreparedIntentResponse & { error?: string };
      if (!response.ok || !data.intent) {
        const message = data.error === "INSUFFICIENT_STOCK" ? "The requested quantity is no longer available. Return to Cart and review the item."
          : data.error === "PRODUCT_UNAVAILABLE" || data.error === "VARIANT_UNAVAILABLE" ? "A selected product or option is no longer available."
          : data.error === "STORE_UNAVAILABLE" ? `${store.name} is not accepting enquiries right now.`
          : "Current price and availability could not be confirmed. Try again shortly.";
        setIntentError(message);
        return null;
      }
      setServerPriceChanges(data.priceChanges);
      const enquiry = asLocalEnquiry(data.intent);
      storeEnquiry(enquiry);
      setActiveEnquiry(enquiry);
      for (const line of data.intent.items) {
        capture("order_intent_created", { productId: line.productId, storeId: store.id }, { intentKey: data.intent.id, orderIntentId: data.intent.id });
      }
      if (data.priceChanges.length && !priceChangesAccepted) return null;
      return data;
    } catch {
      setIntentError("Current price and availability could not be confirmed. Check your connection and try again.");
      return null;
    } finally {
      setIntentLoading(false);
    }
  }

  async function openWhatsApp() {
    if (!validPhone || handoffBlocked) return;
    const popup = window.open("about:blank", "_blank");
    const prepared = await prepareIntent();
    if (!prepared || !prepared.whatsappUrl) {
      popup?.close();
      return;
    }
    const statusResponse = await fetch("/api/order-intents", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderIntentId: prepared.intent.id, status: "whatsapp_opened" }) });
    if (!statusResponse.ok) {
      popup?.close();
      setIntentError("The WhatsApp handoff could not be recorded. Try again without creating another enquiry.");
      return;
    }
    const enquiry = { ...asLocalEnquiry(prepared.intent), status: "whatsapp_opened" as const };
    storeEnquiry(enquiry);
    setActiveEnquiry(enquiry);
    for (const line of prepared.intent.items) {
      capture("whatsapp_opened", { productId: line.productId, storeId: store.id }, { intentKey: prepared.intent.id, orderIntentId: prepared.intent.id });
    }
    if (popup) popup.location.href = prepared.whatsappUrl;
    else window.location.assign(prepared.whatsappUrl);
  }

  async function copyMessage() {
    if (handoffBlocked) return;
    const prepared = await prepareIntent();
    if (!prepared) return;
    try {
      await navigator.clipboard.writeText(prepared.message);
      announce("Order enquiry copied");
    } catch {
      announce("Copy failed. Select the message manually and try again.");
    }
  }

  useEffect(() => {
    if (!activeEnquiry || activeEnquiry.status !== "whatsapp_opened") return;
    const handleFocus = () => setReturnPrompt(true);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") setReturnPrompt(true);
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activeEnquiry]);

  useEffect(() => {
    if (!hydrated || !lineSignalKey) return;
    for (const line of lines) {
      capture("order_review_started", { productId: line.productId, storeId: store.id }, { intentKey: lineSignalKey });
    }
  }, [capture, hydrated, lineSignalKey, lines, store.id]);

  if (!hydrated) return <div className="order-review-skeleton" aria-label="Rechecking your Cart" />;
  if (!lines.length) {
    return (
      <EmptyState
        action="Return to Cart"
        body={`There are no ${store.name} pieces ready to review. Add an available size first.`}
        href="/cart"
        icon="cart"
        title="Nothing to review"
      />
    );
  }

  return (
    <>
      <div className="order-review-layout">
        <section className="review-items">
          <div className="review-store">
            <div className="store-avatar">
              <SmartImage alt="" fill sizes="58px" src={store.avatarImage} />
            </div>
            <div>
              <p className="eyebrow">One store</p>
              <h2>{store.name}</h2>
              <p>{store.location}</p>
            </div>
          </div>
          {hasPriceChanges || serverPriceChanges.length ? (
            <div className="inline-alert warning">
              <Icon name="alert" />
              <div>
                <p>A price changed since it was added. Review and accept the current authoritative price before opening WhatsApp.</p>
                {serverPriceChanges.map((change) => <p key={`${change.productId}-${change.variantId}`}>{formatPrice(change.previousPrice)} → {formatPrice(change.currentPrice)}</p>)}
                <label className="accept-change">
                  <input
                    checked={priceChangesAccepted}
                    onChange={(event) => setPriceChangesAccepted(event.target.checked)}
                    type="checkbox"
                  />
                  I reviewed and accept the current item value.
                </label>
              </div>
            </div>
          ) : null}
          {issues.length ? (
            <div className="inline-alert error" role="alert">
              <Icon name="alert" />
              <div>
                <strong>Review needed</strong>
                {issues.map((issue) => <p key={issue}>{issue}</p>)}
                <Link href="/cart">Return to Cart</Link>
              </div>
            </div>
          ) : null}
          {intentError ? <div className="inline-alert error" role="alert"><Icon name="alert" /><p>{intentError}</p></div> : null}
          <div className="review-lines">
            {lines.map((line) => {
              const product = productMap.get(line.productId);
              const variant = product?.variants.find((item) => item.id === line.variantId);
              if (!product) return null;
              return (
                <article key={`${line.productId}-${line.variantId}`}>
                  <div className="review-line-image">
                    <SmartImage alt="" fill sizes="96px" src={product.images[0]} />
                  </div>
                  <div>
                    <h3>{product.title}</h3>
                    <p>{variant?.label} · {product.color} · Qty {line.quantity}</p>
                    <strong>{formatPrice(product.price * line.quantity)}</strong>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="review-total">
            <span>Item value</span>
            <strong>{formatPrice(itemValue)}</strong>
          </div>
        </section>

        <section className="review-compose">
          <p className="eyebrow">Prepare your enquiry</p>
          <h2>How would you prefer to receive it?</h2>
          <p className="review-payment-note"><Icon name="info" size={17} /> SOKOZA does not charge you here. You will confirm availability, payment and fulfilment directly with {store.name}.</p>
          <div className="choice-cards">
            {[
              ["ask", "Ask the store", "Let the store explain the available options."],
              ["collection", "Collection", store.fulfilment.collection],
              ["delivery", "Delivery", store.fulfilment.delivery],
            ].map(([value, title, body]) => (
              <label key={value}>
                <input
                  checked={fulfilment === value}
                  name="fulfilment"
                  onChange={() => setFulfilment(value as typeof fulfilment)}
                  type="radio"
                />
                <span>
                  <strong>{title}</strong>
                  <small>{body}</small>
                </span>
              </label>
            ))}
          </div>
          <label className="field-label" htmlFor="buyer-note">
            Note for {store.name} <span>Optional</span>
          </label>
          <textarea
            id="buyer-note"
            maxLength={240}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ask about fit, collection time, or another product detail."
            rows={4}
            value={note}
          />
          <p className="character-count">{note.length}/240</p>

          {!validPhone ? (
            <div className="inline-alert error" role="alert">
              <Icon name="alert" />
              <p>
                This store’s WhatsApp number needs correction. Copy your enquiry and contact SOKOZA
                support instead of guessing a number.
              </p>
            </div>
          ) : null}

          <button className="button whatsapp full" disabled={!validPhone || handoffBlocked || intentLoading} onClick={() => void openWhatsApp()}>
            <Icon name="whatsapp" size={20} /> {intentLoading ? "Preparing enquiry…" : "Continue to WhatsApp"}
          </button>
          <button className="button secondary full" disabled={handoffBlocked || intentLoading} onClick={() => void copyMessage()}>
            <Icon name="copy" size={19} /> Copy message
          </button>
          <p className="manual-contact">
            If WhatsApp does not open, copy the message and contact {store.name} at {store.whatsapp.startsWith("+") ? store.whatsapp : `+${store.whatsapp}`}
            {" "}in WhatsApp or WhatsApp Web.
          </p>
          <div className="trust-note">
            <Icon name="info" />
            <p>
              Opening WhatsApp does not complete an order. {store.name} still confirms availability,
              payment and fulfilment with you.
            </p>
          </div>
          <ol className="review-next-steps" aria-label="What happens next">
            <li><span>1</span> SOKOZA prepares this exact seller-specific enquiry.</li>
            <li><span>2</span> You send or edit it in WhatsApp.</li>
            <li><span>3</span> {store.name} confirms availability, payment and fulfilment.</li>
          </ol>
        </section>
      </div>

      {returnPrompt && activeEnquiry ? (
        <AccessibleDialog labelledBy="return-title" onClose={() => setReturnPrompt(false)}>
            <div className="sheet-handle" />
            <div className="sheet-heading">
              <div>
                <p className="eyebrow">Enquiry {activeEnquiry.reference}</p>
                <h2 id="return-title">Did you send the enquiry?</h2>
              </div>
              <button aria-label="Close" className="icon-button" onClick={() => setReturnPrompt(false)}>
                <Icon name="close" />
              </button>
            </div>
            <p>
              Tell SOKOZA only whether you sent the message. This does not mark the products as paid,
              purchased or completed.
            </p>
            <div className="button-row">
              <button className="button secondary" onClick={() => setReturnPrompt(false)}>
                Not yet
              </button>
              <button
                className="button primary"
                onClick={() => {
                  void (async () => {
                    const response = await fetch("/api/order-intents", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderIntentId: activeEnquiry.id, status: "buyer_marked_sent" }) });
                    if (!response.ok) { announce("The enquiry status could not be saved. Try again."); return; }
                    updateEnquiryStatus(activeEnquiry.id, "buyer_marked_sent");
                    for (const line of activeEnquiry.lines) {
                      capture("buyer_marked_enquiry_sent", { productId: line.productId, storeId: store.id }, { intentKey: activeEnquiry.id, orderIntentId: activeEnquiry.id });
                    }
                    clearStoreFromCart(storeProductIds);
                    router.push("/enquiries");
                  })();
                }}
                type="button"
              >
                Yes, I sent it
              </button>
            </div>
        </AccessibleDialog>
      ) : null}
    </>
  );
}
