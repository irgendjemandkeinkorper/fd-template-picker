# Input contract

## Picker export: source selections

Accept `fd-template-picker/v3` JSON produced by `model.mjs` `buildBuildBrief()`, containing the ordinary rich export plus `buildContract.version: 1`. Keep its original bytes and compute SHA256. A URL `#s=` selection snapshot and customer TXT omit build context and should be reopened/converted by the picker, not reinterpreted as a complete native package. v1/v2 exports can be migrated against their matching catalog after checking changed/missing option IDs; do not normalize away missing data.

Relevant existing fields:

| Field | Meaning |
| --- | --- |
| `schema`, `exportedAt`, `project` | Export format, timestamp and customer label; project is not a final native Site name. |
| `palette.version`, `palette.roles`, `palette.nativeBindings` | Requested colors plus explicit current adapter bindings. Legacy `brandColors` mirrors Primary/Secondary. |
| `typography` (optional), `typographyBindings` (derived, if supplied) | Requested web-safe font IDs for headings/body/interface. The normalized selection is authoritative; descriptions do not prove native application. |
| `workflow.confirmed` | Exact branding confirmation (palette plus supplied typography) and six current option IDs. Reconfirm changed fonts, colors or components. |
| `sections[]` | Ordered choices; use only `included: true`. Resolve `canonicalComponent`, not display names. `events` can mean canonical `private-parties`. |
| `sourceSite`, `sourceReference`, `sourceIdsOnly` | Read-only evidence locations. Source draft and published IDs are separate identities. |
| `buildContract.catalog.{generatedAt,sha256}` | Digest of the exact catalog bytes used for the build brief. |
| `buildContract.moduleIndex.{schema,sha256}` | Digest of the exact module registry bytes. |
| `buildContract.modules[]` | Included stable option IDs, canonical component, installation/readiness metadata and artifact hashes. Reconcile with included `sections`, not another display label. |
| `buildContract.destination` | Always `null` in the picker output. The picker does not authorize or choose a destination. |
| `publicationPolicy`, `destinationAuthorizationRequired`, `sourceIdsAreDestinationIds` | Must be `draft-only`, `true`, `false` respectively. |

Validate exact catalog/module-index/artifact bytes locally. Do not fetch and execute an exported URL or accept an unknown artifact as trusted code. If files are unavailable or digests differ, retain the brief, report the specific mismatch and obtain its matching build package or intentionally regenerated brief. Rebuilding a catalog or module index to make an old hash appear current would erase provenance.

Canonical required components are `navigation`, `hero`, `food`, `private-parties`, `membership`, `contact`. Require one selected option for each and no conflicting duplicate placement. Other included choices require explicit scope; now-playing/coming-soon/ticket-finder are optional native-data modules, not automatic additions.

Current palette role keys, in picker confirmation-key order:

```text
primary secondary header accent dark background positive negative info warning splashBackground seatSelected seatAvailable
```

The current confirmation key is `palette/v1|primary:#RRGGBB|...|seatAvailable:#RRGGBB|header:header|accent:accent`. The helper also accepts the coherent legacy suffix `|header:dark|accent:secondary` when the brief declares those legacy bindings. Require six-digit values and compare normalized uppercase values. Mixed or unsupported binding pairs fail; do not rewrite a legacy brief to impersonate the current contract.

Preflight checks Primary/Secondary and Dark/Background. Either pair below **3:1** blocks proceeding and cannot be acknowledged. When both pairs reach **4.5:1**, the base normal-text check passes. For a current-binding brief with either pair from **3:1 to below 4.5:1**, retain the original `colorAcknowledgment`: `policy: "contrast-review/v1"`, the exact current `paletteKey`, a valid `acknowledgedAt`, and the picker's exact statement, “I understand these colors do not meet the 4.5:1 accessibility requirement for regular text. I want to continue with this palette for review.” A changed palette invalidates the old acknowledgement. Legacy briefs retain the 4.5:1 minimum. Do not fabricate, update or broaden a customer's acknowledgement to clear a blocker.

An acknowledged result is **review-only**, not a compliance claim, native-edit authorization or portable-module promotion. Rendered derived tints, protected captions, native statuses/seats and arbitrary customer palettes still need separate checks. The selected screenshot colors remain unchanged.

## Optional web-safe typography

New briefs can add this field without changing the v3 build-contract version:

```json
{
  "typography": {
    "schema": "fd-typography/v1",
    "roles": {"headings": "georgia", "body": "arial", "interface": "arial"}
  }
}
```

When typography is supplied, `workflow.confirmed.colors` is the existing palette key followed by `|fd-typography/v1|headings:<id>|body:<id>|interface:<id>`, in that role order. Changing any requested font invalidates that branding confirmation. A legacy brief with no typography retains its palette-only confirmation. `colorAcknowledgment.paletteKey` stays bound to the **bare palette key**, not the font suffix; changing fonts does not fabricate or widen a palette acknowledgement.

The supplied object must contain only `schema` and `roles`; all three role keys are required and additional roles are rejected. IDs are exact lowercase allowlisted values:

| Font ID | Requested family |
| --- | --- |
| `arial` | Arial |
| `verdana` | Verdana |
| `tahoma` | Tahoma |
| `trebuchet-ms` | Trebuchet MS |
| `georgia` | Georgia |
| `times-new-roman` | Times New Roman |
| `courier-new` | Courier New |

A brief with no `typography` remains valid legacy input. Do not edit its original bytes or invent a customer font choice; retain source-package typography until the user supplies a choice. A supplied null, unknown schema, missing role, arbitrary font name, CSS expression, remote URL or custom font definition is invalid. No font upload or external font service is authorized by this selection.

If supplied, `typographyBindings` is a three-role map whose per-role `fontId` must match the normalized selection; `family`, `stack` and `appliesTo` describe derived intent. Use the validated `typography.roles` as the authority rather than executing a stack or selector string from exported text. Font fallback can differ across devices. These are **requested build settings**, not proof of separate native heading/body/interface controls or successful application. Preflight reports `nativeMappingVerified: false` and requires native mapping plus rendered review; its local acceptance does not certify those capabilities or bypass packaging/target gates.

Map headings to appropriate title levels, body to prose, and interface to button/navigation/control labels using the actual authorized destination's controls and module fields. Preserve native icon fonts. See [native capabilities](native-capabilities.md#requested-typography-mapping) and [draft acceptance](draft-acceptance.md). Screenshots remain source-design evidence; do not assume their type reflects a new requested font mix.

## Execution request: destination and scope

Create a separate `fd-indy-build-request/v1` file from the user's actual instructions; never edit source IDs into destinations. Its fields are a reproducible record, **not self-granted permission**. The operator must verify every asserted authorization against the user conversation. A request can be completed incrementally during read-only preflight; unresolved names/settings block mutation.

The example below is a **draft-only new-site request using the current reference Circuit**, not a release request or a universal destination/design restriction. The actual nine-demo rollout has its own explicit publication authorization outside this v1 draft request. General builds use their own authorized Region/Circuit/Site, content policy and page plan. `designScope.allowedVariants` is an optional request-specific restriction: if omitted, all variants represented in the matching catalog may be considered, with individual module-readiness gates. It does not infer authorization from the catalog or make an unverified choice portable.

```json
{
  "schema": "fd-indy-build-request/v1",
  "pickerBriefSha256": "<SHA256 of the original JSON build brief>",
  "destination": {
    "region": "US-BETA",
    "circuit": {"mode": "existing", "name": "INDY Demo", "id": "<verified destination Circuit ID>"},
    "site": {"mode": "create", "name": "<final approved new Site name>", "id": null},
    "startingTemplate": {"name": null, "id": null, "verifiedInNativeUi": false}
  },
  "authorization": {
    "basis": "user-session",
    "evidence": "<specific user instruction and date/turn reference>",
    "actions": ["create-site", "save-drafts", "configure-theme", "configure-navigation"],
    "sourceMutationAllowed": false
  },
  "hosting": {"createConsumerWebsite": false, "triggerDeploy": false, "customDomain": null},
  "publicationPolicy": "draft-only",
  "designScope": {"allowedVariants": ["variant-a-circuit", "variant-b-rep", "variant-c-late", "variant-d-odd", "variant-e-grid", "variant-f-concrete", "variant-g-cut", "variant-h-storybook", "variant-i-ma"]},
  "sitePlan": {
    "homepage": {"title": "Home", "requestedPath": "/home", "assignAsHomepage": false},
    "sectionShowcases": true,
    "showcaseTitles": {},
    "finalSectionNames": {}
  },
  "content": {"policy": "same-approved-demo-content", "seedManifestPath": null, "seedManifestSha256": null},
  "stopForReview": true
}
```

Angle-bracket strings above are explanatory, not valid executable values. Supply a real final Site name, Page creation titles and one internal Section Name per native child after module packaging. `showcaseTitles` maps canonical page components to final creation titles. `finalSectionNames` maps selected `optionId` to an ordered array of final native child Names. Names can repeat across Pages while native Section IDs remain distinct; this does not require copying every full component onto Home and again onto supporting Pages. Record each component's intended Page role in the authorized page plan, with Showtimes/compact local links on Home for a standalone site. If an approved plan genuinely repeats a module, use its ordered Name list for each instance and journal `(destinationPageId, optionId, childIndex, destinationSectionId)`; repeated names do not establish a Library link or shared record. If different per-instance Names are required, revise the explicit contract before creating either copy rather than renaming later. Navigation is global and has no Page Section Name. A prepared module manifest defines child count/order; do not derive it from a screenshot. `requestedPath` is an intention: read back the actual generated slug; `/` homepage assignment is a separate setting. Check native reserved routes before choosing a creation title.

For an existing Circuit set mode `existing` and record the verified exact ID/name. The skill builds a **new Site**; existing-Site modifications require a separately scoped workflow. For a new Circuit, the native Create New Circuit card may create the first Site too; `create-site` authorizes the desired new Site, not permission to create it twice. IDs remain null until native creation confirms them. A pending Starting Template is a blocker, not a fabricated default.

For later hosting scope, add the specific action `create-consumer-website` and set `hosting.createConsumerWebsite: true` explicitly. Do not infer it from `create-site`. The observed native creation action also triggers its initial deploy; include that effect and possible public-shell exposure when establishing the authorized action. `hosting.triggerDeploy: false` forbids the separate manual **Trigger Site Deploy** control; it does not suppress the native initial deploy caused by an explicitly authorized Create Consumer Website. Custom-domain changes remain outside this draft-build request. A reachable consumer shell can still show a native 404 when there are no Pages/homepage; do not treat hosting creation as a transferred design or completed build.

Content needs an approved hash-bound manifest listing intended records, media, ownership, source/destination mappings and permissions. Use `content.policy: same-approved-demo-content` for the current reference rollout, or `approved-customer-content` for a customer build. The v1 field names `seedManifestPath` / `seedManifestSha256` hold that content manifest in either case. Demo seeding needs `seed-sample-content`; customer content needs `configure-content`. Configuring forms or membership products also requires the corresponding `configure-forms` / `configure-memberships` scope and native dependency validation. A URL or source item ID does not transfer a record. Do not create bookable live showings or real transactions merely to populate a layout.

One brief creates one mixed site. An explicitly requested batch should consist of separate bound requests and per-site journals; do not expand a request to nine Sites from the availability of nine visual designs. The current reference rollout's A–I and US-BETA / INDY Demo choices do not restrict other authorized builds. Any selected module still needs its own installation proof and destination dependencies, regardless of variant letter or target Region.
