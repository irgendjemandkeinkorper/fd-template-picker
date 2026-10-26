import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const artifact = async (path, purpose) => ({ path, sha256: hash(await readFile(new URL(path, root))), purpose, sourceOnly: true });
const catalogBytes = await readFile(new URL('catalog.json', root));
const catalog = JSON.parse(catalogBytes.toString('utf8'));
const modules = {};
for (const slot of catalog.slots) for (const option of slot.options) {
  const global = ['header', 'footer'].includes(slot.id);
  const kFood = slot.id === 'food' && option.variant === 'variant-k-clubhouse';
  const variant = option.variant.match(/^variant-([a-l])-/)?.[1].toUpperCase();
  const entry = { moduleVersion: 1, readiness: 'unverified-portability', installationMethod: global ? 'destination-global-configuration-review' : 'manual-source-review-and-native-recreation',
    artifacts: [], limitations: ['Visual capture review does not certify installation on a new Site.', 'Source IDs must never be used as destination IDs.'] };
  if (option.demoProvenance) {
    entry.artifacts.push(await artifact(option.demoProvenance.nativePageCss, 'Current live demo Page CSS reference; not a self-contained Section package.'));
    if (option.demoProvenance.nativeThemeCss) entry.artifacts.push(await artifact(option.demoProvenance.nativeThemeCss, 'Current Site-wide design, navigation and footer CSS reference. Review destination scoping before reuse.'));
    if (option.demoProvenance.nativeRecipe) entry.artifacts.push(await artifact(option.demoProvenance.nativeRecipe, 'Native Showtimes hero settings and per-design overrides.'));
    entry.limitations.push('Resolve native destination Section IDs through Admin. Recorded source draft IDs are evidence only; missing draft IDs must not be inferred.', 'Header and Accent bind independently on the live demo; recreate the scoped Theme navigation binding when installing.');
    if (option.standaloneSource) {
      entry.artifacts.push(...await Promise.all([
        [option.standaloneSource.map, 'Published standalone Page/Section IDs read from the actual public DOM.'],
        [option.standaloneSource.nativeRecord, 'Separate native Admin records; historical before-values are not current widget configuration.'],
        [option.standaloneSource.qa, 'Seven-page desktop and phone review; no checkout or form-submission certification.'],
      ].map(([path, purpose]) => artifact(path, purpose))));
      entry.limitations.push('A complete standalone demo does not establish Library transfer or copy/paste portability. Supporting Page CSS can depend on Site Theme CSS.');
    }
  } else if (variant) entry.artifacts.push(await artifact(`evidence/admin-controls-completion/native-saved/${variant}-page.css`, 'Source Page CSS reference; not a self-contained section package.'));
  if (kFood) {
    const path = 'template-adapters/library-k-food/dependency-manifest.json';
    const manifest = JSON.parse(await readFile(new URL(path, root), 'utf8'));
    const livePath = 'evidence/library-k-food-live/live-journal.json';
    const live = JSON.parse(await readFile(new URL(livePath, root), 'utf8'));
    const liveEvidence = await Promise.all([
      [livePath, 'Authorized independent-copy publication and current-palette consumer verification.'],
      ['evidence/library-k-food-live/live-desktop.json', 'Live independent copy at 1536px; three columns, seven loaded photos, zero overflow.'],
      ['evidence/library-k-food-live/live-mobile.json', 'Live independent copy at 390px; one column, seven loaded photos, zero overflow.'],
      ['evidence/library-k-food-live/live-mobile-category-settled.json', 'Native mobile category label lag after a successful Desserts jump.'],
      ['evidence/library-k-food-live/live-mobile-category-after-scroll.json', 'Native category label updates after further scrolling.'],
      ['evidence/library-k-food-live/README.md', 'Bounded live-phase findings and remaining checks.'],
    ].map(([file, purpose]) => artifact(file, purpose)));
    Object.assign(entry, { readiness: 'native-library-transfer-and-existing-page-recreation-verified-admin-scope',
      installationMethod: 'native-concessions-menu-recreation-with-section-package',
      alternativeInstallation: 'one-section-library-page-import-then-unlink; creates a separate Page',
      manifest: path,
      artifacts: [await artifact(path, 'Historical portable module settings, dependencies and bounded Admin verification.'), await artifact('template-adapters/library-k-food/section.proposed.css', 'Exact portable Section CSS.'), ...liveEvidence],
      verification: manifest.verification,
      liveIndependentCopyVerification: {
        schema: live.schema, status: 'verified-current-palette-desktop-and-mobile-consumer', verifiedAt: live.verifiedAt,
        sourceReference: { ...live.target, editableSectionId: live.clubhouse.editableSectionId, publishedSectionId: live.clubhouse.publishedSectionId, url: live.hosting.url, sourceIdsOnly: true },
        consumerChecks: live.consumerChecks, knownIssues: [live.knownIssue], evidence: liveEvidence,
        scope: 'Later published independent copy only, at the recorded palette and desktop/390px browser viewports. Earlier carrier/Admin evidence remains unchanged; no physical-device, arbitrary-palette, checkout, Mobile App or controlled-empty-state certification.',
      },
      limitations: ['Direct Library Section insertion and native cross-page copy are unverified.', 'Current-palette desktop and 390px consumer geometry passed in the later independent-copy phase; arbitrary palette changes, physical devices, Mobile App, checkout, catalogue availability rules and controlled empty state remain untested.', 'Mobile Desserts navigation reaches its products, but the native dropdown label can remain Drinks until further scrolling.', 'Choose one visible food Section per finished slot. The live copy hides the original menu; earlier adjacent-menu overlap remains a comparison-stage limitation.', 'Set final internal Section Name before first CSS save; if renamed, re-save CSS and verify compiled scope after reopening.'],
    });
  }
  modules[option.id] = entry;
}
const output = { schema: 'fd-picker-module-index/v1', catalogSha256: hash(catalogBytes), sourceOnly: true, modules };
await mkdir(new URL('data/', root), { recursive: true });
await writeFile(new URL('data/build-modules.json', root), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Registered ${Object.keys(modules).length} source options; portable readiness remains module-specific.`);
