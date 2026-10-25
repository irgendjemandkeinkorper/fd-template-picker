# Native color and overlay migration status

Generated from saved evidence: 2026-10-25T20:12:45.167937+00:00.

**Status:** accepted-with-bounded-manual-decoration-review. This report covers the approved color and overlay implementation; it does not certify every Admin control.

The native journal records 12 published template pages and 30 saved fields. Saved-readback/role checks: pass. Original palette restoration is verified in the native journal; the restored public matrix is accepted.

| Palette | View | Accepted captures | Accepted text samples | Retry |
|---|---|---:|---:|---|
| original | desktop | 12/12 | 1282 | None |
| original | phone | 12/12 | 1161 | None |
| test | desktop | 12/12 | 1282 | None |
| test | phone | 12/12 | 1160 | None |

| Bounded decoration | Palette | Minimum copy contrast |
|---|---|---:|
| C-constant-gradient | original | 7.80:1 |
| D-ruled-notepaper-label | original | 5.12:1 |
| C-constant-gradient | test | 9.29:1 |
| D-ruled-notepaper-label | test | 5.62:1 |

The [machine-readable report](../../evidence/admin-controls-completion/final-qa-report.json) records each exact-palette, completeness, freshness, overflow and failure gate. Freshness uses immutable, hash-bound journal readback timestamps; checkout file mtimes do not change acceptance. Those retained local readback times are not INDY server save timestamps. Report/guide rebuilds never create or refresh a seal. Old cycle files do not contribute accepted evidence.

Maintained client colors come from native Primary, Secondary and Dark, with native Background as the opposing canvas/copy color. Header aliases consume Dark; Accent decoration consumes Secondary. Status/error colors retain their service meaning. CTA/card tints keep meaningful copy on a measured native pair. Opaque caption panels and shadows protect the observed A–I media captions; J–L editorial heroes use their explicit native panel roles.

C’s six manual gradient flags are bounded by their actual identical, opaque computed stops; foreground alpha is included in the recalculated ratios. D’s MESSAGE label is tested against both bare paper and the darkest 22% Dark ruling. The report retains the exact per-capture bounds instead of treating the sampler’s ancestor-only ratio as final.

Template fonts, design slants/structure, source HTML/data bindings, CSS-generated wording, Library transfer behavior and service configuration remain separate work. An arbitrary future palette still needs whole-page checks. The picker’s two-color check covers one pair and cannot certify the final native site.

F’s missing hero media and G’s null mobile background-image configuration are preexisting source-media dependencies. This migration did not change their media configuration.

The separate [66-clip customer screenshot refresh is applied byte-identically](../../evidence/admin-controls-completion/captures/admin-controls-published-clips-001/ingestion.json), with independent hash-bound native pixel reviews. Source product placeholders remain unchanged.
