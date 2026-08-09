import { NextResponse } from "next/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { DiscoverSuggestion, DiscoverSuggestionGroup } from "@/lib/discover-search";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 120) ?? "";
  if (query.length < 2) return NextResponse.json({ groups: [] });
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.rpc("search_marketplace", { p_query: query, p_limit: 16 });
  if (error || !Array.isArray(data)) return NextResponse.json({ groups: [] }, { status: error ? 503 : 200 });

  const grouped = new Map<DiscoverSuggestionGroup["label"], DiscoverSuggestion[]>();
  for (const raw of data as Array<Record<string, unknown>>) {
    const entityType = String(raw.entity_type ?? "");
    const id = String(raw.entity_id ?? "");
    const slug = String(raw.slug ?? "");
    const imagePath = typeof raw.image_path === "string" ? raw.image_path : "";
    const score = -Number(raw.relevance ?? 0);
    if (entityType === "product") {
      const image = imagePath ? supabase.storage.from("product-media").getPublicUrl(imagePath).data.publicUrl : "";
      const item: DiscoverSuggestion = { id: `product-${id}`, type: "product", label: String(raw.title), image, storeName: String(raw.subtitle ?? "Store"), price: Number(raw.price ?? 0), availability: "available", score, href: `/products/${slug}` };
      grouped.set("Pieces", [...(grouped.get("Pieces") ?? []), item]);
    } else if (entityType === "store") {
      const image = imagePath ? supabase.storage.from("store-media").getPublicUrl(imagePath).data.publicUrl : "";
      const item: DiscoverSuggestion = { id: `store-${id}`, type: "store", label: String(raw.title), image, location: "Zambia", descriptor: String(raw.subtitle ?? ""), score, href: `/stores/${slug}` };
      grouped.set("Stores", [...(grouped.get("Stores") ?? []), item]);
    } else if (entityType === "drop") {
      const image = imagePath ? supabase.storage.from("store-media").getPublicUrl(imagePath).data.publicUrl : "";
      const item: DiscoverSuggestion = { id: `drop-${id}`, type: "drop", label: String(raw.title), image, storeName: String(raw.subtitle ?? "Store"), score, href: `/drops/${slug}` };
      grouped.set("Drops", [...(grouped.get("Drops") ?? []), item]);
    }
  }
  const labels: DiscoverSuggestionGroup["label"][] = ["Stores", "Pieces", "Drops"];
  const groups = labels.flatMap((label) => grouped.has(label) ? [{ label, items: (grouped.get(label) ?? []).slice(0, label === "Pieces" ? 5 : 3) }] : []);
  return NextResponse.json({ groups }, { headers: { "cache-control": "private, max-age=15" } });
}
