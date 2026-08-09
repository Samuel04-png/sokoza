import { describe, expect, it } from "vitest";
import { classifyProductVibes } from "@/lib/product-vibes";

const base = { title: "Piece", category: "Dresses", color: "Black", description: "", details: [], occasions: [] };

describe("automatic product vibe classification", () => {
  it("classifies quiet, clean pieces as Minimal", () => {
    expect(classifyProductVibes({ ...base, description: "A clean monochrome silhouette with a minimal finish." })).toContain("Minimal");
  });

  it("classifies relaxed daytime pieces as Street Ease", () => {
    expect(classifyProductVibes({ ...base, description: "An effortless everyday romper for brunch and weekends." })).toContain("Street Ease");
  });

  it("classifies evening pieces as After Dark", () => {
    expect(classifyProductVibes({ ...base, description: "A metallic statement piece for dinners and parties." })).toContain("After Dark");
  });

  it("can assign more than one supported vibe", () => {
    expect(classifyProductVibes({ ...base, description: "A sleek minimal bodycon look for evening dinners." })).toEqual(["Minimal", "After Dark"]);
  });

  it("always assigns a supported fallback", () => {
    expect(classifyProductVibes(base)).toEqual(["Minimal"]);
  });

  it("classifies imported catalog signals with canonical labels", () => {
    expect(classifyProductVibes({ ...base, title: "Navy Tailored Shorts", category: "Trousers", occasions: ["Everyday", "Work", "Weekend"] })).toEqual(["Minimal", "Street Ease"]);
    expect(classifyProductVibes({ ...base, title: "Pale Blue Corset Mini Dress", occasions: ["Dinner", "Event"] })).toEqual(["After Dark"]);
  });
});
