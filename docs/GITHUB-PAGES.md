# Public picker hosting

The picker is a static site. Its entry point, stylesheet, modules, JSON catalogs and images use relative paths, so it can run under the repository's GitHub Pages path.

Publication target: `irgendjemandkeinkorper/fd-template-picker`.

Publishing source: branch `codex/indy-variant-catalog`, repository root. The existing `.nojekyll` file keeps the static files intact. Publishing this branch does not require merging the draft pull request.

**Live and verified October 26, 2026:** [FD Template Picker](https://irgendjemandkeinkorper.github.io/fd-template-picker/).

Pages previously served the October 20 three-design picker from `main`. Its source was changed through GitHub Settings → Pages to the tested branch above. [Deployment 40371104367](https://github.com/irgendjemandkeinkorper/fd-template-picker/actions/runs/40371104367) successfully published revision `3535273a71d26c05d4d632bdd9307ea9c9bc10f8` in 36 seconds.

The public page was then reloaded in Chrome. The guided checklist, six main color controls, Advanced colors, Header/Accent examples and contrast feedback rendered. The Templates tab showed all nine approved names, nine loaded gallery images and the correct nine demo links, with no measured horizontal overflow at the checked desktop viewport. The release code passed 78 automated tests before publication.

The user requested immediate release ahead of the demo. This publishes the latest tested picker code with its existing reviewed gallery images. The additional standalone-page screenshot packages remain unpromoted; remaining demo polish and screenshot refreshes are deferred. Do not treat this release as certification of that unfinished pass.

## Publish and verify

1. Finish the reviewed names, native source references and screenshots. Regenerate the module index and run the relevant checks.
2. Commit and push the intended revision to the publishing branch.
3. In this repository's Settings → Pages, use **Deploy from a branch**, select the publishing branch and **/(root)**, then save. Preserve unrelated repository settings.
4. Wait for GitHub's Pages deployment to complete. Use the URL shown in Pages settings.
5. Open the public URL and confirm that the checklist, Templates tab, current names, screenshots and JSON data load under the repository path. Follow the nine demo links and verify that shared selections retain that path.
6. Record the deployed commit and verified URL here. Subsequent pushes to the selected publishing branch update the public site.

Reference: [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Keep internal support guides outside this public site. The demo source records already held in this public repository remain source evidence, not destination authorization or a guarantee of Library portability.

## Web-safe font release

The October 26 font update adds three font roles to Colors & fonts, a live sample, saved/shareable choices and build-brief validation. It passed 85 JavaScript tests, 38 builder-validator tests, desktop/390px layout checks, keyboard selection, reload persistence and an actual downloaded brief check.

The entrypoint, stylesheet and changed module imports carry the same `fonts-1` query version. During deployment testing, GitHub Pages served the new app alongside an older cached workflow module; versioning the changed dependency graph prevents that mixed release. Bump these tags together when changing these files again. Query versions work with relative GitHub Pages paths and local Node tests.
