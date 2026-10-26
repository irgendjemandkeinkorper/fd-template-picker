# Demo colors and support notes

All nine dedicated demos are in **US-BETA → INDY Demo**. Use native **Theme & Style** for palette edits. Theme saves are immediate; Page CSS changes require saving and publishing the containing Page.

| Design | Site | Primary | Secondary | Header | Accent | Dark | Background |
|---|---:|---|---|---|---|---|
| Showcase | 193 | #A37721 | #E4C873 | #191B25 | #D8AB4F | #1E2630 | #F8F4E8 |
| Reel | 185 | #8E344A | #DFB2BA | #34202C | #BD8055 | #30232A | #FAF4EF |
| Neon | 186 | #087F82 | #71DBCC | #092D34 | #CEEF68 | #102E33 | #F0FAF7 |
| Cameo | 187 | #B84F3A | #F2B7A0 | #432A36 | #DA8F48 | #3D2531 | #FFF4EB |
| Metropolis | 188 | #235D98 | #B0CDE9 | #102E4C | #D9AC54 | #152F4A | #F1F5FA |
| Encore | 191 | #55565C | #D0C9BA | #202126 | #B9A576 | #27282E | #F5F2E9 |
| Splice | 189 | #704CB0 | #D4B7EF | #28203D | #D6A5CF | #302240 | #F7F1FB |
| Prologue | 190 | #35674C | #BCCFAD | #1E342A | #C0A066 | #263D30 | #F6F4E9 |
| Pause | 192 | #526D7A | #CCD8DB | #253740 | #A7B9B3 | #2E4149 | #F2F6F6 |

## Where the colors appear

- **Primary:** main actions and selected dates/showtimes. Some designs use a derived tint behind text to preserve contrast.
- **Secondary:** supporting fills, alternate membership surfaces and secondary tints.
- **Header:** navigation bands on Showcase, Neon, Metropolis, Encore, Splice, Prologue and Pause; navigation lettering on Reel/Cameo. Showcase/Neon also use this role on dark section panels.
- **Accent:** decorative rules/outlines, including Reel’s menu dividers, Neon’s ticket stubs and Splice’s highlight details. It is not a universal button background.
- **Dark / Background:** the main text pair and contrasting dark/light section surfaces.

## Troubleshooting

**Why did Header/Accent not change an older page?** The nine demo homepages use independent native roles. Historical authoring Pages on Site 170 still have Dark/Secondary aliases. Use the current per-option source Site in the build brief, and inspect both Page role definitions and Theme navigation rules. Do not edit the authoring source as part of a destination build.

**Why are there only seven navigation choices?** Splice, Prologue and Pause share the same native Standard layout. Their palettes differ, so they appear together as one layout choice.

**Why does a preview have blank food images or a menu band across a section?** Load lazy images by scrolling the actual menu, return using Home, verify the document is at the top, then recapture. Do not remove native elements or inject styles to disguise the issue.

**Can a customer proceed below 4.5:1?** The two checked pairs must both reach 3:1. A 3–4.5:1 result needs the explicit acknowledgment checkbox. Any palette change invalidates it. The acknowledgment, exact palette and timestamp travel in shared links and the build brief. Regular text still needs its final contrast reviewed before launch. Below 3:1 or malformed values cannot be waived.

**Why are showtimes not opening checkout?** Ticketing is intentionally display-only on these demos. Do not enable it as a troubleshooting shortcut. The 16 sessions per Site run October 26–29, 2026; expired dates require a newly approved schedule.

**Can I copy these blocks yet?** Native source fields and current demo Page CSS are recorded, but a full portable Library/block package is deferred. Recreate a draft after exact destination authorization and resolve the destination data/navigation/form dependencies.

## Design checks

- Reel: keep the mobile menu restoration and the narrower food description selector.
- Neon: keep desktop links visible and mobile product title/price containers visible.
- Cameo/Splice: native Showtimes Section Background = Dark.
- Prologue: Showtimes Dark Mode off for its cream calendar.
- Encore: preserve the contained desktop sidebar and phone menu behavior.
- Showcase: use Site 193 and its `template-showcase-demo` host; preserved Sites 183/184 are not the public demo.

No contact form submission, order, physical-device test or accessibility certification was performed. Historical authoring guides remain historical evidence.
