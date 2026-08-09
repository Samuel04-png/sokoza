import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Seller Studio",
    template: "%s · SOKOZA Seller Studio",
  },
  description: "Operate a SOKOZA store, keep inventory current, and manage qualified enquiries.",
};

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
