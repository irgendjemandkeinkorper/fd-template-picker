import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const evidence = resolve(root, '..', 'evidence');
const journalPath = resolve(process.argv[2] ?? join(evidence, 'indy-parity-changes.json'));
const baselinePath = resolve(process.argv[3] ?? join(evidence, 'component-parity-baseline.json'));
const outputPath = resolve(process.argv[4] ?? join(evidence, 'parity-capture-metadata.json'));
const journal = JSON.parse(await readFile(journalPath, 'utf8'));
const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
const catalog = JSON.parse(await readFile(join(root, 'catalog.json'), 'utf8'));
const targetKeys = ['region', 'circuit', 'site'];
if (journal.schema !== 'fd-indy-parity-changes/v1' || baseline.schema !== 'fd-component-parity-audit/v1') throw new Error('Expected reviewed parity journal and baseline audit.');
if (targetKeys.some((key) => journal.target?.[key] !== baseline.sourceSite?.[key])) throw new Error('Journal and baseline identify different INDY targets.');
if (baseline.sourceSite.url.replace(/\/$/, '') !== catalog.source.replace(/\/$/, '')) throw new Error('The baseline identifies another source site.');
const slotFor = (component) => ({ navigation: 'header', 'private-parties': 'events' })[component] ?? component;
const keyFor = (entry) => `${entry.variant}/${entry.component}`;
const changes = journal.changes ?? [];
const gaps = new Set(baseline.componentAudit.filter((entry) => entry.status !== 'present').map(keyFor));
const seen = new Set();
for (const change of changes) {
  const key = keyFor(change);
  if (!gaps.has(key) || seen.has(key)) throw new Error(`Change does not identify a unique baseline gap: ${key}`);
  if (!/^published\b/i.test(change.state ?? '') || !change.publishedSectionId || !change.draftSectionId || !change.publishedPageId || !change.draftPageId || !(change.nativeWidgetType ?? change.type)) throw new Error(`Published native source identity is incomplete: ${key}`);
  seen.add(key);
}
if (seen.size !== gaps.size) throw new Error(`Journal is incomplete: ${seen.size}/${gaps.size} baseline gaps have published results.`);

const options = baseline.componentAudit.filter((entry) => !seen.has(keyFor(entry)) && entry.status === 'present').map((entry) => ({
  variant: entry.variant, slot: slotFor(entry.component), sectionIds: entry.sourceSectionIds.map(String),
  canonicalComponent: entry.component, componentStatus: entry.status,
  componentNote: entry.notes.join(' '), componentAuditedAt: entry.auditedAt ?? baseline.auditedAt,
}));
const notes = {
  food: 'Dedicated native Concessions Menu using the actual site catalog; published source reviewed.',
  'private-parties': 'Dedicated private-hire content with occasions and an explicit link to the existing /private-hire/ route.',
  membership: 'Dedicated membership guidance and an explicit link to the existing /membership/ route.',
  contact: 'Native contact form with required name, email and message fields and a visible send action. Destination notification routing remains to be configured.',
};
const variants = new Map();
for (const change of changes) {
  const previous = variants.get(change.variant);
  if (previous && (previous.pageId !== String(change.publishedPageId) || previous.draftId !== String(change.draftPageId))) throw new Error(`Conflicting page identities: ${change.variant}`);
  variants.set(change.variant, { id: change.variant, pageId: String(change.publishedPageId), draftId: String(change.draftPageId) });
  options.push({ variant: change.variant, slot: slotFor(change.component), sectionIds: [String(change.publishedSectionId)],
    draftSectionIds: [String(change.draftSectionId)], nativeWidgetType: change.nativeWidgetType ?? change.type,
    canonicalComponent: change.component, componentStatus: 'present', componentNote: notes[change.component],
    componentAuditedAt: journal.updatedAt ?? journal.recordedAt ?? new Date().toISOString(),
  });
}
const metadata = { schema: 'fd-capture-review-metadata/v1', generatedAt: new Date().toISOString(),
  sourceSite: baseline.sourceSite, sourceJournal: journalPath, baselineAudit: baselinePath,
  requireAllReviewedOptions: true,
  reviewPolicy: 'Only exact published section IDs and slots receive these semantic reviews. Screenshot processing does not create or publish source content.',
  variants: [...variants.values()], options };
await writeFile(outputPath, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Prepared ${options.length} exact-source component reviews and ${variants.size} verified draft page identities at ${outputPath}.`);
