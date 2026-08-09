import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SOKOZA — Local Fashion",
    short_name: "SOKOZA",
    description:
      "Discover current fashion from Lusaka stores and prepare seller-specific WhatsApp enquiries.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fcf9f8",
    theme_color: "#fcf9f8",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icons/sokoza-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/sokoza-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    shortcuts: [
      { name: "Discover", short_name: "Discover", url: "/discover" },
      { name: "Stores", short_name: "Stores", url: "/stores" },
      { name: "Cart", short_name: "Cart", url: "/cart" },
    ],
  };
}
