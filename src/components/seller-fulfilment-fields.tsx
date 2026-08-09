"use client";

import { Icon } from "@/components/icon";
import type { SellerStudioStore } from "@/lib/seller-studio-types";
import { collectionTemplates, deliveryTemplates, whatsappPreview } from "@/lib/store-fulfilment";

export function SellerFulfilmentFields({ store, onChange }: { store: SellerStudioStore; onChange: (patch: Partial<SellerStudioStore>) => void }) {
  const templateInput = {
    city: store.city,
    area: store.collectionArea || store.area,
    deliveryScope: store.deliveryScope,
    deliveryFeeMode: store.deliveryFeeMode,
    deliveryFee: store.deliveryFee,
  };
  const collectionOptions = collectionTemplates(templateInput);
  const deliveryOptions = deliveryTemplates(templateInput);
  return (
    <div className="seller-guided-fulfilment">
      <fieldset className="seller-choice-panel">
        <legend>How can buyers get their items?</legend>
        <p>Choose one or both. Buyers will only see the options you enable.</p>
        <div className="seller-choice-row">
          <label><input checked={store.collectionEnabled} onChange={(event) => onChange({ collectionEnabled: event.target.checked })} type="checkbox" /> <span><strong>Collection</strong><small>Agree on the exact point privately in WhatsApp.</small></span></label>
          <label><input checked={store.deliveryEnabled} onChange={(event) => onChange({ deliveryEnabled: event.target.checked })} type="checkbox" /> <span><strong>Delivery</strong><small>Explain the service area without making unsupported promises.</small></span></label>
        </div>
      </fieldset>

      {store.collectionEnabled ? <div className="seller-guidance-card">
        <div><p className="eyebrow">Collection setup</p><h3>Keep private addresses private.</h3><p>Share an area and city publicly. Confirm the exact meeting point and time in WhatsApp.</p></div>
        <div className="seller-field-grid"><label>City<input readOnly value={store.city} /></label><label>Collection area<input onChange={(event) => onChange({ collectionArea: event.target.value })} placeholder="Example: Kabulonga" value={store.collectionArea} /></label></div>
        <div className="seller-template-options" role="group" aria-label="Collection copy templates">{collectionOptions.map((option) => <button key={option.id} onClick={() => onChange({ collection: option.text })} type="button"><strong>{option.label}</strong><span>{option.text}</span><small>Use this</small></button>)}</div>
        <label>Buyer-facing collection text<textarea maxLength={1000} onChange={(event) => onChange({ collection: event.target.value })} rows={3} value={store.collection} /><small>Edit the suggested copy if your arrangement is different.</small></label>
      </div> : null}

      {store.deliveryEnabled ? <div className="seller-guidance-card">
        <div><p className="eyebrow">Delivery setup</p><h3>Where can you realistically deliver?</h3></div>
        <fieldset><legend>Delivery area</legend><div className="seller-inline-options">
          {([['within_city', 'Within my city'], ['selected_areas', 'Selected areas'], ['zambia_wide', 'Zambia-wide / courier']] as const).map(([value, label]) => <label key={value}><input checked={store.deliveryScope === value} name="delivery-scope" onChange={() => onChange({ deliveryScope: value })} type="radio" /> {label}</label>)}
        </div></fieldset>
        <fieldset><legend>Delivery fee</legend><div className="seller-inline-options">
          {([['whatsapp', 'Confirmed on WhatsApp'], ['fixed', 'Fixed fee'], ['free', 'Free delivery']] as const).map(([value, label]) => <label key={value}><input checked={store.deliveryFeeMode === value} name="delivery-fee-mode" onChange={() => onChange({ deliveryFeeMode: value, deliveryFee: value === 'fixed' ? store.deliveryFee ?? 0 : undefined })} type="radio" /> {label}</label>)}
        </div></fieldset>
        {store.deliveryFeeMode === "fixed" ? <label>Fixed fee (ZMW)<input min="0" onChange={(event) => onChange({ deliveryFee: Number(event.target.value) })} type="number" value={store.deliveryFee ?? 0} /></label> : null}
        <div className="seller-template-options" role="group" aria-label="Delivery copy templates">{deliveryOptions.map((option) => <button key={option.id} onClick={() => onChange({ delivery: option.text })} type="button"><strong>{option.label}</strong><span>{option.text}</span><small>Use this</small></button>)}</div>
        <label>Buyer-facing delivery text<textarea maxLength={1000} onChange={(event) => onChange({ delivery: event.target.value })} rows={3} value={store.delivery} /><small>Only promise services and fees you can actually support.</small></label>
      </div> : null}

      <div className="seller-fulfilment-preview">
        <p className="eyebrow">How buyers will see this</p>
        {!store.collectionEnabled && !store.deliveryEnabled ? <p className="seller-validation invalid"><Icon name="alert" size={17} /> Choose Collection, Delivery, or both.</p> : null}
        {store.collectionEnabled ? <div><Icon name="location" size={19} /><span><strong>Collection</strong><p>{store.collection || "Choose a template or add collection guidance."}</p></span></div> : null}
        {store.deliveryEnabled ? <div><Icon name="delivery" size={19} /><span><strong>Delivery</strong><p>{store.delivery || "Choose a template or add delivery guidance."}</p></span></div> : null}
      </div>
    </div>
  );
}

export function SellerWhatsAppPreview({ store, onChange }: { store: SellerStudioStore; onChange: (patch: Partial<SellerStudioStore>) => void }) {
  const preference = store.deliveryEnabled ? "delivery" : store.collectionEnabled ? "collection" : "none";
  const testHref = store.whatsapp.replace(/\D/g, "") ? `https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Testing my SOKOZA Store WhatsApp setup.")}` : "";
  return <div className="seller-whatsapp-setup">
    <div><p className="eyebrow">Buyer message preview</p><h3>SOKOZA protects the order details.</h3><p>The reference, item, option, quantity and displayed price always come from the real order intent. You only choose the surrounding tone.</p></div>
    <fieldset><legend>Message tone</legend><div className="seller-inline-options">{([['standard', 'Standard'], ['warm', 'Warm'], ['concise', 'Concise']] as const).map(([value, label]) => <label key={value}><input checked={store.whatsappTone === value} name="whatsapp-tone" onChange={() => onChange({ whatsappTone: value })} type="radio" /> {label}</label>)}</div></fieldset>
    <pre aria-label="Representative WhatsApp message preview">{whatsappPreview({ storeName: store.name || "YOUR STORE", tone: store.whatsappTone, fulfilment: preference })}</pre>
    <small>Preview data only — no order or enquiry is created.</small>
    {testHref ? <a className="button secondary" href={testHref} rel="noreferrer" target="_blank"><Icon name="whatsapp" size={18} /> Test WhatsApp</a> : null}
  </div>;
}
