# Clubhouse Food: published consumer checks

Verified **25 October 2026** local time. The user explicitly authorized hiding the original food Section, publishing this demo Page and checking the live desktop/phone output. Exact actions and results are recorded in [live-journal.json](live-journal.json).

Target: **US-BETA / INDY Demo / Adam Template Testing → Fandango Cinema Template Test**, Page **5585**, editable draft **5586**, **Not Linked**. Clubhouse is editable Section **25156**, published counterpart **25157**, class **fdp-k-food**. Original Section **23540 — Concessions - Snacks Worth the Credits** is **hidden, not deleted**; the Page still contains nine Sections. Only this Page's changes were published.

Live route: [Fandango Cinema Template Test](https://adam-template-testing-indy-consumer.netlify.app/fandango-cinema-template-test/). The hostname was resolved from read-only **Developer Site Settings → Hosting → Netlify Site Name**, `adam-template-testing-indy-consumer`; see [hosting-readonly.json](hosting-readonly.json). No hosting fields changed and no deployment was triggered.

## Consumer results

| Check | Desktop | Real mobile viewport |
| --- | --- | --- |
| Viewport | 1536 × 639 | 390 × 844 |
| Product columns | 3 | 1 |
| Products / loaded photos | 7 / 7 | 7 / 7 |
| Menu and document horizontal overflow | 0px | 0px |
| Mobile heading | — | 32px |
| Original food heading | Absent | Absent |
| Original floating category bar | Absent | Absent in recorded scroll checks |

The live consumer uses native **Background `#fbefe2`**, **Dark `#38264a`**, **Primary `#e06b4a`**, **Secondary `#c4553a`**. This verifies the current consumer palette and real phone geometry. The earlier Admin simulated phone's 3px overflow/62px heading did not reproduce at the actual mobile viewport. Arbitrary palette changes, controlled empty state, catalogue availability rules, checkout and Mobile App were not exercised.

## Remaining native interaction quirk

On mobile, choosing **Desserts** scrolls to the correct dessert products, but the dropdown label can remain **Drinks** until further scrolling. [Settled evidence](live-mobile-category-settled.json) shows the stale label alongside dessert products; [after-scroll evidence](live-mobile-category-after-scroll.json) shows it updated to Desserts. The behavior is retained as a native category-indicator issue, not described as a failed category jump or fully resolved interaction. The old menu's floating category bar is absent after its visibility was turned off.

## Artifact map

| Stage | Evidence |
| --- | --- |
| Original Section before visibility edit | `before-hide.txt`, `original-section-before-fields.json` |
| Visibility off and saved | `original-section-visibility-off-unsaved.txt`, `after-hide-save.txt` |
| Bounded Admin review before publication | `pre-publish-desktop.json/.jpg`, `pre-publish-phone.json` |
| Page publication state | [published-page-list.txt](published-page-list.txt), [screenshot](published-page-list.jpg) |
| Hostname discovery | [hosting-readonly.json](hosting-readonly.json) |
| Live desktop | [live-desktop.json](live-desktop.json), [screenshot](live-desktop.jpg) |
| Live mobile | [live-mobile.json](live-mobile.json), [screenshot](live-mobile.jpg) |
| Mobile category behavior | `live-mobile-category.json`, [settled label](live-mobile-category-settled.json), [after scrolling](live-mobile-category-after-scroll.json), [Desserts screenshot](live-mobile-desserts.jpg) |
| Authoritative result | [live-journal.json](live-journal.json) |

The earlier [Library pilot](../library-k-food-pilot/README.md) and [existing-Page assembly](../library-k-food-assembly/README.md) remain immutable historical stages. Library import created a separate Page; native recreation assembled the menu inside Page 5585; this later phase hid the comparison menu and published the assembled result. Direct Library Section import and automated cross-page copying remain unverified. No source carrier, Circuit Library master, other Page, Theme field, product or catalogue record changed in this live phase.
