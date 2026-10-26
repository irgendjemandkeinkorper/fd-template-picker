# FD Template Picker · Website Studio

Choose a cinema website one step at a time. The customer flow shows one decision at a time, with a checklist, a preview, and a clear next action. Customers choose from the reviewed template styles, then share their colors and six section choices with the website team.

## Customer flow

1. **Brand colors:** choose Primary, Secondary, Header, Accent, Dark and Background with color pickers or hex fields. Seven additional message, splash and seating colors live in a collapsed **Advanced colors** panel. The cinema name is optional.
2. **Navigation:** choose the menu style.
3. **Hero:** choose the opening section.
4. **Food & Drink:** choose the menu presentation.
5. **Private Parties:** choose the celebration and private-screening section.
6. **Membership:** choose the membership section.
7. **Contact Us:** choose the contact section.
8. **Review:** check all seven choices, edit any step, then copy a selection link, download a plain-text summary or download the machine-readable JSON build brief.

The **Templates** tab presents the first nine designs, A–I, under the approved names **Showcase, Reel, Neon, Cameo, Metropolis, Encore, Splice, Prologue and Pause**. It links to the existing source demos. The US-BETA **Website Templates** pilot created Circuit **103** and Showcase Site **183**: an initial HTTP 500 left partial creation, verified after refresh, then only **Create Consumer Website** was retried successfully, triggering its automatic initial deploy. Hosting reaches the INDY application, but Admin has **No Pages** and the consumer shows an empty 404. No design/content transfer or Library import occurred. This is a provisioned shell, not a ready Showcase demo; its URL is not exposed as a Hub demo. The [pilot journal](evidence/website-templates-pilot/pilot-journal.json) records the result. Dedicated homepage/showcase links stay absent until content and rendering are verified. Switching tabs does not change checklist selections.

Public template addresses must use the **`template-` prefix** while retaining the INDY suffix: **`template-showcase-indy-consumer`, `template-reel-indy-consumer`, `template-neon-indy-consumer`, `template-cameo-indy-consumer`, `template-metropolis-indy-consumer`, `template-encore-indy-consumer`, `template-splice-indy-consumer`, `template-prologue-indy-consumer`, `template-pause-indy-consumer`**. Display/native Site names remain the approved single words. These are **unverified desired labels**, not live demo links.

The first short `template-showcase` Name/Hostname pair saved and reopened in **INDY Developer Site Settings**, but its public address served an unrelated existing site. The working Name **`showcase-indy-consumer`** was restored and read back; Hostname now explicitly contains its existing full working URL because blank validation failed. The longer `template-showcase-indy-consumer` candidate returned **Site not found**, which does not establish availability or ownership. It is prepared **unsaved** in the native form, with one **Trigger Site Deploy** test awaiting explicit confirmation; no manual test has run. The [URL naming journal](evidence/website-templates-pilot/url-naming-journal.json) records those stages. This workflow uses INDY Admin; no Netlify login was performed or required for the prepared native action. Hub links remain the existing source demos, with new homepage/showcase URLs null.

A displayed default is a starting preview. A choice counts only after the customer confirms it with the next-step button. Later steps unlock in order, and completed steps remain available for editing. Changing a confirmed color pair or section choice requires confirmation again. The customer flow keeps the six sections in a fixed order and presents only template choices.

The six section steps offer **66 checked section choices** from variants A–L on **US-BETA / INDY Demo / Adam Template Testing 2**: seven Navigation designs, 11 Hero choices and 12 choices in each of the other four sections. The matching G–L navigation designs appear once as **Standard**, represented by G's reviewed capture. F's hero is excluded while its missing image is unresolved. Only present source components with a current, passed visual review and an unaltered live screenshot are available. Rejected, stale, partial and unchecked previews stay outside the customer choices.

Use **View larger** to inspect a selected style. Tall sections scroll vertically; navigation previews preserve enough width to inspect menu labels. The previews are screenshots with sample content. They do not operate booking, ordering or contact widgets.

## Colors and contrast

The color step checks Primary/Secondary in both text directions and Dark/Background. It uses the [WCAG 2.2 sRGB relative-luminance formula](https://www.w3.org/TR/WCAG22/#contrast-minimum) and requires an **unrounded ratio of at least 4.5:1 for both base pairs** before continuing. A brand pair that reaches 3:1 but falls below 4.5:1 is identified as suitable for large text only. Invalid hex values, including Advanced colors, cannot pass. Suggestions offer black or white when a valid base pair needs more contrast.

**Demo images keep their original colors. The chosen palette will be used when building the website.** The sample text cards reflect the selected colors; screenshots are never recolored. The checks do not certify derived surfaces, overlays, semantic states, seats or the completed website. Starter values are suggestions, not captured Admin values or canonical INDY defaults.

Requested Header and Accent colors are retained independently in the selection. Current native adapters use Dark for Header and Secondary for Accent; the UI and export disclose that limitation. Their independent native use requires adapter changes and verification. Advanced roles are recorded without inventing unverified CSS-variable mappings.

## Save and share

Progress saves on the current device in the browser. **Copy link**, available at Review, includes the cinema name, all thirteen palette values, section choices and recorded confirmations in the URL fragment. **Summary** creates a `.txt` file with the palette, base contrast results and six section choices. **Build brief** creates a versioned `.json` file with source references, module readiness, artifact hashes and a draft-only build contract. Source IDs never authorize or identify a destination. **Start over** asks for confirmation before clearing the current guided selection.

The v3 reader accepts v1/v2 selections and links. Compatible colors, component choices and explicit confirmations survive migration; added roles receive disclosed starter values. The legacy two-color `brandColors` mirror remains available. A change to any palette role requires color confirmation again while keeping component confirmations. Legacy selections without confirmations begin unconfirmed. Saved H–L navigation picks map to Standard and require confirmation again. See the [build-brief contract](docs/PICKER-BUILD-BRIEF.md).

## Build from a brief with Codex

Download the **JSON build brief** at Review, then invoke the local **`indy-picker-site-builder`** skill in Codex with that file, the explicit destination Region/Circuit/Site, approved content and requested Page plan. Keep Chrome signed in. The skill's read-only preflight checks the matching catalog, module readiness and artifact digests; source IDs and an exported request are not destination authorization. It assembles verified native modules and stops with saved, unpublished Pages for review. Site/Circuit creation, sample-data changes, consumer hosting, publication and deploys require their own explicit scope. A–I modules still need portability proof; the approved names and Showcase shell do not establish build readiness.

## Run locally

This is a static website with no build or production dependencies. From the repository directory:

```sh
node scripts/serve.mjs
```

Open `http://localhost:4173`. To run the automated checks:

```sh
node --test
```

`npm start` and `npm test` are aliases when npm is installed. The site can be hosted on GitHub Pages, Netlify, or another static host. After changing the catalog or registered source artifacts, regenerate the pinned module index with `node scripts/build-module-index.mjs` and run the tests before deployment.

The [demo readiness report](docs/DEMO-READINESS.md) records the verified customer journeys, screenshots, test results and remaining installation limits.

## Template maintenance

The [native color and overlay implementation](template-adapters/admin-controls-completion/FINAL-STATUS.md) is saved on **US-BETA → INDY Demo → Adam Template Testing 2**. The [native journal](evidence/admin-controls-completion/changes-journal.json) records 30 saved fields with readbacks and all twelve template pages published. Branding consumes native Primary, Secondary and Dark, with native Background as the opposing canvas/copy color. Shared headers, native form paint, readable CTA/card tints, observed media-caption backings/shadows and Odd's three semantic card roles are included.

The native second palette was exercised and the original palette restored. The [final QA report](evidence/admin-controls-completion/final-qa-report.json) accepts all 48 desktop/phone captures across both native palettes, with exact saved-field and portable provenance checks. All [66 independently reviewed native clips were ingested byte-identically](evidence/admin-controls-completion/captures/admin-controls-published-clips-001/ingestion.json), refreshing the customer catalog. Source product placeholders remain genuine native output; no media was fabricated to fill them.

The [editability audit](docs/TEMPLATE-EDITABILITY-AUDIT.md) still separates color/overlay implementation from full Admin-only maintenance. Fonts, fixed slants/structure, authored HTML and generated wording, Library transfer/unlink behavior and service setup remain independent work. Earlier [compiled color proposals](template-adapters/brand-tokens/README.md) are retained as review history; they are not native fields to paste. Internal support guides remain outside this public customer site.

## Catalog and screenshot evidence

`catalog.json` is the editable collection. Its explicit `variants` array records the admin inventory, while `slots[].options[]` records only captured section choices. An option includes its INDY component names, source route, verified page/section IDs, image dimensions, and capture notes. Historical catalog Library flags are source snapshots; the build brief also uses the versioned module registry and the bounded K pilot status below. Other modules remain unverified for transfer until tested individually.

Canonical coverage lives alongside the original section categories. An audited option may declare `canonicalComponent` (for example `private-parties`) and `componentStatus: "partial"` when it only partially serves that purpose. Generic Events, Experience and Visit sections are never automatically relabeled or counted as private parties, food or contact. `componentAudit` entries use `{ variant, component, status: "present" | "partial" | "missing", notes }` to distinguish source content from screenshot availability. A missing catalog choice without an audit is labeled **Needs audit**, rather than assumed absent. Refresh an audit entry after repairing the source page.

Image review is recorded separately in each option's `visualReview`: `passed`, `rejected`, `needs-review` or `not-reviewed`. The review is bound to `visualCaptureKey(option)` (image, size, capture date and source section IDs); a changed capture returns to unchecked until reviewed. Passed images also store a SHA-256 fingerprint checked by the tests. [The second pixel audit](evidence/catalog-pixel-audit-2.md) found incorrect B captures, incomplete navigation crops and other visual issues despite the source components being present. Display labels can describe actual appearance while `sourceName` and `components` retain original INDY aliases, as with F's Product Cards and Standard Form.

The optional `customerDesign` metadata records reviewed design equivalence, a customer label and the preferred representative option. The workflow groups these explicit markers instead of comparing image hashes. All 12 Navigation source records and their screenshots remain in the catalog; the six G–L records share `navigation-standard`, represented by `header--variant-g-cut` and displayed as Standard.

The [current component audit](docs/COMPONENT-PARITY.md) records all **72 required components present across A–L**, following 15 additions and one enriched membership module on the authorized test site. The retained original baseline had 56 present, 2 partial and 14 missing components. Each variant preset includes all six required components. G–L share one navigation appearance, and J–L still need a deliberate hero-design pass. Private-party options retain the stable `events` IDs while displaying as **Private Parties**; B's original public Playbill is optional Programme content.

The current catalog contains **110 choices across 18 section categories: 105 actual screenshots and 5 verified zero-height optional/support sections**. It preserves published empty states. Footer captures A/I/J/L omit a documented final 1 CSS pixel; original DOM bounds remain in their capture notes. Configured components absent from the observed published DOM do not retain stale choices. Repaired B/G/H/I/J/K/L have actual 390px mobile geometry evidence and a manual pixel review; all 16 new or enriched modules fit without measured horizontal overflow and preserve readable content, loaded menu images and visible actions. See [the parity report and mobile proof](docs/COMPONENT-PARITY.md).

The original 20 October A–C screenshot set used fictional showtimes; Hero B also received a browser-only selector correction. That set has been replaced, and unused legacy images removed. Fresh captures must preserve the real page, including empty programming states, with no data fixtures or CSS corrections. Illustrative or partial captures may remain catalog evidence, but are excluded from customer choices.

To ingest a verified inventory and capture observations from the sibling `evidence` directory:

```sh
node scripts/sync-evidence.mjs
node scripts/sync-evidence.mjs ../evidence/observations.json
```

The observations format is `{ capturedAt, variants: [{ id, sections: [{ slotId, name, components, image, width, height, sectionIds, capture }] }] }`. Only inventory-verified variant IDs are accepted. Each included variant is a complete rendered-page observation: older options absent from that observation are removed. Image paths resolve relative to the observations file and must stay within the INDY workspace.

For a repaired component, include explicit `canonicalComponent`, `componentStatus: "present"` and `componentNote` describing the reviewed source content. This updates that component's audit record. A screenshot refresh alone preserves existing audit caveats; a changed section identity without semantic review is marked unverified. Use `designNote: null` to clear a resolved design caveat. Required private-party captures use the existing `events` slot; unrelated public programme content belongs in an additional category.

Ingestion retains reviewed display labels and original `sourceName`/`sourceAliasNote` metadata. Use an explicit `displayName` to replace a picker label, or `displayName: null` to return to the observed native name. Existing `visualReview` metadata keeps its original capture key, so refreshed images become unchecked; supplying new capture data never passes a review automatically.

To apply a complete, site-matched semantic audit to the catalog:

```sh
node scripts/sync-component-audit.mjs ../evidence/component-parity.json
```

This imports the supplied site-matched audit, so do not reapply an older audit over newer reviewed evidence. The current audit is retained in `evidence/component-parity.json`; the original is `evidence/component-parity-baseline.json`. It does not create options for missing sections or alter images. For reviewed source repairs and native full-page/viewport-tile processing, follow [the capture workflow](docs/CAPTURE-WORKFLOW.md).

To refresh approved selectors directly from the published consumer site, install the capture-only Playwright dependency and its browser, then run:

```sh
npm install
npx playwright install chromium
npm run capture -- --variant=variant-k-clubhouse
npm run capture -- --variant=variant-k-clubhouse --mobile
```

The refresh script requires exact, verified `capture.selectors` (or `sectionSelectors`) for each option. It skips unverified mappings, fails if a selector stops resolving uniquely, and preserves the catalog when no capture jobs are available. It does not inject fixtures, repair the source page, publish INDY content, or deploy the picker.

Native movie widgets have useful layout controls, documented in [movie-widget research and policy](docs/MOVIE-WIDGETS.md). Keep a shared Movies function in the eventual website baseline. Now Playing, Coming Soon and Ticket Finder remain research choices in the underlying catalog, outside this customer checklist, until actual layouts have populated desktop/mobile evidence. A compact booking selector is not a replacement for film discovery.

## Library reuse model

Keep a full variant as its reference page. The Clubhouse food pilot uses the actual native **Concessions Menu**, independently of K's experiential “Stay Awhile” Text Block. Its one-section carrier was promoted to a Library Page, imported cross-site and unlinked. Library Page import creates a separate Page. Assembly inside an existing Page was verified separately by native widget recreation, portable Section CSS and ordering; direct Library Section insertion and native cross-page copying remain unverified.

Before promoting a section, record its native widgets, section/page CSS, Theme & Style dependencies, media, links, and dynamic data needs. Header, navigation, and footer need separate site-level handling. Test one section and one destination copy before creating the full collection.

For an independent local starting template, the destination workflow is **Add From Library → Unlink → verify Not Linked → customize**. Turning Library Updates off retains the link and a Force Update can still refresh it. Keep a link active only when synchronized upstream updates are intended. The model export records this policy and the current verification status; it never creates or unlinks pages automatically. K's [portable package](template-adapters/library-k-food/README.md) preserves its historical Admin evidence, destination-data dependencies and internal-name/CSS-scope caveat. The later [published independent-copy phase](evidence/library-k-food-live/README.md) passed current-palette desktop and 390px consumer checks: three/one columns, seven loaded photos and zero horizontal overflow. Its mobile category label can lag until further scrolling after a successful Desserts jump. Arbitrary palettes, physical devices, Mobile App, checkout, catalogue availability rules and controlled empty state remain untested. Normally use one visible food Section per finished slot; the live phase hides the original comparison menu and removes its floating bar. See [the Library investigation](docs/INDY-LIBRARY.md) for rollout details.

## Files

- `app.js`, `index.html`, `styles.css`: browser UI.
- `model.mjs`: selection normalization, presets, versioned export and transfer planning.
- `workflow.mjs`: ordered steps, eligible choices, explicit confirmations and customer summary.
- `colors.mjs`: hex normalization, brand colors and WCAG contrast calculation.
- `hub.mjs`, `data/template-hub.json`: read-only Templates tab, approved A–I display names and internal demo readiness.
- `data/build-modules.json`, `scripts/build-module-index.mjs`: catalog-pinned source/package readiness and artifact hashes.
- `catalog.json`, `screenshots/`: verified collection and image assets.
- `scripts/serve.mjs`: local static preview server.
- `scripts/sync-evidence.mjs`: inventory/capture ingestion.
- `scripts/sync-component-audit.mjs`: semantic component audit ingestion.
- `scripts/prepare-parity-metadata.mjs`, `scripts/process-captures.py`: exact-source semantic metadata and genuine browser-image processing.
- `scripts/capture.mjs`: opt-in refresh of verified selectors.
- `tests/model.test.mjs`: selection migration, missing sections, export and asset integrity.
- `tests/colors.test.mjs`, `tests/workflow.test.mjs`: contrast boundaries, saved confirmations, fixed customer choices and summary behavior.
- `tests/palette-contract.test.mjs`: complete palette migration, bindings, build-contract confirmations and artifact digest integrity.
- `tests/parity-catalog.test.mjs`, `tests/evidence-sync.test.mjs`, `tests/process-captures.test.py`: six-component presets, capture provenance, source identity, crop coverage and ingestion checks.
