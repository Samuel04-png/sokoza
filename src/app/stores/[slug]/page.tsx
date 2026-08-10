import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicStorePage } from "@/components/public-store-page";
import { catalogRepository } from "@/data/repository";
import { absoluteUrl, safeJsonLd } from "@/lib/site";

interface StorePageProps { params: Promise<{ slug: string }>; }

export const revalidate = 60;

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await catalogRepository.getStoreBySlug(slug);
  return store ? {
    title: store.name,
    description: `${store.tagline} Shop current pieces on SOKOZA.`,
    alternates: { canonical: `/stores/${store.slug}` },
    openGraph: {
      type: "website",
      title: `${store.name} · SOKOZA`,
      description: store.description,
      url: `/stores/${store.slug}`,
      images: store.coverImage ? [{ url: store.coverImage, alt: `${store.name} Store` }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${store.name} · SOKOZA`,
      description: store.description,
      images: store.coverImage ? [store.coverImage] : [],
    },
  } : { title: "Store not found" };
}

export async function generateStaticParams() {
  const stores = await catalogRepository.listStores();
  return stores.map((store) => ({ slug: store.slug }));
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const [store, products, drops, allStores] = await Promise.all([catalogRepository.getStoreBySlug(slug), catalogRepository.listProducts(), catalogRepository.listDrops(), catalogRepository.listStores()]);
  if (!store) notFound();
  const storeUrl = absoluteUrl(`/stores/${store.slug}`);
  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${storeUrl}#store`,
    name: store.name,
    url: storeUrl,
    description: store.description,
    image: [store.coverImage, store.avatarImage].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      addressLocality: store.location,
      addressCountry: "ZM",
    },
    sameAs: Object.values(store.socialLinks ?? {}).filter(Boolean),
  };
  return <>
    <script
      dangerouslySetInnerHTML={{ __html: safeJsonLd(storeJsonLd) }}
      type="application/ld+json"
    />
    <PublicStorePage allStores={allStores} baseDrops={drops.filter((drop) => drop.storeId === store.id)} baseProducts={products.filter((product) => product.storeId === store.id)} baseStore={store} />
  </>;
}
