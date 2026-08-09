# Thokozile asset audit

Audited recursively under `public/assets` on 9 August 2026 before import. The source tree contains 118 files: 113 product PNGs, two approved Store identity PNGs and three SOKOZA brand source packages/files. Every image opened successfully; originals remain untouched.

## Store identity

| Original file | Role | Dimensions | Production name | Notes |
|---|---|---:|---|---|
| `thokos store /logo&cover image /ChatGPT Image Aug 9, 2026, 11_57_03 AM (1).png` | Store logo | 1254×1254 | `elegance-at-tkays-logo.png` | High confidence; approved square mark |
| `thokos store /logo&cover image /ChatGPT Image Aug 9, 2026, 11_57_04 AM (2).png` | Store cover | 1672×941 | `elegance-at-tkays-cover.png` | High confidence; approved wide cover |

## Product grouping

The canonical file-to-group mapping is encoded in `scripts/thokozile-catalog.mjs`, which is both human-reviewable and executable. Each selected source receives a normalized storage filename `01–04-{product-slug}.png`; the first is the cover. The original indices below correspond to the sorted source inventory captured during audit.

| Product group | Source indices | Roles | Confidence | Notes |
|---|---|---|---|---|
| Coral Open-Knit Cardigan | 1, 2, 12, 40 | cover, angle, product, detail | High | coherent colour/open-knit construction |
| Charcoal Hooded Knit Cardigan | 3, 4, 39, 48 | cover, angle, product, detail | Medium | product/detail match should be seller-reviewed |
| Light-Wash Pintuck Wide-Leg Jeans | 5, 6, 7, 53 | cover, angle, product, detail | High | coherent seam treatment |
| Dark-Wash Extra-Wide Jeans | 8–11 | cover, angle, product, detail | High | contiguous set |
| Pale Blue Corset Mini Dress | 13–16 | cover, angle, product, detail | High | contiguous set |
| Mustard Open-Knit Cardigan | 17, 18, 93, 98 | cover, angle, product, detail | High | coherent colour/open-knit construction |
| Navy Tailored Shorts | 19–22 | cover, angle, product, detail | High | contiguous set |
| Cream Drawstring Shorts | 23–26 | cover, angle, product, detail | High | contiguous set |
| Taupe Tailored Shorts | 27–30 | cover, angle, product, detail | High | contiguous set |
| Houndstooth Tailored Shorts | 31–34 | cover, angle, product, detail | High | contiguous set |
| Black Textured Tailored Shorts | 35–38 | cover, angle, product, detail | High | contiguous set |
| Chocolate Tailored Shorts | 41–44 | cover, angle, product, detail | High | contiguous set |
| Grey Knit Pull-On Shorts | 45–47, 99 | cover, angle, product, detail | Medium | detail match should be seller-reviewed |
| Blue Crochet-Panel Mini Dress | 49–52 | cover, angle, product, detail | High | contiguous set |
| Pink Heart Satin Pyjama Set | 54–57 | cover, angle, product, detail | High | contiguous set |
| Dark-Wash Plaid-Cuff Wide-Leg Jeans | 58–61 | cover, angle, product, detail | High | contiguous set |
| White Heart Satin Pyjama Set | 62–65 | cover, angle, product, detail | High | contiguous set |
| Light-Wash Patch-Pocket Cargo Jeans | 66–68, 100 | cover, angle, product, detail | High | coherent pocket construction |
| Light-Wash Knee-Rip Wide-Leg Jeans | 69–72 | cover, angle, product, detail | High | contiguous set |
| Light-Wash Distressed Wide-Leg Jeans | 73–76 | cover, angle, product, detail | High | contiguous set |
| Black Cargo Wide-Leg Jeans | 77–80 | cover, angle, product, detail | High | contiguous set |
| Cream Button-Front Denim Romper | 81–84 | cover, angle, product, detail | High | contiguous set |
| Black Denim Mini Shorts | 85–88 | cover, angle, product, detail | High | contiguous set |
| Light Blue Drawstring Shorts | 89–92 | cover, angle, product, detail | High | contiguous set |
| Blue Denim Shirt Dress | 94–97 | cover, angle, product, detail | High | contiguous set |
| Mustard Longline Knit Cardigan | 102–105 | cover, angle, product, detail | High | index 101 preserved as unselected alternate |
| Black Relaxed Knit Cardigan | 106–109 | cover, angle, product, detail | High | contiguous set |
| Olive Longline Duster Cardigan | 110–113 | cover, angle, product, detail | High | contiguous set |

Totals: 26 high-confidence groups, two medium-confidence groups, zero low-confidence groups, 112 selected images and one preserved alternate. No asset was silently discarded, overwritten or used across multiple products.
