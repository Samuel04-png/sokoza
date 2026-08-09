# SOKOZA Seller Studio Product Research

**Status:** Current research translated into Seller Studio behavior  
**Updated:** 8 August 2026  
**Research principle:** Borrow operating patterns, not another product’s visual identity.

## 1. What the strongest seller tools consistently solve

The best seller products reduce ambiguity at five recurring moments: what needs attention, how to create a sellable item, whether availability is current, what a customer actually asked about, and what demand signals mean. SOKOZA should solve those moments for a WhatsApp-first fashion marketplace without pretending it owns payment, delivery or completed-order evidence.

## 2. Current benchmark findings

### Shopify: catalog completeness, batch work and safe state changes

Shopify’s product model starts small—title and price—then supports media, variants, inventory, organization and richer merchandising. This is a good progressive-disclosure model for SOKOZA: let a seller begin a draft quickly, then make publishing contingent on the fields buyers need. Shopify also treats preview, duplicate, archive and delete as distinct actions. Archive is important because historical product references should remain recoverable while deletion is exceptional. [Shopify product management](https://help.shopify.com/en/manual/products), [adding and updating products](https://help.shopify.com/en/manual/products/add-update-products)

For inventory, Shopify supports search, filtering, sorting and column-level adjustment, while its bulk workflow asks sellers to review before saving and explains conflicting updates. SOKOZA needs the same safety shape even with simpler availability states: select, choose intended change, review affected pieces, confirm, report per-item result. [Shopify inventory management](https://help.shopify.com/en/manual/products/inventory), [bulk inventory editing](https://help.shopify.com/en/manual/products/inventory/adjusting-inventory/bulk-editing-inventory)

**Why these features exist:** Sellers manage repetitive, error-prone data. Drafts reduce abandonment; preview reduces merchandising mistakes; archive preserves history; explicit bulk confirmation prevents silent catalog-wide damage.

### Etsy: attention before analytics

Etsy’s dashboard emphasizes “today’s tasks” and shop activity, reflecting that small sellers usually need a next action more than a general business report. Its listing tools separate listing state and editing from demand insight, while Marketplace Insights and Stats use scoped definitions rather than implying certainty. [Etsy seller dashboard](https://help.etsy.com/hc/en-us/articles/360000343908-How-to-Use-Your-Dashboard-to-Manage-Your-Shop), [editing a listing](https://help.etsy.com/hc/en-us/articles/115015692667-How-to-Edit-a-Listing)

**Why these features exist:** A small operator may open the tool between customer messages. A prioritized queue lowers decision cost; state labels explain why a piece is or is not discoverable.

### Square: item library and inventory as one operating system

Square’s item and inventory tools keep a shared item library at the center, then allow stock adjustment and reporting around it. The lesson for SOKOZA is architectural: Product, inventory, promotion and enquiry snapshots should reference stable product identities rather than duplicate editable copies. [Square items and inventory](https://squareup.com/help/us/en/topic/items-and-inventory)

**Why these features exist:** One product identity prevents price, name and availability from drifting across screens. Immutable snapshots preserve what a customer saw without mutating the catalog record.

### Pinterest: content performance with definitions and filters

Pinterest Analytics provides explicit metric definitions, selectable date ranges and filters, and separates top content from headline totals. It also notes that metrics may be estimates. SOKOZA should use the same honesty: a store view is a page-open event, a WhatsApp open is a handoff signal, and neither is a sale. [Pinterest Analytics](https://help.pinterest.com/en/business/article/pinterest-analytics)

**Why these features exist:** Metrics are useful only when the seller knows their unit, window and limitation. Top pieces turn observation into a merchandising decision.

### Depop: mobile-first shop operations and historical context

Depop’s Shop Stats are accessible across mobile and web, and its help material explains date ranges and historical-data conditions. For SOKOZA, insights must work on a phone and retain comparable window context without fabricating buyer identity. [Depop Shop Stats](https://depophelp.zendesk.com/hc/en-gb/articles/360019016817-Shop-Stats)

**Why these features exist:** Fashion sellers often operate from phones; insight tools that require a desktop are not operational tools.

## 3. SOKOZA feature assignment

| Capability | Why it exists | Release |
|---|---|---|
| Visual action queue | Converts catalog freshness and enquiries into a short operating sequence | MVP |
| One Create menu | Keeps the global action clear while supporting Products and Drops | MVP |
| Product draft/edit/publish/preview | Makes incomplete work recoverable and public merchandising deliberate | MVP |
| Photos, details, price, options, stock, fulfilment | Gives buyers enough structured truth before WhatsApp | MVP |
| Search/filter/sort catalog | Makes a growing shop manageable | MVP |
| Archive and duplicate | Preserves history and speeds similar listing creation | MVP |
| Inventory freshness workspace | Prevents stale availability from damaging buyer trust | MVP |
| Selection-based bulk inventory update with review | Saves repetitive work without silent broad changes | MVP |
| Enquiry list/detail with immutable snapshots | Preserves what the buyer reviewed even after catalog edits | MVP |
| WhatsApp handoff plus internal follow-up state | Supports the real channel without claiming message delivery or a sale | MVP |
| Store editor with live responsive preview | Connects seller input to buyer presentation | MVP |
| Store pause/resume | Gives operational control without destructive deletion | MVP |
| Drops and Drop editor | Lets fashion sellers merchandise a coherent collection | MVP |
| Product-level promotional price | Communicates a truthful current and previous price | MVP |
| Signal-based insights | Helps prioritize photos, products and freshness using events SOKOZA can support | MVP |
| Notification inbox | Centralizes actionable operational changes | MVP |
| Verification trust profile | Explains public trust markers and private evidence handling | MVP |
| Stories | Time-limited visual storytelling linked to current products/Drops | V1.1 |
| Customer cohorts from first-party behavior | Useful only after consent, event volume and identity boundaries are established | V1.1 |
| Saved-reply templates | Speeds WhatsApp follow-up while keeping the seller in control | V1.1 |
| Scheduled Drops | Supports coordinated launches after background jobs and timezone handling exist | V1.1 |
| Coupons | Requires reliable redemption and order confirmation; manual WhatsApp confirmation is too ambiguous for MVP | Later |
| Ratings/reviews | Requires verified transaction evidence and moderation | Later |
| Follower identities | Requires consent, account identity and privacy controls | Later |
| Revenue, conversion and ROAS | Requires payment/order attribution SOKOZA does not own in MVP | Later |

## 4. Workflows derived from the research

### Product creation

1. Start with photos and a working title.
2. Add category, audience, condition, description and details.
3. Set current price and optional previous price with validation.
4. Define options/variants and quantities.
5. State collection/delivery applicability.
6. Review the buyer card and public detail summary.
7. Save draft or publish. Publishing explains any missing requirement inline.

Autosave protects input; explicit publish controls public visibility. Leaving with unpersisted changes triggers a warning.

### Inventory maintenance

Individual rows support Available, Low and Sold with a current timestamp. Bulk work uses selection, action, review dialog, confirmation, and result notice. The seller can filter by Low, Sold or Needs checking. “Needs checking” is based on elapsed confirmation time and is never described as known stock depletion.

### Enquiry follow-up

The list shows reference, time, buyer-marked state, item imagery and snapshot total. Detail shows immutable line snapshots, the evidence limitation, the buyer’s handoff timeline, a WhatsApp action and internal states: New, Contacted, Awaiting buyer, Completed elsewhere, Closed. “Completed” is an internal follow-up label—not payment proof.

### Store management

The editor uses sections for identity, imagery, contact, fulfilment, policies and operating status. Desktop keeps an edit-left/live-preview-right composition. Mobile includes an explicit Preview tab/device switch. Readiness is expressed as named checks such as “4 of 5 ready,” not a decorative percentage.

## 5. Growth opportunities beyond obvious pages

- **Photo opportunity cards:** identify pieces with low detail views relative to impressions only when impression tracking exists; before that, use deterministic checks such as one-photo listings.
- **Freshness rhythm:** group products due for confirmation and allow a daily two-minute sweep.
- **Collection builder:** recommend a Drop from products sharing a vibe, occasion or color, with seller review before creation.
- **Store readiness coaching:** explain the buyer benefit of each missing policy or verification item.
- **Enquiry-to-catalog loop:** after a seller marks an enquiry unavailable, offer to update the related inventory immediately.
- **Merchandising prompts:** surface saved and viewed products as “consider featuring” rather than claiming demand certainty.
- **Return-visit preview:** after any publish action, show a direct View Store confirmation so the operator closes the loop.

## 6. Scalable architecture implications

The domain model should separate editable current records from historical event/snapshot records:

- Store, Product, ProductVariant, Drop and Promotion are seller-owned mutable aggregates.
- InventoryAdjustment is append-only and identifies actor, old state, new state, reason and timestamp.
- Enquiry and EnquiryLineSnapshot are append-only buyer-intent evidence.
- EventMetric is derived from controlled event rows and queried by store/time window.
- Notification references its source entity and carries read state; it does not duplicate the source truth.
- Media records carry owner, status, alt text, ordering and storage path.

All seller mutations require ownership checks server-side. Supabase RLS must enforce store membership independently of UI navigation. Bulk updates should execute transactionally and return conflicts per item. The local adapter mirrors these boundaries so the UI can later exchange adapters rather than be rewritten.

## 7. Stories position

Stories are valuable for Drops, styling notes, restock announcements and behind-the-scenes trust, but a credible release needs media upload processing, expiry jobs, reduced-motion behavior, moderation, link integrity and measurable viewer events. Seller Studio therefore shows Stories only as an approved V1.1 capability with a concise rationale; it does not render a fake editor or fabricated story performance.
