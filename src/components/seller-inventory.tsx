"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AccessibleDialog } from "@/components/accessible-dialog";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import type { Availability } from "@/lib/types";

type InventoryFilter = "all" | "available" | "low" | "sold" | "stale";

function freshness(confirmedAt: string) {
  const age = Math.max(0, Date.now() - new Date(confirmedAt).getTime());
  const hours = Math.floor(age / 3_600_000);
  if (hours < 1) return "Just confirmed";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SellerInventory() {
  const searchParams = useSearchParams();
  const { state, setAvailability } = useSellerStudio();
  const initialFilter = (searchParams.get("status") as InventoryFilter | null) ?? "all";
  const [filter, setFilter] = useState<InventoryFilter>(initialFilter);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkState, setBulkState] = useState<Availability | null>(null);
  const [notice, setNotice] = useState("");
  const products = useMemo(() => state.products.filter((product) => product.status !== "archived" && (filter === "all" || product.availability === filter) && (!query.trim() || product.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))), [filter, query, state.products]);

  function applyBulk() {
    if (!bulkState || !selected.length) return;
    setAvailability(selected, bulkState);
    setNotice(`${selected.length} ${selected.length === 1 ? "piece" : "pieces"} updated to ${bulkState === "low" ? "Low" : bulkState[0].toUpperCase() + bulkState.slice(1)}.`);
    setSelected([]);
    setBulkState(null);
  }

  return (
    <div className="seller-page seller-inventory-page">
      <header className="seller-page-header"><div><p className="eyebrow">Fast stock maintenance</p><h1>Inventory</h1><p>Confirm what buyers can enquire about now. Every change records a new freshness time.</p></div><Link className="button secondary" href="/seller/products/new"><Icon name="plus" size={18} /> Add product</Link></header>

      <section className="seller-freshness-summary"><div><Icon name="refresh" size={25} /><span><strong>{state.products.filter((product) => product.status === "published" && product.availability !== "stale").length} current</strong><small>Published pieces with a recent state</small></span></div><div><strong>{state.products.filter((product) => product.availability === "low").length}</strong><span>Low</span></div><div><strong>{state.products.filter((product) => product.availability === "sold").length}</strong><span>Sold</span></div><div><strong>{state.products.filter((product) => product.availability === "stale").length}</strong><span>Needs checking</span></div></section>

      {notice ? <div className="seller-inline-success" role="status"><Icon name="tick" size={18} /> {notice}<button aria-label="Dismiss" onClick={() => setNotice("")} type="button"><Icon name="close" size={16} /></button></div> : null}

      <div className="seller-catalog-tools"><label className="seller-tool-search"><span className="sr-only">Search inventory</span><Icon name="search" size={19} /><input onChange={(event) => setQuery(event.target.value)} placeholder="Search pieces" type="search" value={query} /></label><label><span className="sr-only">Filter inventory</span><select onChange={(event) => setFilter(event.target.value as InventoryFilter)} value={filter}><option value="all">All inventory</option><option value="available">Available</option><option value="low">Low</option><option value="sold">Sold</option><option value="stale">Needs checking</option></select></label></div>

      {selected.length ? <div className="seller-selection-bar"><span><strong>{selected.length}</strong> selected</span><div><button className="button secondary small" onClick={() => setBulkState("available")} type="button">Set Available</button><button className="button secondary small" onClick={() => setBulkState("low")} type="button">Set Low</button><button className="button secondary small" onClick={() => setBulkState("sold")} type="button">Set Sold</button><button className="seller-text-action" onClick={() => setSelected([])} type="button">Clear</button></div></div> : null}

      <div className="seller-inventory-list">
        <div className="seller-list-head" aria-hidden="true"><span>Piece</span><span>Options</span><span>Last checked</span><span>Availability</span></div>
        {products.map((product) => {
          const checked = selected.includes(product.id);
          const total = product.variants.reduce((sum, variant) => sum + (variant.quantity ?? 0), 0);
          return <article className="seller-inventory-row" key={product.id}>
            <label className="seller-row-select"><span className="sr-only">Select {product.title}</span><input checked={checked} onChange={() => setSelected((current) => checked ? current.filter((id) => id !== product.id) : [...current, product.id])} type="checkbox" /></label>
            <Link className="seller-product-identity" href={`/seller/products/${product.id}`}><span><SmartImage alt="" fill sizes="68px" src={product.images[0]} /></span><span><strong>{product.title}</strong><small>{product.status === "draft" ? "Draft · " : ""}{product.category}</small></span></Link>
            <span className="seller-inventory-options"><strong>{total || "—"}</strong><small>{product.variants.length} option{product.variants.length === 1 ? "" : "s"}</small></span>
            <span className="seller-freshness"><Icon name="clock" size={16} /><strong>{freshness(product.confirmedAt)}</strong><small>{new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lusaka" }).format(new Date(product.confirmedAt))}</small></span>
            <div className="seller-inventory-choices" role="group" aria-label={`${product.title} availability`}>{(["available", "low", "sold"] as const).map((status) => <button aria-pressed={product.availability === status} key={status} onClick={() => { setAvailability([product.id], status); setNotice(`${product.title} is now ${status}.`); }} type="button">{status === "low" ? "Low" : status[0].toUpperCase() + status.slice(1)}</button>)}</div>
          </article>;
        })}
      </div>
      {!products.length ? <div className="seller-empty-state"><Icon name="refresh" size={30} /><h2>No inventory matches</h2><p>Try another state or search term.</p><button className="button secondary" onClick={() => { setFilter("all"); setQuery(""); }} type="button">Show all inventory</button></div> : null}

      {bulkState ? <AccessibleDialog labelledBy="bulk-inventory-title" onClose={() => setBulkState(null)}><div className="seller-dialog-heading"><div><p className="eyebrow">Review bulk change</p><h2 id="bulk-inventory-title">Set {selected.length} {selected.length === 1 ? "piece" : "pieces"} to {bulkState === "low" ? "Low" : bulkState[0].toUpperCase() + bulkState.slice(1)}?</h2></div><button aria-label="Close" className="icon-button" onClick={() => setBulkState(null)} type="button"><Icon name="close" /></button></div><p>This changes public availability and refreshes the confirmation time for every selected piece.</p><ul className="seller-dialog-product-list">{state.products.filter((product) => selected.includes(product.id)).map((product) => <li key={product.id}><span><SmartImage alt="" fill sizes="44px" src={product.images[0]} /></span>{product.title}<small>{product.availability} → {bulkState}</small></li>)}</ul><div className="seller-dialog-actions"><button className="button secondary" onClick={() => setBulkState(null)} type="button">Cancel</button><button className="button primary" onClick={applyBulk} type="button">Confirm update</button></div></AccessibleDialog> : null}
    </div>
  );
}
