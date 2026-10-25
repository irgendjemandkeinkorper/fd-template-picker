# INDY Library templates

Verified context: **US-BETA / INDY Demo / Adam Template Testing 2**, 25 October 2026. This document describes a proposed operating workflow. The research and picker work did not create, link, unlink, save or publish INDY records. No Library transfer or mixed-page assembly has been verified yet.

## What the picker represents

The picker is a visual selection and designer handoff. A screenshot, catalog option or proposed carrier name is not an installed INDY template. Mixing section screenshots expresses a design choice; it does not assemble live widgets in INDY.

Keep complete Variant Pages as the primary template units. A section can also be packaged in a separate **carrier Page**: a duplicated Variant retaining only that logical module. Importing a carrier is a proposal for creating a separate destination Page. Appending it to an existing homepage remains unverified.

INDY's documentation describes stacked widgets/custom components and component duplication. It does not document cross-page Section copying. The platform does not provide a supported website API for an externally hosted picker to assemble pages. Use native INDY controls for installation. [Websites 101](https://support.indy.systems/en/articles/12856508-websites-101-an-introduction)

## Observed controls and limits

| Inspected surface | Observed controls | What this establishes |
| --- | --- | --- |
| K Section row menu | Edit, Duplicate, Delete, View History | In-page duplication exists. No cross-page Copy/Move action was visible. |
| Add Section | Creating Section with native Type choices including Custom, Text Block, Rich Text and dynamic widgets | No import-from-page or Section Library control was visible. |
| Page management | Add From Library; Not Linked status | Page-level Library workflow is exposed. Its actual copy and dependency behavior still needs a pilot. |
| Custom Blocks | Separate website configuration area | Cross-site Library support and native multi-widget packaging have not been inspected. |

The former Pages help article is unavailable, so earlier operating guidance about repeated Add From Library copies needs current verification. Do not infer that Library Page import merges Sections into an existing Page, that every dependent object is copied, or that Library promotion publishes a page.

## Full-page template workflow

1. Confirm the exact authorized Region, Circuit, source Site, Library and test destination. Recheck the selectors before each change. Library scope is a separate choice; cross-Circuit Region Library distribution is not established by the inspected documentation.
2. Preserve the original Variant. Record its published and editable draft identities, widget order, publication state, styling and dependencies. Duplicate it to a distinct draft if template preparation requires changes.
3. Inspect its Page status-chip menu. Current general Library documentation offers creating a Library item (permission required) or linking to an existing one, but availability must be confirmed for this Page. Promote only into the named, authorized Library.
4. At an authorized test destination, use **Add From Library**. Verify the resulting separate Page, its new identifiers, generated route and draft/published status. Do not assume destination slugs or media references are remapped correctly.
5. For an independent starting template, **Unlink** and verify **Not Linked** before local changes. A linked record with updates disabled remains related to its source; Force Update can refresh it. Use an active link only for deliberately synchronized content. Record the source Library ID for provenance.
6. Replace destination-specific content and references. Verify desktop/mobile previews and dynamic behavior. Saving, website publication, Library propagation and hosting deployment are independent operations; use only the operation needed for the approved outcome.
7. Mark a template's Library transfer verified only after inspecting the destination copy and recording the evidence. Keep mixed-page assembly verification separate.

Library status chips, unlinking, manual refresh and source IDs are documented in [Circuit Libraries](https://support.indy.systems/en/articles/11975519-circuit-libraries). Instructions should follow the tenant's current status-chip labels; some older screens may still say Library Updates. Circuit Library provisioning requires INDY support if a suitable Library does not already exist.

## Carrier-page workflow

Use this only after the full-page pilot establishes Page transfer behavior.

1. Choose one logical module. Several adjacent native widgets can belong to one module if they depend on each other.
2. Duplicate the **whole Variant Page** into a new draft named for the module. Remove unrelated Sections only from that duplicate after the exact object changes are approved. Keep the original Variant intact.
3. Preserve necessary Section and Page CSS, media, classes and references. Inspect rules tied to generated Page/Section IDs; copied records may receive different IDs. Prefer intentional stable classes for reusable rules.
4. Promote the carrier to the authorized Library and import it as a **separate destination Page**. Unlink before independent customization and check its dependencies.
5. Describe its installation result precisely: a separate Page containing the selected module. Combining modules into one existing Page needs a separately verified native workflow, a proven Custom Block route or careful manual recreation. Do not advertise automated insertion.

## Stable names and provenance

Use the convention **`<variant-slug>_<slot>`**, for example `variant-k-clubhouse_experience`. Keep the Variant slug hyphenated; use lowercase underscores within a multiword slot, such as `ticket_finder`. The slot should describe the module's actual purpose. A proposed name must remain separate from the real INDY Page title, Page ID and Library ID. Verify the generated public route rather than assuming underscores or a title produce a particular slug.

Use semantic catalog keys and deliberate classes as durable labels. Numeric record IDs are evidence about a specific source version, not reusable selectors guaranteed to survive copying or publishing.

Record these separately:

- Source Region/Circuit/Site, source Page title and published URL.
- Published Page ID and published Section IDs used for screenshots.
- Editable draft Page ID and draft Section IDs used for changes, when inspected.
- Library scope, Library Page ID, source template version and link/update policy.
- Destination Page/Section IDs, generated route, link status and publication state after the pilot.
- Screenshot time, viewport, source selectors and whether the result is live, illustrative, partial or missing.
- Dependencies, destination fields to replace, installation steps and validation evidence.

Suggested readiness stages are **visual reference**, **carrier Page proposed**, **Library Page verified**, and **assembly into existing Page verified**. Capturing a screenshot or verifying a separate Page import does not prove the final stage.

## Concrete K pilot proposal

The module is **K Stay Awhile**, a **Text Block** describing the cinema's social experience. Its mention of drinks does not make it a Concessions Menu or food-ordering template. Classify it as **Experience** and propose **`variant-k-clubhouse_experience`**. No carrier or Library record has been created.

| Identity | Published source | Editable source draft |
| --- | --- | --- |
| Page | `5915` — Variant K Clubhouse | `5916` — Variant K Clubhouse |
| Welcome | `24895` | `24890` |
| Featured | `24896` | `24891` |
| Reserve | `24897` | `24892` |
| Stay Awhile | `24898` | `24893` |
| Join the Club | `24899` | `24894` |

These mappings were checked by Section name, type, order and rendered contents. The published screenshot's `.section-k-stay-awhile-24898` is not the editable draft's Section identifier. Reinspect before changing anything.

Source: [Variant K Clubhouse](https://adam-template-testing-2-indy-consumer.netlify.app/variant-k-clubhouse/).

After approval for the exact new draft and Library target: duplicate the whole K Page, retain Stay Awhile and its required styling, name the carrier `variant-k-clubhouse_experience`, and preview it. Promote that separate Page, import it into one authorized test Site, unlink it and verify its local contents and appearance. Record the new identities instead of reusing the source IDs. This pilot tests carrier Page transfer; it does not claim insertion into an existing homepage.

## Packaging dependencies

| Dependency | Required handoff/check |
| --- | --- |
| Theme, fonts, logos, header and global CSS | Theme & Style is per Site. Identify prerequisites and destination brand values; copying a Page does not prove a full theme moved. [Theme & Style](https://support.indy.systems/en/articles/12856646-theme-style) |
| Page/Section CSS and custom classes | Preserve relevant rules, check generated-ID selectors, and verify scopes after duplication/import. Avoid selectors that affect unrelated Pages. |
| Custom Blocks | List referenced blocks and versions. Verify whether transfer copies them, links them or leaves a dependency to configure separately. |
| Images and URLs | Check image ownership/access, crops, absolute source-site links, internal routes and missing assets after transfer. Media remapping is unverified. |
| News | Carry or rebind News Item Classes and News Items, publication states and dates. Circuit Library sharing is documented; widget filters still need checking. [News Items](https://support.indy.systems/en/articles/11975020-news-item-classes-news-items) |
| Forms | Replace receiving Notify Email and customer-facing Submission Email; check fields, success copy and visibility before publishing. [Generic Form](https://support.indy.systems/en/articles/12878591-generic-form) |
| Concessions | Rebind sales channels, category overrides and item visibility. A transferred layout does not prove destination products are available. [Concessions Menu](https://support.indy.systems/en/articles/17709711-how-to-add-a-concessions-menu-widget-to-a-website-page) |
| Movies and booking | Verify destination inventory, filters and real showtimes. Preserve empty states in screenshots; a visual template does not configure bookable sessions. |
| Navigation/footer | Treat global settings separately. A captured header/footer style is not a portable Page Section. |

## Remaining verification

Confirm repeated imports and slug handling, all nested dependency-copy behavior, which fields receive linked updates, whether Library Pages can remain drafts, and whether a supported cross-page assembly feature exists elsewhere. Select the specific Library and destination before the pilot. Site Tags can help select groups for later distribution if enabled, but are not needed for this first test. [Site Tags](https://support.indy.systems/en/articles/17357574-how-to-use-site-tags-for-library-changes)
