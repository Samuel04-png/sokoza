import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogRepository } from "@/data/repository";
import { SmartImage } from "@/components/smart-image";
import { ProductGrid } from "@/components/product-card";
import { formatDate } from "@/lib/format";
import { absoluteUrl, safeJsonLd } from "@/lib/site";

interface DropPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: DropPageProps): Promise<Metadata> {
  const { slug } = await params;
  const drop = await catalogRepository.getDropBySlug(slug);
  return drop ? {
    title: drop.title,
    description: drop.subtitle,
    alternates: { canonical: `/drops/${drop.slug}` },
    openGraph: {
      type: "website",
      title: `${drop.title} · SOKOZA`,
      description: drop.subtitle,
      url: `/drops/${drop.slug}`,
      images: drop.coverImage ? [{ url: drop.coverImage, alt: drop.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${drop.title} · SOKOZA`,
      description: drop.subtitle,
      images: drop.coverImage ? [drop.coverImage] : [],
    },
  } : { title: "Drop not found" };
}

export async function generateStaticParams() {
  const drops = await catalogRepository.listDrops();
  return drops.map((drop) => ({ slug: drop.slug }));
}

export default async function DropPage({ params }: DropPageProps) {
  const { slug } = await params;
  const drop = await catalogRepository.getDropBySlug(slug);
  if (!drop) notFound();
  const [store, products, stores] = await Promise.all([
    catalogRepository.getStoreById(drop.storeId),
    catalogRepository.getProductsByIds(drop.productIds),
    catalogRepository.listStores(),
  ]);
  if (!store) notFound();
  const dropUrl = absoluteUrl(`/drops/${drop.slug}`);
  const dropJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${dropUrl}#collection`,
    name: drop.title,
    description: drop.subtitle,
    url: dropUrl,
    image: drop.coverImage || undefined,
    datePublished: drop.publishedAt,
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    about: {
      "@type": "ClothingStore",
      name: store.name,
      url: absoluteUrl(`/stores/${store.slug}`),
    },
  };

  return (
    <div className="drop-page">
      <script
        dangerouslySetInnerHTML={{ __html: safeJsonLd(dropJsonLd) }}
        type="application/ld+json"
      />
      <section className="drop-hero">
        <SmartImage alt={`${drop.title} by ${store.name}`} fill priority sizes="100vw" src={drop.coverImage} />
        <div className="drop-hero-shade" />
        <div className="drop-hero-copy">
          <p className="eyebrow">Live Drop · {formatDate(drop.publishedAt)}</p>
          <h1>{drop.title}</h1>
          <p>{drop.subtitle}</p>
          <Link href={`/stores/${store.slug}`}>By {store.name}</Link>
        </div>
      </section>
      <div className="page">
        <header className="section-heading">
          <div>
            <p className="eyebrow">{products.length} pieces</p>
            <h2>Shop the Drop</h2>
            <p>Each product keeps its current availability and normal store ordering flow.</p>
          </div>
        </header>
        <ProductGrid priorityCount={2} products={products} stores={stores} />
      </div>
    </div>
  );
}
