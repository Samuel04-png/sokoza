import { permanentRedirect } from "next/navigation";

interface SearchRedirectPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function preservedQuery(params: Record<string, string | string[] | undefined>) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((item) => next.append(key, item));
    else if (value !== undefined) next.set(key, value);
  }
  if (next.size === 0) next.set("mode", "search");
  return next.toString();
}

export default async function SearchRedirectPage({ searchParams }: SearchRedirectPageProps) {
  permanentRedirect(`/discover?${preservedQuery(await searchParams)}`);
}
