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

- **Required component coverage** compares every variant against Navigation, Hero, Food & Drink, Private Parties, Membership and Contact Us. Source presence is separate from preview quality. Only current live images that pass a pixel-and-label review count as checked previews; rejected, pending and review-needed images remain flagged.
- The section view starts with **Required components**. Use **Optional movie modules** for Now Playing, Coming Soon and Ticket Finder while their customization is assessed; **Additional sections** retains the rest of the collection.
- **Explore the variant collection** shows the published source pages and screenshot coverage.
- **Start from** selects that variant's available sections in source order. A missing section stays excluded; another variant is never substituted silently.
- **Browse styles** opens a visual comparison for one section. Select a style directly or use the previous/next controls. Arrow keys also cycle styles. **Open full-size preview** opens the original image; navigation previews also scroll horizontally to preserve readable menu labels.
- Reorder middle sections, leave sections out, and add project or section notes. Header/footer stay at the ends.
- Section and text filters affect the editor view. **Preview page** shows the entire included selection as captured images.
- Selections save in the browser. **Copy link** shares the complete selection, including notes, in the URL fragment.
- **Export JSON** includes source page, admin and section identifiers when verified, screenshot provenance, Library transfer metadata, catalog coverage, and separate coverage for the included selection. **Designer handoff** lists any missing or partial required components in the selected combination.
- **Import** accepts both the original v1 and current v2 exports. Existing saved selections and links remain supported. Newly cataloged sections remain excluded when restoring an older selection.

The visual preview does not combine live widgets or verify booking, ordering, forms, or mobile behavior. Open the source page to inspect the working example.

## Catalog and screenshot evidence

`catalog.json` is the editable collection. Its explicit `variants` array records the admin inventory, while `slots[].options[]` records only captured section choices. An option includes its INDY component names, source route, verified page/section IDs, image dimensions, and capture notes. Library records remain `not-created` until the corresponding object and transfer are verified.

Canonical coverage lives alongside the original section categories. An audited option may declare `canonicalComponent` (for example `private-parties`) and `componentStatus: "partial"` when it only partially serves that purpose. Generic Events, Experience and Visit sections are never automatically relabeled or counted as private parties, food or contact. `componentAudit` entries use `{ variant, component, status: "present" | "partial" | "missing", notes }` to distinguish source content from screenshot availability. A missing catalog choice without an audit is labeled **Needs audit**, rather than assumed absent. Refresh an audit entry after repairing the source page.

Image review is recorded separately in each option's `visualReview`: `passed`, `rejected`, `needs-review` or `not-reviewed`. The review is bound to `visualCaptureKey(option)` (image, size, capture date and source section IDs); a changed capture returns to unchecked until reviewed. Passed images also store a SHA-256 fingerprint checked by the tests. [The second pixel audit](evidence/catalog-pixel-audit-2.md) found incorrect B captures, incomplete navigation crops and other visual issues despite the source components being present. Display labels can describe actual appearance while `sourceName` and `components` retain original INDY aliases, as with F's Product Cards and Standard Form.

The [current component audit](docs/COMPONENT-PARITY.md) records all **72 required components present across A–L**, following 15 additions and one enriched membership module on the authorized test site. The retained original baseline had 56 present, 2 partial and 14 missing components. Each variant preset includes all six required components. G–L share one navigation appearance, and J–L still need a deliberate hero-design pass. Private-party options retain the stable `events` IDs while displaying as **Private Parties**; B's original public Playbill is optional Programme content.

The current catalog contains **110 choices across 18 section categories: 105 actual screenshots and 5 verified zero-height optional/support sections**. It preserves published empty states. Footer captures A/I/J/L omit a documented final 1 CSS pixel; original DOM bounds remain in their capture notes. Configured components absent from the observed published DOM do not retain stale choices. Repaired B/G/H/I/J/K/L have actual 390px mobile geometry evidence and a manual pixel review; all 16 new or enriched modules fit without measured horizontal overflow and preserve readable content, loaded menu images and visible actions. See [the parity report and mobile proof](docs/COMPONENT-PARITY.md).

The original 20 October A–C screenshot set used fictional showtimes; Hero B also received a browser-only selector correction. That set has been replaced, and unused legacy images removed. Fresh captures must preserve the real page, including empty programming states, with no data fixtures or CSS corrections. The UI supports explicitly labeled illustrative or partial captures if a future collection needs them.

To ingest a verified inventory and capture observations from the sibling `evidence` directory:

```sh
node scripts/sync-evidence.mjs
node scripts/sync-evidence.mjs ../evidence/observations.json
```

The observations format is `{ capturedAt, variants: [{ id, sections: [{ slotId, name, components, image, width, height, sectionIds, capture }] }] }`. Only inventory-verified variant IDs are accepted. Each included variant is a complete rendered-page observation: older options absent from that observation are removed. Image paths resolve relative to the observations file and must stay within the INDY workspace.

For a repaired component, include explicit `canonicalComponent`, `componentStatus: "present"` and `componentNote` describing the reviewed source content. This updates that component's audit record. A screenshot refresh alone preserves existing audit caveats; a changed section identity without semantic review is marked unverified. Use `designNote: null` to clear a resolved design caveat. Required private-party captures use the existing `events` slot; unrelated public programme content belongs in an additional category.

Ingestion retains reviewed display labels and original `sourceName`/`sourceAliasNote` metadata. Use an explicit `displayName` to replace a picker label, or `displayName: null` to return to the observed native name. Existing `visualReview` metadata keeps its original capture key, so refreshed images become unchecked; supplying new capture data never passes a review automatically.

To apply a complete, site-matched semantic audit to the catalog:

```sh
node scripts/sync-component-audit.mjs ../evidence/component-parity.json
```

This imports the supplied site-matched audit, so do not reapply an older audit over newer reviewed evidence. The current audit is retained in `evidence/component-parity.json`; the original is `evidence/component-parity-baseline.json`. It does not create options for missing sections or alter images. For reviewed source repairs and native full-page/viewport-tile processing, follow [the capture workflow](docs/CAPTURE-WORKFLOW.md).

To refresh approved selectors directly from the published consumer site, install the capture-only Playwright dependency and its browser, then run:

```sh
npm install
npx playwright install chromium
npm run capture -- --variant=variant-k-clubhouse
npm run capture -- --variant=variant-k-clubhouse --mobile
```

The refresh script requires exact, verified `capture.selectors` (or `sectionSelectors`) for each option. It skips unverified mappings, fails if a selector stops resolving uniquely, and preserves the catalog when no capture jobs are available. It does not inject fixtures, repair the source page, publish INDY content, or deploy the picker.

Native movie widgets have useful layout controls, documented in [movie-widget research and policy](docs/MOVIE-WIDGETS.md). Keep a shared Movies function in the site baseline, while presenting Now Playing, Coming Soon and Ticket Finder as optional picker choices until actual layouts have populated desktop/mobile evidence. A compact booking selector is not a replacement for film discovery.

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
- `scripts/sync-component-audit.mjs`: semantic component audit ingestion.
- `scripts/prepare-parity-metadata.mjs`, `scripts/process-captures.py`: exact-source semantic metadata and genuine browser-image processing.
- `scripts/capture.mjs`: opt-in refresh of verified selectors.
- `tests/model.test.mjs`: selection migration, missing sections, export and asset integrity.
- `tests/parity-catalog.test.mjs`, `tests/evidence-sync.test.mjs`, `tests/process-captures.test.py`: six-component presets, capture provenance, source identity, crop coverage and ingestion checks.
