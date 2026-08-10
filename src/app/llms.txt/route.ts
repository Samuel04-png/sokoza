import { absoluteUrl } from "@/lib/site";

export function GET() {
  const content = `# SOKOZA

SOKOZA is a fashion discovery marketplace for current products from independent stores in Zambia.

## Public marketplace
- Home: ${absoluteUrl("/")}
- Discover products: ${absoluteUrl("/discover")}
- Browse stores: ${absoluteUrl("/stores")}
- Seller information: ${absoluteUrl("/sell")}
- Sitemap: ${absoluteUrl("/sitemap.xml")}

## How ordering works
Products are grouped by seller. Buyers prepare and send a separate WhatsApp enquiry to each store. SOKOZA does not imply a combined marketplace checkout or verified purchase.

## Content policy
Product availability, pricing, production origin, and store information are seller-provided. Public product and store pages are the canonical sources for current catalog information.
`;
  return new Response(content, {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
