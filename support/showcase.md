> Published support guide. Raw maintainer audit records are retained separately. Reviewed October 26, 2026.

# Showcase — support guide

**Target:** US-BETA → INDY Demo → **Showcase, Site 193**<br>
**Public demo:** [Showcase](https://template-showcase-demo-indy-consumer.netlify.app/)<br>
**Owner:** Website Support for content; template maintainer for structure and CSS; programming/commerce owner for movies, screenings and products.<br>
**Evidence checkpoint:** 26 October 2026. This guide covers the current standalone Site only.


**Color cleanup: scoped repairs verified.** Showcase keeps its approved gold/charcoal palette. The Theme fixes were saved and reopened, then checked on desktop and at 390px. Only the specific repairs and recorded states below are accepted; this is not full accessibility or launch certification.


## Quick fixes

- **Where do I change food prices?** Edit the local concession items, then check the chip rail. [Food-menu instructions](#change-the-chip-rail-food-menu).
- **How do I change the film opening the homepage?** Use the current Showtimes widget and programmed film data. [Hero and showtimes](#change-the-opening-film-or-showtimes).
- **Where do I change the membership tiers or private-event options?** These are separate Custom Sections, not the short homepage cards. [Tier rail and rate card](#change-private-events-and-memberships).
- **Why does a header link open the wrong page?** Correct the global navigation destination. [Navigation and homepage links](#change-navigation-or-the-homepage-links).
- **Why are selected dates and Log In pale gold instead of solid gold?** Their existing Primary tint now keeps the small Dark labels legible. [Verified color repairs](#saved-color-repairs-and-current-check).

## Start with the correct object

Showcase opens with native **Showtimes**, followed by four short links to dedicated supporting Pages. The old all-sections homepage and older incomplete Showcase shells are not this Site. Confirm **Site 193**, not a similar display name, before editing.

1. Select **US-BETA → INDY Demo → Showcase** in INDY Admin.
2. Open **Settings → Website And Marketing → Pages** and match the published row ID, Title and slug below.
3. Choose the row’s **Edit** action. Confirm the separate editable Page ID in the dialog heading.
4. Match the Section’s **Name and Type** before opening its Edit action. Keep internal Names and slugs stable: the stylesheet uses their generated name prefixes.

The final native readback (maintainer record) records all seven Pages as published without a pending-change indicator. The public map (maintainer record) independently records the published output IDs. Neither ID set should be substituted for the other.

| Page / retained Admin Title | Public route | Published Page | Editable Page | Saved Page CSS |
| --- | --- | ---: | ---: | --- |
| Home / `Variant A Circuit` | `/` → `/variant-a-circuit/` | 6797 | 6840 | Home (maintainer record) |
| `Movie Lineup` | `/movie-lineup/` | 6776 | 6819 | Films (maintainer record) |
| `Food Drink` | `/food-drink/` | 6775 | 6818 | Food (maintainer record) |
| `Private Hire` | `/private-hire/` | 6781 | 6824 | Private hire (maintainer record) |
| `Membership` | `/membership/` | 6779 | 6822 | Membership (maintainer record) |
| `Visit` | `/visit/` | 6772 | 6815 | Visit (maintainer record) |
| `Events Late Nights` | `/events-late-nights/` | 6780 | 6823 | Events (maintainer record) |

## Find the Section that owns the content

These are the visible Sections in the current native readback. Hidden leftover Sections are not alternative editing targets.

| Page | Exact internal Name | Type | Editable Section | Published Section |
| --- | --- | --- | ---: | ---: |
| Home | `Showtimes Hero` | Showtimes | 28280 | 28122 |
| Home | `Showcase - Explore the Cinema` | Custom | 28281 | 28123 |
| Films | `Showcase - Films Introduction` | Custom | 28241 | 28083 |
| Films | `Movies - Explore Lineup` | Explore Movies | 28242 | 28084 |
| Films | `Movies - All Showtimes` | Showtimes | 28243 | 28085 |
| Food | `Food A - Chip Rail` | Concessions Menu | 28240 | 28082 |
| Private hire | `Events A - Rate Card` | Custom | 28255 | 28097 |
| Membership | `Membership A - Tier Rail` | Custom | 28251 | 28093 |
| Visit | `Find Us A - Map Strip` | Custom | 28233 | 28075 |
| Visit | `Contact A - Compressed Column` | Generic Form | 28234 | 28076 |
| Events | `Showcase - Events Programme` | Custom | 28253 | 28095 |

## Edit Showcase’s content

### Change navigation or the homepage links

Use **Navigations** for the global header’s labels, order and destinations. Verify seven local destinations: Home, Films, Food, Private Events, Membership, Visit and Events. Use **Theme & Style** for the dense dark navigation band and its colors. Page CSS cannot reliably own the header because the header is outside the Page’s main content.

For the four homepage cards, edit Custom Section **28281**, not the destination Page’s content. Preserve `fdp-home-links`, `fdp-home-links--showcase` and the card/number/CTA classes. The cards link to `/food-drink/`, `/private-hire/`, `/membership/` and `/visit/`; the smaller programme links go to Films and Events. Changing a card’s short description does not update the detailed Page automatically.

### Change the opening film or showtimes

Edit native **Showtimes Hero, 28280** for its widget presentation and filters. Edit the Site’s actual movie/showing records for artwork, title, synopsis and sessions. A Custom card or screenshot is not the film-data source. Keep `fdp-showtimes-hero` on the Section.

The Films Page has a separate Explore Movies widget and All Showtimes widget. If a film is missing from one surface, compare the two widgets’ filters, selected Site, dates, published screenings and movie visibility before changing CSS. The retained schedule is demo data, not a continuing live programme. Ticket selection is intentionally display-only.

### Change the chip-rail food menu

Open Concessions Menu **28240** for heading, categories, sales channel and display controls. Change names, photos, descriptions, variations and prices in the actual concession records behind this Site. The CSS styles the native cards; it does not maintain a second HTML price list.

Check both the category rail and complete product cards. The historical native recipe has different Items Per Row values from the final CSS layout, so do not infer dropdown settings from a screenshot. Reopen the current widget before changing them. A missing item can be an Item/Category Website-channel or condition issue, not a card-style problem.

### Change private events and memberships

Rate Card **28255** is a Custom layout with six occasion entries. Edit each occasion’s title, explanatory copy, displayed commercial claim and enquiry link together. Keep the supplied rate-card wrappers. Its public heading is “Six ways to take the room”; the separate Events Page is editorial film programming.

Tier Rail **28251** is also **Custom**. It contains Parterre, Balcony and Circle cards plus redemption figures. Keep `.mba`, `.mba__grid`, `.mba__card`, `.mba--par`, `.mba--bal` and `.mba--cir` while editing the selected card’s text or link. Displayed benefits and prices are sample copy; editing them does not create or change native Membership Types, points rules or checkout. The current enquiry links use `/visit/#contact`.

### Change the venue, form or programme

Edit Map Strip **28233** for the sample address and visit information. The current address is explicitly fictional demo content. Verify the map destination separately before replacing it with customer details.

Edit Generic Form **28234** for “Ask Showcase anything”, its introduction and fields. Retain Name/Text, Email/Email and What you have in mind/Notes as required Full Width fields unless the request explicitly changes the form. Notification recipients, delivery and confirmation behavior require separate approved configuration and a separate test; appearance checks have not tested delivery.

Edit Events Programme **28253** for Classic favourites, Family screenings and Late nights. These are editorial examples linking to `/movie-lineup/`, not independently scheduled events or private-hire packages.

## Saved color repairs and current check

The current saved Theme (maintainer record) retains the earlier styling and adds narrow label fixes: **Today uses Background text on Dark**, and the **NR/rating chip uses Dark text on Secondary**, including its inner label. These roles are protected from broader date/movie text rules; do not replace them with a universal button color.

Selected Home dates and the Films Now Playing tab/badges now use the existing Primary tint with Dark ink, keeping the gold identity. Phone Log In uses that same pair; Sign Up remains Secondary with Dark ink. The fresh 390px drawer read (maintainer record) and screen image (maintainer record) confirm both labels and all seven local menu entries. The current pairs measure about **11.64:1 for Log In** and **9.31:1 for Sign Up**, superseding the older login result.

The saved-fix journal (maintainer record) and current acceptance record (maintainer record) retain the readbacks and scoped public checks. Seven current 390px route scans found no enabled solid-text candidates and retained the approved six palette values. Image/gradient captions are tracked separately: preserve the native dark gradient and light captions, and recheck loaded artwork rather than recoloring from the distant Page background. These checks do not certify every interaction, future content or palette. Older general QA reports keep their separate open boundaries.

The earlier rollout Theme baseline (maintainer record) is retained for comparison; use the current saved Theme above when examining this repair.

## Color and style ownership

Use native **Theme & Style** color controls for branding. The preserved values are in the palette record (maintainer record).

| Role | Preserved value | Showcase example / boundary |
| --- | --- | --- |
| Primary | `#A37721` | Main action tint/outline and homepage CTA underline. A tinted action is intentionally not a solid gold text/background pair. |
| Secondary | `#E4C873` | Supporting membership treatment and lighter numbered details. |
| Header | `#191B25` | Dark navigation band and homepage teaser ground. |
| Accent | `#D8AB4F` | Thin decorative edges, including feature-card top rules. |
| Dark | `#1E2630` | Dark feature-card surfaces and strong ink/shadow roles. |
| Background | `#F8F4E8` | Cream copy on dark surfaces and paper/form surfaces where specified. |

The current saved Theme CSS (maintainer record) owns site-wide header/footer presentation, backdrop cropping, phone hero containment and the homepage color-surface repair. Each Page owns its separately exported CSS above. Native Section settings own visibility, device targeting, width, spacing and Classes. The Custom block’s own module rules and inner classes remain dependencies; the Page readback is not a complete export of every Section CSS field.

For footer content, open **Global Widgets → Footer → Full Width block → Display Items → Custom Text**. Preserve `fdp-demo-footer` and its Showcase modifier. Footer presentation belongs in Theme CSS: widget Gear CSS was observed not to load in this build. Keep the six local support-page links and the demo disclosure. Do not copy a proposal file over an entire saved Theme.

## Troubleshoot the actual layer

| Symptom | Check and narrow correction |
| --- | --- |
| Homepage teaser text blends into its background | Verify the current Theme’s `.fdp-home-links` longhand `background-color` repair. INDY previously compiled a variable-based `background` shorthand into an empty declaration. Correct saved source alone did not prove painted output. Escalate a missing binding to the template maintainer; do not add a new per-client hex override. |
| Hero artwork looks stretched | Compare the direct backdrop image’s aspect with the separate foreground poster. The saved repair scopes `object-fit: cover` to the Showtimes backdrop. Keep that layer; do not stretch replacement art to imitate the broken image. |
| Search, form introduction or a phone caption is unreadable | Check the correct saved Page/Theme version and whether the relevant Page was actually published. Older QA reports list these as awaiting fixes; later native readbacks alone are not a new rendered acceptance test. Recheck the exact affected control. |
| A CTA opens Visit at the top | `/visit/#contact` was observed to lose its hash through the native router. Confirm the enquiry destination works; do not promise automatic focus/scroll to the form. |
| A saved change is absent publicly | Reopen the exact editable Page and compare saved fields, then inspect that Page’s publication indicator. Routine content publishing does not require a Netlify deploy, cache clear or hosting edit. |

## Copying and completion

A pasted Custom HTML body alone does not include its Page CSS, Section settings, Theme repairs, native data or global navigation/footer. A library Page import is not proof that one Section can be inserted into an existing Page. Independent copy/paste repetition and full cross-site portability are not certified for Showcase.

For a maintainer-led draft copy, record source/destination IDs, preserve complete wrapper classes, inspect whether a Custom Block is shared, and check Library state before local edits. If it is linked, obtain the intended sync policy and verify an actual local unlink; disabling Library Updates alone is not the same proof. Do not Force Update a local customization as a repair shortcut.

Close a content ticket only after the saved field survives reopening, the authorized Page is published, and desktop plus 390px output shows the changed content, seven local menu links, complete prices, readable overlays and working enquiry destinations. Check the full footer and the form without submitting it. Retain before/after evidence. Commerce, notification delivery, new font-role application, arbitrary palettes and full accessibility compliance remain separate checks.

**Current evidence:** native Page/Section readback (maintainer record), published map (maintainer record), Theme repair journal (maintainer record), current phone auth check (maintainer record), public QA report (maintainer record). Public QA reports and saved native evidence have different checkpoints; this guide does not turn a pending report into a pass.
