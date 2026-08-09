import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SellerOnboarding } from "@/components/seller-onboarding";
import { initialSellerStudioState, SellerStudioProvider } from "@/components/seller-studio-provider";
import { BuyerStateProvider } from "@/components/buyer-state";

const referenceData = {
  cities: [{ id: "11111111-1111-4111-8111-111111111111", name: "Lusaka", slug: "lusaka" }],
  categories: [{ id: "22222222-2222-4222-8222-222222222222", name: "Dresses", slug: "dresses" }],
};

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const storedValues = new Map<string, string>();
const storage: Storage = {
  get length() { return storedValues.size; },
  clear: () => storedValues.clear(),
  getItem: (key) => storedValues.get(key) ?? null,
  key: (index) => Array.from(storedValues.keys())[index] ?? null,
  removeItem: (key) => { storedValues.delete(key); },
  setItem: (key, value) => { storedValues.set(key, String(value)); },
};

describe("seller onboarding", () => {
  beforeEach(() => {
    storedValues.clear();
    Object.defineProperty(window, "localStorage", { configurable: true, value: storage });
    vi.stubGlobal("scrollTo", vi.fn());
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("progresses through named setup steps using canonical reference selectors", async () => {
    render(<SellerStudioProvider><BuyerStateProvider><SellerOnboarding referenceData={referenceData} /></BuyerStateProvider></SellerStudioProvider>);
    expect(screen.getByRole("heading", { name: "Who operates this Store?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save and shape Store" }));
    expect(await screen.findByRole("heading", { name: "Give the Store a clear point of view." })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "City" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Dresses" })).toBeInTheDocument();
  });

  it("uses one request for Account → Store and does not advance when persistence fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ code: "ONBOARDING_SAVE_FAILED" }) });
    vi.stubGlobal("fetch", fetchMock);
    const initialState = { ...initialSellerStudioState, sellerName: "Alice", accountEmail: "alice@example.com" };
    render(<SellerStudioProvider initialState={initialState}><BuyerStateProvider><SellerOnboarding referenceData={referenceData} /></BuyerStateProvider></SellerStudioProvider>);

    fireEvent.change(screen.getByRole("textbox", { name: "Seller name" }), { target: { value: "Alice Banda" } });
    fireEvent.click(screen.getByRole("button", { name: "Save and shape Store" }));

    expect(await screen.findByText(/changes are still here/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Who operates this Store?" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Seller name" })).toHaveValue("Alice Banda");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("advances only after one authoritative Account save succeeds", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    const initialState = { ...initialSellerStudioState, sellerName: "Alice", accountEmail: "alice@example.com" };
    render(<SellerStudioProvider initialState={initialState}><BuyerStateProvider><SellerOnboarding referenceData={referenceData} /></BuyerStateProvider></SellerStudioProvider>);

    fireEvent.click(screen.getByRole("button", { name: "Save and shape Store" }));

    expect(await screen.findByRole("heading", { name: "Give the Store a clear point of view." })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the persisted step stable across visibility changes", () => {
    const initialState = { ...initialSellerStudioState, sellerName: "Alice", accountEmail: "alice@example.com", onboardingStep: 5 };
    render(<SellerStudioProvider initialState={initialState}><BuyerStateProvider><SellerOnboarding referenceData={referenceData} /></BuyerStateProvider></SellerStudioProvider>);
    expect(screen.getByRole("heading", { name: "Review what is ready." })).toBeInTheDocument();
    document.dispatchEvent(new Event("visibilitychange"));
    expect(screen.getByRole("heading", { name: "Review what is ready." })).toBeInTheDocument();
    expect(screen.getByText("Store setup checks ready")).toBeInTheDocument();
    expect(screen.getByText("Buyer expectations").closest("li")).toHaveClass("incomplete");
  });
});
