import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SellerRecoveryForm, SellerSignInForm } from "@/components/seller-auth-form";

describe("seller authentication presentation", () => {
  afterEach(cleanup);

  it("presents a production seller sign-in without seeded credentials", () => {
    const startSession = vi.fn();
    render(<SellerSignInForm startSession={startSession} />);
    expect(screen.getByLabelText("Email address")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Sign in to Seller Studio" })).toBeInTheDocument();
    expect(screen.queryByText(/prepared credentials|Stage 1|mock repository/i)).not.toBeInTheDocument();
  });

  it("submits recovery through the protected server action", () => {
    const recover = vi.fn();
    render(<SellerRecoveryForm recover={recover} />);
    expect(screen.getByLabelText("Email address")).toHaveAttribute("type", "email");
    expect(screen.getByRole("button", { name: "Send recovery link" })).toBeInTheDocument();
  });
});
