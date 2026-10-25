# Clubhouse Food assembly into an existing Page

**Status: SAVED AND REOPENED — native assembly verified.** Checked 25 October 2026. The approved batch created native **Concessions Menu Section 25156**, saved it in the intended order and reopened the draft and Section to verify persistence. [assembly-journal.json](assembly-journal.json) records executed results. No publication occurred.

Target: **US-BETA / INDY Demo / Adam Template Testing → Fandango Cinema Template Test**, Page-list/base **5585**, editable draft **5586**, slug `fandango-cinema-template-test`. The Page remains **Not Linked** with **Unpublished Changes**; its previous published version was not updated. Page 5585 and draft 5586 are one Page record, not two Pages.

## Finding and executed route

The earlier Library pilot proved **separate-Page** distribution: one food-only Page imported with its native Concessions Menu, settings and scoped CSS. It did not append a Section to an existing Page. Inspected Section menus expose **Edit / Duplicate / Delete / View History**, and the inspected Add Section flow offers native widget types without a Section Library or cross-page copy/move action. No such cross-page operation was documented in the sources examined; this does not establish that no other INDY workflow exists.

The practical route was to **recreate one native Concessions Menu locally on editable Page 5586**, using the verified Clubhouse widget/Section settings and baseline CSS. This proves native widget recreation **inside an existing Page**. Direct Library Section import and automated cross-page copying remain unverified. The new widget reads destination Website-visible concessions data and native Primary/Dark/Background colors; it copies no source product records or Page CSS.

## Approved and saved change

The exact original batch is retained in [assembly-proposal.json](assembly-proposal.json). It is historical preparation evidence; current results are in [assembly-journal.json](assembly-journal.json).

- Created exactly one new native **Concessions Menu `25156`** with final internal Name **Food - Clubhouse Kitchen**, class **`fdp-k-food`** and exact baseline [Section CSS](../../template-adapters/library-k-food/section.proposed.css). The final internal Name was set before first Create/Save; the correct compiled scope and Georgia heading survived reopening without a rename/re-save workaround.
- Saved Website / Block / Grid, three desktop / one mobile items per row, empty category override, heading **“Good company. Good things to share.”** and description **“Explore the kitchen and bar before you settle in.”** Native settings readback is retained.
- Saved the new Section **after `23540` — Concessions - Snacks Worth the Credits**, and **before `23541` — Visit - Plan Your Night**. Reopened draft has **nine Sections**; all eight original IDs and their relative order remain intact.
- Original Page fields, including Page CSS and metadata, compare unchanged against the before capture. The existing published version, source/Library/independent carriers, site Theme/global settings and catalogue data were not changed by this batch.
- Saved, closed/reopened and reviewed native desktop/phone previews. **No publication, unpublication, link change, homepage/navigation change or hosting deployment occurred.**

`NEW_SECTION_ID` in the original proposal was a placeholder. The actual created ID is **25156**. Final order is `23550, 23536, 23537, 23549, 23538, 23539, 23540, 25156, 23541`.

## Before and proposal evidence

| Evidence | Purpose |
| --- | --- |
| [target-5586-before-fields.json](target-5586-before-fields.json) | Captured Page fields, CSS, Page-list status and eight original Sections in order |
| [target-5586-before.txt](target-5586-before.txt) | Native editor accessibility evidence |
| [target-5586-before.jpg](target-5586-before.jpg) | Before-state editor screenshot |
| [target-insertion-position-before.jpg](target-insertion-position-before.jpg) | Intended insertion neighbors |
| [assembly-proposal.json](assembly-proposal.json) | Exact new widget/settings/CSS, preservation requirements, desired order and checks |
| [assembly-journal.json](assembly-journal.json) | Executed native actions, preservation comparisons, preview results and limitations |
| [target-5586-after-reopen-fields.json](target-5586-after-reopen-fields.json), [final Page state](target-5586-final-page-state.json) | Reopened draft fields/order and unpublished/Not Linked status |
| [nine-Section screenshot](target-5586-nine-sections.jpg) | Saved insertion position in the existing Page |
| [new-section-25156.css](new-section-25156.css), [settings readback](new-section-25156-settings-readback.json) | Exact saved baseline style and native settings; reopened main/settings captures are retained alongside them |
| [desktop measurements](mixed-desktop-dom.json), [phone measurements](mixed-phone-dom.json) | Mixed-Page Admin preview geometry, loaded products and compiled scope |
| [category-interaction.json](category-interaction.json) | New Desserts control navigates to its own Georgia-styled menu group |
| [adjacent-menu-category-bar.json](adjacent-menu-category-bar.json), [desktop screenshot](mixed-desktop.jpg) | Existing menu's floating category bar can remain over the new module while both menus are kept |
| [Earlier Library pilot](../library-k-food-pilot/README.md) | Proven separate-Page import, catalogue binding, independence and resolved native CSS-scope issue; distinct from this existing-Page assembly |

The before-fields SHA-256 recorded by the proposal is `53585e1bae57152daf24e4e8db7b5aaa12ce2cde57267511cb19eda142e7737e`. Baseline Section CSS SHA-256 is `d0dcb1eaffbe7975a4e1edf3e2eb19c68a2db4162b4e37c2b4ababc38c992eee`.

## Verified result and remaining acceptance

Saved/reopened evidence verifies nine Sections, the requested position, unchanged original IDs/relative order and unchanged captured Page fields. New settings and exact baseline CSS after newline normalization are retained, with `fdp-k-food`, matching generated/compiled scope and Georgia typography. The new menu's **Desserts** control navigated within its own menu; Visit remains below it.

Desktop Admin preview is **1024px, three columns, seven loaded product photos and zero overflow**. Simulated phone is **376px, one column, seven loaded photos and 3px overflow**, with the known outer-viewport sizing limitation. These are bounded Admin checks.

**Coexistence limitation:** the original native menu's floating category bar can remain over Clubhouse while both food menus are present. Both were deliberately retained under the approved comparison scope; the old Section was not modified. A finished design would normally choose one food module for the slot rather than keep both. Resolving or removing the old menu is a separate change, not a completed result here.

Native Admin previews use framework colors; simulated phone viewport units can resolve against outer Chrome. Real consumer Theme/phone, catalogue availability, controlled empty state, Mobile App and commerce remain pending. Native widget recreation inside an existing Page is verified; direct Library Section insertion and cross-page copying are not.
