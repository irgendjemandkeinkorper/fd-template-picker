# Rendered acceptance sampler

`dom-acceptance-sampler.js` is one read-only function expression intended for the existing authorized browser's DOM evaluation. It reads rendered values only: no requests, storage, event dispatch, hidden app state or DOM writes. It does not save/publish anything.

Save each result alongside root's native change journal and print a compact summary rather than every sampled text node. It returns:

- Native Primary/Secondary/Dark/Background from **body**.
- Actual viewport/client/scroll widths and native page class.
- Visible desktop/mobile caption colors, backgrounds, shadows and dimensions.
- Up to450 rendered text samples, measured foreground/background pair, size/weight, current hover/focus and disabled state.
- Exact failures separated from image/group-compositing cases requiring manual review.
- A completion guard: fewer than30 text samples, fewer than4 rendered sections or a missing expected A–I hero caption marks the capture **incomplete**. Retry after native content/compiled styles load; a page title or header alone is not acceptance evidence.

The color parser handles computed RGB/RGBA, sRGB, Oklab and Oklch, including alpha. It composes transparent text/backgrounds and uses 4.5:1 for ordinary text, 3:1 for large text and simple graphical symbols. Disabled controls are recorded and excluded from text contrast decisions.

One source-specific decorative exception is recorded separately: Odd's `.od-club__stamps span` containing `✕`, without `is-stamped`, with fully transparent text. Those are intentionally unearned punch slots, not visible failed text. Visible `is-stamped` marks and every other transparent text sample still receive ordinary checking; no generic transparent-text exclusion hides implementation defects.

The sampler uses `Number.parseFloat/parseInt` and element queries rather than TreeWalker. It prefers own text nodes when the DOM sandbox exposes them; otherwise it samples leaf/semantic elements and marks `textSelection`. Optional hover/focus APIs return null when unavailable. A constrained compatibility check runs with global number parsers, TreeWalker, classList, contains and matches absent.

The sampler deliberately flags background images/gradients, overlapping sibling media inside the nearest opaque ancestor, and painted opacity groups as **manual checks**. A computed Dark ancestor color alone cannot prove text is protected from an absolutely positioned image. Opaque caption panels resolve those cases directly. Overlap detection is conservative and can flag media intersecting unused space in a large text element's box; inspect the screenshot rather than treating every flag as a defect.

Use root's native desktop and phone interactions to test open drawers, alternate slide images, focus and hover. The function samples the current UI state and does not create those states. Also check that colors change through native Admin controls with identical CSS and restore the approved palette afterward.

The final proposal files and hashes are frozen independently of this sampler. Their status remains prepared until root records saved/published/readback evidence. The sampler does not infer completion from selectors or a successful save click.

`build_final_qa_report.py` aggregates exactly 48 expected files across `qa-current-desktop`, `qa-current-phone`, `qa-test-desktop` and `qa-test-phone`. It requires exact palette values, current sampler/media completeness, capture timestamps after relevant sealed saved-field readback times, correct viewports, no measured failures or overflow, and explicitly bounded C/D decoration cases. Older audit cycles and stale captures remain historical. The generated report checks all 30 saved native field hashes/role contracts and reads restoration only from the native journal; it never infers restoration from a local recipe or old screenshot.

Freshness uses immutable per-field journal `nativeSavedVerifiedAt` values, bound to exact artifact hashes and a sealed manifest. These are explicitly sealed, root-attested local UI-readback file times, not INDY server save timestamps. A checkout may replace every filesystem mtime without changing acceptance; changed artifact bytes or journal hashes fail. Reports and guide builders never create or refresh provenance. The separate one-time sealer requires an explicit flag and refuses an existing/partial seal. Portability tests change copied artifact mtimes, then mutate bytes/hashes, without touching current native evidence.
