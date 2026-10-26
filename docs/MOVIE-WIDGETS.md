# INDY movie-widget options and picker policy

Research date: October 25, 2026. Read-only review of current official INDY help articles in a dedicated Chrome support tab. No Admin or consumer template pages were operated, and no external content was changed.

## Decision

Keep a shared **Movies** module in the functional baseline for every variant, with Now Playing and Coming Soon as two states of the same capability. Native INDY controls support materially different appearances, so Movies can eventually be a real picker category. Begin with one shared native preset, then promote only distinct, implemented, desktop/mobile-verified presets into the picker. Do not invent twelve styles just to fill twelve rows.

Useful candidate presets are a poster grid, landscape banner grid, poster rail, and a session-led list. The first three are discovery presentations; the session list exposes real sessions and booking actions. A compact Quick Selector is an optional booking addition, not an equivalent substitute for browsing current and future films.

Standardize the functional contract: current/upcoming discovery, consistent demo movie source, genuine movie-detail links, accessible controls, mobile usability, and a deliberate empty state. Allow visual differences in the native view, artwork shape, text placement, density, metadata, headings, surrounding section spacing and color. Do not manufacture showtimes or replace booking behavior with static cards.

## Verified native capabilities

| Surface | Controls verified in current documentation | Implication for the picker |
| --- | --- | --- |
| Explore Movies | Type tabs with an initial category/view; search and class filters; featured title classes/badges; row/text controls; horizontal art or vertical posters; metadata and trailer/account actions; text over art or beneath it; background; Expand, Lift, and Overlay hover choices | Supports genuine discovery alternatives. Exact initial-view and row-setting enumerations are not listed in the current article and require checking the real editor before promising particular presets. |
| Poster Carousel | Current, future, or combined movie selection; title-class filtering; visible movie count; slide/text settings; banner/poster artwork; title/rating/genre/class and trailer/account controls; text placement; same three hover effects | A rail/carousel is a genuinely different browsing pattern. Density and metadata can vary. The article does not enumerate all slide-setting values. |
| Showtimes | List/grid default and optional user toggle; banner/poster artwork; text placement; block-style session buttons or a horizontal session slider; date picker and location selector display; date/title-class/movie/showing/badge restrictions; customer filters; heading and section CTA controls | Enough native variation for a session-led choice. Populate only with the site's real configured programming. An empty widget is not proof of a completed design. |
| Showtime Quick Selector | Film and date/time dropdowns; optional location; date grouping; title-class and badge filtering; explicit booking button and icon, or automatic navigation when the button controls are off | Functional compact booking strip. Treat as a separate optional booking control, not as twelve discovery styles. |

### Current primary sources

- [How to Add an Explore Movies Widget to Your Website](https://support.indy.systems/en/articles/17708917-how-to-add-an-explore-movies-widget-to-your-website) — article displayed “Updated this week.”
- [How to Add a Poster Carousel Widget to Your Website](https://support.indy.systems/en/articles/17708883-how-to-add-a-poster-carousel-widget-to-your-website) — article displayed “Updated this week.”
- [How to Add and Customize the Showtimes Widget](https://support.indy.systems/en/articles/17712020-how-to-add-and-customize-the-showtimes-widget) — article displayed “Updated this week.”
- [Showtime Quick Selector](https://support.indy.systems/en/articles/12858331-showtime-quick-selector) — article displayed November 17, 2025.

## Theme and section boundaries

Theme settings are per location. Their palette, fonts, light/dark treatment, global header, and movie-detail display options can affect every variant on Adam Template Testing 2. A page screenshot can therefore show a shared site setting rather than a portable section choice. Record such dependencies explicitly in the picker instead of implying that importing a single page section also imports the theme.

The Theme article documents default/standard/stack header arrangements and global movie-page session-button variants. These are not proof that a particular page-level movie widget can independently use all of those options. Custom CSS exists for layout/font/color refinements, but customer-written overrides are outside INDY's stated support scope.

The current Rich Text guide documents centered/full-width sections, horizontal and vertical margin presets, background colors/images with sizing/position/repeat controls, platform/date visibility, and advanced CSS. The local skill reference additionally describes the section settings wheel and section-scoped classes/styles. Confirm the exact wheel controls in the actual current widget before implementation; this review did not open Admin.

- [Theme & Style](https://support.indy.systems/en/articles/12856646-theme-style)
- [Rich Text](https://support.indy.systems/en/articles/12878567-rich-text)

## Verification and implementation order

1. Give each variant the same Movies function in its component inventory, separately from the six mandatory editorial/design categories requested by the user.
2. Check the actual editor's view/row/slide controls and source programming before defining presets.
3. Implement a small set of native movie presets; inspect desktop and mobile, including empty/future content and link behavior.
4. Capture only actual rendered results, record native widget/settings plus any shared theme dependencies, and then make those options selectable.
5. If all variants currently share the same movie presentation, label it shared rather than pretending it is unique per variant.

## Documentation freshness caveat

The older Explore Movies and Pages URLs in the September 3 local support map now render a help-center “page does not exist” message. Support search revealed the newer Explore Movies, Poster Carousel, and Showtimes guides above. The old Pages article could not be verified; Rich Text and Theme supplied the current public layout evidence. No behavior has been tested on the live template site's native widgets in this subtask.
