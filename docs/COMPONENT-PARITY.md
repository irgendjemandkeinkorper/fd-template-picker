# Shared component parity

Source: **US-BETA / INDY Demo / Adam Template Testing 2**. The current published-source audit is retained at [evidence/component-parity.json](../evidence/component-parity.json). The original audit remains at [evidence/component-parity-baseline.json](../evidence/component-parity-baseline.json).

Every variant now has the six required component purposes: Navigation, Hero, Food & Drink, Private Parties, Membership and Contact Us. The current catalog contains **72 required component choices across 12 variants**. Presence records dedicated visible source content; design maturity and behavior have separate evidence.

| Variant | Navigation | Hero | Food & Drink | Private Parties | Membership | Contact Us |
| --- | --- | --- | --- | --- | --- | --- |
| A · Circuit | Present | Present | Present | Present | Present | Present |
| B · Rep | Present | Present | Present | Present | Present | Present |
| C · Late | Present | Present | Present | Present | Present | Present |
| D · Odd | Present | Present | Present | Present | Present | Present |
| E · Grid | Present | Present | Present | Present | Present | Present |
| F · Concrete | Present | Present | Present | Present | Present | Present |
| G · Cut | Present | Present | Present | Present | Present | Present |
| H · Storybook | Present | Present | Present | Present | Present | Present |
| I · Ma | Present | Present | Present | Present | Present | Present |
| J · Box Office | Present | Present | Present | Present | Present | Present |
| K · Clubhouse | Present | Present | Present | Present | Present | Present |
| L · Midnight Lounge | Present | Present | Present | Present | Present | Present |

## Source changes

The original baseline had **56 present, 2 partial and 14 missing** components. All 16 gaps were repaired on the authorized test site: 15 modules were created and K's existing membership module was enriched.

- B gained a dedicated private-party section; its original public Playbill remains optional Programme content.
- G, H and I gained distinct membership treatments.
- J and L each gained food, private-party, membership and contact sections.
- K gained food, private-party and contact sections, and purposeful membership guidance with a direct membership link.

The additions use **10 native Text Blocks, 3 native Concessions Menus and 3 native Generic Forms**. Menus use the actual Website catalog. New forms contain required name, email and message fields with a visible send action. Notification recipients remain blank for destination configuration; no form was submitted. Text links use the existing membership and private-hire routes. Source mappings and scope are recorded in [the change journal](../evidence/indy-parity-changes.json).

## Captures and verification

The catalog has **110 choices across 18 categories: 105 browser screenshots and 5 zero-height optional/support records**. Repaired B/G/H/I/J/K/L use native full-page browser captures; unchanged A/C/D/E/F retain their earlier viewport-tile captures. Original bounds, source IDs, capture method and exact footer exclusions accompany each image. The catalog's coverage matrix and each full-variant preset map to all six required components.

The [current native inventory](../evidence/page-inventory-current.json) records all 12 variants as published and Not Linked, with no pending-change indicators. B has 9 configured native sections but 7 rendered section roots; two declared widgets were absent from the observed DOM before these changes. Configured count and rendered count are retained separately rather than treating those extra widgets as core gaps.

[Actual mobile geometry](../evidence/parity-mobile-qa.json) was checked on all seven repaired variants at a 390px viewport. Each page remains 390px wide, and all 16 new or enriched components have no measured horizontal overflow. G's pre-existing diagonal private-party treatment reports 394px internal width within approximately 390px section bounds; the page itself does not overflow. All 16 new or enriched modules also passed [manual mobile pixel review](../evidence/mobile-visual-qa.json): text and actions remain visible, layouts stack, form fields are readable and all seven product photos are loaded in each new menu. See the [compact contact proof](../evidence/mobile-components/mobile-contact-proof.png). These checks do not certify form delivery, purchases, booking or mobile navigation behavior.

## Design caveats and optional modules

- G–L share a navigation design. Their separate source representations are recorded honestly.
- J–L retain basic page introductions. A deliberate hero-design pass is still needed to match A–I's maturity.
- K's Stay Awhile and L's Lounge Ritual remain experience content; J's Plan Your Visit remains visit content. Dedicated native food and contact modules now sit alongside them.
- D/E/F's zero-height contact anchors remain support hooks; their native contact forms are visible.
- Native movie discovery and booking modules remain optional until distinct presets have populated live evidence. Empty programming states do not prove unique movie layouts; see [movie-widget research](MOVIE-WIDGETS.md).

Keep full variants as design references. Test one section carrier page and one Library destination copy before promoting the collection. Library objects remain uncreated and cross-site transfer remains unverified; see [the Library investigation](INDY-LIBRARY.md).

## Updating evidence

The required-component filter is the picker's default. Catalog coverage and the included combination's coverage are reported separately in the interface and exports. Source notes, design caveats, section IDs and Library transfer plans accompany the designer handoff.

Follow [the capture workflow](CAPTURE-WORKFLOW.md) for future updates. A screenshot refresh alone does not certify component purpose. Reviewed metadata must identify the canonical component and exact published source IDs; changed sources without review remain unverified. Private-party choices retain the stable `events` slot ID, while public programme content remains separate.

## Second-pass visual correction — 2026-10-25

The earlier **72-component coverage result was a source/geometry check, not proof that every screenshot displayed its named component**. A full pixel audit found repeated hero pixels throughout B's full-page image, incomplete navigation previews and source styling defects. The first capture-method summary above is historical; corrected images use individually reviewed native section clips. Visual acceptance must follow the current per-image review, independently of component presence.

Five page-level CSS repairs were published on the authorized test site, retaining all source IDs: C (page 5663) restores its hidden desktop navigation; D (5899) adapts its paper collage hero to the actual native background-image carousel; E (5901) corrects indentation nodes disturbing four rich-text layouts; F (5903) supplies missing styles for its existing Concrete sections; G (5905) targets the actual occasion-card elements so their panels and text are readable. Exact scope, recovery-file hashes and verification limits are recorded in [the source visual repair journal](../evidence/source-visual-repairs.json).

Desktop and [mobile source checks](../evidence/source-repair-mobile-qa.json) are complete for these repairs. At 390px, C's native menu opens all seven links, E's cards stack, F's form fits with its wide tables scrolling inside their containers, and G's four occasion headings and actions fit without page overflow. D's photo and stamp fit, but its native mobile widget still omits the title and CTA; restoration of those fields is not claimed. These source changes do not certify forms, transactions or Library transfer. F's unconfigured Reference Print and voucher images, and blank map regions where observed, remain explicit content/media caveats. Global Theme & Style, navigation records and Library records were unchanged; no form was submitted or purchase made.

This pass replaced **23 previews**; independent pixel review accepted 18 and kept 5 flagged. The full catalog now records **92 passed previews, 13 needing review and 5 zero-height records**. **71 of 72 required previews pass**; F's hero remains flagged because its Reference Print source image is unconfigured. The [D/E/F pixel report](../evidence/recapture-def-pixel-review.md) retains detailed observations and image hashes. Five [reviewable CSS patch files](../evidence/source-style-patches/) accompany the source journal; full recovery files remain in the shared workspace. The picker also gives navigation a larger preview, offers full-size images, and refreshes changed images by their content hash. Root checked B's actual menu and all 12 navigation previews in the running picker.
