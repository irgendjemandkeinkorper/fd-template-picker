# Standalone sites and current source dependencies

Read this when building a complete cinema site or using a reviewed standalone demo as a component source. The current reference rollout is a separately authorized authoring/release job; it does not change the builder's default draft-and-review boundary or prove mixed-design/Library portability.

## Current reference destinations

All nine demos are in **US-BETA / INDY Demo**: Showcase 193, Reel 185, Neon 186, Cameo 187, Metropolis 188, Encore 191, Splice 189, Prologue 190 and Pause 192. Preserve source Site 170 and older Showcase Sites 183/184. J–L are outside this rollout. Showcase's current host is `template-showcase-demo-indy-consumer.netlify.app`; the other eight use `template-<design>-indy-consumer.netlify.app`. Ticketing stays display-only. Current explicit demo publication permission applies only to the authorized destinations/content; a future picker build still stops with drafts unless separately released.

## Plan the pages before assembly

| Page role | Local route | Native content or purpose |
| --- | --- | --- |
| Home | Existing/approved homepage | Native Showtimes first, then compact links to supporting Pages |
| Films | `/movie-lineup/` | Introduction, native Explore Movies and Showtimes |
| Food | `/food-drink/` | Design-specific native Concessions Menu |
| Private hire | `/private-hire/` | Selected private-parties module and local enquiry link |
| Membership | `/membership/` | Selected membership module and local enquiry link |
| Visit | `/visit/` | Approved venue information and native contact form |
| Events | `/events-late-nights/` | Editorial programme linking to Films |

These are the reference rollout's stable routes, not mandatory customer slugs. A new build needs its own approved page plan. For existing reference demos, edit the Page already at each route; native Duplicate was observed to retain an immutable slug. Resolve published and normal editable IDs independently through the public DOM and Admin. Do not infer offsets or use an inventory row's stale Section count as the current editable state.

Assign each chosen component to its actual Page role. Home needs useful previews/links, not a second complete food/private-hire/membership/contact stack. After the supporting Pages work, hide superseded detailed Home sections through native visibility rather than deleting them. Every header/footer/enquiry link must stay within the intended destination and reach its own matching design.

## Locate the current component source

Resolve the chosen stable `optionId` in the exact hash-bound `catalog.json` and `data/build-modules.json`. Standalone promotion preserves option IDs but can move food, private hire, membership and contact sources from the old homepage to their dedicated Pages. The picker `events` slot means **private parties/private hire**; it is not the public Events programme Page.

For a promoted entry, follow its actual `sourceReference`, `standaloneSource`, `demoProvenance.nativePageCss` and `demoProvenance.nativeThemeCss` paths, together with the registered artifacts and their hashes. Check the source Page/Section identities against the retained native/public map. A hidden old homepage section, old authoring screenshot or proposal filename is not the current source. An option without promoted standalone evidence remains at its recorded older readiness level; do not invent newer IDs or claim review passed.

Keep these dependency owners explicit:

- **Theme:** destination-wide header, drawer, footer, typography/palette contract and native movie-detail route rules. Page CSS cannot style a sibling header or a route outside that Page's `main`.
- **Page CSS:** the exact saved stylesheet for the containing supporting Page. If the evidence manifest has `pageCssByRole`, use that role's exported bytes rather than the shared default. Home keeps its own saved stylesheet.
- **Section/Custom content:** native widget settings, final internal Name, approved body, stable inner classes and any raw Section CSS. Page CSS alone may not contain a module's former Text Block recipe.
- **Destination data:** local products/categories/channel, movies/showings, form fields/recipients, membership dependencies and media. Native records and Library transfer are separate capabilities.

Prepared `proposals/` files are not saved-state evidence. In the execution workspace, exact current Theme exports are retained as `planning/website-templates/standalone-sites/evidence/<design>-theme.final.saved.css`; final per-Page exports/readbacks belong in that design's native/QA package. In a distributed picker checkout, use the registered repository-relative artifacts rather than assuming the planning folder exists. Record missing exports as missing; do not substitute a generator output silently.

Preserve meaningful Section Names when their generated prefixes are the styling contract, for example `Food A - Chip Rail` → `section-food-a---chip-rail-…`. New numeric IDs are expected. Keep inner classes such as `fdp-content`, `od-club`, `sb-*` and `ma-*`. Native Text Block → Custom conversion can omit old Gear classes and Section CSS: Reel private hire and Splice/Prologue/Pause membership needed their retained component CSS carried into the new stable scope. Copying HTML alone did not preserve the design.

The homepage teaser also has a small Theme-owned background dependency: `home-backgrounds.css` carries only its root/card/number-chip color surfaces under the destination Site fence. Native Custom CSS did not reliably paint the original variable-containing background shorthand, leaving Dark text over the inherited Dark page container on light designs. Keep the existing `fdp-home-links` markup and `--home-*` role properties together with the applied Theme layer; use `background-color` longhand in portable Custom CSS. Copy only this module's color rules into the new intentional shell and rebind its Site scope, rather than importing a complete source Theme. A prepared fragment is still pending until native save and public verification.

For a mixed design build, extract the required scoped module rules and supply one intentional global shell. Do not concatenate multiple complete variant Page/Theme stylesheets. A full standalone supporting stylesheet still depends on its design Theme and is not automatically a portable block package.

## Match native structure before adding CSS

Read the actual source widget settings. Reel food uses horizontal cards; generic vertical markup does not contain the nodes its design rules expect. Match View Mode and native image/description/filter settings before attempting a CSS repair.

The retained reference menus each have seven approved products and prices. Images are intentionally off for Encore, Splice and Prologue; descriptions are also off for Splice/Prologue. Pause emits native image nodes but its current design CSS hides them. Splice/Prologue use Top category filters; the other menus use the Left placement. Keep filters enabled. Validate each design's intended visibility and layout rather than requiring seven visible photos everywhere.

Keep form field type, required state and destination configuration native. The current reference form has three required Full Width fields: Name/Text, Email/Email and What you have in mind/Notes. A copied postcard/grid recipe must follow the actual saved field structure; placing every `.col-12` in one fixed grid cell overlaps the fields. Review form layout without submitting an enquiry.

## Own the footer in the right fields

Use one native **Global Widgets → Footer → Full Width block → Display Items → Custom Text** for footer content and local links. Put the class-scoped footer CSS in **Theme & Style → CSS**: saved Footer Gear CSS did not load in the consumer during the pilot. Do not compensate with footer copies inside every Page.

The Custom Text wrapper uses `preserve-wrap`; `.fdp-demo-footer { white-space: normal; }` prevents source indentation from creating a tall footer. Use a content `div` inside the existing native footer landmark. Preserve readable foregrounds against the footer's actual surface: legacy Theme footer selectors can outrank a generic footer link rule. The retained Theme fix scopes foregrounds to the destination `body.site-ID`, native `footer[data-test-id="global-widget-footer"]` and `.fdp-demo-footer`. Rebind the destination Site ID deliberately; never copy a source body scope unchanged.

The nine current demo Themes independently use `--q-primary`, `--q-secondary`, `--q-header`, `--q-accent`, `--q-dark` and `--q-background`. Older source modules can retain Header/Dark or Accent/Secondary aliases. Retain a brief's declared contract and review each saved dependency; do not redefine native `--q-*` properties to hardcoded demo values.

## Verify saved state and the whole site

Save, then wait for the observable saved state before navigating: settled dialog/list state, disabled Save where available, and reopened matching values. Some native clicks only focus a control; inspect the result before activating it again. After Create, reopen through the normal inventory Edit action and wait for its editable Title, slug and children to load. Set Type before the final Section Name. Verify Custom body/code, actual iframe content and saved CSS independently. A server error can occur after persistence; read the scoped inventory before retrying an unknown outcome.

Record proposed, saved and published states separately, including raw CSS hashes and actual published/editable IDs. Publication is asynchronous too. Theme/global navigation saves can take effect immediately even while Pages are drafts. Do not use a deployment, cache clear or duplicate creation to remedy an unsettled content save.

Review all seven routes, native Site/Page identity, desktop navigation and actual phone drawer. Use a real 390px browser viewport for phone checks, serialize shared-browser viewport changes and reset afterward. Check internal slide clipping as well as document overflow, dark Explore Movies input/placeholder/icon contrast, form introduction/fields, footer links and native movie-action text. Preserve native icon fonts. Wait for widget/media loading before capturing the actual pixels.

A proposed fix or successful native Save does not close public QA until the resulting page is checked. Keep unresolved routes, source exports or current-state fields explicit. Do not submit forms, enable booking or place orders merely to demonstrate the site. For a default draft build, record consumer QA limitations and stop for review rather than publishing to obtain screenshots. Refer to repository `docs/STANDALONE-DEMO-MAINTENANCE.md` and `docs/STANDALONE-DEMO-INTEGRATION.md` when maintaining/promoting this particular reference rollout; do not run catalog promotion as an implied part of a customer-site build.
