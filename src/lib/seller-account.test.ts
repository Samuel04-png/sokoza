import { describe, expect, it } from "vitest";
import { canUseLocalSellerAuthBypass, sellerEmailChangeMessage } from "@/lib/seller-account";

describe("seller email change errors", () => {
  it("explains duplicate addresses", () => {
    expect(sellerEmailChangeMessage({ status: 422, code: "email_exists" })).toContain("another SOKOZA account");
  });

  it("explains rejected addresses", () => {
    expect(sellerEmailChangeMessage({ status: 422, code: "email_address_invalid" })).toContain("rejected");
  });

  it("explains security reauthentication", () => {
    expect(sellerEmailChangeMessage({ status: 422, code: "reauthentication_needed" })).toContain("sign out and sign in again");
  });

  it("recognizes rate limits by status", () => {
    expect(sellerEmailChangeMessage({ status: 429 })).toContain("Wait a few minutes");
  });
});

describe("local seller auth bypass boundary", () => {
  it("allows local development only", () => {
    expect(canUseLocalSellerAuthBypass("development", "http://localhost:3000")).toBe(true);
    expect(canUseLocalSellerAuthBypass("development", "http://127.0.0.1:3000")).toBe(true);
    expect(canUseLocalSellerAuthBypass("production", "http://localhost:3000")).toBe(false);
    expect(canUseLocalSellerAuthBypass("development", "https://sokoza.example")).toBe(false);
  });
});
