export type SellerTaskKind =
  | "setup"
  | "verification"
  | "freshness"
  | "low_stock"
  | "enquiry"
  | "draft";

export type SellerTaskPriority = "blocking" | "attention" | "growth";

export interface SellerSession {
  sellerId: string;
  storeId: string;
  sellerName: string;
  storeName: string;
  storeSlug: string;
  mode: "production";
}

export interface SellerTask {
  id: string;
  kind: SellerTaskKind;
  priority: SellerTaskPriority;
  title: string;
  detail: string;
  action: string;
  href: string;
}

export interface SellerActivityMetric {
  id:
    | "store_views"
    | "product_views"
    | "product_saves"
    | "order_reviews"
    | "whatsapp_opens"
    | "buyer_marked_sent";
  label: string;
  value: number;
  definition: string;
  evidence: string;
}

export interface SellerActivityWindow {
  label: string;
  timezone: string;
  provenance: string;
  metrics: SellerActivityMetric[];
}

export interface SellerStoreDraft {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  area: string;
  categories: string[];
  whatsapp: string;
  collection: string;
  delivery: string;
  exchanges: string;
  cancellation: string;
  replyExpectation: string;
  avatarImage: string;
  coverImage: string;
  operatingState: "draft" | "published" | "paused";
  version: number;
}

export type SellerVerificationState =
  | "not_started"
  | "pending"
  | "verified"
  | "rejected"
  | "requires_update";

export interface SellerVerificationItem {
  id: "phone" | "identity" | "business";
  label: string;
  state: SellerVerificationState;
  checkedAt?: string;
  detail: string;
  publicLabel?: string;
}

export interface SellerWorkspaceSnapshot {
  session: SellerSession;
  store: SellerStoreDraft;
  setupCompletion: number;
  tasks: SellerTask[];
  activity: SellerActivityWindow;
  verification: SellerVerificationItem[];
  catalogSummary: {
    live: number;
    drafts: number;
    lowStock: number;
    stale: number;
    newEnquiries: number;
    liveDrops: number;
  };
}

export interface SellerSessionRepository {
  getCurrent(): Promise<SellerSession>;
}

export interface SellerStoreRepository {
  getCurrent(): Promise<SellerStoreDraft>;
  getWorkspaceSnapshot(): Promise<SellerWorkspaceSnapshot>;
}

export interface SellerVerificationRepository {
  listCurrent(): Promise<SellerVerificationItem[]>;
}

export interface SellerActivityRepository {
  getCurrentWindow(): Promise<SellerActivityWindow>;
}
