import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicStorePage } from "@/components/public-store-page";
import { catalogRepository } from "@/data/repository";

interface StorePageProps { params: Promise<{ slug: string }>; }

export const revalidate = 60;

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await catalogRepository.getStoreBySlug(slug);
  return store ? { title: store.name, description: `${store.tagline} Shop current pieces on SOKOZA.` } : { title: "Store not found" };
}

export async function generateStaticParams() {
  const stores = await catalogRepository.listStores();
  return stores.map((store) => ({ slug: store.slug }));
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const [store, products, drops, allStores] = await Promise.all([catalogRepository.getStoreBySlug(slug), catalogRepository.listProducts(), catalogRepository.listDrops(), catalogRepository.listStores()]);
  if (!store) notFound();
  return <PublicStorePage allStores={allStores} baseDrops={drops.filter((drop) => drop.storeId === store.id)} baseProducts={products.filter((product) => product.storeId === store.id)} baseStore={store} />;
}
