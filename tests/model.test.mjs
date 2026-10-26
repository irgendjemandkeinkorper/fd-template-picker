import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createModel, visualCaptureKey, visualReviewForOption, buildCoverage, buildSelectionCoverage, buildExport, buildHandoff } from '../model.mjs';
import { DEFAULT_BRAND_COLORS, assessBrandColors, BRAND_COLOR_NOTE, normalizePalette, paletteKey } from '../colors.mjs';
import { typographyKey } from '../typography.mjs';

const option = (slot, variant) => ({ id: `${slot}--${variant}`, variant, variantLabel: variant, components: [`${slot} ${variant}`], sharedBy: [variant], sourceUrl: `https://example.com/${variant}/`, image: `screenshots/${slot}/${variant}.jpg`, width: 1440, height: 500, pageId: 100, draftId: 101, sectionIds: ['200'], draftSectionIds: ['201'] });
const checked = (entry) => ({ ...entry, visualReview: { status: 'passed', captureKey: visualCaptureKey(entry), notes: 'Pixels match the label.' } });
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

test('legacy imports and v3 exports round trip order, selections, exclusions and notes', () => {
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

test('brand colors survive saved-state links, exports and imports without changing screenshot colors', () => {
  const model = createModel(catalog), state = model.defaultState('b');
  state.brandColors = { primary: '#183b4e', secondary: '#fed' };
  const data = buildExport(catalog, state, 'https://picker.test/');
  const expected = { primary: '#183B4E', secondary: '#FFEEDD' };
  assert.deepEqual(data.brandColors, expected);
  assert.deepEqual(data.brandColorAssessment, assessBrandColors(expected));
  assert.deepEqual(model.normalize(data).brandColors, expected);
  // Shared links serialize the saved state directly, then run it through normalize.
  const shared = JSON.parse(Buffer.from(Buffer.from(JSON.stringify(state)).toString('base64'), 'base64').toString());
  assert.deepEqual(model.normalize(shared).brandColors, expected);
  assert.equal(data.sections.find((section) => section.slot === 'hero').screenshot, 'https://picker.test/screenshots/hero/b.jpg');
  const handoff = buildHandoff(data);
  assert.match(handoff, /Primary: #183B4E/);
  assert.match(handoff, /Secondary: #FFEEDD/);
  assert.ok(handoff.includes(`${data.brandColorAssessment.ratio.toFixed(2)}:1`));
  assert.ok(handoff.includes(BRAND_COLOR_NOTE));
});

test('legacy saved selections receive safe defaults and malformed imported color values are repaired', () => {
  const model = createModel(catalog);
  assert.deepEqual(model.normalize({ project: 'Legacy', order: ['header', 'hero', 'footer'] }).brandColors, DEFAULT_BRAND_COLORS);
  assert.deepEqual(model.normalize({ brandColors: { primary: 'not a color', secondary: '#000' } }).brandColors,
    { primary: DEFAULT_BRAND_COLORS.primary, secondary: '#000000' });
  const first = model.defaultState(), second = model.defaultState();
  first.brandColors.primary = '#FFFFFF';
  assert.deepEqual(second.brandColors, DEFAULT_BRAND_COLORS, 'New selections must not share a mutable default object.');
});

test('guided progress round trips explicit confirmations without inventing completion for older selections', () => {
  const model = createModel(catalog), state = model.defaultState('a');
  assert.deepEqual(state.workflow, { currentStep: 'colors', confirmed: {} });
  assert.deepEqual(model.normalize({ schema: 'fd-template-picker/v1', sections: [] }).workflow, { currentStep: 'colors', confirmed: {} });
  state.workflow = { currentStep: 'food', confirmed: { colors: '#183B4E|#F4EEE4', navigation: 'header--a', hero: 'hero--a' } };
  const data = buildExport(catalog, state, 'https://picker.test/');
  const upgraded = { ...state.workflow, confirmed: { ...state.workflow.confirmed, colors: `${paletteKey(normalizePalette())}|${typographyKey()}` } };
  assert.deepEqual(data.workflow, upgraded);
  assert.deepEqual(model.normalize(data).workflow, upgraded);
  assert.deepEqual(model.normalize(JSON.parse(JSON.stringify(state))).workflow, upgraded);
  assert.match(buildHandoff(data), /Checklist saved at: Food & Drink/);
  assert.match(buildHandoff(data), /Recorded confirmations: Colors & fonts, Navigation, Hero/);
});

test('malformed progress is clamped and missing, altered or unreadable colors cannot retain confirmation', () => {
  const model = createModel(catalog);
  const workflow = { currentStep: 'bogus', confirmed: { colors: '#183B4E|#F4EEE4', navigation: 'header--a', hero: 1, review: 'done', bogus: 'done' } };
  assert.deepEqual(model.normalize({ workflow }).workflow, { currentStep: 'colors', confirmed: { navigation: 'header--a' } });
  const confirm = (brandColors, key = '#183B4E|#F4EEE4') => model.normalize({ brandColors, workflow: { currentStep: 'review', confirmed: { colors: key } } }).workflow.confirmed;
  assert.deepEqual(confirm({ primary: 'invalid', secondary: DEFAULT_BRAND_COLORS.secondary }), {});
  assert.deepEqual(confirm({ primary: '#000000', secondary: '#FFFFFF' }), {});
  assert.deepEqual(confirm({ primary: '#000000', secondary: '#000000' }, '#000000|#000000'), {});
  assert.deepEqual(confirm(DEFAULT_BRAND_COLORS), { colors: `${paletteKey(normalizePalette())}|${typographyKey()}` });
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
    const source = o.sourceSite ?? live.sourceSite;
    const allowed = [live.source, ...(live.sourceSites ?? []).map(s => s.url)];
    assert.ok(allowed.some(url => new URL(o.sourceUrl).origin === new URL(url).origin));
    if (o.demoProvenance) assert.equal(source.siteId, o.demoProvenance.siteId);
    if (o.image) assert.ok((await readFile(new URL(`../${o.image}`, import.meta.url))).length > 0);
  }
});

test('required coverage never counts generic events, experience copy, or partial source as complete', () => {
  const captured = (slot, variant, extra = {}) => checked({ ...option(slot, variant), captureStatus: 'captured-live', capture: { mode: 'live' }, ...extra });
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
  const captured = (slot, extra = {}) => checked({ ...option(slot, 'a'), captureStatus: 'captured-live', capture: { mode: 'live' }, ...extra });
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
  assert.match(buildHandoff(data), /Required previews visually checked: 4\/6/);
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

test('source presence stays separate from failed, pending and passed visual reviews', () => {
  const hero = { ...option('hero', 'a'), componentStatus: 'present', captureStatus: 'captured-live', capture: { mode: 'live', capturedAt: '2026-10-25' } };
  const example = { variants: [{ id: 'a', label: 'A' }], slots: [{ id: 'hero', options: [hero] }] };
  const assessment = () => buildCoverage(example).rows[0].components.find((entry) => entry.component === 'hero');
  assert.equal(assessment().status, 'visual-pending');
  for (const [reviewStatus, expected] of [['rejected', 'visual-rejected'], ['needs-review', 'visual-review'], ['passed', 'captured']]) {
    hero.visualReview = { status: reviewStatus, captureKey: visualCaptureKey(hero), notes: 'Image inspection.' };
    assert.equal(assessment().status, expected);
    assert.equal(assessment().sourceStatus, 'present');
    assert.equal(buildCoverage(example).sourcePresent, 1);
    assert.equal(buildCoverage(example).captured, reviewStatus === 'passed' ? 1 : 0);
  }
  const data = buildExport(example, createModel(example).defaultState('a'), 'https://picker.test/');
  assert.equal(data.sections[0].visualReview.status, 'passed');
  hero.capture.capturedAt = '2026-10-26';
  assert.equal(visualReviewForOption(hero).status, 'not-reviewed');
  assert.equal(assessment().status, 'visual-pending');
  assert.equal(buildCoverage(example).sourcePresent, 1);
});

test('changed pixels cannot silently keep a checked review in the repository catalog', async () => {
  const live = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'));
  for (const entry of live.slots.flatMap((slot) => slot.options).filter((entry) => entry.visualReview?.status === 'passed')) {
    assert.equal(entry.visualReview.captureKey, visualCaptureKey(entry), `Stale capture review: ${entry.id}`);
    const pixels = await readFile(new URL(`../${entry.image}`, import.meta.url));
    assert.equal(entry.visualReview.imageSha256, createHash('sha256').update(pixels).digest('hex'), `Changed image requires a visual review: ${entry.id}`);
  }
});
