# INDY Library templates

Verified context: **US-BETA / INDY Demo**, 25 October 2026. The approved pilot created a food-only carrier at **Adam Template Testing 2**, promoted it to Circuit **LIBRARY**, and imported one independent copy at **Adam Template Testing**. Those carriers remain **unpublished**. A second step recreated the native widget inside existing Page **5585** / editable **5586** as Section **25156**. A later approved phase hid the original menu and published only Page 5585; Clubhouse's published Section is **25157**. Live desktop/real-phone checks pass for the current palette and geometry, with one native category-label quirk retained. Direct Library Section insertion/cross-page copying remain unverified. See the [Library pilot](../evidence/library-k-food-pilot/pilot-journal.json), [assembly](../evidence/library-k-food-assembly/assembly-journal.json) and [live journal](../evidence/library-k-food-live/live-journal.json).

## Current recommendation

Use a **food-only Page containing one native Concessions Menu Section**, titled `variant-k-clubhouse_food`. Its Page CSS is empty; self-contained styling is saved in **Section Settings → Custom CSS**, with class `fdp-k-food`. This successfully transferred K's food module without the rest of Variant K. The original full K Page `5915` remains unchanged, Not Linked, with eight Sections.

The widget settings, portable Section CSS, dependency manifest and acceptance checks are in [the Clubhouse Kitchen package](../template-adapters/library-k-food/README.md). Baseline CSS transferred exactly, native settings and the stable class survived, and each runtime used its own catalogue. A destination carrier's internal Name change exposed stale compiled CSS; an approved comment-only re-save restored it. The separately assembled menu now has live consumer evidence for the current palette and real phone viewport. Standalone carriers remain unpublished; arbitrary palette, controlled empty-state, catalogue availability and commerce checks remain open.

A food-only Library Page distributes a **separate food Page**. For an existing Page, **Add Section → native Concessions Menu**, then apply the recorded settings/class/Section CSS. This local recreation route is now verified on Page `5585`; it does not import the Library Section or move an existing Section between Pages. Keep these mechanisms separate in installation instructions.

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

## Resolved compiled-style issue and maintenance note

The internal Name edit changed the rendered root to `.section-food---clubhouse-kitchen-25155`, while native compiled CSS retained `.section-food-k---clubhouse-kitchen-25155`. Reopening alone did not correct it; the heading fell back to Roboto despite correct saved Section CSS. [The historical mismatch](../evidence/library-k-food-pilot/destination-style-before-reopen.json) is retained.

After exact user approval, the [comment-only CSS refresh](../template-adapters/library-k-food/destination-scope-refresh.proposed.css) was saved to destination Section `25155`. [Readback checks](../evidence/library-k-food-pilot/destination-scope-refresh-readback-check.json) confirm the approved SHA-256 `fac22b6cf5a6ec54a2b9039f0885ee99eb7116a2b6512af869ee6c544074f48a`, identical design rules and unchanged non-CSS fields. [Reopened preview evidence](../evidence/library-k-food-pilot/destination-scope-refresh-after-reopen.json) confirms the current compiled root, no stale scope, Georgia heading restored, seven cards and empty Page CSS.

The refreshed destination [desktop Admin measurements](../evidence/library-k-food-pilot/destination-scope-refreshed-desktop-dom.json) show 1024px, three columns, seven loaded photos and no overflow. The [simulated phone measurements](../evidence/library-k-food-pilot/destination-scope-refreshed-phone-dom.json) show 376px, one column and seven loaded photos, with the same 3px overflow and outer-viewport sizing limitation. Both have the correct compiled scope and no stale scope. [Final native status](../evidence/library-k-food-pilot/destination-scope-refresh-final-status.txt) remains one Section, Not Linked, visibility off and unpublished. This completes native scope restoration and bounded Admin preview review, not full consumer QA.

For ordinary content changes, edit the widget's **Heading** and **Description** and keep its internal **Name** stable. An internal Name change can leave compiled CSS stale. In this case, a comment-only re-save of the same Section CSS triggered recompilation; verify the saved fields and reopened compiled scope before using that remedy elsewhere. Do not treat correct stored CSS as proof of correct rendering.

## Verified assembly inside an existing Page

At **Adam Template Testing → Fandango Cinema Template Test**, Page-list/base **5585** / editable draft **5586**, the approved batch created exactly one new native **Concessions Menu `25156`**. It uses final internal Name **Food - Clubhouse Kitchen**, class `fdp-k-food`, exact baseline Section CSS and recorded native settings. The Name was set before first Create/Save; after reopening the compiled scope matches and Georgia typography applies without the earlier rename/re-save workaround. Existing Page CSS and captured Page fields compare unchanged.

The assembly draft reopened with **nine Sections** in order: `23550, 23536, 23537, 23549, 23538, 23539, 23540, 25156, 23541`. The new menu is after **Concessions - Snacks Worth the Credits (`23540`)** and before **Visit - Plan Your Night (`23541`)**. All eight original IDs and their relative order remained intact. At the end of that stage it was Not Linked with Unpublished Changes; its earlier published version was untouched. See the historical [assembly evidence guide](../evidence/library-k-food-assembly/README.md), [draft state](../evidence/library-k-food-assembly/target-5586-final-page-state.json) and [nine-Section screenshot](../evidence/library-k-food-assembly/target-5586-nine-sections.jpg). The later publication is documented below.

Bounded [desktop Admin review](../evidence/library-k-food-assembly/mixed-desktop-dom.json) showed 1024px, three columns, seven loaded photos and zero overflow. [Simulated phone](../evidence/library-k-food-assembly/mixed-phone-dom.json) showed 376px, one column and seven loaded photos, with the known 3px outer-viewport limitation. The new menu's [Desserts control](../evidence/library-k-food-assembly/category-interaction.json) navigated within its own Georgia-styled menu. Those are historical Admin results; the later real consumer checks supersede their phone/palette uncertainty for this assembled Page.

**Historical comparison limitation:** while both menus were visible, the original menu's floating category bar could remain over Clubhouse; see [the measurements](../evidence/library-k-food-assembly/adjacent-menu-category-bar.json) and [screenshot](../evidence/library-k-food-assembly/mixed-desktop.jpg). A finished slot normally uses one chosen food module. The later approved phase **hid** the original Section, preserving it for recovery, and verified its heading/category bar were absent live.

## Published consumer result

At **Adam Template Testing**, original **Section 23540** was turned off and saved, then only **Page 5585** was published. The original remains in the nine-Section Page and was not deleted. Clubhouse is editable **25156**, published **25157**, with `fdp-k-food`. Page state remains **Not Linked**. The carrier and Library records were not changed by this live phase. See [the live evidence guide](../evidence/library-k-food-live/README.md) and [publication readback](../evidence/library-k-food-live/published-page-list.txt).

Live route: [Fandango Cinema Template Test](https://adam-template-testing-indy-consumer.netlify.app/fandango-cinema-template-test/). Its hostname came from read-only Hosting → **Netlify Site Name**, `adam-template-testing-indy-consumer`; [hosting evidence](../evidence/library-k-food-live/hosting-readonly.json). No hosting settings changed and no deploy was triggered.

The [live desktop check](../evidence/library-k-food-live/live-desktop.json) at **1536 × 639** shows three columns, seven products/photos and zero menu/document horizontal overflow. The [real mobile viewport](../evidence/library-k-food-live/live-mobile.json) at **390 × 844** shows one column, seven loaded photos, zero overflow and a **32px heading**. The earlier Admin 3px overflow/62px heading does not reproduce here. The old food heading and floating category bar are absent.

The consumer's current native palette is Background **#fbefe2**, Dark **#38264a**, Primary **#e06b4a**, Secondary **#c4553a**. These live checks cover this palette and destination, not arbitrary colors or all future global CSS.

**Known mobile category-label issue:** selecting **Desserts** reaches the correct dessert products, but the native dropdown label can remain **Drinks** until additional scrolling. [Settled evidence](../evidence/library-k-food-live/live-mobile-category-settled.json) records the mismatch; [after-scroll evidence](../evidence/library-k-food-live/live-mobile-category-after-scroll.json) shows Desserts. The category jump works; its label synchronization remains imperfect. Controlled empty state, catalogue availability rules, Mobile App and commerce remain untested.

## Current controls and limits

| Inspected surface | Observed controls | What this establishes |
| --- | --- | --- |
| K Food Section menu | Edit, Duplicate, Delete, View History | In-page duplication exists. No cross-page Copy/Move or Section Library action was visible. |
| Add Section | Native widget Type choices; one new Concessions Menu assembled on existing Page `5585` | Local native-widget recreation is demonstrated. No import-from-page or Section Library control was visible. |
| Pages | Add From Library selection table; one food-only Page imported into the named destination | Separate-Page transfer is demonstrated. Repeated imports and direct Library Section insertion remain untested. |
| Source carrier Library chip | Create New Library Page, then saved Linked with Updates / Library ID `5971` | Promotion created the one-Section Circuit Library master. Original full K stays Not Linked. |
| Custom Blocks | Add From Library opens a record table; unsaved builder offers Image, Text, Link, Button, Video, Map and grid blocks | No native Concessions Menu appeared in the inspected builder palette. Native-widget nesting remains unproven. The builder was closed without creating a block. |

Force Update is disabled while a Page is Not Linked. Its visible description says it synchronizes all content from a linked Library Page. The Library pilot verifies one separate-Page import with new record IDs, preserved CSS/settings and local catalogue binding. The assembly step separately verifies native widget recreation inside an existing Page. Neither establishes automated cross-page copying, direct Library Section insertion, repeated import behavior, every dependency type or future update propagation.

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
7. **Completed within Admin for the standalone carrier:** saved the exact approved comment-only refresh; reopened and verified current scope, absent stale scope, restored typography, unchanged other fields, seven photos and unpublished/Not Linked status. Carrier consumer testing remains open because it stays unpublished.
8. **Completed native assembly:** after separate approval, recreated one native widget on existing draft `5586` as Section `25156`, with exact baseline CSS, intended order, preserved captured Page fields and correct compiled scope. Record this independently from Library transfer. Direct Library Section insertion and automated cross-page copy remain unverified; separate-Page import is not automatic homepage assembly.
9. **Completed live phase:** after later approval, hid original Section `23540` and published only Page `5585`. Verified published Clubhouse `25157` at live desktop and a real phone viewport using the current consumer palette. Old menu/bar are absent; mobile category-label synchronization remains a known issue. Controlled empty state, catalogue availability rules, Mobile App and commerce remain open.

The earlier approved batches kept carrier/import/assembly work unpublished. A later explicit request authorized hiding the original food Section, publishing only Page `5585` and live desktop/phone checks. That phase is complete. No hosting rebuild was authorized or performed.

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
- **Standalone carrier consumer checks:** pending; those records remain unpublished. Their simulated Admin phone previews retain the 3px/outer-viewport limitation.
- **Destination catalogue binding:** demonstrated by differing category IDs and seven local products versus the master's 26; empty-state and commerce tests remain open.
- **Cross-site Library transfer:** one separate Page imported successfully without Library website publication; destination is unpublished, visibility off and Not Linked. Repeated imports and general Library version/update behavior remain untested.
- **Native scope restoration / bounded Admin preview review:** complete after the approved comment-only re-save and reopen. Current scope matches, stale scope is absent and Georgia is restored. Desktop: 1024px, three columns, seven loaded photos, zero overflow. Simulated phone: 376px, one column, seven loaded photos, documented 3px limitation.
- **Local independence:** destination-only Name saved/reopened and master Name/CSS unchanged. No upstream update was pushed to test future propagation.
- **Native assembly inside an existing Page:** verified on draft `5586`, Section `25156`, nine-Section order and baseline CSS/settings preserved after reopen. Later original Section `23540` hidden, not deleted; only one menu now renders.
- **Published assembled menu / real consumer checks:** Page `5585`, published Section `25157`, Not Linked; live desktop 1536px/three columns and real mobile 390px/one column both show seven loaded photos with zero overflow. Current palette verified; native mobile category label can lag after Desserts selection. No empty-state, catalogue-availability, commerce or Mobile App acceptance claimed.
- **Direct Library Section insertion / automated cross-page copy:** no action established by inspected controls or documentation; remains unverified.

The picker remains a visual selection and handoff tool. A choice or screenshot does not create live widgets. Do not advance a readiness stage from a successful earlier stage alone.
