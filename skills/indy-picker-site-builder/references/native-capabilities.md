# Native capabilities and evidence boundary

This records retained evidence and reference-pilot status as of 2026-10-26. UI labels and permissions can change; inspect the signed-in Chrome session before choosing controls. Observed controls are not proof of a completed provisioning workflow. No native provisioning API is established by this package.

## Current capability map

| Operation | Evidence level | Consequence |
| --- | --- | --- |
| Create New Circuit plus its first Site | One US-BETA pilot confirmed Website Templates Circuit 103 and Showcase Site 183 after the create action returned HTTP 500 | Refresh and inspect scoped inventory before retrying; that error did not mean creation rolled back. This is bounded native-UI proof, not an API or full design-build proof. |
| Standalone Create New Site inside an existing Circuit | Native card/fields observed; this separate action is not verified by the combined Circuit/first-Site pilot | Inspect required fields, Starting Template choices, create-consumer option and current permissions before use. |
| Page/Section creation, settings, raw CSS save/readback, native ordering | Verified in existing sites | Recreate captured native widgets in a new authorized draft; assign final Name before first save. |
| One-section K Food Library Page promotion, import and Unlink | Verified within US-BETA / INDY Demo | Page-level transfer only; this is not direct insertion of a Library Section into a homepage. |
| K Food native recreation and ordering inside an existing Page | Verified saved/reopened draft, followed by separately authorized Page 5585 publication | Repeat the recorded native widget/settings/CSS construction after target dependency checks; not a generic Section-import feature or authority to publish a new build. |
| A–I independent modules in a mixed destination | Not yet verified | Package and validate individually; source QA cannot replace isolation/assembly proof. |
| Cross-Circuit / Region Library transfer | Not verified; Showcase's read-only Add From Library listed five stock Pages, with no A variant or K module; no import performed | Do not assume the INDY Demo Circuit Library is available in Website Templates or another customer Circuit. |
| Circuit Library provisioning | Support dependency noted; not executed | Do not press an irreversible Create Library Site as a shortcut to ordinary Site creation. |
| K recreated menu on consumer Page 5585 | Current-palette desktop and actual 390px consumer browser viewport verified in `evidence/library-k-food-live/live-journal.json` | Seven cards/photos, 3/1 columns, zero root/document overflow; mobile heading 32px. Native category label can lag until scrolling. Physical devices, arbitrary palettes, empty state, Mobile App and checkout remain open. |
| Consumer Theme / real phone for the separate K carrier and Library-import copy | Still pending for those separate records | Page 5585 live proof does not publish or certify the separate carrier/imported Pages. Older Admin-only flags remain historical evidence. |
| Consumer-site creation on Showcase 183 | Explicit native Create Consumer Website recovery reported creation/initial deploy, populated hosting fields and enabled Preview; public consumer app reachable with native 404 and Admin Pages empty | Hosting exists, but no selected design, Page or homepage was copied. Do not repeat Circuit/Site creation or manually redeploy to remedy missing Pages. |
| Saving a different Netlify Site Name / Hostname | Short-name fields persisted but its URL served an unrelated site; one approved longer-name deploy test still did not establish a rename; working address restored | Native Save or a deploy badge does not prove hostname reassignment, ownership or intended-site routing. Showcase's existing host is now an accepted exception; do not resume its replacement test. |

## Native provisioning inventory

The observed Developer landing route is `#/developers`:

- **Create New Circuit:** Starting Template, Circuit Name, Site Name, Create Consumer Website, then Create New Circuit.
- **Create New Site:** Starting Template, Site Name, Create Consumer Website, then Create New Site.
- **Create Library Site:** separate operation, warning that it takes minutes and cannot be reverted.

The current reference rollout plans A–I Sites in US-BETA / Website Templates. **Showcase is the pilot Site name; TEMPLATE STANDARD is the operational Starting Template.** It is not the selected visual design. The initial Create New Circuit returned HTTP 500, but refresh confirmed **Circuit 103 / Site 183**. Do not retry that creation: resume the verified new target through its build journal. These are retained pilot facts, not defaults or destination authorization for unrelated customer builds.

Hosting was initially blank with Preview disabled. Within the approved hosting scope, only **Developer Site Settings → Create Consumer Website** was retried; it reported that the consumer website was created and its initial deploy triggered. Reload showed Netlify Subdomain **showcase-indy-consumer**, a populated Site ID, branch **showcase**, blank custom Hostname, Preview enabled and Create Consumer Website disabled. The public consumer app resolves but displays its native 404, **Oops. Nothing here**; native Admin Pages is **No Pages**. TEMPLATE STANDARD did not copy design A or any Pages. Sample movies/food/venue inventory is not complete. Only a stock Library list was inspected; nothing was imported. Resolve `evidence/website-templates-pilot/pilot-journal.json` against the supplied picker repository root for exact native evidence and current identities, including when this skill is staged or installed elsewhere.

Determine whether each build's selected Starting Template is an operational Site/Circuit seed, what data it seeds, and whether creation publishes a consumer shell. A picked visual variant is not evidence that a same-named Starting Template exists. Verify required fields and current target scope in the UI. If the operation cannot be executed with website creation disabled as requested, stop before creating rather than changing hosting policy silently.

After an authorized create, wait for an observable result, re-open selectors, and record the actual new Circuit/Site IDs and names. A timeout or server error is an unknown outcome: search the scoped native inventory before retrying; do not create duplicates. Re-verify new selectors before any subsequent save. If a required control, target or permission differs from the plan, keep other targets read-only and report the exact capability gap.

## Hosting is a separate layer

**Accepted naming policy:** keep Showcase's existing `showcase-indy-consumer.netlify.app` address. For **future reference-Site iterations**, plan `template-<name>-indy-consumer` during new consumer-hosting creation, and retain one-word Site/display names. Showcase is an explicit unprefixed exception; do not continue its existing-host replacement test. The future-prefix preference is not a universal rule for customer builds or proof that custom-name provisioning works. The user requires URL changes through **INDY Developer Site Settings**; do not require an external Netlify login. No external login was performed in this phase. Record desired native fields and the actual public destination separately, and do not guess changes to Netlify IDs or Git branches to match a name.

The bounded naming result is recorded in repository-relative `evidence/website-templates-pilot/url-naming-journal.json`:

- A Name-only save of `template-showcase` was rejected because **Hostname is required**, despite its initially auto-created blank value. Adding `https://template-showcase.netlify.app` allowed Save, and both fields persisted on reopen.
- That exact short URL served an **unrelated React/NFT site**. It was a collision, not a successfully renamed INDY consumer site.
- The corrective save restored **Netlify Site Name = `showcase-indy-consumer`** and explicitly set **Hostname = `https://showcase-indy-consumer.netlify.app`**, because blank was disallowed. Both persisted; Netlify Site ID and Git Branch Name remained unchanged. This is the current saved working address.
- The longer `template-showcase-indy-consumer` Name and full Hostname were saved for **one explicitly approved Trigger Site Deploy test**, requested at **2026-10-26 01:06:14.767 UTC**. INDY reported Deploy Request Sent and roughly two minutes. A fresh public check after roughly four minutes still returned **Netlify Site not found**. A Success badge was observed for the unchanged Site ID, but no exact job/build ID was established and the candidate version link did not resolve. This did not verify a hostname rename, ownership or availability.
- After that test, the original working Name and full Hostname were restored and reopened/read back with the same Site ID and branch. The existing address still serves the INDY empty shell; no selected design or homepage is established.
- A further proposal with prefixed Name/Hostname and an empty Site ID was prepared **unsaved**. The user declined it. Reload discarded the proposal; no identity replacement was saved and no additional Create Consumer Website was executed. The user's final direction is to keep Showcase's current host and apply the prefix only to following iterations. **No hosting approval or unsaved proposal remains pending.**
- Native Netlify Deploy Status and advanced choices were inspected; no rename control was observed and no advanced Execute action was pressed. Exactly one approved manual deploy was submitted in the naming phase. That approval does not authorize another deploy or a provisioning retry.

A successful native Save or deploy badge alone cannot close a hostname change. Verify native readback, exact public URL, intended Site identity and absence of an unrelated destination before using it in the Hub or reporting completion. Plan the desired prefix before future consumer-host creation; the existing-host test did not verify a prefixed provisioning method. If INDY controls have not produced a verified result, report that capability gap within the requested Admin-only workflow rather than requiring provider login or assuming another deploy will rename the host. Preserve the accepted Showcase exception without further hosting actions.

Observed **Developer → Developer Site Settings → Hosting**, route `#/developers/settings/site-settings`, contains Display Hostname, Hostname, Netlify Site Name / Netlify Subdomain (labels differ between retained screens), Netlify Site ID and Git Branch Name; actions Create Consumer Website, Preview Site and Trigger Site Deploy. Keep internal hosting identifiers in the private build journal, not the customer handoff.

Do not copy or guess these values. A View Page path containing `/null/` is not proof of missing hosting; inspect Hostname/Netlify Site Name or Subdomain read-only and verify an existing URL. Content Save, Page/Global Widget Publish, register-configuration push and Netlify deploy are different operations. Explicit consumer-site creation can initiate its first deploy; that does not authorize later manual Trigger Site Deploy actions. The Admin top-bar publish control can push register configuration and is not a website publish control. Do not use Trigger Site Deploy for ordinary saved drafts, a missing homepage or an automatic retry.

## Evidence to locate in the picker checkout

These are repository-relative paths; the operator supplies the actual checkout location:

- `template-adapters/library-k-food/dependency-manifest.json` — exact raw Section/widget settings, artifacts, transfer and native-recreation proof, pending checks.
- `evidence/library-k-food-pilot/pilot-journal.json` — source carrier / Library / destination records, unlink and historical scope-repair evidence.
- `evidence/library-k-food-assembly/assembly-journal.json` — separate existing-Page native recreation/order, saved draft.
- `evidence/website-templates-pilot/pilot-journal.json` — combined Circuit/first-Site creation despite HTTP 500, explicit consumer-hosting recovery, reachable native-404 shell and empty Page inventory; no selected design or module transfer.
- `evidence/website-templates-pilot/url-naming-journal.json` — INDY-only short-host collision, exactly one approved longer-name deploy test without verified rename, restored working address, declined/discarded reprovisioning proposal and accepted existing-Showcase/future-prefix policy; no pending hosting approval.
- `evidence/library-k-food-live/live-journal.json` — later authorized published result on US-BETA / INDY Demo / Adam Template Testing, Page 5585 / editable 5586, Not Linked. Original Section 23540 was hidden, not deleted; recreated editable 25156 is published as 25157. Actual desktop 1536px and phone 390px each show seven loaded photos and zero root/document overflow; phone heading is 32px. Current Primary/Secondary/Dark/Background were `#e06b4a` / `#c4553a` / `#38264a` / `#fbefe2`. The native mobile selector can jump to Desserts while retaining Drinks until additional scrolling updates the label. Hosting was unchanged and no deploy was triggered. This supersedes older consumer-QA-pending flags only for that published recreated menu and tested palette/viewports; separate carriers and broader states remain limited.
- `docs/INDY-LIBRARY.md` — current transfer findings, distinctions and scope limits.
- `template-adapters/admin-controls-completion/FINAL-STATUS.md` and `evidence/admin-controls-completion/final-qa-report.json` — source-site color/overlay acceptance, not module portability or new destination acceptance.

If available, read the installed `fandango-website-edits` references `developer-menu-inventory.md`, `hosting-and-deployment.md`, `complete-site-build-playbook.md` and `platform-operating-model.md` for the operation at hand. Their retained initial-build facts are evidence, not permission to edit those old targets. Current user instructions govern scope and confirmation; preserve exact target checks and unresolved-action gates.
