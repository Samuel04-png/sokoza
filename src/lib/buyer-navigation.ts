export const buyerDestinations = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/stores", label: "Stores" },
  { href: "/cart", label: "Cart" },
] as const;

export function isBuyerDestinationActive(href: (typeof buyerDestinations)[number]["href"], pathname: string) {
  if (href === "/") return pathname === "/";
  if (href === "/discover") {
    return pathname.startsWith("/discover") || pathname.startsWith("/drops/");
  }
  if (href === "/stores") return pathname.startsWith("/stores");
  return pathname.startsWith("/cart") || pathname.startsWith("/order-review");
}

