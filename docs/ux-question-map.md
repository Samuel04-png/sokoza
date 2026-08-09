# SOKOZA UX question map

This map defines the question each interface section must answer. It is a content and hierarchy test, not a requirement to add more cards.

## Buyer journey

| Moment | Question in the buyer's mind | Interface answer | Evidence required |
| --- | --- | --- | --- |
| Home hero | What can I do here? | Explore current products from local Stores and prepare a seller-specific WhatsApp enquiry. | Published catalog only. |
| Home merchandising | Why is this shown? | Current availability, recent qualified interest, freshness or a named editorial collection. | Ranking inputs or explicit collection membership. |
| Search typing | Did SOKOZA understand me? | Visual product and Store matches with name, price, Store and location. | Current searchable records. |
| Search results | How many useful matches remain? | Exact piece and Store counts plus visible applied filters. | Current filtered result set. |
| No results | What can I change without starting over? | Remove a named filter, clear all, or browse an adjacent visual collection. | Existing query and filter state. |
| Product gallery | Is this the actual piece and can I inspect it? | Four real roles when supplied: main, secondary, isolated and detail. | Seller-uploaded media only. |
| Product decision | Is it right for me? | Store, location, title, price, available option, condition, description and detail. | Current product and variant records. |
| Fulfilment | How could I receive it? | Store-specific collection and delivery language. | Seller-configured fulfilment. |
| Trust | What has SOKOZA checked? | Narrow verification wording and current availability context. | Stored verification evidence and timestamps. |
| Cart | Why are items separated? | Each Store receives and confirms its own enquiry; no cross-seller checkout exists. | Cart grouping by Store. |
| Order review | What exactly am I sending? | Product, selected option, quantity, current item value, preference and optional note. | Server revalidated intent snapshot. |
| WhatsApp | What happens when I continue? | A prepared message opens; payment, final availability and fulfilment are still agreed with the Store. | Valid Store number and created intent. |
| Return | Did SOKOZA prove delivery or purchase? | No. The buyer may only mark that they sent the enquiry. | Buyer assertion, never inferred purchase. |

## Seller journey

| Moment | Question in the seller's mind | Interface answer | Evidence required |
| --- | --- | --- | --- |
| Sell page | What will this help me achieve? | Present current products clearly and receive better-prepared buyer conversations while keeping WhatsApp. | Real workflow capabilities. |
| Sign-up | What is private and what becomes public? | Auth identity remains private; the Store identity is created separately. | Auth and Store schema separation. |
| Setup progress | How much work remains? | Six named, resumable steps with the current step and next task. | Persisted onboarding progress. |
| WhatsApp setup | Where do enquiries go? | Normalized number, reply expectation and a preview of the prepared message. | Valid phone normalization. |
| Fulfilment setup | What should I write? | Structured collection/delivery choices and editable practical templates. | Seller-confirmed Store policy. |
| Product creation | What is missing before publishing? | Readiness checks for real imagery, product details, price, category and sellable options. | Current draft fields. |
| Seller Home | What should I do now? | New enquiry, inventory risk or draft work ordered by buyer impact; otherwise an explicit all-clear with growth actions. | Current seller-owned records and aggregates. |
| Inventory | When is something low? | Seller-declared state or original-stock-aware threshold; a product that began at one is not automatically low. | Current and reference quantity. |
| Insights | What does the signal mean and what could I try? | Defined aggregate metrics, valid time windows and cautious suggestions based on combinations of signals. | Backend aggregates; no viewer identity. |
| Settings | What will change publicly or require confirmation? | Public Store fields, optional social links and auth email consequences are labeled separately. | Auth confirmation and Store persistence state. |

## Language guardrails

- Use **Review order** before the handoff and **Continue to WhatsApp** at the handoff.
- Use **item value**, not total payable, where delivery/payment are not included.
- Use **buyer marked sent**, not completed, converted, bought or sold.
- Use **Getting attention** only above configured recent unique-view thresholds.
- Never use random urgency, live viewer claims, invented testimonials, unsupported best-seller language or hidden cross-seller assumptions.
