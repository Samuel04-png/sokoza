import { Icon } from "@/components/icon";
import { sellerVerificationRepository } from "@/data/seller-repository";

export default async function SellerVerificationPage() {
  const items = await sellerVerificationRepository.listCurrent();
  return (
    <div className="seller-page">
      <header className="seller-page-header"><div><p className="eyebrow">Specific trust checks</p><h1>Verification status.</h1><p>Each label says exactly what SOKOZA checked. Verification never guarantees products, payment, or fulfilment.</p></div></header>
      <section className="seller-verification-summary" aria-label="Verification summary"><Icon name="shield" size={28} /><div><strong>{items.filter((item) => item.state === "verified").length} of {items.length} checks current</strong><p>Only reviewed checks become public Store labels.</p></div></section>
      <div className="seller-verification-list">
        {items.map((item) => (
          <article key={item.id}>
            <div className={`seller-verification-icon state-${item.state}`}><Icon name={item.state === "verified" ? "tick" : "alert"} size={20} /></div>
            <div><span>{item.label}</span><h2>{item.state.replace("_", " ")}</h2><p>{item.detail}</p>{item.publicLabel ? <small>Public label: “{item.publicLabel}”</small> : null}</div>
            <time dateTime={item.checkedAt}>{item.checkedAt ? new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeZone: "Africa/Lusaka" }).format(new Date(item.checkedAt)) : "Not checked"}</time>
          </article>
        ))}
      </div>
      <section className="seller-verification-note"><h2>When an update is required</h2><p>SOKOZA shows the reason category, what evidence can be resubmitted, and what remains editable. Private documents are never returned by public Store queries.</p></section>
    </div>
  );
}
