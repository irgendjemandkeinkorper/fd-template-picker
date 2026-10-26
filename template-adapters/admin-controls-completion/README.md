# Native Admin controls completion

Target: **US-BETA → INDY Demo → Adam Template Testing 2**. The approved A–L color and caption implementation has been saved through native Admin, with the 12 template pages published. The [native journal](../../evidence/admin-controls-completion/changes-journal.json) records exact saved-field readbacks, QA corrections, publications and palette restoration. These local generators do not save or publish anything themselves.

Use the generated [current implementation and QA status](FINAL-STATUS.md) and [48-capture report](../../evidence/admin-controls-completion/final-qa-report.json) for the final evidence gates. They distinguish the completed color implementation from whole-template Admin maintenance, Library transfer and service configuration. Old catalog screenshots require their own native recapture and visual review.

The [66 reviewed native clips are now ingested byte-identically](../../evidence/admin-controls-completion/captures/admin-controls-published-clips-001/ingestion.json). Screenshot completion is separate evidence from native color saves; source product placeholders remain unchanged.

Native readback provenance is sealed explicitly once in the journal. Each retained `nativeSavedVerifiedAt` is bound to the exact saved artifact SHA-256 and immutable manifest. It is the root-attested local readback-file timestamp, not a server save time. Reports use this sealed value rather than checkout mtimes and still reject changed bytes/hashes. `seal_native_readback_provenance.py --seal-current-readbacks` is a one-time operation; it refuses an existing/partial seal. Report and guide rebuilds never seal or refresh timestamps.

The original 29-field `native-proposals` bundle is frozen. Its generator now refuses to overwrite a nonempty output folder. Subsequent fixes are additive exact-source revisions in `qa-corrections`, including native palette-override removal, foreground cascade fixes, and D/G actual mobile carousel containment. Never reapply an older baseline over a saved QA revision.

The previous `brand-tokens` bundle maps observed colors well, but its compiled CSS cannot be pasted into Page Custom CSS. This revision works from the **exact current raw native field** and preserves its authoring scope: unprefixed selectors in Page CSS, `&` in Section CSS. It rejects compiled `.page-variant-…-ID` output, unknown literal colors, mismatched Odd headings, and accidental overwrites of a local proposal.

## Maintained color contract

Client branding comes from native **Primary, Secondary and Dark**, with native **Background** as the canvas and opposing copy color. Header aliases read Dark; Accent decoration reads Secondary. Native Warning and error feedback retain their status meanings and are not reclassified as client branding. Typography, layout, crops, tilts and decorative geometry remain template design decisions.

The actual palette makes some original solid pairs illegible: Dark/Primary is 4.13:1; Background/Primary is 2.91:1; Background/Secondary is 3.94:1. The proposed shared CTA treatment therefore uses **Primary 16% mixed into Background**, Dark copy and a Primary border. Secondary cards use **Secondary 14% mixed into Background**, Dark copy. Primary and Secondary remain full-strength where purely decorative.

Both native Dark and Background must remain a readable pair. A color picker can choose two identical values; CSS cannot guarantee contrast for arbitrary native values without a supported contrast-aware foreground control. `palette_report()` tests all new exact sRGB recipes against 4.5:1. Root also changed the actual native Admin palette to Primary `#176B9D`, Secondary `#F2CA52`, Dark `#122C43`, Background `#F7FAFC` and captured desktop/phone results; the journal records original-palette restoration separately. The final report requires exact native colors, current complete captures and measured/bounded copy contrast. It does not certify unseen hover/focus states, future populated widgets or arbitrary colors.

Peer review found further original foreground/surface collisions and weak metadata. The native page append explicitly splits Odd's price stickers and colored small copy, strengthens Odd/Grid muted metadata, tints Grid's Secondary badge chips, and retains Cut's alternating food/event/contact panels with readable tint/Dark pairs. These corrections preserve geometry. They are included in `variant_readability_adapter()` rather than hidden behind a blanket foreground override.

For the reviewed A/B/C/H/I/J/K/L source occurrences, literal Primary/Secondary/Accent used as **text** is separately mapped to a strong copy-emphasis role on the known base canvas. That transformation changes only actual `color` declarations; brand backgrounds, borders and decoration retain their roles. A/C's text-only alpha mixes below85% are strengthened, while decorative image opacity remains untouched. Late's food-card copy also crosses product images; its exact existing text panel receives opaque Dark backing and Background copy.

## Native installation map

| Field | Correct source and operation | Scope |
|---|---|---|
| Page Custom CSS | Capture current raw field; transform it as `kind='page'`; append that page's caption/form/action adapters | A–L, including empty K page field if this is the chosen shared-adapter home |
| Section Custom CSS | Capture each actual non-empty section field; transform it as `kind='section'` | All original Custom/Concessions/Form styles plus G/H/I membership and B/J/K/L added module styles |
| Theme & Style Custom CSS | Separate shared-theme/header migration, prepared by the header owner | Preserve Concrete's approved geometry fix; no page compilation here |
| Odd membership content | Read and back up actual body; add only `fd-tier-primary`, `fd-tier-secondary`, `fd-tier-dark` to the three matched card wrappers | Save atomically with its corresponding card CSS; titles/benefits/prices/links/tilts unchanged |
| Native form configuration | Keep routing/fields/status semantics; scoped CSS bridge binds generated inline `--generic-form-field-*` defaults to maintained roles | Inline defaults exist in current A–L form DOM; source HTML must not be edited to override generated form fields |

`source-dom-inventory.json` enumerates actual retained native carousel caption roles, public section identities, authored link classes and inline widget paints for every A–L source. Public IDs are evidence, **not editable draft IDs**. `action-paint-inventory.json` lists original button/custom-link paint rules requiring cascade review. The adapter includes the observed A shelf/membership/find-us actions, C membership/find-us actions, D membership/ask-note actions and E primary action. Rep and Ma's text-only links keep their transparent, underlined treatment. No change to click handlers, destinations, disabled behavior or widget inventory is made by this CSS.

Never split compiled CSS by cutting at a source ID or automatically stripping selectors. A raw field can legitimately reference exact sections, and compiled Sass can combine scopes. Native readback is the authority. Keep before/proposed hash and saved readback per field; verify the appropriate published page after preview.

## Media caption treatment

The retained DOM shows native image carousels in **A–I**. J/K/L's hero alternatives are editorial intro/welcome/opening text; they have no native carousel captions in this capture. Their actual film/media widgets and shared header still need separate overlay inspection.

Caption rules target only the verified hero section plus `carousel-hero-slide`, `carousel-slide-content` and the four native desktop/mobile caption classes. B/D/F/H retain Dark-on-Background editorial copy. A/C/E/G/I use Background-on-Dark captions. The backing is **opaque**, with a shadow; changing the image cannot change the text's underlying color. Empty captions do not paint blank bars. Native carousel arrows receive their own opaque Dark backing; no image-wrapper overlay or pointer interception is introduced. Ma's existing containment fix and 24px insets are preserved.

Root must preview actual desktop and phone dimensions before publishing. This helper does not infer success from the presence of selectors. If another source also contains an over-image heading, add only its observed role to the scoped adapter and record it.

## Prepare one native field

```text
python template-adapters/admin-controls-completion/native_fields.py --input native-backups/D-page.css --variant D --kind page --output native-proposals/D-page.css
```

For an existing native Section CSS field use `--kind section`. Add `--odd-classes-verified` only after exact HTML card matching. The command prepares a new file and JSON digest; it never contacts INDY. The Python API also exports `transform_native_css()`, `patch_odd_html()` and `palette_report()` for root orchestration.

## Evidence and remaining scope

- Exact native before/saved field exports and draft identities are retained; saved hashes are checked against the native journal.
- Odd's three semantic tier classes were saved with the maintained color treatment. Earned punch marks use Dark; empty unearned slots remain deliberately transparent.
- Public desktop/phone evidence for both native palettes is aggregated only after current-sampler completeness, palette and freshness checks. Captured states do not establish every image frame or interaction state.
- Support guides use the saved/published journal and distinguish fixed design presets from native content/color controls.
- Typography controls, finite slant/layout presets, generated wording, editorial data ownership, destination-site Library transfer and client service configuration remain separate gaps in the editability audit.

Library copy/unlink, native typography control, booking/product configuration and form delivery are outside this color-and-overlay completion. They remain independent handoff gates.

## Checks

```text
python -m unittest discover -s template-adapters/admin-controls-completion -p test_native_fields.py -v
python template-adapters/admin-controls-completion/inspect_sources.py
```

Tests exercise field-scope safety, unknown-color blocking, geometry/containment preservation, native form roles, Odd exact-heading/idempotent class changes, all caption roles, and contrasting versus intentionally failing palettes. They do not claim native installation or publication.
