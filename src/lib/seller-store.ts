const zambianMobilePattern = /^260[79]\d{8}$/;

export interface NormalizedWhatsApp {
  digits: string;
  e164: string;
  valid: boolean;
}

export function normalizeZambianWhatsApp(input: string): NormalizedWhatsApp {
  const compact = input.trim().replace(/[\s().-]/g, "");
  let digits = compact.startsWith("+") ? compact.slice(1) : compact;

  if (/^0[79]\d{8}$/.test(digits)) {
    digits = `260${digits.slice(1)}`;
  } else if (/^[79]\d{8}$/.test(digits)) {
    digits = `260${digits}`;
  }

  return {
    digits,
    e164: digits ? `+${digits}` : "",
    valid: zambianMobilePattern.test(digits),
  };
}

export function calculateStoreCompletion(store: {
  name: string;
  tagline: string;
  description: string;
  city: string;
  area: string;
  categories: string[];
  whatsapp: string;
  collection: string;
  delivery: string;
  exchanges: string;
  cancellation: string;
  avatarImage: string;
  coverImage: string;
}) {
  const checks = [
    Boolean(store.name.trim()),
    Boolean(store.tagline.trim()),
    Boolean(store.description.trim()),
    Boolean(store.city.trim()),
    Boolean(store.area.trim()),
    store.categories.length > 0,
    normalizeZambianWhatsApp(store.whatsapp).valid,
    Boolean(store.collection.trim()),
    Boolean(store.delivery.trim()),
    Boolean(store.exchanges.trim()),
    Boolean(store.cancellation.trim()),
    Boolean(store.avatarImage),
    Boolean(store.coverImage),
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
