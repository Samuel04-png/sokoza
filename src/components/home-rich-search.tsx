"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RichDiscoverSearch } from "@/components/rich-discover-search";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { useOptionalMarketplaceSignals } from "@/components/marketplace-signals-provider";
import { productionDiscoverSuggestionSource } from "@/lib/discover-search";
import type { Drop, Product, Store } from "@/lib/types";

export function HomeRichSearch({
  drops,
  products,
  stores,
}: {
  drops: Drop[];
  products: Product[];
  stores: Store[];
}) {
  const router = useRouter();
  const { state } = useSellerStudio();
  const signals = useOptionalMarketplaceSignals();
  const [query, setQuery] = useState("");
  const currentProducts = [...products.filter((product) => product.storeId !== state.store.id), ...state.products.filter((product) => product.status === "published")];
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

  return (
    <RichDiscoverSearch
      containerClassName="home-rich-search"
      drops={drops}
      formClassName="hero-search"
      inputId="home-search"
      label="Search products and stores"
      onQueryChange={setQuery}
      onSearch={(cleanQuery) => { signals?.captureActivity("search_submitted"); router.push(`/discover?q=${encodeURIComponent(cleanQuery)}`); }}
      placeholder="Search real products, Stores, or size"
      products={currentProducts}
      query={query}
      stores={currentStores}
      suggestionSource={productionDiscoverSuggestionSource}
    />
  );
}
