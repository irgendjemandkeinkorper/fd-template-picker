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

**Where does the standalone footer belong?** Keep its HTML in the native Footer Global Widget's Full Width Custom Text block. Put its class-scoped CSS in Theme & Style; Reel's widget Gear CSS saved without appearing publicly. Keep `white-space: normal` on the `fdp-demo-footer` root, since the native wrapper preserves source newlines. Confirm the six links stay on that design's own host.

**Why did a copied section lose its layout?** Check its internal Name, preserved inner HTML classes, Page CSS and former Section/Custom Block CSS. Many rules match the generated name prefix, so changing the Name changes the styling scope. Reel Private Hire and Splice/Prologue/Pause Membership require their component CSS recipes as well as the common Page layer. An HTML paste alone does not bring those dependencies with it.

**Why did homepage text blend into its background?** The native Section CSS compiler omitted the custom homepage block's variable-based `background` declarations while retaining its foreground colors. This left a transparent block over the Page's Dark background; Reel and Pause had Dark text on the same Dark surface. The current repair keeps the block's intended color fills in the Site Theme as scoped `background-color` rules. These still use the editable palette variables. Preserve that Theme dependency when recreating a block, and verify the actual rendered foreground and background after saving. A correct-looking saved Section CSS field alone does not prove its compiled output.

**Why does movie artwork look stretched?** The native Showtimes background image used `object-fit: fill`. The current Theme uses `object-fit: cover` only on that background image so its proportions are preserved. The foreground movie image and native showtime controls keep their own settings. Recapture the hero preview after changing the crop.

**Why can menu links be readable while Log in or Sign up is not?** Filled native authentication buttons need their own foreground pair. A broad navigation rule can override both the button and its inner text/icon: light navigation copy becomes unreadable on the pale Secondary button, or dark navigation copy on a dark Primary button. The scoped phone-drawer correction gives Reel's Log in button Background text and the pale Sign up buttons Dark text. Cameo retains its already-readable tint/Dark pairs. Keep these rules with the Theme and check the actual inner label and icon as well as the anchor. Desktop account pop-ups are a separate state to review.

**Does every demo button meet 4.5:1?** The 26 October color repair changed Showcase's phone Log In button to Dark text on its existing Primary tint, measuring 11.64:1; Sign Up uses Dark on Secondary at 9.31:1. These checked states replace the earlier 3.66:1 Log In result. They do not certify every control, image overlay, hover or focus state.

**Why did Today or a movie rating disappear?** Broad selected-date rules could make the small Today badge Dark on Dark. All nine Themes now preserve Background text on its Dark badge and Dark text on Secondary rating chips. Keep those narrow rules with the Showtimes widget instead of changing the approved palette.

**Why did Neon's or Metropolis's Films heading blend into the panel?** In the native Explore Movies heading editor, set Color to **Default**. It inherits the section's light Background text; Primary was too dark on that panel. This repair uses the editor and does not require additional Page CSS.

**Why did Pause's food descriptions look faint?** A description opacity rule reduced the contrast of otherwise suitable text. The current Theme uses its existing muted text role at full opacity, measuring 6.39:1 on Background. Keep the scoped Concessions rule; changing the entire slate palette is unnecessary.

The color repair retained all six palette values on every demo. Checks covered all 63 routes at 390px plus 12 desktop follow-ups, with no remaining enabled solid-background text candidates in those observations. Image-backed captions were reviewed separately on representative loaded artwork; this is a scoped repair check, not full accessibility certification.

**Why do Cameo's contact fields overlap?** The demo uses three required native Full Width fields: Name (Text), Email (Email) and What you have in mind (Notes). The original postcard layout expected a different grid. Its correction lets all three fields flow into separate rows while retaining the postcard frame. Verify the saved Visit Page CSS and all three controls on desktop and phone; do not change native field widths just to match an old selector.

**Does a new footer mean the whole site has passed review?** No. Native build records, public route QA and approved screenshots are separate evidence. Use the [standalone maintenance guide](STANDALONE-DEMO-MAINTENANCE.md) and [integration checklist](STANDALONE-DEMO-INTEGRATION.md); only a passed seven-page review can promote the new picker sources.

## Design checks

- Reel: keep the mobile menu restoration and the narrower food description selector.
- Neon: keep desktop links visible and mobile product title/price containers visible.
- Cameo/Splice: native Showtimes Section Background = Dark.
- Prologue: Showtimes Dark Mode off for its cream calendar.
- Encore: preserve the contained desktop sidebar and phone menu behavior.
- Showcase: use Site 193 and its `template-showcase-demo` host; preserved Sites 183/184 are not the public demo.

No contact form submission, order, physical-device test or accessibility certification was performed. Historical authoring guides remain historical evidence.
