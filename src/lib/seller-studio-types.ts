import type { Availability, Condition, Product, ProductVariant } from "@/lib/types";
import type { DeliveryFeeMode, DeliveryScope } from "@/lib/store-fulfilment";

export type SellerProductStatus = "draft" | "published" | "hidden" | "sold_out" | "archived";

export interface SellerStudioProduct extends Product {
  status: SellerProductStatus;
  updatedAt: string;
  fulfilmentNote: string;
  version: number;
}

export type SellerEnquiryStatus =
  | "new"
  | "contacted"
  | "awaiting_buyer"
  | "completed_elsewhere"
  | "closed";

export interface SellerEnquiryLineSnapshot {
  id: string;
  productId: string;
  title: string;
  image: string;
  variantLabel: string;
  quantity: number;
  price: number;
}

export interface SellerStudioEnquiry {
  id: string;
  reference: string;
  createdAt: string;
  status: SellerEnquiryStatus;
  buyerSignal: "order_intent_created" | "whatsapp_opened" | "buyer_marked_sent";
  buyerNote?: string;
  lines: SellerEnquiryLineSnapshot[];
  timeline: Array<{ id: string; label: string; at: string }>;
}

export interface SellerStudioDrop {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  coverImage: string;
  productIds: string[];
  status: "draft" | "live" | "past";
  publishedAt?: string;
  updatedAt: string;
}

export interface SellerStudioStore {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  cityId?: string;
  area: string;
  categories: string[];
  categoryIds?: string[];
  whatsapp: string;
  facebookUrl: string;
  tiktokUrl: string;
  whatsappTone: "standard" | "warm" | "concise";
  collectionEnabled: boolean;
  collectionArea: string;
  collection: string;
  deliveryEnabled: boolean;
  deliveryScope: DeliveryScope;
  deliveryFeeMode: DeliveryFeeMode;
  deliveryFee?: number;
  delivery: string;
  exchanges: string;
  cancellation: string;
  replyExpectation: string;
  avatarImage: string;
  coverImage: string;
  operatingState: "draft" | "published" | "paused" | "archived";
  updatedAt: string;
  version: number;
}

export interface SellerStudioNotification {
  id: string;
  kind: "enquiry" | "inventory" | "store" | "growth";
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
}

export interface SellerStudioPreferences {
  enquiryAlerts: boolean;
  freshnessReminders: boolean;
  weeklySummary: boolean;
  compactCatalog: boolean;
}

export interface SellerProductMetrics {
  productId: string;
  rawViews7d: number;
  uniqueViewers7d: number;
  previousUniqueViewers7d: number;
  saves7d: number;
  orderReviews7d: number;
  orderIntents7d: number;
  whatsappOpens7d: number;
  buyerMarkedSent7d: number;
  refreshedAt?: string;
}

export interface SellerAuditEvent {
  id: string;
  entityType: "product" | "inventory" | "store" | "drop" | "enquiry" | "settings";
  entityId: string;
  action: string;
  at: string;
}

export interface SellerStudioState {
  schemaVersion: 2;
  sellerName: string;
  accountEmail: string;
  accountPendingEmail: string;
  store: SellerStudioStore;
  products: SellerStudioProduct[];
  productMetrics: Record<string, SellerProductMetrics>;
  enquiries: SellerStudioEnquiry[];
  drops: SellerStudioDrop[];
  notifications: SellerStudioNotification[];
  preferences: SellerStudioPreferences;
  onboardingStep: number;
  onboardingComplete: boolean;
  audit: SellerAuditEvent[];
}

export interface SellerProductInput {
  id?: string;
  version?: number;
  title: string;
  price: number;
  previousPrice?: number;
  category: string;
  categoryId?: string;
  audience: string;
  condition: Condition;
  color: string;
  description: string;
  details: string[];
  images: string[];
  variants: ProductVariant[];
  availability: Availability;
  madeHere: boolean;
  vibes: string[];
  occasions: string[];
  fulfilmentNote: string;
  status: SellerProductStatus;
}

export function productToInput(product: SellerStudioProduct): SellerProductInput {
  return {
    id: product.id,
    version: product.version,
    title: product.title,
    price: product.price,
    previousPrice: product.previousPrice,
    category: product.category,
    audience: product.audience,
    condition: product.condition,
    color: product.color,
    description: product.description,
    details: product.details,
    images: product.images,
    variants: product.variants,
    availability: product.availability,
    madeHere: product.madeHere,
    vibes: product.vibes,
    occasions: product.occasions,
    fulfilmentNote: product.fulfilmentNote,
    status: product.status,
  };
}

export function publicProductHref(product: Pick<Product, "id" | "slug">) {
  return product.id.startsWith("product-") || product.id.startsWith("seller-")
    ? `/products/local/${product.id}`
    : `/products/${product.slug}`;
}
