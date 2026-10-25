# Brand token migrations — review bundle

These are local proposals for US-BETA / INDY Demo / Adam Template Testing 2. **Nothing in this bundle has been saved or published in INDY.** Compiled **page and section CSS** is covered for all 12 variants, with zero unmapped literal brand colors in that limited scope. Shared Site Theme and site-owned header/navigation CSS are excluded. Current contrast failures and native installation mapping remain open.

The objective is one maintained template implementation. Routine client changes should use native Theme & Style, Navigation, content/media, concessions, membership and form controls, with no client-specific CSS replacements.

The separate shared Theme/header paint migration is **not prepared**. A/B/C navigation and shared G–L header rules still contain literal paints; D/E/F navigation’s own system-token rules also inherit shared site styling. The 12/12 page/section result does not establish complete template or navigation coverage.

## Files

- [profiles.json](profiles.json): explicit semantic mapping for each original color. Mappings follow actual paint use, rather than nearest-color distance.
- [manifest.json](manifest.json): source hashes, replacement counts, preserved source IDs, remaining gates and current contrast failures.
- `proposals/variant-*.before.css`: unchanged current compiled source snapshots, including native section styles. K uses its separately captured CSSOM rules.
- `proposals/variant-*.proposed.css`: replacement proof with native system aliases, centrally derived tints and narrowly scoped role splits.
- [odd-membership-role-patch.json](odd-membership-role-patch.json): stable class additions to the three existing Odd cards; no copy, price, benefit, URL, font or slant changes.
- [migrate.py](migrate.py) and [test_migration.py](test_migration.py): reproducible generation and structural checks.

The default final source rebases Ma onto its published repair: native Light Text behavior, desktop/mobile caption selectors, dark 88% backdrops, shadows and positive 24px desktop subtitle offsets remain intact. Other 11 page/section snapshots retain their valid earlier source captures. Concrete’s approved navigation repair belongs to excluded Site Theme CSS and must be preserved when that separate migration is prepared.

**The CSS snapshots are compiled output, not native editable-field exports.** They retain observed page and section scopes. Pasting them into Page Custom CSS would add a second page prefix. Before installation, map each block to its current native page/section field, retain a backup of that field, and apply the substitution there. K demonstrates why page CSS alone is insufficient: its page field was empty while native sections carried the styles.

Generated CSS files use one terminal newline. Source hashes and character counts refer to the captured input before that whitespace normalization.

## Role contract

| Template role | Native source or central recipe |
|---|---|
| Primary / Secondary | `--q-primary` / `--q-secondary` |
| Dark / Background / Header | `--q-dark` / `--q-background` / `--q-header` |
| Accent / Warning | `--q-accent` / `--q-warning` |
| Primary / Secondary / Accent tint | 16% / 14% / 20% of that role mixed into Background |
| Dark tint / muted paper | 10% / 5% Dark mixed into Background |
| Muted paper text / muted dark text | 80% of Dark / Background mixed with the opposite surface |
| Paper / dark hairline | 28% Dark / 30% Background mixed with the opposite surface |
| Dark card depth | 12% Primary mixed into Dark |

Tint percentages are fixed, reviewable template design decisions. They are not extra color fields or inferred native presets. Existing neutral white/black in original mix recipes remain fixed design neutrals. Original typography, geometry, clipping, slants, filters and responsive arrangement are preserved by the color substitution. Native editable typography is a separate unresolved contract.

The role aliases are scoped to the observed page and its sections. Reusable Library carriers still need stable authoring classes and a real destination copy test; retaining source IDs here proves the migration did not alter scope, rather than proving portability.

## Deliberate differences by template

| Template | Paint decisions |
|---|---|
| Circuit | Dark card surfaces, Background copy, Primary cues, Accent ornament |
| Rep | Background paper, Dark copy, Primary actions, Accent rules |
| Late | Header outer ground, Dark card depth, Accent text/outlined actions; Primary action ownership remains a separate design choice |
| Odd | Existing system aliases retained; demo overrides removed; stable Primary tint, Secondary tint and Dark tint membership cards; Primary CTA |
| Grid | Native Dark ground and Background copy; Primary actions; Accent/Warning retain status meaning; demo overrides removed |
| Concrete | Native Background/Dark and derived lines, including native form custom properties |
| Cut | Dark/Background base; Primary rust emphasis, Secondary featured membership card, Accent ornament; shared amber action/card/ornament roles split explicitly |
| Storybook | Background invitation; Primary, Secondary and Accent pastels; Dark copy; Primary action |
| Ma | Background/Dark with Primary seal/underline; transparent membership action preserved |
| Box Office | Background/Dark, Primary actions, Secondary ticket-stub tint |
| Clubhouse | Background/Dark, Primary actions, Secondary party card tint, Accent club-card shadow |
| Midnight Lounge | Dark ground, derived dark surface, Background copy, Accent actions with Dark foreground |

Odd’s role classes follow card meaning, rather than card position. Add `fd-tier-primary`, `fd-tier-secondary` and `fd-tier-dark` to the existing wrappers identified in the patch. Keep their existing `od-club__tier od-tilt` classes and fixed slants. No native per-card color or slant editor is claimed.

## Contrast gates

The current native Admin palette does not support every tempting pairing:

| Actual pair | Ratio | Normal text |
|---|---:|---|
| Background / Dark | 12.01 | Pass |
| Header / Primary | 5.05 | Pass for current palette |
| Background / Secondary | 3.94 | Fail |
| Background / Primary | 2.91 | Fail |
| Dark / Primary | 4.13 | Fail |
| Primary / Secondary | 1.35 | Fail |

`on-primary` currently proposes Header, which passes this palette. This is a measured candidate, not a rule that works for every brand. `on-secondary` currently proposes Background and **fails**; Cut’s solid Secondary membership card is blocked until a native color pair or explicit supported foreground role passes. No automatic nearby-color selection is made.

Ordinary native text on Primary actions may still need an explicit foreground split where inherited styles remain. All actual CTA, card, form, muted-text, border/focus, hover/active/disabled, drawer and overlay states require rendered checks after migration. Derived tints are not certified by the base-pair result. Test a second distinct native palette without modifying CSS. Overlay protection is a separate adapter; this bundle does not silently add shadows or change image treatment.

## Rebuild and checks

From the repository root, using a Python 3 interpreter:

```text
python template-adapters/brand-tokens/migrate.py
python -m unittest discover -s template-adapters/brand-tokens -p test_migration.py -v
```

Default source locations are the task’s sibling `evidence/admin-controls-audit/` folder. Use `--source` and `--k-source` for preserved copies elsewhere. Source files are read-only. `--output` changes the generated CSS folder; the manifest remains next to this script.

Nine tests verify exact color identity and alpha handling, unknown-color blocking, comment/geometry/font preservation, demo override removal, all 12 page/section profiles, no remaining literal brand colors within generated page/section proposals, unchanged source scopes, the rebased Ma protection, the Odd patch and the known contrast gate. They also assert that shared Site Theme/header migration coverage remains zero. These are structural proof; no native preview, save, publish, second-palette test or Library transfer is inferred.
