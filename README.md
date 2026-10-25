# FD Template Picker

Explore the verified variants from **US-BETA / INDY Demo / Adam Template Testing 2**, start from a variant, then mix INDY sections and export a designer handoff. The admin inventory on 25 October 2026 contains **A through L**. A variant can be inventoried before all of its screenshots are ready; the picker displays capture availability separately.

This is a static website with no build or production dependencies.

```sh
node scripts/serve.mjs
# http://localhost:4173
node --test
```

It can be hosted on GitHub Pages, Netlify, or another static host. `npm start` and `npm test` are aliases when npm is installed.

## Choose and hand off a page

- **Explore the variant collection** shows the published source pages and screenshot coverage.
- **Start from** selects that variant's available sections in source order. A missing section stays excluded; another variant is never substituted silently.
- **Browse styles** opens a visual comparison for one section. Select a style directly or use the previous/next controls. Arrow keys also cycle styles.
- Reorder middle sections, leave sections out, and add project or section notes. Header/footer stay at the ends.
- Section and text filters affect the editor view. **Preview page** shows the entire included selection as captured images.
- Selections save in the browser. **Copy link** shares the complete selection, including notes, in the URL fragment.
- **Export JSON** includes source page, admin and section identifiers when verified, screenshot provenance, and Library transfer metadata. **Designer handoff** downloads the same choices in readable Markdown.
- **Import** accepts both the original v1 and current v2 exports. Existing saved selections and links remain supported. Newly cataloged sections remain excluded when restoring an older selection.

The visual preview does not combine live widgets or verify booking, ordering, forms, or mobile behavior. Open the source page to inspect the working example.

## Catalog and screenshot evidence

`catalog.json` is the editable collection. Its explicit `variants` array records the admin inventory, while `slots[].options[]` records only captured section choices. An option includes its INDY component names, source route, verified page/section IDs, image dimensions, and capture notes. Library records remain `not-created` until the corresponding object and transfer are verified.

The current catalog contains **95 choices across 17 section categories: 90 actual screenshots and 5 verified zero-height sections**. It preserves published empty states. A's footer capture excludes its final 1 CSS pixel, recorded in its capture notes. Configured components absent from the observed published DOM do not retain stale choices.

The original 20 October A–C screenshot set used fictional showtimes; Hero B also received a browser-only selector correction. That set has been replaced, and unused legacy images removed. Fresh captures must preserve the real page, including empty programming states, with no data fixtures or CSS corrections. The UI supports explicitly labeled illustrative or partial captures if a future collection needs them.

To ingest a verified inventory and capture observations from the sibling `evidence` directory:

```sh
node scripts/sync-evidence.mjs
node scripts/sync-evidence.mjs ../evidence/observations.json
```

The observations format is `{ capturedAt, variants: [{ id, sections: [{ slotId, name, components, image, width, height, sectionIds, capture }] }] }`. Only inventory-verified variant IDs are accepted. Image paths resolve relative to the observations file and must stay within the INDY workspace. Ingesting copies them into `screenshots/` and updates only the corresponding choices.

To refresh approved selectors directly from the published consumer site, install the capture-only Playwright dependency and its browser, then run:

```sh
npm install
npx playwright install chromium
npm run capture -- --variant=variant-k-clubhouse
npm run capture -- --variant=variant-k-clubhouse --mobile
```

The refresh script requires exact, verified `capture.selectors` (or `sectionSelectors`) for each option. It skips unverified mappings, fails if a selector stops resolving uniquely, and preserves the catalog when no capture jobs are available. It does not inject fixtures, repair the source page, publish INDY content, or deploy the picker.

## Library reuse model

Keep a full variant as its reference page. When INDY Library reuse is page-based, a dedicated carrier page such as `variant-k-clubhouse_experience` is a practical transfer unit. K's “Stay Awhile” is experiential prose in a Text Block, rather than a food-ordering widget. The picker proposes these names; a proposed name is not an existing Library object. Importing a carrier creates a separate Page; assembling that section into an existing homepage remains unverified.

Before promoting a section, record its native widgets, section/page CSS, Theme & Style dependencies, media, links, and dynamic data needs. Header, navigation, and footer need separate site-level handling. Test one section and one destination copy before creating the full collection.

For an independent local starting template, the destination workflow is **Add From Library → Unlink → verify Not Linked → customize**. Turning Library Updates off retains the link and a Force Update can still refresh it. Keep a link active only when synchronized upstream updates are intended. The export records this policy and the current verification status; it never creates or unlinks pages automatically. See [the verified Library investigation](docs/INDY-LIBRARY.md) for the rollout and unresolved checks.

## Files

- `app.js`, `index.html`, `styles.css`: browser UI.
- `model.mjs`: selection normalization, presets, versioned export and transfer planning.
- `catalog.json`, `screenshots/`: verified collection and image assets.
- `scripts/serve.mjs`: local static preview server.
- `scripts/sync-evidence.mjs`: inventory/capture ingestion.
- `scripts/capture.mjs`: opt-in refresh of verified selectors.
- `tests/model.test.mjs`: selection migration, missing sections, export and asset integrity.
