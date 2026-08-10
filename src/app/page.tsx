import Link from "next/link";
import type { Metadata } from "next";
import { catalogRepository } from "@/data/repository";
import { discoveryCollections, homeEditorialImage } from "@/data/editorial-data";
import { SmartImage } from "@/components/smart-image";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/section-heading";
import { ProductGrid } from "@/components/product-card";
import { DropCard } from "@/components/drop-card";
import { StoreCard } from "@/components/store-card";
import { LocalProductCollection } from "@/components/local-product-collection";
import { HomeRichSearch } from "@/components/home-rich-search";
import { MarketplaceMovingRail } from "@/components/marketplace-moving-rail";
import { EmptyState } from "@/components/empty-state";
import { selectHomeFeature } from "@/lib/home-feature";

export const revalidate = 60;
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [products, movingProducts, stores, drops] = await Promise.all([
    catalogRepository.listProducts(),
    catalogRepository.listMovingProducts(),
    catalogRepository.listStores(),
    catalogRepository.listDrops(),
  ]);
  const fresh = products.filter((product) => product.availability !== "sold").slice(0, 4);
  const madeHere = products.filter((product) => product.madeHere && product.availability !== "sold");
  const featureSelection = selectHomeFeature(products, movingProducts);
  const feature = featureSelection?.product;
  const featureStore = feature ? stores.find((store) => store.id === feature.storeId) : null;
  const marketplaceEmpty = products.length === 0 && stores.length === 0;

  return (
    <div className="page home-page flush-mobile">
      <section className="home-intro">
        <div className="home-intro-copy">
          <p className="eyebrow">Lusaka · current fashion</p>
          <h1>See what local stores are doing now.</h1>
          <p>
            Browse current pieces, compare the details that matter, then send one clear enquiry to
            the store on WhatsApp.
          </p>
          <HomeRichSearch />
        </div>
        <Link className="home-feature" href={feature ? `/products/${feature.slug}` : "/discover"}>
          <span className="home-feature-media">
            <SmartImage
              alt={feature ? `${feature.title}${featureStore ? `, available from ${featureStore.name}` : ""}` : "SOKOZA editorial fashion portrait"}
              fill
              priority
              sizes="(max-width: 760px) 100vw, 48vw"
              src={feature?.images[0] ?? homeEditorialImage}
            />
          </span>
            <div className="home-feature-caption">
              <span>{featureSelection?.label ?? "SOKOZA editorial"}</span>
              <strong>{feature?.title ?? "Local style, seen clearly"}</strong>
              <span>{feature ? "Explore the piece" : "Start discovering"}</span>
            </div>
          </Link>
      </section>

      {marketplaceEmpty ? (
        <EmptyState
          action="Sell on SOKOZA"
          body="The marketplace begins with real sellers and real inventory. No sample products are being shown while the first Stores prepare their collections."
          href="/sell"
          icon="store"
          title="Fresh local Stores are joining SOKOZA."
        />
      ) : null}

      <MarketplaceMovingRail products={movingProducts} stores={stores} />

      {fresh.length ? <section className="section">
        <SectionHeading
          body="Products whose availability was confirmed most recently."
          eyebrow="Current inventory"
          href="/discover?sort=fresh"
          title="Fresh Today"
        />
        <ProductGrid priorityCount={2} products={fresh} stores={stores} />
      </section> : null}

      {drops.length ? <section className="section">
        <SectionHeading
          body="Live collections from individual stores—no countdown theatre, just current pieces."
          eyebrow="Store launches"
          href="/discover#drops"
          title="Just Dropped"
        />
        <div className="horizontal-scroller">
          {drops.map((drop) => {
            const store = stores.find((item) => item.id === drop.storeId);
            return store ? <DropCard drop={drop} key={drop.id} store={store} /> : null;
          })}
        </div>
      </section> : null}

      {stores.length ? <section className="section">
        <SectionHeading
          body="Independent stores with a clear point of view and current inventory."
          eyebrow="Selected by SOKOZA"
          href="/stores"
          title="Stores to Know"
        />
        <div className="store-grid">
          {stores.slice(0, 2).map((store) => (
            <StoreCard key={store.id} products={products} store={store} />
          ))}
        </div>
      </section> : null}

      <section className="section">
        <SectionHeading
          body="Explore by visual mood when you know how you want it to feel—not exactly what to type."
          eyebrow="Deliberate discovery"
          href="/discover"
          title="Shop the Vibe"
        />
        <div className="vibe-grid">
          {discoveryCollections.map((collection, index) => (
            <Link
              className={`vibe-tile ${collection.tone} vibe-${index + 1}`}
              href={collection.href}
              key={collection.id}
            >
              <SmartImage alt="" fill sizes="(max-width: 760px) 100vw, 50vw" src={collection.image} />
              <span>{collection.subtitle}</span>
              <strong>{collection.title}</strong>
            </Link>
          ))}
        </div>
      </section>

      {madeHere.length ? <section className="section made-here-feature">
        <div className="made-here-copy">
          <p className="eyebrow">Made in Zambia</p>
          <h2>Made Here, worn your way.</h2>
          <p>
            Find small-run and made-to-order pieces from local makers. Every item is labelled from
            seller-provided production information.
          </p>
          <Link className="button secondary" href="/discover?madeHere=true">
            Explore Made Here <Icon name="next" size={18} />
          </Link>
        </div>
        <div className="made-here-products">
          <ProductGrid products={madeHere.slice(0, 2)} stores={stores} />
        </div>
      </section> : null}

      <section className="section">
        <SectionHeading
          eyebrow="Continue exploring"
          href="/recently-viewed"
          title="Recently Viewed"
        />
        <LocalProductCollection compactEmpty mode="recent" products={products} stores={stores} />
      </section>
    </div>
  );
}
