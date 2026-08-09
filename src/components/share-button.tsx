"use client";

import { useBuyerState } from "@/components/buyer-state";
import { Icon } from "@/components/icon";

export function ShareButton({
  className = "button secondary",
  label,
  text,
}: {
  className?: string;
  label: string;
  text: string;
}) {
  const { announce } = useBuyerState();

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: label, text, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        announce("Link copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      announce("Sharing is unavailable. Copy the address from your browser.");
    }
  }

  const iconOnly = className.includes("icon-button");
  return (
    <button
      aria-label={iconOnly ? `Share ${label}` : undefined}
      className={className}
      onClick={share}
      type="button"
    >
      <Icon name="share" size={18} /> {iconOnly ? null : "Share"}
    </button>
  );
}
