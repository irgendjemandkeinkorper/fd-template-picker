# INDY demo rollout: October 26, 2026

Nine published demos are available in **US-BETA → INDY Demo**. Showcase is the approved replacement Site 193. This guide records the native workflow that succeeded, for the later picker-builder skill update.

| Design | Site | Homepage | Editable Page | Public address |
|---|---:|---:|---:|---|
| Showcase / A | 193 | 6797 | 6840 | https://template-showcase-demo-indy-consumer.netlify.app/ |
| Reel / B | 185 | 6110 | 6153 | https://template-reel-indy-consumer.netlify.app/ |
| Neon / C | 186 | 6197 | 6240 | https://template-neon-indy-consumer.netlify.app/ |
| Cameo / D | 187 | 6286 | 6329 | https://template-cameo-indy-consumer.netlify.app/ |
| Metropolis / E | 188 | 6373 | 6416 | https://template-metropolis-indy-consumer.netlify.app/ |
| Encore / F | 191 | 6632 | 6675 | https://template-encore-indy-consumer.netlify.app/ |
| Splice / G | 189 | 6461 | 6504 | https://template-splice-indy-consumer.netlify.app/ |
| Prologue / H | 190 | 6548 | 6591 | https://template-prologue-indy-consumer.netlify.app/ |
| Pause / I | 192 | 6721 | 6764 | https://template-pause-indy-consumer.netlify.app/ |

Native IDs above are evidence, not authorization for another build. Verify the Region, Circuit, Site and current record before editing.

## Repeat the successful build

1. Create the authorized new Site inside **INDY Demo**, using **Adam Template Testing 2** as Starting Template and enabling **Create Consumer Website**. Give the creation Name its `template-` prefix, such as `template-reel`. Verify the hosting ID and actual address in INDY's deployment status before exposing a link. A success notification alone is insufficient.
2. Wait for creation to settle before configuring a different Site. A delayed native copy can switch the selected Site. After an error or timeout, refresh the inventory before retrying: several 504 responses still produced complete Sites.
3. Save the final one-word Site Name, Display Name, Website Title and Abbreviation in Site Configuration. This client also required Statement Descriptor Site Name before saving identity fields. Preserve the copied timezone and operational settings unless a separate change is authorized.
4. Rebase the **destination copy's** Theme CSS from `body.site-170` to its new Site ID. Convert old numeric Page/Section selectors to stable slug prefixes. Keep the source untouched. Set the approved native Primary, Secondary, Header, Accent, Dark and Background palette; also align splash/seating companion values. Bind `--fd-header` and `--fd-accent` independently and apply the scoped Theme navigation binding. Save and verify the compiled public result. The inherited stylesheet remains large; extracting a small per-design package is later work.
5. Assign the matching variant Page as **Web Home Page**. Preserve its slug. Set Search Engine Title to the new display name. Reuse its native Showtimes section, or add one for G/H/I. Hide the former promotional hero and move Showtimes to the first visible position using **Set Order**.
6. Configure the native **Showtimes Hero**: List display, Slider view, banner imagery/background, trailer button, visible arrows and pagination, no autoplay. Use Full Width and clear side margins in Section Settings. Add the stable class `fdp-showtimes-hero` and a small Section CSS text shadow for changing banner images. Keep native date controls and native session data.
7. Correct **Home** under Navigations to the local variant Page. The copied menu otherwise points to the generic Fandango test homepage. Save, wait for the dialog to close, reopen to verify, then test the public href.
8. Publish only the changed homepage. Content publication is the normal path on an existing consumer host; a hosting deploy is unnecessary. Verify the public root redirect, actual content and desktop/phone layout.

### Design-specific corrections verified tonight

- **Reel:** restore the native mobile utility/menu column, hide the empty desktop menu row on phones, and constrain the logo/title flex layout. All rules are scoped to Reel's homepage. The source B header also had this defect.
- **Neon:** remove its legacy rule hiding desktop links. In Page CSS, hide only the food card's `.ellipsis-3-lines` description; hiding every `.text-body2` also hides the mobile title and price containers.
- **Cameo and Splice:** set the Showtimes Section's native **Background Color = Dark**, so its pale heading and date labels have an opaque contrasting surface.
- **Prologue:** use native **Dark Mode = off** for its cream calendar. Its existing page styles supply the dark editorial heading. Banner captions retain their native backing and text shadow.
- Keep unsupported Gift Card sales sections hidden on B–F. Their visibility is separate from the native food/movie records.

## Populate the approved demo programme

Each working Site has **16 published sessions**, October **26–29, 2026**, in **America/Los_Angeles**, using **Screen 1, capacity 120**, and copied **Default** pricing.

| Title slot | Start | Film |
|---:|---|---|
| 6 | Noon | Ghost In The Shell 30th Anniversary |
| 5 | 3 pm | Ali G: Who Iz I? |
| 4 | 6 pm | Pulp: What Do You Do For An Encore? |
| 3 | 9 pm | Cars 20th Anniversary |

Open the Booking Week of October 23. In **Title Selection**, filter to each exact film and drag its native poster into the matching slot. Check all four film names in **Schedule** before building. Select each approved day individually, then **Build (4)** and **Publish (4)**. The day controls act as single-select controls. The whole-week view should end at **Unpublish (16)** and **Build (12)**, leaving the earlier Friday–Sunday blocks unbuilt. **Save and Close** persists the week; Build/Publish buttons alone only modify its draft.

These dates expire. Refresh the programme through the same native workflow if a later demo requires future sessions. Do not infer that movie records alone create showtimes.

The seven copied concessions are Marquee Popcorn, No Country for Old Nachos, The Pretzel Identity, Soda, Pie Hard, Sundae, Bloody Sundae and Movie Candy. Native Website visibility supplies the homepage menu and prices.

## Display-only decision and QA scope

The final user instruction keeps **Enable Online Ticketing off** on all nine demos. An earlier enable request was superseded before any ticketing mutation. Time buttons therefore demonstrate the programme; checkout is not enabled or certified. No order was placed.

The final checks cover all nine published homepages at the recorded desktop viewport (1536px wide in the refreshed captures) and **390 × 844**: correct Site identity and root redirect; Showtimes first; four visible session controls in the document; seven food items and prices; seven desktop links; working mobile drawers with local Home destinations; and no measured horizontal overflow. Desktop/phone screenshots were visually reviewed. These are browser viewport checks, not physical-device or app certification.

The Hub and checklist now use the dedicated demos and 54 refreshed component captures. Every refreshed option records its actual demo source Site/Page/Section. The original source references remain attached and the original catalog is archived. Module artifacts point to the current demo Page CSS; portable packaging remains unverified. See [color/support guidance](DEMO-COLOR-SUPPORT.md).

## Held and deferred work

- **Showcase 193** was created once after explicit replacement approval, with native creation name `template-showcase-demo`. Its 504 response still persisted. Native hosting, homepage 6797/editable 6840, navigation and 16 screenings were verified. Incomplete 184, earlier 183 / Website Templates 103, and source 170 are preserved.
- Library carrier Pages, independent imports, separate per-section showcase Pages and copy/paste portability tests are deferred. The current cloned Sites include inherited Pages; they are not a finished reusable block library.
- The broader per-design stylesheet extraction and normalized venue/editorial copy need a separate pass. Tonight's common native inventory is the movie programme and concessions.
- No client cache clear or external Netlify login was used.

## Recover from native editor issues

Some saves and selector changes finish asynchronously. Wait for a saved state, then reopen the same record before moving away. A selector's cached label can lag the saved Site Name; verify the resulting context and Site ID after switching. First-open dropdowns occasionally remain collapsed: close and reopen the native selector, then read its actual options.

INDY occasionally reported that the editing lock was lost after a disconnection. Dismiss the notice, verify the current values and scope, and confirm the subsequent save. Never use a broad cache action as a substitute for verifying a specific record.

Before-values and execution notes are retained in the workspace's `planning/website-templates/indy-demo-rollout/` directory. Published content can be corrected through its draft and republished; no source deletion or bulk cleanup is required.

## Refreshed screenshots and color exceptions

Load offscreen food images by scrolling through the actual menu before clipping. Return through the native **Home navigation link**, then verify `scrollY = 0` before capturing. Keyboard shortcuts and immediate wheel observations were unreliable; a fixed header can otherwise be baked into a section screenshot. Use consecutive section-sized clips for tall sections, join them without appearance changes, and independently inspect the result. Keep the raw clips and hashes. Screenshot methods that resize the entire page can time out on long pages.

Native Theme and Page before-values remain in workspace planning evidence. Restoring those exact values and republishing the same Page is the rollback path. Do not restore source-170 selectors into a destination Site.

The picker allows acknowledged 3–4.5:1 pairs for design review, blocks below 3:1, and preserves the original WCAG result. Before a customer launch, the website team must adjust actual regular-text combinations and check rendered states. The acknowledgment is a recorded design preference, not accessibility certification.
