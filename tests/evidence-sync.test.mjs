import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { visualCaptureKey, visualReviewForOption } from '../model.mjs';

async function fixture(t, variant = 'variant-b-rep') {
  const workspace = await mkdtemp(join(tmpdir(), 'fd-picker-evidence-'));
  t.after(async () => {
    assert.equal(dirname(resolve(workspace)), resolve(tmpdir()));
    assert.match(basename(workspace), /^fd-picker-evidence-/);
    await rm(workspace, { recursive: true, force: true });
  });
  const root = join(workspace, 'picker');
  await mkdir(join(root, 'scripts'), { recursive: true });
  await mkdir(join(root, 'evidence'), { recursive: true });
  for (const file of ['model.mjs', 'colors.mjs', 'names.mjs', 'scripts/sync-evidence.mjs', 'scripts/sync-component-audit.mjs']) await copyFile(new URL(`../${file}`, import.meta.url), join(root, file));
  const catalog = { source: 'https://example.com', generatedAt: '2026-10-25', variants: [{ id: variant, pageTitle: 'Variant B Rep' }], slots: [{ id: 'events', label: 'Private Parties', options: [{
    id: `events--${variant}`, variant, name: 'Mixed programme', sectionIds: ['1'], canonicalComponent: 'private-parties', componentStatus: 'partial', componentNote: 'One private-hire item among public events.', componentAuditedAt: '2026-10-25',
  }] }], componentAudit: [{ variant, component: 'private-parties', status: 'partial', sourceOptionId: `events--${variant}`, sourceSectionIds: ['1'], notes: ['Mixed programme.'] }] };
  await writeFile(join(root, 'catalog.json'), JSON.stringify(catalog));
  await writeFile(join(root, 'evidence', 'page-inventory.json'), JSON.stringify({ target: { region: 'Test', circuit: 'Test', site: 'Test' }, capturedAt: '2026-10-25', rows: [['2', 'Variant B Rep', variant, '1', '', 'toggle_on', 'Not Linked']] }));
  return { workspace, root, variant, catalog };
}

test('capture ingestion preserves semantic caveats and requires explicit review for changed source sections', async (t) => {
  const { workspace, root, variant } = await fixture(t);
  const input = join(workspace, 'observation.json');
  const section = { slotId: 'events', name: 'Private hire', sectionIds: ['1'], image: null, width: 0, height: 0, captureStatus: 'not-rendered', capture: { mode: 'live' } };
  const ingest = async () => {
    await writeFile(input, JSON.stringify({ capturedAt: '2026-10-26', variants: [{ id: variant, sections: [section] }] }));
    execFileSync(process.execPath, [join(root, 'scripts', 'sync-evidence.mjs'), input]);
    return JSON.parse(await readFile(join(root, 'catalog.json'), 'utf8'));
  };
  let catalog = await ingest();
  assert.equal(catalog.slots[0].options[0].componentStatus, 'partial');
  assert.equal(catalog.componentAudit[0].status, 'partial');
  section.sectionIds = ['3'];
  catalog = await ingest();
  assert.equal(catalog.slots[0].options[0].componentStatus, 'unverified');
  assert.equal(catalog.componentAudit[0].status, 'partial');
  Object.assign(section, { canonicalComponent: 'private-parties', componentStatus: 'present', componentNote: 'Dedicated private-hire content and a verified route.', designNote: null });
  catalog = await ingest();
  assert.equal(catalog.slots[0].options[0].componentStatus, 'present');
  assert.equal(catalog.slots[0].options[0].captureStatus, 'not-rendered');
  assert.equal(catalog.componentAudit[0].status, 'present');
  assert.deepEqual(catalog.componentAudit[0].sourceSectionIds, ['3']);
  assert.equal(catalog.componentAudit[0].auditedAt, '2026-10-26');
});

test('normalized capture ingestion keeps verified draft identities and multiple same-slot options', async (t) => {
  const { workspace, root, variant } = await fixture(t, 'variant-k-clubhouse');
  const input = join(workspace, 'captures.json');
  const firstImage = join(workspace, 'first.jpg'), secondImage = join(workspace, 'second.jpg');
  await writeFile(firstImage, 'first screenshot bytes');
  await writeFile(secondImage, 'second screenshot bytes');
  await writeFile(input, JSON.stringify({ generatedAt: '2026-10-26',
    variants: [{ id: variant, draftId: '5916', pageId: '5915', pageTitle: 'Variant K Clubhouse', sectionCount: 8 }],
    options: [
      { variant, slot: 'food', name: 'Native menu', sectionIds: ['25135'], draftSectionIds: ['25122'], nativeWidgetType: 'Concessions Menu', canonicalComponent: 'food', componentStatus: 'present', image: null, captureStatus: 'captured-live' },
      { variant, slot: 'programme', name: 'First public programme', sectionIds: ['2'], image: firstImage },
      { variant, slot: 'programme', name: 'Second public programme', sectionIds: ['3'], image: secondImage },
    ],
  }));
  execFileSync(process.execPath, [join(root, 'scripts', 'sync-evidence.mjs'), input]);
  const catalog = JSON.parse(await readFile(join(root, 'catalog.json'), 'utf8'));
  const food = catalog.slots.find((slot) => slot.id === 'food').options[0];
  assert.equal(catalog.variants[0].sectionCount, 8);
  assert.equal(food.draftId, '5916');
  assert.equal(food.pageId, '5915');
  assert.deepEqual(food.draftSectionIds, ['25122']);
  assert.equal(food.nativeWidgetType, 'Concessions Menu');
  const programmes = catalog.slots.find((slot) => slot.id === 'programme').options;
  assert.deepEqual(programmes.map((option) => option.id), [`programme--${variant}`, `programme--${variant}-2`]);
  assert.notEqual(programmes[0].image, programmes[1].image);
  assert.equal(await readFile(join(root, programmes[0].image), 'utf8'), 'first screenshot bytes');
  assert.equal(await readFile(join(root, programmes[1].image), 'utf8'), 'second screenshot bytes');
});

test('capture sync preserves reviewed display aliases and invalidates a changed preview without autopassing it', async (t) => {
  const { workspace, root, variant, catalog } = await fixture(t, 'variant-f-concrete');
  const originalName = 'Food F - Price Table';
  const entry = catalog.slots[0].options[0];
  Object.assign(entry, { name: 'Food F - Product Cards', sourceName: originalName,
    sourceAliasNote: 'The source alias is Price Table; the image shows product cards.', components: [originalName],
    image: `screenshots/events/${variant}.jpg`, width: 1440, height: 500,
    captureStatus: 'captured-live', capture: { mode: 'live', capturedAt: '2026-10-25' } });
  entry.visualReview = { status: 'passed', captureKey: visualCaptureKey(entry), notes: 'Reviewed image.', imageSha256: 'review-fingerprint' };
  await writeFile(join(root, 'catalog.json'), JSON.stringify(catalog));
  const sourceImage = join(workspace, 'source.jpg');
  await writeFile(sourceImage, 'unchanged screenshot bytes');
  const input = join(workspace, 'observation.json');
  const section = { slotId: 'events', name: originalName, components: [originalName], sectionIds: ['1'],
    image: sourceImage, width: 1440, height: 500, captureStatus: 'captured-live', capture: { ...entry.capture } };
  const ingest = async () => {
    await writeFile(input, JSON.stringify({ capturedAt: section.capture.capturedAt, variants: [{ id: variant, sections: [section] }] }));
    execFileSync(process.execPath, [join(root, 'scripts', 'sync-evidence.mjs'), input]);
    return JSON.parse(await readFile(join(root, 'catalog.json'), 'utf8')).slots[0].options[0];
  };
  let synced = await ingest();
  assert.equal(synced.name, 'Food F - Product Cards');
  assert.equal(synced.displayName, 'Food F - Product Cards');
  assert.equal(synced.sourceName, originalName);
  assert.equal(synced.sourceAliasNote, entry.sourceAliasNote);
  assert.deepEqual(synced.components, [originalName]);
  assert.deepEqual(synced.visualReview, entry.visualReview);
  assert.equal(visualReviewForOption(synced).status, 'passed');

  section.capture.capturedAt = '2026-10-26';
  synced = await ingest();
  assert.equal(synced.name, 'Food F - Product Cards');
  assert.deepEqual(synced.visualReview, entry.visualReview);
  assert.equal(visualReviewForOption(synced).status, 'not-reviewed');
  section.width = 1280;
  synced = await ingest();
  assert.equal(visualReviewForOption(synced).status, 'not-reviewed');

  section.displayName = 'Food F - Reviewed Cards';
  synced = await ingest();
  assert.equal(synced.name, 'Food F - Reviewed Cards');
  assert.equal(synced.sourceName, originalName);
  section.displayName = null;
  section.sourceAliasNote = null;
  synced = await ingest();
  assert.equal(synced.name, originalName);
  assert.equal(synced.sourceAliasNote, null);
});

test('semantic audit ingestion rejects another source site before writing the catalog', async (t) => {
  const { workspace, root } = await fixture(t);
  const auditFile = join(workspace, 'audit.json');
  await writeFile(auditFile, JSON.stringify({ schema: 'fd-component-parity-audit/v1', sourceSite: { url: 'https://unrelated.test' }, componentAudit: [] }));
  const before = await readFile(join(root, 'catalog.json'), 'utf8');
  assert.throws(() => execFileSync(process.execPath, [join(root, 'scripts', 'sync-component-audit.mjs'), auditFile], { stdio: 'pipe' }), /audit belongs to another source site/);
  assert.equal(await readFile(join(root, 'catalog.json'), 'utf8'), before);
});
