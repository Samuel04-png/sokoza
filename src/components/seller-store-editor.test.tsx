import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SellerStoreEditor } from "@/components/seller-store-editor";
import { emptySellerStudioState } from "@/lib/seller-studio-empty-state";

const studio = vi.hoisted(() => ({ useSellerStudio: vi.fn() }));
vi.mock("@/components/seller-studio-provider", () => ({ useSellerStudio: studio.useSellerStudio }));
vi.mock("@/components/smart-image", () => ({ SmartImage: ({ alt = "" }: { alt?: string }) => <span aria-label={alt} role="img" /> }));

const referenceData = {
  cities: [{ id: "ed6c393e-ad08-45c2-85df-f0e1680e9dc1", name: "Lusaka", slug: "lusaka" }],
  categories: [{ id: "7df757c4-a5ec-488c-b17f-0dfcf2c30f4c", name: "Dresses", slug: "dresses" }],
};

function store(status: "draft" | "published" = "draft") {
  return {
    ...emptySellerStudioState.store,
    id: "605a0c9b-fa9d-4245-85c8-4cb3865be89c",
    slug: "test-store",
    name: "Test Store",
    tagline: "Everyday womenswear and easy layers.",
    description: "A focused Store with current pieces for the release test.",
    city: "Lusaka",
    cityId: referenceData.cities[0].id,
    area: "Kabulonga",
    categories: ["Dresses"],
    categoryIds: [referenceData.categories[0].id],
    whatsapp: "+260971234567",
    collectionEnabled: true,
    collectionArea: "Kabulonga",
    collection: "Collection is available around Kabulonga, Lusaka.",
    deliveryEnabled: false,
    exchanges: "Exchange requests are reviewed within 48 hours.",
    cancellation: "Cancel before fulfilment is confirmed.",
    avatarImage: "/icon-192.png",
    coverImage: "/icon-512.png",
    operatingState: status,
    version: 1,
  };
}

function setup(overrides: Record<string, unknown> = {}) {
  const current = store((overrides.status as "draft" | "published") ?? "draft");
  const api = {
    state: { ...emptySellerStudioState, sellerName: "Tadala", accountEmail: "seller@example.com", store: current },
    pendingWrites: 0,
    saveStoreDraft: vi.fn().mockResolvedValue({ saved: true, store: { ...current, version: 2 } }),
    publishStore: vi.fn().mockResolvedValue({ saved: true, firstPublication: true, store: { ...current, operatingState: "published", version: 3 } }),
    pauseStore: vi.fn().mockResolvedValue({ saved: true, store: { ...current, operatingState: "paused", version: 2 } }),
    archiveStore: vi.fn().mockResolvedValue({ saved: true, store: { ...current, operatingState: "archived", version: 2 } }),
    ...overrides,
  };
  studio.useSellerStudio.mockReturnValue(api);
  render(<SellerStoreEditor referenceData={referenceData} />);
  return api;
}

describe("Seller Store feedback contract", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("shows routine success only after the server confirms an update", async () => {
    const api = setup();
    fireEvent.click(screen.getByRole("button", { name: "Save Store" }));
    await screen.findByText("Store draft saved.");
    expect(api.saveStoreDraft).toHaveBeenCalledTimes(1);
  });

  it("shows Store updated for an authoritative live-Store save", async () => {
    setup({ status: "published" });
    fireEvent.click(screen.getByRole("button", { name: "Save Store" }));
    await screen.findByText("Store updated.");
  });

  it("shows the creation milestone only after the first Store is persisted", async () => {
    setup({ saveStoreDraft: vi.fn().mockResolvedValue({ saved: true, created: true, store: { ...store(), version: 2 } }) });
    fireEvent.click(screen.getByRole("button", { name: "Save Store" }));
    await screen.findByText("Welcome to SOKOZA, Tadala.");
  });

  it("retains the form and never shows success after a failed save", async () => {
    setup({ saveStoreDraft: vi.fn().mockResolvedValue({ saved: false, error: "We couldn't save your changes." }) });
    fireEvent.click(screen.getByRole("button", { name: "Save Store" }));
    await screen.findAllByText("We couldn't save your changes.");
    expect(screen.queryByText("Store draft saved.")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Store")).toBeInTheDocument();
  });

  it("shows the live milestone only after authoritative first publication", async () => {
    const api = setup();
    fireEvent.click(screen.getByRole("button", { name: "Publish Store" }));
    await screen.findByText("Test Store is now live on SOKOZA.");
    expect(api.publishStore).toHaveBeenCalledWith(store().id, 2);
  });

  it("never shows the live milestone when publication fails", async () => {
    setup({ publishStore: vi.fn().mockResolvedValue({ saved: false, error: "We couldn't publish this Store." }) });
    fireEvent.click(screen.getByRole("button", { name: "Publish Store" }));
    await screen.findAllByText("We couldn't publish this Store.");
    expect(screen.queryByText("You're live")).not.toBeInTheDocument();
  });

  it("requires confirmation before pausing", async () => {
    const api = setup({ status: "published" });
    fireEvent.click(screen.getByRole("button", { name: "Pause Store" }));
    expect(api.pauseStore).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "Pause Store" }).at(-1)!);
    await waitFor(() => expect(api.pauseStore).toHaveBeenCalledTimes(1));
    await screen.findByText("Store paused.");
  });

  it("requires confirmation before archiving and confirms only after success", async () => {
    const api = setup();
    fireEvent.click(screen.getByRole("button", { name: "Archive Store" }));
    expect(api.archiveStore).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "Archive Store" }).at(-1)!);
    await waitFor(() => expect(api.archiveStore).toHaveBeenCalledTimes(1));
    await screen.findByText("Store archived.");
  });
});
