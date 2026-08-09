import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import { sellerEditorialImage } from "@/data/editorial-data";
import { catalogRepository } from "@/data/repository";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Sell on SOKOZA" };

export default async function SellPage() {
  const [products, stores] = await Promise.all([
    catalogRepository.listProducts(),
    catalogRepository.listStores(),
  ]);
  const proofProduct = products.find((product) => product.availability !== "sold");
  const proofStore = proofProduct ? stores.find((store) => store.id === proofProduct.storeId) : undefined;
  return (
    <div className="sell-page">
      <section className="sell-hero">
        <div className="sell-hero-copy">
          <p className="eyebrow">Built for independent fashion stores</p>
          <h1>Your Store. Your pieces. Your WhatsApp.</h1>
          <p>Publish a clear local fashion Store, keep availability trustworthy and receive prepared product enquiries—without replacing the customer relationship you already own.</p>
          <div className="sell-hero-actions">
            <Link className="button primary" href="/sell/sign-up">Start your Store</Link>
            <Link className="button secondary" href="/seller/sign-in">Sign in</Link>
          </div>
          <div className="sell-hero-proof"><Icon name="shield" size={19} /><span><strong>You keep the customer relationship.</strong> Payment and fulfilment stay between your Store and the buyer.</span></div>
        </div>
        <div className="sell-hero-visual">
          <div className="sell-hero-cover"><SmartImage alt={proofProduct ? `${proofProduct.title}, a current product on SOKOZA` : "Independent fashion creative presenting a current collection"} fill priority sizes="(max-width: 899px) 100vw, 50vw" src={proofProduct?.images[0] ?? sellerEditorialImage} /></div>
          <div className="sell-real-proof">
            <span>Buyer view · real catalog</span>
            <strong>{proofProduct?.title ?? "Your current piece"}</strong>
            <small>{proofStore?.name ?? "Your Store"}{proofProduct ? ` · ${formatPrice(proofProduct.price)}` : ""}</small>
            <p>Size, price, image and Store link travel together into the prepared WhatsApp enquiry.</p>
          </div>
        </div>
      </section>

      <section className="sell-setup-proof" aria-label="Seller setup commitment">
        <strong>6 guided setup steps</strong><span>Account</span><span>Store</span><span>WhatsApp</span><span>Selling</span><span>First product</span><span>Preview</span><em>Progress is saved. Publishing is deliberate.</em>
      </section>

      <section className="sell-value-section">
        <div className="sell-section-intro"><p className="eyebrow">A more useful shop window</p><h2>More clarity before the chat starts.</h2><p>Seller Studio handles the repetitive product details, so WhatsApp can focus on confirmation and service.</p></div>
        <div className="sell-value-grid">
          {[
            ["image", "Show the actual piece", "Photos, size, condition, price and details travel together from discovery to enquiry."],
            ["refresh", "Stay current in minutes", "Confirm Available, Low or Sold one piece at a time—or review a safe bulk update."],
            ["whatsapp", "Receive prepared intent", "Each seller receives a separate enquiry with item, option, quantity and price snapshots."],
            ["view", "Learn what draws interest", "See store views, product views, saves and WhatsApp opens with honest definitions."],
          ].map(([icon, title, body], index) => (
            <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><Icon name={icon as "image"} /><h3>{title}</h3><p>{body}</p></article>
          ))}
        </div>
      </section>

      <section className="sell-flow-section">
        <div className="sell-section-intro"><p className="eyebrow">From setup to buyer conversation</p><h2>One continuous workflow.</h2></div>
        <ol>
          <li><span>01</span><div><h3>Shape your Store</h3><p>Add identity, fulfilment, policies and the WhatsApp number buyers will contact.</p></div></li>
          <li><span>02</span><div><h3>Publish real products</h3><p>Create structured listings and preview exactly how buyers will meet them.</p></div></li>
          <li><span>03</span><div><h3>Keep stock honest</h3><p>Use the freshness workspace to confirm current availability without opening every listing.</p></div></li>
          <li><span>04</span><div><h3>Follow prepared enquiries</h3><p>Review immutable item snapshots, open WhatsApp and track your own follow-up state.</p></div></li>
        </ol>
      </section>

      <section className="sell-standard-section">
        <div><p className="eyebrow">The SOKOZA standard</p><h2>Trust is part of the merchandising.</h2><p>Stores publish actual-item photography, current prices and clear fulfilment expectations. Verification labels say only what SOKOZA checked; they never promise product quality or payment safety.</p></div>
        <ul>
          <li><Icon name="tick" size={18} /> Real product imagery</li>
          <li><Icon name="tick" size={18} /> Current availability</li>
          <li><Icon name="tick" size={18} /> Clear collection and delivery wording</li>
          <li><Icon name="tick" size={18} /> Direct seller-owned WhatsApp relationship</li>
        </ul>
      </section>

      <section className="sell-faq-section">
        <div className="sell-section-intro"><p className="eyebrow">Before you begin</p><h2>Good questions.</h2></div>
        <div>{[
          ["Does SOKOZA take payment?", "Not in the initial marketplace. Buyers review one seller at a time, then payment and fulfilment are agreed directly with that Store."],
          ["Do I need the WhatsApp Business API?", "No. Seller Studio prepares a clear deep link for the MVP, so your existing WhatsApp number remains the handoff point."],
          ["Can I pause my Store?", "Yes. Pausing is reversible. Your public context remains visible while new enquiry actions are unavailable."],
          ["What can I see in Insights?", "Only signals SOKOZA can support: views, saves, review starts, WhatsApp opens and buyer-marked sent. These are not represented as completed sales."],
        ].map(([question, answer]) => <details key={question}><summary>{question}<Icon name="down" size={18} /></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="sell-final-cta"><p className="eyebrow">Your next collection deserves a clear home</p><h2>Open your Seller Studio.</h2><p>Start with your Store identity, then publish the first piece when it’s ready.</p><div><Link className="button primary" href="/sell/sign-up">Start your Store</Link><Link className="text-link" href="/seller/sign-in">Already selling? Sign in</Link></div></section>
    </div>
  );
}
