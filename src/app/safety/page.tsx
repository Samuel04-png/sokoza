import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Safety" };

export default function SafetyPage() {
  return (
    <InfoPage
      eyebrow="Marketplace safety"
      icon="shield"
      intro="Verification reduces uncertainty, but direct seller transactions still require care."
      sections={[
        {
          title: "Read verification literally",
          body: <p>“WhatsApp number verified,” “Identity verified,” and “Business verified” describe only the check named. They do not guarantee product authenticity, conduct or fulfilment.</p>,
        },
        {
          title: "Confirm before paying",
          body: <p>Ask the store to confirm the exact product, size, condition, current price and delivery or collection arrangement. Do not treat an enquiry reference as a receipt.</p>,
        },
        {
          title: "Inspect one-off items",
          body: <p>For thrift, sneakers and other one-off pieces, review condition images, measurements and flaws. Ask questions before agreeing to payment.</p>,
        },
        {
          title: "Report concerns",
          body: <p>Do not continue a conversation that feels unsafe or inconsistent. A production reporting channel must be operational before the public beta.</p>,
        },
      ]}
      title="Shop with clear information"
    />
  );
}
