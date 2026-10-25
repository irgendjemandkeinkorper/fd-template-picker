import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createModel, buildCoverage, buildSelectionCoverage, buildExport, buildHandoff } from '../model.mjs';

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

test('required coverage never counts generic events, experience copy, or partial source as complete', () => {
  const captured = (slot, variant, extra = {}) => ({ ...option(slot, variant), captureStatus: 'captured-live', capture: { mode: 'live' }, ...extra });
  const example = { variants: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], slots: [
    { id: 'header', options: [captured('header', 'a'), captured('header', 'b')] },
    { id: 'hero', options: [captured('hero', 'a')] },
    { id: 'events', options: [captured('events', 'a'), captured('events', 'b', { canonicalComponent: 'private-parties', componentStatus: 'partial' })] },
    { id: 'experience', options: [captured('experience', 'a')] },
    { id: 'contact', options: [captured('contact', 'a', { captureStatus: 'not-rendered', image: null, height: 0 })] },
  ], componentAudit: [
    { variant: 'a', component: 'membership', status: 'missing', notes: 'No section on source.' },
    { variant: 'b', component: 'food', status: 'present', notes: 'New section awaits screenshot.' },
  ] };
  const coverage = buildCoverage(example), a = coverage.rows[0], b = coverage.rows[1];
  const status = (row, id) => row.components.find((component) => component.component === id).status;
  assert.equal(coverage.total, 12);
  assert.equal(coverage.captured, 3);
  assert.equal(coverage.completeVariants, 0);
  assert.equal(status(a, 'private-parties'), 'needs-audit');
  assert.equal(status(a, 'food'), 'needs-audit');
  assert.equal(status(a, 'contact'), 'not-visible');
  assert.equal(status(a, 'membership'), 'missing-source');
  assert.equal(status(b, 'private-parties'), 'partial-source');
  assert.equal(status(b, 'food'), 'capture-pending');
});

test('exports assess included selections separately from the catalog and retain source caveats', () => {
  const captured = (slot, extra = {}) => ({ ...option(slot, 'a'), captureStatus: 'captured-live', capture: { mode: 'live' }, ...extra });
  const example = { source: 'https://example.com', variants: [{ id: 'a', label: 'A' }], slots: [
    { id: 'header', label: 'Navigation', options: [captured('header')] },
    { id: 'hero', label: 'Hero', options: [captured('hero')] },
    { id: 'food', label: 'Food', options: [captured('food')] },
    { id: 'events', label: 'Private Parties', options: [captured('events', { canonicalComponent: 'private-parties', componentStatus: 'partial', componentNote: 'Mixed public programme and private hire.' })] },
    { id: 'membership', label: 'Membership', options: [captured('membership')] },
    { id: 'contact', label: 'Contact', options: [captured('contact')] },
    { id: 'now-playing', label: 'Now Playing', options: [captured('now-playing')] },
  ] };
  const model = createModel(example), state = model.defaultState('a');
  state.excluded.food = true;
  const data = buildExport(example, state, 'https://picker.test/');
  assert.equal(data.requiredComponentCoverage.scope, 'catalog');
  assert.equal(data.requiredComponentCoverage.captured, 5);
  assert.equal(data.selectionComponentCoverage.scope, 'included-selection');
  assert.equal(data.selectionComponentCoverage.captured, 4);
  assert.equal(data.selectionComponentCoverage.complete, false);
  assert.equal(data.selectionComponentCoverage.components.find((entry) => entry.component === 'food').status, 'missing-selection');
  const parties = data.sections.find((section) => section.slot === 'events');
  assert.equal(parties.canonicalComponent, 'private-parties');
  assert.equal(parties.componentStatus, 'partial');
  assert.equal(parties.componentGroup, 'required-component');
  assert.equal(parties.library.proposedPageTitle, 'a_private_parties');
  assert.equal(data.sections.find((section) => section.slot === 'now-playing').componentGroup, 'optional-movie-module');
  assert.match(buildHandoff(data), /Required components in this selection: 4\/6 captured/);
  assert.match(buildHandoff(data), /Food & Drink: missing selection/);
  assert.match(buildHandoff(data), /Mixed public programme and private hire/);
  assert.deepEqual(model.normalize(data), state);
});

test('partial, illustrative and altered captures cannot complete the required baseline', () => {
  const variants = [{ id: 'a', label: 'A' }];
  const example = { variants, slots: [{ id: 'hero', options: [{ ...option('hero', 'a'), captureStatus: 'captured-live', capture: { mode: 'live', sampleDataInjected: true } }] }] };
  const state = createModel(example).defaultState('a');
  assert.equal(buildSelectionCoverage(example, state).captured, 0);
  example.slots[0].options[0].capture = { mode: 'partial' };
  assert.equal(buildCoverage(example).rows[0].components.find((entry) => entry.component === 'hero').status, 'partial-capture');
  example.slots[0].options[0].capture = { mode: 'illustrative' };
  assert.equal(buildSelectionCoverage(example, state).captured, 0);
});

test('repository audit covers the shared component contract and references real source choices', async () => {
  const live = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'));
  const coverage = buildCoverage(live);
  assert.equal(live.componentAudit.length, live.variants.length * coverage.required.length);
  for (const audit of live.componentAudit) {
    const row = coverage.rows.find((entry) => entry.variant === audit.variant);
    assert.ok(row.components.some((entry) => entry.component === audit.component));
    if (!audit.sourceOptionId) continue;
    const option = live.slots.flatMap((slot) => slot.options).find((entry) => entry.id === audit.sourceOptionId);
    assert.ok(option, `Missing audited source: ${audit.sourceOptionId}`);
    assert.equal(option.canonicalComponent, audit.component);
    assert.equal(option.componentStatus, audit.status);
  }
});
