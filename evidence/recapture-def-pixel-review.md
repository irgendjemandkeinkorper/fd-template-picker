# D/E/F recapture pixel review

Archived independent review, preserved as issued. Root subsequently applied the recommendations to the catalog. The companion repository report is [recapture-def-pixel-review.json](recapture-def-pixel-review.json); source preparation files remain in the shared workspace under `../evidence/recapture-2/` relative to the repository root.

All 12 new repository images were opened at native resolution. These are proposed results only; no catalog or review metadata was changed.

**8 passed; 4 need review. No rejected capture geometry.**

## Keep in review

- **find-us--variant-e-grid** — Location layout now has a wide left map panel and readable right address/details card with Open in Maps action. The map panel is entirely blank. Map imagery must load and be captured before this is treated as a complete location/map preview. The pixel audit cannot determine whether this is lazy loading or a source/network issue.
- **hero--variant-f-concrete** — Concrete Today index now has strong contrast, seven visible numbered rows and legible utility links. The Reference Print section beneath is a large plain cream text placeholder with no image. The configured Reference Print image is absent (source URL null per root DOM inspection). Keep the missing-image caveat or split the working index from the unfinished Reference Print before claiming a completed hero preview.
- **find-us--variant-f-concrete** — Concrete Find heading and coordinates, complete address/entrance/transit/parking/hours/phone rows, Open Map action, and a large outlined map area. The map area is blank. Load and recapture the map, or clearly describe this as an incomplete map state. The image establishes text/layout presence, not map availability.
- **gift-cards--variant-f-concrete** — Voucher heading and description are readable; the native Voucher/Add card and quantity/subtotal/Continue controls are visible. The product image displays an explicit broken-image icon and Voucher alt text above the card. The source image URL is empty. Configure the actual product image and recapture; this is a source content gap, not a crop error. Continue is disabled at quantity zero.

## Pass recommendations

- **hero--variant-d-odd** — Actual Pulp band photo in tilted paper frame, green Now Screening tag, full black film heading, Explore Films action and Ruth-line caption. The previous black-on-black failure is resolved. Small purple source-header decorative sliver at the top edge; no content is obscured or cut off.
- **events--variant-e-grid** — Private hire, three ways: three aligned package cards with prices/benefits, visible Enquire actions and complete FAQ rows beneath. The staggered layout is resolved.
- **contact-channels--variant-e-grid** — Phone, email and hours information appears in three aligned, fully visible cards beneath the response-time note.
- **membership--variant-e-grid** — Three aligned Standard/Plus/Premier cards with visible prices, benefits and join actions; full comparison table below. The staggered layout is resolved.
- **events--variant-f-concrete** — Concrete Hire heading, capacity note, legible four-row native table with occasion/capacity/from/notes columns, and complete Enquire action.
- **food--variant-f-concrete** — Concrete native menu shows all seven product cards across Snacks/Drinks/Desserts, readable category rail, descriptions and prices. Three snack cards, one Soda card and three dessert cards are visible. Display as Food F - Product Cards; the raw INDY alias Price Table remains a source alias. Native description ellipses are intentional content clamping, not image crop failure.
- **contact--variant-f-concrete** — Concrete Standard Form has readable Contact heading, complete Name/Email/Message fields and visible Send action, with no overlap or clipping. Display as Contact F - Standard Form; Ledger remains the raw source alias. This is visual review only, with no form submission tested.
- **membership--variant-f-concrete** — Concrete Tariff heading and note, readable Standard/Plus/Premier native table, points note and visible Join action.

No sticky headers, repeated tile strips or obstructed/cutoff component content were found. D hero includes a tiny source-header decoration at its top boundary, with no obstruction. JSON includes exact image hashes, capture keys and proposed review metadata subsequently applied by root.
