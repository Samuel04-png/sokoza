import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchLanding } from "@/components/search-landing";
import { BuyerStateProvider } from "@/components/buyer-state";
import { SellerStudioProvider } from "@/components/seller-studio-provider";
import { drops, products, stores } from "@/test/fixtures/marketplace";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
const storedValues = new Map<string, string>();
const localStorageMock: Storage = {
  get length() {
    return storedValues.size;
  },
  clear: () => storedValues.clear(),
  getItem: (key) => storedValues.get(key) ?? null,
  key: (index) => Array.from(storedValues.keys())[index] ?? null,
  removeItem: (key) => {
    storedValues.delete(key);
  },
  setItem: (key, value) => {
    storedValues.set(key, String(value));
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => navigation,
}));

describe("Discover search entry", () => {
  afterEach(cleanup);

  beforeEach(() => {
    navigation.push.mockReset();
    vi.stubGlobal("localStorage", localStorageMock);
    localStorage.clear();
    window.history.replaceState(null, "", "/discover");
  });

  function renderSearch(children = <p>Browse visual collections</p>) {
    return render(
      <BuyerStateProvider>
        <SellerStudioProvider>
          <SearchLanding drops={drops} products={products} stores={stores}>
            {children}
          </SearchLanding>
        </SellerStudioProvider>
      </BuyerStateProvider>,
    );
  }

  it("moves from browse to focused search without adding another destination", () => {
    renderSearch();

    expect(screen.getByText("Browse visual collections")).toBeInTheDocument();
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.queryByText("Browse visual collections")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Try these" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Stores to find" })).toBeInTheDocument();
  });

  it("shows visual grouped autocomplete and routes a submitted query through Discover", async () => {
    renderSearch();

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "noi" } });
    expect(await screen.findByRole("heading", { name: "Stores" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "NOIR, store" })).toBeInTheDocument();
    expect(document.querySelectorAll(".suggestion-image img").length).toBeGreaterThan(0);

    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(navigation.push).toHaveBeenCalledWith("/discover?q=noi");
    expect(JSON.parse(localStorage.getItem("sokoza-recent-searches-v1") ?? "[]")).toEqual(["noi"]);
  });

  it("does not submit an empty query", () => {
    renderSearch();
    fireEvent.submit(screen.getByRole("combobox").closest("form") as HTMLFormElement);
    expect(navigation.push).not.toHaveBeenCalled();
  });

  it("supports arrow selection, direct navigation, and Escape without clearing the query", async () => {
    renderSearch();
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "NOIR" } });
    await screen.findByRole("option", { name: "NOIR, store" });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("store-store-noir"));
    fireEvent.keyDown(input, { key: "Enter" });
    expect(navigation.push).toHaveBeenCalledWith("/stores/noir-lusaka");

    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("NOIR");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});
