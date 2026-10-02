# FD Template Picker

Mix and match INDY component styles section by section, then export the
selection as JSON for the design team to build from.

Each section of the page (header, hero, now playing, events, food, contact,
find us, membership, gift cards, footer) shows a screenshot taken from one of
the INDY example variants. Cycle through the styles, reorder or remove
sections, add notes, and export.

## Run it

```
npm start
```

Then open http://localhost:4173. The site is plain static files (no build), so
it can be hosted anywhere: Netlify, GitHub Pages, an S3 bucket.

## Using the picker

- **‹ ›** (or the left/right arrow keys) cycle a section through its styles.
- **↑ ↓** reorder sections. Header and footer stay at the ends.
- **Remove** leaves a section out of the page.
- **Start from** sets every section to one variant; **Shuffle** randomises.
- **Preview page** hides the controls and shows the assembled page.
- Selections save automatically in the browser. **Copy link** gives a URL that
  reopens the same selection anywhere.
- **Export JSON** downloads the hand-off file; **Import** loads one back in.

## Export format

```json
{
  "schema": "fd-template-picker/v1",
  "project": "Roxy Cinema",
  "exportedAt": "2026-10-02T10:30:00.000Z",
  "notes": "Brand red #c00",
  "pickerUrl": "https://…/#s=…",
  "sections": [
    {
      "position": 2,
      "slot": "hero",
      "slotLabel": "Hero",
      "included": true,
      "optionId": "hero--variant-c-late",
      "variant": "variant-c-late",
      "variantLabel": "C · Late",
      "components": ["Hero C - Marquee", "Hero C - Dock"],
      "sourceUrl": "https://adam-template-testing-2-indy-consumer.netlify.app/variant-c-late/",
      "screenshot": "https://…/screenshots/hero/variant-c-late.jpg",
      "note": ""
    }
  ]
}
```

`sections` is in page order. `components` are the INDY component names to
build with, `sourceUrl` is the live example they came from, and `pickerUrl`
reopens the selection in the picker.

## Refreshing the screenshots

```
npm install
npx playwright install chromium
npm run capture
```

`scripts/capture.mjs` visits each variant site, screenshots every section, and
rewrites `screenshots/` and `catalog.json`. To add a variant or a new section,
edit `SLOTS` and `VARIANTS` at the top of that script. The script fails loudly
if a variant's section count no longer matches what is listed there.
