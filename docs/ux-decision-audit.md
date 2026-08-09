# SOKOZA UX decision audit

Status: implementation baseline for the conversion, clarity and trust pass.

## Product-wide principles

- SOKOZA is a discovery and enquiry marketplace, not a checkout. Every order remains seller-specific and moves to that seller's WhatsApp.
- Real catalog, inventory and aggregate interaction data are the only permitted source of popularity, freshness, availability and trust claims.
- The core buyer sequence is: discover a real piece, choose an available option, review one store's enquiry, continue to WhatsApp, then optionally tell SOKOZA whether the message was sent.
- The core seller sequence is: create private access, shape a public Store, connect WhatsApp, define fulfilment, create a real product, review readiness, then publish deliberately.
- Specific labels beat generic labels. Counts, store names, selected options, consequences and next steps should be visible at the decision point.

## Route audit

| Surface | Primary question | Existing strength | Decision / correction |
| --- | --- | --- | --- |
| Home | What is worth exploring now? | Uses real ranked catalog, fresh products, drops, Stores and truthful empty states. | Keep ranking-backed merchandising. Hero and rails must never imply unsupported popularity. |
| Discover | Can I find the product, Store or mood I mean? | Rich visual autosuggest, filters, result counts and Store matching already exist. | Make the result sentence and zero-result recovery reflect the actual query and filters. Preserve entered constraints. |
| Product details | Is this exact piece right for me? | Real images, variants, price, fulfilment, seller and truthful social proof. | Expose the four-photo set editorially on desktop, put option availability at the choice, make CTAs option-specific, and explain the three-step handoff beside the action. |
| Store | Do I trust this Store and want to browse it? | Real identity, fulfilment, verification meaning, products and restrained social links. | Preserve the approved hero/tabs hierarchy and avoid decorative identity claims. |
| Cart | What am I reviewing with each seller? | Seller groups, current prices and no combined cross-seller total. | Name the seller in every Review order action and make recovery point back to the exact product. |
| Order review | What will be sent, and am I paying here? | Authoritative stock/price recheck, immutable intent, fallback copy and return prompt. | Label the handoff Continue to WhatsApp, state that SOKOZA does not charge here, and show the remaining three steps. |
| Enquiries | Did I send it, and what does that status mean? | Buyer assertion is separated from purchase/payment. | Keep explicit status definitions and never describe an enquiry as an order or sale. |
| Sell | Why should my Store join? | Clear value, four-step workflow, standards and FAQ. | Lead with seller-owned outcome and show workflow/product proof rather than relying on an aspirational generic image alone. |
| Seller onboarding | What is required and what happens next? | Six resumable steps, progress, validation, templates and readiness checks. | Replace generic Save and continue with the name of the next task. Keep optional fields optional. |
| Seller Home | What should I do next? | Attention-first commands, readiness and honest signals. | Add a useful all-clear state and use the real local weekday instead of fixed copy. |
| Products / Inventory | What is live, incomplete or stale? | Status, photo/option counts, readiness and stock controls are explicit. | Preserve validation, upload progress, automatic taxonomy and original-stock-aware low inventory rules. |
| Enquiries / Insights | Which buyer signals deserve action? | Aggregate, privacy-safe funnel signals with definitions and guardrails. | Keep views weaker than qualified enquiry signals; show comparisons only with a valid prior window. |
| Store settings | What is public, optional or account-level? | Auth email and public Store identity are separated; social links are optional. | Continue to state verification requirements and confirmation side effects beside account changes. |

## Resolved inconsistencies

- Buyer terminology remains **Cart** everywhere; multi-seller behavior is explained without a combined total or checkout language.
- **Available**, **Low**, **Sold** and stale confirmation are inventory states, not urgency marketing.
- **Viewed**, **saved**, **review started**, **WhatsApp opened** and **buyer marked sent** remain separate signals.
- Verification describes evidence checked; it does not guarantee product quality, payment or fulfilment.
- Made Here, drops, trending and social proof render only from supporting catalog or aggregate data.

## Release standard

The pass is complete only when the first-time buyer can move from Home or Discover to a seller-specific WhatsApp draft without mistaking it for payment, and a first-time seller can understand the six setup steps, publish requirements, current Store state and next useful action without relying on hidden documentation.
