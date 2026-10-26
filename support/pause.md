> Published support guide. Raw maintainer audit records are retained separately. Reviewed October 26, 2026.

# Pause — support guide

**Status: Current-site working guide; launch QA remains a separate decision.**
**Target:** US-BETA → INDY Demo → Pause · Site **192** · [Open demo](https://template-pause-indy-consumer.netlify.app/)
**Evidence checkpoint:** 26 October 2026. This guide describes this standalone destination, not authoring Site 170 or a ready-to-import Library package.

A quiet cinema design built around generous whitespace, fine dividers, small numbered rows and restrained serif headings. Food and memberships use sparse, wide rows; the contact form uses underlined fields.


**Color cleanup: scoped repairs verified.** Pause keeps its approved slate palette. The Theme fixes were saved and reopened, then checked on desktop and at 390px. Only the specific repairs and recorded states below are accepted; this is not full accessibility or launch certification.


## Quick fixes

- **Why is the food page so spacious and image-free?** Wide gaps and hidden image nodes are part of this design; check loaded items before changing it. [Menu & Bar](#menu-bar).
- **Why does the membership action have no filled button?** Its transparent, underlined treatment is intentional. [Quiet Return membership](#membership).
- **Can I tighten the gaps between private occasions?** Those gaps belong to the maintained layout, not ordinary copy editing. [Private Events](#private-events).
- **Why is the contact introduction clipped?** Retain the Visit-only form-spacing correction. [Visit and contact](#visit-and-contact).
- **Why were food descriptions too faint?** Keep the existing muted ink role at opacity 1; an extra fade was removed. [Verified description repair](#saved-color-repairs-and-current-check).

## Use and ownership

Use this guide for an assigned support editor changing this design’s existing demo copy, menu, programme, links or approved palette. The template maintainer owns CSS, structural changes and failed role bindings. The content owner supplies real prices, benefits, venue facts and enquiry recipients. New-site provisioning, checkout enablement, Library transfer and publishing beyond the assigned request are separate work.

Before editing, have the requested change, current target access, a before screenshot and the actual current field/body/CSS retained. Theme and navigation saves can affect every Page immediately; they do not have a Page draft state. Keep Pages as drafts unless the current request authorizes their release.

## Find the correct Page and active Section

The IDs below are retained native build reports and saved-CSS row audits, not a fresh browser read by this guide author. Do not promote unresolved public/field flags merely because a local CSS file exists. Hidden historical Home names remain incomplete where the native record says so.

Published Page IDs identify the inventory/live Page. Editable Page/Section IDs identify the normal editor. Do not infer one ID by adding an offset to another. Hidden inherited intro/news/original-home Sections remain retained; do not re-enable them to edit the active design.

| Page / route | Published Page | Editable Page | Active editable Sections (Name — Type — ID) |
| --- | ---: | ---: | --- |
| [Home](https://template-pause-indy-consumer.netlify.app/) | 6721 | 6764 | `Showtimes Hero` — Showtimes — **28061**<br>`Pause - Explore the Cinema` — Custom — **28026** |
| [Films](https://template-pause-indy-consumer.netlify.app/movie-lineup/) | 6690 | 6733 | `Pause - Films Introduction` — Custom — **27919**<br>`Movies - Explore Lineup` — Explore Movies — **27920**<br>`Movies - All Showtimes` — Showtimes — **27921** |
| [Menu & Bar](https://template-pause-indy-consumer.netlify.app/food-drink/) | 6689 | 6732 | `Food I - Few Items Wide Margins` — Concessions Menu — **27918** |
| [Private Events](https://template-pause-indy-consumer.netlify.app/private-hire/) | 6695 | 6738 | `Events I - One Occasion at a Time` — Custom — **27933** |
| [Membership](https://template-pause-indy-consumer.netlify.app/membership/) | 6693 | 6736 | `Membership I - Quiet Return` — Custom — **27929** |
| [Visit & Contact](https://template-pause-indy-consumer.netlify.app/visit/) | 6686 | 6729 | `Pause - Visit Information` — Custom — **27911**<br>`Contact I - One Question at a Time` — Generic Form — **27912** |
| [Events & Special Screenings](https://template-pause-indy-consumer.netlify.app/events-late-nights/) | 6694 | 6737 | `Pause - Events Programme` — Custom — **27931** |

Home’s recorded path is `/variant-i-ma/`; the site root opens its assigned Home. Public navigation should resolve locally to the seven routes above.

## Edit by native owner

### Navigation, Home and film listings

1. Verify the three context selectors match **US-BETA / INDY Demo / Pause**. Open **Settings → Website And Marketing → Pages**, then the exact inventory row above. Wait for its saved Title, slug and Section list to settle.
2. Edit link labels/destinations in **Navigations**. This is site-global. Check the desktop links and all seven phone-menu links; changing a Page body does not repair a global destination.
3. Keep `Showtimes Hero` first on Home and `Pause - Explore the Cinema` as the compact local feature block. The original full food/member/contact stack is hidden because those components now have dedicated Pages. Edit teaser text/links inside its existing Custom wrapper; do not paste all detailed sections back onto Home.
4. On Films, edit the Custom introduction separately from native **Explore Movies** and **Showtimes**. Programme titles, posters, dates and session times come from destination movie/showing data. A Page title or CSS edit does not add screenings. The demo is intentionally display-only; do not enable ticketing to fix a visual label.

### Menu & Bar

Keep `Food I - Few Items Wide Margins` as a native Concessions Menu. Retained native settings are Grid, images on, descriptions on, Left category filters and H2. The design CSS deliberately hides the native image nodes and expands items into sparse rows. Therefore an image-free screenshot does not mean Show Images is off. Preserve the larger category/item gaps; assess actual scrolling and loaded items before diagnosing the whitespace as empty content.

### Private Events

Edit `Events I - One Occasion at a Time` as Custom content. Preserve `.ma-events`, complete `.ma-occasion` articles and `.ma-occasion__number`. Large vertical spacing and fine top rules are intentional. Routine copy edits should not change the article order, wrapper or spacing rules. Enquiry links belong on the local Visit Page.

### Membership

Edit `Membership I - Quiet Return` as Custom content rather than the older Text Block. Preserve `.fdp-content`, `.fdp-quiet`, the kicker and each `.fdp-quiet-row` with its `.fdp-number`. Keep the sample plan heading, price/interval and benefits together in the same row. The quiet action is transparent and underlined by design; do not turn it into a filled button to match another template.

### Visit and contact

Edit `Pause - Visit Information` for the labelled sample address and practical-information cards. Edit `Contact I - One Question at a Time` as the native Generic Form. Keep the three required Full Width fields and their underlined treatment. Visit Page 6686 has its own saved native field-row gutter correction `margin:16px 0 0`, which separates the introduction and aligns field edges; retain that exact per-role Page CSS.

For the native form, edit its own heading/description and field records. The retained required fields are Name (Text), Email (Email) and What you have in mind (Notes). Displayed email/telephone links are separate from Notify/Submission Email routing. Delivery has not been certified by visual QA; do not send a real enquiry as a presentation test without explicit scope.

### Custom content and the footer

For a Custom Section, open its existing editor and **Edit Code** when needed. Retain the current body first. Change only the requested text/link nodes inside the maintained wrappers; do not paste generated consumer-page DOM, Vue/framework markup, a native form or another complete Page. Preserve the internal Section Name because its generated class is part of the saved CSS scope. Confirm the body survives a full Page close/reopen, not only the code-editor preview.

The site-wide footer is **Global Widgets → Footer → Full Width block → Display Items → Custom Text**. Its content contains the demo notice and six local links. Its presentation belongs to **Theme and Style → CSS**, not the individual Footer widget CSS field. Keep `.fdp-demo-footer` and its inner classes, including normal whitespace handling; the native Custom Text wrapper otherwise preserves source line breaks.

## Saved color repairs and current check

The current saved Theme (maintainer record) retains the earlier styling and adds narrow label fixes: **Today uses Background text on Dark**, and the **NR/rating chip uses Dark text on Secondary**, including its inner label. These roles are protected from broader date/movie text rules; do not replace them with a universal button color.

Food descriptions now use the existing muted ink role—85% Dark mixed with 15% Background—at **opacity 1**. This removes the extra fade without changing the slate palette or the sparse menu. The current Food scan (maintainer record) records the repaired state. Retain the Visit-only form-spacing stylesheet separately.

The saved-fix journal (maintainer record) and current acceptance record (maintainer record) retain the readbacks and scoped public checks. Seven current 390px route scans found no enabled solid-text candidates and retained the approved six palette values. Image/gradient captions are tracked separately: preserve the native dark gradient and light captions, and recheck loaded artwork rather than recoloring from the distant Page background. These checks do not certify every interaction, future content or palette. Older general QA reports keep their separate open boundaries.

The earlier rollout Theme baseline (maintainer record) is retained for comparison; use the current saved Theme above when examining this repair.

## Palette controls and examples

Change approved color values in **Theme and Style**. The current shell binds Header/Accent independently; do not follow the older Site 170 Dark/Secondary alias instructions. These examples identify the saved role wiring, not proof that every arbitrary color combination is legible. The scoped repairs below now have saved/public evidence; other colors, states and future palette choices still require their own check.

| Admin role | Where to look in this design |
| --- | --- |
| Primary | The small seal/square motif and selected action/underline accents; the quiet membership action remains transparent. |
| Secondary | Native alternate surfaces, including the phone Sign Up button and subtle supporting fills. |
| Header | The shared navigation band. |
| Accent | Global header/footer detail rules and approved fine accents; ordinary hairlines also derive from Dark. |
| Dark | Main text, numbered rows, fine dividers and underlined form fields. |
| Background | The wide paper/negative-space ground and light text on the dark shell. |

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
| The food page looks empty above its first item | Wait for native content, then scroll through the full category. Large margins are intentional; compare loaded item count and category selector before changing spacing. |
| Contact introduction is clipped | Keep the Visit-only field-row margin correction and full-width field settings. Do not replace Page 6686 CSS with another role’s stylesheet. |
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

An earlier Films phone still caught date chips across poster tops during a transient capture; its settled replacement did not show that overlap. No native layout correction was inferred from the old still. Current label and Food-description color repairs are accepted only within the recorded scope above.

This guide was updated offline from the current operator’s native readbacks and public checks. Its scoped repair acceptance does not replace the separate open tests or make an older QA report current.

- Current native identity/provenance record (maintainer record).
- Saved Page export summary (maintainer record) and repair journal (maintainer record).
- Native food structure evidence (maintainer record); some complete editor values remain unrecorded, so inspect the real widget before changing dormant numeric settings.
- Phone image review ledger (maintainer record) and auth-button measurements (maintainer record). These are bounded checkpoint evidence, not current all-state accessibility certification.
