"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { AccessibleDialog } from "@/components/accessible-dialog";
import { Icon } from "@/components/icon";
import { ProductGrid } from "@/components/product-card";
import { useSellerStudio } from "@/components/seller-studio-provider";
import {
  buildDiscoverHref,
  defaultDiscoverFilters,
  filterAndSortProducts,
  findMatchingStores,
  type DiscoverFilters,
  type DiscoverResultTab,
  type FulfilmentFilter,
} from "@/lib/discover-search";
import type { Condition, Product, Store } from "@/lib/types";

const resultTabs: Array<{ id: DiscoverResultTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "pieces", label: "Pieces" },
  { id: "stores", label: "Stores" },
];

export function SearchResults({
  products,
  stores,
  initial,
}: {
  products: Product[];
  stores: Store[];
  initial: DiscoverFilters;
}) {
  const { state } = useSellerStudio();
  const currentProducts = useMemo(() => [...products.filter((product) => product.storeId !== state.store.id), ...state.products.filter((product) => product.status === "published")], [products, state.products, state.store.id]);
  const currentStores = useMemo(() => stores.map((store) => store.id === state.store.id ? { ...store, name: state.store.name, tagline: state.store.tagline, description: state.store.description, location: `${state.store.area}, ${state.store.city}`, coverImage: state.store.coverImage, avatarImage: state.store.avatarImage, categories: state.store.categories, status: state.store.operatingState === "published" ? "active" as const : "temporarily_closed" as const } : store), [state.store, stores]);
  const [filters, setFilters] = useState<DiscoverFilters>(initial);
  const [filterOpen, setFilterOpen] = useState(false);
  const results = useMemo(
    () => filterAndSortProducts(currentProducts, currentStores, filters),
    [filters, currentProducts, currentStores],
  );
  const matchedStores = useMemo(
    () => findMatchingStores(currentStores, filters),
    [filters, currentStores],
  );
  const allSizes = useMemo(
    () =>
      Array.from(
        new Set(currentProducts.flatMap((product) => product.variants.map((item) => item.label))),
      ),
    [currentProducts],
  );
  const allCategories = useMemo(
    () => Array.from(new Set(currentProducts.map((product) => product.category))).sort(),
    [currentProducts],
  );
  const allColors = useMemo(
    () => Array.from(new Set(currentProducts.map((product) => product.color))).sort(),
    [currentProducts],
  );
  const allLocations = useMemo(
    () => Array.from(new Set(currentStores.flatMap((store) => [store.location, ...store.serviceAreas]))).sort(),
    [currentStores],
  );
  const resultHref = buildDiscoverHref(filters);

  useEffect(() => {
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== resultHref) window.history.replaceState(null, "", resultHref);
  }, [resultHref]);

  const activeChips = [
    filters.category && { key: "category", label: filters.category },
    filters.vibe && { key: "vibe", label: filters.vibe },
    filters.occasion && { key: "occasion", label: filters.occasion },
    filters.madeHere && { key: "madeHere", label: "Made Here" },
    filters.maxPrice !== undefined && { key: "maxPrice", label: `Up to K${filters.maxPrice}` },
    filters.minPrice !== undefined && { key: "minPrice", label: `From K${filters.minPrice}` },
    ...filters.sizes.map((size) => ({ key: `size:${size}`, label: `Size ${size}` })),
    ...filters.conditions.map((condition) => ({ key: `condition:${condition}`, label: condition })),
    ...filters.colors.map((color) => ({ key: `color:${color}`, label: color })),
    ...filters.storeIds.map((storeId) => ({
      key: `store:${storeId}`,
      label: currentStores.find((store) => store.id === storeId)?.name ?? "Store",
    })),
    ...filters.locations.map((location) => ({ key: `location:${location}`, label: location })),
    ...filters.fulfilment.map((method) => ({
      key: `fulfilment:${method}`,
      label: method === "collection" ? "Collection" : "Delivery",
    })),
    !filters.availabilityOnly && { key: "availabilityOnly", label: "Including unavailable" },
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  function toggleList<Key extends "sizes" | "conditions" | "colors" | "storeIds" | "locations" | "fulfilment">(
    key: Key,
    value: DiscoverFilters[Key][number],
    checked: boolean,
  ) {
    setFilters((current) => ({
      ...current,
      [key]: checked
        ? [...current[key], value]
        : current[key].filter((item) => item !== value),
    }));
  }

  function clearChip(key: string) {
    const listKeys = ["size", "condition", "color", "store", "location", "fulfilment"] as const;
    const listKey = listKeys.find((prefix) => key.startsWith(`${prefix}:`));
    if (listKey) {
      const stateKey = {
        size: "sizes",
        condition: "conditions",
        color: "colors",
        store: "storeIds",
        location: "locations",
        fulfilment: "fulfilment",
      }[listKey] as "sizes" | "conditions" | "colors" | "storeIds" | "locations" | "fulfilment";
      const value = key.slice(listKey.length + 1);
      setFilters((current) => ({
        ...current,
        [stateKey]: current[stateKey].filter((item) => item !== value),
      }));
    } else if (key === "availabilityOnly") {
      setFilters((current) => ({ ...current, availabilityOnly: true }));
    } else {
      setFilters((current) => ({
        ...current,
        [key]: key === "madeHere" ? false : undefined,
      }));
    }
  }

  function clearFilters(keepQuery = true) {
    const defaults = defaultDiscoverFilters();
    setFilters({ ...defaults, q: keepQuery ? filters.q : "", tab: filters.tab });
  }

  const filterContent = (
    <div className="filter-groups">
      <fieldset>
        <legend>Availability</legend>
        <label>
          <input
            checked={filters.availabilityOnly}
            onChange={(event) =>
              setFilters((current) => ({ ...current, availabilityOnly: event.target.checked }))
            }
            type="checkbox"
          />
          Available to enquire
        </label>
      </fieldset>
      <fieldset>
        <legend>Category</legend>
        <label>
          <input
            checked={!filters.category}
            name="category"
            onChange={() => setFilters((current) => ({ ...current, category: "" }))}
            type="radio"
          />
          All categories
        </label>
        {allCategories.map((category) => (
          <label key={category}>
            <input
              checked={filters.category === category}
              name="category"
              onChange={() => setFilters((current) => ({ ...current, category }))}
              type="radio"
            />
            {category}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Size</legend>
        <div className="filter-size-grid">
          {allSizes.map((size) => (
            <label key={size}>
              <input
                checked={filters.sizes.includes(size)}
                onChange={(event) => toggleList("sizes", size, event.target.checked)}
                type="checkbox"
              />
              {size}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Condition</legend>
        {(["New", "Like new", "Good", "Made to order"] as Condition[]).map((condition) => (
          <label key={condition}>
            <input
              checked={filters.conditions.includes(condition)}
              onChange={(event) => toggleList("conditions", condition, event.target.checked)}
              type="checkbox"
            />
            {condition}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Color</legend>
        {allColors.map((color) => (
          <label key={color}>
            <input
              checked={filters.colors.includes(color)}
              onChange={(event) => toggleList("colors", color, event.target.checked)}
              type="checkbox"
            />
            {color}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Store</legend>
        {currentStores.map((store) => (
          <label key={store.id}>
            <input
              checked={filters.storeIds.includes(store.id)}
              onChange={(event) => toggleList("storeIds", store.id, event.target.checked)}
              type="checkbox"
            />
            {store.name}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Location</legend>
        {allLocations.map((location) => (
          <label key={location}>
            <input
              checked={filters.locations.includes(location)}
              onChange={(event) => toggleList("locations", location, event.target.checked)}
              type="checkbox"
            />
            {location}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Fulfilment</legend>
        {(["collection", "delivery"] as FulfilmentFilter[]).map((method) => (
          <label key={method}>
            <input
              checked={filters.fulfilment.includes(method)}
              onChange={(event) => toggleList("fulfilment", method, event.target.checked)}
              type="checkbox"
            />
            {method === "collection" ? "Collection" : "Delivery"}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Price</legend>
        <div className="filter-price-grid">
          <label>
            Minimum (K)
            <input
              inputMode="numeric"
              min="0"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  minPrice: event.target.value === "" ? undefined : Number(event.target.value),
                }))
              }
              type="number"
              value={filters.minPrice ?? ""}
            />
          </label>
          <label>
            Maximum (K)
            <input
              inputMode="numeric"
              min="0"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  maxPrice: event.target.value === "" ? undefined : Number(event.target.value),
                }))
              }
              type="number"
              value={filters.maxPrice ?? ""}
            />
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Local production</legend>
        <label>
          <input
            checked={filters.madeHere}
            onChange={(event) =>
              setFilters((current) => ({ ...current, madeHere: event.target.checked }))
            }
            type="checkbox"
          />
          Made Here
        </label>
      </fieldset>
    </div>
  );

  const showPieces = filters.tab !== "stores";
  const showStores = filters.tab !== "pieces";
  const totalResults = results.length + matchedStores.length;

  return (
    <>
      <form action="/discover" className="results-search" role="search">
        <Icon name="search" />
        <label className="sr-only" htmlFor="results-query">
          Search current products and stores in Discover
        </label>
        <input
          id="results-query"
          name="q"
          onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
          placeholder="Search products and stores"
          value={filters.q}
        />
        <button className="button primary" type="submit">
          Search
        </button>
      </form>
      <div className="results-toolbar">
        <div>
          <p>
            {results.length} {results.length === 1 ? "piece" : "pieces"} · {matchedStores.length}{" "}
            {matchedStores.length === 1 ? "store" : "stores"}
          </p>
          {filters.q ? (
            <h1>{totalResults} {totalResults === 1 ? "match" : "matches"} for “{filters.q}”</h1>
          ) : activeChips.length ? (
            <h1>{totalResults} filtered {totalResults === 1 ? "match" : "matches"}</h1>
          ) : <h1>Discover current pieces and Stores</h1>}
        </div>
        <div className="results-controls">
          <button
            className="button secondary filter-trigger"
            onClick={() => setFilterOpen(true)}
            type="button"
          >
            <Icon name="filter" size={18} /> Filters{activeChips.length ? ` (${activeChips.length})` : ""}
          </button>
          <label className="sort-control">
            <Icon name="sort" size={18} />
            <span className="sr-only">Sort results</span>
            <select
              onChange={(event) =>
                setFilters((current) => ({ ...current, sort: event.target.value }))
              }
              value={filters.sort}
            >
              <option value="recommended">Recommended</option>
              <option value="fresh">Availability recently confirmed</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </label>
        </div>
      </div>

      <div aria-label="Result type" className="result-tabs" role="tablist">
        {resultTabs.map((tab) => (
          <button
            aria-selected={filters.tab === tab.id}
            className={filters.tab === tab.id ? "active" : undefined}
            key={tab.id}
            onClick={() => setFilters((current) => ({ ...current, tab: tab.id }))}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeChips.length ? (
        <div aria-label="Applied filters" className="applied-filters">
          {activeChips.map((chip) => (
            <button key={chip.key} onClick={() => clearChip(chip.key)} type="button">
              {chip.label} <Icon name="close" size={15} />
            </button>
          ))}
          <button className="clear-all" onClick={() => clearFilters()} type="button">
            Clear all filters
          </button>
        </div>
      ) : null}

      {showStores && matchedStores.length > 0 ? (
        <section className="matched-stores">
          <p className="eyebrow">Matching stores</p>
          <div>
            {matchedStores.map((store) => (
              <Link href={`/stores/${store.slug}`} key={store.id}>
                <Icon name="store" />
                <span>
                  <strong>{store.name}</strong>
                  <small>{store.tagline}</small>
                </span>
                <Icon name="next" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {filters.tab === "stores" && matchedStores.length === 0 ? (
        <EmptyState
          action="Browse Discover"
          body="Try a store name, category, or location, or return to the visual collections."
          href="/discover"
          icon="store"
          title="No stores match yet"
        />
      ) : null}

      {showPieces ? (
        <div className="results-layout">
          <aside aria-label="Product filters" className="filter-sidebar">
            <div className="filter-sidebar-heading">
              <h2>Filters</h2>
              <span>{results.length} {results.length === 1 ? "result" : "results"}</span>
            </div>
            {filterContent}
          </aside>
          <div>
            {results.length ? (
              <ProductGrid priorityCount={4} products={results} stores={currentStores} />
            ) : matchedStores.length === 0 || filters.tab === "pieces" ? (
              <div className="no-results-recovery">
                <EmptyState
                  action="Browse Discover"
                  body={activeChips.length ? `Nothing current matches ${activeChips.map((chip) => chip.label).join(", ")}. Remove one constraint or clear the filters to widen the catalog.` : filters.q ? `No current piece matches “${filters.q}”. Check the spelling, try a category or Store name, or browse all current pieces.` : "No current pieces match these constraints. Remove one filter or browse the visual collections."}
                  href="/discover"
                  icon="search"
                  title="No current pieces match"
                />
                <button className="button secondary" onClick={() => clearFilters(false)} type="button">
                  Clear query and filters
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {filterOpen ? (
        <AccessibleDialog
          className="sheet filter-sheet"
          labelledBy="filter-title"
          onClose={() => setFilterOpen(false)}
        >
          <div className="sheet-handle" />
          <div className="sheet-heading">
            <div>
              <p className="eyebrow">Narrow the catalog</p>
              <h2 id="filter-title">Filters</h2>
            </div>
            <button
              aria-label="Close filters"
              className="icon-button"
              onClick={() => setFilterOpen(false)}
              type="button"
            >
              <Icon name="close" />
            </button>
          </div>
          {filterContent}
          <div className="sheet-actions">
            <button className="button quiet" onClick={() => clearFilters()} type="button">
              Clear filters
            </button>
            <button className="button primary" onClick={() => setFilterOpen(false)} type="button">
              Show {totalResults} {totalResults === 1 ? "result" : "results"}
            </button>
          </div>
        </AccessibleDialog>
      ) : null}
    </>
  );
}
