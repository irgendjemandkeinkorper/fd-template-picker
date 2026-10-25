# Clubhouse Kitchen Library pilot

**Library transfer and destination native style restoration are verified for a separate food-only Page.** The carrier was promoted to **US-BETA / INDY Demo / LIBRARY (Site 138)** and imported into **Adam Template Testing**, then unlinked and saved as **Not Linked**. After a local internal Section rename exposed a native CSS-scope issue, the approved comment-only CSS re-save restored the current scope and Georgia heading through a Page/Section reopen. All three carrier records remain unpublished. Real consumer Theme and phone checks remain open.

The source carrier's list/base identity is **5969**; its persisted editable draft is **Page 5970 / Section 25151**, titled **variant-k-clubhouse_food** with slug **variant-k-clubhouse-food**. It contains one native Concessions Menu, class **fdp-k-food**, and empty Page CSS. It is now **Linked with Updates** to Library Page **5971**. This authoring link is separate from the unlinked destination copy. The original full K Variant remains intact and Not Linked.

Initial base Section **25150** and its previews remain historical evidence. Use editable **5970 / 25151** and the newer **carrier-draft-** preview files for the current saved draft. These are not published Page/Section identities.

The original source is **Food K - Clubhouse Kitchen**, a native **Concessions Menu**, not the older K Stay Awhile Text Block. Source Page 5915 / editable Page 5916 contains published food Section 25135 / editable Section 25122.

The source menu owns its core CSS in its Section field. It does not require K's other widgets, its Page CSS, any numbered source selector, a Custom Block, or the source site's Google Fonts imports. Its source Theme contributes heading typography, native-button typography and focus treatment. The prepared CSS moves those relevant rules into the Section, uses native destination Theme variables directly, and omits unrelated Generic Form CSS. Its saved carrier readback logically matches the prepared file after newline normalization.

## Current pilot result

| Check | Observed result |
| --- | --- |
| Native carrier creation and save | Base/list Page 5969; editable draft Page 5970 / Section 25151 saved and reopened; one Section, empty Page CSS, Linked with Updates to Library 5971, unpublished |
| Circuit Library master | Base Page 5971 / editable Page 5972 / Section 25153; one menu, empty Page CSS and baseline Section CSS, unpublished |
| Destination import | Adam Template Testing: base Page 5973 / editable Page 5974 / Section 25155; one menu, empty Page CSS, imported then Unlink + Save verified Not Linked, unpublished; six existing Pages unchanged |
| Independent edit | Destination internal Name changed to Food - Clubhouse Kitchen and persisted; Library master Name Food K - Clubhouse Kitchen and CSS remained unchanged |
| Destination catalogue binding | Empty category override; destination category IDs 589/590/591 differ from source 596/597/598. Library runtime showed 26 products; destination runtime showed its seven local products. No product data was changed. |
| Current editable-draft desktop Admin preview | 1024px frame; three columns; seven product cards and seven loaded images; client/scroll width both 1024px |
| Current editable-draft phone Admin preview | 376px frame; one column; seven product cards and seven loaded images; scroll width 379px, a measured 3px overflow |
| Phone preview limitation | CSS viewport units use the outer 1536px Chrome viewport: the simulated phone still uses a 62px heading and 72px side padding. This is not a real consumer phone viewport. |
| Consumer route | The unpublished route redirects to the homepage; no carrier consumer-page render or publication is established |
| Historical destination style failure | Renaming the internal Section Name changed its generated root class but left compiled Section CSS under the old class. Reopening alone did not refresh it; the heading used Roboto instead of Georgia. This failure is retained separately from the verified repair below. |
| Verified destination scope repair | Approved destination-only Section CSS re-save matches refresh SHA256 fac22b6cf5a6ec54a2b9039f0885ee99eb7116a2b6512af869ee6c544074f48a. After reopening 5974/25155, compiled scope matches the renamed root, stale scope is absent and Georgia is restored. All non-CSS fields and design rules are unchanged. |
| Current destination desktop Admin preview | 1024px frame; three columns; seven cards and seven loaded photos; zero overflow; current scope/Georgia verified |
| Current destination phone Admin preview | 376px simulated frame; one column; seven cards and seven loaded photos; 3px known preview overflow; current scope/Georgia verified |

Admin previews use the Admin framework palette, not the consumer Site Theme. The carrier rows are source-draft evidence; the newer destination rows are separate Admin checks after the approved repair. Library import/unlink, local catalogue runtime binding, independent edit and destination native scope restoration are verified. Real phone rendering, consumer Theme colors, controlled empty state, Library update/version behavior and direct Library Section import remain pending; existing-Page native recreation/order is verified separately below. The measured 3px simulated-phone overflow is retained as a preview limitation; no complete consumer mobile result is claimed.

## Smallest reusable unit

Keep **one native Concessions Menu Section**, its native widget configuration, its Section settings/class, and its self-contained Section CSS. The approved pilot created a fresh blank carrier Page with **empty Page CSS**, then recreated this one native widget. It did not duplicate or trim the original Variant.

The verified Page Library workflow distributes a separate food Page with only this module. A separate pilot also verified native widget recreation inside an existing Page, as recorded below. Direct Library Section import and cross-page copy/move remain unverified. A Custom Block containing static product HTML would lose native catalogue behavior and is not an equivalent replacement.

## Existing Page assembly: separate verified pilot

On **Adam Template Testing → Fandango Cinema Template Test**, base Page **5585** / editable draft **5586**, new native Concessions Menu **25156** was created with final Name **Food - Clubhouse Kitchen**, `fdp-k-food`, recorded settings and exact baseline CSS. Native Set Order placed it **after 23540 — Concessions - Snacks Worth the Credits, before 23541 — Visit - Plan Your Night**. The reopened draft has nine Sections and disabled Save controls, with **Unpublished Changes**. All eight original IDs/relative order and seven Page fields, including existing Page CSS, are unchanged. The published Page was not updated.

This proves **native recreation and ordering**. Final Name was set before first save; generated scope and Georgia compiled correctly without the rename-refresh workaround. [The assembly journal](../../evidence/library-k-food-assembly/assembly-journal.json), readback and mixed-page previews are recorded separately under `existingPageAssembly` in the dependency manifest. Machine comparisons cover reopened widget/settings, including Website, empty category override, 3/1 rows, typography, cards and Section class/CSS.

Mixed-page Admin desktop preview is **1024px / three columns / seven loaded photos / zero overflow**. Simulated phone is **376px / one column / seven loaded photos / 3px known preview overflow**. The new menu's Desserts control navigated to its own group with Visit below. Actual consumer Theme/phone and checkout remain untested.

The original menu's **floating category bar can remain over the new Section** while both menus are present. [That observation](../../evidence/library-k-food-assembly/adjacent-menu-category-bar.json) is retained; the original menu was preserved and no fix applied. Normally choose **one food Section per finished slot**. Removing or changing the original menu requires separate authorization. The earlier Library pilot and its historical evidence remain separate and unchanged.

## Internal Name and native CSS scope

Routine customer-facing copy belongs in **Heading** and **Description**. Keep the internal **Name** stable unless a template maintainer is checking the result. In this pilot, changing destination Name to **Food - Clubhouse Kitchen** changed the rendered root to **section-food---clubhouse-kitchen-25155**, but native compiled CSS initially remained scoped to **section-food-k---clubhouse-kitchen-25155**. The retained `fdp-k-food` class could not overcome that stale native outer scope. Reopening alone did not fix it.

The approved [scope-refresh CSS](destination-scope-refresh.proposed.css) appends only one comment to the baseline; removing comments produces identical CSS and dependencies. It was saved **only** to destination Section 25155 Custom CSS. [The exact readback check](../../evidence/library-k-food-pilot/destination-scope-refresh-readback-check.json) confirms the approved hash, unchanged non-CSS fields and unchanged design rules. [The reopened style evidence](../../evidence/library-k-food-pilot/destination-scope-refresh-after-reopen.json) confirms the current renamed scope, absence of the stale scope and restored Georgia heading.

For a necessary, authorized internal Name change, the template maintainer can use this verified pattern: preserve the current Section CSS, re-save that same field with a harmless comment change, reopen the Page and Section, and verify the generated root/compiled scope and typography. This pilot verifies that workaround; routine support still edits Heading/Description and keeps internal Name stable. Keep [the original failure](../../evidence/library-k-food-pilot/destination-style-before-reopen.json) and [master-independence check](../../evidence/library-k-food-pilot/library-master-independence-check.json) as historical evidence.

`section.proposed.css` is intended for **Section Settings → Custom CSS**, with **Classes = `fdp-k-food`**. It deliberately retains INDY's `&` Section scoping. Do not paste it into Page CSS. The destination provides `--q-primary`, `--q-dark`, and `--q-background` through Theme & Style; the preset does not redefine native tokens. Secondary has no direct use in the retained food preset. All required style values are either native brand tokens or fixed preset geometry/type. No `--fd-*`, `--pl-*`, `--n-*`, `body.site-170`, or source Page/Section selector is consumed.

## Native content and data that must be copied or rebound

The fresh native widget capture records **Website / Block / Grid**, **3 desktop / 1 mobile items per row**, spacing **12**, heading **“Good company. Good things to share.”**, and subtitle **“Explore the kitchen and bar before you settle in.”** Heading is H2, default font, centered, default style, Primary in its native field; the retained preset paints it Dark. Category filters are enabled on the **Left**, category divider/name enabled, category names **24px / Left / Default style / Primary field**. Show Image, Description and Price are enabled. Cards use **Frame / Default background / 8px radius / 0 shadow**, with product title **20px**, description **16px**, price **16px**.

**Categories Visibility Override is empty.** Snacks, Drinks and Desserts are derived from source products; their rendered IDs 596/597/598 are not configured widget filters and must not be baked into the reusable module. The source renders seven products with photos, descriptions and prices. A destination with different eligible categories should generate its own rail.

The destination's catalogue provides products, item/category classes, variations, prices, descriptions and image assets. Rebind Website sales-channel eligibility and any category overrides; do not carry source category or item IDs blindly. An empty destination catalogue may render no products even when the layout and CSS copy successfully. This package includes no source product records or private media objects and makes no checkout/ordering claim.

Section settings were captured with Everyone visibility; Desktop Web, Mobile Web and Mobile App selected; no dates; Centered width; Extra Small side margins; top/bottom margins blank; no Section background image or inline Styles. Current native UI inspection identifies **Square and Flat enabled**. Desktop/phone browser checks do not certify Mobile App behavior.

## Acceptance that establishes portability

1. **Saved native structure verified:** reopened editable carrier Page 5970 contains only Section 25151, a native Concessions Menu, with empty Page CSS and new identities. Base/list Page 5969 remains a separate identity.
2. **Saved Section settings verified:** class and logical CSS readback match the prepared package. Static scope checks find no source site 170 or Page/Section IDs in the style. The recorded native configuration remains the source configuration.
3. **Consumer rendering pending:** verify actual desktop and phone viewport rendering without the source Theme CSS. Review heading, category controls, photos, description truncation, prices, focus/hover states and horizontal overflow. Admin-frame checks above do not complete this step.
4. **Local populated catalogue runtime verified:** distinct destination category IDs and the Library/destination product-count difference establish local binding with empty overrides. A controlled empty state, availability/checkout and complete destination visual checks remain separate.
5. Change destination Primary/Dark/Background through Admin; verify actual text and selected/focused controls remain legible, then restore the palette. Normal source colors and the previously tested blue/yellow palette are useful controls; they do not guarantee arbitrary palettes.
6. **Library import and independence verified:** master 5971/5972/25153 imported as destination 5973/5974/25155; destination Unlink + Save was verified before the local Name edit. The source master Name and CSS stayed unchanged. Publication remains false. Source carrier remains deliberately linked; Library update/version propagation was not tested.
7. Record **carrier isolation**, **Library Page transfer**, **existing-Page native recreation**, and **direct Section import/copy** separately. Recreation/order is verified on 5586/25156; direct Section import/copy remains unverified.

`dependency-manifest.json` records source hashes, carrier/Library/destination identities, transfer and independence evidence, saved CSS agreement, separate source/destination Admin-preview geometry, the historical native scope failure and its verified resolution. `test_portability.py` checks scope, dependency closure and consistency with retained evidence; those tests do not themselves execute the native transfer or certify consumer rendering. Existing public K QA remains source behavior only. [The pilot journal](../../evidence/library-k-food-pilot/pilot-journal.json) owns the actual transfer/unlink and approved scope-refresh state; no carrier publication occurred.

## Evidence limitations

- Earlier Library research described K before the food module was added and proposed the separate Stay Awhile experience copy. This pilot uses the newer native Clubhouse Kitchen identity supported by the current Page capture, catalogue and published DOM capture. See [current Library findings](../../docs/INDY-LIBRARY.md); retain the older workspace research as historical context.
- Older parity journal references `evidence/k-component-result.json` and `evidence/parity-section-payloads.json`, but those files are absent from this checkout. This package does not treat them as available exports.
- The prepared CSS is saved on the new carrier and reviewed in native Admin desktop/phone previews. The carrier remains on the source Site; consumer rendering without source Theme CSS and destination global-style compatibility are still unverified.
