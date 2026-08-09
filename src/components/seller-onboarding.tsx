"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { SellerFulfilmentFields, SellerWhatsAppPreview } from "@/components/seller-fulfilment-fields";
import { SellerMilestone } from "@/components/seller-feedback";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import type { SellerReferenceData } from "@/data/seller-studio-repository";
import { normalizeZambianWhatsApp } from "@/lib/seller-store";
import { hasValidFulfilment } from "@/lib/store-fulfilment";
import { productToInput, type SellerProductInput } from "@/lib/seller-studio-types";
import { uploadSellerImage } from "@/lib/supabase/media";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const steps = ["Account", "Store", "WhatsApp", "Selling", "First product", "Preview"];
const nextStepActions = ["Save and shape Store", "Save and connect WhatsApp", "Save and set fulfilment", "Save and add first product", "Save and review readiness"];

const emptyProductInput: SellerProductInput = {
  title: "",
  price: 0,
  category: "Dresses",
  audience: "All",
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
  fulfilmentNote: "Collection or delivery is confirmed before the WhatsApp handoff.",
  status: "draft",
};

export function SellerOnboarding({ referenceData }: { referenceData: SellerReferenceData }) {
  const router = useRouter();
  const { state, saveOnboardingStep, pendingWrites, persistenceError } = useSellerStudio();
  const [step, setStep] = useState(Math.min(state.onboardingStep, steps.length - 1));
  const [sellerName, setSellerName] = useState(state.sellerName);
  const [accountEmail] = useState(state.accountEmail);
  const [emailEditorOpen, setEmailEditorOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [storeDraft, setStoreDraft] = useState(state.store);
  const [cityId, setCityId] = useState(() => referenceData.cities.find((city) => city.name === state.store.city)?.id ?? "");
  const [categoryIds, setCategoryIds] = useState(() => referenceData.categories.filter((category) => state.store.categories.includes(category.name)).map((category) => category.id));
  const starter = state.products.find((product) => product.status === "draft") ?? state.products[0];
  const [productDraft, setProductDraft] = useState(() => starter ? productToInput({ ...starter, status: "draft" }) : emptyProductInput);
  const [productCategoryId, setProductCategoryId] = useState(() => referenceData.categories.find((category) => category.name === (starter?.category ?? emptyProductInput.category))?.id ?? "");
  const [saveState, setSaveState] = useState("Saved");
  const [validationError, setValidationError] = useState("");
  const [uploading, setUploading] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [createdMilestone, setCreatedMilestone] = useState(false);
  const whatsapp = useMemo(() => normalizeZambianWhatsApp(storeDraft.whatsapp), [storeDraft.whatsapp]);
  const checks = [
    { label: "Account details", ready: Boolean(sellerName && accountEmail) },
    { label: "Store identity", ready: Boolean(storeDraft.name && storeDraft.tagline && storeDraft.description) },
    { label: "WhatsApp contact", ready: whatsapp.valid },
    { label: "Buyer expectations", ready: hasValidFulfilment(storeDraft) && Boolean(storeDraft.exchanges && storeDraft.cancellation) },
    { label: "First product draft", ready: Boolean(productDraft.title && productDraft.price > 0 && productDraft.description && productDraft.images[0]) },
  ];
  const readyCount = checks.filter((check) => check.ready).length;
  const visibleSaveState = persistenceError ? "Not saved" : pendingWrites || saveState === "Saving…" ? "Saving…" : "Saved";

  function updateStore<K extends keyof typeof storeDraft>(key: K, value: (typeof storeDraft)[K]) {
    setStoreDraft((current) => ({ ...current, [key]: value }));
    setSaveState("Unsaved changes");
  }

  function validateCurrentStep() {
    let message = "";
    if (step === 0 && sellerName.trim().length < 2) message = "Enter the name of the person operating this Store.";
    if (step === 1 && (!storeDraft.name.trim() || !storeDraft.tagline.trim() || !storeDraft.description.trim())) message = "Add the Store name, tagline and description before continuing.";
    if (step === 1 && !cityId) message = "Choose a supported city.";
    if (step === 1 && !categoryIds.length) message = "Choose at least one category.";
    if (step === 2 && !whatsapp.valid) message = "Enter a valid Zambian WhatsApp number.";
    if (step === 3 && !hasValidFulfilment(storeDraft)) message = "Choose Collection, Delivery, or both, then confirm the buyer-facing guidance.";
    if (step === 3 && (!storeDraft.exchanges.trim() || !storeDraft.cancellation.trim())) message = "Add concise exchange and cancellation expectations.";
    if (step === 4 && (!productDraft.title.trim() || productDraft.price <= 0 || !productDraft.description.trim() || !productDraft.images[0] || !productCategoryId)) message = "Add a product photo, title, category, price and description.";
    setValidationError(message);
    return !message;
  }

  async function persist(nextStep = step, complete = false) {
    setSaveState("Saving…");
    setValidationError("");
    const result = await saveOnboardingStep({
      currentStep: step,
      nextStep,
      complete: complete && readyCount === checks.length,
      sellerName: sellerName.trim(),
      store: storeDraft,
      cityId,
      categoryIds,
      product: productDraft,
      productCategoryId,
    });
    if (result.store) setStoreDraft((current) => ({ ...current, ...result.store }));
    if (result.created) setCreatedMilestone(true);
    if (result.product) setProductDraft((current) => ({
      ...current,
      id: result.product?.id,
      version: result.product?.version,
      variants: result.product?.variantIds.length === current.variants.length
        ? current.variants.map((variant, index) => ({ ...variant, id: result.product!.variantIds[index] }))
        : current.variants,
    }));
    setSaveState(result.saved ? "Saved" : "Not saved");
    return result.saved;
  }

  async function move(direction: number) {
    const next = Math.min(Math.max(step + direction, 0), steps.length - 1);
    if (direction < 0) {
      setStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!validateCurrentStep()) return;
    if (await persist(next)) {
      setStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function requestEmailChange() {
    setEmailStatus("Requesting verification…");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      setEmailStatus("We couldn't request that change. Check the address and retry.");
      return;
    }
    setEmailStatus(`Verification sent to ${newEmail.trim()}. Your sign-in email remains ${accountEmail} until confirmed.`);
  }

  async function uploadStoreImage(file: File | undefined, field: "avatarImage" | "coverImage") {
    if (!file) return;
    setUploading(field);
    setUploadError("");
    try {
      updateStore(field, await uploadSellerImage(file, "store-media", storeDraft.id || "store", field === "avatarImage" ? "logo" : "cover"));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "The image could not be uploaded.");
    } finally {
      setUploading("");
    }
  }

  async function uploadProductImage(file: File | undefined) {
    if (!file) return;
    const productId = productDraft.id ?? crypto.randomUUID();
    setUploading("product");
    setUploadError("");
    try {
      const image = await uploadSellerImage(file, "product-media", productId);
      setProductDraft((current) => ({ ...current, id: productId, images: [image] }));
      setSaveState("Unsaved changes");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "The image could not be uploaded.");
    } finally {
      setUploading("");
    }
  }

  async function finish() {
    if (await persist(steps.length - 1, true)) router.push("/seller");
  }

  return (
    <div className="seller-onboarding">
      <header className="seller-page-header seller-onboarding-header">
        <div><p className="eyebrow">Resumable Store setup</p><h1>Build the Store buyers will trust.</h1><p>Your progress stays with this Studio. Nothing becomes public until you choose to publish.</p></div>
        <span aria-live="polite" className={`seller-save-state ${visibleSaveState === "Saved" ? "is-saved" : ""}`}><Icon name={visibleSaveState === "Saved" ? "tick" : visibleSaveState === "Not saved" ? "alert" : "clock"} size={16} /> {visibleSaveState}</span>
      </header>

      <nav aria-label="Onboarding progress" className="seller-stepper six-steps">
        {steps.map((label, index) => (
          <button aria-current={step === index ? "step" : undefined} className={index <= Math.max(step, state.onboardingStep) ? "reached" : ""} disabled={pendingWrites > 0 || index > Math.max(step, state.onboardingStep)} key={label} onClick={() => setStep(index)} type="button">
            <span>{index < step ? <Icon name="tick" size={15} /> : index + 1}</span><b>{label}</b>
          </button>
        ))}
      </nav>

      <section aria-live="polite" className="seller-onboarding-panel">
        {validationError || persistenceError ? <p className="seller-validation invalid" role="alert"><Icon name="alert" size={17} /> {validationError || persistenceError}</p> : null}
        {step === 0 ? (
          <div className="seller-onboarding-step">
            <div><p className="eyebrow">Step 1 of 6</p><h2>Who operates this Store?</h2><p>This information is private. Buyers see the Store identity you create next.</p></div>
            <label>Seller name<input autoComplete="name" onChange={(event) => { setSellerName(event.target.value); setSaveState("Unsaved changes"); }} required value={sellerName} /></label>
            <label>Work email<input autoComplete="email" readOnly required type="email" value={accountEmail} /><small>This is your Supabase Auth sign-in credential, not a public Store field.</small></label>
            <button className="text-link seller-email-change" onClick={() => setEmailEditorOpen((open) => !open)} type="button">{emailEditorOpen ? "Cancel email change" : "Change email"}</button>
            {emailEditorOpen ? <div className="seller-email-change-panel"><label>New work email<input autoComplete="email" onChange={(event) => setNewEmail(event.target.value)} type="email" value={newEmail} /></label><button className="button secondary" disabled={!newEmail.trim() || pendingWrites > 0} onClick={() => void requestEmailChange()} type="button">Send verification</button>{emailStatus ? <p aria-live="polite">{emailStatus}</p> : null}</div> : null}
            <div className="seller-auth-notice"><Icon name="shield" size={18} /> Verification evidence and account details never appear as public Store fields.</div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="seller-onboarding-step">
            <div><p className="eyebrow">Step 2 of 6</p><h2>Give the Store a clear point of view.</h2><p>Help shoppers understand what you sell and why they should explore.</p></div>
            <label>Store name<input onChange={(event) => updateStore("name", event.target.value)} required value={storeDraft.name} /></label>
            <label>Tagline<input maxLength={90} onChange={(event) => updateStore("tagline", event.target.value)} placeholder="Everyday womenswear and easy layers." required value={storeDraft.tagline} /><small>One clear line about what shoppers will find · {storeDraft.tagline.length}/90</small></label>
            <label>Description<textarea maxLength={500} onChange={(event) => updateStore("description", event.target.value)} placeholder="Tell shoppers what you sell and what makes your Store useful. Keep it short and specific." required rows={5} value={storeDraft.description} /><small>{storeDraft.description.length}/500 characters</small></label>
            <div className="seller-field-grid"><label>City<select onChange={(event) => { const selected = referenceData.cities.find((city) => city.id === event.target.value); setCityId(event.target.value); updateStore("city", selected?.name ?? ""); }} required value={cityId}><option value="">Choose a city</option>{referenceData.cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label><label>Public area<input onChange={(event) => updateStore("area", event.target.value)} value={storeDraft.area} /></label></div>
            <fieldset className="seller-category-selector"><legend>What does your Store sell?</legend><p>Choose one or more categories. SOKOZA stores canonical category IDs while buyers see these names.</p><div>{referenceData.categories.map((category) => <label key={category.id}><input checked={categoryIds.includes(category.id)} onChange={(event) => { const nextIds = event.target.checked ? [...categoryIds, category.id] : categoryIds.filter((id) => id !== category.id); setCategoryIds(nextIds); updateStore("categories", referenceData.categories.filter((item) => nextIds.includes(item.id)).map((item) => item.name)); }} type="checkbox" /> <span>{category.name}</span></label>)}</div></fieldset>
            <div className="seller-onboarding-media-preview"><span>{storeDraft.avatarImage ? <SmartImage alt="Current Store profile" fill sizes="88px" src={storeDraft.avatarImage} /> : <Icon name="image" size={28} />}</span><div><strong>Store imagery</strong><p>Add your real logo and cover before publishing. Nothing fictional is used as a placeholder Store.</p></div></div>
            {uploadError ? <p className="seller-validation invalid" role="alert"><Icon name="alert" size={17} /> {uploadError}</p> : null}
            <div className="seller-field-grid"><label>Store profile image<input accept="image/jpeg,image/png,image/webp,image/avif" disabled={Boolean(uploading)} onChange={(event) => void uploadStoreImage(event.target.files?.[0], "avatarImage")} type="file" /><small>{uploading === "avatarImage" ? "Uploading…" : "Square image · max 8 MB"}</small></label><label>Store cover image<input accept="image/jpeg,image/png,image/webp,image/avif" disabled={Boolean(uploading)} onChange={(event) => void uploadStoreImage(event.target.files?.[0], "coverImage")} type="file" /><small>{uploading === "coverImage" ? "Uploading…" : "Wide image · max 8 MB"}</small></label></div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="seller-onboarding-step">
            <div><p className="eyebrow">Step 3 of 6</p><h2>Connect the right WhatsApp number.</h2><p>Prepared product enquiries will open a conversation with this number.</p></div>
            <label>WhatsApp number<input aria-describedby="onboarding-whatsapp-status" inputMode="tel" onChange={(event) => updateStore("whatsapp", event.target.value)} value={storeDraft.whatsapp} /></label>
            <p className={whatsapp.valid ? "seller-validation valid" : "seller-validation invalid"} id="onboarding-whatsapp-status" role="status"><Icon name={whatsapp.valid ? "tick" : "alert"} size={17} />{whatsapp.valid ? `${whatsapp.e164} is ready to confirm.` : "Enter a valid Zambian mobile number."}</p>
            <label>Reply expectation<input onChange={(event) => updateStore("replyExpectation", event.target.value)} value={storeDraft.replyExpectation} /></label>
            <div className="seller-auth-notice"><Icon name="info" size={18} /> Buyers see that the number was confirmed—not the private method used to confirm it.</div>
            <SellerWhatsAppPreview onChange={(patch) => setStoreDraft((current) => ({ ...current, ...patch }))} store={storeDraft} />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="seller-onboarding-step">
            <div><p className="eyebrow">Step 4 of 6</p><h2>Choose how buyers get their items.</h2><p>Start with structured choices and useful copy. Edit only what is different for your Store.</p></div>
            <SellerFulfilmentFields onChange={(patch) => { setStoreDraft((current) => ({ ...current, ...patch })); setSaveState("Unsaved changes"); }} store={storeDraft} />
            <label>Exchange / return position<textarea onChange={(event) => updateStore("exchanges", event.target.value)} placeholder="Example: Exchange requests are reviewed within 48 hours if the item is unworn." rows={3} value={storeDraft.exchanges} /></label>
            <label>Cancellation position<textarea onChange={(event) => updateStore("cancellation", event.target.value)} placeholder="Example: Cancel before fulfilment is confirmed." rows={3} value={storeDraft.cancellation} /></label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="seller-onboarding-step">
            <div><p className="eyebrow">Step 5 of 6</p><h2>Prepare the first product.</h2><p>Start with the essentials. The full editor is available after setup.</p></div>
            <div className="seller-first-product-preview"><span>{productDraft.images[0] ? <SmartImage alt="" fill sizes="140px" src={productDraft.images[0]} /> : <Icon name="image" size={28} />}</span><div><small>Draft preview</small><strong>{productDraft.title || "Untitled piece"}</strong><em>K{Number(productDraft.price || 0).toLocaleString("en-ZM")}</em></div></div>
            {uploadError ? <p className="seller-validation invalid" role="alert"><Icon name="alert" size={17} /> {uploadError}</p> : null}
            <label>Product photo<input accept="image/jpeg,image/png,image/webp,image/avif" disabled={Boolean(uploading)} onChange={(event) => void uploadProductImage(event.target.files?.[0])} type="file" /><small>{uploading === "product" ? "Uploading…" : "The actual product · max 8 MB"}</small></label>
            <label>Product title<input onChange={(event) => { setProductDraft((current) => ({ ...current, title: event.target.value })); setSaveState("Unsaved changes"); }} value={productDraft.title} /></label>
            <div className="seller-field-grid"><label>Price (ZMW)<input min="1" onChange={(event) => { setProductDraft((current) => ({ ...current, price: Number(event.target.value) })); setSaveState("Unsaved changes"); }} type="number" value={productDraft.price} /></label><label>Category<select onChange={(event) => { const selected = referenceData.categories.find((category) => category.id === event.target.value); setProductCategoryId(event.target.value); setProductDraft((current) => ({ ...current, category: selected?.name ?? "" })); setSaveState("Unsaved changes"); }} required value={productCategoryId}><option value="">Choose a category</option>{referenceData.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div>
            <label>Description<textarea onChange={(event) => { setProductDraft((current) => ({ ...current, description: event.target.value })); setSaveState("Unsaved changes"); }} rows={4} value={productDraft.description} /></label>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="seller-onboarding-step seller-onboarding-review">
            <div><p className="eyebrow">Step 6 of 6</p><h2>Review what is ready.</h2><p>These checks explain exactly what is complete. You can refine every part from Seller Studio.</p></div>
            <div className="seller-readiness-score"><strong>{readyCount} of {checks.length}</strong><span>Store setup checks ready</span></div>
            <ul className="seller-readiness-list">{checks.map((check) => <li className={check.ready ? "complete" : "incomplete"} key={check.label}><Icon name={check.ready ? "tick" : "alert"} size={18} /> {check.label}</li>)}</ul>
            <div className="seller-preview-entry"><div><strong>See the buyer view</strong><p>Review the live Store hierarchy, wording and current pieces before opening the Studio.</p></div><Link className="button secondary" href={`/stores/${storeDraft.slug}`}>View public Store</Link></div>
            <button className="button primary" disabled={pendingWrites > 0 || readyCount !== checks.length} onClick={() => void finish()} type="button">Finish and open Seller Studio</button>
          </div>
        ) : null}
      </section>

      <footer className="seller-onboarding-actions">
        <button className="button secondary" disabled={step === 0 || pendingWrites > 0} onClick={() => void move(-1)} type="button">Back</button>
        <span>Step {step + 1} of {steps.length}</span>
        {step < steps.length - 1 ? <button className="button primary" disabled={pendingWrites > 0} onClick={() => void move(1)} type="button">{nextStepActions[step]}</button> : <button className="button secondary" disabled={pendingWrites > 0} onClick={() => void persist(step)} type="button">Save progress</button>}
      </footer>
      {createdMilestone ? <SellerMilestone kind="created" onClose={() => setCreatedMilestone(false)} sellerName={sellerName} storeName={storeDraft.name} /> : null}
    </div>
  );
}
