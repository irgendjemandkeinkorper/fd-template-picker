import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const evidenceRoot = resolve(root, '..', 'evidence');
const catalog = JSON.parse(await readFile(join(root, 'catalog.json'), 'utf8'));
const inventory = JSON.parse(await readFile(join(root, 'evidence', 'page-inventory.json'), 'utf8').catch(() => readFile(join(evidenceRoot, 'page-inventory.json'), 'utf8')));
await mkdir(join(root, 'evidence'), { recursive: true });
await writeFile(join(root, 'evidence', 'page-inventory.json'), `${JSON.stringify(inventory, null, 2)}\n`);
catalog.sourceSite = { ...inventory.target, url: catalog.source, inventoryVerifiedAt: inventory.capturedAt };
catalog.inventoryVerifiedAt = inventory.capturedAt;
catalog.schema = 'fd-template-catalog/v2';
catalog.captureNotes = [
  'The collection was inventoried in INDY Admin on 25 October 2026. The complete variants are A through L; all were published and Not Linked at that inspection.',
  'Legacy A–C screenshots from 20 October used fictional sample showtimes. Hero B also had a browser-only CSS correction. These are labeled illustrative until replaced by a live capture.',
  'New live captures preserve actual page content and empty states. A screenshot does not verify booking, forms, ordering or responsive behavior.',
  'Section-page names in the handoff are proposed. Library promotion and destination unlinking must be verified before marking a section reusable.',
];
const old = new Map((catalog.variants ?? []).map((v) => [v.id, v]));
const rows = inventory.rows.filter((r) => /^variant-[a-l]-(?:circuit|rep|late|odd|grid|concrete|cut|storybook|ma|box-office|clubhouse|midnight-lounge)$/.test(r[2]));
catalog.variants = rows.map((row) => {
  const [, title, id, count] = row;
  const letter = id.split('-')[1].toUpperCase();
  const name = title.replace(/^Variant [A-L] /, '');
  return { ...old.get(id), id, label: `${letter} · ${name}`, pageTitle: title, pageId: row[0], sectionCount: Number(count),
    published: row[5] === 'toggle_on', libraryStatus: row[6].trim(), sourceUrl: `${catalog.source}/${id}/`, inventoryVerifiedAt: inventory.capturedAt };
}).sort((a, b) => a.id.localeCompare(b.id));
for (const slot of catalog.slots) for (const option of slot.options) {
  const variant = catalog.variants.find((v) => v.id === option.variant);
  option.sourcePageTitle ??= variant?.pageTitle ?? option.variant;
  option.pageId ??= variant?.pageId;
  option.library ??= { status: 'not-created' };
  option.capture ??= { mode: 'illustrative', capturedAt: catalog.generatedAt, notes: [
    ...(slot.id === 'now-playing' ? ['Fictional sample showtimes were added in the browser during the original capture.'] : []),
    ...(slot.id === 'hero' && option.variant === 'variant-b-rep' ? ['The original capture corrected a CSS selector in the browser.'] : []),
    'Legacy capture set; fresh live capture pending.',
  ] };
}
for (const variant of catalog.variants) variant.sectionOrder ??= catalog.slots.filter((s) => s.options.some((o) => (o.sharedBy ?? [o.variant]).includes(variant.id))).map((s) => s.id);

if (process.argv[2]) {
  const file = resolve(process.argv[2]);
  const observation = JSON.parse(await readFile(file, 'utf8'));
  observation.capturedAt ??= observation.generatedAt;
  if (Array.isArray(observation.options)) {
    observation.variants = [...new Set(observation.options.map((o) => o.variant))].map((id) => ({ id,
      sections: observation.options.filter((o) => o.variant === id).sort((a, b) => (a.sourceBounds?.y ?? 0) - (b.sourceBounds?.y ?? 0)).map((o) => ({
        ...o, slotId: o.slot, label: o.slotLabel, image: o.image ? resolve(root, o.image) : null,
        capture: { mode: o.captureStatus === 'partial' ? 'partial' : 'live', capturedAt: o.capturedAt,
          method: o.captureMethod, selectors: o.sectionSelectors?.map((s) => s.selector).filter(Boolean) ?? [],
          sourceBounds: o.sourceBounds, captureBounds: o.captureBounds, evidence: o.captureEvidence,
          missingDocumentY: o.missingDocumentY, excludedDocumentY: o.excludedDocumentY,
          appearanceAltered: o.appearanceAltered, sampleDataInjected: o.sampleDataInjected,
          notes: [o.captureStatus === 'not-rendered' ? 'Published component has zero visible height.' : o.captureStatus === 'partial' ? 'Capture coverage is incomplete; open source page for full appearance.' : 'Actual published appearance; no data fixtures or CSS repairs.', ...(o.captureNote ? [o.captureNote] : [])],
        },
      })),
    }));
  }
  for (const observed of observation.variants) {
    const variant = catalog.variants.find((v) => v.id === observed.id);
    if (!variant) throw new Error(`Unverified variant ${observed.id}`);
    Object.assign(variant, Object.fromEntries(Object.entries(observed).filter(([key]) => key !== 'sections')));
    variant.sectionOrder = [...new Set(observed.sections.map((s) => s.slotId))];
    // Observations are a complete rendered-page snapshot. Do not leave an old
    // illustrative choice available after that section disappears from the DOM.
    for (const slot of catalog.slots) {
      slot.options = slot.options.flatMap((existing) => {
        if (!(existing.sharedBy ?? [existing.variant]).includes(variant.id)) return [existing];
        const sharedBy = (existing.sharedBy ?? [existing.variant]).filter((id) => id !== variant.id);
        if (!sharedBy.length) return [];
        return [{ ...existing, id: `${slot.id}--legacy-shared-${sharedBy.join('_')}`, sharedBy }];
      });
    }
    for (const section of observed.sections) {
      let slot = catalog.slots.find((s) => s.id === section.slotId);
      if (!slot) { slot = { id: section.slotId, label: section.label ?? section.slotId, options: [] }; catalog.slots.splice(catalog.slots.length - 1, 0, slot); }
      let image = section.image;
      if (image) {
        const sourceFile = resolve(dirname(file), image);
        const allowed = resolve(root, '..');
        if (!sourceFile.startsWith(allowed + sep)) throw new Error('Capture images must be within the INDY workspace.');
        image = `screenshots/${section.slotId}/${variant.id}${sourceFile.toLowerCase().endsWith('.png') ? '.png' : '.jpg'}`;
        const target = join(root, image);
        await mkdir(dirname(target), { recursive: true });
        if (sourceFile !== target) await copyFile(sourceFile, target);
      }
      const option = { id: `${slot.id}--${variant.id}`, variant: variant.id, variantLabel: variant.label, name: section.name,
        components: section.components ?? [section.name], sharedBy: [variant.id], image, width: section.width, height: section.height,
        sourceUrl: variant.sourceUrl, sourcePageTitle: variant.pageTitle, pageId: variant.pageId, draftId: variant.draftId ?? null,
        adminUrl: variant.adminUrl ?? null, sectionIds: section.sectionIds ?? [], draftSectionIds: section.draftSectionIds ?? [],
        captureStatus: section.captureStatus ?? 'captured-live',
        library: section.library ?? { status: 'not-created' }, dependencies: section.dependencies ?? [], dependenciesStatus: section.dependenciesStatus ?? 'unverified',
        capture: section.capture ?? { mode: 'live', capturedAt: observation.capturedAt, notes: [] },
      };
      slot.options.push(option);
    }
  }
  catalog.generatedAt = observation.capturedAt ?? new Date().toISOString();
}
catalog.slots = catalog.slots.filter((slot) => slot.options.length);
// K's draft identity was separately inspected in Admin; do not infer draft IDs
// for the other variants from numbering patterns.
const clubhouse = catalog.variants.find((variant) => variant.id === 'variant-k-clubhouse');
if (clubhouse) clubhouse.draftId = '5916';
const clubhouseDraftSections = { '24895': '24890', '24896': '24891', '24897': '24892', '24898': '24893', '24899': '24894' };
for (const slot of catalog.slots) for (const option of slot.options) {
  if (option.variant !== 'variant-k-clubhouse') continue;
  option.draftId = '5916';
  option.draftSectionIds = (option.sectionIds ?? []).map((id) => clubhouseDraftSections[id]).filter(Boolean);
}
for (const option of catalog.slots.find((slot) => slot.id === 'header')?.options ?? []) {
  if (option.width >= 500 || option.height <= option.width) continue;
  const variantOptions = catalog.slots.flatMap((slot) => slot.options).filter((other) => other.variant === option.variant);
  const canvasWidth = Math.max(...variantOptions.map((other) => (other.capture?.sourceBounds?.x ?? 0) + (other.capture?.sourceBounds?.width ?? other.width ?? 0)));
  option.presentation = { kind: 'sidebar', width: option.width, canvasWidth };
  const note = 'This header is a sidebar. Full layout and Theme & Style settings must be reviewed on the source page.';
  if (!option.capture.notes.includes(note)) option.capture.notes.push(note);
}
if (!catalog.slots.some((s) => s.options.some((o) => o.capture?.mode === 'illustrative'))) catalog.captureNotes = catalog.captureNotes.filter((note) => !note.startsWith('Legacy A'));
await writeFile(join(root, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Catalog: ${catalog.variants.length} inventoried variants; ${catalog.slots.reduce((n, s) => n + s.options.length, 0)} section styles.`);
