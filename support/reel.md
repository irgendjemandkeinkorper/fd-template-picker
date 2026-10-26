> Published support guide. Raw maintainer audit records are retained separately. Reviewed October 26, 2026.

# Reel — support guide

**Target:** US-BETA → INDY Demo → **Reel, Site 185**<br>
**Public demo:** [Reel](https://template-reel-indy-consumer.netlify.app/)<br>
**Owner:** Website Support handles copy and links; the template maintainer handles layout/CSS; the programming or commerce owner handles underlying movie, showing and product records.<br>
**Evidence checkpoint:** 26 October 2026. Only this standalone Site is covered.


**Color cleanup: scoped repairs verified.** Reel keeps its approved burgundy/paper palette. The Theme fixes were saved and reopened, then checked on desktop and at 390px. Only the specific repairs and recorded states below are accepted; this is not full accessibility or launch certification.


## Quick fixes

- **Why are food photographs suddenly huge?** Check the native List layout before changing image styles. [Printed-menu fix](#printed-menu-preserve-the-native-horizontal-structure).
- **Where do I change private-hire wording?** Use the current Custom Section, not the older Text Block instructions. [Private-hire editor](#private-hire-use-the-current-custom-editor).
- **Where do I change subscription prices or benefits?** Keep each subscriber tier and its rewards information consistent. [Subscriber bill](#subscriber-bill-and-visit-details).
- **How do I change the centered header links?** Edit the global navigation, then check the phone menu too. [Navigation instructions](#navigation-and-homepage-links).
- **Why do Today and the rating chip use different text colors?** Today needs light ink on Dark; the rating needs Dark ink on Secondary. [Verified label pairs](#saved-color-repairs-and-current-check).

## Locate the current Page and editor

Reel uses centered, stacked navigation, a native Showtimes opener, a printed horizontal food menu and a subscriber-bill membership layout. Its homepage now contains short feature links; it is not the editor for every detailed section.

1. Select **US-BETA → INDY Demo → Reel** and confirm Site **185**.
2. Open **Settings → Website And Marketing → Pages**. Match the row ID, retained Title and slug below.
3. Choose **Edit** and confirm the editable Page ID in the dialog.
4. Open the matching named Section. Preserve the internal Name; it is part of the generated CSS scope. Edit public copy in its widget instead.

| Page / retained Admin Title | Route | Published Page | Editable Page | Exact saved Page CSS |
| --- | --- | ---: | ---: | --- |
| Home / `Variant B Rep` | `/` → `/variant-b-rep/` | 6110 | 6153 | Home (maintainer record) |
| `Movie Lineup` | `/movie-lineup/` | 6088 | 6131 | Films (maintainer record) |
| `Food Drink` | `/food-drink/` | 6087 | 6130 | Food (maintainer record) |
| `Private Hire` | `/private-hire/` | 6093 | 6136 | Private hire (maintainer record) |
| `Membership` | `/membership/` | 6091 | 6134 | Membership (maintainer record) |
| `Visit` | `/visit/` | 6084 | 6127 | Visit (maintainer record) |
| `Events Late Nights` | `/events-late-nights/` | 6092 | 6135 | Events (maintainer record) |

The final native readback (maintainer record) records saved fields and published/no-pending-change indicators. It supersedes the older before-state type descriptions. The public map (maintainer record) separately identifies the rendered IDs.

| Page | Exact internal Name | Current Type | Editable Section | Published Section |
| --- | --- | --- | ---: | ---: |
| Home | `Showtimes Hero` | Showtimes | 25756 | 25598 |
| Home | `Reel - Explore the Cinema` | Custom | 25754 | 25596 |
| Films | `Reel - Films Introduction` | Custom | 25707 | 25549 |
| Films | `Movies - Explore Lineup` | Explore Movies | 25708 | 25550 |
| Films | `Movies - All Showtimes` | Showtimes | 25709 | 25551 |
| Food | `Food B - Printed Menu` | Concessions Menu | 25706 | 25548 |
| Private hire | `Private Parties B - Your Own Evening` | **Custom** | 25721 | 25563 |
| Membership | `Membership B - Subscriber Bill` | Custom | 25717 | 25559 |
| Visit | `Find Us B - Street Plate` | Custom | 25699 | 25541 |
| Visit | `Contact B - Split Desk` | Generic Form | 25700 | 25542 |
| Events | `Reel - Events Programme` | Custom | 25719 | 25561 |

## Make the requested content change

### Navigation and homepage links

Use **Navigations** for the seven local header destinations and **Theme & Style** for its appearance. Reel’s Header role colors menu lettering on a paper band; it does not mean the whole band should become dark. Check the centered desktop menu and the phone drawer separately.

Edit Custom Section **25754** for “More than a screening.” and its four feature teasers. Keep the `fdp-home-links--reel` modifier and child classes. Card URLs should stay local: Food, Private Events, Membership and Visit. The two programme links lead to `/events-late-nights/` and `/movie-lineup/`. Edit the detailed copy on those destination Pages independently.

### Showtimes and film details

Use Showtimes **25756** for the opening widget’s layout and filters. Keep `fdp-showtimes-hero`. Movie art, synopsis and sessions come from native movie/showing records, not from the old hidden “Plate and Note” carousel. The Films Page has its own Explore Movies and All Showtimes widgets; compare their filters and eligible programmed data when their contents differ.

A missing session requires checks of dates, movie visibility, published showings and channel eligibility. The retained demonstration schedule can expire. The demo intentionally does not open ticket selection; this is not a reason to enable online ticketing during a visual support check.

### Printed menu: preserve the native horizontal structure

Open Concessions Menu **25706**. Change the heading and category/widget controls there, and edit item names, descriptions, photos, variations and prices in the Site’s concession records. Do not reproduce the menu as Custom HTML.

Reel’s source recipe requires native **List / horizontal cards**. Its selectors expect `sidebar-container`, `frame-item-image` and `item-info`; applying that skin to generic vertical cards produced oversized photographs. The native source settings capture (maintainer record) records View Mode **List**, Website channel and left category filters; it is a recipe reference, not a fresh export of every destination dropdown. Reopen the current destination widget before correcting a mismatch. The current standalone menu was publicly observed as horizontal cards.

Check a full long description, every complete currency string, category jumps and image crop on desktop and phone. If an item is missing entirely, inspect its Item/Category channel and conditions before changing layout.

### Private hire: use the current Custom editor

Open **25721**, Type **Custom**. The public heading is “Make it your occasion.” with Celebrations, Private screenings and Company nights. Earlier Text Block instructions do not describe this current Section.

Edit the occasion introduction, individual editorial blocks and `/visit/#contact` enquiry links together. Keep the `fdp-b-private-parties` structure. Its restored component styling is included in Reel’s **Private Hire Page CSS**, which differs from Food/Membership and from Films/Visit. Losing that Page-specific layer can leave correctly saved content visually plain.

### Subscriber bill and visit details

Open Membership Custom **25717** for Parterre, Balcony, Circle, rewards figures and the explanatory subscription paragraph. Preserve `.mbb`, `.mbb__tier`, `.mbb__tcol`, `.mbb__bcol`, `.mbb__list` and the points definition-list structure. Edit a whole tier’s name, price, benefits and enquiry destination consistently. This display does not configure native Membership Types or grant benefits.

Open Street Plate **25699** for the sample address, map and Hours / Getting here / Parking / Access text. The address is deliberately fictional demo content; replace both the displayed address and map destination for a real venue. A map’s external load failure is separate from the local address and contact form.

Open Generic Form **25700** for “Talk to Reel”, introduction and native fields. Retain required Name/Text, Email/Email and What you have in mind/Notes fields with Full Width layout. Notification recipients and actual delivery are outside the visual verification; configure and test them only as a separate approved task.

Edit Custom **25719** for the Events Page’s Classic favourites / Family screenings / Late nights programme. This content links to Films. It is distinct from Private Hire.

## Saved color repairs and current check

The current saved Theme (maintainer record) retains the earlier styling and adds narrow label fixes: **Today uses Background text on Dark**, and the **NR/rating chip uses Dark text on Secondary**, including its inner label. These roles are protected from broader date/movie text rules; do not replace them with a universal button color.

Keep Reel’s original paper and burgundy treatment. The repair protects the Today/rating labels without turning its menu, subscriber bill or editorial actions into another design.

The saved-fix journal (maintainer record) and current acceptance record (maintainer record) retain the readbacks and scoped public checks. Seven current 390px route scans found no enabled solid-text candidates and retained the approved six palette values. Image/gradient captions are tracked separately: preserve the native dark gradient and light captions, and recheck loaded artwork rather than recoloring from the distant Page background. These checks do not certify every interaction, future content or palette. Older general QA reports keep their separate open boundaries.

The earlier rollout Theme baseline (maintainer record) is retained for comparison; use the current saved Theme above when examining this repair.

## Maintain the color and CSS layers

| Native role | Preserved value | Reel example |
| --- | --- | --- |
| Primary | `#8E344A` | Burgundy action edges/underlines and intentionally tinted primary buttons. |
| Secondary | `#DFB2BA` | Soft supporting highlights, number chips and active-drawer detail. |
| Header | `#34202C` | Header menu lettering on the light band. |
| Accent | `#BD8055` | Header bottom rule and decorative editorial/menu rules. |
| Dark | `#30232A` | Headings and body ink on paper, form text and focus outlines. |
| Background | `#FAF4EF` | Paper surfaces; light text where a dark surface requires it. |

These are the preserved demo palette values (maintainer record). Routine recoloring belongs in **Theme & Style**, not in newly inserted hex values. The current saved Theme (maintainer record) supplies the global header, footer, phone auth correction, native hero backdrop fit and `.fdp-home-links` background-color repair.

Use the exact saved Page CSS for the Page being repaired. Do not replace Reel Private Hire with Food’s CSS, or assume the newest common proposal was already saved everywhere. Native Section settings own visibility, platforms, margins, width and Classes; a Custom block’s own style rules can also remain dependencies. The Page readback did not export every Section setting.

The site-wide footer is native **Footer widget 38**, confirmed in the footer record (maintainer record). Edit its content at **Global Widgets → Footer → Full Width block → Display Items → Custom Text**. Preserve the `fdp-demo-footer--reel` wrapper and six local links. Its double rule, typography, white-space reset and ink belong in Theme CSS, not widget Gear CSS.

## Common support cases

| Symptom | Action |
| --- | --- |
| Food photograph fills a giant vertical card | Recheck the native List/horizontal structure first. Correcting a structural widget setting is different from reducing image width with more CSS. |
| Private hire has lost its editorial layout | Confirm Section 25721 is still Custom, its internal Name is unchanged, its wrapper remains intact, and Page 6093 has its own saved CSS. |
| Teasers appear dark-on-dark or transparent | Check the Theme’s longhand `.fdp-home-links` background-color rule. Native serialization previously stripped the equivalent shorthand. Verify painted output after a save. |
| Phone Log In text disappears | Keep the scoped saved `/login` foreground repair, including the inner label/icon selectors. A readable link list does not prove the auth buttons are readable. |
| Form or film-search text differs from another supporting Page | Compare the exact saved Page versions and publication indicators. Current exports intentionally retain different revisions on some roles. |
| Enquiry link reaches Visit but not the form anchor | The native router can drop `/visit/#contact`’s hash. Verify the destination and record the behavior rather than claiming automatic focus. |

## Copy safely and close the ticket

Reel’s native menu repeats item styling from native data. Custom tier/occasion duplication is not a verified no-code installation path: copying text alone loses wrappers, and copying HTML alone loses Page/Section/Theme dependencies. Any trial belongs in a new authorized draft with source/destination IDs retained and the complete native widget settings recorded. Check whether a Custom Block is shared before changing its content.

Library Page import, inserting a single Section into an existing Page, synchronization, and independent local editing are separate capabilities. This standalone build does not certify them for Reel. Verify a copy is truly local/unlinked before local customization; do not use Force Update as a styling fix.

Before closing, reopen saved fields, inspect publication, then check all seven routes on desktop and 390px. Verify the entire printed menu, all subscriber tiers/rewards, all private-hire links, the phone drawer and auth labels, the full footer and three form fields without submitting. Retain before/after evidence. Arbitrary palettes, font-role application, real-device coverage, checkout, delivery and full accessibility compliance require separate verification.

**Evidence:** native saved readback (maintainer record), public ID map (maintainer record), current QA checkpoint (maintainer record), phone-route checkpoint (maintainer record), auth proof (maintainer record). QA still lists deferred clean/current desktop captures; this guide does not silently promote them.
