"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AccessibleDialog } from "@/components/accessible-dialog";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { formatPrice } from "@/lib/format";
import type { SellerStudioProduct } from "@/lib/seller-studio-types";

type ProductFilter = "all" | SellerStudioProduct["status"] | "low" | "sold";

export function SellerProducts() {
  const { state, archiveProduct, duplicateProduct, restoreProduct } = useSellerStudio();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [sort, setSort] = useState("updated");
  const [selected, setSelected] = useState<string[]>([]);
  const [archiveTarget, setArchiveTarget] = useState<SellerStudioProduct | null>(null);
  const [notice, setNotice] = useState("");

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return state.products
      .filter((product) => {
        if (normalized && ![product.title, product.category, product.color].some((value) => value.toLocaleLowerCase().includes(normalized))) return false;
        if (filter === "all") return true;
        if (filter === "low" || filter === "sold") return product.availability === filter;
        return product.status === filter;
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "price-high") return b.price - a.price;
        if (sort === "price-low") return a.price - b.price;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [filter, query, sort, state.products]);

  function duplicate(product: SellerStudioProduct) {
    const copy = duplicateProduct(product.id);
    if (copy) setNotice(`${product.title} was duplicated as a draft.`);
  }

  return (
    <div className="seller-page seller-catalog-page">
      <header className="seller-page-header">
        <div><p className="eyebrow">{state.products.filter((product) => product.status === "published").length} published pieces</p><h1>Products</h1><p>Build a current visual catalog, then keep every public state easy to understand.</p></div>
        <Link className="button primary" href="/seller/products/new"><Icon name="plus" size={18} /> Add product</Link>
      </header>

      <div className="seller-catalog-summary" aria-label="Product states">
        {[
          ["Published", state.products.filter((product) => product.status === "published").length],
          ["Drafts", state.products.filter((product) => product.status === "draft").length],
          ["Low", state.products.filter((product) => product.status === "published" && product.availability === "low").length],
          ["Archived", state.products.filter((product) => product.status === "archived").length],
        ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>

      {notice ? <div className="seller-inline-success" role="status"><Icon name="tick" size={18} /> {notice}<button aria-label="Dismiss" onClick={() => setNotice("")} type="button"><Icon name="close" size={16} /></button></div> : null}

      <div className="seller-catalog-tools">
        <label className="seller-tool-search"><span className="sr-only">Search products</span><Icon name="search" size={19} /><input onChange={(event) => setQuery(event.target.value)} placeholder="Search title, category or colour" type="search" value={query} /></label>
        <label><span className="sr-only">Filter products</span><select onChange={(event) => setFilter(event.target.value as ProductFilter)} value={filter}><option value="all">All products</option><option value="published">Published</option><option value="draft">Drafts</option><option value="low">Low availability</option><option value="sold">Sold</option><option value="archived">Archived</option></select></label>
        <label><span className="sr-only">Sort products</span><select onChange={(event) => setSort(event.target.value)} value={sort}><option value="updated">Recently updated</option><option value="title">Title A–Z</option><option value="price-high">Price high–low</option><option value="price-low">Price low–high</option></select></label>
      </div>

      {selected.length ? <div className="seller-selection-bar"><span><strong>{selected.length}</strong> selected</span><Link className="button secondary small" href="/seller/inventory">Update inventory</Link><button className="button secondary small" onClick={() => setSelected([])} type="button">Clear</button></div> : null}

      {visible.length ? (
        <div className="seller-product-list">
          <div className="seller-list-head" aria-hidden="true"><span>Piece</span><span>Status</span><span>Availability</span><span>Price</span><span>Actions</span></div>
          {visible.map((product) => {
            const checked = selected.includes(product.id);
            return (
              <article className="seller-product-row" key={product.id}>
                <label className="seller-row-select"><span className="sr-only">Select {product.title}</span><input checked={checked} onChange={() => setSelected((current) => checked ? current.filter((id) => id !== product.id) : [...current, product.id])} type="checkbox" /></label>
                <Link className="seller-product-identity" href={`/seller/products/${product.id}`}>
                  <span><SmartImage alt="" fill sizes="72px" src={product.images[0]} /></span>
                  <span><strong>{product.title}</strong><small>{product.category} · {product.images.length} photo{product.images.length === 1 ? "" : "s"} · {product.variants.length} option{product.variants.length === 1 ? "" : "s"}</small></span>
                </Link>
                <span className={`seller-state-badge state-${product.status}`}>{product.status}</span>
                <span className={`seller-stock-state state-${product.availability}`}>{product.status === "draft" && product.availability === "sold" ? "Needs stock review" : product.availability === "low" ? "Low" : product.availability === "sold" ? "Sold" : product.availability === "stale" ? "Needs checking" : "Available"}</span>
                <strong className="seller-product-price">{formatPrice(product.price)}</strong>
                <div className="seller-row-actions">
                  {product.status !== "archived" ? <Link aria-label={`Edit ${product.title}`} className="icon-button" href={`/seller/products/${product.id}/edit`}><Icon name="settings" size={18} /></Link> : null}
                  <button aria-label={`Duplicate ${product.title}`} className="icon-button" onClick={() => duplicate(product)} type="button"><Icon name="copy" size={18} /></button>
                  {product.status === "archived" ? <button className="seller-text-action" onClick={() => { restoreProduct(product.id); setNotice(`${product.title} was restored as a draft.`); }} type="button">Restore</button> : <button aria-label={`Archive ${product.title}`} className="icon-button" onClick={() => setArchiveTarget(product)} type="button"><Icon name="delete" size={18} /></button>}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="seller-empty-state"><Icon name="package" size={30} /><h2>No products match</h2><p>Try another search or filter. Your products have not been removed.</p><button className="button secondary" onClick={() => { setQuery(""); setFilter("all"); }} type="button">Clear filters</button></div>
      )}

      {archiveTarget ? (
        <AccessibleDialog labelledBy="archive-product-title" onClose={() => setArchiveTarget(null)}>
          <div className="seller-dialog-heading"><div><p className="eyebrow">Reversible action</p><h2 id="archive-product-title">Archive {archiveTarget.title}?</h2></div><button aria-label="Close" className="icon-button" onClick={() => setArchiveTarget(null)} type="button"><Icon name="close" /></button></div>
          <p>It will leave the public Store and catalog, but its enquiry snapshots and product history stay intact. You can restore it as a draft.</p>
          <div className="seller-dialog-actions"><button className="button secondary" onClick={() => setArchiveTarget(null)} type="button">Keep product</button><button className="button primary" onClick={() => { archiveProduct(archiveTarget.id); setNotice(`${archiveTarget.title} was archived.`); setArchiveTarget(null); }} type="button">Archive product</button></div>
        </AccessibleDialog>
      ) : null}
    </div>
  );
}
