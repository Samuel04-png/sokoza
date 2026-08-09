export type Availability = "available" | "low" | "sold" | "stale";
export type Condition = "New" | "Like new" | "Good" | "Made to order";
export type VerificationLevel = "whatsapp" | "identity" | "business";

export interface ProductVariant {
  id: string;
  label: string;
  color: string;
  colorHex: string;
  available: boolean;
  quantity?: number;
}

export interface Product {
  id: string;
  slug: string;
  storeId: string;
  title: string;
  price: number;
  previousPrice?: number;
  category: string;
  audience: string;
  condition: Condition;
  color: string;
  description: string;
  details: string[];
  images: string[];
  variants: ProductVariant[];
  availability: Availability;
  confirmedAt: string;
  madeHere: boolean;
  featured?: boolean;
  vibes: string[];
  occasions: string[];
  dropId?: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  status: "active" | "temporarily_closed" | "suspended";
  tagline: string;
  description: string;
  location: string;
  serviceAreas: string[];
  whatsapp: string;
  socialLinks?: {
    facebook?: string;
    tiktok?: string;
  };
  verification: VerificationLevel[];
  joinedAt: string;
  coverImage: string;
  avatarImage: string;
  categories: string[];
  fulfilment: {
    collection: string;
    delivery: string;
    exchanges: string;
  };
}

export interface Drop {
  id: string;
  slug: string;
  storeId: string;
  title: string;
  subtitle: string;
  status: "live" | "past";
  coverImage: string;
  productIds: string[];
  publishedAt: string;
}

export interface DiscoveryCollection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  tone: "terracotta" | "olive" | "ink" | "light";
}

export interface CartLine {
  productId: string;
  productTitle: string;
  storeId: string;
  variantId: string;
  variantLabel: string;
  quantity: number;
  maxQuantity: number;
  priceSnapshot: number;
}

export interface EnquiryRecord {
  id: string;
  reference: string;
  storeId: string;
  storeName?: string;
  lines: CartLine[];
  createdAt: string;
  status: "ready" | "whatsapp_opened" | "buyer_marked_sent";
}

export interface BuyerPreferences {
  location: string;
  reducedData: boolean;
}

export interface CatalogRepository {
  listProducts(): Promise<Product[]>;
  listMovingProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductSocialProof(productId: string): Promise<string | null>;
  listStores(): Promise<Store[]>;
  searchStores(query: string): Promise<Store[]>;
  getStoreBySlug(slug: string): Promise<Store | null>;
  getStoreById(id: string): Promise<Store | null>;
  listDrops(): Promise<Drop[]>;
  getDropBySlug(slug: string): Promise<Drop | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
}
