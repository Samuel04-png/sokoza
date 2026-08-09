import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "@/app/error";
import { AppShell } from "@/components/app-shell";
import { BuyerStateProvider } from "@/components/buyer-state";

vi.mock("next/navigation", () => ({
  usePathname: () => "/discover",
}));

const storedValues = new Map<string, string>();
const storage: Storage = {
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

describe("buyer resilience states", () => {
  beforeEach(() => {
    storedValues.clear();
    Object.defineProperty(window, "localStorage", { configurable: true, value: storage });
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
  });

  it("announces offline mode and clears it when connectivity returns", async () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });
    render(
      <BuyerStateProvider>
        <AppShell>
          <p>Buyer content</p>
        </AppShell>
      </BuyerStateProvider>,
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "You’re offline. Saved shopping data remains available on this device.",
    );

    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
    fireEvent(window, new Event("online"));
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });

  it("keeps local-data reassurance and exposes a working retry action on route errors", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("Catalog unavailable")} reset={reset} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your local Saved items and Cart have not been cleared.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
