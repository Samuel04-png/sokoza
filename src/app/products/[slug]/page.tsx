import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogRepository } from "@/data/repository";
import { ProductDetail } from "@/components/product-detail";
import { ProductGrid } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { getSellerPreviewSession } from "@/lib/seller-session";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await catalogRepository.getProductBySlug(slug);
  return product
    ? {
        title: product.title,
        description: product.description,
        openGraph: {
          type: "website",
          title: `${product.title} · SOKOZA`,
          description: product.description,
          images: product.images[0] ? [{ url: product.images[0], alt: product.title }] : [],
        },
        twitter: {
          card: "summary_large_image",
          title: `${product.title} · SOKOZA`,
          description: product.description,
          images: product.images[0] ? [product.images[0]] : [],
        },
      }
    : { title: "Product not found" };
}

export async function generateStaticParams() {
  const products = await catalogRepository.listProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, products, stores] = await Promise.all([
    catalogRepository.getProductBySlug(slug),
    catalogRepository.listProducts(),
    catalogRepository.listStores(),
  ]);
  if (!product) notFound();
  const store = stores.find((item) => item.id === product.storeId);
  if (!store) notFound();
  const [sellerSession, socialProof] = await Promise.all([
    getSellerPreviewSession(),
    catalogRepository.getProductSocialProof(product.id),
  ]);
  const related = products
    .filter(
      (item) =>
        item.id !== product.id &&
        item.availability !== "sold" &&
        (item.storeId === product.storeId || item.vibes.some((vibe) => product.vibes.includes(vibe))),
    )
    .slice(0, 4);

  return (
    <div className="product-page">
      <ProductDetail product={product} socialProof={socialProof} store={store} viewerStoreId={sellerSession?.storeId} />
      <section className="page related-section">
        <SectionHeading
          body="A simple related edit—no claim of personalization."
          eyebrow="Wear it with"
          title="More pieces to consider"
        />
        <ProductGrid products={related} stores={stores} />
      </section>
    </div>
  );
}
