"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useBuyerState } from "@/components/buyer-state";
import { AccessibleDialog } from "@/components/accessible-dialog";
import { Icon } from "@/components/icon";
import { SaveButton } from "@/components/save-button";
import { ShareButton } from "@/components/share-button";
import { SmartImage } from "@/components/smart-image";
import { availabilityLabel, formatPrice, verificationLabel } from "@/lib/format";
import type { Product, Store } from "@/lib/types";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { useMarketplaceSignals } from "@/components/marketplace-signals-provider";

export function ProductDetail({ product: baseProduct, socialProof = null, store: baseStore, viewerStoreId = null }: { product: Product; socialProof?: string | null; store: Store; viewerStoreId?: string | null }) {
  const router = useRouter();
  const { state } = useSellerStudio();
  const sellerProduct = baseProduct.storeId === state.store.id ? state.products.find((item) => item.id === baseProduct.id) : undefined;
  const product = sellerProduct ?? baseProduct;
  const sellerHidden = Boolean(sellerProduct && sellerProduct.status !== "published");
  const store: Store = baseStore.id === state.store.id ? {
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
  } : baseStore;
  const { addToCart, recordRecent } = useBuyerState();
  const { hydrated: signalsHydrated, trackProductView } = useMarketplaceSignals();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants.filter((variant) => variant.available).length === 1
      ? (product.variants.find((variant) => variant.available)?.id ?? null)
      : null,
  );
  const [variantError, setVariantError] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [product.variants, selectedVariantId],
  );
  const orderable = !sellerHidden && product.availability !== "sold" && store.status === "active";
  const imageRoles = ["Main view", "Secondary view", "Flat isolated view", "Detail view"];
  useEffect(() => recordRecent(product.id), [product.id, recordRecent]);
  useEffect(() => {
    if (!signalsHydrated || sellerHidden) return;
    return trackProductView({ productId: product.id, storeId: product.storeId }, viewerStoreId);
  }, [product.id, product.storeId, sellerHidden, signalsHydrated, trackProductView, viewerStoreId]);

  if (sellerHidden) {
    return <div className="page compact"><div className="empty-state"><Icon name="package" size={32} /><h1>Product unavailable</h1><p>This piece is not currently published in {store.name}.</p><Link className="button secondary" href={`/stores/${store.slug}`}>Return to Store</Link></div></div>;
  }

  function validateAndAdd() {
    if (!selectedVariant || !selectedVariant.available) {
      setVariantError(true);
      document.getElementById("variant-options")?.focus();
      return false;
    }
    setVariantError(false);
    addToCart({
      productId: product.id,
      productTitle: product.title,
      storeId: store.id,
      variantId: selectedVariant.id,
      variantLabel: selectedVariant.label,
      quantity: 1,
      maxQuantity: selectedVariant.quantity ?? 9,
      priceSnapshot: product.price,
    });
    return true;
  }

  return (
    <>
      <div className="product-layout">
        <section aria-label="Product images" className="product-gallery">
          <div className="product-gallery-mobile">
            <button
            aria-label={`Open ${product.title} image ${activeImage + 1} larger`}
            className="product-main-image"
            onClick={() => setZoomOpen(true)}
            type="button"
          >
            <SmartImage
              alt={`${product.title}, view ${activeImage + 1} of ${product.images.length}`}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
              src={product.images[activeImage]}
            />
            <span className="gallery-count">
              {activeImage + 1} / {product.images.length}
            </span>
            </button>
            <div className="gallery-thumbnails" aria-label="Choose product image">
              {product.images.map((source, index) => (
                <button
                aria-label={`Show image ${index + 1}`}
                aria-pressed={activeImage === index}
                key={source}
                onClick={() => setActiveImage(index)}
                type="button"
              >
                <SmartImage alt="" fill sizes="90px" src={source} />
                </button>
              ))}
            </div>
          </div>
          <div className="product-editorial-gallery">
            {product.images.slice(0, 4).map((source, index) => (
              <button
                aria-label={`Open ${imageRoles[index] ?? `image ${index + 1}`} of ${product.title}`}
                className={index === 0 ? "is-primary" : undefined}
                key={source}
                onClick={() => { setActiveImage(index); setZoomOpen(true); }}
                type="button"
              >
                <SmartImage alt={`${product.title} · ${imageRoles[index] ?? `view ${index + 1}`}`} fill priority={index === 0} sizes={index === 0 ? "(max-width: 900px) 100vw, 42vw" : "(max-width: 900px) 100vw, 20vw"} src={source} />
                <span>{imageRoles[index] ?? `View ${index + 1}`}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="product-decision">
          <div className="product-store-line">
            <Link href={`/stores/${store.slug}`}>{store.name}</Link>
            <span>{store.location}</span>
          </div>
          <div className="product-title-row">
            <div>
              <h1>{product.title}</h1>
              <div className="pdp-price">
                <strong>{formatPrice(product.price)}</strong>
                {product.previousPrice ? <s>{formatPrice(product.previousPrice)}</s> : null}
              </div>
            </div>
            <div className="pdp-icon-actions">
              <SaveButton productId={product.id} quiet storeId={product.storeId} />
              <ShareButton
                className="icon-button"
                label={product.title}
                text={`${product.title} from ${store.name}`}
              />
            </div>
          </div>
          <p className="product-description">{product.description}</p>

          <div className="product-facts">
            <div>
              <span>Condition</span>
              <strong>{product.condition}</strong>
            </div>
            <div>
              <span>Availability</span>
              <strong className={product.availability}>{availabilityLabel(product.availability)}</strong>
            </div>
          </div>

          {socialProof ? (
            <p className="pdp-social-proof"><Icon name="view" size={17} /> {socialProof}</p>
          ) : null}

          {product.availability === "stale" ? (
            <div className="inline-alert warning">
              <Icon name="alert" />
              <p>
                This item was not recently reconfirmed. You can prepare an enquiry, but ask the
                store to confirm availability before paying.
              </p>
            </div>
          ) : null}

          {store.status !== "active" ? (
            <div className="inline-alert error" role="alert">
              <Icon name="alert" />
              <p>
                {store.status === "temporarily_closed"
                  ? `${store.name} has temporarily paused enquiries. You can still view this piece, but ordering is unavailable.`
                  : `${store.name} is currently unavailable on SOKOZA. Ordering and contact are disabled.`}
              </p>
            </div>
          ) : null}

          <fieldset className="variant-fieldset">
            <div className="fieldset-heading">
              <legend id="variant-label">Choose size</legend>
              <button className="text-button" onClick={() => setSizeGuideOpen(true)} type="button">
                Size help
              </button>
            </div>
            <div
              aria-describedby={variantError ? "variant-error" : undefined}
              aria-labelledby="variant-label"
              className="variant-options"
              id="variant-options"
              tabIndex={-1}
            >
              {product.variants.map((variant) => (
                <button
                  aria-pressed={selectedVariantId === variant.id}
                  className={selectedVariantId === variant.id ? "selected" : ""}
                  disabled={!orderable || !variant.available}
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setVariantError(false);
                  }}
                  type="button"
                >
                  {variant.label}
                  {!variant.available ? <span className="sr-only"> unavailable</span> : null}
                </button>
              ))}
            </div>
            {variantError ? (
              <p className="field-error" id="variant-error" role="alert">
                Choose an available size before adding this piece.
              </p>
            ) : null}
            {selectedVariant ? (
              <p className="selected-variant-status" role="status">
                <Icon name="tick" size={16} /> {selectedVariant.label} is available · {typeof selectedVariant.quantity === "number" ? `${selectedVariant.quantity} ${selectedVariant.quantity === 1 ? "piece" : "pieces"} currently listed` : "Ask the Store to confirm quantity"}
              </p>
            ) : null}
            <p className="color-detail">
              <span style={{ background: product.variants[0]?.colorHex }} />
              {product.color}
            </p>
          </fieldset>

          <div className="pdp-actions">
            <button className="button primary full" disabled={!orderable} onClick={validateAndAdd}>
              <Icon name="cart" size={19} />
              {product.availability === "sold"
                ? "Sold"
                : store.status !== "active"
                  ? "Enquiries paused"
                  : selectedVariant
                    ? `Add ${selectedVariant.label} to Cart`
                    : "Choose a size"}
            </button>
            {orderable ? (
              <button
                className="button secondary full"
                onClick={() => {
                  if (validateAndAdd()) router.push(`/order-review/${store.id}`);
                }}
              >
                {selectedVariant ? `Review size ${selectedVariant.label}` : "Review order"}
              </button>
            ) : null}
          </div>

          <div className="pdp-how-it-works" aria-labelledby="pdp-how-title">
            <h2 id="pdp-how-title">How this works</h2>
            <ol>
              <li><span>1</span><p><strong>Choose your size</strong> from the options the Store currently lists.</p></li>
              <li><span>2</span><p><strong>Review one Store order</strong> with its current item value and fulfilment preference.</p></li>
              <li><span>3</span><p><strong>Continue to WhatsApp.</strong> {store.name} confirms availability, payment and fulfilment there.</p></li>
            </ol>
          </div>

          <div className="fulfilment-preview">
            {store.fulfilment.collection ? <div>
              <Icon name="location" />
              <div>
                <h3>Collection</h3>
                <p>{store.fulfilment.collection}</p>
              </div>
            </div> : null}
            {store.fulfilment.delivery ? <div>
              <Icon name="delivery" />
              <div>
                <h3>Delivery arranged with store</h3>
                <p>{store.fulfilment.delivery}</p>
              </div>
            </div> : null}
          </div>

          <details className="detail-disclosure" open>
            <summary>Product details</summary>
            <ul>
              {product.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </details>
          <details className="detail-disclosure">
            <summary>Exchanges</summary>
            <p>{store.fulfilment.exchanges}</p>
          </details>

          <Link className="seller-panel" href={`/stores/${store.slug}`}>
            <div className="store-avatar">
              <SmartImage alt="" fill sizes="58px" src={store.avatarImage} />
            </div>
            <div>
              <span>From</span>
              <h3>{store.name}</h3>
              <p>{store.tagline}</p>
              <small>
                <Icon name="tick" size={14} /> {verificationLabel(store.verification.at(-1) ?? "whatsapp")}
              </small>
            </div>
            <Icon name="next" />
          </Link>

          <div className="trust-note">
            <Icon name="info" />
            <p>
              {store.status === "active"
                ? "SOKOZA prepares your enquiry. The store confirms availability, payment and fulfilment with you on WhatsApp."
                : "This catalog remains visible for reference. SOKOZA will not prepare an enquiry while the store is unavailable."}
            </p>
          </div>
        </section>
      </div>

      {sizeGuideOpen ? (
        <AccessibleDialog labelledBy="size-guide-title" onClose={() => setSizeGuideOpen(false)}>
            <div className="sheet-handle" />
            <div className="sheet-heading">
              <div>
                <p className="eyebrow">Before you enquire</p>
                <h2 id="size-guide-title">Size help</h2>
              </div>
              <button
                aria-label="Close size help"
                className="icon-button"
                onClick={() => setSizeGuideOpen(false)}
                type="button"
              >
                <Icon name="close" />
              </button>
            </div>
            <p>
              Seller sizing can vary. Compare the listed product measurements where available and
              ask {store.name} to confirm fit in WhatsApp before payment.
            </p>
            <ul className="plain-list">
              {product.details.filter((detail) => /cm|fit|length|waist|chest/i.test(detail)).map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
            <button className="button primary full" onClick={() => setSizeGuideOpen(false)}>
              Back to sizes
            </button>
        </AccessibleDialog>
      ) : null}

      {zoomOpen ? (
        <AccessibleDialog
          ariaLabel="Product image preview"
          backdropClassName="image-zoom"
          className="image-zoom-surface"
          onClose={() => setZoomOpen(false)}
        >
          <button className="zoom-close" aria-label="Close image preview" onClick={() => setZoomOpen(false)} type="button">
            <Icon name="close" />
          </button>
          {product.images.length > 1 ? (
            <>
              <button
                aria-label="Previous product image"
                className="zoom-nav zoom-previous"
                onClick={() =>
                  setActiveImage((current) =>
                    current === 0 ? product.images.length - 1 : current - 1,
                  )
                }
                type="button"
              >
                <Icon name="back" />
              </button>
              <button
                aria-label="Next product image"
                className="zoom-nav zoom-next"
                onClick={() =>
                  setActiveImage((current) => (current + 1) % product.images.length)
                }
                type="button"
              >
                <Icon name="next" />
              </button>
            </>
          ) : null}
          <div>
            <SmartImage
              alt={`${product.title}, enlarged view ${activeImage + 1}`}
              fill
              sizes="100vw"
              src={product.images[activeImage]}
            />
          </div>
        </AccessibleDialog>
      ) : null}
    </>
  );
}
