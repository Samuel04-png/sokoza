import type { Availability, VerificationLevel } from "@/lib/types";

export function formatPrice(value: number): string {
  return `K${new Intl.NumberFormat("en-ZM", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-ZM", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function availabilityLabel(value: Availability): string {
  const labels: Record<Availability, string> = {
    available: "Confirmed today",
    low: "Low stock · confirmed today",
    stale: "Not recently confirmed",
    sold: "Sold",
  };
  return labels[value];
}

export function verificationLabel(value: VerificationLevel): string {
  const labels: Record<VerificationLevel, string> = {
    whatsapp: "WhatsApp number verified",
    identity: "Identity verified",
    business: "Business verified",
  };
  return labels[value];
}

export function createReference(): string {
  const stamp = Date.now().toString(36).slice(-5).toUpperCase();
  return `SKZ-${stamp}`;
}
