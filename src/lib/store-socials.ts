const SOCIAL_HOSTS = {
  facebook: new Set(["facebook.com", "www.facebook.com", "m.facebook.com", "fb.com", "www.fb.com"]),
  tiktok: new Set(["tiktok.com", "www.tiktok.com"]),
} as const;

export type StoreSocialNetwork = keyof typeof SOCIAL_HOSTS;

export function normalizeStoreSocialUrl(value: string, network: StoreSocialNetwork) {
  const input = value.trim();
  if (!input) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (url.protocol !== "https:" || !SOCIAL_HOSTS[network].has(url.hostname.toLowerCase())) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
