# Clubhouse Kitchen Library pilot evidence

Verified 25 October 2026 in Chrome, **US-BETA / INDY Demo**. The user approved creating/saving a food-only unpublished carrier, promoting it to **LIBRARY**, importing exactly one copy at **Adam Template Testing**, Unlinking it, making a destination-only internal Section Name edit, and an exact comment-only CSS refresh to resolve stale native compilation. Those actions are recorded in [pilot-journal.json](pilot-journal.json).

The result is a separate one-Section Page at each stage, with empty Page CSS and stable Section class `fdp-k-food`. The destination is **Not Linked**, visibility off and unpublished. No website publication, product/category/price change, hosting deployment or existing-Page insertion was performed. Original full Variant K Page `5915` remains Not Linked with eight Sections; the six existing destination Pages remain unchanged.

## Current identities

| Object | Site | Page-list/base | Editable draft | Current editable Section | State |
| --- | --- | --- | --- | --- | --- |
| Original full K | Adam Template Testing 2 (`170`) | `5915` | `5916` | Food `25122` / published `25135` | Unchanged, Not Linked |
| Food-only carrier | Adam Template Testing 2 (`170`) | `5969` | `5970` | `25151` | Unpublished, Linked with Updates to LIB `5971` |
| Circuit Library master | LIBRARY (`138`) | `5971` | `5972` | `25153` | Unpublished, exactly one native Concessions Menu |
| Independent copy | Adam Template Testing | `5973` | `5974` | `25155` | Unpublished, visibility off, Not Linked |

A base Page and its editable draft are one Page record, not two independent Pages. Initial source Section `25150` is retained as historical creation evidence. The first reopen of draft `5970` was empty; Section `25151` was then created, saved and reopened to prove persistence. Use current editable IDs for further work.

## Verified results and open checks

- **Separate-Page Library transfer:** one native Concessions Menu transferred with fresh identifiers, baseline Section CSS, stable class, native settings and empty Page CSS. The Library Page was importable without website publication. Repeated imports and general version/update behavior remain untested.
- **Local catalogue binding:** destination category IDs `589/590/591` differ from source `596/597/598`; destination has seven products versus the master's 26. Category override is empty. Product records were not bundled into the local CSS package.
- **Local independence:** after Unlink and saved Not Linked state, destination internal Name changed to `Food - Clubhouse Kitchen`. The master retained `Food K - Clubhouse Kitchen` and unchanged CSS; [comparison](library-master-independence-check.json). No upstream update was pushed to test future propagation.
- **Final draft status:** [post-refresh native readback](destination-scope-refresh-final-status.txt) and [screenshot](destination-scope-refresh-final-status.jpg) show destination Page `5973` with one Section, visibility off, Not Linked and unpublished. Earlier `destination-final-page-list.*` captures remain historical evidence from before the CSS refresh.
- **Carrier preview:** persisted draft `5970` has seven loaded product photos, three columns and zero overflow in the 1024px Admin desktop frame. Its 376px simulated phone frame shows one column but 3px overflow. Viewport units resolve against outer Chrome and colors come from the Admin framework; this is not an actual-phone or consumer Theme certification.
- **Native scope restoration:** complete after the approved [comment-only refresh](../../template-adapters/library-k-food/destination-scope-refresh.proposed.css). [Readback](destination-scope-refresh-readback-check.json) matches the approved CSS hash, with identical design rules and unchanged non-CSS fields. [Reopened evidence](destination-scope-refresh-after-reopen.json) confirms `.section-food---clubhouse-kitchen-25155` is now compiled correctly, the stale scope is absent and Georgia is restored. The [earlier mismatch](destination-style-before-reopen.json) remains historical proof of the native bug.
- **Bounded destination Admin review:** refreshed [desktop](destination-scope-refreshed-desktop-dom.json) shows 1024px, three columns, seven loaded photos and zero overflow; [simulated phone](destination-scope-refreshed-phone-dom.json) shows 376px, one column and seven loaded photos, with the known 3px overflow and outer-viewport sizing limit. Correct scope/no stale scope are verified in both. This is not full consumer Theme or actual-phone acceptance.
- **Existing-Page insertion:** not established. Import created a separate Page; it did not append Food to an existing homepage. Controlled empty state, actual phone, consumer Theme, arbitrary destination global CSS, Mobile App and checkout remain untested.

## Artifact map

| Stage | Artifacts |
| --- | --- |
| Source native widget and CSS | `source-k-food-widget.txt`, `source-k-food-section-settings.json`, `source-k-food-section.css`, `source-k-food-widget-settings.jpg` |
| Source published DOM | `source-k-food-dom-desktop.json`; prior [source food screenshot](../admin-controls-completion/native-clips/food--variant-k-clubhouse.jpg) retains its original provenance |
| Read-only Library/Section discovery | `source-page-library-menu.txt/.jpg`, `source-section-row-menu.txt`, `page-add-from-library.txt`, `custom-block-library.txt`, `custom-block-new-readonly.txt` |
| Initial create state, not final persisted draft | `carrier-section-25150.saved.css`, `carrier-desktop-dom.json`, `carrier-phone-dom.json`, initial `carrier-*-preview.jpg` |
| Draft identity/persistence correction | `carrier-reopened-empty-draft-5970.txt`, `carrier-draft-5970-reopened.txt`, `carrier-draft-5970-fields.json`, `carrier-draft-5970-saved.jpg` |
| Current persisted carrier Section `25151` | `carrier-draft-section-25151-widget.txt`, `carrier-draft-section-25151-settings.json`, `carrier-draft-section-25151.saved.css` |
| Persisted carrier previews | [carrier-draft-desktop-dom.json](carrier-draft-desktop-dom.json), [carrier-draft-phone-dom.json](carrier-draft-phone-dom.json), `carrier-draft-desktop-preview.jpg`, `carrier-draft-phone-preview.jpg` |
| Promotion | `carrier-library-create-pre-save.txt`, `carrier-linked-library-5971.txt`, `library-138-name-check.txt` |
| Library master | `library-master-5972-before-local-edit.txt`, `library-master-5972-after-local-edit.txt`, `library-master-section-25153-widget.txt`, `library-master-section-25153-settings.json`, `library-master-section-25153.css`, `library-master-before.json` |
| Destination before/after import and Unlink | `destination-pages-before-import.txt`, `destination-imported-page-list.jpg`, `destination-unlinked-page-list.txt` |
| Destination local edit and preservation | `destination-draft-5974-before-local-edit.txt`, `destination-section-25155-before-local-edit.txt`, `destination-section-25155-after-local-edit.txt`, `destination-section-25155-settings.json`, `destination-section-25155.css`, `destination-name-check.txt` |
| Catalogue and initial destination preview | `destination-menu-before-local-edit.json`, `destination-theme-before.json`, `destination-desktop-preview.jpg` |
| Independence and compiled-style issue | [library-master-independence-check.json](library-master-independence-check.json), `library-master-section-25153-after-local-edit.txt/.css`, [destination-style-before-reopen.json](destination-style-before-reopen.json) |
| Approved native scope repair and readback | `destination-section-25155.scope-refreshed.css`, `destination-scope-refresh-after-fields.json`, [destination-scope-refresh-readback-check.json](destination-scope-refresh-readback-check.json), [destination-scope-refresh-after-reopen.json](destination-scope-refresh-after-reopen.json) |
| Post-refresh destination previews | [destination-scope-refreshed-desktop-dom.json](destination-scope-refreshed-desktop-dom.json), [destination-scope-refreshed-phone-dom.json](destination-scope-refreshed-phone-dom.json), `destination-scope-refreshed-desktop.jpg`, `destination-scope-refreshed-phone.jpg` |
| Final post-refresh native status | [destination-scope-refresh-final-status.txt](destination-scope-refresh-final-status.txt), [destination-scope-refresh-final-status.jpg](destination-scope-refresh-final-status.jpg) |
| Plan versus executed result | `transfer-plan.json` is the historical prepared plan; [pilot-journal.json](pilot-journal.json) records executed actions and current status |

Raw captures are retained unchanged. An initial capture, prepared plan or source screenshot must not be substituted for a later persisted-draft or destination check.

Maintenance: ordinary customer copy belongs in **Heading** and **Description**; keep internal Section **Name** stable. A Name change left native compiled CSS stale in this case. A user-approved comment-only re-save of the same CSS fixed the scope, verified after reopening. This case-specific remedy must be followed by readback and compiled-scope checks; it does not replace actual consumer QA.

`custom-block-new-readonly.txt` is only a no-change accessibility marker. The visual-builder palette was inspected in the live browser transcript; that file is not a complete palette export. The other discovery text files may be accessibility diffs rather than full-page exports.

Fresh official help was read in Chrome: [Circuit Libraries](https://support.indy.systems/en/articles/11975519-circuit-libraries) and [Concessions Menu](https://support.indy.systems/en/articles/17709711-how-to-add-a-concessions-menu-widget-to-a-website-page). The former dedicated Pages article returned a missing-page response. See [the Library guide](../../docs/INDY-LIBRARY.md) for operating instructions and [the portable package](../../template-adapters/library-k-food/README.md) for exact configuration and CSS.
