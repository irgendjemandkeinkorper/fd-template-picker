> Published support guide. Raw maintainer audit records are retained separately. Reviewed October 26, 2026.

# Metropolis — support guide

**Status: Current-site working guide; launch QA remains a separate decision.**
**Target:** US-BETA → INDY Demo → Metropolis · Site **188** · [Open demo](https://template-metropolis-indy-consumer.netlify.app/)
**Evidence checkpoint:** 26 October 2026. This guide describes this standalone destination, not authoring Site 170 or a ready-to-import Library package.

An orderly cinema product grid: restrained sans-serif headings, consistent package cards and a tier-comparison table. Home uses compact light feature cards; supporting Pages use the darker presentation.


**Color cleanup: scoped repairs verified.** Metropolis keeps its approved blue palette. The Theme fixes were saved and reopened, then checked on desktop and at 390px. Only the specific repairs and recorded states below are accepted; this is not full accessibility or launch certification.


## Quick fixes

- **Where do I change menu prices or photographs?** Use the native concession records, not a second HTML menu. [Menu & Bar](#menu-bar).
- **How do I change the highlighted private-event package?** Keep its featured-card class with the package. [Private Events](#private-events).
- **Why does a membership card disagree with the comparison table?** Update the same plan in both places. [Membership](#membership).
- **How do I keep the Films heading readable?** Retain native Heading Color: Default, which inherits the light section text. [Verified heading repair](#saved-color-repairs-and-current-check).
- **Where do I change contact details?** The location card, native form and contact-channel block are three separate pieces. [Visit and contact](#visit-and-contact).

## Use and ownership

Use this guide for an assigned support editor changing this design’s existing demo copy, menu, programme, links or approved palette. The template maintainer owns CSS, structural changes and failed role bindings. The content owner supplies real prices, benefits, venue facts and enquiry recipients. New-site provisioning, checkout enablement, Library transfer and publishing beyond the assigned request are separate work.

Before editing, have the requested change, current target access, a before screenshot and the actual current field/body/CSS retained. Theme and navigation saves can affect every Page immediately; they do not have a Page draft state. Keep Pages as drafts unless the current request authorizes their release.

## Find the correct Page and active Section

The Page/editable and Section identities below come from direct saved-field/native-row readbacks. The checkpoint had no pending publication on these seven Pages. Recheck the current row before editing; later cleanup can supersede its CSS.

Published Page IDs identify the inventory/live Page. Editable Page/Section IDs identify the normal editor. Do not infer one ID by adding an offset to another. Hidden inherited intro/news/original-home Sections remain retained; do not re-enable them to edit the active design.

| Page / route | Published Page | Editable Page | Active editable Sections (Name — Type — ID) |
| --- | ---: | ---: | --- |
| [Home](https://template-metropolis-indy-consumer.netlify.app/) | 6373 | 6416 | `Showtimes Hero` — Showtimes — **26732**<br>`Metropolis - Explore the Cinema` — Custom — **26733** |
| [Films](https://template-metropolis-indy-consumer.netlify.app/movie-lineup/) | 6346 | 6389 | `Metropolis - Films Introduction` — Custom — **26655**<br>`Movies - Explore Lineup` — Explore Movies — **26656**<br>`Movies - All Showtimes` — Showtimes — **26657** |
| [Menu & Bar](https://template-metropolis-indy-consumer.netlify.app/food-drink/) | 6345 | 6388 | `Food E - Catalogue` — Concessions Menu — **26654** |
| [Private Events](https://template-metropolis-indy-consumer.netlify.app/private-hire/) | 6351 | 6394 | `Events E - Packages` — Custom — **26669** |
| [Membership](https://template-metropolis-indy-consumer.netlify.app/membership/) | 6349 | 6392 | `Membership E - Tiers` — Custom — **26665** |
| [Visit & Contact](https://template-metropolis-indy-consumer.netlify.app/visit/) | 6342 | 6385 | `Find Us E - Location Card` — Custom — **26647**<br>`Contact E - Support Panel` — Generic Form — **26648**<br>`Contact E - Channels` — Custom — **26649** |
| [Events & Special Screenings](https://template-metropolis-indy-consumer.netlify.app/events-late-nights/) | 6350 | 6393 | `Metropolis - Events Programme` — Custom — **26667** |

Home’s recorded path is `/variant-e-grid/`; the site root opens its assigned Home. Public navigation should resolve locally to the seven routes above.

## Edit by native owner

### Navigation, Home and film listings

1. Verify the three context selectors match **US-BETA / INDY Demo / Metropolis**. Open **Settings → Website And Marketing → Pages**, then the exact inventory row above. Wait for its saved Title, slug and Section list to settle.
2. Edit link labels/destinations in **Navigations**. This is site-global. Check the desktop links and all seven phone-menu links; changing a Page body does not repair a global destination.
3. Keep `Showtimes Hero` first on Home and `Metropolis - Explore the Cinema` as the compact local feature block. The original full food/member/contact stack is hidden because those components now have dedicated Pages. Edit teaser text/links inside its existing Custom wrapper; do not paste all detailed sections back onto Home.
4. On Films, edit the Custom introduction separately from native **Explore Movies** and **Showtimes**. Programme titles, posters, dates and session times come from destination movie/showing data. A Page title or CSS edit does not add screenings. The demo is intentionally display-only; do not enable ticketing to fix a visual label.

### Menu & Bar

Keep the native Concessions Menu and its catalogue of image-and-description cards. The retained source structure has left-side category controls; it is a structural recipe, not a complete current destination settings export. Reopen the actual widget before changing View Mode, image/description switches or category position. Edit names, descriptions and prices in the local item records; the widget owns presentation and category/channel selection. Do not add photographs by changing Custom HTML. Distinguish the native items-per-row setting from the columns produced by Page CSS.

### Private Events

Edit `Events E - Packages` as Custom content. Preserve `.gr-pack`, `.gr-pack__grid`, each `.gr-pack__card`, the featured `gr-pack__card--best` class and `.gr-faq`. Change package headings, descriptions, prices and links inside their existing nodes. A featured card is class-based; copying an ordinary card does not automatically create another featured card. Keep enquiry actions on the local Visit Page.

### Membership

Edit `Membership E - Tiers` as Custom content. Preserve `.gr-mem`, `.gr-mem__grid`, `.gr-mem__card`, the featured modifier, and `.gr-mem__table`. When changing a plan, update its card and the matching comparison column together. This is editorial sample-plan content; changing this HTML does not create a purchasable membership.

### Visit and contact

Visit contains three active pieces: `Find Us E - Location Card` (Custom), `Contact E - Support Panel` (Generic Form), and `Contact E - Channels` (Custom). Edit the address/map link inside `.gr-loc`; edit telephone/email/hours labels inside `.gr-ch`. Those display links do not configure form delivery. Keep the inactive News Carousel hidden unless a separate content request requires it.

For the native form, edit its own heading/description and field records. The retained required fields are Name (Text), Email (Email) and What you have in mind (Notes). Displayed email/telephone links are separate from Notify/Submission Email routing. Delivery has not been certified by visual QA; do not send a real enquiry as a presentation test without explicit scope.

### Custom content and the footer

For a Custom Section, open its existing editor and **Edit Code** when needed. Retain the current body first. Change only the requested text/link nodes inside the maintained wrappers; do not paste generated consumer-page DOM, Vue/framework markup, a native form or another complete Page. Preserve the internal Section Name because its generated class is part of the saved CSS scope. Confirm the body survives a full Page close/reopen, not only the code-editor preview.

The site-wide footer is **Global Widgets → Footer → Full Width block → Display Items → Custom Text**. Its content contains the demo notice and six local links. Its presentation belongs to **Theme and Style → CSS**, not the individual Footer widget CSS field. Keep `.fdp-demo-footer` and its inner classes, including normal whitespace handling; the native Custom Text wrapper otherwise preserves source line breaks.

## Saved color repairs and current check

The current saved Theme (maintainer record) retains the earlier styling and adds narrow label fixes: **Today uses Background text on Dark**, and the **NR/rating chip uses Dark text on Secondary**, including its inner label. These roles are protected from broader date/movie text rules; do not replace them with a universal button color.

On Films, open Explore Movies Section **26656** and retain **Movies → Heading Color: Default**. It was changed from Primary, saved, reopened and published; Default inherits the light Background foreground. The native field readback (maintainer record) confirms the setting. No Page CSS was added for this heading; the prepared CSS alternative was not applied.

The saved-fix journal (maintainer record) and current acceptance record (maintainer record) retain the readbacks and scoped public checks. Seven current 390px route scans found no enabled solid-text candidates and retained the approved six palette values. Image/gradient captions are tracked separately: preserve the native dark gradient and light captions, and recheck loaded artwork rather than recoloring from the distant Page background. These checks do not certify every interaction, future content or palette. Older general QA reports keep their separate open boundaries.

The earlier rollout Theme baseline (maintainer record) is retained for comparison; use the current saved Theme above when examining this repair.

## Palette controls and examples

Change approved color values in **Theme and Style**. The current shell binds Header/Accent independently; do not follow the older Site 170 Dark/Secondary alias instructions. These examples identify the saved role wiring, not proof that every arbitrary color combination is legible. The scoped repairs below now have saved/public evidence; other colors, states and future palette choices still require their own check.

| Admin role | Where to look in this design |
| --- | --- |
| Primary | Main package/member actions and active-showtime tint/borders. The Explore Movies title now inherits Background through its native Default setting. |
| Secondary | Supporting outlines/highlights; native alternate/auth fills. Check the featured package and tier beside ordinary cards. |
| Header | Site-wide navigation band, including supporting Pages. |
| Accent | Header divider, decorative outlines/details and the status-style detail tokens retained by this design. |
| Dark | Supporting-Page ground and deep card surfaces; text on light action tints. |
| Background | Light text on dark supporting Pages and the light Home-feature surface. These are reciprocal uses, so inspect both. |

Buttons can deliberately use a light derived tint instead of solid Primary, with Dark lettering. Do not replace that protected pair with a hardcoded hex. The two picker checks cannot certify every tint, label, hover/focus state or image caption. On the native Showtimes hero, keep the caption backing/shadow treatment and review more than one film backdrop. Advanced status/splash/seat colors retain native semantics and need their own state checks.

Font choices exported by the picker are requested build settings, not proof that this live design already exposes three independent heading/body/interface font controls. A font change needs a verified native or scoped-module mapping and desktop/phone wrap checks; preserve Material Icons and other glyph fonts.

## Preserve the styling dependencies

| Owner | Keep with the component |
| --- | --- |
| Theme and Style → CSS | Current saved Site Theme (maintainer record): global header/drawer, footer, movie-action fixes, hero image/caption adjustments and Site-scoped Home teaser backgrounds. |
| Each Page → Custom Styles (CSS) | Use that role’s saved export, not a common latest proposal. Examples: Films (maintainer record), Membership (maintainer record), Visit (maintainer record). |
| Section settings | Native widget configuration, visibility/platform/scheduling, final internal Name/classes, and any actual saved Section CSS. A new Section ID does not transfer these automatically. |
| Custom body | Preserve the wrapper classes, card/row structure and local href values. Prepared body-reference manifest (maintainer record) helps compare source structure; proposals are not a substitute for the current saved editor body. |
| Shared footer | Reference HTML (maintainer record) plus the current Theme-owned styles; a copied HTML fragment alone is incomplete. |

The Home teaser has an extra Theme-owned longhand background layer because INDY’s compiled Custom CSS dropped background shorthand while retaining the text variables. If light text/ink seems to disappear, inspect the painted teaser/card surface and its `--home-ground` role before changing the palette. Preserve the whole scoped dependency rather than adding a per-client color override.

## Save and verify the change

1. Record the current Site/Page/Section identity and only the intended field owners. Keep the before body/CSS and screenshot so the maintainer can reverse the narrow change.
2. Edit the correct native fields or existing Custom nodes. Keep Section Names, native Type, required form settings and maintained wrapper classes stable for routine content edits.
3. Save, then wait for the settled saved state. Reopen the normal editable Page and compare the actual values/body. A disabled Save plus matching readback is evidence of saving; it does not prove publication.
4. Preview desktop and an actual 390px browser viewport. Admin’s Mobile Web button can narrow only a container while media queries still use the outer viewport. Wait for the logo/menu, actual widget content and images; a spinner, skeleton or blank captured frame is not finished evidence.
5. Check the affected route, Home, one other supporting Page, the shared footer and phone drawer if global settings changed. Follow enquiry links to the local Visit route; native routing can drop a fragment, so verify the destination form can be reached.
6. If the assigned request authorizes release, publish only the changed Page/widget rows and verify `published_with_changes` is cleared. Theme saves are immediate. Check the actual public URL after publication; routine Page release does not require a cache clear or manual hosting deploy. Otherwise stop with saved drafts and a review note.

## Troubleshoot without hiding the cause

| Symptom | First action |
| --- | --- |
| Explore title is hard to read | Open Explore Movies Section 26656 and retain Movies → Heading Color: Default. Confirm its inherited light text and publication state; do not change the blue palette or apply the unused heading CSS proposal. |
| Package/tier highlight moves or disappears | Check the `--best` modifier and wrapper structure; a card copied without that modifier is not featured. |
| Text disappears after a color change | Compare actual foreground and painted background, including derived tints and overlays. Retain the failed role/state and route for the maintainer; do not put a new hex into client CSS. |
| Custom block loses its layout | Check internal Name, wrapper classes and all Theme/Page/Section CSS owners. A visually similar HTML paste or changed Section name can break the generated scope. |
| Movie/food widget is empty | Check local catalogue/showing data, Website sales-channel/category binding, native visibility/device/schedule and settled loading. Do not manufacture data with Custom HTML or change commerce settings by assumption. |
| Live page shows the old style | Compare saved editable values with Page-row publication state and public output. A Theme Save, Page Publish and consumer deploy are separate operations. |
| Footer is very tall or has invisible links | Check the Theme-owned `.fdp-demo-footer` whitespace/foreground rules and the Custom Text body. Do not rely on the Footer widget CSS field to supply the shared presentation. |

## Duplicate, copy and Library limits

A duplicated native Page can retain the same slug. Use a separately authorized draft destination and a unique intended path, then read back the actual slug before release; do not publish a duplicate onto an existing route. Keep the current Home assignment and local navigation deliberate.

Copying a Section or an inner card is a structural edit until tested. Keep native settings, final Name/class scope, Custom body, Page styles, any Section styles and shared Theme dependencies together. Verify the repeated result on desktop/phone, including positional colors, links and independent editing. **No generic A–I cross-site copy/paste or Library portability claim is established by these standalone demos.**

The verified K Clubhouse Food pilot is a separate component. Library Add From Library creates a Page; it is not proof of direct insertion of one Section into an existing Page. An intended independent Library copy must be unlinked and read back as Not Linked before local edits. Page imports do not carry global navigation, Theme/footer settings or operational product/showing data automatically. Do not use Force Update as a styling repair.

## Close the support ticket

- Confirm the requested copy/prices/links and the correct local Page/Section IDs.
- Check native saved state, any authorized publication state, desktop/actual-phone text containment and current foreground/background pairs.
- Check product/category names and prices, changed CTA destinations, required form fields and shared navigation/footer where affected.
- Retain before/after screenshots, exact changed fields and readbacks, source versus destination IDs, and any open test boundary.
- State separately whether form delivery, memberships, ticket purchases, arbitrary palettes, additional card counts or Library/cross-site transfer were tested. They are not certified by a visual pass.

## Open verification and evidence

The earlier “EXPLORE THE LINEUP” finding at about 2.01:1 is superseded by the saved, reopened and published native Heading Color: Default correction. Its observed foreground matches Background; the current Background/Dark pair calculates about 12.48:1. This title repair does not certify all image captions, interaction states or future palettes.

This guide was updated offline from the current operator’s native readbacks and public checks. Its scoped repair acceptance does not replace the separate open tests or make an older QA report current.

- Current native identity/provenance record (maintainer record).
- Saved Page export summary (maintainer record) and repair journal (maintainer record).
- Native food structure evidence (maintainer record); some complete editor values remain unrecorded, so inspect the real widget before changing dormant numeric settings.
- Phone image review ledger (maintainer record) and auth-button measurements (maintainer record). These are bounded checkpoint evidence, not current all-state accessibility certification.
