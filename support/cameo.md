> Published support guide. Raw maintainer audit records are retained separately. Reviewed October 26, 2026.

# Cameo — support guide

**Target:** US-BETA → INDY Demo → **Cameo, Site 187**<br>
**Public demo:** [Cameo](https://template-cameo-indy-consumer.netlify.app/)<br>
**Owner:** Website Support owns approved copy/links; the template maintainer owns paper/rotation/CSS treatment; programming and commerce owners maintain actual screenings, products and benefits.<br>
**Evidence checkpoint:** 26 October 2026. This guide covers the current standalone Site.


**Color cleanup: scoped repairs verified.** Cameo keeps its approved coral/cream palette. The Theme fixes were saved and reopened, then checked on desktop and at 390px. Only the specific repairs and recorded states below are accepted; this is not full accessibility or launch certification.


## Quick fixes

- **Why is a food price cut off by its sticker?** Keep the full amount and have the card geometry checked; shortening the price is not a fix. [Sticker-sheet menu](#sticker-sheet-menu-and-price-labels).
- **Where do I change private-party wording?** Edit the six-note Custom noticeboard. [Private-hire noticeboard](#noticeboard-private-hire).
- **How do the three membership colors and filled stamps work?** Card order controls the paper tints; only earned stamps are filled. [Loyalty card and tiers](#loyalty-card-and-tier-copy).
- **Where do I change the address or postcard form?** The venue card and native form have separate editors. [Visit and contact](#hand-drawn-visit-card-postcard-form-and-editorial-events).
- **Why do Today and NR have different text colors?** Their dark and peach surfaces require different ink. [Verified label pairs](#saved-color-repairs-and-current-check).

## Match the current Page and Type

Cameo keeps a playful paper/sticker treatment around the same cinema information as the other demos. Its current opener is native **Showtimes**. The old collage carousel and supporting quote are not the active hero. Private Hire and Membership are now **Custom** Sections on this Site; older Rich Text instructions do not identify the current editor.

1. Select **US-BETA → INDY Demo → Cameo** and confirm Site **187**.
2. Open **Settings → Website And Marketing → Pages** and match the row’s published ID, Title and slug below.
3. Choose **Edit** and check the separate editable Page ID in the heading.
4. Match the named Section’s Type before editing. Keep internal Names, slugs and wrapper classes stable; they connect the current styles to the content.

| Page / retained Admin Title | Route | Published Page | Editable Page | Exact saved Page CSS |
| --- | --- | ---: | ---: | --- |
| Home / `Variant D Odd` | `/` → `/variant-d-odd/` | 6286 | 6329 | Home (maintainer record) |
| `Movie Lineup` | `/movie-lineup/` | 6260 | 6303 | Films (maintainer record) |
| `Food Drink` | `/food-drink/` | 6259 | 6302 | Food (maintainer record) |
| `Private Hire` | `/private-hire/` | 6265 | 6308 | Private hire (maintainer record) |
| `Membership` | `/membership/` | 6263 | 6306 | Membership (maintainer record) |
| `Visit` | `/visit/` | 6256 | 6299 | Visit (maintainer record) |
| `Events Late Nights` | `/events-late-nights/` | 6264 | 6307 | Events (maintainer record) |

The final native readback (maintainer record) records all seven saved Pages with no pending publication indicator. It does not export every interior Custom block field. The public map (maintainer record) independently identifies the rendered Sections.

| Page | Exact internal Name | Current Type | Editable Section | Published Section |
| --- | --- | --- | ---: | ---: |
| Home | `Showtimes Hero` | Showtimes | 26406 | 26248 |
| Home | `Cameo - Explore the Cinema` | Custom | 26407 | 26249 |
| Films | `Cameo - Films Introduction` | Custom | 26339 | 26181 |
| Films | `Movies - Explore Lineup` | Explore Movies | 26340 | 26182 |
| Films | `Movies - All Showtimes` | Showtimes | 26341 | 26183 |
| Food | `Food D - Sticker Sheet` | Concessions Menu | 26338 | 26180 |
| Private hire | `Events D - Noticeboard` | **Custom** | 26353 | 26195 |
| Membership | `Membership D - Loyalty Card` | **Custom** | 26349 | 26191 |
| Visit | `Find Us D - Hand-drawn Map` | Custom | 26331 | 26173 |
| Visit | `Contact D - Postcard` | Generic Form | 26332 | 26174 |
| Events | `Cameo - Events Programme` | Custom | 26351 | 26193 |

## Edit Cameo’s sections

### Global links and the short homepage

Use **Navigations** for the seven local header destinations and their order. Use **Theme & Style** for the paper-band header and menu lettering. Keep links to Home, Films, Food, Private Events, Membership, Visit and Events on Cameo’s own host.

Custom **26407** owns “A little more cinema.” and the four feature teasers. Preserve `fdp-home-links--cameo` and the full card/number/CTA structure. The four detailed sections live on separate Pages; update their content there. Keep the smaller Films/Events links local. A longer card title must still fit the paper card at 390px without colliding with neighboring decoration.

### Native Showtimes opening and Films

Edit native Showtimes **26406** for its layout/filter controls and keep `fdp-showtimes-hero`. Actual movie artwork, synopsis and sessions come from native programming records. The hidden collage carousel cannot change this opener.

The Films introduction is Custom **26339**. Explore Movies **26340** controls discovery/search presentation; Showtimes **26341** controls session presentation. If content is missing, compare filters, dates, published showing data and movie/channel visibility. A movie record alone does not create a session. The retained demo schedule can expire, and ticket selection intentionally remains disabled.

### Sticker-sheet menu and price labels

Open Concessions Menu **26338** for heading, channel/category filters and native layout controls. Edit real concession Item/Category records for names, photos, descriptions, variations and prices. Sticker styling is an overlay on native product cards, not a second hand-maintained menu.

After changing an amount, inspect the entire currency string and product name on desktop and phone. A rotated sticker must remain inside the card’s clipping area. Do not shorten a real price or hide a description to make a broken sticker fit. If it clips, give the template maintainer the full card screenshot, amount, product, viewport and current widget settings. Product eligibility and missing images require data/channel checks before styling changes.

### Noticeboard private hire

Open Custom **26353** for “Things we will happily let you do in here”. Its six notes cover birthday celebrations, private screenings, late-night hire, company events, school screenings and an open enquiry. Each visible note has a headline, supporting line and enquiry destination.

Edit the wording/URL while retaining the note wrappers and paper/rotation classes. The angle and tape are a preset, not a demonstrated native rotation control. Do not replace this Custom Section using old Rich Text instructions. The Events Programme is a separate editorial cinema page, not the private-hire noticeboard.

### Loyalty card and tier copy

Open Custom **26349** for the “Ten stamps…” heading, loyalty-card copy, stamp row and three tiers: Regular; Regular, but more; Practically staff. Update each tier’s name, price, benefit list and `/visit/#contact` link together. Printed benefits do not configure native Membership Types or activate rewards.

Preserve `.od-club`, `.od-club__card`, `.od-club__stamps`, `.od-club__tiers`, `.od-club__tier`, `.od-tilt` and the CTA classes. Keep the difference between earned stamp spans and unearned slots. Do not type extra X characters to imitate a completed card.

**The current tier colors follow card order.** The public membership check (maintainer record) confirms that all three cards use `.od-club__tier.od-tilt`, without `fd-tier-primary`, `fd-tier-secondary` or `fd-tier-dark`. The saved Membership Page CSS supplies their Admin-controlled paper tints: the first card uses Background mixed with white (`--v-white`); the second uses Accent mixed with Background (`--v-scrap`, through the later `--v-pop` binding); the third uses 7% Dark mixed with Background (`--v-scrap-2`). All three use Dark ink. The `fd-tier-*` rules are dormant on this output; do not add those classes just to match older instructions. Reordering or adding cards changes which positional rule applies and needs a layout/color check.

The same public check records **three earned stamps in Dark and seven transparent unearned slots**. This is intentional, not seven missing glyphs. The current rendered binding is verified; this check did not freshly export the interior body from native editor26349.

### Hand-drawn visit card, postcard form and editorial events

Edit Custom **26331** for the fictional demo address, map and practical visitor information. Change the map link/embed along with a real address. A third-party map error is independent of whether the local address or contact form exists.

Edit Generic Form **26332** for “Dear Cameo,”, its introduction and required Full Width Name/Text, Email/Email and What you have in mind/Notes fields. Keep the native form rather than drawing form lines in Custom HTML. Notification recipients/delivery and submission confirmation need a separate authorized configuration/test.

Edit Custom **26351** for “Something worth going out for”, Classic favourites, Family screenings and Late nights. The cards point to `/movie-lineup/`. They do not create scheduled sessions or alter private-hire availability.

## Saved color repairs and current check

The current saved Theme (maintainer record) retains the earlier styling and adds narrow label fixes: **Today uses Background text on Dark**, and the **NR/rating chip uses Dark text on Secondary**, including its inner label. These roles are protected from broader date/movie text rules; do not replace them with a universal button color.

The existing paper-tier order and earned/unearned stamp treatment remain intact; see [Loyalty card and tier copy](#loyalty-card-and-tier-copy). The repair does not add the dormant tier-role classes or replace Cameo’s coral/cream identity.

The saved-fix journal (maintainer record) and current acceptance record (maintainer record) retain the readbacks and scoped public checks. Seven current 390px route scans found no enabled solid-text candidates and retained the approved six palette values. Image/gradient captions are tracked separately: preserve the native dark gradient and light captions, and recheck loaded artwork rather than recoloring from the distant Page background. These checks do not certify every interaction, future content or palette. Older general QA reports keep their separate open boundaries.

The earlier rollout Theme baseline (maintainer record) is retained for comparison; use the current saved Theme above when examining this repair.

## Color, paper decoration and CSS ownership

| Role | Preserved value | Cameo example / boundary |
| --- | --- | --- |
| Primary | `#B84F3A` | Coral action edges/underlines and maintained action tints. |
| Secondary | `#F2B7A0` | Soft peach highlights and supporting paper-card treatment. |
| Header | `#432A36` | Navigation lettering on the light band; the band itself remains a paper surface. |
| Accent | `#DA8F48` | Decorative rules, marker/number details and small paper accents. |
| Dark | `#3D2531` | Main ink on cream and tinted surfaces, the three earned stamps, and the third tier’s faint paper tint. |
| Background | `#FFF4EB` | Cream page/paper ground and light copy on designated dark panels. |

Preserve the recorded palette (maintainer record). Routine color changes belong in **Theme & Style**. Where the role is broken, repair the shared template binding once rather than inserting a client-specific hex patch. Small paper decorations and required text have different contrast needs; do not use decorative orange as universal body copy.

The current saved Theme (maintainer record) owns global header/footer presentation, phone menu treatment, backdrop crop, phone hero containment and homepage color surfaces. The exact Page exports above own the named Section skins and supporting native fields. **Visit and Membership retain different saved CSS revisions from other supporting Pages**; do not replace them with a common proposal without a scoped comparison.

Native Section settings own visibility, devices/dates, width, margins and Classes. Interior Custom styles may remain dependencies; the seven-Page readback is not a complete export of all Section fields. For footer wording, use **Global Widgets → Footer → Full Width block → Display Items → Custom Text**, preserving `fdp-demo-footer--cameo`, its six local links and disclosure. Put maintained footer presentation in Theme; widget Gear CSS was observed not to load.

## Diagnose common issues

| Symptom | Check and owner |
| --- | --- |
| Membership price disappears on a tilted card | Inspect the exact price node, its painted card surface and the saved Membership Page CSS. Keep the verified three-card tint order; adding dormant `fd-tier-*` classes is not the current repair path. |
| Description overlaps the first form field | Check the actual published Visit Page revision and field-row geometry. A prior pending Page publication left older compiled CSS public even when the editor contained the correction. Do not repair it by deleting useful introduction text. |
| Phone drawer text blends into the background | Preserve the native menu/link treatment and test all seven routes plus auth labels. Cameo’s tinted auth pair was intentionally left intact in the earlier auth-only batch because it was readable. |
| Movie-detail action is dark on dark | Inspect the native movie-detail button and inner label; this is separate from the homepage caption. The saved Theme includes a scoped action-ink repair; recheck its current rendered state. |
| Embedded map fails | Check the external embed/network response. Keep a usable address and external map link; do not change every local Page to repair a third-party response. |
| Enquiry reaches Visit but not the anchor | Native routing was observed to drop the contact hash. Confirm the local destination, record the behavior and do not promise auto-focus. |

## Copying and final checks

Cameo’s appearance depends on complete paper-card wrappers, class names and the associated Page/Section/Theme rules. Copying only text or pasting an HTML body does not establish portability. Duplicating a tilted tier must be tested in an authorized draft; role assignment, angle repetition, clipping and stamp state are not certified by this guide. Inspect whether a Custom Block is shared before editing it.

Cross-site Library transfer and one-section insertion are unverified for Cameo. An imported Page and an inserted Section are different outcomes. Resolve the intended synchronization policy and verify a genuine local unlink before independent edits; disabling Library Updates alone is not the same evidence, and Force Update can overwrite local work.

Close an edit only after reopening saved fields, confirming the authorized Page’s publication and checking desktop plus 390px. Inspect every complete sticker price, every tilted tier/CTA, all noticeboard notes, native film controls/movie-detail actions, the full footer and form fields without submitting. Test the seven-link drawer and auth labels. Preserve evidence of clipping/contrast checks. Arbitrary palettes, new font-role application, transactional membership behavior, form delivery, real devices and full accessibility compliance remain separate work.

**Current evidence:** native saved readback (maintainer record), published ID map (maintainer record), public QA report (maintainer record), repair journal (maintainer record), auth verification (maintainer record). The older public report retains its own pending presentation findings; the current scoped color acceptance above does not silently close unrelated tests.
