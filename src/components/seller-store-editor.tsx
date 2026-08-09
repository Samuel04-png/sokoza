"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccessibleDialog } from "@/components/accessible-dialog";
import { Icon } from "@/components/icon";
import { SellerFulfilmentFields, SellerWhatsAppPreview } from "@/components/seller-fulfilment-fields";
import { SellerMilestone, SellerSnackbar } from "@/components/seller-feedback";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import type { SellerReferenceData } from "@/data/seller-studio-repository";
import { normalizeZambianWhatsApp } from "@/lib/seller-store";
import { hasValidFulfilment } from "@/lib/store-fulfilment";
import { uploadSellerImage } from "@/lib/supabase/media";

type SaveStatus = "Unsaved changes" | "Saving…" | "Saved" | "Save failed";

export function SellerStoreEditor({ referenceData }: { referenceData: SellerReferenceData }) {
  const { state, saveStoreDraft, publishStore, pauseStore, archiveStore, pendingWrites } = useSellerStudio();
  const [draft, setDraft] = useState(state.store);
  const [cityId, setCityId] = useState(() => state.store.cityId || referenceData.cities.find((city) => city.name === state.store.city)?.id || "");
  const [categoryIds, setCategoryIds] = useState(() => referenceData.categories.filter((category) => state.store.categories.includes(category.name)).map((category) => category.id));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("desktop");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [confirmation, setConfirmation] = useState<"pause" | "archive" | null>(null);
  const [milestone, setMilestone] = useState<"created" | "published" | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [mediaError, setMediaError] = useState("");
  const [uploadingField, setUploadingField] = useState<"avatarImage" | "coverImage" | null>(null);
  const whatsapp = useMemo(() => normalizeZambianWhatsApp(draft.whatsapp), [draft.whatsapp]);
  const fulfilmentReady = hasValidFulfilment(draft);
  const checks = [
    { label: "Store identity", ready: Boolean(draft.name && draft.tagline && draft.description) },
    { label: "Store imagery", ready: Boolean(draft.avatarImage && draft.coverImage) },
    { label: "Location and categories", ready: Boolean(draft.city && draft.area && draft.categories.length) },
    { label: "WhatsApp contact", ready: whatsapp.valid },
    { label: "Collection or delivery", ready: fulfilmentReady },
    { label: "Buyer policies", ready: Boolean(draft.exchanges && draft.cancellation) },
  ];
  const readyCount = checks.filter((check) => check.ready).length;

  useEffect(() => {
    function warnAboutUnsavedChanges(event: BeforeUnloadEvent) {
      if (saveStatus !== "Unsaved changes" && saveStatus !== "Saving…") return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnAboutUnsavedChanges);
    return () => window.removeEventListener("beforeunload", warnAboutUnsavedChanges);
  }, [saveStatus]);

  function patchDraft(patch: Partial<typeof draft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setSaveStatus("Unsaved changes");
  }

  const dismissSnackbar = useCallback(() => setSnackbar(null), []);

  async function persistDraft(feedback = true) {
    setSaveStatus("Saving…");
    const result = await saveStoreDraft({ ...draft, cityId, categoryIds });
    if (!result.saved || !result.store) {
      setSaveStatus("Save failed");
      setSnackbar({ message: result.error || "We couldn't save your changes.", tone: "error" });
      return result;
    }
    setDraft(result.store);
    setSaveStatus("Saved");
    if (result.created) setMilestone("created");
    else if (feedback) setSnackbar({ message: result.store.operatingState === "draft" ? "Store draft saved." : "Store updated.", tone: "success" });
    return result;
  }

  async function handlePublish() {
    const saved = await persistDraft(false);
    if (!saved.saved || !saved.store?.id) return;
    setSaveStatus("Saving…");
    const result = await publishStore(saved.store.id, saved.store.version);
    if (!result.saved || !result.store) {
      setSaveStatus("Save failed");
      setSnackbar({ message: result.error || "We couldn't publish this Store.", tone: "error" });
      return;
    }
    setDraft(result.store);
    setSaveStatus("Saved");
    if (result.firstPublication) setMilestone("published");
    else setSnackbar({ message: "Store published.", tone: "success" });
  }

  async function handleConfirmedState() {
    if (!confirmation || !draft.id) return;
    const action = confirmation;
    setConfirmation(null);
    setSaveStatus("Saving…");
    const result = action === "pause" ? await pauseStore(draft.id, draft.version) : await archiveStore(draft.id, draft.version);
    if (!result.saved || !result.store) {
      setSaveStatus("Save failed");
      setSnackbar({ message: result.error || `We couldn't ${action} this Store.`, tone: "error" });
      return;
    }
    setDraft(result.store);
    setSaveStatus("Saved");
    setSnackbar({ message: action === "pause" ? "Store paused." : "Store archived.", tone: "success" });
  }

  async function readImage(file: File | undefined, field: "avatarImage" | "coverImage") {
    if (!file) return;
    setUploadingField(field);
    setMediaError("");
    try {
      const url = await uploadSellerImage(file, "store-media", draft.id || "store", field === "avatarImage" ? "logo" : "cover");
      patchDraft({ [field]: url });
      setSnackbar({ message: `${field === "avatarImage" ? "Logo" : "Cover"} uploaded. Save Store to apply it.`, tone: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "The image could not be uploaded.";
      setMediaError(message);
      setSnackbar({ message, tone: "error" });
    } finally { setUploadingField(null); }
  }

  const preview = <div className={`seller-live-store-preview device-${previewDevice}`}>
    <div className="seller-live-preview-browser"><span /><span /><span /><small>sokoza.com/stores/{draft.slug}</small></div>
    <div className="seller-live-preview-cover"><SmartImage alt="" fill priority sizes="(max-width: 899px) 100vw, 430px" src={draft.coverImage} /></div>
    <div className="seller-live-preview-body"><span className="seller-live-preview-avatar"><SmartImage alt="" fill sizes="72px" src={draft.avatarImage} /></span><small>{draft.area}, {draft.city}</small><h3>{draft.name || "Untitled Store"}</h3><strong>{draft.tagline || "Add a focused tagline"}</strong><p>{draft.description || "Your Store description will appear here."}</p><div className="seller-live-preview-tags">{draft.categories.map((category) => <span key={category}>{category}</span>)}</div><button className="button whatsapp full" type="button"><Icon name="whatsapp" size={18} /> Contact Store</button><dl>{draft.collectionEnabled ? <div><dt>Collection</dt><dd>{draft.collection || "Not set"}</dd></div> : null}{draft.deliveryEnabled ? <div><dt>Delivery</dt><dd>{draft.delivery || "Not set"}</dd></div> : null}</dl></div>
  </div>;

  return <div className="seller-page seller-store-page">
    <header className="seller-page-header"><div><p className="eyebrow">Public Store management</p><h1>Shape how buyers meet {draft.name}.</h1><p>Save keeps your work. Publish is a separate, validated step that makes the Store discoverable.</p></div><div className="seller-store-header-actions"><span aria-live="polite" className={`seller-save-state ${saveStatus === "Saved" ? "is-saved" : saveStatus === "Save failed" ? "is-error" : ""}`}><Icon name={saveStatus === "Saved" ? "tick" : saveStatus === "Save failed" ? "alert" : "clock"} size={16} /> {saveStatus}</span>{draft.slug ? <Link className="button secondary" href={`/stores/${draft.slug}`}>View Store</Link> : null}</div></header>
    <div className="seller-mobile-view-switch" role="group" aria-label="Store workspace view"><button aria-pressed={mobileView === "edit"} onClick={() => setMobileView("edit")} type="button">Edit</button><button aria-pressed={mobileView === "preview"} onClick={() => setMobileView("preview")} type="button">Preview</button></div>
    <div className="seller-store-layout">
      <form className={`seller-store-form ${mobileView === "preview" ? "mobile-hidden" : ""}`} onSubmit={(event) => { event.preventDefault(); void persistDraft(); }}>
        <section className="seller-form-section"><div className="seller-form-section-heading"><span>01</span><div><h2>Store identity</h2><p>Be short and specific. Example tagline: “Everyday womenswear and easy layers.”</p></div></div>
          <label>Store name<input maxLength={70} onChange={(event) => patchDraft({ name: event.target.value })} required value={draft.name} /></label>
          <label>Tagline<input maxLength={90} onChange={(event) => patchDraft({ tagline: event.target.value })} placeholder="Everyday womenswear and easy layers." required value={draft.tagline} /><small>{draft.tagline.length}/90 characters</small></label>
          <label>Description<textarea maxLength={500} onChange={(event) => patchDraft({ description: event.target.value })} placeholder="Tell shoppers what you sell and what makes your Store useful. Keep it short and specific." required rows={5} value={draft.description} /><small>{draft.description.length}/500 characters</small></label>
          <div className="seller-field-grid"><label>City<select onChange={(event) => { const selected = referenceData.cities.find((city) => city.id === event.target.value); setCityId(event.target.value); patchDraft({ cityId: event.target.value, city: selected?.name ?? "" }); }} required value={cityId}><option value="">Choose a city</option>{referenceData.cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label><label>Public area<input onChange={(event) => patchDraft({ area: event.target.value, collectionArea: draft.collectionArea || event.target.value })} placeholder="Example: Kabulonga" value={draft.area} /></label></div>
          <fieldset className="seller-category-selector"><legend>Categories</legend><p>Choose up to five categories that describe products you actually sell.</p><div>{referenceData.categories.map((category) => <label key={category.id}><input checked={categoryIds.includes(category.id)} disabled={!categoryIds.includes(category.id) && categoryIds.length >= 5} onChange={(event) => { const nextIds = event.target.checked ? [...categoryIds, category.id] : categoryIds.filter((id) => id !== category.id); setCategoryIds(nextIds); patchDraft({ categoryIds: nextIds, categories: referenceData.categories.filter((item) => nextIds.includes(item.id)).map((item) => item.name) }); }} type="checkbox" /> <span>{category.name}</span></label>)}</div></fieldset>
        </section>
        <section className="seller-form-section"><div className="seller-form-section-heading"><span>02</span><div><h2>Store imagery</h2><p>Use your real logo and a current Store or collection image.</p></div></div>{mediaError ? <p className="seller-validation invalid" role="alert"><Icon name="alert" size={17} /> {mediaError}</p> : null}<div className="seller-store-media-grid"><label><span className="seller-store-media-preview square"><SmartImage alt="Current Store profile" fill sizes="110px" src={draft.avatarImage} /></span><strong>{uploadingField === "avatarImage" ? "Uploading…" : "Store profile image"}</strong><small>Square · max 8 MB</small><input accept="image/jpeg,image/png,image/webp,image/avif" disabled={Boolean(uploadingField)} onChange={(event) => void readImage(event.target.files?.[0], "avatarImage")} type="file" /></label><label><span className="seller-store-media-preview cover"><SmartImage alt="Current Store cover" fill sizes="260px" src={draft.coverImage} /></span><strong>{uploadingField === "coverImage" ? "Uploading…" : "Store cover image"}</strong><small>Wide image · max 8 MB</small><input accept="image/jpeg,image/png,image/webp,image/avif" disabled={Boolean(uploadingField)} onChange={(event) => void readImage(event.target.files?.[0], "coverImage")} type="file" /></label></div></section>
        <section className="seller-form-section"><div className="seller-form-section-heading"><span>03</span><div><h2>WhatsApp and enquiry preview</h2><p>Buyers receive a SOKOZA-generated message. You choose the number and tone—not the order facts.</p></div></div><label>WhatsApp number<input aria-describedby="store-whatsapp-status" inputMode="tel" onChange={(event) => patchDraft({ whatsapp: event.target.value })} value={draft.whatsapp} /></label><p className={whatsapp.valid ? "seller-validation valid" : "seller-validation invalid"} id="store-whatsapp-status" role="status"><Icon name={whatsapp.valid ? "tick" : "alert"} size={17} />{whatsapp.valid ? `${whatsapp.e164} is ready.` : "Enter a valid Zambian mobile number, for example +260 97 123 4567."}</p><label>Typical reply expectation<input onChange={(event) => patchDraft({ replyExpectation: event.target.value })} placeholder="Usually replies within one business day" value={draft.replyExpectation} /></label><SellerWhatsAppPreview onChange={patchDraft} store={draft} /></section>
        <section className="seller-form-section"><div className="seller-form-section-heading"><span>04</span><div><h2>Social profiles</h2><p>Optional. Add only official Store profiles; buyers open them in a new tab.</p></div></div><label>TikTok profile URL<input inputMode="url" onChange={(event) => patchDraft({ tiktokUrl: event.target.value })} placeholder="https://www.tiktok.com/@yourstore" type="url" value={draft.tiktokUrl} /></label><label>Facebook page URL<input inputMode="url" onChange={(event) => patchDraft({ facebookUrl: event.target.value })} placeholder="https://www.facebook.com/yourstore" type="url" value={draft.facebookUrl} /></label></section>
        <section className="seller-form-section"><div className="seller-form-section-heading"><span>05</span><div><h2>Fulfilment</h2><p>Choose structured options, start from useful copy, then edit only what differs.</p></div></div><SellerFulfilmentFields onChange={patchDraft} store={draft} /></section>
        <section className="seller-form-section"><div className="seller-form-section-heading"><span>06</span><div><h2>Buyer expectations</h2><p>State what happens if an item does not work or the buyer needs to cancel.</p></div></div><label>Exchanges / returns<textarea onChange={(event) => patchDraft({ exchanges: event.target.value })} placeholder="Example: Exchange requests are reviewed within 48 hours if the item is unworn." required rows={3} value={draft.exchanges} /></label><label>Cancellation position<textarea onChange={(event) => patchDraft({ cancellation: event.target.value })} placeholder="Example: Cancel before fulfilment is confirmed." required rows={3} value={draft.cancellation} /></label></section>
        <section className="seller-form-section"><div className="seller-form-section-heading"><span>07</span><div><h2>Operating state</h2><p>Save updates content. Publish, pause, and archive are separate confirmed operations.</p></div></div><div className="seller-operating-state"><div><span aria-hidden="true" className={`state-${draft.operatingState}`} /><div><strong>{draft.operatingState === "published" ? "Store live" : draft.operatingState === "paused" ? "Store paused" : draft.operatingState === "archived" ? "Store archived" : "Store draft"}</strong><small>{draft.operatingState === "published" ? "Safe saved edits update the public Store immediately." : draft.operatingState === "paused" ? "Shoppers cannot start new enquiries until you publish again." : draft.operatingState === "archived" ? "This Store is retained privately in Seller Studio." : "Publish only when every readiness check passes."}</small></div></div>{draft.operatingState === "published" ? <button className="button secondary" disabled={pendingWrites > 0} onClick={() => setConfirmation("pause")} type="button">Pause Store</button> : draft.operatingState === "archived" ? null : <button className="button secondary" disabled={pendingWrites > 0 || readyCount !== checks.length} onClick={() => void handlePublish()} type="button">{draft.operatingState === "paused" ? "Publish Store again" : "Publish Store"}</button>}</div>{draft.id && draft.operatingState !== "archived" ? <button className="text-link danger-link" onClick={() => setConfirmation("archive")} type="button">Archive Store</button> : null}</section>
        <div className="seller-form-actions"><span><strong>{readyCount} of {checks.length} ready</strong><small>{saveStatus === "Save failed" ? "We couldn't save your changes. Your form values are still here." : readyCount === checks.length ? "Your Store has the core buyer information." : "Complete the remaining checks before publishing."}</small></span><button className="button primary" disabled={pendingWrites > 0} type="submit">{saveStatus === "Save failed" ? "Try again" : "Save Store"}</button></div>
      </form>
      <aside className={`seller-store-preview ${mobileView === "edit" ? "mobile-hidden-preview" : ""}`}><div className="seller-preview-heading"><div><p className="eyebrow">Buyer preview</p><h2>How buyers meet you</h2></div><div role="group" aria-label="Preview device"><button aria-pressed={previewDevice === "mobile"} onClick={() => setPreviewDevice("mobile")} type="button">Mobile</button><button aria-pressed={previewDevice === "desktop"} onClick={() => setPreviewDevice("desktop")} type="button">Desktop</button></div></div>{preview}<div className="seller-preview-readiness"><strong>{readyCount} of {checks.length} ready</strong><ul>{checks.map((check) => <li key={check.label}><Icon name={check.ready ? "tick" : "alert"} size={15} /> {check.label}</li>)}</ul></div></aside>
    </div>
    {confirmation ? <AccessibleDialog labelledBy="store-confirm-title" onClose={() => setConfirmation(null)}><div className="seller-dialog-heading"><div><p className="eyebrow">Confirm Store change</p><h2 id="store-confirm-title">{confirmation === "pause" ? "Pause Store?" : "Archive Store?"}</h2></div><button aria-label="Close" className="icon-button" onClick={() => setConfirmation(null)} type="button"><Icon name="close" /></button></div><p>{confirmation === "pause" ? "Your Store remains in Seller Studio, but shoppers cannot start new enquiries until you publish it again." : "Your Store and products will be removed from buyer discovery. The records remain available for operator recovery."}</p><div className="seller-dialog-actions"><button className="button secondary" onClick={() => setConfirmation(null)} type="button">Cancel</button><button className="button primary" onClick={() => void handleConfirmedState()} type="button">{confirmation === "pause" ? "Pause Store" : "Archive Store"}</button></div></AccessibleDialog> : null}
    {milestone ? <SellerMilestone kind={milestone} onClose={() => setMilestone(null)} sellerName={state.sellerName} storeHref={draft.slug ? `/stores/${draft.slug}` : undefined} storeName={draft.name} /> : null}
    {snackbar ? <SellerSnackbar message={snackbar.message} onDismiss={dismissSnackbar} tone={snackbar.tone} /> : null}
  </div>;
}
