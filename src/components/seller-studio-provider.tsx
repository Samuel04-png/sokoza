"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  SellerAuditEvent,
  SellerEnquiryStatus,
  SellerProductInput,
  SellerStudioDrop,
  SellerStudioPreferences,
  SellerStudioProduct,
  SellerStudioState,
  SellerStudioStore,
} from "@/lib/seller-studio-types";
import { productToInput } from "@/lib/seller-studio-types";
import type { Availability } from "@/lib/types";
import { emptySellerStudioState } from "@/lib/seller-studio-empty-state";

export const initialSellerStudioState = emptySellerStudioState;

interface SellerStudioContextValue {
  state: SellerStudioState;
  hydrated: boolean;
  pendingWrites: number;
  persistenceError: string;
  clearPersistenceError(): void;
  flushWrites(): Promise<boolean>;
  saveStoreDraft(store: SellerStudioStore): Promise<StoreMutationResult>;
  publishStore(storeId: string, expectedVersion: number): Promise<StoreMutationResult>;
  pauseStore(storeId: string, expectedVersion: number): Promise<StoreMutationResult>;
  archiveStore(storeId: string, expectedVersion: number): Promise<StoreMutationResult>;
  saveProduct(input: SellerProductInput): SellerStudioProduct;
  duplicateProduct(id: string): SellerStudioProduct | null;
  archiveProduct(id: string): void;
  restoreProduct(id: string): void;
  setAvailability(ids: string[], availability: Availability): void;
  saveDrop(drop: Omit<SellerStudioDrop, "updatedAt">): SellerStudioDrop;
  archiveDrop(id: string): void;
  setEnquiryStatus(id: string, status: SellerEnquiryStatus): void;
  markNotification(id: string, read?: boolean): void;
  markAllNotificationsRead(): void;
  updatePreferences(patch: Partial<SellerStudioPreferences>): void;
  updateSellerName(sellerName: string): Promise<{ saved: boolean; error?: string }>;
  updateOnboarding(patch: Pick<SellerStudioState, "onboardingStep" | "onboardingComplete"> & Partial<Pick<SellerStudioState, "sellerName" | "accountEmail">>): void;
  saveOnboardingStep(input: SellerOnboardingWrite): Promise<SellerOnboardingSaveResult>;
}

const SellerStudioContext = createContext<SellerStudioContextValue | null>(null);

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

type SellerWrite =
  | { operation: "save_product"; product: SellerProductInput }
  | { operation: "set_product_status"; productId: string; status: SellerStudioProduct["status"]; expectedVersion: number }
  | { operation: "set_availability"; productIds: string[]; availability: Availability }
  | { operation: "save_drop"; drop: Omit<SellerStudioDrop, "updatedAt"> }
  | { operation: "archive_drop"; dropId: string }
  | { operation: "set_enquiry_status"; enquiryId: string; status: SellerEnquiryStatus }
  | { operation: "update_preferences"; preferences: Partial<SellerStudioPreferences> }
  | { operation: "update_onboarding"; onboardingStep: number; onboardingComplete: boolean; sellerName?: string };

export interface SellerOnboardingWrite {
  currentStep: number;
  nextStep: number;
  complete: boolean;
  sellerName: string;
  store: SellerStudioStore;
  cityId?: string;
  categoryIds?: string[];
  product: SellerProductInput;
  productCategoryId?: string;
}

export interface SellerOnboardingSaveResult {
  saved: boolean;
  created?: boolean;
  store?: { id: string; slug: string; version: number };
  product?: { id: string; version: number; variantIds: string[] };
}

export interface StoreMutationResult {
  saved: boolean;
  created?: boolean;
  firstPublication?: boolean;
  store?: SellerStudioStore;
  error?: string;
  requestId?: string;
}

function writeMessage(code: string) {
  if (code === "VERSION_CONFLICT") return "This record changed elsewhere. Reload before saving again.";
  if (code === "SLUG_CONFLICT") return "This product title already has a matching URL. Change the title slightly and retry.";
  if (code === "INVALID_SELLER_UPDATE") return "One of the product fields is not valid. Check the highlighted details and retry.";
  if (code === "STORE_NOT_READY") return "Complete the Store identity, imagery, WhatsApp and fulfilment fields before publishing.";
  if (code === "PRODUCT_NOT_READY") return "This product is not ready to publish. Check its Store, photos, price, options and availability.";
  if (code === "STORE_REQUIRED") return "Create and save your Store before adding products.";
  if (code === "INVALID_CATEGORY" || code === "INVALID_CITY") return "Choose a supported category and city.";
  if (code === "CATEGORY_REQUIRED") return "Choose at least one category.";
  if (code === "SELLER_NAME_REQUIRED") return "Enter the name of the person operating this Store.";
  if (code === "UNAUTHENTICATED") return "Your seller session expired. Sign in and try again.";
  if (code === "STORE_SAVE_FAILED") return "We couldn't save your changes. Try again.";
  if (code === "STORE_STATUS_FAILED") return "We couldn't change the Store status. Your Store data is unchanged.";
  return "We couldn't save this yet. Your changes are still here. Check your connection and retry.";
}

function slugify(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `piece-${Date.now()}`;
}

function audit(entityType: SellerAuditEvent["entityType"], entityId: string, action: string): SellerAuditEvent {
  return { id: id("audit"), entityType, entityId, action, at: new Date().toISOString() };
}

export function SellerStudioProvider({ children, initialState = initialSellerStudioState }: { children: React.ReactNode; initialState?: SellerStudioState }) {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(initialState);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());
  const errorRef = useRef("");
  const [pendingWrites, setPendingWrites] = useState(0);
  const [persistenceError, setPersistenceError] = useState("");
  const hydrated = true;
  const persistenceEnabled = Boolean(initialState.accountEmail);

  const commit = useCallback((updater: (current: SellerStudioState) => SellerStudioState) => {
    const next = updater(stateRef.current);
    stateRef.current = next;
    setState(next);
    return next;
  }, []);

  const persist = useCallback((write: SellerWrite, onSuccess?: (result: Record<string, unknown>) => void) => {
    if (!persistenceEnabled) return;
    errorRef.current = "";
    setPersistenceError("");
    setPendingWrites((count) => count + 1);
    const execute = async () => {
      let latestWrite = write;
      if (write.operation === "save_product") {
        const current = write.product.id ? stateRef.current.products.find((product) => product.id === write.product.id) : undefined;
        latestWrite = { ...write, product: current ? { ...write.product, id: current.id, version: current.version } : write.product };
      } else if (write.operation === "set_product_status") {
        const current = stateRef.current.products.find((product) => product.id === write.productId);
        latestWrite = { ...write, expectedVersion: current?.version ?? write.expectedVersion };
      }
      const response = await fetch("/api/seller/studio", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(latestWrite),
      });
      const result = await response.json().catch(() => ({})) as Record<string, unknown>;
      if (!response.ok) {
        if ((latestWrite.operation === "save_product" || latestWrite.operation === "set_product_status") && typeof result.currentVersion === "number") {
          const productId = latestWrite.operation === "save_product" ? latestWrite.product.id : latestWrite.productId;
          if (productId) commit((current) => ({
            ...current,
            products: current.products.map((product) => product.id === productId ? {
              ...product,
              version: result.currentVersion as number,
              status: typeof result.currentStatus === "string" ? result.currentStatus as SellerStudioProduct["status"] : product.status,
            } : product),
          }));
        }
        const code = typeof result.code === "string" ? result.code : typeof result.error === "string" ? result.error : "SAVE_FAILED";
        const message = typeof result.message === "string" ? result.message : writeMessage(code);
        throw new Error(message);
      }
      errorRef.current = "";
      setPersistenceError("");
      onSuccess?.(result);
    };
    const task = writeQueueRef.current.then(execute);
    writeQueueRef.current = task.catch((error) => {
      const code = error instanceof Error ? error.message : "SAVE_FAILED";
      const message = code.includes(" ") ? code : writeMessage(code);
      errorRef.current = message;
      setPersistenceError(message);
    }).finally(() => setPendingWrites((count) => Math.max(0, count - 1)));
  }, [commit, persistenceEnabled]);

  const flushWrites = useCallback(async () => {
    await writeQueueRef.current;
    return !errorRef.current;
  }, []);

  const saveOnboardingStep = useCallback(async (input: SellerOnboardingWrite) => {
    if (!persistenceEnabled) {
      commit((current) => ({ ...current, sellerName: input.sellerName, onboardingStep: input.nextStep, onboardingComplete: input.complete }));
      return { saved: true };
    }

    errorRef.current = "";
    setPersistenceError("");
    setPendingWrites((count) => count + 1);
    try {
      const progress = { onboardingStep: input.nextStep, onboardingComplete: input.complete };
      const payload = input.currentStep === 0 || input.currentStep === 5
        ? { operation: "update_onboarding", ...progress, sellerName: input.sellerName }
        : input.currentStep === 4
          ? { operation: "save_product", product: { ...input.product, categoryId: input.productCategoryId }, onboarding: progress }
          : { operation: "save_store", store: { ...input.store, cityId: input.cityId, categoryIds: input.categoryIds }, onboarding: progress };
      const response = await fetch("/api/seller/studio", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({})) as Record<string, unknown>;
      if (!response.ok) {
        const code = typeof result.code === "string" ? result.code : typeof result.error === "string" ? result.error : "SAVE_FAILED";
        throw new Error(code);
      }

      const responseStore = result.store && typeof result.store === "object" && !Array.isArray(result.store) ? result.store as Record<string, unknown> : result;
      commit((current) => {
        const store = input.currentStep >= 1 && input.currentStep <= 3 ? {
          ...input.store,
          id: typeof responseStore.id === "string" ? responseStore.id : input.store.id,
          slug: typeof responseStore.slug === "string" ? responseStore.slug : input.store.slug,
          version: typeof responseStore.version === "number" ? responseStore.version : input.store.version,
          updatedAt: new Date().toISOString(),
        } : current.store;
        let products = current.products;
        if (input.currentStep === 4 && typeof result.id === "string") {
          const existing = current.products.find((product) => product.id === result.id || product.id === input.product.id);
          const savedProduct: SellerStudioProduct = {
            ...input.product,
            id: result.id,
            slug: typeof result.slug === "string" ? result.slug : existing?.slug ?? slugify(input.product.title),
            storeId: store.id || current.store.id,
            confirmedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            featured: existing?.featured ?? false,
            dropId: existing?.dropId,
            version: typeof result.version === "number" ? result.version : existing?.version ?? 1,
            variants: Array.isArray(result.variantIds) && result.variantIds.length === input.product.variants.length
              ? input.product.variants.map((variant, index) => ({ ...variant, id: String((result.variantIds as unknown[])[index]) }))
              : input.product.variants,
          };
          products = existing
            ? current.products.map((product) => product.id === existing.id ? savedProduct : product)
            : [savedProduct, ...current.products];
        }
        return { ...current, sellerName: input.sellerName, onboardingStep: input.nextStep, onboardingComplete: input.complete, store, products };
      });
      return {
        saved: true,
        created: result.created === true,
        store: input.currentStep >= 1 && input.currentStep <= 3 && typeof responseStore.id === "string"
          ? { id: responseStore.id, slug: String(responseStore.slug ?? input.store.slug), version: Number(responseStore.version ?? input.store.version) }
          : undefined,
        product: input.currentStep === 4 && typeof result.id === "string"
          ? { id: result.id, version: Number(result.version ?? input.product.version ?? 1), variantIds: Array.isArray(result.variantIds) ? result.variantIds.map(String) : [] }
          : undefined,
      };
    } catch (error) {
      const code = error instanceof Error ? error.message : "SAVE_FAILED";
      const message = writeMessage(code);
      errorRef.current = message;
      setPersistenceError(message);
      return { saved: false };
    } finally {
      setPendingWrites((count) => Math.max(0, count - 1));
    }
  }, [commit, persistenceEnabled]);

  const storeRequest = useCallback(async (payload: Record<string, unknown>, draft?: SellerStudioStore): Promise<StoreMutationResult> => {
    if (!persistenceEnabled) {
      if (draft) commit((current) => ({ ...current, store: draft }));
      return { saved: true, created: !draft?.id, store: draft };
    }
    errorRef.current = "";
    setPersistenceError("");
    setPendingWrites((count) => count + 1);
    try {
      const response = await fetch("/api/seller/studio", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({})) as Record<string, unknown>;
      if (!response.ok) {
        const code = typeof result.error === "string" ? result.error : "STORE_SAVE_FAILED";
        const message = writeMessage(code);
        errorRef.current = message;
        setPersistenceError(message);
        return { saved: false, error: message, requestId: typeof result.requestId === "string" ? result.requestId : undefined };
      }
      const row = result.store && typeof result.store === "object" && !Array.isArray(result.store) ? result.store as Record<string, unknown> : {};
      let persisted!: SellerStudioStore;
      commit((current) => {
        const base = draft ?? current.store;
        persisted = {
          ...base,
          id: typeof row.id === "string" ? row.id : base.id,
          slug: typeof row.slug === "string" ? row.slug : base.slug,
          version: typeof row.version === "number" ? row.version : base.version,
          operatingState: row.status === "published" ? "published" : row.status === "paused" ? "paused" : row.status === "archived" ? "archived" : "draft",
          updatedAt: new Date().toISOString(),
        };
        return { ...current, store: persisted, audit: [audit("store", persisted.id, String(payload.operation).replaceAll("_", " ")), ...current.audit] };
      });
      return { saved: true, created: result.created === true, firstPublication: result.firstPublication === true, store: persisted, requestId: typeof result.requestId === "string" ? result.requestId : undefined };
    } catch {
      const message = writeMessage("STORE_SAVE_FAILED");
      errorRef.current = message;
      setPersistenceError(message);
      return { saved: false, error: message };
    } finally {
      setPendingWrites((count) => Math.max(0, count - 1));
    }
  }, [commit, persistenceEnabled]);

  const saveStoreDraft = useCallback((store: SellerStudioStore) => storeRequest({ operation: "save_store_draft", store }, store), [storeRequest]);
  const publishStore = useCallback((storeId: string, expectedVersion: number) => storeRequest({ operation: "publish_store", storeId, expectedVersion }), [storeRequest]);
  const pauseStore = useCallback((storeId: string, expectedVersion: number) => storeRequest({ operation: "pause_store", storeId, expectedVersion }), [storeRequest]);
  const archiveStore = useCallback((storeId: string, expectedVersion: number) => storeRequest({ operation: "archive_store", storeId, expectedVersion }), [storeRequest]);

  const saveProduct = useCallback((input: SellerProductInput) => {
    let result!: SellerStudioProduct;
    commit((current) => {
      const existing = input.id ? current.products.find((product) => product.id === input.id) : undefined;
      const productId = existing?.id ?? (input.id && /^[0-9a-f-]{36}$/i.test(input.id) ? input.id : crypto.randomUUID());
      result = {
        ...input,
        id: productId,
        slug: existing?.slug ?? slugify(input.title),
        storeId: current.store.id,
        confirmedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: existing?.featured ?? false,
        dropId: existing?.dropId,
        version: existing?.version ?? 1,
      };
      const products = existing
        ? current.products.map((product) => (product.id === productId ? result : product))
        : [result, ...current.products];
      return {
        ...current,
        products,
        audit: [audit("product", productId, existing ? "Product updated" : "Product created"), ...current.audit],
      };
    });
    persist({ operation: "save_product", product: result }, (response) => {
      commit((current) => ({ ...current, products: current.products.map((product) => product.id === result.id ? {
        ...product,
        version: typeof response.version === "number" ? response.version : product.version,
        slug: typeof response.slug === "string" ? response.slug : product.slug,
        variants: Array.isArray(response.variantIds) && response.variantIds.length === product.variants.length
          ? product.variants.map((variant, index) => ({ ...variant, id: String((response.variantIds as unknown[])[index]) }))
          : product.variants,
      } : product) }));
    });
    return result;
  }, [commit, persist]);

  const duplicateProduct = useCallback((productId: string) => {
    const source = stateRef.current.products.find((product) => product.id === productId);
    if (!source) return null;
    return saveProduct({ ...productToInput(source), id: undefined, version: undefined, title: `${source.title} copy`, status: "draft" });
  }, [saveProduct]);

  const setProductStatus = useCallback((productId: string, status: SellerStudioProduct["status"]) => {
    const currentProduct = stateRef.current.products.find((product) => product.id === productId);
    commit((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === productId ? { ...product, status, updatedAt: new Date().toISOString() } : product,
      ),
      audit: [audit("product", productId, `Product ${status}`), ...current.audit],
    }));
    if (currentProduct) persist({ operation: "set_product_status", productId, status, expectedVersion: currentProduct.version }, (response) => {
      const row = response.product && typeof response.product === "object" && !Array.isArray(response.product) ? response.product as Record<string, unknown> : null;
      commit((current) => ({ ...current, products: current.products.map((product) => product.id === productId && typeof row?.version === "number" ? { ...product, version: row.version } : product) }));
    });
  }, [commit, persist]);

  const setAvailability = useCallback((productIds: string[], availability: Availability) => {
    commit((current) => ({
      ...current,
      products: current.products.map((product) =>
        productIds.includes(product.id)
          ? {
              ...product,
              availability,
              confirmedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              variants: product.variants.map((variant) => ({
                ...variant,
                available: availability !== "sold" && (variant.quantity ?? 1) > 0,
              })),
            }
          : product,
      ),
      audit: [audit("inventory", productIds.join(","), `${productIds.length} product availability set to ${availability}`), ...current.audit],
    }));
    persist({ operation: "set_availability", productIds, availability }, (response) => {
      const versions = new Map((Array.isArray(response.products) ? response.products : []).flatMap((row) => {
        if (!row || typeof row !== "object") return [];
        const record = row as Record<string, unknown>;
        return typeof record.id === "string" && typeof record.version === "number" ? [[record.id, record.version] as const] : [];
      }));
      commit((current) => ({ ...current, products: current.products.map((product) => versions.has(product.id) ? { ...product, version: versions.get(product.id)! } : product) }));
    });
  }, [commit, persist]);

  const saveDrop = useCallback((drop: Omit<SellerStudioDrop, "updatedAt">) => {
    const result = { ...drop, updatedAt: new Date().toISOString() };
    commit((current) => ({
      ...current,
      drops: current.drops.some((item) => item.id === drop.id)
        ? current.drops.map((item) => (item.id === drop.id ? result : item))
        : [result, ...current.drops],
      audit: [audit("drop", drop.id, "Drop saved"), ...current.audit],
    }));
    persist({ operation: "save_drop", drop });
    return result;
  }, [commit, persist]);

  const archiveDrop = useCallback((dropId: string) => {
    commit((current) => ({
      ...current,
      drops: current.drops.map((drop) =>
        drop.id === dropId ? { ...drop, status: "past", updatedAt: new Date().toISOString() } : drop,
      ),
      audit: [audit("drop", dropId, "Drop moved to past"), ...current.audit],
    }));
    persist({ operation: "archive_drop", dropId });
  }, [commit, persist]);

  const setEnquiryStatus = useCallback((enquiryId: string, status: SellerEnquiryStatus) => {
    commit((current) => ({
      ...current,
      enquiries: current.enquiries.map((enquiry) =>
        enquiry.id === enquiryId
          ? {
              ...enquiry,
              status,
              timeline: [
                ...enquiry.timeline,
                { id: id("timeline"), label: `Store marked this enquiry ${status.replaceAll("_", " ")}`, at: new Date().toISOString() },
              ],
            }
          : enquiry,
      ),
      audit: [audit("enquiry", enquiryId, `Enquiry status set to ${status}`), ...current.audit],
    }));
    persist({ operation: "set_enquiry_status", enquiryId, status });
  }, [commit, persist]);

  const markNotification = useCallback((notificationId: string, read = true) => {
    commit((current) => ({
      ...current,
      notifications: current.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read } : notification,
      ),
    }));
  }, [commit]);

  const markAllNotificationsRead = useCallback(() => {
    commit((current) => ({
      ...current,
      notifications: current.notifications.map((notification) => ({ ...notification, read: true })),
    }));
  }, [commit]);

  const updatePreferences = useCallback((patch: Partial<SellerStudioPreferences>) => {
    commit((current) => ({
      ...current,
      preferences: { ...current.preferences, ...patch },
      audit: [audit("settings", "preferences", "Seller preferences updated"), ...current.audit],
    }));
    persist({ operation: "update_preferences", preferences: patch });
  }, [commit, persist]);

  const updateSellerName = useCallback(async (sellerName: string) => {
    const normalizedName = sellerName.trim();
    if (!persistenceEnabled) {
      commit((current) => ({ ...current, sellerName: normalizedName }));
      return { saved: true };
    }
    errorRef.current = "";
    setPersistenceError("");
    setPendingWrites((count) => count + 1);
    try {
      const response = await fetch("/api/seller/studio", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ operation: "update_account", sellerName: normalizedName }),
      });
      const result = await response.json().catch(() => ({})) as Record<string, unknown>;
      if (!response.ok) {
        const message = writeMessage(typeof result.error === "string" ? result.error : "PROFILE_SAVE_FAILED");
        errorRef.current = message;
        setPersistenceError(message);
        return { saved: false, error: message };
      }
      commit((current) => ({
        ...current,
        sellerName: typeof result.sellerName === "string" ? result.sellerName : normalizedName,
        audit: [audit("settings", "account", "Seller name updated"), ...current.audit],
      }));
      return { saved: true };
    } catch {
      const message = "We couldn't update your seller name. Check your connection and retry.";
      errorRef.current = message;
      setPersistenceError(message);
      return { saved: false, error: message };
    } finally {
      setPendingWrites((count) => Math.max(0, count - 1));
    }
  }, [commit, persistenceEnabled]);

  const updateOnboarding = useCallback((patch: Pick<SellerStudioState, "onboardingStep" | "onboardingComplete"> & Partial<Pick<SellerStudioState, "sellerName" | "accountEmail">>) => {
    commit((current) => ({ ...current, ...patch }));
    persist({ operation: "update_onboarding", onboardingStep: patch.onboardingStep, onboardingComplete: patch.onboardingComplete, sellerName: patch.sellerName });
  }, [commit, persist]);

  const value = useMemo<SellerStudioContextValue>(() => ({
    state,
    hydrated,
    pendingWrites,
    persistenceError,
    clearPersistenceError: () => { errorRef.current = ""; setPersistenceError(""); },
    flushWrites,
    saveStoreDraft,
    publishStore,
    pauseStore,
    archiveStore,
    saveProduct,
    duplicateProduct,
    archiveProduct: (productId) => setProductStatus(productId, "archived"),
    restoreProduct: (productId) => setProductStatus(productId, "draft"),
    setAvailability,
    saveDrop,
    archiveDrop,
    setEnquiryStatus,
    markNotification,
    markAllNotificationsRead,
    updatePreferences,
    updateSellerName,
    updateOnboarding,
    saveOnboardingStep,
  }), [archiveDrop, archiveStore, duplicateProduct, flushWrites, hydrated, markAllNotificationsRead, markNotification, pauseStore, pendingWrites, persistenceError, publishStore, saveDrop, saveOnboardingStep, saveProduct, saveStoreDraft, setAvailability, setEnquiryStatus, setProductStatus, state, updateOnboarding, updatePreferences, updateSellerName]);

  return <SellerStudioContext.Provider value={value}>{children}</SellerStudioContext.Provider>;
}

export function useSellerStudio() {
  const value = useContext(SellerStudioContext);
  if (!value) throw new Error("useSellerStudio must be used within SellerStudioProvider");
  return value;
}

export function usePublishedSellerProducts() {
  const { state } = useSellerStudio();
  return state.products.filter((product) => product.status === "published");
}
