# Applied source repairs: Ma native text and Concrete navigation

Prepared from the 25 October 2026 Admin exports for **US-BETA / INDY Demo / Adam Template Testing 2**, then applied by root through INDY Admin after user approval. **Only the Ma text repair and Concrete navigation repair described here are applied.** The [brand-token migration bundle](brand-tokens/README.md), all twelve generated migrations and the D pilot remain proposals and have not been applied.

## Applied native Ma fix

`proposed-i-page.css` is a complete replacement for Variant I's page CSS. It removes the forced ink color from the hero overlay wrapper, title and subtitle, and removes the two `text-shadow: none` resets. All other existing page rules remain.

A narrow appended rule adds a token-based dark backdrop and text shadow to the actual native carousel title/subtitle **only when the native Light Text checkbox supplies `.text-white`**. It does not set a text color. Each text role gets its own backdrop because the subtitle is absolutely positioned outside the title's normal box. At desktop widths, the verified image row becomes the subtitle's containing block and the narrow message box becomes static. The subtitle sits 24px from the image row's left, right and bottom edges, with its backdrop contained within that frame. Typography and the mobile layout are retained.

The native **Light Text** checkbox was enabled on editable page **5912**, hero section **24876**, and the corrected page CSS was saved and published. Published page **5911** retains hero section **24872**. The page-scoped CSS works with INDY's generated page prefix in both draft preview and publication. The final adapter also targets the verified native `mobile-hero-title` and `mobile-hero-subtitle` roles. Both mobile captions are white with dark backdrops and shadows, measure 327px wide, and fit without horizontal overflow.

The current native Dark is `#38264A`, observed across A–L. Native white against this color measures **13.60:1**. The 88% scrim composited over a pure white image yields `#504060`, measuring **9.36:1** against white. The published desktop and mobile captures show the accepted CSS rendering. These palette checks do not certify a future theme or every image overlay.

## Applied Concrete fix

`proposed-site-patch.css` is an append-only Site CSS block for **published Concrete page 5903 at desktop widths of at least 1024px**. It resets inherited `q-gutter-lg` child offsets, keeps the layout inside the existing 240px header, centers the actual logo image, and moves the counter from Quasar's surface pseudo-element into `.q-btn__content` flow. The Private Events action has no counter and stays below the six navigation links. Utility buttons remain centered and reachable.

The existing native `--q-*` colors and mobile drawer rules remain. Every menu, child, label, toolbar, logo and utility selector in this block occurs in the actual `f-header-dom.json` export. No image or interactive destination is replaced.

The Site CSS append was saved and live-verified: all seven desktop links are contained within x=0…238.4 of the 240px sidebar, the logo is centered, and 01–06 appear inline with their labels. Root also verified all seven mobile menu links at 390px without horizontal overflow.

## Broader overlay work remains separate

The fresh compiled A–L styles show fixed foreground overrides that conflict with native Light Text classes. For example, B's native title has `.text-white`, but its page CSS forces dark ink. A blanket `.text-white` dark scrim would make that copy dark on dark. D's native copy has been moved into a paper-caption layout, and F's Reference Print has no configured image. Their image-row pseudo-elements must not be overwritten.

This batch therefore repairs **Ma only** for media copy. It makes no claim that native color controls or every image overlay have been cleaned across A–L. A broader migration requires reviewing each actual foreground, native setting and caption layout before removing its conflicting page CSS. Ordinary headings, forms and body text are outside this batch.

## Verification and future regression checks

The [applied change journal and new pixel reviews](../evidence/component-controls-repairs/README.md) record the completed desktop/mobile checks. Both picker screenshots have been replaced with byte-identical native section clips and fresh hash-bound reviews. The exact final Ma Admin CSS readback matches `proposed-i-page.css` after trimming its final newline; the Admin server removes that newline.

1. Match current Admin CSS against the source SHA-256 hashes in `proposal-metadata.json`. Review the three changed I rules, appended native-role rules and the F desktop append block.
2. With native Light Text off, verify Ma retains its native primary/inherited roles. With it on, verify both title and subtitle receive `.text-white`; no removed ink declaration wins; both backdrops and shadows are visible. At desktop widths, verify the subtitle's containing block is the 760px image row, its width is positive and its full rectangle remains inside that image row. Check the still image, vertical title, subtitle and seal at desktop and 390px width.
3. Inspect Concrete at normal and short desktop heights. All menu rectangles must stay within x=0…240px, each number must share its label's row, and the image center must align with the header center. Private Events and utility controls must remain reachable. Check hover and keyboard focus. At 1023px and 390px, verify the existing mobile header/drawer remains unaffected.
4. Verify adjacent template pages and ordinary text/forms retain their current appearance. No global overlay paint is included in the final Site CSS proposal.
5. After the live source appearance is accepted, recapture affected F/I previews and record new pixel reviews. Old capture fingerprints must not be reused for new pixels.

`proposal-metadata.json` records the before/after CSS hashes, each changed existing I rule, applied status and verification scope. Original DOM and compiled-style evidence remains under `evidence/admin-controls-audit/` in the workspace; portable repair evidence is retained in the repository. No other published page, Library link or customer form/booking action was changed by this batch.
