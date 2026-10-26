# Standalone cinema demo maintenance

The nine demos are individual cinema websites. Each design uses its own native Site, its own published supporting Pages, one site-wide header and a local footer. The homepage leads with native Showtimes and a compact set of links. Detailed food, membership, private-hire and contact content belongs on its supporting Page.

This guide describes the repeatable build and catalog update. A Site counts as reviewed only when its `demoSite.siteStructure.status` in `data/template-hub.json` is `standalone`, with the linked seven-page QA report. The rollout can be partial; the existence of a public hostname alone does not prove that its supporting Pages have been rebuilt.

Use the [final integration checklist](STANDALONE-DEMO-INTEGRATION.md) when the native build is ready for public review. The Admin operator owns native saves and exports; the public reviewer owns route and screenshot evidence; the catalog integrator promotes only the reviewed package. During shared Chrome work, give one operator the browser at a time and explicitly hand it back after resetting any temporary viewport.

During this rollout, stalled dropdown options and screenshot timeouts recovered after resetting the previous responsive viewport through the documented browser `viewport.reset()` control. Check the resulting visible state before retrying. Some options appeared only on the next state read; repeated clicks or creation requests can produce duplicate persistent records. Browser recovery does not require a client-config cache clear.

## Native destinations

All nine destinations are in **US-BETA → INDY Demo**. Preserve the authoring Site **Adam Template Testing 2 / 170**, earlier Showcase **183**, and incomplete Showcase **184**.

| Design | Native Site | Published homepage | Editable homepage |
| --- | ---: | ---: | ---: |
| Showcase | 193 | 6797 | 6840 |
| Reel | 185 | 6110 | 6153 |
| Neon | 186 | 6197 | 6240 |
| Cameo | 187 | 6286 | 6329 |
| Metropolis | 188 | 6373 | 6416 |
| Encore | 191 | 6632 | 6675 |
| Splice | 189 | 6461 | 6504 |
| Prologue | 190 | 6548 | 6591 |
| Pause | 192 | 6721 | 6764 |

Showcase uses `template-showcase-demo-indy-consumer.netlify.app`. The others use `template-<design>-indy-consumer.netlify.app`. Existing root redirects retain the historical `variant-…` homepage slug. Display names stay Showcase, Reel, Neon, Cameo, Metropolis, Encore, Splice, Prologue and Pause.

| Header destination | Stable local route | Native content |
| --- | --- | --- |
| Home | Existing design homepage | Showtimes, then compact links to supporting Pages |
| Films | `/movie-lineup/` | Short introduction, Explore Movies and Showtimes |
| Menu & Bar | `/food-drink/` | Concessions Menu with the design's menu treatment |
| Private Events | `/private-hire/` | The design's private-hire content and enquiry link |
| Membership | `/membership/` | The design's membership choices and enquiry link |
| Visit | `/visit/` | Demonstration venue information and native Generic Form |
| Events & Late Nights | `/events-late-nights/` | Editorial programme links to Films |

Update the existing published Page at each route. Resolve both the published and editable IDs through Admin; they differ. Keep the existing Page slug and Navigation item. Native Duplicate was observed to copy the immutable slug, so it is not the method for creating this structure.

## Build one design

1. Verify the visible Region, Circuit and Site before editing. Save the current Theme CSS, Page CSS, Section settings, visibility and content in the per-site record. Wait for the Site selection to finish loading before reading or saving fields.
2. Extract only that design's Theme styling. Apply the header across the Site instead of scoping it to the homepage. Preserve its established desktop/mobile layout and six native branding roles. Header, footer, film details and supporting Pages should share the design.
3. Populate the six supporting Pages using the table above. Keep native Concessions Menu, Explore Movies, Showtimes and Generic Form widgets. Use the existing authored, class-based content for private hire and membership where native fields do not represent the layout. Hide superseded sections using native visibility rather than deleting them.
4. Preserve the meaningful internal Section Names when the stylesheet uses their generated class prefixes. New published and editable Section IDs must be recorded separately. Do not copy an old numeric selector into a new Section.
5. Apply the supporting Page CSS to supporting Pages only. Keep the homepage's own Page CSS. Replace its former full-section stack with Showtimes and the compact feature-link section, then hide its superseded detailed sections.
6. Add one native **Footer Global Widget** for the Site. Use a Full Width block with **Custom Text**, the local six-page link content, and `fdp-site-footer` as its class. Confirm **On**, desktop/mobile visibility, Width Mode **Full Width** and Background Color **Default**. Publish the widget.
7. Save and publish the authorized demo Pages, then reopen the records and inspect the actual public Site. Native saves and publication indicators are asynchronous; a click alone is not proof of completion.

The shared sample movies and seven concession products stay in native inventory. The October 26–29, 2026 screenings are display-only and expire after that window. Keep online ticketing disabled for this rollout; no checkout or form submission is part of the presentation review. Fictional venue details, membership examples and hire examples must remain clearly identified as demonstration content.

## Section names, component CSS and native forms

An internal Section Name is part of the current styling contract. For example, `Food A - Chip Rail` generates a class beginning `section-food-a---chip-rail-`; the stylesheet matches that prefix so a new numeric ID is safe. Renaming the Section can change the prefix and lose its styles. Change customer-facing headings through the widget's content fields. If the internal name must change, inspect the new public class and update its scoped rule deliberately.

Keep all three style layers together: Site Theme, containing Page CSS and any native Section/Custom Block CSS. The Reel private-hire conversion preserved HTML but dropped the former Text Block's Section CSS; the Page CSS alone did not recreate its two-column layout. The same dependency was identified for Splice, Prologue and Pause membership. The prepared component layer carries those saved recipes under the retained Section-name prefix. Preserve the inner HTML classes as well, including `fdp-content`, `od-club`, `gr-mem`, `cn-wrap` and the design's membership class. Do not infer a complete reusable block from a successful HTML paste.

For this rollout, the native Generic Form has three required **Full Width** fields: **Name / Text**, **Email / Email**, and **What you have in mind / Notes**. Inspect the actual saved fields and published DOM. Cameo's original postcard CSS assumed one wide and two half-width fields; assigning every native `.col-12` to the same grid position made all three overlap. Its scoped correction uses one-column auto-flow in DOM order, with a 16px gap. Keep field types and required states native; use CSS only for the frame and layout. Verify all labels, inputs, validation space and the submit button on desktop and phone without submitting.

Native `sections` arrays in the initial record often describe before-values. They do not certify the final widget type or visibility. Add final saved-state evidence separately and record the current `nativeWidgetType` in each capture. Keep unknown editable IDs empty until Admin supplies them.

A saved CSS export does not establish which version the public Page is serving. Cameo's Visit export contained the Full Width correction, but a fresh public load still exposed the earlier `style#indy-custom-page-styles` without that tail and kept all three fields on one grid row. Inspect the live Page identity, compiled style text and computed rules before changing selectors again. Resolve the exact Page's save/publication state; do not use a broad cache clear or an unrelated Theme workaround to mask stale published Page CSS.

The later Admin check found the affected row still showing `published_with_changes`: the new CSS was saved but waiting to publish. Publish that exact authorized row, wait for its pending-change indicator to clear, then recheck the public stylesheet and actual fields. A Page can have an existing published URL while newer saved edits remain unpublished.

## Footer and CSS troubleshooting

The native Footer Custom Text field renders the reusable HTML. Its surrounding `preserve-wrap` class also preserves source newlines. Include `white-space: normal` on `.fdp-demo-footer` to avoid excessive blank space.

In the Reel pilot, the Footer Gear's saved Custom CSS did not appear in the public page. Put the small, class-scoped footer rules in **Theme & Style → CSS**, then verify the actual computed public result. Keep the Footer Global Widget for content and links. Do not add page-specific footer copies to compensate.

The native Showtimes slider can have an internal phone-width overflow even when document width equals viewport width. Inspect the synopsis column inside the slide. The scoped phone sizing correction must include its padding in the available width; verify the actual caption wrapping instead of relying only on a body-overflow measurement.

On dark designs, review the Explore Movies search input, placeholder and icon, plus the native contact introduction. Native widget defaults may retain black text. Use the recorded class/widget selectors and native color roles for those small corrections.

The compact Home teaser has its own foreground/surface role contract. Its light designs use Dark copy on Background; Showcase, Neon and Metropolis retain their dark treatments. If the teaser surface is transparent, Dark copy can fall onto the Theme's Dark page container and disappear. The prepared `home-backgrounds.css` layer repeats only the module's color backgrounds as `background-color` longhands in Site-scoped Theme CSS, including card tints and inverse number chips. Keep that small dependency with the existing `fdp-home-links` classes and native `--home-*` role properties. Confirm the saved/public Theme actually contains the layer before recording the issue as fixed; do not reset all headings or hardcode one surface for every design.

Native client-side routing was observed to remove `#contact` from an enquiry link and open Visit at the top. This still reaches the Page containing the form. Do not promise direct scrolling to the form without a separately verified route fix.

## Verify the full Site

Check all seven routes at desktop width and **390px phone width**. Use 844px height normally; if taller viewport overrides stall the screenshot provider, use the actual browser height (639px was observed) and record it honestly. On each route, confirm the native Site ID, Page ID, correct design styling, readable text, loaded images, absence of internal clipping and no horizontal document overflow. Check all seven desktop navigation destinations and actually use the phone drawer, including the Log In and Sign Up labels against their own button surfaces. Follow a membership/private-hire enquiry link to the local Visit Page. Inspect footer links on a supporting Page as well as Home.

Verify the seven food items and prices using each design's intended native layout and visibility. Encore, Splice and Prologue have native images off; Splice and Prologue also have descriptions off, while Pause's design CSS intentionally hides its native image nodes. Check photos only where the design displays them, and check the category controls in their intended position. Also verify native film content, the configured showtime window, membership choices and native contact fields. Do not submit forms or place orders. Record the result as `indy-standalone-public-qa/v1`; keep unresolved findings open rather than calling a partially reviewed Site complete.

Collect the published IDs from the public DOM and the editable IDs from Admin. Do not derive one set from the other. The native records may contain before-edit Section Names and types; explicitly record a changed widget type when preparing its current catalog capture.

## Refresh picker sources and screenshots

The picker keeps its six stable choice IDs. Only their current source Page/Section and screenshot evidence change:

| Picker slot | Source Page role | Required capture |
| --- | --- | --- |
| `header` | `home` | Optional refresh; site-wide navigation |
| `hero` | `home` | Optional refresh; native Showtimes |
| `food` | `food` | Native food section |
| `events` | `private-hire` | Private-hire section, **not** the public events programme |
| `membership` | `membership` | Membership section |
| `contact` | `visit` | Native contact section |

Capture the actual live section after loading its images through ordinary scrolling. Keep all raw clips and review the final pixels. Gray loading screens, incomplete clips, browser-only restyling and injected sample content cannot become passed screenshots. The four moved slots are promoted together; optional header/hero refreshes can accompany them.

Ordinary viewport screenshots were observed to shrink a 1536 × 864 DOM viewport to 1521 × 856 pixels when the scrollbar was present. Do not join those images using unscaled DOM coordinates. Explicit screenshot clips using the observed document client width, current scroll position and viewport height produced exact dimensions and remain the default. Inspect encoded dimensions before assembly. When exact clips stall but ordinary screenshots succeed, the capture helper can use `captureMode: 'uniform-provider-resize'`. This optional path records and validates the browser provider's uniform scale; it does not resample or restyle screenshots. Unaccounted scaling, nonuniform or inconsistent tiles, missing source rows and representative crops presented as complete sections are rejected.

Create a `catalog-refresh.json` beside the Site's public QA files:

```json
{
  "schema": "fd-standalone-refresh/v1",
  "variant": "variant-b-rep",
  "publicMap": "public-native-map.json",
  "nativeRecord": "../reel-native-records.json",
  "captures": "component-captures.json",
  "qa": "verification.json",
  "pageCss": "saved-native/supporting-page.css",
  "pageCssByRole": {
    "private-hire": "saved-native/private-hire-page.css"
  },
  "themeCss": "saved-native/site-theme.css"
}
```

The CSS files must contain the exact saved native values, including later footer or sizing corrections. A proposal that was never applied is not saved-state evidence. Paths are relative to this manifest. Screenshot paths are relative to `component-captures.json` and must remain inside its directory.

`pageCss` is the shared supporting-Page default. Compare the exported saved values for all six supporting Pages. If one differs, include its exact value in optional `pageCssByRole`; accepted keys are `home`, `films`, `food`, `private-hire`, `membership`, `visit` and `events`. Only omit an override when that Page really uses the default bytes. This avoids claiming that a fix saved only to Visit was also saved to Food. A Home override is optional; otherwise its existing homepage CSS reference is preserved. The importer archives overrides separately and points each affected choice and verified Page to the right file.

The capture file uses `fd-standalone-captures/v1` with a `captures` array. Each item provides `slot`, `pageRole`, `sourceUrl`, `pageId`, published `sectionIds`, explicitly mapped `draftSectionIds` or an empty array, `nativeWidgetType`, optional `nativeName`, `image`, `width`, `height`, `capturedAt`, `sourceBounds`, `captureBounds`, `selectors`, and raw `parts`. Each part has `image`, `bounds` and numeric `offset`. Both `appearanceAltered` and `sampleDataInjected` must be `false`. `visualReview` must contain `status: "passed"`, `reviewedAt`, `imageSha256`, review `notes` and `evidence`.

When a part contains an entire viewport instead of an already cropped section clip, also provide `expectedRawSize`, `rawCaptureBounds`, `viewportScrollY` and `imageCropBounds`. These preserve the exact source pixels used for each consecutive part. Raw crops must fit the actual encoded image, and their combined heights must cover the complete section without gaps. The final image is a high-quality JPEG; retain the raw clips separately.

For the optional provider-resize path, add `nativeScale` with `kind: "uniform-provider-resize"`, `pixelsPerCssPixel`, `cssViewport: {width, height}` and `rounding: "nearest-segment"`. The scale is actual raw image width divided by `innerWidth`; actual raw image height must match `innerHeight × scale` within one pixel. Every tile must retain the same CSS viewport, raw dimensions and scale. `sourceBounds`, `captureBounds`, part `bounds`, `offset` and `rawCaptureBounds` remain CSS coordinates. Each part also records an encoded-pixel `pixelOffset` and `imageCropBounds`: subtract the raw viewport's CSS origin, multiply by the scale, then round each x, y, width and height to the nearest pixel. The next pixel offset equals the sum of preceding encoded crop heights. Final `width` is rounded CSS width times scale, and final `height` is the sum of encoded crop heights. CSS segments must cover the complete source consecutively, and every encoded crop must fit the raw image. The assembler may shorten a CSS segment before capture metadata is finalized to keep its rounded pixel crop inside the image; it must never silently clamp an out-of-bounds crop. This quantization is retained in the metadata. Assembly only crops and joins native image pixels; the final result still needs a hash-matched visual review.

The QA file uses the existing public QA shape with `status: "passed"` and `checkedAt`. It must verify all seven Pages, both viewport modes, the Site identity, 390px phone width, a desktop width of at least 1280px, zero document overflow and the local seven-item phone drawer. Its `pages` must match the public native map. Unresolved presentation findings block promotion; recorded behavior notes can remain.

From the repository, validate first, then apply:

```sh
node scripts/refresh-standalone-catalog.mjs ../planning/website-templates/standalone-sites/evidence/reel-qa/catalog-refresh.json --check
node scripts/refresh-standalone-catalog.mjs ../planning/website-templates/standalone-sites/evidence/reel-qa/catalog-refresh.json
node scripts/build-module-index.mjs
node --test
```

The importer preserves the original authoring reference and the earlier homepage reference, stores the new proof under `evidence/standalone-sites/<design>/`, and updates only that design's reviewed choices. It also records its seven verified Page links in the Hub's `siteStructure` data. The Hub's existing main link remains the Site homepage. No picker choice or browser storage is changed by importing evidence.

Do not run the older `refresh-demo-catalog.mjs` after standalone promotion: it reconstructs the former homepage catalog. It now refuses to overwrite a catalog containing standalone sources.

## Reuse limits and rollback

A reviewed standalone Site is a demo, not a verified Library block package. Page CSS may still depend on Site Theme CSS. Library import/unlink, copy/paste propagation, arbitrary palettes and customer-specific commercial content remain separate checks.

For a correction, reopen the exact destination record, restore its saved before-value if needed, and republish only that Page or widget. Avoid broad cache actions. Retain native source and draft IDs, raw screenshots, published proof and any unused investigation drafts in the journal so another operator can resume without guessing.
