"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { formatPrice } from "@/lib/format";
import type { SellerEnquiryStatus } from "@/lib/seller-studio-types";

const statusLabel: Record<SellerEnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  awaiting_buyer: "Awaiting buyer",
  completed_elsewhere: "Completed elsewhere",
  closed: "Closed",
};

export function SellerEnquiries() {
  const { state } = useSellerStudio();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | SellerEnquiryStatus>("all");
  const visible = useMemo(() => state.enquiries.filter((enquiry) => {
    const matchesQuery = !query.trim() || enquiry.reference.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) || enquiry.lines.some((line) => line.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
    return matchesQuery && (filter === "all" || enquiry.status === filter);
  }), [filter, query, state.enquiries]);

  return (
    <div className="seller-page seller-enquiries-page">
      <header className="seller-page-header"><div><p className="eyebrow">Buyer-prepared WhatsApp intent</p><h1>Enquiries</h1><p>Review exactly what the buyer saw, then keep your own follow-up state current.</p></div><div className="seller-header-count"><strong>{state.enquiries.filter((enquiry) => enquiry.status === "new").length}</strong><span>new</span></div></header>
      <div className="seller-enquiry-explainer"><Icon name="info" size={20} /><p>An enquiry records a SOKOZA review and WhatsApp handoff signal. It is not proof that a message arrived, payment was made, or an order was completed.</p></div>
      <div className="seller-catalog-tools"><label className="seller-tool-search"><span className="sr-only">Search enquiries</span><Icon name="search" size={19} /><input onChange={(event) => setQuery(event.target.value)} placeholder="Search reference or product" type="search" value={query} /></label><label><span className="sr-only">Filter enquiries</span><select onChange={(event) => setFilter(event.target.value as "all" | SellerEnquiryStatus)} value={filter}><option value="all">All follow-up states</option>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
      {visible.length ? <div className="seller-enquiry-list">{visible.map((enquiry) => {
        const total = enquiry.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
        return <Link href={`/seller/enquiries/${enquiry.reference}`} key={enquiry.id}>
          <span className="seller-enquiry-images">{enquiry.lines.slice(0, 2).map((line, index) => <span key={line.id} style={{ zIndex: 2 - index }}><SmartImage alt="" fill sizes="64px" src={line.image} /></span>)}</span>
          <span className="seller-enquiry-main"><small>{new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lusaka" }).format(new Date(enquiry.createdAt))}</small><strong>{enquiry.reference}</strong><em>{enquiry.lines.map((line) => `${line.title} · ${line.variantLabel}`).join(" + ")}</em></span>
          <span className={`seller-state-badge state-${enquiry.status}`}>{statusLabel[enquiry.status]}</span>
          <span className="seller-enquiry-total"><strong>{formatPrice(total)}</strong><small>snapshot total</small></span>
          <Icon name="next" size={18} />
        </Link>;
      })}</div> : <div className="seller-empty-state"><Icon name="whatsapp" size={30} /><h2>No enquiries match</h2><p>Try another reference, product or follow-up state.</p><button className="button secondary" onClick={() => { setQuery(""); setFilter("all"); }} type="button">Show all enquiries</button></div>}
    </div>
  );
}

export function SellerEnquiryDetail({ reference }: { reference: string }) {
  const { state, setEnquiryStatus } = useSellerStudio();
  const enquiry = state.enquiries.find((item) => item.reference.toLocaleLowerCase() === reference.toLocaleLowerCase());
  const [notice, setNotice] = useState("");
  if (!enquiry) return <div className="seller-page"><div className="seller-empty-state"><Icon name="whatsapp" size={30} /><h1>Enquiry not found</h1><p>Check the reference or return to the enquiry list.</p><Link className="button secondary" href="/seller/enquiries">Return to enquiries</Link></div></div>;
  const total = enquiry.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const whatsapp = state.store.whatsapp.replace(/\D/g, "");
  const message = [`Hello — I’m following up from ${state.store.name} on SOKOZA enquiry ${enquiry.reference}.`, "", ...enquiry.lines.map((line) => `• ${line.title} — ${line.variantLabel} × ${line.quantity}`), "", "Is there anything you would like me to confirm?"].join("\n");

  return (
    <div className="seller-page seller-enquiry-detail-page">
      <Link className="seller-back-link" href="/seller/enquiries"><Icon name="back" size={17} /> Enquiries</Link>
      {notice ? <div className="seller-inline-success" role="status"><Icon name="tick" size={18} /> {notice}<button aria-label="Dismiss" onClick={() => setNotice("")} type="button"><Icon name="close" size={16} /></button></div> : null}
      <header className="seller-detail-header"><div><p className="eyebrow">Enquiry snapshot</p><h1>{enquiry.reference}</h1><p>{new Intl.DateTimeFormat("en-ZM", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Lusaka" }).format(new Date(enquiry.createdAt))}</p></div><span className={`seller-state-badge state-${enquiry.status}`}>{statusLabel[enquiry.status]}</span></header>
      <div className="seller-enquiry-detail-grid">
        <section>
          <div className="seller-enquiry-snapshot-heading"><div><p className="eyebrow">What the buyer reviewed</p><h2>Item snapshot</h2></div><strong>{formatPrice(total)}</strong></div>
          <div className="seller-enquiry-lines">{enquiry.lines.map((line) => <article key={line.id}><span><SmartImage alt="" fill sizes="92px" src={line.image} /></span><div><strong>{line.title}</strong><small>{line.variantLabel} · Quantity {line.quantity}</small><em>{formatPrice(line.price)} each</em></div><b>{formatPrice(line.price * line.quantity)}</b></article>)}</div>
          {enquiry.buyerNote ? <div className="seller-buyer-note"><Icon name="whatsapp" size={19} /><div><strong>Context added to the enquiry</strong><p>{enquiry.buyerNote}</p></div></div> : null}
          <div className="seller-snapshot-integrity"><Icon name="shield" size={20} /><p>This snapshot keeps the title, option, price and image the buyer reviewed. Later catalog edits do not rewrite it.</p></div>
        </section>
        <aside className="seller-enquiry-followup">
          <p className="eyebrow">Follow-up</p><h2>Keep the conversation moving.</h2><a className="button whatsapp full" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`} onClick={() => setNotice("WhatsApp opened. Delivery of the message is not confirmed by SOKOZA.")} rel="noreferrer" target="_blank"><Icon name="whatsapp" size={19} /> Open WhatsApp</a>
          <label>Internal status<select onChange={(event) => { const status = event.target.value as SellerEnquiryStatus; setEnquiryStatus(enquiry.id, status); setNotice(`Follow-up state changed to ${statusLabel[status]}.`); }} value={enquiry.status}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <small>These states organize your follow-up. “Completed elsewhere” does not claim payment evidence.</small>
          <Link href="/seller/inventory">Update related inventory <Icon name="next" size={16} /></Link>
        </aside>
      </div>
      <section className="seller-enquiry-timeline"><p className="eyebrow">Evidence timeline</p><h2>What SOKOZA recorded</h2><ol>{enquiry.timeline.map((event) => <li key={event.id}><span /><div><strong>{event.label}</strong><time dateTime={event.at}>{new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lusaka" }).format(new Date(event.at))}</time></div></li>)}</ol></section>
    </div>
  );
}
