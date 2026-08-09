"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AccessibleDialog } from "@/components/accessible-dialog";
import { Icon } from "@/components/icon";

export function SellerSnackbar({ message, tone = "success", onDismiss }: { message: string; tone?: "success" | "error"; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, tone === "error" ? 6500 : 4200);
    return () => window.clearTimeout(timer);
  }, [onDismiss, tone]);
  return (
    <div aria-atomic="true" aria-live="polite" className="seller-feedback-region">
      <div className={`seller-snackbar tone-${tone}`} role="status">
        <Icon name={tone === "success" ? "tick" : "alert"} size={18} />
        <span>{message}</span>
        <button aria-label="Dismiss notification" onClick={onDismiss} type="button"><Icon name="close" size={16} /></button>
      </div>
    </div>
  );
}

export function SellerMilestone({ kind, sellerName, storeName, storeHref, onClose }: { kind: "created" | "published"; sellerName: string; storeName: string; storeHref?: string; onClose: () => void }) {
  const published = kind === "published";
  return (
    <AccessibleDialog className="seller-milestone" labelledBy="seller-milestone-title" onClose={onClose}>
      <div aria-hidden="true" className="seller-milestone-mark"><span /><Icon name="tick" size={30} /></div>
      <p className="eyebrow">{published ? "You're live" : "Your Store is created"}</p>
      <h2 id="seller-milestone-title">{published ? `${storeName} is now live on SOKOZA.` : `Welcome to SOKOZA, ${sellerName}.`}</h2>
      <p>{published
        ? "Shoppers can discover your Store and view your published pieces."
        : `${storeName} now has a home on SOKOZA. Finish your setup and publish when you're ready for shoppers to discover it.`}</p>
      <div className="seller-dialog-actions">
        {published && storeHref ? <Link className="button primary" href={storeHref} onClick={onClose}>View my Store</Link> : <button className="button primary" onClick={onClose} type="button">Continue setup</button>}
        {published ? <Link className="button secondary" href="/seller" onClick={onClose}>Go to Seller Studio</Link> : <Link className="button secondary" href="/seller/store" onClick={onClose}>Preview Store</Link>}
      </div>
    </AccessibleDialog>
  );
}
