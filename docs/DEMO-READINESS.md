# Website Studio demo readiness

Verified 25 October 2026 against the local app at `http://127.0.0.1:4180/`.

## Purpose and verdict

**Achievable for the guided selection demo.** A cinema customer chooses brand colors, then Navigation, Hero, Food & Drink, Private Parties, Membership and Contact Us in order. Review provides a selection link and a plain-text summary for the website team. The interface presents one section preview at a time and requires seven explicit confirmations.

This selects an implementation brief. It does not assemble or publish an INDY website. Library transfer and mixed-page assembly remain separate, unverified work described in [INDY-LIBRARY.md](INDY-LIBRARY.md). The demo currently runs locally; this pass did not deploy a public picker URL.

## Three perspectives

- **Enthusiast:** style previews and a compact checklist make mixing the template sections approachable; the final summary preserves a useful handoff.
- **Neutral newcomer:** the first action is choosing colors, future steps stay disabled, and the action button confirms each choice. Screenshot colors are clearly explained as examples.
- **Evidence-driven critic:** defaults do not count as consent, unavailable previews are excluded, invalid or low-contrast colors cannot continue, and interrupted edits recover. The measured pair is a color check, not a whole-site accessibility certification.

## Journey results

| Journey | Result | Evidence | Consequence |
|---|---|---|---|
| Fresh visit and guided selection | Pass | Desktop journey, 7/7 at review | Six sections chosen in fixed order |
| Contrast and invalid input | Pass | Similar colors, malformed hex, 4.47:1 boundary case | Continue blocked; suggestion preserves primary and repairs secondary |
| Keyboard and larger previews | Pass | Native radio arrow keys, modal close/Escape and focus return | Choices can be explored without pointer-only controls |
| Refresh and interrupted review edit | Pass | Changed Food, refreshed, confirmed | Other choices retained; returns to review |
| Share round trip | Pass | Copied compact link opened in a second tab | Project, colors, six choices and confirmations restored |
| Summary download | Pass | Expected `.txt` file read after download | Colors, ratio, screenshot caveat and six selections present |
| Phone layout | Pass | 390 × 844 viewport; one preview; footer within width | No document horizontal overflow, long labels wrap |
| Start over recovery | Pass | Cancel preserves review; confirm resets | Clear restart behavior |
| Browser warnings/errors | Pass | Captured log inspection in shared/mobile journey | No warnings or errors observed |

Screenshots and structured observations: [evidence/guided-demo](../evidence/guided-demo/).

## Verified bugs

No unresolved defects were reproduced in these representative journeys. Preview-load gating and returning to Review after a refreshed edit were repaired during this pass and rechecked.

## UX and positioning friction

Navigation examples retain their original desktop width. A contained horizontal preview and **View larger** allow inspection on a phone. Live website behavior and destination-specific content still require a subsequent build.

## Missing capabilities

| Priority | ID | Capability | User problem solved | Outcome | Value | Effort | Confidence | Dependencies |
|---|---|---|---|---|---|---|---|---|
| Next | DEMO-01 | Deploy a stable picker URL | Local links are limited to this computer | Decision makers can reopen the demo elsewhere | High | Small | High | Approved hosting destination |
| Next | LIB-01 | Pilot one Library copy and unlink | Selection does not install native components | Prove a reusable INDY template workflow | High | Medium | High | Named source Library and test destination |
| Later | STYLE-01 | Restore the Concrete hero preview | That one source style lacks a valid preview | All 72 core source choices eligible | Medium | Small | High | Repair source image and review new capture |

The existing local persistence, shared links and downloaded summary cover demo recovery; accounts are not needed for this selection demo.

## CLI handoff

1. **Correctness:** all seven confirmations must match current choices; colors must meet 4.5:1 using unrounded math. Regression checks: workflow, model and contrast tests.
2. **Comprehension:** preserve one active step and one preview; keep audit metadata out of customer screens. Check desktop and phone views after copy/layout changes.
3. **Retention:** preserve six choices and colors through refresh, shared link and download. Verify these journeys after persistence changes.
4. **Next release:** address DEMO-01, then validate LIB-01 separately before promising installation. Recheck STYLE-01 only after new source pixels exist.

Validation: **37 Node tests and 12 Python capture-pipeline tests pass**; JavaScript syntax and diff whitespace checks pass.

## Test limits and next pass

Tested in logged-in Chrome on Windows against the local anonymous picker at the normal desktop viewport and a temporary 390 × 844 viewport. The viewport override was reset afterward. No INDY content, memberships, bookings, forms, payments or Library records were changed during this presentation pass. Keyboard behavior was sampled; screen-reader, exhaustive accessibility, performance and security audits were not performed.

The next useful validation is a short first-time customer walkthrough on the deployed picker, followed by a separately scoped Library installation pilot.
