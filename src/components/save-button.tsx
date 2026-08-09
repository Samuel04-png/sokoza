"use client";

import { Icon } from "@/components/icon";
import { useBuyerState } from "@/components/buyer-state";
import { useMarketplaceSignals } from "@/components/marketplace-signals-provider";

export function SaveButton({ productId, storeId, quiet = false }: { productId: string; storeId: string; quiet?: boolean }) {
  const { savedIds, toggleSaved } = useBuyerState();
  const { capture } = useMarketplaceSignals();
  const saved = savedIds.includes(productId);

  return (
    <button
      aria-label={saved ? "Remove from Saved" : "Save product"}
      aria-pressed={saved}
      className={`save-button ${saved ? "saved" : ""} ${quiet ? "quiet" : ""}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!saved) capture("saved_product", { productId, storeId });
        toggleSaved(productId);
      }}
      type="button"
    >
      <Icon name="save" size={20} />
    </button>
  );
}
