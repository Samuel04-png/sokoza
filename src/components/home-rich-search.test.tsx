import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BuyerStateProvider } from "@/components/buyer-state";
import { HomeRichSearch } from "@/components/home-rich-search";
import { SellerStudioProvider } from "@/components/seller-studio-provider";
import { drops, products, stores } from "@/test/fixtures/marketplace";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
const storedValues = new Map<string, string>();
const localStorageMock: Storage = {
  get length() { return storedValues.size; },
  clear: () => storedValues.clear(),
  getItem: (key) => storedValues.get(key) ?? null,
  key: (index) => Array.from(storedValues.keys())[index] ?? null,
  removeItem: (key) => { storedValues.delete(key); },
  setItem: (key, value) => { storedValues.set(key, String(value)); },
};

vi.mock("next/navigation", () => ({ useRouter: () => navigation }));

describe("Home rich Discover search", () => {
  afterEach(cleanup);

  beforeEach(() => {
    navigation.push.mockReset();
    vi.stubGlobal("localStorage", localStorageMock);
    localStorage.clear();
  });

  function renderSearch() {
    render(
      <BuyerStateProvider>
        <SellerStudioProvider>
          <HomeRichSearch drops={drops} products={products} stores={stores} />
        </SellerStudioProvider>
      </BuyerStateProvider>,
    );
  }

  it("uses the same visual entity suggestions as Discover", async () => {
    renderSearch();
    const input = screen.getByRole("combobox", { name: "Search products and stores" });
    fireEvent.change(input, { target: { value: "NOIR" } });

    expect(await screen.findByRole("option", { name: "NOIR, store" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Ink Wrap Set, product" })).toBeInTheDocument();
    expect(document.querySelectorAll(".suggestion-image img").length).toBeGreaterThan(0);
  });

  it("supports direct keyboard selection and submitted Discover results", async () => {
    renderSearch();
    const input = screen.getByRole("combobox", { name: "Search products and stores" });
    fireEvent.change(input, { target: { value: "NOIR" } });
    await screen.findByRole("option", { name: "NOIR, store" });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(navigation.push).toHaveBeenCalledWith("/stores/noir-lusaka");

    navigation.push.mockReset();
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(navigation.push).toHaveBeenCalledWith("/discover?q=NOIR");
  });
});
