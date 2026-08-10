"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import type { SellerReferenceData } from "@/data/seller-studio-repository";
import { formatPrice } from "@/lib/format";
import { hasSellableVariant, normalizeProductVariants } from "@/lib/seller-product-readiness";
import { classifyProductVibes } from "@/lib/product-vibes";
import { classifyProductTaxonomy } from "@/lib/product-taxonomy";
import { hasExplicitMadeHereEvidence } from "@/lib/discovery-sections";
import { publicProductHref, type SellerProductInput, type SellerStudioProduct } from "@/lib/seller-studio-types";
import { uploadSellerImage } from "@/lib/supabase/media";
import type { Condition, ProductVariant } from "@/lib/types";

const editorSteps = ["Photos", "Details", "Price", "Options", "Stock", "Fulfilment", "Review"];

function blankProduct(): SellerProductInput {
  return {
  title: "",
  price: 0,
  category: "",
  audience: "Women",
  condition: "New",
  color: "",
  description: "",
  details: [],
  images: [],
  variants: [{ id: crypto.randomUUID(), label: "One size", color: "", colorHex: "#d4c8c0", available: true, quantity: 1 }],
  availability: "available",
  madeHere: false,
  vibes: [],
  occasions: [],
  fulfilmentNote: "Collection or Lusaka delivery can be arranged after confirmation.",
  status: "draft",
  };
}

function editorInput(product?: SellerStudioProduct): SellerProductInput {
  if (!product) return blankProduct();
  return {
    id: product.id,
    version: product.version,
    title: product.title,
    price: product.price,
    previousPrice: product.previousPrice,
    category: product.category,
    audience: product.audience,
    condition: product.condition,
    color: product.color,
    description: product.description,
    details: product.details,
    images: product.images,
    variants: product.variants,
    availability: product.availability,
    madeHere: product.madeHere,
    vibes: product.vibes,
    occasions: product.occasions,
    fulfilmentNote: product.fulfilmentNote,
    status: product.status,
  };
}

function optionId() {
  return crypto.randomUUID();
}

export function SellerProductEditor({ productId, referenceData }: { productId?: string; referenceData: SellerReferenceData }) {
  const router = useRouter();
  const { state, saveProduct, pendingWrites, persistenceError, flushWrites } = useSellerStudio();
  const existing = productId ? state.products.find((product) => product.id === productId) : undefined;
  const [draft, setDraft] = useState(() => editorInput(existing));
  const [categoryId, setCategoryId] = useState(() => referenceData.categories.find((category) => category.name === (existing?.category ?? ""))?.id ?? "");
  const [step, setStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [publishError, setPublishError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savedProduct, setSavedProduct] = useState<SellerStudioProduct | null>(existing ?? null);
  const lastSaved = useRef(JSON.stringify(draft));
  const visibleSaveStatus = persistenceError ? "Not saved" : pendingWrites || saveStatus === "Saving…" ? "Saving…" : "Saved";

  function normalizedInput(input: SellerProductInput) {
    const taxonomy = classifyProductTaxonomy(input);
    const classifiedInput = { ...input, category: taxonomy.category, occasions: taxonomy.occasions, madeHere: input.madeHere || hasExplicitMadeHereEvidence(input) };
    return {
      ...classifiedInput,
      categoryId: taxonomy.category === input.category ? input.categoryId : undefined,
      vibes: classifyProductVibes(classifiedInput),
      variants: normalizeProductVariants(input.variants, input.availability, input.condition),
    };
  }

  useEffect(() => {
    const serialized = JSON.stringify(draft);
    if (serialized === lastSaved.current) return;
    setSaveStatus("Saving…");
    const timer = window.setTimeout(() => {
      const saved = saveProduct(normalizedInput(draft));
      lastSaved.current = JSON.stringify({ ...draft, id: saved.id });
      setSavedProduct(saved);
      setDraft((current) => current.id ? current : { ...current, id: saved.id });
      setSaveStatus("Saved");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [draft, saveProduct]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (visibleSaveStatus !== "Saved") event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [visibleSaveStatus]);

  const requirements = useMemo(() => [
    { label: "At least one product photo", ready: draft.images.length > 0, step: 0 },
    { label: "Title, category and description", ready: Boolean(draft.title.trim().length >= 2 && draft.category && draft.description.trim().length >= 20), step: 1 },
    { label: "A valid current price", ready: draft.price > 0 && (!draft.previousPrice || draft.previousPrice > draft.price), step: 2 },
    { label: "At least one sellable option", ready: hasSellableVariant(draft.variants, draft.availability, draft.condition), step: 4 },
    { label: "Current availability", ready: draft.availability !== "sold" && draft.availability !== "stale", step: 4 },
    { label: "Fulfilment note", ready: Boolean(draft.fulfilmentNote.trim()), step: 5 },
  ], [draft]);
  const automaticTaxonomy = useMemo(() => classifyProductTaxonomy(draft), [draft]);
  const automaticMadeHere = useMemo(() => draft.madeHere || hasExplicitMadeHereEvidence(draft), [draft]);

  function patch<K extends keyof SellerProductInput>(key: K, value: SellerProductInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setPublishError("");
  }

  function updateVariant(id: string, patchValue: Partial<ProductVariant>) {
    patch("variants", draft.variants.map((variant) => variant.id === id ? { ...variant, ...patchValue } : variant));
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = Math.max(0, 6 - draft.images.length);
    const selected = Array.from(files).slice(0, room);
    const productId = draft.id && /^[0-9a-f-]{36}$/i.test(draft.id) ? draft.id : crypto.randomUUID();
    if (!draft.id) setDraft((current) => ({ ...current, id: productId }));
    setUploading(true);
    setPublishError("");
    try {
      const uploaded = await Promise.all(selected.map((file) => uploadSellerImage(file, "product-media", productId)));
      setDraft((current) => ({ ...current, id: productId, images: [...current.images, ...uploaded].slice(0, 6) }));
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "The images could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  function saveAs(status: SellerProductInput["status"]) {
    const result = saveProduct(normalizedInput({ ...draft, status }));
    setDraft((current) => ({ ...current, id: result.id, status }));
    setSavedProduct(result);
    lastSaved.current = JSON.stringify({ ...draft, id: result.id, status });
    setSaveStatus("Saved");
    return result;
  }

  async function publish() {
    const missing = requirements.find((item) => !item.ready);
    if (missing) {
      setPublishError(`Complete “${missing.label}” before publishing.`);
      setStep(missing.step);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const result = saveAs("published");
    if (!await flushWrites()) {
      setPublishError(persistenceError || "This product was not published. Review the save error and try again.");
      return;
    }
    router.push(`/seller/products/${result.id}?published=1`);
  }

  async function saveDraftAndLeave() {
    const result = saveAs("draft");
    if (await flushWrites()) router.push(`/seller/products/${result.id}`);
    else setPublishError("This draft was not saved. Review the save error and try again.");
  }

  return (
    <div className="seller-page seller-editor-page">
      <header className="seller-editor-header">
        <div><Link className="seller-back-link" href="/seller/products"><Icon name="back" size={17} /> Products</Link><p className="eyebrow">{existing ? "Edit product" : "New product"}</p><h1>{draft.title || "Untitled piece"}</h1></div>
        <span aria-live="polite" className={`seller-save-state ${visibleSaveStatus === "Saved" ? "is-saved" : ""}`}><Icon name={visibleSaveStatus === "Saved" ? "tick" : visibleSaveStatus === "Not saved" ? "alert" : "clock"} size={16} /> {visibleSaveStatus}</span>
      </header>

      <nav aria-label="Product editor sections" className="seller-editor-steps">{editorSteps.map((label, index) => <button aria-current={step === index ? "step" : undefined} className={requirements.filter((requirement) => requirement.step === index).every((requirement) => requirement.ready) && index < 6 ? "complete" : ""} key={label} onClick={() => setStep(index)} type="button"><span>{index + 1}</span>{label}</button>)}</nav>

      {publishError ? <div className="seller-inline-error" role="alert"><Icon name="alert" size={18} /> {publishError}</div> : null}

      <div className="seller-editor-layout">
        <section className="seller-editor-panel">
          {step === 0 ? (
            <div className="seller-editor-section"><div><p className="eyebrow">01 · Photos</p><h2>Show the actual piece clearly.</h2><p>The first image leads the buyer card. Add up to six views with consistent lighting.</p></div>
              <div className="seller-image-editor">
                {draft.images.map((image, index) => <div key={`${image.slice(0, 30)}-${index}`}><span><SmartImage alt={`Product image ${index + 1}`} fill sizes="180px" src={image} /></span><small>{index === 0 ? "Cover" : `Image ${index + 1}`}</small><div>{index > 0 ? <button aria-label={`Make image ${index + 1} the cover`} onClick={() => patch("images", [image, ...draft.images.filter((_, imageIndex) => imageIndex !== index)])} type="button">Make cover</button> : null}<button aria-label={`Remove image ${index + 1}`} onClick={() => patch("images", draft.images.filter((_, imageIndex) => imageIndex !== index))} type="button">Remove</button></div></div>)}
                {draft.images.length < 6 ? <label className="seller-image-upload"><Icon name="plus" /><strong>{uploading ? "Uploading…" : "Add photos"}</strong><small>JPG, PNG, WebP or AVIF · max 8 MB</small><input accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} multiple onChange={(event) => void addFiles(event.target.files)} type="file" /></label> : null}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="seller-editor-section"><div><p className="eyebrow">02 · Details</p><h2>Make the piece easy to understand.</h2><p>Write for someone who cannot touch or try it on yet.</p></div>
              <label>Product title<input autoFocus maxLength={90} onChange={(event) => patch("title", event.target.value)} value={draft.title} /><small>{draft.title.length}/90 characters</small></label>
              <div className="seller-field-grid"><label>Category<select onChange={(event) => { const selected = referenceData.categories.find((category) => category.id === event.target.value); setCategoryId(event.target.value); setDraft((current) => ({ ...current, categoryId: event.target.value, category: selected?.name ?? "" })); }} required value={categoryId}><option value="">Choose a category</option>{referenceData.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Audience<select onChange={(event) => patch("audience", event.target.value)} value={draft.audience}>{["Women", "Men", "Unisex", "Kids"].map((value) => <option key={value}>{value}</option>)}</select></label></div>
              <div className="seller-field-grid"><label>Condition<select onChange={(event) => patch("condition", event.target.value as Condition)} value={draft.condition}>{["New", "Like new", "Good", "Made to order"].map((value) => <option key={value}>{value}</option>)}</select></label><label>Primary colour<input onChange={(event) => patch("color", event.target.value)} value={draft.color} /></label></div>
              <label>Description<textarea maxLength={700} onChange={(event) => patch("description", event.target.value)} rows={6} value={draft.description} /><small>{draft.description.length}/700 characters</small></label>
              <label>Product details <small>One detail per line</small><textarea onChange={(event) => patch("details", event.target.value.split("\n"))} placeholder="Fabric composition&#10;Fit or measurements&#10;Care notes" rows={5} value={draft.details.join("\n")} /></label>
              <div className="seller-auto-taxonomy"><Icon name="discover" size={19} /><span><strong>Automatic discovery</strong><small>{automaticTaxonomy.category} · {automaticTaxonomy.occasions.join(" · ")}{automaticMadeHere ? " · Made Here" : ""}</small></span></div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="seller-editor-section"><div><p className="eyebrow">03 · Price</p><h2>State the current price truthfully.</h2><p>A previous price appears only when it is higher than the current price.</p></div>
              <label>Current price (ZMW)<div className="seller-money-input"><span>K</span><input min="1" onChange={(event) => patch("price", Number(event.target.value))} type="number" value={draft.price || ""} /></div></label>
              <label>Previous price (optional)<div className="seller-money-input"><span>K</span><input min="1" onChange={(event) => patch("previousPrice", event.target.value ? Number(event.target.value) : undefined)} type="number" value={draft.previousPrice ?? ""} /></div><small>Use this only for a genuine reduction from a previously offered price.</small></label>
              {draft.previousPrice && draft.previousPrice <= draft.price ? <p className="seller-validation invalid"><Icon name="alert" size={17} /> Previous price must be higher than the current price.</p> : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="seller-editor-section"><div><p className="eyebrow">04 · Options</p><h2>List every size or option buyers can choose.</h2><p>Each option keeps its own quantity and availability.</p></div>
              <div className="seller-variant-list">{draft.variants.map((variant, index) => <div key={variant.id}><span>{String(index + 1).padStart(2, "0")}</span><label>Option name<input onChange={(event) => updateVariant(variant.id, { label: event.target.value })} placeholder="e.g. M or EU 42" value={variant.label} /></label><label>Colour<input onChange={(event) => updateVariant(variant.id, { color: event.target.value })} value={variant.color} /></label><button aria-label={`Remove ${variant.label || `option ${index + 1}`}`} className="icon-button" disabled={draft.variants.length === 1} onClick={() => patch("variants", draft.variants.filter((item) => item.id !== variant.id))} type="button"><Icon name="delete" size={18} /></button></div>)}</div>
              <button className="button secondary" onClick={() => patch("variants", [...draft.variants, { id: optionId(), label: "", color: draft.color, colorHex: "#d4c8c0", available: true, quantity: 1 }])} type="button"><Icon name="plus" size={18} /> Add option</button>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="seller-editor-section"><div><p className="eyebrow">05 · Stock</p><h2>Set what is genuinely available now.</h2><p>You can confirm these states quickly later from Inventory.</p></div>
              <fieldset className="seller-availability-choices"><legend>Product availability</legend>{[["available", "Available", "Buyers can prepare an enquiry"], ["low", "Low", "A low-availability note appears"], ["sold", "Sold", "Ordering is unavailable"]].map(([value, label, detail]) => <label key={value}><input checked={draft.availability === value} name="availability" onChange={() => patch("availability", value as SellerProductInput["availability"])} type="radio" /><span><strong>{label}</strong><small>{detail}</small></span></label>)}</fieldset>
              <div className="seller-stock-options">{draft.variants.map((variant) => <div key={variant.id}><span><strong>{variant.label || "Untitled option"}</strong><small>{variant.color}</small></span><label>Quantity<input min="0" onChange={(event) => updateVariant(variant.id, { quantity: Number(event.target.value), available: Number(event.target.value) > 0 })} type="number" value={variant.quantity ?? 0} /></label></div>)}</div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="seller-editor-section"><div><p className="eyebrow">06 · Fulfilment</p><h2>Set the expectation before WhatsApp.</h2><p>The Store’s full collection and delivery terms remain the source of truth.</p></div>
              <label className="seller-check-row"><input checked={draft.madeHere} onChange={(event) => patch("madeHere", event.target.checked)} type="checkbox" /><span><strong>Made here</strong><small>Use only when this piece is made in Zambia.</small></span></label>
              <label>Product fulfilment note<textarea onChange={(event) => patch("fulfilmentNote", event.target.value)} rows={4} value={draft.fulfilmentNote} /></label>
              <div className="seller-store-term-preview"><div><Icon name="location" size={19} /><span><strong>Collection</strong><small>{state.store.collection}</small></span></div><div><Icon name="delivery" size={19} /><span><strong>Delivery</strong><small>{state.store.delivery}</small></span></div><Link href="/seller/store#fulfilment">Edit Store terms</Link></div>
            </div>
          ) : null}

          {step === 6 ? (
            <div className="seller-editor-section"><div><p className="eyebrow">07 · Review</p><h2>Review the buyer promise.</h2><p>Publishing makes this piece discoverable and available in your public Store.</p></div>
              <ul className="seller-publish-checklist">{requirements.map((requirement) => <li className={requirement.ready ? "complete" : "incomplete"} key={requirement.label}><Icon name={requirement.ready ? "tick" : "alert"} size={18} /><span>{requirement.label}</span>{!requirement.ready ? <button onClick={() => setStep(requirement.step)} type="button">Fix</button> : null}</li>)}</ul>
              <div className="seller-review-card"><span>{draft.images[0] ? <SmartImage alt="" fill sizes="220px" src={draft.images[0]} /> : <span className="seller-real-media-placeholder"><Icon name="image" size={28} /><small>Your real product photo appears here</small></span>}</span><div><small>{automaticTaxonomy.category} · {automaticTaxonomy.occasions.join(" · ")}</small><h3>{draft.title || "Untitled piece"}</h3><strong>{formatPrice(draft.price)}</strong><p>{draft.description || "Your product description will appear here."}</p><em>{draft.availability === "low" ? "Low stock" : draft.availability === "sold" ? "Sold" : "Available"}</em></div></div>
            </div>
          ) : null}
        </section>

        <aside className="seller-editor-aside">
          <p className="eyebrow">Publish readiness</p><h2>{requirements.filter((item) => item.ready).length} of {requirements.length} ready</h2>
          <ul>{requirements.map((requirement) => <li key={requirement.label}><Icon name={requirement.ready ? "tick" : "alert"} size={16} /> {requirement.label}</li>)}</ul>
          {savedProduct?.status === "published" ? <Link className="text-link" href={publicProductHref(savedProduct)}>View public product ↗</Link> : <p>Drafts remain private until you publish.</p>}
        </aside>
      </div>

      <footer className="seller-editor-actions"><button className="button secondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} type="button">Back</button><span>Step {step + 1} of {editorSteps.length}</span><div><button className="button secondary" disabled={uploading} onClick={() => void saveDraftAndLeave()} type="button">Save as draft</button>{step < editorSteps.length - 1 ? <button className="button primary" onClick={() => setStep((current) => current + 1)} type="button">Continue</button> : <button className="button primary" disabled={uploading} onClick={() => void publish()} type="button">Publish product</button>}</div></footer>
    </div>
  );
}
