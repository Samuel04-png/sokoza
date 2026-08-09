import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Buyer privacy"
      icon="shield"
      intro="The buyer preview is guest-first and keeps shopping state in the current browser."
      sections={[
        {
          title: "Stored on this device",
          body: <p>Saved products, Recently Viewed, Cart contents, enquiry references and basic preferences are stored locally so the buyer experience works without an account.</p>,
        },
        {
          title: "Leaving for WhatsApp",
          body: <p>When you open WhatsApp, the destination is a separate service governed by its own privacy terms. The prepared message includes the products and note you chose.</p>,
        },
        {
          title: "Your controls",
          body: <p>Use Settings to clear all local shopping data. Clearing browser storage has the same effect and cannot be restored without a future optional account.</p>,
        },
        {
          title: "Before public release",
          body: <p>A final privacy notice must document production analytics, server-side order intents, retention, seller data and user rights after legal and technical review.</p>,
        },
      ]}
      title="What stays with you"
    />
  );
}
