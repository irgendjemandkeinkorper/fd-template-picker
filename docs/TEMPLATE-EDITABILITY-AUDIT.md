# Template editability audit

**Target:** US-BETA / INDY Demo / Adam Template Testing 2. **Date:** 25 October 2026. **Status:** maintained colors and observed overlays are saved/published and verified at desktop/phone sizes in two native palettes; the original palette is restored. None of the 72 core source options is certified for full Admin-only maintenance. Screenshot approval establishes appearance, not editability.

This audit began with captured authoring CSS/HTML and now includes the [native implementation journal](../evidence/admin-controls-completion/changes-journal.json) and exact [saved field readbacks](../evidence/admin-controls-completion/native-saved/). The journal records 30 saved fields and all twelve pages published. The final [QA report](../evidence/admin-controls-completion/final-qa-report.json) accepts all 48 current captures across both palettes and both view sizes, with zero measured text failures and explicit mathematical bounds for C/D decorative gradients. Native original-palette restoration is verified separately. The [dated implementation status](../template-adapters/admin-controls-completion/FINAL-STATUS.md) and additive [machine-readable audit](../evidence/template-editability-audit.json) retain exact scope; the closures below supersede original color/overlay findings. Public compiled CSS is not a native editable-field export.

## Concrete findings

### EDIT-01 — Literal and demo palettes bypass theme changes

**Original finding:** D/E native aliases were overridden by demo hex. B/C/G/H/I and F adapters and the sixteen parity payloads carried literal brand palettes.

**Implementation closure, 25 October 2026:** The named native Theme/Page/Section fields are now saved with Primary/Secondary/Dark roles and native Background, with exact readbacks and scoped page publication. Header aliases consume Dark; Accent decoration consumes Secondary. Native status/error colors retain their service meaning. CTA/card fills use measured derived tints with Dark copy; native form inline defaults receive scoped role bindings. The implementation is in the [current native journal](../evidence/admin-controls-completion/changes-journal.json), not the old compiled proposal bundle. Native second-palette work and restoration are recorded; the [QA matrix](../evidence/admin-controls-completion/final-qa-report.json) remains the authority for final complete coverage. Arbitrary future palettes still require whole-page contrast checks.

### EDIT-02 — Overlay source disables text shadows

**Original finding:** D/E/G/H/I hero source explicitly disabled text shadows. Some type was off-image; any text crossing imagery needed protection.

**Implementation closure, 25 October 2026:** Scoped native desktop/mobile caption adapters now protect the observed A–I title/subtitle families with opaque paired backings and shadows, and the native carousel arrows have their own paired backing. J–L's editorial hero alternatives have explicit native panel/copy roles. The shared Late header uses an opaque Dark surface and shadow; Concrete's approved containment and Ma's caption geometry are retained. Later native QA corrections include G's phone flow and observed editorial/empty-state foregrounds. See [saved native sources](../evidence/admin-controls-completion/native-saved/) and [current acceptance evidence](../evidence/admin-controls-completion/final-qa-report.json).

**Remaining verification:** A sampled native pass is not proof of every slide frame, image, hover/focus/disabled state, drawer or future populated widget state. Those states remain in the acceptance checklist. F's missing hero media and G's existing null phone background-image setting are separate source-media dependencies.

### EDIT-03 — Odd membership emphasis depends on position

**Original finding:** Tier color emphasis followed child position and demo overrides; card slants were -1.5°, +1.5° and -0.8°.

**Color-role closure, 25 October 2026:** The actual Odd membership body now carries `fd-tier-primary`, `fd-tier-secondary` and `fd-tier-dark`; their native CSS uses Primary 16%, Secondary 14% and Dark 10% tints into Background, with Dark copy. The native journal records the body/class save together with its page CSS. Earned punch marks use native Dark; the unearned transparent slots remain intentionally blank. Reordering the three existing wrappers no longer silently changes their semantic color role.

**Remaining preset limitation:** Existing slants and layout remain fixed template design, still using the original geometry rules. Native per-card color or slant preset controls have not been demonstrated; this closure does not invent them or certify arbitrary structural edits.

### EDIT-04 — Native editorial blocks still contain authored HTML

Ten parity Text Blocks contain cards/anchors in bodyHtml. Original membership/hire tables contain static tier/rate copy. Native widget type is not proof of data bindings or individual card controls.

**Required:** Document exact editable fields/classes. Keep structure stable, change copy/links in intended editors, and distinguish editorial information from native products/inventory.

### EDIT-05 — Customer wording is generated by CSS

Storybook hero injects Now showing; food injects Bill of fare. Ordinary content editors cannot update/localize these strings.

**Required:** Move meaningful text into native fields; generated CSS content for decoration only.

### EDIT-06 — Source-ID and DOM-dependent selectors are fragile to copying

Selectors use source page slugs/IDs, generated section-name fragments, q-* wrappers and nth-child. Library copies can receive different identities/markup.

**Required:** Stable reusable section classes, scoped versioned adapters and a real destination-site copy/unlink test.

### EDIT-07 — Template fonts can override editable theme fonts

Global/page rules pin Georgia/Arial and Bodoni Moda/Jost/IBM Plex Mono, often!important. Site CSS imports Google Fonts.

**Required:** Decide fixed design fonts versus editable typography roles; bind editable roles to verified native controls. Native font variable names unverified.

### EDIT-08 — Visible forms/CTAs do not prove service configuration

J/K/L form journals show blank notification/submission recipients and no delivery test. Copies need local routes, products, channels and handling.

**Required:** Native build handoff checks and authorized functional validation before client launch.

## Actual color contract

Root’s authenticated Admin readback found Primary `#e06b4a`, Secondary `#c4553a`, Header `#241a2e`, Accent `#f4c67a`, Dark `#38264a`, Background `#fbefe2`. The saved [Site Custom CSS](../../evidence/admin-controls-audit/site-theme-before.css) references `--q-primary`, `--q-secondary`, `--q-header`, `--q-dark`, `--q-background` and `--q-accent`; Grid also references `--q-warning`. Read runtime values on `body`; document-root values may be framework defaults.

Reusable paint must consume these maintained values. Explicit on-primary, on-secondary, on-dark, on-background, focus and overlay foregrounds need measured contrast. The picker’s primary/secondary comparison covers one pairing; it does not certify header, dark surfaces, muted text, derived tints or image overlays. Shadows help edges, while a controlled backing/scrim or solid copy panel protects text across changing imagery.

### Odd membership, precisely

The [Odd authoring stylesheet](../../evidence/recapture-2/d-page-css-before.txt) begins with native aliases at lines 16–20, then shadows them with demo hex at lines 23–30. Membership at lines 1047–1060 uses white paper for tier 1, an Accent-derived scrap tint for tier 2 and a Dark-derived tint for tier 3. Angles are `-1.5deg`, `1.5deg` and `-0.8deg`, selected by child position. Its CTA uses Primary through `--v-go` at line 1086.

The reusable contract should assign explicit Primary, Secondary and Dark roles to the three cards, with readable foregrounds for each. Keep slants as documented template character or provide finite class choices through native authoring. Reordering content must not silently change its business emphasis. Native individual-card color/slant controls have not been demonstrated.

## Original variant maintenance baseline

This table preserves the pre-migration findings and then-available evidence. Its literal-palette and pending-native-readback notes are historical; EDIT-01/02/03 above and the current saved-source journal now govern those scopes. The authored content, typography, services, source identity and Library limitations remain open.

| Variant | Paint ownership blocker | Evidence certainty | Specific support issue |
|---|---|---|---|
| A · Circuit | Original page stylesheet absent locally. Shared site CSS controls navigation and inherited base palette. | Current header plus fresh public compiled page/section CSS; native fields pending | Fresh public compiled CSS/HTML now covers the five non-navigation components; exact native editable fields remain pending. |
| B · Rep | Original page CSS writes literal hex/rgba throughout. New private-party section repeats literals. | Authoring CSS captured; current native fields pending | Printed Menu uses native concessions data; prices/descriptions remain catalog-owned. |
| C · Late | Original page CSS writes literal hex/rgba throughout; navigation repair also pins cream text. | Authoring CSS captured; current native fields pending | Hero Dock is authored companion content; times/prices cannot be assumed live booking data. |
| D · Odd | System aliases exist, then same-scope DEMO PALETTE overrides all five with hex. | Authoring CSS captured; current native fields pending | Tier colors/slants are nth-child-dependent, with Accent-derived second card. |
| E · Grid | System aliases exist, then same-scope DEMO PALETTE overrides all six with hex. | Authoring CSS captured; current native fields pending | Dark is ground, Background is foreground; derived mixes need separate contrast checks. |
| F · Concrete | Adapter defines literal --cn-paper/ink/rule and repeats direct hex for cn-* and form variables. | Authoring CSS captured; current native fields pending | Navigation containment/logo/inline counters repaired and recaptured; Reference Print hero media dependency remains. |
| G · Cut | --cut-bone/ink/rust/amber are literals; membership has a separate literal palette. | Authoring CSS captured; current native fields pending | Structural wrapper repair did not remove literal palette. |
| H · Storybook | --sb-ground/blush/mint/butter/wine are literals; membership has another literal palette. | Authoring CSS captured; current native fields pending | Customer wording Now showing and Bill of fare is injected in CSS. |
| I · Ma | --ma-paper/ink/seal/hairline are literals; membership has another literal palette. | Authoring CSS captured; current native fields pending | Ma-only Light Text/backdrop/shadow repair published and recaptured; broader overlay audit remains open. |
| J · Box Office | Four added modules use literal palettes, reinforced by page-level text/submit overrides. Intro pins cream. | Authoring CSS captured; current native fields pending | Native form recipient fields blank in result evidence; no delivery test. |
| K · Clubhouse | Four modules use literal palettes. Contact has applied overrides; original welcome CSS backup empty. | Fresh CSSOM section rules complete; original page CSS empty; native fields pending | Native form recipient fields blank; no delivery test. |
| L · Midnight Lounge | Four modules use literal palettes. Page-level submit button repeats gold/plum hex. | Authoring CSS captured; current native fields pending | Native form recipient fields blank; no delivery test. |

G–L use one shared native header design, displayed as Standard once while retaining all source identities. The shared Theme migration is saved; original geometry remains. Typography and unexercised control states remain separate checks.

## Six-section control ownership

| Section | Admin-owned information | Central template implementation | Check before reuse |
|---|---|---|---|
| Navigation | Navigation labels/order/destinations; native theme/logo | Responsive layout, dropdown/drawer, CTA role | Assigned records and every destination; overlay readability |
| Hero | Carousel image/title/subtitle/CTA; separate companion sections | Crop, spacing, overlay/scrim, responsive arrangement | All slides/bright-dark frames; F missing Reference Print image |
| Food & Drink | Native products/categories/prices/media/Website availability; menu section options | Card/list/category treatment and paint roles | Data edits update correctly; ordering/price states preserved |
| Private Parties | Editorial heading/body/package copy/CTA | Stable wrappers, layout and decorative presets | Local hire route; static copy not implied availability |
| Membership | Editorial intro/tier copy/CTA; actual membership products separately | Card/table geometry and color roles | Native plan data versus editorial copy clearly owned |
| Contact Us | Native field labels/types/required flags/submit caption/routing | Layout, focus states, native button paints | Actual handling configured; visible form not proof of delivery |

The ten added editorial Text Blocks use body HTML. Staff can edit their information in the native field, but structure/classes remain implementation until dedicated repeatable controls are demonstrated. A native section does not imply a native editor for every card. Circuit A is explicitly different: its membership is a native Custom component with an existing visual builder, as detailed below.

## Source section index

Published IDs below come from the current catalog; draft IDs differ. Navigation is site-owned and has no page section ID.

| Template / Page ID | Navigation | Hero | Food | Private Parties | Membership | Contact |
|---|---|---|---|---|---|---|
| A · Circuit / 5659 | site | 23738 + 23739 | 23731 | 23724 | 23765 | 23747 |
| B · Rep / 5661 | site | 23741 | 23733 | 25134 | 23767 | 23749 |
| C · Late / 5663 | site | 23744 + 23745 | 23735 | 23728 | 23769 | 23751 |
| D · Odd / 5899 | site | 24790 + 24791 | 24794 | 24793 | 24797 | 24795 |
| E · Grid / 5901 | site | 24806 + 24807 | 24810 | 24809 | 24814 | 24811 |
| F · Concrete / 5903 | site | 24826 + 24828 | 24830 | 24829 | 24833 | 24831 |
| G · Cut / 5905 | site | 24850 | 24852 | 24851 | 25118 | 24853 |
| H · Storybook / 5909 | site | 24864 | 24866 | 24865 | 25121 | 24867 |
| I · Ma / 5911 | site | 24872 | 24874 | 24873 | 25125 | 24875 |
| J · Box Office / 5913 | site | 24885 | 25142 | 25143 | 25144 | 25145 |
| K · Clubhouse / 5915 | site | 24895 | 25135 | 25136 | 24899 | 25137 |
| L · Midnight Lounge / 5917 | site | 24905 | 25138 | 25139 | 25140 | 25141 |

## Central adapters to implement once

1. Replace literal branding in shared theme/page/section CSS with a consistent role map. Remove or isolate reusable D/E demo overrides. Check cascade and `!important`, including page-level native form overrides.
2. Protect navigation, carousel headings/subtitles and interactive captions with scoped overlay rules. Remove conflicting shadow resets.
3. Give reusable sections stable classes that survive copies. Keep customer content fields separate from fixed geometry. Replace positional paint with semantic roles/presets where staff needs control.
4. Move generated customer wording into editable fields. Decide which fonts are fixed template identity and which follow native editable typography.
5. Version template CSS and support guides together. Ordinary client content/color changes must use documented native editors; a layout redesign can use a shared template revision.

## Acceptance checklist

- [ ] Finish native controls and remaining editable-field mapping. Circuit A membership’s Custom visual surface is confirmed; per-card controls remain unverified.
- [x] Rebase the Ma page/section proposal onto final saved/published Light Text/backdrop/shadow and positive-caption-offset CSS.
- [x] Save the separate shared Site Theme/header paint migration, preserving Concrete’s approved navigation repair, with exact native readback.
- [x] Exercise a second distinct palette through Theme & Style and restore the original native palette; see the dated matrix for accepted samples.
- [ ] Finish acceptance of the complete current restored-palette desktop/mobile matrix and refresh customer picker captures; old cycle images do not establish current acceptance.
- [ ] Change ordinary copy/media/CTA labels+href/product data/form labels through intended native editors.
- [ ] Test all slide frames, focus/hover/active/disabled states, dropdowns and mobile drawer contrast.
- [ ] Copy a single-section Library carrier into a separately authorized destination; verify unlink/update status, stable classes, local routes/assets/dependencies.
- [ ] Keep internal FAQ behind existing staff access boundary; hiding its link is not authorization.

No destination Library transfer or unlink was tested. Native billing/booking/delivery remains separate from editorial screenshots. J/K/L blank form recipients and F missing hero media are build dependencies. Internal support guides need an existing staff access boundary; hiding a link does not restrict access.

## Evidence and limits

- Current native global CSS after the approved navigation repair: [site-theme-after.css](../../evidence/admin-controls-audit/site-theme-after.css); original backup [site-theme-before.css](../../evidence/admin-controls-audit/site-theme-before.css).
- Original/applied page snapshots: [recapture evidence](../../evidence/recapture-2/).
- G/H/I page sources: [Admin backups](../../evidence/indy-backups/).
- Added content/style proposals: [parity-section-payloads.json](../../evidence/parity-section-payloads.json), cross-referenced with the [publication journal](../evidence/indy-parity-changes.json).
- Current source identities and screenshot state: [catalog.json](../catalog.json).

The earlier [public compiled captures](../../evidence/admin-controls-audit/live-template-styles-final.json) and [K CSSOM capture](../../evidence/admin-controls-audit/k-all-styles.json) explain the original paint sources. They are superseded for current installation status by the native journal, exact saved readbacks and final QA report linked above. Exact typography variables, shape controls and individual-card editing fields remain unverified. A proposal or a saved file alone does not establish complete native/public acceptance.

## Reviewable token migration proposals

The [original brand-token bundle](../template-adapters/brand-tokens/README.md) remains compiled page/section proof and review history. It was not pasted into Admin. The later [native-field implementation](../template-adapters/admin-controls-completion/FINAL-STATUS.md) maps the actual raw fields and is saved/published, including the [shared Theme/header contract](../template-adapters/shared-theme-completion/README.md). Do not apply old compiled proposals or restore an earlier partial repair over the current native implementation. Complete state/contrast acceptance remains in the final QA report.

## Approved partial closures — 25 October 2026

The [repair journal](../evidence/component-controls-repairs/changes-journal.json) records two approved repairs, saved/published output and byte-identical native screenshot replacements:

- **Concrete navigation:** contained desktop links, centered logo and inline 01–06 counters. All seven desktop links were inside the sidebar; seven mobile links and no horizontal overflow were verified. The [replacement navigation capture](../evidence/component-controls-repairs/f-navigation-live.jpg) is the actual native output.
- **Ma hero:** native **Light Text** enabled on editable section 24876 / published section 24872, page 5912 / published page 5911. Conflicting dark-ink and shadow-reset overrides were removed. Published desktop and phone captions have light text, dark backdrops and shadows. Phone readback found both caption roles white on 88% dark backdrops, each 327px wide; no content overflow. See the [hero capture](../evidence/component-controls-repairs/i-hero-live.jpg) and [phone evidence](../evidence/component-controls-repairs/ma-mobile-final.jpg).

These are historical captures of the first two repairs. The later native implementation now covers the named color roles and observed caption families across A–L, including Odd's semantic cards and the shared Theme; its current status comes from the new native journal and QA report. Old Ma 88% scrim figures and screenshots describe that earlier cycle, not the later opaque caption contract. Full Admin-only maintenance certification remains **0** because the remaining editor, typography, structure, Library and service gates have not closed.

## Confirmed native Custom surface — Circuit A only

The [native editable page map](../../evidence/admin-controls-audit/a-native-page-map.json) identifies editable **Page 5660**. Its hero combines **Generic Carousel 23736** with **Custom 23737**; **Events A - Rate Card 23725** and **Membership A - Tier Rail 23764** are **Custom**. Food 23730 is Concessions Menu and Contact 23746 is Generic Form. Published IDs in the source index above remain distinct from these editable IDs.

Root opened the existing Membership A component and observed rendered content inside a **GrapesJS iframe visual builder**, with View Components, Preview, Fullscreen, Edit Code, Style Manager, Settings, Layers and Blocks. No content was edited. This confirms an existing native visual authoring surface for A membership; it does not establish per-card color-role/slant presets or the same editing surface for every template.

The separate native **Custom Blocks** collection was empty. Add From Library was available, and an unsaved visual builder was inspected. No Custom Block was created or saved, and no Library transfer was tested. Support instructions must retain that distinction between an existing page Custom component, an unsaved block editor and a portable Library object.
