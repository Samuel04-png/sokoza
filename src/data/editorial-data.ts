import type { DiscoveryCollection } from "@/lib/types";

const editorialImage = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=82`;

// Brand-controlled editorial media remains available when the marketplace has
// no seller inventory. These are presentation assets, never Product records.
export const homeEditorialImage = editorialImage("photo-1539109136881-3be0616acf4b");
export const sellerEditorialImage = editorialImage("photo-1515886657613-9f3515b0c78f");

// Editorial browse prompts are taxonomy/navigation, never marketplace entities.
export const discoveryCollections: DiscoveryCollection[] = [
  { id: "vibe-minimal", title: "Quiet forms", subtitle: "Minimal", image: editorialImage("photo-1539109136881-3be0616acf4b"), href: "/discover?vibe=Minimal", tone: "ink" },
  { id: "vibe-made-here", title: "Cut in Zambia", subtitle: "Made Here", image: editorialImage("photo-1515886657613-9f3515b0c78f"), href: "/discover?madeHere=true", tone: "olive" },
  { id: "vibe-street", title: "Street ease", subtitle: "Everyday", image: editorialImage("photo-1542291026-7eec264c27ff"), href: "/discover?vibe=Street%20Ease", tone: "light" },
  { id: "vibe-after-dark", title: "After dark", subtitle: "Evening", image: editorialImage("photo-1509631179647-0177331693ae"), href: "/discover?vibe=After%20Dark", tone: "terracotta" },
];
