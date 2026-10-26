# Applied component control repairs and new captures

**Target:** US-BETA / INDY Demo / Adam Template Testing 2, site 170. The user approved the Ma native text and Concrete navigation batch. Root applied it through INDY Admin; the capture ingestion preserved the actual published pixels.

## Changes and independent pixel review

- **Concrete navigation:** the Site CSS append repairs desktop menu containment, logo centering and counter placement. `f-navigation-live.jpg` is the native 240 × 640 JPEG clip. The complete logo, 01–06 labels, coral Private Events action and search/account icons are visible. The numbers share their labels' rows and no link is cropped. Root measured every desktop link within x=0…238.4 and verified seven mobile menu links at 390px without horizontal overflow.
- **Ma hero:** native Light Text was enabled on editable page 5912, section 24876. The page CSS stopped forcing ink over the native light role, supplied dark caption backdrops/shadows, and anchored the desktop subtitle inside the image row. It was published to page 5911, retaining section 24872. `i-hero-live.jpg` is the native 1521 × 736 JPEG clip. The real Ghost in the Shell still, full white vertical title, complete white subtitle and red seal are visible. The captions are readable and contained; the photo has not been replaced or altered.
- **Ma phone check:** `ma-mobile-final.jpg` and `.json` show both native mobile caption roles as white text with the expected 88% dark backdrop and shadows. Each caption is 327px wide. The 390 × 844 viewport has equal 375px document client/scroll widths, with no measured horizontal overflow. Desktop geometry is recorded in `ma-published-desktop.json`.

Both desktop captures and the Ma phone image were viewed directly during this ingestion. The final saved Ma CSS readback, `i-page-css-final-saved.css`, includes the native mobile selectors and matches the applied `template-adapters/proposed-i-page.css` after `.trim()`. The earlier intermediate readback is not used as final-save evidence.

## Capture provenance

The supplied JPEG files were already exact native browser section clips. Their bytes were copied unchanged into the picker assets and this evidence folder: no resizing, recoloring, stitching, new cropping, fixtures or browser-only style changes were applied during capture processing. The intentional CSS repairs are saved source changes in INDY, rather than temporary capture alterations.

The 240px sidebar has a 639.200012px source height, rounded outward to 640 raster rows. Ma's 1520.800049px source width rounds outward to 1521 raster columns; its clip starts at document y=99 and contains the full 736px hero. `capture-corrections.json` records these source/clip bounds, viewport and raw image hashes. Capture times use each raw screenshot's actual file last-write time in UTC; the review/ingestion has its own recorded timestamp.

`review-declarations.json` binds each passed visual review to the exact new JPEG SHA-256. The guarded correction script changed only `header--variant-f-concrete` and `hero--variant-i-ma`. Both options retain their source names, published/draft identities, semantic and Library metadata. All other 108 options, including the shared Navigation `customerDesign` metadata, are unchanged. Prior option capture records and unchanged-option digests are retained for audit.

## Scope and limits

`changes-journal.json` records the approved source changes and the ingestion checks. The Site CSS append targets Concrete desktop navigation only; the media-copy repair targets Ma only. No other published page was changed, no Library objects or links were changed, and no booking, membership, form or purchase action was submitted.

The broader brand-token bundle, all twelve migration outputs and the D pilot remain **not applied**. This batch does not claim that every A–L overlay or native color control has been repaired.
