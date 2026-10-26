> Published support guide. Raw maintainer audit records are retained separately. Reviewed October 26, 2026.

# Neon — support guide

**Target:** US-BETA → INDY Demo → **Neon, Site 186**<br>
**Public demo:** [Neon](https://template-neon-indy-consumer.netlify.app/)<br>
**Owner:** Website Support edits content and links; the template maintainer owns layout/CSS; programming and commerce owners maintain the underlying movie/showing/item data.<br>
**Evidence checkpoint:** 26 October 2026. This is the current standalone demo guide.


**Color cleanup: scoped repairs verified.** Neon keeps its approved teal/lime palette. The Theme fixes were saved and reopened, then checked on desktop and at 390px. Only the specific repairs and recorded states below are accepted; this is not full accessibility or launch certification.


## Quick fixes

- **Where do I change the food tiles?** Edit native concession items and keep their category controls. [Tile-wall menu](#tile-wall-food-menu).
- **Where do I change the four private-event tickets?** Edit Ticket Stack, not the separate Events programme. [Private occasions](#ticket-stack-private-occasions).
- **Why do a membership card and its benefit table disagree?** Both representations need the same edit. [Cards and benefit ledger](#membership-cards-and-benefit-ledger).
- **Why are showtimes missing?** Check programmed dates and visible sessions before changing the dark design. [Film discovery checks](#film-discovery-and-missing-showtimes).
- **How do I keep the Films heading readable?** Retain its native Heading Color setting of Default; no extra heading CSS is needed. [Verified heading repair](#saved-color-repairs-and-current-check).

## Find the live editing target

Neon combines a dark minimal navigation rail, native Showtimes opening, ticket-shaped occasion cards, a tile-wall menu and a membership card/benefit ledger. The old “Marquee” and “Dock” Sections are hidden leftovers, not the current hero editor.

1. Select **US-BETA → INDY Demo → Neon**, Site **186**.
2. Open **Settings → Website And Marketing → Pages** and match the retained Title, published ID and slug below.
3. Choose the Page row’s **Edit** action and match the editable ID shown in the dialog.
4. Match the Section Name and Type before editing. Keep internal Names and slugs stable; generated prefixes connect the current stylesheet to these widgets.

| Page / retained Admin Title | Route | Published Page | Editable Page | Exact saved Page CSS |
| --- | --- | ---: | ---: | --- |
| Home / `Variant C Late` | `/` → `/variant-c-late/` | 6197 | 6240 | Home (maintainer record) |
| `Movie Lineup` | `/movie-lineup/` | 6174 | 6217 | Films (maintainer record) |
| `Food Drink` | `/food-drink/` | 6173 | 6216 | Food (maintainer record) |
| `Private Hire` | `/private-hire/` | 6179 | 6222 | Private hire (maintainer record) |
| `Membership` | `/membership/` | 6177 | 6220 | Membership (maintainer record) |
| `Visit` | `/visit/` | 6170 | 6213 | Visit (maintainer record) |
| `Events Late Nights` | `/events-late-nights/` | 6178 | 6221 | Events (maintainer record) |

All seven Pages have final saved-field and publication readbacks in the native audit (maintainer record). The published map (maintainer record) identifies the separate rendered IDs.

| Page | Exact internal Name | Type | Editable Section | Published Section |
| --- | --- | --- | ---: | ---: |
| Home | `Showtimes Hero` | Showtimes | 26080 | 25922 |
| Home | `Neon - Explore the Cinema` | Custom | 26081 | 25923 |
| Films | `Neon - Films Introduction` | Custom | 26023 | 25865 |
| Films | `Movies - Explore Lineup` | Explore Movies | 26024 | 25866 |
| Films | `Movies - All Showtimes` | Showtimes | 26025 | 25867 |
| Food | `Food C - Tile Wall` | Concessions Menu | 26022 | 25864 |
| Private hire | `Events C - Ticket Stack` | Custom | 26037 | 25879 |
| Membership | `Membership C - Card Ledger` | Custom | 26033 | 25875 |
| Visit | `Find Us C - Night Map` | Custom | 26015 | 25857 |
| Visit | `Contact C - Statement Line` | Generic Form | 26016 | 25858 |
| Events | `Neon - Events Programme` | Custom | 26035 | 25877 |

## Edit the right content layer

### Navigation, hero and homepage teasers

Edit global labels/order/destinations in **Navigations**. Keep Home, Films, Food, Private Events, Membership, Visit and Events local to Neon. The dark rail’s presentation belongs in **Theme & Style**, so do not diagnose a missing header by editing a Page’s Custom block.

Use native Showtimes **26080** for the opening widget’s layout and filters. Retain `fdp-showtimes-hero`. Change actual poster/banner artwork, title, synopsis or screening records in Neon’s native programming data. Do not edit the hidden Generic Carousel named “Hero C - Marquee” expecting the current opener to change.

Use Custom **26081** for “Stay for the whole night.” and its four short feature cards. Preserve `.fdp-home-links--neon`, the card structure and the numbered details. Food, Private Events, Membership and Visit each have their own Page; changing this short teaser does not edit the destination content. Preserve the smaller Films and Events links as local routes.

### Film discovery and missing showtimes

On Movie Lineup, Custom **26023** owns the introduction. Explore Movies **26024** owns discovery/search/filter presentation; Showtimes **26025** owns session display. A film can appear in one and not the other because their data requirements and filters differ.

If screenings disappear, verify the selected Site, dates, visible movies and published showing records before changing the widget or styles. The recorded four-movie schedule is demonstration data and can expire. The demo intentionally remains display-only; enabling ticketing is a separate operating change.

### Tile-wall food menu

Open Concessions Menu **26022** for the Menu & Bar heading, channel/category selection and native card controls. Edit product titles, descriptions, variations, pictures and prices in the Site’s concession records. Keep the tile treatment on the native widget; do not paste seven static product cards into a Custom block.

Test a complete image/name/price tile and a category jump at desktop and 390px. A Website-ineligible Item or Category can disappear even when the Page is published. A photograph waiting to load is different from an empty product record. The retained source recipe is documented in the food-settings audit (maintainer record), explicitly marked source-only; inspect current dropdowns before changing native layout.

### Ticket Stack private occasions

Open Custom **26037**. “Take the whole house” leads into four tickets: One room, one night; Doors at eleven; A film and four courses; Bring the whole floor. Each ticket’s label, detail line and enquiry URL are editable content. Capacities, times, menus and prices in this display are sample claims, not native event or catering configuration.

Keep the ticket wrappers, perforation/decorative classes and complete links. Check long replacement text at phone width so the ticket edge does not clip it. These occasions are private-hire content; do not replace them with the separate Events Programme.

### Membership cards and benefit ledger

Open Custom **26033** for “Carry the card”. The content has two representations that need matching edits: three Parterre/Balcony/Circle cards and the comparison table underneath. Update the relevant card’s name/rate and its table column together. Also check redemption figures and the final enquiry link.

Preserve `.mbc`, `.mbc__cards`, `.mbc__card`, `.mbc--par`, `.mbc--bal`, `.mbc--cir`, `.mbc__table-wrap`, `.mbc__table` and `.mbc__redeem`. Do not delete a table column to fit a narrower screenshot or edit only the visible card. The display does not create Membership Types, alter points rules or enable purchases. Its current link is `/visit/#contact`.

### Visit information, native form and editorial events

Edit Night Map **26015** for the sample address, map and Doors / Kitchen / Last Film / Transit / Parking / Access information. Change displayed details and external map destination together for a real cinema. Keep the demo disclosure while the address is fictional.

Edit Generic Form **26016** for “Talk to Neon”, the introduction and required Name/Text, Email/Email and What you have in mind/Notes fields. Preserve Full Width layout unless the request changes it. Delivery/recipient settings have not been proven by the visual check; they need a separately approved configuration and test.

Edit Events Programme **26035** for “After the credits”, Classic favourites, Family screenings and Late nights. Those editorial cards lead to `/movie-lineup/`; they do not schedule independent screenings or change Ticket Stack packages.

## Saved color repairs and current check

The current saved Theme (maintainer record) retains the earlier styling and adds narrow label fixes: **Today uses Background text on Dark**, and the **NR/rating chip uses Dark text on Secondary**, including its inner label. These roles are protected from broader date/movie text rules; do not replace them with a universal button color.

On Films, open Explore Movies Section **26024** and retain **Movies → Heading Color: Default**. It was changed from Primary, saved, reopened and published; Default inherits the light Background foreground. The native field readback (maintainer record) confirms the setting. No Page CSS was added for this heading; the prepared CSS alternative was not applied.

The saved-fix journal (maintainer record) and current acceptance record (maintainer record) retain the readbacks and scoped public checks. Seven current 390px route scans found no enabled solid-text candidates and retained the approved six palette values. Image/gradient captions are tracked separately: preserve the native dark gradient and light captions, and recheck loaded artwork rather than recoloring from the distant Page background. These checks do not certify every interaction, future content or palette. Older general QA reports keep their separate open boundaries.

The earlier rollout Theme baseline (maintainer record) is retained for comparison; use the current saved Theme above when examining this repair.

## Understand Neon’s color mapping

| Role | Preserved value | Example in Neon |
| --- | --- | --- |
| Primary | `#087F82` | Teal actions and selected-action treatment, sometimes through a maintained tint. |
| Secondary | `#71DBCC` | Light supporting fills and numbered/card details; phone Sign Up needs contrasting dark ink. |
| Header | `#092D34` | Navigation rail and mixed dark feature-panel surfaces. |
| Accent | `#CEEF68` | Lime ticket/feature outlines, perforation-style details and CTA decoration. |
| Dark | `#102E33` | Main dark section/teaser ground and ink on light/tinted controls. |
| Background | `#F0FAF7` | Light text on dark panels and light form/action surfaces. |

Use **Theme & Style** for these preserved palette values (maintainer record). “Accent” is decorative; it is not an instruction to recolor every paragraph lime. Test the native search field, placeholders, selected controls, captions and auth labels separately from static body text.

The current saved Theme (maintainer record) owns site-wide header/footer treatment, the Showtimes backdrop crop, phone caption containment, longhand teaser backgrounds and the scoped Sign Up foreground repair. Page CSS owns the named component skins and supporting-page native fields. Native Section settings own visibility, device/date targeting, width, spacing and Classes. The block’s own module styles remain an additional dependency; the Page readback alone is not a full Section-field export.

Edit footer content at **Global Widgets → Footer → Full Width block → Display Items → Custom Text**. Preserve `.fdp-demo-footer--neon` and the six local support-page links. Footer CSS belongs in Theme; the native widget Gear CSS was observed not to load. Do not strip the Theme’s white-space or text-specificity repairs when changing footer wording.

## Troubleshoot Neon without changing the design

| Symptom | Check / corrective ownership |
| --- | --- |
| A saved dark page appears blank or muted | Wait for expected native content, visible global navigation and native loading layers to disappear before judging it. Earlier fast captures recorded a transient spinner/overlay; later settled membership and Visit stills were readable. |
| Header links disappear on desktop | Check the active Site’s global Theme/header rules and the native navigation entries. The current header treatment is site-wide; old page-specific carousel assumptions do not apply. |
| Phone Sign Up text blends into its mint fill | Preserve the Theme’s scoped `/register` foreground plus inner-label/icon rules. The live auth proof (maintainer record) verified the repaired pair and seven local drawer links. |
| Hero banner looks flat or distorted | Keep the narrow backdrop `object-fit: cover` repair. The foreground poster and direct background image are separate native elements. |
| Benefit table differs from membership card | Edit both representations in Custom26033; do not change commerce configuration to repair editorial wording. |
| Card or form ignores a new palette role | Record the exact route/element and ask the template maintainer to repair the shared role binding. Do not patch this customer with fixed hex text. |

## Copying and required verification

Adding another native concession item should use native data, with the resulting tile checked. Copying a Custom ticket or card requires its whole wrapper, relevant Page/Section styles and Theme dependencies. Repeating the HTML visually does not establish a verified self-service copy/duplicate workflow. A shared Custom Block can affect more than one Page; inspect ownership before editing it.

Library promotion/import and insertion into an existing Page have not been certified for Neon. For an authorized draft trial, record the destination context and IDs, retain dependencies and verify the actual Library link state. Local editing requires the intended independent-copy policy; disabling updates alone does not prove an unlink, and Force Update can overwrite local work.

Close a ticket after reopening saved fields, publishing only the authorized Page, and reviewing all seven routes at desktop and 390px. Check the full ledger and redemption figures, all four ticket CTAs, category behavior, the footer, three native form fields and both phone auth labels. Do not submit a form or purchase during appearance checks. New palettes, font-role installation, real-device behavior, delivery, transactions and full accessibility compliance remain separate verification work.

**Current evidence:** native readback (maintainer record), public ID map (maintainer record), QA checkpoint (maintainer record), settled phone membership (maintainer record), settled phone Visit (maintainer record). Deferred current desktop captures are still listed as pending; documentation does not make them passed.
