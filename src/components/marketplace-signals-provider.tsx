"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { z } from "zod";
import {
  aggregateMarketplaceEvents,
  isDuplicateMarketplaceEvent,
  MARKETPLACE_EVENT_TYPES,
  RANKING_CONFIG,
  type MarketplaceEvent,
  type MarketplaceEventType,
  type ProductRollingMetrics,
  type ProductViewKind,
} from "@/lib/marketplace-ranking";

interface EventTarget {
  productId: string;
  storeId: string;
}

interface CaptureOptions {
  intentKey?: string;
  viewKind?: ProductViewKind;
  orderIntentId?: string;
}

interface MarketplaceSignalsContextValue {
  hydrated: boolean;
  metrics: ReadonlyMap<string, ProductRollingMetrics>;
  capture(eventType: MarketplaceEventType, target: EventTarget, options?: CaptureOptions): boolean;
  captureActivity(eventType: "store_viewed" | "search_submitted" | "search_result_clicked", target?: Partial<EventTarget>): boolean;
  trackProductView(target: EventTarget, viewerStoreId?: string | null): () => void;
}

const STORAGE_KEY = "sokoza-marketplace-signals-v1";
const SESSION_KEY = "sokoza-marketplace-session-v1";

const eventSchema = z.object({
  id: z.string(),
  eventType: z.enum(MARKETPLACE_EVENT_TYPES),
  productId: z.string(),
  storeId: z.string(),
  sessionId: z.string(),
  occurredAt: z.string(),
  viewKind: z.enum(["raw", "meaningful"]).optional(),
  intentKey: z.string().max(120).optional(),
  orderIntentId: z.uuid().optional(),
});

const stateSchema = z.object({
  schemaVersion: z.literal(1),
  events: z.array(eventSchema).max(5_000),
});

const MarketplaceSignalsContext = createContext<MarketplaceSignalsContextValue | null>(null);

function isLikelyBot() {
  const agent = navigator.userAgent.toLocaleLowerCase();
  return navigator.webdriver || /bot|crawler|spider|headless|lighthouse|preview/.test(agent);
}

function getSessionId() {
  try {
    const current = window.sessionStorage.getItem(SESSION_KEY);
    if (current) return current;
    const next = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

function pruneEvents(events: MarketplaceEvent[], now = Date.now()) {
  const oldest = now - RANKING_CONFIG.eventRetentionDays * 24 * 60 * 60 * 1000;
  return events.filter((event) => new Date(event.occurredAt).getTime() >= oldest).slice(-5_000);
}

function sendToAuthoritativeEndpoint(event: MarketplaceEvent) {
  const body = JSON.stringify({
    eventType: event.eventType,
    productId: event.productId,
    storeId: event.storeId,
    sessionKey: event.sessionId,
    viewKind: event.viewKind,
    intentKey: event.intentKey,
    orderIntentId: event.orderIntentId,
    idempotencyKey: event.id,
  });
  void fetch("/api/marketplace-events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);

  const posthog = (window as Window & {
    posthog?: { capture(name: string, properties: Record<string, unknown>): void };
  }).posthog;
  posthog?.capture(event.eventType, {
    product_id: event.productId,
    store_id: event.storeId,
    view_kind: event.viewKind,
    ranking_version: RANKING_CONFIG.version,
  });
}

export function MarketplaceSignalsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<MarketplaceEvent[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const eventsRef = useRef<MarketplaceEvent[]>([]);
  const sessionIdRef = useRef<string>("");
  const activityDedupeRef = useRef(new Map<string, number>());

  useEffect(() => {
    let restored: MarketplaceEvent[] = [];
    try {
      sessionIdRef.current = getSessionId();
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const result = stateSchema.safeParse(JSON.parse(stored));
        if (result.success) restored = pruneEvents(result.data.events);
      }
    } catch {
      // Analytics must never block the shopping experience.
    }
    eventsRef.current = restored;
    queueMicrotask(() => {
      setEvents(restored);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, events }));
    } catch {
      // Keep the UI working when storage is unavailable.
    }
  }, [events, hydrated]);

  const capture = useCallback((
    eventType: MarketplaceEventType,
    target: EventTarget,
    options: CaptureOptions = {},
  ) => {
    if (!hydrated || !sessionIdRef.current || isLikelyBot()) return false;
    const now = Date.now();
    const duplicate = isDuplicateMarketplaceEvent(eventsRef.current, {
      eventType,
      productId: target.productId,
      sessionId: sessionIdRef.current,
      viewKind: options.viewKind,
      intentKey: options.intentKey,
    }, now);
    if (duplicate) return false;

    const event: MarketplaceEvent = {
      id: crypto.randomUUID(),
      eventType,
      productId: target.productId,
      storeId: target.storeId,
      sessionId: sessionIdRef.current,
      occurredAt: new Date(now).toISOString(),
      viewKind: options.viewKind,
      intentKey: options.intentKey,
      orderIntentId: options.orderIntentId,
    };
    const next = pruneEvents([...eventsRef.current, event], now);
    eventsRef.current = next;
    setEvents(next);
    sendToAuthoritativeEndpoint(event);
    return true;
  }, [hydrated]);

  const trackProductView = useCallback((target: EventTarget, viewerStoreId?: string | null) => {
    if (!hydrated || viewerStoreId === target.storeId || isLikelyBot()) return () => undefined;
    capture("product_viewed", target, { viewKind: "raw" });
    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        capture("product_viewed", target, { viewKind: "meaningful" });
      }
    }, RANKING_CONFIG.meaningfulViewDelayMs);
    return () => window.clearTimeout(timer);
  }, [capture, hydrated]);

  const captureActivity = useCallback((eventType: "store_viewed" | "search_submitted" | "search_result_clicked", target: Partial<EventTarget> = {}) => {
    if (!hydrated || !sessionIdRef.current || isLikelyBot()) return false;
    const key = `${eventType}:${target.productId ?? ""}:${target.storeId ?? ""}`;
    const now = Date.now();
    if (now - (activityDedupeRef.current.get(key) ?? 0) < RANKING_CONFIG.viewDedupeMs) return false;
    activityDedupeRef.current.set(key, now);
    void fetch("/api/activity-events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventType, ...target, sessionKey: sessionIdRef.current, idempotencyKey: crypto.randomUUID() }),
      keepalive: true,
    }).catch(() => undefined);
    const posthog = (window as Window & { posthog?: { capture(name: string, properties: Record<string, unknown>): void } }).posthog;
    posthog?.capture(eventType, { product_id: target.productId, store_id: target.storeId, ranking_version: RANKING_CONFIG.version });
    return true;
  }, [hydrated]);

  const metrics = useMemo(
    () => aggregateMarketplaceEvents(events, Array.from(new Set(events.map((event) => event.productId)))),
    [events],
  );

  const value = useMemo<MarketplaceSignalsContextValue>(() => ({
    hydrated,
    metrics,
    capture,
    captureActivity,
    trackProductView,
  }), [capture, captureActivity, hydrated, metrics, trackProductView]);

  return <MarketplaceSignalsContext.Provider value={value}>{children}</MarketplaceSignalsContext.Provider>;
}

export function useMarketplaceSignals() {
  const context = useContext(MarketplaceSignalsContext);
  if (!context) throw new Error("useMarketplaceSignals must be used inside MarketplaceSignalsProvider");
  return context;
}

export function useOptionalMarketplaceSignals() {
  return useContext(MarketplaceSignalsContext);
}
