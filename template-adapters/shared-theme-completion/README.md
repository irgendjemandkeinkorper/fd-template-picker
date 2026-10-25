# Shared Theme and navigation Admin color migration

**Prepared, not installed.** Target: US-BETA → INDY Demo → Adam Template Testing 2 (`site-170`). This closes the previously unprepared Site Theme/header part of the color migration. Root still needs a current native field readback, installation, draft/public desktop/mobile checks and a second palette test. Page and section migrations are separate native fields.

## Apply and rollback objects

- `site-theme.before.css` is the exact byte backup of the Theme CSS after the approved Concrete repair. Its SHA-256 is recorded in `manifest.json`. Confirm the current native field matches before applying; a mismatch requires rebasing.
- `site-theme.proposed.css` is the complete replacement for the existing **Theme & Style → Custom Styles** field. This is native editable Theme CSS, unlike the earlier compiled page/section proof files.
- `site-theme.diff` shows the changes to that exact field. `scoped-color-contract.css` is the new ending contract for review; it is already included in the full proposal and must not be appended a second time.
- Rollback is restoring the exact before field. It retains the approved Concrete repair.

The build uses the retained `evidence/component-controls-repairs/site-theme-after.css` readback. No INDY save, publish, Theme color change, Library change or deploy is performed by this folder.

## Maintained color roles

| Role | Native control | Template use |
|---|---|---|
| Primary | `--q-primary` | Primary emphasis, Primary border, 16% tint into Background |
| Secondary | `--q-secondary` | Active-state rule and 14% tint into Background |
| Dark | `--q-dark` | Ink and dark surfaces |
| Background | `--q-background` | Paper and light copy on Dark |

The native values were observed on the site **body**, not the document root; root values may be framework defaults. This proposal does not redefine any `--q-*` control and does not require per-client CSS edits. The fixed tint recipes are central template decisions, not extra Admin color fields. Header and Accent are removed as additional brand inputs in the active A–F Site Theme rules. Status colors used in native widgets are outside this header migration.

The original Parlor base rules, native information-page rules and retired A/B/C navigation-page rules are preserved. Their inherited `--pl-*` values are rebound only while an A–L template is present. Existing source-ID selectors still need portable Library authoring work; these proposals do not establish Library portability.

The current shared Theme has exactly one `--pl-wine` consumer, the inherited native primary-button **background**. There are no retained A–L copy/text consumers. The alias remains native Primary, while the scoped native primary-action rules explicitly use Primary tint and Dark copy. In particular, Rep and Late no longer inherit transparent/background-copy overrides that would conflict with the page adapter's tint treatment.

## Header behavior

- Circuit, Late, Grid, Concrete and Standard (G–L): native Dark header with Background labels/icons.
- Rep and Odd: native Background header with Dark labels/icons.
- Highlighted native links on Circuit/Odd/Grid/Concrete: Primary tint with Dark copy. The source Primary remains the border/emphasis hue.
- Native primary actions in all A–L page families: Primary tint, Dark copy and Primary border, matching the page/section adapter contract.
- Odd drawer: Secondary tint with Dark copy. Other drawers retain their native Dark/Background scheme.
- Active drawer items keep legible copy and gain a Secondary border marker.
- Late's header becomes fully opaque Dark, replacing the old 55%-opaque literal color; its native icon/button text also receives a Dark shadow. Image changes cannot invalidate the header surface pairing.
- Concrete's approved 240px containment, logo centering, inline counters, scroll and responsive geometry remain unchanged. Native hover surfaces keep Background/Dark.
- All templates gain a two-tone Dark/Background focus cue.

The other slideshow/hero text protections belong to the page/section work. This Theme proposal does not claim that those overlays have been repaired or verified.

## Flat navigation and dropdown boundary

Root's current public Circuit header readback has all seven native navigation items, with no child-navigation trigger or submenu. The observed navigation is flat. Account menus are separate native controls. No fabricated dropdown selector or broad `.q-menu` override is added to this proposal.

The native Theme desktop dropdown configuration still selects Secondary as its menu background and custom white as its text. This is a latent low-contrast combination if child navigation is added. It is not corrected by this migration, because those native settings affect other Site information pages and no real child-navigation menu DOM has been observed. Before enabling a dropdown, configure and verify the native menu Dark/Background pair and review an actual open submenu. Do not certify dropdown support from flat-navigation screenshots.

## Contrast evidence and remaining checks

Current native inputs: Primary `#e06b4a`, Secondary `#c4553a`, Dark `#38264a`, Background `#fbefe2`. Solid Primary/Dark is **4.13:1**, Primary/Background **2.91:1**, and Secondary/Background **3.94:1**. Those are unsuitable normal-text pairings. The new tint treatment avoids using those solid pairings for text.

| Pair | Current native palette | Independent sample palette |
|---|---:|---:|
| Dark / Background | 12.01:1 | 15.81:1 |
| Dark / Primary tint | 10.24:1 | 12.56:1 |
| Dark / Secondary tint | 10.13:1 | 14.30:1 |

These are arithmetic checks on the exact fixed **sRGB** recipes. The independent sample uses Primary `#1765a8`, Secondary `#e0a800`, Dark `#151f2e`, Background `#f7fafc`; it has not been applied in INDY. Do not report it as a native second-palette test. Arbitrary Dark/Background choices can still fail. Staff must check their chosen base pair and each resulting tint before using them for client text.

After saving, verify actual computed native color values on body, desktop links and account/search icons, keyboard focus, all open mobile drawers, active links, highlighted links, hover/disabled states, inherited footer copy and each page's native primary actions. Review actual published routes and saved state. No template is certified by a successful generator run.

## Generate and verify

From the repository root:

```text
python template-adapters/shared-theme-completion/build.py
python -m unittest discover -s template-adapters/shared-theme-completion -p test_theme.py -v
```

Ten structural checks cover byte-preserved unrelated rules, the Concrete containment block, literal/extra-brand-input removal in active A–F rules, unknown-paint blocking, all twelve scoped roles, original layout/type preservation, native action agreement with the Page adapter, known unsafe/current safe contrast pairs, an arithmetic second sample and generated hashes. They do not substitute for native preview and publication evidence.
