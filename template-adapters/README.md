# Applied native Admin color and overlay controls

**Current status, 25 October 2026:** the later [native color and overlay implementation](admin-controls-completion/FINAL-STATUS.md) is saved on **US-BETA / INDY Demo / Adam Template Testing 2**. The [native journal](../evidence/admin-controls-completion/changes-journal.json) records 30 saved fields with readbacks and all twelve pages published. It includes native Primary/Secondary/Dark and Background roles, shared Theme/header paint, native form bindings, readable card/action tints, Odd semantic card classes and the observed caption backings/shadows. The original palette is restored through native Admin. The [current QA report](../evidence/admin-controls-completion/final-qa-report.json) records final desktop/phone acceptance and outstanding evidence; it must be consulted instead of inferring completion from an older screenshot.

The earlier [compiled brand-token bundle](brand-tokens/README.md) remains a historical review artifact. Its compiled styles were not pasted into native fields. Use the exact [current native saved readbacks](../evidence/admin-controls-completion/native-saved/) and current journal for maintenance/rollback decisions. Fonts, design slants/structure, authored HTML, generated wording, Library transfer behavior and service configuration remain independent; no template has full Admin-only certification.

The Ma/Concrete artifacts below document the **earlier two-fix batch**. Their captured appearance and old hashes are historical evidence, not replacements to restore over the later native implementation. The separate [66-clip native refresh is applied byte-identically](../evidence/admin-controls-completion/captures/admin-controls-published-clips-001/ingestion.json), with current hash-bound pixel reviews and customer catalog records. Native product placeholders remain unchanged.

## Earlier native Ma fix

`proposed-i-page.css` is a complete replacement for Variant I's page CSS. It removes the forced ink color from the hero overlay wrapper, title and subtitle, and removes the two `text-shadow: none` resets. All other existing page rules remain.

A narrow appended rule adds a token-based dark backdrop and text shadow to the actual native carousel title/subtitle **only when the native Light Text checkbox supplies `.text-white`**. It does not set a text color. Each text role gets its own backdrop because the subtitle is absolutely positioned outside the title's normal box. At desktop widths, the verified image row becomes the subtitle's containing block and the narrow message box becomes static. The subtitle sits 24px from the image row's left, right and bottom edges, with its backdrop contained within that frame. Typography and the mobile layout are retained.

The native **Light Text** checkbox was enabled on editable page **5912**, hero section **24876**, and the corrected page CSS was saved and published. Published page **5911** retains hero section **24872**. The page-scoped CSS works with INDY's generated page prefix in both draft preview and publication. The final adapter also targets the verified native `mobile-hero-title` and `mobile-hero-subtitle` roles. Both mobile captions are white with dark backdrops and shadows, measure 327px wide, and fit without horizontal overflow.

The current native Dark is `#38264A`, observed across A–L. Native white against this color measures **13.60:1**. The 88% scrim composited over a pure white image yields `#504060`, measuring **9.36:1** against white. The published desktop and mobile captures show the accepted CSS rendering. These palette checks do not certify a future theme or every image overlay.

## Earlier Concrete fix

`proposed-site-patch.css` is an append-only Site CSS block for **published Concrete page 5903 at desktop widths of at least 1024px**. It resets inherited `q-gutter-lg` child offsets, keeps the layout inside the existing 240px header, centers the actual logo image, and moves the counter from Quasar's surface pseudo-element into `.q-btn__content` flow. The Private Events action has no counter and stays below the six navigation links. Utility buttons remain centered and reachable.

The existing native `--q-*` colors and mobile drawer rules remain. Every menu, child, label, toolbar, logo and utility selector in this block occurs in the actual `f-header-dom.json` export. No image or interactive destination is replaced.

The Site CSS append was saved and live-verified: all seven desktop links are contained within x=0…238.4 of the 240px sidebar, the logo is centered, and 01–06 appear inline with their labels. Root also verified all seven mobile menu links at 390px without horizontal overflow.

## Later color and overlay completion

The original two-fix batch intentionally repaired Ma alone because other templates had conflicting foreground overrides and different caption layouts. The later native-field migration reviewed those actual roles and now installs paired opaque backings and shadows for the observed A–I native caption families, with preserved image geometry and responsive containment. J–L editorial alternatives and selected widget empty states have explicit native panel/copy bridges. Concrete's containment repair is preserved in the saved shared Theme.

That implementation does not establish every slide frame, unseen populated widget state, focus/hover/disabled combination or future arbitrary palette. F's missing Reference Print image and G's existing null mobile background-image configuration remain source-media dependencies. The final native/public matrix and refreshed catalog pixels remain separate evidence gates.

## Earlier repair verification record

The [earlier applied journal and pixel reviews](../evidence/component-controls-repairs/README.md) record that first batch's completed desktop/mobile checks and two byte-identical picker replacements. At that time, Ma's Admin readback matched `proposed-i-page.css` after native newline normalization. The steps below are the historical regression record; current source hashes and installed roles come from the later native journal/readbacks, not this old proposal metadata.

1. Match current Admin CSS against the source SHA-256 hashes in `proposal-metadata.json`. Review the three changed I rules, appended native-role rules and the F desktop append block.
2. With native Light Text off, verify Ma retains its native primary/inherited roles. With it on, verify both title and subtitle receive `.text-white`; no removed ink declaration wins; both backdrops and shadows are visible. At desktop widths, verify the subtitle's containing block is the 760px image row, its width is positive and its full rectangle remains inside that image row. Check the still image, vertical title, subtitle and seal at desktop and 390px width.
3. Inspect Concrete at normal and short desktop heights. All menu rectangles must stay within x=0…240px, each number must share its label's row, and the image center must align with the header center. Private Events and utility controls must remain reachable. Check hover and keyboard focus. At 1023px and 390px, verify the existing mobile header/drawer remains unaffected.
4. Verify adjacent template pages and ordinary text/forms retain their current appearance. No global overlay paint is included in the final Site CSS proposal.
5. After the live source appearance is accepted, recapture affected F/I previews and record new pixel reviews. Old capture fingerprints must not be reused for new pixels.

`proposal-metadata.json` records the before/after CSS hashes, each changed existing I rule, applied status and verification scope. Original DOM and compiled-style evidence remains under `evidence/admin-controls-audit/` in the workspace; portable repair evidence is retained in the repository. No other published page, Library link or customer form/booking action was changed by this batch.
