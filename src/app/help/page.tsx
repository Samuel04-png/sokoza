import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Help" };

export default function HelpPage() {
  return (
    <InfoPage
      eyebrow="Buyer help"
      icon="help"
      intro="How discovery, local shopping data, store-specific Cart groups and WhatsApp enquiries work."
      sections={[
        {
          title: "Finding a piece",
          body: <p>Use Search when you know what you want. Use Discover for categories, occasions, stores, live Drops and visual collections.</p>,
        },
        {
          title: "Cart and order review",
          body: <p>Your Cart is grouped by store. Review one store at a time so current price, size and availability can be checked before the message is prepared.</p>,
        },
        {
          title: "After WhatsApp opens",
          body: <p>The message remains editable. The store confirms availability, payment and fulfilment. SOKOZA records an enquiry—not a completed purchase.</p>,
        },
        {
          title: "Local data",
          body: <p>Saved, Recently Viewed, Cart and enquiries stay in this browser. You can clear them from Settings.</p>,
        },
      ]}
      title="How SOKOZA works"
    />
  );
}
