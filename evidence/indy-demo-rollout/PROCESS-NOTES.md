# Native INDY demo rollout notes

Approved destination: US-BETA → INDY Demo. Source Adam Template Testing 2 (170) stays unchanged. Earlier Website Templates / Showcase (183) stays unchanged. Library packaging and block architecture are deferred.

## Provisioning

1. Start each new Site with its intended `template-<design>` creation name and Create Consumer Website enabled. This produced a real hosting ID and prefixed host for Reel; saving a desired Netlify name on an uncreated shell did not establish a host.
2. Keep the creation form open until its response. A timeout does not prove failure. Refresh and inventory before retrying: Reel persisted after a 504.
3. Successful creation can automatically switch the selected Site. Do not edit a destination while another copy request is still running. Use a single Admin tab and compare Region, Circuit and Site immediately before each write.
4. Treat a source starting-template entry as proof the native Site exists, not proof of hosting, copied content or readiness. Verify native hosting ID, actual public root, chosen design homepage, food and movies separately.
5. Restore the approved one-word identity only on the ready named demo; avoid unsolicited cleanup renames of incomplete resources.

## Native design setup

- Assign the matching Variant Page as Web Home Page.
- Native Showtimes supports List/Grid and Block/Slider, Use Banner Image, Banner Background and trailer display.
- Put Showtimes first among visible Sections. Native Tab.drag works on the Set Display Order list; read actual saved order afterward.
- Hide the earlier static hero when it would precede booking. Do not present authored sample times as bookable inventory.
- Site copy preserves source CSS text, including Site/Page/Section identifiers. Rebind only the destination Theme site guard and convert numeric Page/Section selectors to stable name prefixes. Preserve exact before/proposed artifacts.
- Reel Page CSS already used portable section prefixes and needed no rewrite. Do not force Save when there is no Page-field change; Section changes save independently and still require parent Page publication.
- Home navigation is copied to the old generic source homepage. Set its local URL to `/` or the verified chosen design route; test publicly.

## Programming

Reel current Booking Week 521822 / October 23 has unassigned title slots. Screen 1 has 120 seats; four slots start at noon, 3, 6 and 9 pm with Default pricing. Site timezone is America/Los_Angeles. Native Showings are absent. Movie-slot assignment was blocked by automatic review until the exact proposed screening batch is approved; no assignment, build or publish was performed.

Exact proposed movies, destination Reel IDs and October 26–29 dates are in demo-screenings.proposed.json. Approval is pending. Verify local IDs and configuration on every other destination before applying.

## Browser controls

Readonly Quasar selects expose 1px inputs. Use the enclosing field arrow from current DOM geometry. If a menu is visibility:collapse, close and reopen it. Native accessibility snapshots may be diffs; use a fresh full snapshot when resolving element indexes. Native Tab.click accepts current indexes; ignore the repeated Focused UI element line when matching. Native screenshots of Admin and live SPA currently hit the provider 5-second capture deadline; only the static Netlify error capture succeeded. Do not claim visual QA from it.


## Approved screening rollout, October 26 continuation
User approved the exact 16-screening batch and asked to leave Showcase incomplete. Reel185 and Neon186 now have 16 built and published screenings each for October26–29, with the four approved movies at noon/3/6/9pm on Screen1 capacity120 and Default pricing. Reel live four time buttons verified. Neon timezone confirmed America/Los_Angeles. Source170, earlier183, incomplete184 unchanged. Reel hero renamed to Showtimes Hero, full-width native slider; mobile menu restored with a small scoped Theme correction. Neon inherited desktop hide-menu rule removed to restore native Standard links. Page/nav saving is asynchronous: wait for the dialog to close, then reopen to verify before navigating away. Native title poster assignment requires UI drag after filtering; verify movie names on Schedule before Build. Build/Publish modifies the booking-week draft; Save and Close persists all16. All-week totals must show Unpublish16 and Build12 (earlier Fri–Sun untouched).

Cameo187 homepage6286/edit6329, Metropolis188 homepage6373/edit6416, Encore191 homepage6632/edit6675, Splice189 homepage6461/edit6504 have now been configured and published, with identities renamed, rebased Theme CSS and correct Home navigation. Each has16 approved screenings saved/published Oct26–29 after verifying LA timezone and120-seat/Default schedule. Original heroes and unavailable gift-card sections hidden on D/E/F. Splice adds native Showtimes Section28057, full-width slider, placed first via Set Order; original HeroG27067 hidden. Live desktop homepages for Cameo, Metropolis and Encore show movie/time controls and shared food; no horizontal overflow observed. Full final desktop/mobile QA still pending.

Final setup: Prologue190 homepage6548/edit6591 and Pause192 homepage6721/edit6764 now published with newly created native Showtimes, placed first; their original heroes are hidden. All8 demos have16 approved published screenings each (128 total). User initially approved enabling ticket selection but superseded that before any mutation: display-only for today. Enable Online Ticketing remains OFF; no checkout/order was created. Final QA found and repaired Cameo/Splice white headings using native Section Background Color=Dark; Neon mobile food labels/prices were hidden by a legacy .text-body2 selector, narrowed to .ellipsis-3-lines only and published.

Prologue final contrast correction: native Showtimes Dark Mode off retains its cream background and produces dark unselected calendar labels; desktop and390px views were recaptured. Cameo and Splice native Dark Section backgrounds verified rendered. All8 homepages passed desktop/phone content and menus. Hub has eight dedicated native URLs and new homepage screenshots; Showcase retains its source fallback. Hub desktop/mobile layouts and preservation of the existing completed picker selection were verified in Chrome. Ticketing remains display-only.


## Nine-demo completion and palette refresh — October 26

User resumed Showcase and explicitly approved one replacement after automatic approval review blocked it. Created only Site193 from170 with template-showcase-demo + consumer hosting; the504 still persisted. Verified native host template-showcase-demo-indy-consumer, renamed display identity to Showcase, homepage6797/edit6840, native Showtimes editable28280/published28122, hid28278/28279, corrected Home, published16 approved sessions. Source170, earlier183 and incomplete184 preserved. Attempted clearing184’s invalid Hostname was rejected by native validation; original form restored with no saved mutation.

Applied the approved nine distinct palettes through native Theme color editors, including matching splash/seat companion values. Added a small scoped Theme navigation role binding and changed each demo homepage’s Header/Accent aliases to independent native fields. Header is the navigation band on seven designs; Reel/Cameo keep paper bands and use Header in menu lettering. Accent handles decorative details. All nine homepage colors are verified in consumer computed styles. Broader arbitrary-palette certification is not claimed.

Desktop/390px checks passed for9 Sites: four showtime controls, seven foods and desktop links, local mobile drawers, no horizontal overflow. Ticketing remains OFF. Capture lazy images through native scrolling, then use the native Home navigation link and verify document top. Keyboard Home/Control+Home and fast wheel state were unreliable. Capturing at nonzero scroll bakes a fixed header into component images. Retaken affected crops;54 final source clips reviewed. Tall components use consecutive native browser clips joined without repainting or alteration.

Picker now shows the approved nine names and current live source references. J–L are held out of customer choices. Seven nav layouts represent nine designs; Standard lists Splice/Prologue/Pause together. Fresh native Showtimes Hero is available for all9, including Encore. Historical source catalog/IDs archived, current per-option sourceSite/Page/Section explicit, module hashes regenerated. Library/block packaging still deferred.

Contrast flow: block either base text pair below unrounded3;3–4.5 requires explicit palette-bound acknowledgment; >=4.5 no acknowledgment. Save/share/export preserve exact palette, policy and timestamp; edits invalidate it; original WCAG pass/fail remains unchanged. Browser verified3.99 allowed after checkbox,2.99 blocked, reload and edit invalidation, shared-link acknowledgment, sequential six-section review and mobile no-overflow. QA used localhost origin to leave user127.0.0.1 selections alone. Sixty tests pass; local support guides updated.
