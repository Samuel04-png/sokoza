"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RichDiscoverSearch } from "@/components/rich-discover-search";
import { useSellerStudio } from "@/components/seller-studio-provider";
import { useOptionalMarketplaceSignals } from "@/components/marketplace-signals-provider";
import { productionDiscoverSuggestionSource } from "@/lib/discover-search";
import type { Drop, Product, Store } from "@/lib/types";

interface HomeRichSearchProps {
  drops?: Drop[];
  products?: Product[];
  stores?: Store[];
}

export function HomeRichSearch({ drops = [], products = [], stores = [] }: HomeRichSearchProps = {}) {
  const router = useRouter();
  const { state } = useSellerStudio();
  const signals = useOptionalMarketplaceSignals();
  const [query, setQuery] = useState("");
  const currentProducts = [
    ...products.filter((product) => product.storeId !== state.store.id),
    ...state.products.filter((product) => product.status === "published"),
  ];
  const currentStores = state.store.operatingState === "published" ? [...stores.filter((store) => store.id !== state.store.id), {
    id: state.store.id,
    slug: state.store.slug,
    name: state.store.name,
    tagline: state.store.tagline,
    description: state.store.description,
    location: `${state.store.area}, ${state.store.city}`,
    coverImage: state.store.coverImage,
    avatarImage: state.store.avatarImage,
    categories: state.store.categories,
    status: "active" as const,
    serviceAreas: [state.store.city].filter(Boolean),
    whatsapp: state.store.whatsapp,
    verification: [],
    joinedAt: new Date(0).toISOString(),
    fulfilment: {
      collection: state.store.collection,
      delivery: state.store.delivery,
      exchanges: state.store.exchanges,
    },
  }] : stores;

  return (
    <RichDiscoverSearch
      containerClassName="home-rich-search"
      drops={drops}
      formClassName="hero-search"
      inputId="home-search"
      label="Search products and stores"
      onQueryChange={setQuery}
      onSearch={(cleanQuery) => { signals?.captureActivity("search_submitted"); router.push(`/discover?q=${encodeURIComponent(cleanQuery)}`); }}
      placeholder="Search SOKOZA"
      products={currentProducts}
      query={query}
      stores={currentStores}
      suggestionSource={productionDiscoverSuggestionSource}
    />
  );
}
