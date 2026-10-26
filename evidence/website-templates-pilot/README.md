# Website Templates / Showcase provisioning pilot

The approved pilot created **US-BETA / Website Templates (103) / Showcase (183)** from the operational **TEMPLATE STANDARD** seed.

The first create returned HTTP 500, but refreshing native selectors showed the Circuit and Site already existed. Hosting alone was missing. The recovery submitted only **Showcase → Developer Site Settings → Create Consumer Website**; INDY confirmed creation and automatically triggered its initial deployment. No Circuit/Site create was repeated and no manual Trigger Site Deploy was used.

Readback established `showcase-indy-consumer` / branch `showcase`. The actual URL is <https://showcase-indy-consumer.netlify.app/>. It serves the INDY application with the empty-site “404 Oops. Nothing here...” screen. The Admin Page list says **No Pages**. This is a provisioned shell; design A, sample content and section showcases have not been transferred or reviewed.

The read-only Add From Library dialog lists Watchlist, Gift Cards, Games, Explore Movie and Home. No Page was selected/imported. This does not establish access to the INDY Demo Circuit Library or cross-Circuit variant portability.

See [the journal](pilot-journal.json), [native Page list](showcase-pages.txt) and [live shell](showcase-live-shell.txt). Existing working demos remain the Hub destinations. The other eight Sites were not created.

The later [URL naming phase](url-naming-journal.json) records the user's `template-` prefix requirement and INDY-only workflow. `template-showcase` was saved/read back in Developer Site Settings, but that short public address serves an unrelated site. The working Name was restored; Hostname now explicitly uses the existing working URL because Save requires it. The longer `template-showcase-indy-consumer` proposal is prepared unsaved for a separately confirmed single-deploy test. No prefixed live address or domain availability is claimed.
