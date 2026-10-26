# Picker v3 browser verification

Verified in signed-in Chrome against the local picker at `http://127.0.0.1:4180/` on 25–26 October 2026.

- The existing **Test 3** selection migrated from v2 and retained its six selected styles, original Primary/Secondary colors, project name and seven confirmations. No selection was reset. Extra colors received the disclosed suggested starters.
- The color step presents six main controls and keeps the seven Advanced roles collapsed initially. Desktop and an actual **390 × 844** browser viewport have zero document horizontal overflow. [Phone palette readback](palette-mobile.json) distinguishes six rendered controls from collapsed Advanced fields.
- A temporary invalid Dark entry stayed visible, exposed `aria-invalid=true`, and disabled confirmation. Its original `#183B4E` value was restored; all seven confirmations returned. See [the check](invalid-color.json).
- The Templates tab shows the approved A–I lineup: Showcase, Reel, Neon, Cameo, Metropolis, Encore, Splice, Prologue, Pause. Desktop shows three columns; the 390px phone shows one. Links use the existing source demos; the empty Showcase shell is not advertised. Offscreen lazy images need not be loaded in the phone snapshot; all nine source images rendered on desktop.
- The actual downloaded [Test 3 build brief](test-3-build-brief.json) contains schema v3, all thirteen colors and the preserved mixed choices. [The builder preflight](download-preflight.json) reports valid input with zero errors. Exit 2 and seven preparation blockers are expected: no destination request was provided and the six selected modules are not certified portable packages. This is not native site-build acceptance.
- Screenshots retain the source demo colors. Independent Header/Accent native rendering and optional recolored site previews remain follow-up work.

Phone overrides were reset after QA. The original saved selection remains available in the picker. The picker has not been deployed by this phase.
