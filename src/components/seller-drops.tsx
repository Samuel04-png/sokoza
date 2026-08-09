"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { uploadSellerImage } from "@/lib/supabase/media";

export function SellerDrops() {
  const { state, archiveDrop } = useSellerStudio();
  const [notice, setNotice] = useState("");
  return (
    <div className="seller-page seller-drops-page">
      <header className="seller-page-header"><div><p className="eyebrow">Visual collections</p><h1>Drops</h1><p>Bring related pieces together around one idea, mood or moment.</p></div><Link className="button primary" href="/seller/drops/new"><Icon name="plus" size={18} /> Create Drop</Link></header>
      {notice ? <div className="seller-inline-success" role="status"><Icon name="tick" size={18} /> {notice}<button aria-label="Dismiss" onClick={() => setNotice("")} type="button"><Icon name="close" size={16} /></button></div> : null}
      <div className="seller-drop-grid">{state.drops.map((drop) => {
        const products = state.products.filter((product) => drop.productIds.includes(product.id));
        return <article key={drop.id}>
          <Link className="seller-drop-cover" href={`/seller/drops/${drop.id}`}><SmartImage alt={`${drop.title} cover`} fill sizes="(max-width: 639px) 100vw, 420px" src={drop.coverImage} /><span className={`seller-state-badge state-${drop.status}`}>{drop.status}</span></Link>
          <div className="seller-drop-copy"><small>{products.length} piece{products.length === 1 ? "" : "s"}</small><h2>{drop.title}</h2><p>{drop.subtitle}</p><div className="seller-drop-product-stack">{products.slice(0, 4).map((product) => <span key={product.id}><SmartImage alt="" fill sizes="48px" src={product.images[0]} /></span>)}</div><div><Link className="button secondary" href={`/seller/drops/${drop.id}`}>{drop.status === "draft" ? "Continue Drop" : "Manage Drop"}</Link>{drop.status === "live" ? <button className="seller-text-action" onClick={() => { archiveDrop(drop.id); setNotice(`${drop.title} moved to Past Drops.`); }} type="button">End Drop</button> : null}</div></div>
        </article>;
      })}</div>
      {!state.drops.length ? <div className="seller-empty-state"><Icon name="calendar" size={30} /><h2>Your first Drop starts with a point of view</h2><p>Select current products, add a cover and tell buyers what connects them.</p><Link className="button primary" href="/seller/drops/new">Create Drop</Link></div> : null}
      <section className="seller-future-note"><div><Icon name="image" size={24} /></div><div><p className="eyebrow">Approved for V1.1</p><h2>Stories will extend a Drop—not imitate one.</h2><p>Time-limited styling notes, restocks and behind-the-scenes media arrive after upload processing, expiry, moderation and reduced-motion behavior are dependable.</p></div></section>
    </div>
  );
}

export function SellerDropEditor({ dropId }: { dropId?: string }) {
  const router = useRouter();
  const { state, saveDrop, flushWrites } = useSellerStudio();
  const existing = dropId ? state.drops.find((drop) => drop.id === dropId) : undefined;
  const [draftId] = useState(existing?.id ?? crypto.randomUUID());
  const [title, setTitle] = useState(existing?.title ?? "");
  const [subtitle, setSubtitle] = useState(existing?.subtitle ?? "");
  const [coverImage, setCoverImage] = useState(existing?.coverImage ?? "");
  const [productIds, setProductIds] = useState(existing?.productIds ?? []);
  const [status, setStatus] = useState(existing?.status ?? "draft");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function readCover(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      setCoverImage(await uploadSellerImage(file, "store-media", draftId));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The cover could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function persist(nextStatus: "draft" | "live" | "past") {
    if (nextStatus === "live" && (!title.trim() || !subtitle.trim() || !coverImage || !productIds.length)) {
      setError("Add a title, story, cover and at least one published product before making this Drop live.");
      return;
    }
    const id = draftId;
    saveDrop({ id, slug: existing?.slug ?? title.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), title: title.trim() || "Untitled Drop", subtitle: subtitle.trim(), coverImage, productIds, status: nextStatus, publishedAt: nextStatus === "live" ? existing?.publishedAt ?? new Date().toISOString() : existing?.publishedAt });
    if (await flushWrites()) router.push(`/seller/drops/${id}?saved=1`);
    else setError("This Drop was not saved. Review the save error and try again.");
  }

  return (
    <div className="seller-page seller-drop-editor-page">
      <header className="seller-editor-header"><div><Link className="seller-back-link" href="/seller/drops"><Icon name="back" size={17} /> Drops</Link><p className="eyebrow">{existing ? "Edit Drop" : "New Drop"}</p><h1>{title || "Untitled Drop"}</h1></div><span className={`seller-state-badge state-${status}`}>{status}</span></header>
      {error ? <div className="seller-inline-error" role="alert"><Icon name="alert" size={18} /> {error}</div> : null}
      <div className="seller-drop-editor-grid">
        <form onSubmit={(event) => { event.preventDefault(); void persist(status === "live" ? "live" : "draft"); }}>
          <section className="seller-form-section"><div className="seller-form-section-heading"><span>01</span><div><h2>Collection idea</h2><p>Give the Drop a memorable name and a short reason to explore.</p></div></div><label>Drop title<input maxLength={70} onChange={(event) => { setTitle(event.target.value); setError(""); }} value={title} /></label><label>Short story<textarea maxLength={220} onChange={(event) => { setSubtitle(event.target.value); setError(""); }} rows={4} value={subtitle} /><small>{subtitle.length}/220 characters</small></label></section>
          <section className="seller-form-section"><div className="seller-form-section-heading"><span>02</span><div><h2>Cover</h2><p>Use one image that carries the collection’s mood.</p></div></div><label className="seller-drop-cover-upload"><span><SmartImage alt="Drop cover preview" fill sizes="560px" src={coverImage} /></span><strong>{uploading ? "Uploading…" : coverImage ? "Replace cover" : "Add cover"}</strong><input accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(event) => void readCover(event.target.files?.[0])} type="file" /></label></section>
          <section className="seller-form-section"><div className="seller-form-section-heading"><span>03</span><div><h2>Choose products</h2><p>Only published pieces can join a live Drop.</p></div></div><div className="seller-drop-product-picker">{state.products.filter((product) => product.status === "published").map((product) => { const checked = productIds.includes(product.id); return <label key={product.id}><input checked={checked} onChange={() => setProductIds((current) => checked ? current.filter((id) => id !== product.id) : [...current, product.id])} type="checkbox" /><span><SmartImage alt="" fill sizes="72px" src={product.images[0]} /></span><span><strong>{product.title}</strong><small>{product.availability}</small></span></label>; })}</div></section>
          <div className="seller-form-actions"><button className="button secondary" onClick={() => { setStatus("draft"); void persist("draft"); }} type="button">Save draft</button><button className="button primary" onClick={() => { setStatus("live"); void persist("live"); }} type="button">{existing?.status === "live" ? "Update live Drop" : "Publish Drop"}</button></div>
        </form>
        <aside className="seller-drop-live-preview"><p className="eyebrow">Buyer preview</p><div className="seller-drop-cover"><SmartImage alt="" fill sizes="430px" src={coverImage} /></div><small>{productIds.length} piece{productIds.length === 1 ? "" : "s"}</small><h2>{title || "Untitled Drop"}</h2><p>{subtitle || "A short Drop story will appear here."}</p><div>{state.products.filter((product) => productIds.includes(product.id)).map((product) => <span key={product.id}><SmartImage alt="" fill sizes="62px" src={product.images[0]} /></span>)}</div></aside>
      </div>
    </div>
  );
}
