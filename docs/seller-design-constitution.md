# SOKOZA Seller Studio Design Constitution

**Status:** Binding visual and interaction rules for seller surfaces  
**Applies to:** `/sell`, seller access/onboarding, every `/seller` route, dialogs, empty/error/loading states, previews and seller-to-buyer feedback.

## 1. Product character

Seller Studio is a calm creative business workspace for fashion sellers. It should feel editorial, tactile and operational: strong product imagery, typographic hierarchy, warm canvas, ink, terracotta actions and olive confirmation. It must never look like a generic dark SaaS dashboard, an internal admin panel or a data warehouse.

## 2. Brand continuity

- Keep the SOKOZA wordmark visible and pair it with “Seller Studio” as a quiet descriptor.
- Preserve buyer typography, palette, borders and image treatment.
- Use Sora for operating headings and compact labels, Playfair Display sparingly for acquisition/editorial moments, and Inter for dense form/data work.
- NOIR remains the active store identity throughout the workspace through avatar, name, public status and Store link.

## 3. Shell and navigation

- Desktop uses a compact light rail plus a slim workspace bar. The rail supports recognition without dominating the canvas.
- Catalog routes share contextual tabs: Products, Inventory, Drops, Promotions.
- Utility routes live under an intentional profile/More surface.
- Mobile uses a Store header and five bottom destinations: Home, Products, Enquiries, Store, More.
- There is exactly one global Create trigger. It opens Product and Drop choices.
- Active state must be conveyed by color plus shape/border, never color alone.

## 4. Page hierarchy

Every page follows this sequence:

1. compact context label;
2. clear action-oriented title;
3. one-sentence explanation where needed;
4. primary action at the same hierarchy level;
5. contextual tabs/filter tools;
6. working content and states.

Avoid oversized report titles that push operating content below the fold. On Home, the next action and current product/enquiry imagery should appear before analytics.

## 5. Imagery

- Use actual product/store imagery wherever an item is referenced.
- Attention rows, product lists, enquiry snapshots, Drops and previews must use consistent aspect ratios and graceful image fallbacks.
- Do not decorate data pages with unrelated stock imagery.
- Image controls include guidance, file state, alt text and recovery; a filename alone is not an upload experience.

## 6. Forms and editors

- Group fields around seller decisions, not database structure.
- Show why a field matters to the buyer.
- Autosave is a quiet state near the editor title: Saving, Saved, or Needs attention.
- Publishing is separate from saving.
- Validate near the field and focus the first invalid control on submit.
- Multi-step editors retain completed input when navigating backward.
- Warn before leaving only when changes are not safely persisted.
- Wide Store editing uses edit-left/live-preview-right. Product review shows real buyer-card/detail representations.

## 7. State language

Use seller vocabulary: Draft, Published, Paused, Archived, Available, Low, Sold, Needs checking, New enquiry, Contacted, Closed. Never show internal terms such as mock, repository, stage, demo workspace, browser draft, production connects later or protected route.

Readiness uses named checklists: “4 of 5 ready.” Percentages are allowed only for actual measurable progress such as an upload, never as an arbitrary account-completeness score.

## 8. Metrics constitution

- Every signal shows a time window.
- Definitions are available in plain language.
- Store views, product views, saves, review-order starts, WhatsApp opens and buyer-marked-sent are signals—not sales.
- Never display revenue, conversion rate, customer value, completed orders or return on spend without evidence owned by SOKOZA.
- A trend must identify its comparison window; otherwise show the current value without an arrow.
- Use charts only when they clarify change over time. Small totals do not need charts.
- Never fabricate followers, reviews, customers or buyer identities.

## 9. Actions and integrity

- Every visible control works. Future capability is presented as informative content, not an enabled button.
- Destructive actions require a confirmation dialog that names the affected entity and recovery behavior.
- Archive is preferred to delete for products and Drops.
- Bulk changes require selection, review, explicit confirmation and a result summary.
- Enquiry line snapshots never change when the live catalog changes.
- Public visibility changes produce a direct View Store feedback loop.

## 10. Responsive rules

- 390–430px: single-column operating flow, persistent bottom navigation, sticky editor action bar, dialogs become bottom sheets where appropriate.
- 768px: two-column cards may appear; forms retain readable line length.
- 1024px: compact rail only; no large fixed sidebar; editor preview may become side-by-side if neither pane is cramped.
- 1280–1920px: content width grows through composition, not oversized text or empty gutters. Operational lists remain scannable and preview panes remain bounded.
- No horizontal page overflow at any target width.

## 11. Accessibility

- Target WCAG 2.2 AA contrast.
- Interactive targets are at least 44 by 44 CSS pixels.
- All controls have programmatic labels and visible focus.
- Tables/lists retain meaningful reading order on mobile.
- Dialogs trap focus, name themselves and restore focus on close.
- Status changes use polite live regions; errors use alert semantics only when immediate attention is required.
- Reduced motion disables non-essential transitions and animated progress.
- Touch, keyboard and screen-reader flows must reach every core seller action.

## 12. Density and spacing

- Use 8px-derived spacing with tighter rhythm inside rows and more generous separation between decisions.
- Borders and surface shifts organize the page; avoid excessive cards around every item.
- Keep one dominant action per region.
- Empty space should clarify hierarchy, not make the workspace feel unfinished.

## 13. Release test

A seller screen fails this constitution if it could be relabeled for any generic analytics product, if it hides the product/store identity, if it claims evidence SOKOZA does not own, if a visible action is inert, or if the same workflow cannot be completed with keyboard and phone-sized viewport.
