# Public picker hosting

The picker is a static site. Its entry point, stylesheet, modules, JSON catalogs and images use relative paths, so it can run under the repository's GitHub Pages path.

Publication target: `irgendjemandkeinkorper/fd-template-picker`.

Planned source: branch `codex/indy-variant-catalog`, repository root. The existing `.nojekyll` file keeps the static files intact. Publishing this branch does not require merging the draft pull request.

On October 26, 2026, Settings → Pages and the public site were inspected in signed-in Chrome. Pages is enabled, using `main` and `/(root)`, with its last deployment dated October 20. The public address is [FD Template Picker](https://irgendjemandkeinkorper.github.io/fd-template-picker/), and it still serves the original three-design picker. The updated release is awaiting publication; a local preview or successful Git push alone is not a live-site check.

## Publish and verify

1. Finish the reviewed names, native source references and screenshots. Regenerate the module index and run the relevant checks.
2. Commit and push the intended revision to the publishing branch.
3. In this repository's Settings → Pages, use **Deploy from a branch**, select the publishing branch and **/(root)**, then save. Preserve unrelated repository settings.
4. Wait for GitHub's Pages deployment to complete. Use the URL shown in Pages settings.
5. Open the public URL and confirm that the checklist, Templates tab, current names, screenshots and JSON data load under the repository path. Follow the nine demo links and verify that shared selections retain that path.
6. Record the deployed commit and verified URL here. Subsequent pushes to the selected publishing branch update the public site.

Reference: [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Keep internal support guides outside this public site. The demo source records already held in this public repository remain source evidence, not destination authorization or a guarantee of Library portability.
