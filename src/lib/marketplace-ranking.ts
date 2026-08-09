import type { Product, Store } from "@/lib/types";

export const MARKETPLACE_EVENT_TYPES = [
  "product_viewed",
  "saved_product",
  "order_review_started",
  "order_intent_created",
  "whatsapp_opened",
  "buyer_marked_enquiry_sent",
] as const;

export type MarketplaceEventType = (typeof MARKETPLACE_EVENT_TYPES)[number];
export type ProductViewKind = "raw" | "meaningful";

export interface MarketplaceEvent {
  id: string;
  eventType: MarketplaceEventType;
  productId: string;
  storeId: string;
  sessionId: string;
  occurredAt: string;
  viewKind?: ProductViewKind;
  intentKey?: string;
  orderIntentId?: string;
}

export interface ProductRollingMetrics {
  productId: string;
  rawViews24h: number;
  uniqueViewers24h: number;
  rawViews7d: number;
  uniqueViewers7d: number;
  previousUniqueViewers7d: number;
  rawViews30d: number;
  uniqueViewers30d: number;
  saves7d: number;
  orderReviews7d: number;
  orderIntents7d: number;
  whatsappOpens7d: number;
  buyerMarkedSent7d: number;
  buyerMarkedSent24h: number;
  buyerMarkedSent30d: number;
  lastEventAt?: string;
}

export interface RankingExplanation {
  rankingVersion: string;
  relevance: number;
  availability: number;
  inventoryFreshness: number;
  enquiryMomentum: number;
  smoothedEnquiryRate: number;
  smoothedSaveRate: number;
  smoothedReviewRate: number;
  meaningfulViewInterest: number;
  catalogQuality: number;
  newness: number;
  exploration: boolean;
  diversityAdjusted: boolean;
}

export interface RankedProduct {
  product: Product;
  score: number;
  explanation: RankingExplanation;
}

const hour = 60 * 60 * 1000;
const day = 24 * hour;

export const RANKING_CONFIG = {
  version: "ranking_v1",
  meaningfulViewDelayMs: 1_500,
  viewDedupeMs: 30 * 60 * 1000,
  eventRetentionDays: 31,
  socialProof: {
    uniqueViewersToday: 10,
    uniqueViewersWeek: 22,
  },
  comparison: {
    minimumPreviousUniqueViewers: 5,
  },
  priors: {
    enquiryRate: { rate: 0.025, strength: 40 },
    saveRate: { rate: 0.08, strength: 30 },
    reviewRate: { rate: 0.055, strength: 35 },
  },
  discoverWeights: {
    availability: 0.14,
    inventoryFreshness: 0.17,
    enquiryMomentum: 0.22,
    enquiryRate: 0.12,
    saveRate: 0.08,
    reviewRate: 0.09,
    meaningfulViews: 0.04,
    catalogQuality: 0.09,
    newness: 0.05,
  },
  searchMarketplaceInfluence: 8,
  exploration: {
    maximumShare: 0.15,
    recentDays: 21,
    lowExposureMaximum: 3,
  },
  diversity: {
    maximumConsecutiveProductsPerStore: 2,
  },
} as const;

export function emptyProductMetrics(productId: string): ProductRollingMetrics {
  return {
    productId,
    rawViews24h: 0,
    uniqueViewers24h: 0,
    rawViews7d: 0,
    uniqueViewers7d: 0,
    previousUniqueViewers7d: 0,
    rawViews30d: 0,
    uniqueViewers30d: 0,
    saves7d: 0,
    orderReviews7d: 0,
    orderIntents7d: 0,
    whatsappOpens7d: 0,
    buyerMarkedSent7d: 0,
    buyerMarkedSent24h: 0,
    buyerMarkedSent30d: 0,
  };
}

function within(event: MarketplaceEvent, now: number, duration: number) {
  const at = new Date(event.occurredAt).getTime();
  return Number.isFinite(at) && at <= now && at >= now - duration;
}

function uniqueSessions(events: MarketplaceEvent[]) {
  return new Set(events.map((event) => event.sessionId)).size;
}

function uniqueSignalCount(events: MarketplaceEvent[], eventType: MarketplaceEventType) {
  return uniqueSessions(events.filter((event) => event.eventType === eventType));
}

export function aggregateMarketplaceEvents(
  events: MarketplaceEvent[],
  productIds: string[],
  nowInput: Date | string | number = new Date(),
) {
  const now = new Date(nowInput).getTime();
  return new Map(
    productIds.map((productId) => {
      const productEvents = events.filter((event) => event.productId === productId);
      const events24h = productEvents.filter((event) => within(event, now, day));
      const events7d = productEvents.filter((event) => within(event, now, 7 * day));
      const events30d = productEvents.filter((event) => within(event, now, 30 * day));
      const previous7d = productEvents.filter((event) => {
        const at = new Date(event.occurredAt).getTime();
        return at >= now - 14 * day && at < now - 7 * day;
      });
      const meaningful = (items: MarketplaceEvent[]) =>
        items.filter((event) => event.eventType === "product_viewed" && event.viewKind === "meaningful");
      const raw = (items: MarketplaceEvent[]) =>
        items.filter((event) => event.eventType === "product_viewed" && event.viewKind === "raw").length;
      const latest = productEvents
        .map((event) => event.occurredAt)
        .sort((a, b) => +new Date(b) - +new Date(a))[0];
      const metrics: ProductRollingMetrics = {
        productId,
        rawViews24h: raw(events24h),
        uniqueViewers24h: uniqueSessions(meaningful(events24h)),
        rawViews7d: raw(events7d),
        uniqueViewers7d: uniqueSessions(meaningful(events7d)),
        previousUniqueViewers7d: uniqueSessions(meaningful(previous7d)),
        rawViews30d: raw(events30d),
        uniqueViewers30d: uniqueSessions(meaningful(events30d)),
        saves7d: uniqueSignalCount(events7d, "saved_product"),
        orderReviews7d: uniqueSignalCount(events7d, "order_review_started"),
        orderIntents7d: uniqueSignalCount(events7d, "order_intent_created"),
        whatsappOpens7d: uniqueSignalCount(events7d, "whatsapp_opened"),
        buyerMarkedSent7d: uniqueSignalCount(events7d, "buyer_marked_enquiry_sent"),
        buyerMarkedSent24h: uniqueSignalCount(events24h, "buyer_marked_enquiry_sent"),
        buyerMarkedSent30d: uniqueSignalCount(events30d, "buyer_marked_enquiry_sent"),
        lastEventAt: latest,
      };
      return [productId, metrics] as const;
    }),
  );
}

export function isDuplicateMarketplaceEvent(
  events: MarketplaceEvent[],
  candidate: Pick<MarketplaceEvent, "eventType" | "productId" | "sessionId" | "viewKind" | "intentKey">,
  nowInput: Date | string | number = new Date(),
) {
  const now = new Date(nowInput).getTime();
  const window = candidate.eventType === "product_viewed" && candidate.viewKind === "raw"
    ? 1_000
    : RANKING_CONFIG.viewDedupeMs;
  return events.some((event) => {
    if (
      event.sessionId !== candidate.sessionId ||
      event.productId !== candidate.productId ||
      event.eventType !== candidate.eventType ||
      event.viewKind !== candidate.viewKind
    ) return false;
    if (candidate.intentKey && event.intentKey !== candidate.intentKey) return false;
    return now - new Date(event.occurredAt).getTime() < window;
  });
}

export function smoothedRate(
  successes: number,
  exposures: number,
  prior: { rate: number; strength: number },
) {
  const safeExposures = Math.max(0, exposures);
  const safeSuccesses = Math.max(0, Math.min(successes, safeExposures));
  return (safeSuccesses + prior.rate * prior.strength) / (safeExposures + prior.strength);
}

export function buyerProductViewSocialProof(metrics: ProductRollingMetrics) {
  if (metrics.uniqueViewers24h >= RANKING_CONFIG.socialProof.uniqueViewersToday) {
    return `Viewed by ${metrics.uniqueViewers24h} shoppers today`;
  }
  if (metrics.uniqueViewers7d >= RANKING_CONFIG.socialProof.uniqueViewersWeek) {
    return `${metrics.uniqueViewers7d} people viewed this piece this week`;
  }
  return null;
}

export function validComparisonChange(current: number, previous: number) {
  if (previous < RANKING_CONFIG.comparison.minimumPreviousUniqueViewers) return null;
  return Math.round(((current - previous) / previous) * 100);
}

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function productTextRelevance(product: Product, store: Store | undefined, query: string) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return 1;
  const fields = [
    { value: product.title, weight: 1 },
    { value: `${product.category} ${product.color}`, weight: 0.92 },
    { value: `${product.audience} ${product.condition}`, weight: 0.72 },
    { value: `${product.vibes.join(" ")} ${product.occasions.join(" ")}`, weight: 0.66 },
    { value: product.variants.map((variant) => `${variant.label} size ${variant.label}`).join(" "), weight: 0.66 },
    { value: store?.name ?? "", weight: 0.78 },
    { value: `${product.description} ${product.details.join(" ")}`, weight: 0.45 },
  ].map((field) => ({ ...field, value: normalize(field.value) }));

  const tokenScores = tokens.map((token) =>
    Math.max(0, ...fields.map((field) => field.value.includes(token) ? field.weight : 0)),
  );
  if (tokenScores.some((score) => score === 0)) return 0;
  const phraseBoost = normalize(product.title).includes(normalize(query)) ? 0.08 : 0;
  return Math.min(1, tokenScores.reduce((total, score) => total + score, 0) / tokens.length + phraseBoost);
}

function ageInDays(value: string, now: Date) {
  return Math.max(0, (now.getTime() - new Date(value).getTime()) / day);
}

function inventoryFreshness(product: Product, now: Date) {
  const age = ageInDays(product.confirmedAt, now);
  if (age <= 1) return 1;
  if (age <= 3) return 0.82;
  if (age <= 7) return 0.58;
  if (age <= 14) return 0.3;
  return 0.1;
}

function catalogQuality(product: Product) {
  const checks = [
    product.images.length >= 2,
    product.description.trim().length >= 80,
    product.details.length >= 2,
    product.variants.length > 0,
    product.vibes.length > 0,
    product.occasions.length > 0,
  ];
  return checks.filter(Boolean).length / checks.length;
}

function availabilityScore(product: Product) {
  if (product.availability === "available") return 1;
  if (product.availability === "low") return 0.82;
  if (product.availability === "stale") return 0.35;
  return 0;
}

function cappedLog(value: number, cap: number) {
  return Math.min(1, Math.log1p(Math.max(0, value)) / Math.log1p(cap));
}

function marketplaceComponents(product: Product, metrics: ProductRollingMetrics, now: Date) {
  const exposure = Math.max(metrics.uniqueViewers7d, metrics.orderReviews7d, 0);
  const enquiryMomentum = Math.min(
    1,
    cappedLog(metrics.buyerMarkedSent24h, 5) * 0.5 +
      cappedLog(metrics.buyerMarkedSent7d, 18) * 0.35 +
      cappedLog(metrics.buyerMarkedSent30d, 50) * 0.15,
  );
  return {
    availability: availabilityScore(product),
    inventoryFreshness: inventoryFreshness(product, now),
    enquiryMomentum,
    smoothedEnquiryRate: smoothedRate(metrics.buyerMarkedSent7d, exposure, RANKING_CONFIG.priors.enquiryRate),
    smoothedSaveRate: smoothedRate(metrics.saves7d, exposure, RANKING_CONFIG.priors.saveRate),
    smoothedReviewRate: smoothedRate(metrics.orderReviews7d, exposure, RANKING_CONFIG.priors.reviewRate),
    meaningfulViewInterest: cappedLog(metrics.uniqueViewers7d, 100),
    catalogQuality: catalogQuality(product),
    newness: Math.max(0, 1 - ageInDays(product.confirmedAt, now) / RANKING_CONFIG.exploration.recentDays),
  };
}

function marketplaceScore(components: ReturnType<typeof marketplaceComponents>) {
  const weights = RANKING_CONFIG.discoverWeights;
  return (
    components.availability * weights.availability +
    components.inventoryFreshness * weights.inventoryFreshness +
    components.enquiryMomentum * weights.enquiryMomentum +
    components.smoothedEnquiryRate * weights.enquiryRate +
    components.smoothedSaveRate * weights.saveRate +
    components.smoothedReviewRate * weights.reviewRate +
    components.meaningfulViewInterest * weights.meaningfulViews +
    components.catalogQuality * weights.catalogQuality +
    components.newness * weights.newness
  );
}

function deterministicDailyNumber(value: string, now: Date) {
  const input = `${now.toISOString().slice(0, 10)}:${value}`;
  let hash = 2166136261;
  for (const character of input) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function insertExploration(sorted: RankedProduct[], now: Date) {
  const maximum = Math.floor(sorted.length * RANKING_CONFIG.exploration.maximumShare);
  if (maximum < 1 || sorted.length < 6) return sorted;
  const candidates = sorted
    .filter(({ product, explanation }) =>
      explanation.meaningfulViewInterest <= 0.2 &&
      explanation.newness > 0 &&
      product.availability !== "sold",
    )
    .sort((a, b) => deterministicDailyNumber(a.product.id, now) - deterministicDailyNumber(b.product.id, now))
    .slice(0, maximum);
  if (!candidates.length) return sorted;
  const candidateIds = new Set(candidates.map((candidate) => candidate.product.id));
  const result = sorted.filter((candidate) => !candidateIds.has(candidate.product.id));
  candidates.forEach((candidate, index) => {
    candidate.explanation.exploration = true;
    result.splice(Math.min(result.length, 5 + index * 6), 0, candidate);
  });
  return result;
}

function diversify(sorted: RankedProduct[]) {
  const result: RankedProduct[] = [];
  const remaining = [...sorted];
  const maximum = RANKING_CONFIG.diversity.maximumConsecutiveProductsPerStore;
  while (remaining.length) {
    const lastStores = result.slice(-maximum).map((item) => item.product.storeId);
    const blockedStore = lastStores.length === maximum && new Set(lastStores).size === 1 ? lastStores[0] : null;
    let index = blockedStore ? remaining.findIndex((item) => item.product.storeId !== blockedStore) : 0;
    if (index < 0) index = 0;
    const [next] = remaining.splice(index, 1);
    if (index > 0) next.explanation.diversityAdjusted = true;
    result.push(next);
  }
  return result;
}

export function rankMarketplaceProducts({
  products,
  stores,
  metrics = new Map<string, ProductRollingMetrics>(),
  query = "",
  mode,
  now = new Date(),
  preserveSingleStore = false,
  includeUnavailable = false,
}: {
  products: Product[];
  stores: Store[];
  metrics?: ReadonlyMap<string, ProductRollingMetrics>;
  query?: string;
  mode: "search" | "discover";
  now?: Date;
  preserveSingleStore?: boolean;
  includeUnavailable?: boolean;
}) {
  const storeMap = new Map(stores.map((store) => [store.id, store]));
  const eligibleProducts = products.filter((product) => {
    const store = storeMap.get(product.storeId);
    if (!store || store.status === "suspended") return false;
    if (includeUnavailable) return true;
    return store.status === "active" && product.availability !== "sold" && product.variants.some((variant) => variant.available);
  });
  const ranked = eligibleProducts.map((product) => {
    const relevance = productTextRelevance(product, storeMap.get(product.storeId), query);
    const components = marketplaceComponents(product, metrics.get(product.id) ?? emptyProductMetrics(product.id), now);
    const organic = marketplaceScore(components);
    const score = mode === "search"
      ? relevance * 100 + organic * RANKING_CONFIG.searchMarketplaceInfluence
      : organic;
    return {
      product,
      score,
      explanation: {
        rankingVersion: RANKING_CONFIG.version,
        relevance,
        ...components,
        exploration: false,
        diversityAdjusted: false,
      },
    } satisfies RankedProduct;
  }).sort((a, b) => b.score - a.score || a.product.id.localeCompare(b.product.id));

  if (mode === "search") return ranked;
  const explored = insertExploration(ranked, now);
  return preserveSingleStore ? explored : diversify(explored);
}

export function qualifiesForWhatsMoving(metrics: ProductRollingMetrics) {
  return (
    metrics.buyerMarkedSent7d >= 2 ||
    (metrics.orderReviews7d >= 4 && metrics.saves7d >= 5) ||
    (metrics.uniqueViewers7d >= RANKING_CONFIG.socialProof.uniqueViewersWeek &&
      (metrics.saves7d >= 3 || metrics.orderReviews7d >= 2))
  );
}

export function marketplaceMetricMapToRecord(metrics: ReadonlyMap<string, ProductRollingMetrics>) {
  return Object.fromEntries(metrics.entries());
}
