# Refreshing published component evidence

Capture the published consumer route after saving and publishing only the intended INDY test page. Keep the actual content, empty programming states, styles, and inventory. Browser-only fixes and invented sample data do not qualify as a live capture.

The authenticated Chrome workflow records each variant's title, slug, published page ID, section count, header/footer bounds, native section classes and document bounds, capture time, and overlapping viewport screenshots. Scroll by less than a viewport so the fixed header does not leave missing strips between tiles. Record the actual scroll position for each image. The resulting manifest uses the same shape as the sibling `evidence/captures.json` baseline.

A native full-page browser screenshot can instead supply one tile at `scrollY: 0`, with its document dimensions and `captureMethod: "live-browser-full-page"` on the variant. Use explicit tile `cssWidth`/`cssHeight` when known; the method is preserved in the catalog. A single native full-page image is recorded separately from a viewport-tile composite.

## Review source identity before ingestion

Published and editable draft IDs are different. The source change journal must contain the actual published page/section IDs and their separately observed draft page/section IDs. Never infer either from numbering patterns.

For this parity pass, `prepare-parity-metadata.mjs` reads the original component audit and the complete source journal. It requires one published result for each of the original 16 missing or partial components, and produces 72 explicit semantic reviews. It does not mark source completion from an image or a class name. Reviews are applied only when the captured variant, slot, and exact published section IDs match. All 72 reviewed sources must appear in the combined capture manifest before any image assets are written.

```sh
node scripts/prepare-parity-metadata.mjs
python scripts/process-captures.py ../evidence/parity-captures.json --baseline ../evidence/captures.json --metadata ../evidence/parity-capture-metadata.json --output ../evidence/parity-captured-options.json
node scripts/sync-evidence.mjs ../evidence/parity-captured-options.json
node --test
python tests/process-captures.test.py
```

The processor overlays refreshed variants on the baseline, retains unchanged variants, crops real pixels into `screenshots/`, and emits coverage, original bounds, selectors, and reviewed source metadata. A non-rendered component retains zero height and no image. Missing screenshot coverage remains explicit. The metadata preparer reads the retained `component-parity-baseline.json`, so a later complete audit cannot erase the historical repair requirements.

The `events` slot remains the stable ID for reviewed **Private Parties** options. B's original public Playbill belongs to optional `programme`; its new dedicated private-hire section belongs to `events`. A refresh can contain multiple options in one category without combining unrelated sections or overwriting their assets.

Each included variant is a complete published-page observation. Ingestion removes its old choices before adding the current ones, preserves known semantic caveats for unchanged sources, and labels changed unreviewed sources as needing audit. Explicit `designNote: null` is required to clear a resolved design caveat. A source repair does not by itself certify form delivery, booking, checkout, or Library transfer.

## Check the result

Check screenshot dimensions and crop coverage, then review the picker's component matrix, variant presets, style comparison, mixed selection, and exports. Verify the actual published pages separately at a mobile viewport. Keep mobile measurements and any interaction checks with the evidence; a desktop screenshot does not establish mobile or transactional behavior.
