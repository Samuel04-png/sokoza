"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { RichDiscoverSearch } from "@/components/rich-discover-search";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { useOptionalMarketplaceSignals } from "@/components/marketplace-signals-provider";
import { productionDiscoverSuggestionSource, type DiscoverSuggestionSource } from "@/lib/discover-search";
import type { Drop, Product, Store } from "@/lib/types";

const SEARCH_KEY = "sokoza-recent-searches-v1";

interface SearchLandingProps {
  children: ReactNode;
  drops: Drop[];
  initialMode?: boolean;
  products: Product[];
  stores: Store[];
  suggestionSource?: DiscoverSuggestionSource;
}

export function SearchLanding({
  children,
  drops,
  initialMode = false,
  products,
  stores,
  suggestionSource = productionDiscoverSuggestionSource,
}: SearchLandingProps) {
  const router = useRouter();
  const { state } = useSellerStudio();
  const signals = useOptionalMarketplaceSignals();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState(initialMode);
  const currentProducts = [
    ...products.filter((product) => product.storeId !== state.store.id),
    ...state.products.filter((product) => product.status === "published"),
  ];
  const currentStores = stores.map((store) => store.id === state.store.id ? {
    ...store,
    name: state.store.name,
    tagline: state.store.tagline,
    description: state.store.description,
    location: `${state.store.area}, ${state.store.city}`,
    coverImage: state.store.coverImage,
    avatarImage: state.store.avatarImage,
    categories: state.store.categories,
    status: state.store.operatingState === "published" ? "active" as const : "temporarily_closed" as const,
  } : store);

  useEffect(() => {
    let stored: string[] = [];
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(SEARCH_KEY) ?? "[]");
      stored = Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string").slice(0, 6)
        : [];
    } catch {}
    queueMicrotask(() => setRecent(stored));
  }, []);

  function runSearch(cleanQuery: string) {
    const clean = cleanQuery.trim();
    if (!clean) return;
    const next = [
      clean,
      ...recent.filter((item) => item.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(SEARCH_KEY, JSON.stringify(next));
    } catch {
      // Discovery still works when local storage is unavailable.
    }
    signals?.captureActivity("search_submitted");
    router.push(`/discover?q=${encodeURIComponent(clean)}`);
  }

  return (
    <div className="search-landing">
      <RichDiscoverSearch
        autoFocus={initialMode}
        containerClassName="discover-rich-search"
        drops={drops}
        formClassName="search-box large"
        inputId="discover-search"
        label="Search products and stores in Discover"
        onFocus={() => setSearchMode(true)}
        onQueryChange={setQuery}
        onSearch={runSearch}
        placeholder="Product, store, color, size, vibe…"
        products={currentProducts}
        query={query}
        rowClassName="discover-search-row"
        stores={currentStores}
        submitClassName="button primary"
        suggestionSource={suggestionSource}
        trailingAction={searchMode ? (
          <button
            className="text-button discover-search-cancel"
            onClick={() => {
              setQuery("");
              setSearchMode(false);
              window.history.replaceState(null, "", "/discover");
            }}
            type="button"
          >
            Browse
          </button>
        ) : null}
      />

      {searchMode && !query ? (
        <div className="search-start-grid">
          <section>
            <div className="search-section-heading">
              <h2>Recent searches</h2>
              {recent.length ? (
                <button
                  className="text-button"
                  onClick={() => {
                    setRecent([]);
                    localStorage.removeItem(SEARCH_KEY);
                  }}
                  type="button"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {recent.length ? (
              <div className="query-list">
                {recent.map((item) => (
                  <Link href={`/discover?q=${encodeURIComponent(item)}`} key={item}>
                    <Icon name="clock" size={18} /> {item}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">Your recent searches will stay on this device.</p>
            )}
          </section>
          <section>
            <h2>Try these</h2>
            <div className="query-list">
              <Link href="/discover?category=Dresses">Dresses</Link>
              <Link href="/discover?category=Sneakers">Sneakers</Link>
              <Link href="/discover?madeHere=true">Made Here</Link>
              <Link href="/discover?maxPrice=500">Under K500</Link>
            </div>
          </section>
          <section>
            <h2>Stores to find</h2>
            <div className="query-list">
              {currentStores.slice(0, 4).map((store) => (
                <Link href={`/stores/${store.slug}`} key={store.id}>
                  <Icon name="store" size={18} /> {store.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      ) : !searchMode ? (
        <div className="discover-browse-content">{children}</div>
      ) : null}
    </div>
  );
}
