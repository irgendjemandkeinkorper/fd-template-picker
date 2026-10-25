import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createModel, buildExport, buildHandoff } from '../model.mjs';

const option = (slot, variant) => ({ id: `${slot}--${variant}`, variant, variantLabel: variant, components: [`${slot} ${variant}`], sharedBy: [variant], sourceUrl: `https://example.com/${variant}/`, image: `screenshots/${slot}/${variant}.jpg`, width: 1440, height: 500, pageId: 100, draftId: 101, sectionIds: ['200'], draftSectionIds: ['201'] });
const catalog = { source: 'https://example.com', variants: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B', sectionOrder: ['food', 'hero'] }, { id: 'c', label: 'C' }], slots: [
  { id: 'header', label: 'Header', options: [{ ...option('header', 'a'), sharedBy: ['a', 'b'] }] },
  { id: 'hero', label: 'Hero', options: [option('hero', 'a'), option('hero', 'b')] },
  { id: 'food', label: 'Food', options: [option('food', 'a')] },
  { id: 'footer', label: 'Footer', options: [{ ...option('footer', 'a'), sharedBy: ['a', 'b'] }] },
] };

test('whole-theme selection excludes missing sections and honors source order', () => {
  const model = createModel(catalog), state = model.defaultState('b');
  assert.deepEqual(state.order, ['header', 'food', 'hero', 'footer']);
  assert.equal(state.picks.hero, 'hero--b');
  assert.equal(state.excluded.food, true);
  assert.equal(state.excluded.header, undefined);
  assert.deepEqual(model.capturedVariants.map((v) => v.id), ['a', 'b']);
});

test('normalization repairs obsolete options and duplicate/unknown slots while preserving notes and exclusions', () => {
  const model = createModel(catalog);
  const state = model.normalize({ project: 'My cinema', order: ['food', 'food', 'unknown', 'footer', 'hero'], picks: { hero: 'removed' }, excluded: { hero: true }, slotNotes: { food: 'Use our menu' } });
  assert.deepEqual(state.order, ['header', 'food', 'hero', 'footer']);
  assert.equal(state.picks.hero, 'hero--a');
  assert.equal(state.excluded.hero, true);
  assert.equal(state.slotNotes.food, 'Use our menu');
});

test('v1 imports and v2 exports round trip order, selections, exclusions and notes', () => {
  const model = createModel(catalog), original = model.defaultState('b');
  original.slotNotes.hero = 'Keep text short'; original.project = ' Cinema '; original.notes = 'Brand blue';
  const data = buildExport(catalog, original, 'https://picker.test/subdir/');
  const restored = model.normalize(data);
  assert.equal(restored.project, 'Cinema');
  assert.deepEqual(restored.order, original.order);
  assert.deepEqual(restored.picks, original.picks);
  assert.deepEqual(restored.excluded, original.excluded);
  assert.deepEqual(restored.slotNotes, original.slotNotes);
  assert.equal(data.sections.find((s) => s.slot === 'hero').screenshot, 'https://picker.test/subdir/screenshots/hero/b.jpg');
  assert.equal(data.sections.find((s) => s.slot === 'hero').library.proposedPageTitle, 'b_hero');
  assert.equal(data.sections.find((s) => s.slot === 'hero').publishedPageId, 100);
  assert.equal(data.sections.find((s) => s.slot === 'hero').draftPageId, 101);
  assert.deepEqual(data.sections.find((s) => s.slot === 'hero').draftSectionIds, ['201']);
  assert.equal(data.sections.find((s) => s.slot === 'header').library.proposedPageTitle, null);
  assert.match(buildHandoff(data), /Keep text short/);
  assert.doesNotMatch(buildHandoff(data), /## 2\. Food/);
});

test('an older selection excludes newly cataloged slots instead of adding unrequested sections', () => {
  const model = createModel(catalog);
  const state = model.normalize({ order: ['header', 'hero', 'footer'], picks: { hero: 'hero--b' } });
  assert.equal(state.excluded.food, true);
  assert.equal(state.excluded.hero, undefined);
});

test('repository catalog has valid selection IDs and existing screenshot files', async () => {
  const live = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'));
  const model = createModel(live);
  assert.ok(model.capturedVariants.length >= 3);
  for (const slot of live.slots) for (const o of slot.options) {
    assert.ok(o.sourceUrl.startsWith(live.source));
    if (o.image) assert.ok((await readFile(new URL(`../${o.image}`, import.meta.url))).length > 0);
  }
});
