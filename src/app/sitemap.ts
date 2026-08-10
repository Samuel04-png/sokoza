import type { MetadataRoute } from "next";
import { catalogRepository } from "@/data/repository";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, stores, drops] = await Promise.all([
    catalogRepository.listProducts(),
    catalogRepository.listStores(),
    catalogRepository.listDrops(),
  ]);
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/discover"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/stores"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/sell"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/help"), changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/safety"), changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];
  return [
    ...staticPages,
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: new Date(product.confirmedAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
      images: product.images.filter(Boolean),
    })),
    ...stores.map((store) => ({
      url: absoluteUrl(`/stores/${store.slug}`),
      lastModified: new Date(store.joinedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: [store.coverImage, store.avatarImage].filter(Boolean),
    })),
    ...drops.map((drop) => ({
      url: absoluteUrl(`/drops/${drop.slug}`),
      lastModified: new Date(drop.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      images: drop.coverImage ? [drop.coverImage] : [],
    })),
  ];
}
