# Refreshing published component evidence

Capture the published consumer route after saving and publishing only the intended INDY test page. Keep the actual content, empty programming states, styles, and inventory. Browser-only fixes and invented sample data do not qualify as a live capture.

The authenticated Chrome workflow records each variant's title, slug, published page ID, section count, header/footer bounds, native section classes and document bounds, capture time, and overlapping viewport screenshots. Scroll by less than a viewport so the fixed header does not leave missing strips between tiles. Record the actual scroll position for each image. The resulting manifest uses the same shape as the sibling `evidence/captures.json` baseline.

A native full-page browser screenshot can instead supply one tile at `scrollY: 0`, with its document dimensions and `captureMethod: "live-browser-full-page"` on the variant. Use explicit tile `cssWidth`/`cssHeight` when known; the method is preserved in the catalog. A single native full-page image is recorded separately from a viewport-tile composite.

Direct document-coordinate section clips use `captureMethod: "live-browser-section-clips"`. For each tile, record its exact `cssWidth`/`cssHeight`, absolute document top as `scrollY`, and `headerHeight: 0`. These clips can have different heights and may exclude the browser scrollbar. Capture pixels from document X zero through the source component's right edge: the cropper still uses document X coordinates. For a component offset by a sidebar, capture a full-width strip and let the processor apply the component's X bounds. Before taking a clip, verify that a fixed header or other overlay is outside its target rectangle and that its lazy images have loaded.

## Reject broken captures before ingestion

The processor preflights **every input image before replacing any screenshot**. It rejects:

- Inconsistent horizontal and vertical image scales beyond 1% or two pixels of rounding tolerance.
- A changed viewport size or pixel scale between viewport tiles. Exact section clips allow different clip dimensions while retaining one consistent pixel scale.
- A full-page image whose detailed top band repeats at two later multiples of the same near-viewport period. This catches a failed browser capture that repeated B's top viewport every 799 image pixels while its outer dimensions looked correct.

Run the same checks without writing any files:

```sh
python scripts/process-captures.py ../evidence/parity-captures.json --metadata ../evidence/parity-capture-metadata.json --validate-only
```

The retained original `parity-captures.json` contains B's known failed full-page file and must fail this check. A fresh manifest replaces a variant as a whole when supplied over the earlier manifest as its baseline:

```sh
python scripts/process-captures.py ../evidence/recaptured-variants.json --baseline ../evidence/parity-captures.json --metadata ../evidence/parity-capture-metadata.json --validate-only
```

`recaptured-variants.json` must contain B's complete fresh observation, including all source sections and header/footer, rather than only its food crop. There is no variant-specific bypass. Remove `--validate-only` and supply `--output` only after the new input passes inspection.

These checks detect contradictions and obvious repetition; they do not certify image content. An internally scaled and clipped image can have plausible outer dimensions. Compare full-page top, middle and bottom pixels against independent settled viewport captures at known document positions. Review each component's native image: navigation needs visible labels or a visible menu control; food needs its actual menu; contact needs the expected fields. A crop with complete geometric coverage can still show the wrong content.

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

## Correct individual previews without replacing a variant

For a partial refresh such as C's navigation or G's private-party section, use the processed options with `apply-capture-corrections.mjs` instead of whole-variant ingestion:

```sh
node scripts/apply-capture-corrections.mjs --reviews=../evidence/recapture-2/correction-visual-reviews.json ../evidence/recapture-2/b-corrected-options.json ../evidence/recapture-2/cg-corrected-options.json
```

This updates only the exact existing option IDs supplied in those files. It preserves all names, CMS aliases, semantic reviews, draft IDs, dependencies, Library records, variant order and unrelated options. The source URL, variant, category and page ID must match the existing choice. Changed published section IDs additionally require `sourceIdentityVerified: true` in their review declaration; a changed source still needs its separate semantic audit kept current.

The review sidecar must declare exactly one entry per corrected option in a `reviews` array, with `optionId`, `status` (`passed`, `needs-review` or `rejected`), the inspected file's `imageSha256`, and specific `notes`. A dated `reviewedAt` and `evidence` reference are required on the entry or sidecar. Record a pass only after inspecting those actual image pixels; a new capture never receives a pass automatically. The script verifies each declared hash, calculates the current `captureKey`, rejects partial or altered captures marked as passed, and writes the catalog only after the complete batch validates. Image files must already have been produced by the capture processor.

## Check the result

Check screenshot dimensions and crop coverage, then review the picker's component matrix, variant presets, style comparison, mixed selection, and exports. Verify the actual published pages separately at a mobile viewport. Keep mobile measurements and any interaction checks with the evidence; a desktop screenshot does not establish mobile or transactional behavior.
