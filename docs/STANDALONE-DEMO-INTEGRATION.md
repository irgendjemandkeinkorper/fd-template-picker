# Standalone demo integration checklist

Use this checklist after a design's native Pages have been built. Native build completion, public review, screenshot approval and picker promotion are separate states. This is the completion procedure, not a claim that all nine demos have passed it.

The working evidence directory is `../planning/website-templates/standalone-sites/evidence/<design>-qa/` relative to this repository. The [maintenance guide](STANDALONE-DEMO-MAINTENANCE.md) defines the exact Site IDs, seven routes and capture schema.

| Step | Owner | Required result |
| --- | --- | --- |
| 1. Freeze the saved source | Admin operator | Reopen the exact Site and seven Pages; record final widget settings, visibility, published/editable IDs and publication state. Export the exact saved Theme and each distinct Page CSS value. Preserve initial records as before-values. |
| 2. Recheck presentation | Public reviewer | Visit all seven routes on desktop ≥1280px and phone width 390px. Record actual viewport heights; 844px is the normal phone target, with the browser's 639px height allowed when taller capture overrides stall. Confirm the Site/Page IDs, images, readable native fields and internal slide content, navigation, footer and local enquiry links. Follow the phone drawer, including Log In and Sign Up labels. Do not submit a form or enter checkout. |
| 3. Resolve findings | Admin operator, then public reviewer | Apply scoped corrections to the exact native fields, republish affected Pages, export their updated CSS and recheck affected routes/states. Mark an issue resolved only after the public result is observed. Wider Theme changes also require header/drawer/footer checks on both Home and a supporting Page. |
| 4. Capture moved components | Public reviewer | Capture and visually approve complete Food, Private Events, Membership and Contact sections. Record exact published IDs, raw clips, pixel bounds and SHA256 hashes. This nine-site rollout also requires a fresh Showtimes hero after the native image-fit repair. Header updates remain optional. Never substitute the Events programme for the private-hire picker slot. |
| 5. Assemble evidence | Catalog integrator | Prepare the five JSON artifacts and saved CSS listed below. Match the public map to the native Page IDs and QA Pages. Keep exact viewport widths in the QA checks. Keep missing editable mappings empty. |
| 6. Validate and promote one Site | Catalog integrator | Run `--check`; fix any rejection. Only then run the write command for that same package, regenerate the module index and run the tests. Inspect the diff for only the intended Site's source references, screenshots and verified Hub status. |
| 7. Review the picker | Public reviewer | Check the four updated choices, image labels and source links, the design's Hub link and exported build brief. Confirm existing names, color choices, contrast acknowledgment and saved user selection still work. Preserve the evidence and hand off any unresolved limitations. |

## Required package

| File | What it proves |
| --- | --- |
| `../<design>-native-records.json` | Native Site and Page identity. Both current record shapes are supported; source `privateHire` maps to public role `private-hire`. Initial Section types/visibility may be before-values. |
| `public-native-map.json` | Seven actual public URLs, Page IDs, main classes and published Section IDs from rendered DOM. |
| `verification.json` | `indy-standalone-public-qa/v1`, fourteen route/viewport observations, actual widths, real local phone navigation and no open presentation defects. Final status must be `passed`. |
| `component-captures.json` | `fd-standalone-captures/v1`, all four moved slots together, unaltered full-section pixels and passed visual reviews. Keep its raw assets inside the same evidence directory. |
| `catalog-refresh.json` | `fd-standalone-refresh/v1`, the exact variant and relative paths to the other artifacts and saved CSS. Use `pageCssByRole` for Pages whose saved CSS differs from the shared default. |
| Saved CSS exports | Exact post-save Theme and Page field contents. File existence in `proposals/` and a generator's output hash do not prove a native save. |

Retain each route observation and its QA screenshots in the working evidence folder. Their filenames inside the public map and QA report describe that source folder. The importer packages the summary reports, native record, saved CSS and raw component clips; it does not currently copy every auxiliary route screenshot. Keep the working evidence available when handing the repository to another operator.

## Exact command sequence

Run from `fd-template-picker`, substituting the reviewed design's directory:

```sh
node scripts/refresh-standalone-catalog.mjs ../planning/website-templates/standalone-sites/evidence/reel-qa/catalog-refresh.json --check
node scripts/refresh-standalone-catalog.mjs ../planning/website-templates/standalone-sites/evidence/reel-qa/catalog-refresh.json
node scripts/build-module-index.mjs
node --test
git diff --check
```

The validation command writes nothing. Do not bypass its passed-QA or four-capture requirements to advertise progress. A successful native build can remain available through its existing homepage link while the new catalog package awaits review.

For this rollout, every manifest must include `heroCaptureAfter` using that design's `savedAt` value in `theme-home-backgrounds.native-saved.json`. This requires a reviewed hero captured after the final native Theme repair. The generic importer still permits a four-component refresh when that field is omitted for other work. Review cursor placement as well as image loading: repeated pointers in joined strips or pointers obscuring content require recapture. One unobtrusive cursor in empty space does not invalidate an otherwise accurate complete capture. Move the pointer outside the crop using documented native controls where practical; do not retouch it out of the pixels.

The importer retains choice IDs, old authoring references and pre-standalone references. It changes only the supplied design, archives source evidence under `evidence/standalone-sites/<design>/` and records all seven verified URLs in the Hub's `siteStructure.pages`. The current Hub renderer still exposes its main homepage link; additional page links would be a separate UI change. The older `refresh-demo-catalog.mjs` refuses to overwrite promoted standalone sources.

## Stop conditions

If native records and the public map disagree, return to the exact Site/Page and resolve identity before promotion. If an image is gray, cropped short or contains a fixed-header seam, recapture it using known viewport geometry. Exact native clips remain the default. If those calls stall but ordinary screenshots work, use the optional validated `uniform-provider-resize` contract in the [maintenance guide](STANDALONE-DEMO-MAINTENANCE.md). It preserves CSS bounds separately from encoded pixels and only crops/joins the provider's images. Do not silently treat scaled pixels as unscaled CSS coordinates or repeat failing capture attempts indefinitely. If saved CSS is unavailable, retain the proposal as prepared evidence and obtain the actual saved value. If a public fix is applied after a capture, recheck whether it changes that capture and replace stale pixels when it does.

Before deployment, verify the customer names in the checklist, expanded previews, review, summary and build-brief human labels: Showcase, Reel, Neon, Cameo, Metropolis, Encore, Splice, Prologue and Pause. `names.mjs` owns this display mapping, while historical Page titles, stable IDs and source evidence retain their original names. Include that module in the static hosting package. The shared navigation choice continues to read “Splice / Prologue / Pause” until separate designs are verified.

These demos remain display-only. Full accessibility review, submitted enquiry delivery, checkout, Library transfer and customer-specific commercial facts are separate work. A visual pass does not certify them.
