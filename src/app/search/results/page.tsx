import { permanentRedirect } from "next/navigation";

interface ResultsRedirectPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResultsRedirectPage({ searchParams }: ResultsRedirectPageProps) {
  const params = await searchParams;
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((item) => next.append(key, item));
    else if (value !== undefined) next.set(key, value);
  }
  const query = next.toString();
  permanentRedirect(query ? `/discover?${query}` : "/discover");
}
