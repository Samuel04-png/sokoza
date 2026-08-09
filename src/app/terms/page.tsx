import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Product notice"
      icon="bookmark"
      intro="These interface principles describe the buyer preview and are not a substitute for final legally reviewed marketplace terms."
      sections={[
        {
          title: "SOKOZA’s role",
          body: <p>SOKOZA provides fashion discovery, structured product information and a prepared way to contact individual stores. The MVP does not process payment, deliver products or guarantee transactions.</p>,
        },
        {
          title: "Store responsibility",
          body: <p>Each store provides its listing, condition, availability, price, policies and WhatsApp contact. Final arrangements occur between the buyer and that store.</p>,
        },
        {
          title: "Buyer responsibility",
          body: <p>Buyers should confirm current details before paying and should not misuse seller contact information or marketplace reporting tools.</p>,
        },
        {
          title: "Before public release",
          body: <p>Final terms, prohibited products, dispute boundaries and governing-law provisions require Zambian legal review.</p>,
        },
      ]}
      title="Marketplace boundaries"
    />
  );
}
