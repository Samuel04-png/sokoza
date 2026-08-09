import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SmartImage } from "@/components/smart-image";

vi.mock("@/components/buyer-state", () => ({
  useBuyerState: () => ({ preferences: { reducedData: false } }),
}));

describe("SmartImage", () => {
  it("loads public Supabase media directly instead of through the timing-out optimizer", () => {
    render(<SmartImage alt="Store cover" height={300} src="https://kzixedushlpthxehqoho.supabase.co/storage/v1/object/public/store-media/seller/store/cover.png" width={600} />);
    expect(screen.getByRole("img", { name: "Store cover" }).getAttribute("src")).toBe("https://kzixedushlpthxehqoho.supabase.co/storage/v1/object/public/store-media/seller/store/cover.png");
  });
});
