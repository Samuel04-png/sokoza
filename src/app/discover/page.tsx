import Link from "next/link";
import type { Metadata } from "next";
import { catalogRepository } from "@/data/repository";
import { discoveryCollections } from "@/data/editorial-data";
import { SmartImage } from "@/components/smart-image";
import { ProductGrid } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { DropCard } from "@/components/drop-card";
import { StoreCard } from "@/components/store-card";
import { SearchLanding } from "@/components/search-landing";
import { SearchResults } from "@/components/search-results";
import {
  defaultDiscoverFilters,
  type DiscoverFilters,
  type DiscoverResultTab,
  type FulfilmentFilter,
} from "@/lib/discover-search";
import type { Condition } from "@/lib/types";
import { MarketplaceMovingRail } from "@/components/marketplace-moving-rail";
import { EmptyState } from "@/components/empty-state";
import { buildCurrentReleases } from "@/lib/discovery-sections";
import { PRODUCT_CATEGORIES } from "@/lib/product-taxonomy";

export const metadata: Metadata = { title: "Discover" };

const categories = PRODUCT_CATEGORIES;
const occasions = ["Everyday", "Work", "Weekend", "Dinner", "Event"];
const resultKeys = new Set([
  "q",
  "category",
  "vibe",
  "occasion",
  "madeHere",
  "minPrice",
  "maxPrice",
  "sort",
  "availability",
  "size",
  "condition",
  "color",
  "store",
  "location",
  "fulfilment",
  "tab",
]);
const conditions: Condition[] = ["New", "Like new", "Good", "Made to order"];
const resultTabs: DiscoverResultTab[] = ["all", "pieces", "stores"];
const fulfilmentMethods: FulfilmentFilter[] = ["collection", "delivery"];

interface DiscoverPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";
const many = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);
const number = (value: string | string[] | undefined) => {
  const parsed = Number(one(value));
  return Number.isFinite(parsed) && one(value) !== "" ? parsed : undefined;
};

function filtersFromParams(params: Record<string, string | string[] | undefined>): DiscoverFilters {
  const defaults = defaultDiscoverFilters();
  const tab = one(params.tab);
  return {
    ...defaults,
    q: one(params.q),
    category: one(params.category),
    vibe: one(params.vibe),
    occasion: one(params.occasion),
    madeHere: one(params.madeHere) === "true",
    minPrice: number(params.minPrice),
    maxPrice: number(params.maxPrice),
    sort: one(params.sort) || defaults.sort,
    availabilityOnly: one(params.availability) !== "all",
    sizes: many(params.size),
    conditions: many(params.condition).filter((item): item is Condition =>
      conditions.includes(item as Condition),
    ),
    colors: many(params.color),
    storeIds: many(params.store),
    locations: many(params.location),
    fulfilment: many(params.fulfilment).filter((item): item is FulfilmentFilter =>
      fulfilmentMethods.includes(item as FulfilmentFilter),
    ),
    tab: resultTabs.includes(tab as DiscoverResultTab)
      ? (tab as DiscoverResultTab)
      : defaults.tab,
  };
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = await searchParams;
  const searchQuery = one(params.q).trim();
  const [products, movingProducts, stores, drops] = await Promise.all([
    searchQuery ? catalogRepository.searchProducts(searchQuery) : catalogRepository.listProducts(),
    catalogRepository.listMovingProducts(),
    searchQuery ? catalogRepository.searchStores(searchQuery) : catalogRepository.listStores(),
    catalogRepository.listDrops(),
  ]);
  const showResults = Object.keys(params).some((key) => resultKeys.has(key));
  const currentReleases = buildCurrentReleases(drops, products, stores);
  const madeHereProducts = products.filter((product) => product.madeHere).slice(0, 4);

  return (
    <div className={`page ${showResults ? "results-page" : ""}`}>
      {!showResults ? (
        <header className="page-header discover-header">
          <div>
            <p className="eyebrow">Explore with intent</p>
            <h1>Discover</h1>
            <p>Search or browse by mood, category, occasion, price, store, or the people making it here.</p>
          </div>
        </header>
      ) : null}

      {showResults ? (
        <SearchResults initial={filtersFromParams(params)} products={products} stores={stores} />
      ) : (
        <SearchLanding
          drops={drops}
          initialMode={one(params.mode) === "search"}
          products={products}
          stores={stores}
        >
          {products.length === 0 && stores.length === 0 ? (
            <EmptyState
              body="Real pieces will appear as sellers publish eligible inventory. Try again soon or begin a Store of your own."
              icon="discover"
              title="No pieces here yet."
            />
          ) : null}
          <section>
            <SectionHeading eyebrow="Start with a feeling" title="Shop by Vibe" />
            <div className="vibe-grid discover-vibes">
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

          <MarketplaceMovingRail products={movingProducts} stores={stores} />

          <section className="section explore-links-section">
            <div>
              <SectionHeading eyebrow="Find the piece" title="Categories" />
              <div className="explore-links">
                {categories.map((category) => (
                  <Link href={`/discover?category=${encodeURIComponent(category)}`} key={category}>
                    {category}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading eyebrow="Dress for it" title="Occasions" />
              <div className="explore-links">
                {occasions.map((occasion) => (
                  <Link href={`/discover?occasion=${encodeURIComponent(occasion)}`} key={occasion}>
                    {occasion}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading eyebrow="Stay within it" title="Price" />
              <div className="explore-links">
                <Link href="/discover?maxPrice=400">Under K400</Link>
                <Link href="/discover?minPrice=400&maxPrice=700">K400–K700</Link>
                <Link href="/discover?minPrice=700">K700 and above</Link>
              </div>
            </div>
          </section>

          <section className="section" id="drops">
            <SectionHeading
              body="Live collections grouped by each store. Ordering remains seller-specific."
              eyebrow="Current releases"
              title="Drops"
            />
            <div className="horizontal-scroller">
              {currentReleases.map((release) => {
                const store = stores.find((item) => item.id === release.drop.storeId);
                return store ? <DropCard automatic={release.automatic} drop={release.drop} href={release.href} key={release.drop.id} store={store} /> : null;
              })}
            </div>
          </section>

          <section className="section">
            <SectionHeading
              eyebrow="Designed or made locally"
              href="/discover?madeHere=true"
              title="Made Here"
            />
            {madeHereProducts.length ? <ProductGrid products={madeHereProducts} stores={stores} /> : <EmptyState action="Browse current pieces" body="No seller has confirmed local production for a current product yet. SOKOZA will not guess where an item was made." href="/discover?sort=fresh" icon="store" title="Made Here details are awaiting confirmation." />}
          </section>

          <section className="section">
            <SectionHeading eyebrow="Find your next store" href="/stores" title="More Stores" />
            <div className="store-grid">
              {stores.slice(0, 4).map((store) => (
                <StoreCard key={store.id} products={products} store={store} />
              ))}
            </div>
          </section>
        </SearchLanding>
      )}
    </div>
  );
}
