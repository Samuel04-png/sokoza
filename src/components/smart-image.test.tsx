import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SmartImage } from "@/components/smart-image";

vi.mock("@/components/buyer-state", () => ({
  useBuyerState: () => ({ preferences: { reducedData: false } }),
}));

describe("SmartImage", () => {
  it("routes public Supabase media through responsive Smart CDN transforms", () => {
    render(<SmartImage alt="Store cover" height={300} src="https://kzixedushlpthxehqoho.supabase.co/storage/v1/object/public/store-media/seller/store/cover.png" width={600} />);
    const source = screen.getByRole("img", { name: "Store cover" }).getAttribute("src") ?? "";
    expect(source).toContain("/storage/v1/render/image/public/");
    expect(source).toMatch(/[?&]width=\d+/);
  });
});
