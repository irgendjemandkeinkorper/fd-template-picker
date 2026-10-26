# Website Templates / Showcase provisioning pilot

The approved pilot created **US-BETA / Website Templates (103) / Showcase (183)** from the operational **TEMPLATE STANDARD** seed.

The first create returned HTTP 500, but refreshing native selectors showed the Circuit and Site already existed. Hosting alone was missing. The recovery submitted only **Showcase → Developer Site Settings → Create Consumer Website**; INDY confirmed creation and automatically triggered its initial deployment. No Circuit/Site create was repeated and no manual Trigger Site Deploy was used.

Readback established `showcase-indy-consumer` / branch `showcase`. The actual URL is <https://showcase-indy-consumer.netlify.app/>. It serves the INDY application with the empty-site “404 Oops. Nothing here...” screen. The Admin Page list says **No Pages**. This is a provisioned shell; design A, sample content and section showcases have not been transferred or reviewed.

The read-only Add From Library dialog lists Watchlist, Gift Cards, Games, Explore Movie and Home. No Page was selected/imported. This does not establish access to the INDY Demo Circuit Library or cross-Circuit variant portability.

See [the journal](pilot-journal.json), [native Page list](showcase-pages.txt) and [live shell](showcase-live-shell.txt). Existing working demos remain the Hub destinations. The other eight Sites were not created.

The later [URL naming phase](url-naming-journal.json) records the user's `template-` prefix requirement and INDY-only workflow. `template-showcase` was saved/read back in Developer Site Settings, but that short public address serves an unrelated site. The longer `template-showcase-indy-consumer` Name/Hostname were then saved and tested with exactly one separately approved deployment. A fresh public check after the deployment window still showed Netlify Site not found. The working Name/Hostname were restored and re-opened; the original Site ID and branch remain. No successful hostname rename or domain availability is claimed.

The user declined a further consumer-host re-provisioning proposal and instructed us to **keep Showcase's working address and use `template-` only for following iterations**. The unsaved proposal, including its empty Site ID, was discarded by reload; no identity replacement or additional Create Consumer Website occurred. Hostname now explicitly uses the existing working URL because Save requires it. There is no pending hosting approval.
