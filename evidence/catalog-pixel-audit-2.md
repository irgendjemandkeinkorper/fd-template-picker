# Catalog pixel audit 2

Inspected all 105 screenshot files across 110 options, including all 72 core choices. Five zero-height entries have no screenshot. This audit compares the actual local pixels with the component labels; source behavior was not inspected.

Status counts: {'matches-pixels': 65, 'rejected': 12, 'matches-with-caveat': 14, 'needs-live-review': 14, 'not-captured-zero-height': 5}. Core: {'matches-pixels': 47, 'rejected': 9, 'matches-with-caveat': 9, 'needs-live-review': 7}.

## Rejected previews

- **header--variant-b-rep** — Cream top header: centered logo and divider only. No navigation labels in crop.
  Action: Read live navigation bounds and recapture complete rendered navigation including visible menu items; distinguish source hidden links from a too-short header crop.
- **header--variant-c-late** — Dark bar: logo left and search/account icons right. No navigation labels in crop.
  Action: Read live navigation bounds and recapture complete rendered navigation including visible menu items; distinguish source hidden links from a too-short header crop.
- **hero--variant-b-rep** — Katy Perry hero image and clipped oversized title, then a repeated logo/header/navigation and next copy of hero.
  Action: Recapture B from visible native viewport or validated full-page image; verify rendered component text and page geometry before cropping. Do not rename hero pixels as this section.
- **hero--variant-d-odd** — Black collage stage with green NOW SCREENING strip obscuring almost invisible dark headline and Explore Films link; caption beneath.
  Action: Check live intended hero background/media and text colors. Recapture after content is legible; do not mark this visual as complete based on section presence.
- **events--variant-b-rep** — Katy Perry hero image/clipped title, repeated logo/navigation and next hero. No private-hire content.
  Action: Recapture B from visible native viewport or validated full-page image; verify rendered component text and page geometry before cropping. Do not rename hero pixels as this section.
- **events--variant-g-cut** — Almost solid dark blank panel. Four white angled ENQUIRE buttons at far left; all supposed card text/content absent.
  Action: Compare live section and source styles/animations; obtain capture where the occasion cards and text are actually visible. Four Enquire buttons do not demonstrate private-party design.
- **food--variant-b-rep** — Repeated Katy Perry hero, clipped title and logo/navigation. No food menu anywhere in either inspected segment.
  Action: Recapture B from visible native viewport or validated full-page image; verify rendered component text and page geometry before cropping. Do not rename hero pixels as this section.
- **contact--variant-b-rep** — Repeated Katy Perry hero and logo/navigation. No form or contact details.
  Action: Recapture B from visible native viewport or validated full-page image; verify rendered component text and page geometry before cropping. Do not rename hero pixels as this section.
- **find-us--variant-b-rep** — Repeated Katy Perry hero and logo/navigation. No location component.
  Action: Recapture B from visible native viewport or validated full-page image; verify rendered component text and page geometry before cropping. Do not rename hero pixels as this section.
- **membership--variant-b-rep** — Repeated Katy Perry hero and logo/navigation. No subscriber/membership content.
  Action: Recapture B from visible native viewport or validated full-page image; verify rendered component text and page geometry before cropping. Do not rename hero pixels as this section.
- **programme--variant-b-rep** — Repeated Katy Perry hero/title/logo/navigation. No Playbill entries.
  Action: Recapture B from visible native viewport or validated full-page image; verify rendered component text and page geometry before cropping. Do not rename hero pixels as this section.
- **footer--variant-b-rep** — Katy Perry hero image and clipped title fragment. No footer.
  Action: Recapture B from visible native viewport or validated full-page image; verify rendered component text and page geometry before cropping. Do not rename hero pixels as this section.

## Live review and label correction needed

- **hero--variant-f-concrete** — Plain, mostly unstyled numbered programme/hire/menu/contact/find/tariff/voucher text and default blue links on brown, then black Reference Print title panel.
  Action: Verify intended section styles load/apply in published page. Default text/table/blue links appear unlike the designed F sidebar and source module names.
- **events--variant-e-grid** — Dark package section: heading, one screening package high in center, two additional packages lower left/right and FAQ below.
  Action: Compare source flex/grid layout: first card high center while other cards sit far below at left/right. Confirm intentional layout or fix before representing this as a finished grid design.
- **events--variant-f-concrete** — Plain white Hire description, small native-looking table and default blue Enquire link on brown.
  Action: Verify intended section styles load/apply in published page. Default text/table/blue links appear unlike the designed F sidebar and source module names.
- **food--variant-f-concrete** — White product cards on brown with titles/descriptions/prices. This is a card grid, not a price table; left category labels are black on dark brown.
  Action: Rename to actual text-card menu layout, or repair source to intended price table then recapture. Also fix category rail contrast if editing this source.
- **contact--variant-f-concrete** — Brown generic form with orange Contact heading, white name/email/message fields and orange Send. No ledger visual structure.
  Action: Use an honest generic form label, or finish the intended ledger design in source and recapture.
- **find-us--variant-a-circuit** — Brown address/hours/transit/access information on right, empty left region; no visible map.
  Action: Check map loading and target bounds on live page. Current screenshot shows location text and an empty map area/frame, so map-oriented name is not demonstrated.
- **find-us--variant-c-late** — Burgundy address card left, empty large map region right and hours/transit/access strip below. No visible map.
  Action: Check map loading and target bounds on live page. Current screenshot shows location text and an empty map area/frame, so map-oriented name is not demonstrated.
- **find-us--variant-d-odd** — Cream taped empty white map frame on right, then address/details card below; left region empty.
  Action: Check map loading and target bounds on live page. Current screenshot shows location text and an empty map area/frame, so map-oriented name is not demonstrated.
- **find-us--variant-e-grid** — Dark empty left region; a narrow map and location details card stacked at far right.
  Action: Verify location layout: map and details are a narrow stack at far right with most canvas blank.
- **find-us--variant-f-concrete** — Plain brown Coordinates/address/entrance/transit/parking/hours/phone text, blue links and small actual map at bottom left.
  Action: Verify intended section styles load/apply in published page. Default text/table/blue links appear unlike the designed F sidebar and source module names.
- **membership--variant-e-grid** — Dark tier section with first plan high center, second/third lower left/right and comparison table below.
  Action: Compare source flex/grid layout: first card high center while other cards sit far below at left/right. Confirm intentional layout or fix before representing this as a finished grid design.
- **membership--variant-f-concrete** — Plain brown Tariff intro, small text table of tiers/prices/includes and default blue Join link.
  Action: Verify intended section styles load/apply in published page. Default text/table/blue links appear unlike the designed F sidebar and source module names.
- **gift-cards--variant-f-concrete** — Brown Voucher module, near-invisible black subtitle, broken-looking product image/alt-text edge above white Voucher/Add card, quantity/subtotal/Continue.
  Action: Check product image and native palette contrast live; capture a usable widget state. Existing screenshot has black-on-brown copy and a broken-looking image edge.
- **contact-channels--variant-e-grid** — Dark contact information cards; Phone high center, Email lower left and Hours lower right with very large gaps.
  Action: Compare source flex/grid layout: first card high center while other cards sit far below at left/right. Confirm intentional layout or fix before representing this as a finished grid design.

## Existing limitations that should remain visible

- A/J/K Now Playing screenshots show empty states, not populated movie layouts. L Now Playing and J Coming Soon are zero-height.
- G–L navigation labels are visible in the local screenshots. The six designs are shared. B and C are the navigation assets that lack menu labels.
- J/K/L hero assets accurately show very short text introductions; they do not represent developed hero layouts.
- D/E gift cards show quantity/subtotal controls without gift card products.
- D/E/F Contact Anchors are zero-height anchors, not standalone visual components.

All per-option observations, findings and sheet references are in `catalog-pixel-audit-2.json`. Contact sheets are in `catalog-pixel-audit-2/`.
