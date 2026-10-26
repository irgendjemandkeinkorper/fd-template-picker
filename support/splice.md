> Published support guide. Raw maintainer audit records are retained separately. Reviewed October 26, 2026.

# Splice — support guide

**Status: Current-site working guide; launch QA remains a separate decision.**
**Target:** US-BETA → INDY Demo → Splice · Site **189** · [Open demo](https://template-splice-indy-consumer.netlify.app/)
**Evidence checkpoint:** 26 October 2026. This guide describes this standalone destination, not authoring Site 170 or a ready-to-import Library package.

A poster-like cinema design with large display type, angled panels and alternating tinted tiles. Private hire uses a diagonal stack; membership is a three-card poster pass.


**Color cleanup: scoped repairs verified.** Splice keeps its approved violet palette. The Theme fixes were saved and reopened, then checked on desktop and at 390px. Only the specific repairs and recorded states below are accepted; this is not full accessibility or launch certification.


## Quick fixes

- **Why do food tiles have no pictures or descriptions?** The text-only tile wall is intentional; a completely blank page still needs a loading/data check. [Menu & Bar](#menu-bar).
- **Can I change the angle of a private-event card?** Its slope is a maintained style preset, not a demonstrated Admin angle control. [Private Events](#private-events).
- **Why do the second and third membership cards look different?** Their order controls the current tints and layout. [Poster-pass membership](#membership).
- **Where do I change the two-tone contact area?** Edit the native form separately from the Visit information cards. [Visit and contact](#visit-and-contact).
- **Why do Today and NR use different ink?** Preserve light text on the dark date badge and Dark text on the lighter rating chip. [Verified label pairs](#saved-color-repairs-and-current-check).

## Use and ownership

Use this guide for an assigned support editor changing this design’s existing demo copy, menu, programme, links or approved palette. The template maintainer owns CSS, structural changes and failed role bindings. The content owner supplies real prices, benefits, venue facts and enquiry recipients. New-site provisioning, checkout enablement, Library transfer and publishing beyond the assigned request are separate work.

Before editing, have the requested change, current target access, a before screenshot and the actual current field/body/CSS retained. Theme and navigation saves can affect every Page immediately; they do not have a Page draft state. Keep Pages as drafts unless the current request authorizes their release.

## Find the correct Page and active Section

The IDs below are retained native build reports and saved-CSS row audits, not a fresh browser read by this guide author. Do not promote unresolved public/field flags merely because a local CSS file exists. Hidden historical Home names remain incomplete where the native record says so.

Published Page IDs identify the inventory/live Page. Editable Page/Section IDs identify the normal editor. Do not infer one ID by adding an offset to another. Hidden inherited intro/news/original-home Sections remain retained; do not re-enable them to edit the active design.

| Page / route | Published Page | Editable Page | Active editable Sections (Name — Type — ID) |
| --- | ---: | ---: | --- |
| [Home](https://template-splice-indy-consumer.netlify.app/) | 6461 | 6504 | `Showtimes Hero` — Showtimes — **28057**<br>`Splice - Explore the Cinema` — Custom — **27068** |
| [Films](https://template-splice-indy-consumer.netlify.app/movie-lineup/) | 6432 | 6475 | `Splice - Films Introduction` — Custom — **26971**<br>`Movies - Explore Lineup` — Explore Movies — **26972**<br>`Movies - All Showtimes` — Showtimes — **26973** |
| [Menu & Bar](https://template-splice-indy-consumer.netlify.app/food-drink/) | 6431 | 6474 | `Food G - Colour Tile Wall` — Concessions Menu — **26970** |
| [Private Events](https://template-splice-indy-consumer.netlify.app/private-hire/) | 6437 | 6480 | `Events G - Diagonal Stack` — Custom — **26985** |
| [Membership](https://template-splice-indy-consumer.netlify.app/membership/) | 6435 | 6478 | `Membership G - Poster Pass` — Custom — **26981** |
| [Visit & Contact](https://template-splice-indy-consumer.netlify.app/visit/) | 6428 | 6471 | `Splice - Visit Information` — Custom — **26963**<br>`Contact G - Two Tone Split` — Generic Form — **26964** |
| [Events & Special Screenings](https://template-splice-indy-consumer.netlify.app/events-late-nights/) | 6436 | 6479 | `Splice - Events Programme` — Custom — **26983** |

Home’s recorded path is `/variant-g-cut/`; the site root opens its assigned Home. Public navigation should resolve locally to the seven routes above.

## Edit by native owner

### Navigation, Home and film listings

1. Verify the three context selectors match **US-BETA / INDY Demo / Splice**. Open **Settings → Website And Marketing → Pages**, then the exact inventory row above. Wait for its saved Title, slug and Section list to settle.
2. Edit link labels/destinations in **Navigations**. This is site-global. Check the desktop links and all seven phone-menu links; changing a Page body does not repair a global destination.
3. Keep `Showtimes Hero` first on Home and `Splice - Explore the Cinema` as the compact local feature block. The original full food/member/contact stack is hidden because those components now have dedicated Pages. Edit teaser text/links inside its existing Custom wrapper; do not paste all detailed sections back onto Home.
4. On Films, edit the Custom introduction separately from native **Explore Movies** and **Showtimes**. Programme titles, posters, dates and session times come from destination movie/showing data. A Page title or CSS edit does not add screenings. The demo is intentionally display-only; do not enable ticketing to fix a visual label.

### Menu & Bar

Keep `Food G - Colour Tile Wall` as a native Concessions Menu. The retained source structure has text-only cards and top category buttons; inspect the current widget before changing its display switches or filter position. The two-column phone tile treatment is deliberate. Names and visible prices fit the reviewed sample data; longer names, price ranges or extra options need another phone check. Do not enable photos to “fill” the text tiles. Food-tile alternation uses positional selectors, so inserting/reordering products can change which color a tile receives.

### Private Events

Edit `Events G - Diagonal Stack` as Custom content. Preserve `.cut-events`, whole `.cut-event` articles and their semantic modifier classes. Edit the visible title, supporting text and Enquire action inside the existing article. The slope is a maintained layout preset; it is not an independently verified angle control in Admin. Reordering cards can affect positional tint rules.

### Membership

Edit `Membership G - Poster Pass` as Custom content, not the historical Text Block editor. Preserve `.fdp-content`, `.fdp-grid` and each complete `.fdp-card`. The current recipe treats the second and third cards specially with Secondary/Primary-derived light tints and Dark copy. Keep the three-card structure for routine edits; an appended fourth card is not certified to inherit the intended color/angle cycle. The action is an enquiry, not connected membership checkout.

### Visit and contact

Edit `Splice - Visit Information` Custom content for the clearly labelled sample address, practical-information cards and links. Keep `Contact G - Two Tone Split` as a native Generic Form. Preserve its split-color heading/field presentation and the three full-width required fields. The inherited news widgets are hidden and are not the enquiry form.

For the native form, edit its own heading/description and field records. The retained required fields are Name (Text), Email (Email) and What you have in mind (Notes). Displayed email/telephone links are separate from Notify/Submission Email routing. Delivery has not been certified by visual QA; do not send a real enquiry as a presentation test without explicit scope.

### Custom content and the footer

For a Custom Section, open its existing editor and **Edit Code** when needed. Retain the current body first. Change only the requested text/link nodes inside the maintained wrappers; do not paste generated consumer-page DOM, Vue/framework markup, a native form or another complete Page. Preserve the internal Section Name because its generated class is part of the saved CSS scope. Confirm the body survives a full Page close/reopen, not only the code-editor preview.

The site-wide footer is **Global Widgets → Footer → Full Width block → Display Items → Custom Text**. Its content contains the demo notice and six local links. Its presentation belongs to **Theme and Style → CSS**, not the individual Footer widget CSS field. Keep `.fdp-demo-footer` and its inner classes, including normal whitespace handling; the native Custom Text wrapper otherwise preserves source line breaks.

## Saved color repairs and current check

The current saved Theme (maintainer record) retains the earlier styling and adds narrow label fixes: **Today uses Background text on Dark**, and the **NR/rating chip uses Dark text on Secondary**, including its inner label. These roles are protected from broader date/movie text rules; do not replace them with a universal button color.

Keep the violet tile wall and positional membership tints. The repair changes the native label foregrounds, not the diagonal card structures or the three-card membership recipe.

The saved-fix journal (maintainer record) and current acceptance record (maintainer record) retain the readbacks and scoped public checks. Seven current 390px route scans found no enabled solid-text candidates and retained the approved six palette values. Image/gradient captions are tracked separately: preserve the native dark gradient and light captions, and recheck loaded artwork rather than recoloring from the distant Page background. These checks do not certify every interaction, future content or palette. Older general QA reports keep their separate open boundaries.

The earlier rollout Theme baseline (maintainer record) is retained for comparison; use the current saved Theme above when examining this repair.

## Palette controls and examples

Change approved color values in **Theme and Style**. The current shell binds Header/Accent independently; do not follow the older Site 170 Dark/Secondary alias instructions. These examples identify the saved role wiring, not proof that every arbitrary color combination is legible. The scoped repairs below now have saved/public evidence; other colors, states and future palette choices still require their own check.

| Admin role | Where to look in this design |
| --- | --- |
| Primary | Rust/poster accent alias, main actions, a primary-derived membership-card tint and part of the food/contact alternation. |
| Secondary | The alternate food/private-hire tint and the second membership-card tint. |
| Header | The global navigation band on Home and every supporting Page. |
| Accent | Poster-detail accent alias, header divider and selected decorative rules. Not every card fill uses Accent. |
| Dark | Poster ink and the deep membership surface; Dark copy on pale featured cards. |
| Background | Bone/paper surfaces and light copy on deep panels. Tints blend Primary/Secondary into this surface. |

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
| A copied member card has a different color | The second/third card rules are positional. Preserve the known three-card wrapper; ask the template maintainer to review additional cards rather than adding a hex override. |
| Food photos/descriptions are missing | That is the saved native design setting. Check the local item data separately; do not enable those controls as a layout repair. |
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

Earlier phone snapshots caught a blank/loading Food Page and muted membership content; their settled replacements were reviewed. The retained menu/member text fits the sample data. The current color repair acceptance is separately recorded above and does not certify longer replacement copy or extra cards.

This guide was updated offline from the current operator’s native readbacks and public checks. Its scoped repair acceptance does not replace the separate open tests or make an older QA report current.

- Current native identity/provenance record (maintainer record).
- Saved Page export summary (maintainer record) and repair journal (maintainer record).
- Native food structure evidence (maintainer record); some complete editor values remain unrecorded, so inspect the real widget before changing dormant numeric settings.
- Phone image review ledger (maintainer record) and auth-button measurements (maintainer record). These are bounded checkpoint evidence, not current all-state accessibility certification.
