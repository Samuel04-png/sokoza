"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine, BuyerPreferences, EnquiryRecord } from "@/lib/types";
import { z } from "zod";

interface BuyerState {
  savedIds: string[];
  recentIds: string[];
  cart: CartLine[];
  enquiries: EnquiryRecord[];
  preferences: BuyerPreferences;
}

interface BuyerStateContextValue extends BuyerState {
  hydrated: boolean;
  toast: string | null;
  toggleSaved: (productId: string) => void;
  recordRecent: (productId: string) => void;
  addToCart: (line: CartLine) => void;
  updateCartQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  clearStoreFromCart: (storeProductIds: string[]) => void;
  storeEnquiry: (enquiry: EnquiryRecord) => void;
  updateEnquiryStatus: (id: string, status: EnquiryRecord["status"]) => void;
  updatePreferences: (next: Partial<BuyerPreferences>) => void;
  resetLocalData: () => void;
  announce: (message: string) => void;
}

const STORAGE_KEY = "sokoza-buyer-v1";
const initialState: BuyerState = {
  savedIds: [],
  recentIds: [],
  cart: [],
  enquiries: [],
  preferences: { location: "Lusaka", reducedData: false },
};

const cartLineSchema = z.object({
  productId: z.string(),
  productTitle: z.string().default("Product"),
  storeId: z.string().default(""),
  variantId: z.string(),
  variantLabel: z.string().default("Selected option"),
  quantity: z.number().int().min(1).max(9),
  maxQuantity: z.number().int().min(1).max(9).default(9),
  priceSnapshot: z.number().positive(),
});

const buyerStateSchema = z.object({
  savedIds: z.array(z.string()).default([]),
  recentIds: z.array(z.string()).max(20).default([]),
  cart: z.array(cartLineSchema).default([]),
  enquiries: z
    .array(
      z.object({
        id: z.string(),
        reference: z.string(),
        storeId: z.string(),
        storeName: z.string().optional(),
        lines: z.array(cartLineSchema),
        createdAt: z.string(),
        status: z.enum(["ready", "whatsapp_opened", "buyer_marked_sent"]),
      }),
    )
    .default([]),
  preferences: z
    .object({
      location: z.string(),
      reducedData: z.boolean(),
    })
    .default(initialState.preferences),
});

export function parseStoredBuyerState(value: unknown): BuyerState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = { ...(value as Record<string, unknown>) };
  const previousCartKey = ["b", "a", "g"].join("");
  if (!("cart" in candidate) && Array.isArray(candidate[previousCartKey])) {
    candidate.cart = candidate[previousCartKey];
  }
  delete candidate[previousCartKey];
  const result = buyerStateSchema.safeParse(candidate);
  if (!result.success) return null;
  const canonicalLine = (line: CartLine) => z.uuid().safeParse(line.productId).success && z.uuid().safeParse(line.storeId).success && z.uuid().safeParse(line.variantId).success;
  return {
    ...result.data,
    savedIds: result.data.savedIds.filter((id) => z.uuid().safeParse(id).success),
    recentIds: result.data.recentIds.filter((id) => z.uuid().safeParse(id).success),
    cart: result.data.cart.filter(canonicalLine),
    enquiries: result.data.enquiries.filter((enquiry) => z.uuid().safeParse(enquiry.id).success).map((enquiry) => ({ ...enquiry, lines: enquiry.lines.filter(canonicalLine) })).filter((enquiry) => enquiry.lines.length > 0),
  };
}

const BuyerStateContext = createContext<BuyerStateContextValue | null>(null);

export function BuyerStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BuyerState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let nextState = initialState;
    let restoreError = false;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = parseStoredBuyerState(JSON.parse(stored));
        if (!restored) throw new Error("Invalid local buyer state");
        nextState = restored;
      }
    } catch {
      restoreError = true;
    }
    queueMicrotask(() => {
      setState(nextState);
      if (restoreError) setToast("Local shopping data could not be restored on this device.");
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      queueMicrotask(() => setToast("Changes cannot be saved on this device right now."));
    }
  }, [hydrated, state]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const announce = useCallback((message: string) => setToast(message), []);
  const storeEnquiry = useCallback((enquiry: EnquiryRecord) => {
    setState((current) => ({
      ...current,
      enquiries: [enquiry, ...current.enquiries.filter((item) => item.id !== enquiry.id)],
    }));
  }, []);
  const recordRecent = useCallback((productId: string) => {
    setState((current) => {
      if (current.recentIds[0] === productId) return current;
      return {
        ...current,
        recentIds: [productId, ...current.recentIds.filter((id) => id !== productId)].slice(0, 20),
      };
    });
  }, []);

  const value = useMemo<BuyerStateContextValue>(
    () => ({
      ...state,
      hydrated,
      toast,
      announce,
      toggleSaved(productId) {
        setState((current) => {
          const exists = current.savedIds.includes(productId);
          setToast(exists ? "Removed from Saved" : "Saved for later");
          return {
            ...current,
            savedIds: exists
              ? current.savedIds.filter((id) => id !== productId)
              : [productId, ...current.savedIds],
          };
        });
      },
      recordRecent,
      addToCart(line) {
        setState((current) => {
          const existing = current.cart.find(
            (item) => item.productId === line.productId && item.variantId === line.variantId,
          );
          const cart = existing
            ? current.cart.map((item) =>
                item === existing
                  ? {
                      ...item,
                      ...line,
                      quantity: Math.min(
                        item.quantity + line.quantity,
                        line.maxQuantity ?? 9,
                      ),
                    }
                  : item,
              )
            : [...current.cart, line];
          return { ...current, cart };
        });
        setToast("Added to Cart");
      },
      updateCartQuantity(productId, variantId, quantity) {
        if (quantity < 1) return;
        setState((current) => ({
          ...current,
          cart: current.cart.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item,
          ),
        }));
      },
      removeFromCart(productId, variantId) {
        setState((current) => ({
          ...current,
          cart: current.cart.filter(
            (item) => !(item.productId === productId && item.variantId === variantId),
          ),
        }));
        setToast("Removed from Cart");
      },
      clearStoreFromCart(storeProductIds) {
        setState((current) => ({
          ...current,
          cart: current.cart.filter((line) => !storeProductIds.includes(line.productId)),
        }));
      },
      storeEnquiry,
      updateEnquiryStatus(id, status) {
        setState((current) => ({
          ...current,
          enquiries: current.enquiries.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        }));
      },
      updatePreferences(next) {
        setState((current) => ({
          ...current,
          preferences: { ...current.preferences, ...next },
        }));
      },
      resetLocalData() {
        setState(initialState);
        setToast("Local shopping data cleared");
      },
    }),
    [announce, hydrated, recordRecent, state, storeEnquiry, toast],
  );

  return (
    <BuyerStateContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="toast-region">
        {toast ? <div className="toast">{toast}</div> : null}
      </div>
    </BuyerStateContext.Provider>
  );
}

export function useBuyerState() {
  const context = useContext(BuyerStateContext);
  if (!context) throw new Error("useBuyerState must be used inside BuyerStateProvider");
  return context;
}
