# INDY Library templates

Verified context: **US-BETA / INDY Demo**, 25 October 2026. The approved pilot created a food-only carrier at **Adam Template Testing 2**, promoted it to Circuit **LIBRARY**, and imported one independent copy at **Adam Template Testing**. All remain **unpublished**. Cross-site transfer, new identifiers, preserved settings/CSS and destination-catalogue binding are now demonstrated. Destination visual acceptance is pending a native compiled-style refresh after a local Section rename. See [the pilot journal](../evidence/library-k-food-pilot/pilot-journal.json).

## Current recommendation

Use a **food-only Page containing one native Concessions Menu Section**, titled `variant-k-clubhouse_food`. Its Page CSS is empty; self-contained styling is saved in **Section Settings → Custom CSS**, with class `fdp-k-food`. This successfully transferred K's food module without the rest of Variant K. The original full K Page `5915` remains unchanged, Not Linked, with eight Sections.

The widget settings, portable Section CSS, dependency manifest and acceptance checks are in [the Clubhouse Kitchen package](../template-adapters/library-k-food/README.md). Baseline CSS transferred exactly, native settings and the stable class survived, and each runtime used its own catalogue. The destination Section's subsequent internal Name change exposed a stale compiled CSS scope; its saved CSS remains correct, but visual QA is blocked pending the separate refresh described below. Actual phone and consumer Theme verification also remain open.

A food-only Library Page distributes a **separate food Page**. This pilot does **not** establish a way to append the Section to an existing homepage. Keep carrier isolation, cross-site Library transfer and insertion into an existing Page as separate outcomes.

## Actual K Food source

| Identity | Published source | Editable source draft |
| --- | --- | --- |
| Page | `5915` — Variant K Clubhouse | `5916` — Variant K Clubhouse |
| Section | `25135` — Food K - Clubhouse Kitchen | `25122` — Food K - Clubhouse Kitchen |
| Widget | Concessions Menu | Concessions Menu |
| Stable Section class | `fdp-k-food` | `fdp-k-food` |

Source: [Variant K Clubhouse](https://adam-template-testing-2-indy-consumer.netlify.app/variant-k-clubhouse/). Current native captures are in [the pilot evidence folder](../evidence/library-k-food-pilot/).

The food heading is **“Good company. Good things to share.”** and its subtitle is **“Explore the kitchen and bar before you settle in.”** Configuration is **Website / Block / Grid**, with **3 desktop / 1 mobile items per row**, left-hand category filters, photos, descriptions and prices. Categories Visibility Override is empty; the observed Snacks, Drinks and Desserts are generated from the source catalogue. Their rendered IDs are evidence, not filters to copy into another Site.

**K Stay Awhile** remains a separate editorial **Experience** Text Block. It is not the Food pilot. The old `variant-k-clubhouse_experience` carrier name remains a separate naming proposal; no such carrier was created here.

## Saved carrier, Library master and independent copy

| Object | Site | Page-list/base ID | Editable draft ID | Current editable Section | Link state |
| --- | --- | --- | --- | --- | --- |
| Food-only source carrier | Adam Template Testing 2 (`170`) | `5969` | `5970` | `25151` | Linked with Updates, Library ID `5971` |
| Circuit Library master | LIBRARY (`138`) | `5971` | `5972` | `25153` | Master |
| Independent destination | Adam Template Testing | `5973` | `5974` | `25155` | Not Linked |

Each is one Page record with an editable draft, not two independent Pages. Initial source Section `25150` belongs to the first create state; the persisted editable carrier is Section `25151` on draft `5970`. Its first reopen showed an empty draft, which was populated and reopened again to prove the Section persisted. Use the current editable identities for further changes.

All three Pages contain exactly one native Concessions Menu, have empty Page CSS, retain `fdp-k-food` and use **Website / Block / Grid**, **3 desktop / 1 mobile items per row**, with empty category override. The title generated slug `variant-k-clubhouse-food`. The destination is visibility off and unpublished. Its six existing Pages were unchanged; the single import made seven total. The Library asset imported without website publication.

The persisted carrier's [desktop Admin preview measurements](../evidence/library-k-food-pilot/carrier-draft-desktop-dom.json) show seven products, seven loaded photos, three columns and no horizontal overflow at 1024px. Its [phone Admin preview measurements](../evidence/library-k-food-pilot/carrier-draft-phone-dom.json) show seven products/photos and one column in a 376px simulated frame, but 379px scroll width: **3px overflow remains in that simulated preview**. The 62px heading and padding reflect viewport units resolving against outer Chrome. This is an Admin-preview limitation, not a passing actual-phone check. [The reopened draft screenshot](../evidence/library-k-food-pilot/carrier-draft-5970-saved.jpg) records the persisted one-Section structure.

Admin previews use the **Admin framework palette**, not consumer Theme colors. They do not establish consumer contrast or actual-phone behavior. The unpublished source carrier route redirects to the homepage, so its slug is provenance, not a live preview. Exact saved fields and screenshots are retained in [the pilot evidence folder](../evidence/library-k-food-pilot/).

The master preview had **26 products**, while the destination had **seven**. Destination category IDs **589/590/591** differ from source **596/597/598**, with category override still empty. This demonstrates native runtime catalogue binding; source product records were not packaged as static HTML. The transfer does not configure destination product availability or prove checkout behavior.

After Unlink and saved **Not Linked** status, the destination's internal Section Name changed from **Food K - Clubhouse Kitchen** to **Food - Clubhouse Kitchen**, then saved and reopened. The Library master retained its original Name and exact CSS; see [the independence comparison](../evidence/library-k-food-pilot/library-master-independence-check.json). No destructive upstream update was pushed to test future propagation.

## Destination compiled-style issue

The internal Name edit changed the rendered root to `.section-food---clubhouse-kitchen-25155`, but native compiled CSS still targets `.section-food-k---clubhouse-kitchen-25155`. Reopening did not correct it; the heading falls back to Roboto despite exact saved Section CSS. See [the captured mismatch](../evidence/library-k-food-pilot/destination-style-before-reopen.json).

A [comment-only CSS refresh](../template-adapters/library-k-food/destination-scope-refresh.proposed.css) is prepared to trigger native recompilation without changing the preset. It has not yet been applied under the current evidence state. Destination visual acceptance remains blocked until that exact save is approved, applied, read back and previewed. Do not treat correct stored CSS or successful Library transfer as proof of correct compiled rendering.

## Current controls and limits

| Inspected surface | Observed controls | What this establishes |
| --- | --- | --- |
| K Food Section menu | Edit, Duplicate, Delete, View History | In-page duplication exists. No cross-page Copy/Move or Section Library action was visible. |
| Add Section | Native widget Type choices | No import-from-page or Section Library control was visible in the inspected flow. |
| Pages | Add From Library selection table; one food-only Page imported into the named destination | Separate-Page transfer is demonstrated. Repeated imports and existing-Page insertion remain untested. |
| Source carrier Library chip | Create New Library Page, then saved Linked with Updates / Library ID `5971` | Promotion created the one-Section Circuit Library master. Original full K stays Not Linked. |
| Custom Blocks | Add From Library opens a record table; unsaved builder offers Image, Text, Link, Button, Video, Map and grid blocks | No native Concessions Menu appeared in the inspected builder palette. Native-widget nesting remains unproven. The builder was closed without creating a block. |

Force Update is disabled while a Page is Not Linked. Its visible description says it synchronizes all content from a linked Library Page. This pilot verifies one separate-Page import with new record IDs, preserved CSS/settings and local catalogue binding. It does not establish repeated import behavior, every dependency type, future update propagation or insertion into another Page.

The former Pages help article (`12856828`) still returns a missing-page response, and Help Center search found no replacement dedicated Pages article. Use the observed tenant controls for the pilot instead of treating old Page-copy guidance as current proof.

## Library ownership and update policy

The official **Circuit Libraries** article was reopened in authenticated Chrome on 25 October 2026. It distinguishes **Linked with Updates**, **Linked with No Updates** and **Not Linked**. Disabling automatic updates retains the relationship; **Force Update** can still refresh a linked record. **Unlink** makes the local record independent. Shared data is maintained through a Library Site, and Library provisioning requires INDY Support. [Circuit Libraries](https://support.indy.systems/en/articles/11975519-circuit-libraries)

For an independently editable customer template, import through **Add From Library**, then **Unlink**, save and verify **Not Linked** before customization. This policy was followed and a destination-only Name edit left the master unchanged. Retain a link only for deliberately synchronized updates; record provenance after detaching. Nested dependency behavior beyond this one native widget and future Force Update behavior were not exercised.

A Library is a separate scope from the source Site. This pilot used the user-authorized **US-BETA / INDY Demo / LIBRARY (`138`)** and destination **Adam Template Testing**. Confirm exact targets for every later distribution. Region-level cross-Circuit distribution remains untested. Saving a draft, publishing a website Page, Library propagation and rebuilding hosting are separate operations.

## Controlled workflow and remaining checks

1. **Completed:** confirmed the source selectors and approval for the new unpublished draft. Kept Variant K and its published Food Section unchanged.
2. **Completed:** created carrier Page `5969`, title `variant-k-clubhouse_food`, with empty Page CSS. Reopened persisted draft `5970` and verified its single native Concessions Menu `25151`. No full Variant duplicate or deletion was needed.
3. **Completed:** copied the native widget and Section settings from [the dependency manifest](../template-adapters/library-k-food/dependency-manifest.json), set class `fdp-k-food`, and saved [section.proposed.css](../template-adapters/library-k-food/section.proposed.css) in **Section Settings → Custom CSS**, retaining native `&` scoping. Saved CSS readback matches after newline normalization.
4. **Partially verified:** Admin previews show the populated native catalogue and responsive product columns. Complete an actual phone consumer preview and consumer Theme checks; resolve or disprove the simulated-frame overflow before claiming responsive acceptance.
5. **Completed transfer:** used Create New Library Page for master `5971` / draft `5972`, then destination Add From Library for Page `5973` / draft `5974`. Library website publication was not required. New IDs, exactly one native widget, empty Page CSS, stable class and baseline CSS/settings were verified.
6. **Completed local independence check:** Unlinked, saved and verified Not Linked before the destination-only internal Name edit. The master Name and CSS stayed unchanged. Destination category IDs and product count demonstrate its own runtime catalogue.
7. **Pending visual acceptance:** refresh and verify native compiled CSS after the Name change, then complete destination previews. Check actual consumer Theme colors, real phone rendering, controlled empty state, category controls, hover/focus, photos, prices and overflow. The destination's initial Theme CSS was empty, but Admin previews use framework colors and cannot certify consumer Theme behavior. Mobile App remains untested.
8. Record **Library transfer** separately from **insertion into an existing Page**. If no native insertion action exists, recreate this native widget and its recorded Section settings on the intended Page. Do not describe separate-Page import as automatic homepage assembly.

The user authorized the carrier, Library promotion, exactly one destination import, Unlink and destination-only internal Name edit, while keeping everything unpublished. The additional comment-only CSS refresh awaits its own exact action approval. Publication and hosting rebuilds are outside this pilot.

## Package boundaries

The proposal carries one native widget's configuration, its Section settings/class and self-contained Section CSS. It reads destination **Primary, Dark and Background** directly; Secondary has no direct role in this food preset. It does not redefine native palette tokens, consume private `--fd-*` aliases, target source numeric IDs, require K Page CSS or a Custom Block, or import the source site's Google Fonts. Relevant heading, native-button and focus treatment is included within the Section scope.

The current Concessions article was also reopened in authenticated Chrome on 25 October 2026 and marked updated that week. It confirms sales-channel selection, category overrides, Block/Slider and List/Grid modes, desktop/mobile item counts, advanced styling through the settings gear, and saving before Page publication. These describe the native widget; they do not establish Library transfer. [Concessions Menu](https://support.indy.systems/en/articles/17709711-how-to-add-a-concessions-menu-widget-to-a-website-page)

| Dependency | Required handoff/check |
| --- | --- |
| Destination palette | Configure Theme & Style colors and check text, selected, hover and focus states. Arbitrary palettes are not guaranteed legible. |
| Native settings | Preserve channel visibility, display settings, responsive row counts, Section class and scoped CSS. Desktop/phone checks do not certify Mobile App. |
| Concessions catalogue | Use destination products, categories, variations, prices, descriptions and photos. Confirm Website eligibility and deliberate category overrides. Transferring a layout does not configure product availability. [Concessions Menu](https://support.indy.systems/en/articles/17709711-how-to-add-a-concessions-menu-widget-to-a-website-page) |
| Source category IDs | Do not hard-code rendered source category or item IDs. The current override is empty. Verify the destination generates its own category rail. |
| Global CSS | Inspect destination overrides; unrelated global selectors can still affect a self-contained Section. |
| Images and references | Check actual destination ownership/access and remapping after import. The local package includes no source product records or private media objects. |
| Header, navigation and footer | These remain destination Site settings and are outside the food Section. |
| Checkout/ordering | This package displays a catalogue. No sales, payment or checkout behavior has been tested by this pilot. |

## Provenance and readiness

Use `<variant-slug>_<slot>` for carrier titles. The real title `variant-k-clubhouse_food` generated slug `variant-k-clubhouse-food` for Page `5969`; do not assume title underscores are preserved in routes. Its unpublished route is not a live preview. Numeric IDs identify a captured source version; the stable class identifies the reusable scope.

Record the source Region/Circuit/Site; distinct published/editable Page and Section IDs; native settings; Section CSS hash; Library identity/version; destination identities/route; link policy; publication state; catalogue dependencies; screenshots; and verification date.

Current statuses:

- **Source module:** native Concessions Menu inspected; source desktop/phone behavior checked during earlier Admin-color work.
- **Portable package:** baseline CSS/settings preserved through source draft `5970` / Section `25151`, Library draft `5972` / Section `25153`, and destination draft `5974` / Section `25155`.
- **Carrier structure:** base Page `5969` / editable `5970`, unpublished, Linked with Updates to Library `5971`, one native widget and empty Page CSS; persisted desktop Admin preview has no overflow and seven loaded photos.
- **Actual phone / consumer Theme isolation:** pending. The simulated phone preview has 3px overflow and uses the outer viewport for CSS viewport units; both Admin previews use framework colors.
- **Destination catalogue binding:** demonstrated by differing category IDs and seven local products versus the master's 26; empty-state and commerce tests remain open.
- **Cross-site Library transfer:** one separate Page imported successfully without Library website publication; destination is unpublished, visibility off and Not Linked. Repeated imports and general Library version/update behavior remain untested.
- **Destination visual acceptance:** blocked by stale native compiled CSS after the Section Name edit; comment-only refresh prepared, not applied.
- **Local independence:** destination-only Name saved/reopened and master Name/CSS unchanged. No upstream update was pushed to test future propagation.
- **Insertion into an existing Page:** no supported action established.

The picker remains a visual selection and handoff tool. A choice or screenshot does not create live widgets. Do not advance a readiness stage from a successful earlier stage alone.
