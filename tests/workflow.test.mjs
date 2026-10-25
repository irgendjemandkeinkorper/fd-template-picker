import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createModel, visualCaptureKey } from '../model.mjs';
import { GUIDE_STEPS, createWorkflow, isDemoOption } from '../workflow.mjs';

const passedOption = (slot, id, extra = {}) => {
  const option = { id, variant: 'a', variantLabel: 'A · Circuit', name: id, image: `${id}.jpg`, width: 1440, height: 300,
    captureStatus: 'captured-live', capture: { mode: 'live' }, ...extra };
  return { ...option, visualReview: { status: 'passed', captureKey: visualCaptureKey(option) } };
};
const fixture = () => ({ slots: [
  { id: 'header', options: [passedOption('header', 'nav-a')] },
  { id: 'hero', options: [passedOption('hero', 'hero-a'), passedOption('hero', 'hero-b')] },
  { id: 'food', options: [passedOption('food', 'food-a')] },
  { id: 'events', options: [passedOption('events', 'party-a', { canonicalComponent: 'private-parties' })] },
  { id: 'membership', options: [passedOption('membership', 'member-a')] },
  { id: 'contact', options: [passedOption('contact', 'contact-a')] },
] });
const colors = { colorsKey: '#102030|#ffffff', colorsValid: true };

test('customer checklist exposes six canonical sections in a fixed order', () => {
  const catalog = fixture(), workflow = createWorkflow(catalog);
  assert.deepEqual(GUIDE_STEPS.map((step) => step.id), ['colors', 'navigation', 'hero', 'food', 'private-parties', 'membership', 'contact', 'review']);
  assert.equal(workflow.choicesFor('navigation')[0].slotId, 'header');
  assert.equal(workflow.choicesFor('private-parties')[0].slotId, 'events');
  assert.deepEqual(workflow.choicesFor('unknown'), []);
});

test('available choices reject wrong pixels, stale reviews, partial content and fabricated captures', () => {
  const catalog = fixture(), slot = catalog.slots[1], valid = slot.options[0];
  assert.equal(isDemoOption(catalog, slot, valid), true);
  const rejected = [
    { ...valid, visualReview: { ...valid.visualReview, status: 'needs-review' } },
    { ...valid, image: 'new-unchecked.jpg' },
    { ...valid, componentStatus: 'partial' },
    { ...valid, captureStatus: 'partial' },
    { ...valid, capture: { ...valid.capture, appearanceAltered: true } },
    { ...valid, capture: { ...valid.capture, sampleDataInjected: true } },
    { ...valid, image: null },
  ];
  for (const option of rejected) assert.equal(isDemoOption(catalog, slot, option), false);
  assert.equal(isDemoOption({ ...catalog, componentAudit: [{ variant: 'a', component: 'hero', status: 'unverified' }] }, slot, valid), false);
});

test('default picks do not complete the checklist; confirmation records the specific choice', () => {
  const catalog = fixture(), workflow = createWorkflow(catalog), state = createModel(catalog).defaultState();
  let progress = workflow.normalizeProgress();
  assert.equal(workflow.firstIncomplete(progress, state, colors), 'colors');
  progress = workflow.confirm(progress, state, 'colors', colors);
  assert.equal(workflow.firstIncomplete(progress, state, colors), 'navigation');
  for (const step of GUIDE_STEPS.filter((entry) => entry.kind === 'section')) progress = workflow.confirm(progress, state, step.id, colors);
  assert.equal(workflow.firstIncomplete(progress, state, colors), 'review');
  assert.equal(workflow.completed(progress, state, 'review', colors), true);
  state.picks.hero = 'hero-b';
  assert.equal(workflow.firstIncomplete(progress, state, colors), 'hero');
  assert.equal(workflow.completed(progress, state, 'review', colors), false);
  assert.equal(workflow.completed(progress, state, 'food', colors), true);
});

test('resume and editing keep earlier choices and prevent skipping unconfirmed steps', () => {
  const catalog = fixture(), workflow = createWorkflow(catalog), state = createModel(catalog).defaultState();
  let progress = workflow.normalizeProgress({ currentStep: 'review', confirmed: { colors: colors.colorsKey, navigation: 'nav-a', unknown: 'fake', hero: 123 } });
  assert.deepEqual(progress.confirmed, { colors: colors.colorsKey, navigation: 'nav-a' });
  assert.equal(workflow.accessibleStep(progress, state, progress.currentStep, colors), 'hero');
  assert.equal(workflow.accessibleStep(progress, state, 'colors', colors), 'colors');
  assert.equal(workflow.accessibleStep(progress, state, 'unknown', colors), 'hero');
  assert.equal(workflow.firstIncomplete(progress, state, { ...colors, colorsKey: '#202030|#ffffff' }), 'colors');
  assert.throws(() => workflow.confirm(progress, state, 'colors', { ...colors, colorsValid: false }), /readable/);
  state.excluded.hero = true;
  assert.throws(() => workflow.confirm(progress, state, 'hero', colors), /available style/);
});

test('the demo has reviewed choices available for every required section', async () => {
  const catalog = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'));
  const workflow = createWorkflow(catalog);
  for (const step of GUIDE_STEPS.filter((entry) => entry.kind === 'section')) {
    assert.ok(workflow.choicesFor(step.id).length > 0, `${step.label} has no demo choices`);
    assert.ok(workflow.choicesFor(step.id).every(({ option }) => option.visualReview.status === 'passed'));
  }
  assert.equal(workflow.choicesFor('hero').some(({ option }) => option.id.includes('variant-f')), false);
});

test('guided normalization removes hidden extras and replaces an unavailable imported choice without confirming it', () => {
  const catalog = fixture();
  catalog.slots.push({ id: 'now-playing', options: [passedOption('now-playing', 'movie-a')] });
  const workflow = createWorkflow(catalog), model = createModel(catalog), state = model.defaultState();
  state.order = ['events', 'hero', 'now-playing', 'header', 'food', 'contact', 'membership'];
  state.picks.hero = 'removed-hero'; state.excluded.contact = true;
  state.workflow = workflow.normalizeProgress({ confirmed: { hero: 'removed-hero' } });
  const normalized = workflow.normalizeGuidedSelection(state);
  assert.deepEqual(normalized.order, ['header', 'hero', 'food', 'events', 'membership', 'contact', 'now-playing']);
  assert.equal(normalized.picks.hero, 'hero-a');
  assert.equal(normalized.excluded.contact, undefined);
  assert.equal(normalized.excluded['now-playing'], true);
  assert.equal(state.picks.hero, 'removed-hero', 'Restoration must not mutate its input.');
  assert.equal(workflow.completed(normalized.workflow, normalized, 'hero', colors), false);
});

test('customer summary contains only chosen core styles and brand details', () => {
  const catalog = fixture();
  catalog.slots.push({ id: 'now-playing', options: [passedOption('now-playing', 'movie-a')] });
  const workflow = createWorkflow(catalog), state = workflow.normalizeGuidedSelection(createModel(catalog).defaultState());
  state.project = 'The Bijou'; state.brandColors = { primary: '#000000', secondary: '#FFFFFF' };
  const summary = workflow.buildCustomerSummary(state);
  assert.match(summary, /^The Bijou — Template selection/);
  assert.match(summary, /Primary: #000000/);
  assert.match(summary, /Text contrast: 21\.00:1/);
  assert.match(summary, /Demo images keep their original colors/);
  assert.match(summary, /1\. Navigation: A · Circuit/);
  assert.match(summary, /6\. Contact Us: A · Circuit/);
  assert.doesNotMatch(summary, /movie-a|now-playing|Library|INDY|Page ID|nav-a|source|capture/i);
});

test('reviewed design groups present one representative while preserving all source choices', () => {
  const catalog = fixture(), slot = catalog.slots[0];
  const design = { id: 'navigation-standard', label: 'Standard', representativeOptionId: 'nav-g', reviewedAt: '2026-10-25' };
  slot.options.push(...['h', 'g', 'i', 'j', 'k', 'l'].map((variant) => passedOption('header', `nav-${variant}`, { variant, customerDesign: { ...design } })));
  const workflow = createWorkflow(catalog);
  assert.deepEqual(workflow.choicesFor('navigation').map(({ option }) => option.id), ['nav-a', 'nav-g']);
  assert.equal(slot.options.length, 7, 'Grouping must not remove source records.');
  for (const variant of ['h', 'i', 'j', 'k', 'l']) {
    const state = createModel(catalog).defaultState();
    state.picks.header = `nav-${variant}`;
    state.workflow = workflow.normalizeProgress({ currentStep: 'review', confirmed: { navigation: `nav-${variant}`, hero: 'hero-a' } });
    const normalized = workflow.normalizeGuidedSelection(state);
    assert.equal(normalized.picks.header, 'nav-g');
    assert.equal(normalized.workflow.confirmed.navigation, undefined, 'A remapped choice needs customer confirmation.');
    assert.equal(normalized.workflow.confirmed.hero, 'hero-a', 'Other confirmations must survive.');
    assert.equal(workflow.completed(normalized.workflow, normalized, 'navigation'), false);
    assert.match(workflow.buildCustomerSummary(normalized), /1\. Navigation: Standard/);
    assert.equal(state.picks.header, `nav-${variant}`, 'Normalization must not mutate saved source state.');
  }
});

test('design grouping requires a review marker and never promotes an unchecked representative', () => {
  const catalog = fixture(), slot = catalog.slots[0];
  const design = { id: 'navigation-standard', label: 'Standard', representativeOptionId: 'nav-g', reviewedAt: '2026-10-25' };
  slot.options.push(passedOption('header', 'nav-g', { customerDesign: design }), passedOption('header', 'nav-h', { customerDesign: design }));
  slot.options[1].visualReview.status = 'needs-review';
  let workflow = createWorkflow(catalog);
  assert.deepEqual(workflow.choicesFor('navigation').map(({ option }) => option.id), ['nav-a', 'nav-h']);
  delete slot.options[2].customerDesign.reviewedAt;
  slot.options.push(passedOption('header', 'nav-i', { customerDesign: { id: design.id } }));
  workflow = createWorkflow(catalog);
  assert.deepEqual(workflow.choicesFor('navigation').map(({ option }) => option.id), ['nav-a', 'nav-h', 'nav-i'], 'Unreviewed equivalence must not deduplicate choices.');
});

test('repository navigation offers seven reviewed designs and retains twelve source records', async () => {
  const catalog = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'));
  const workflow = createWorkflow(catalog), slot = catalog.slots.find((entry) => entry.id === 'header');
  assert.equal(slot.options.length, 12);
  assert.equal(workflow.choicesFor('navigation').length, 7);
  assert.equal(GUIDE_STEPS.filter((step) => step.kind === 'section').reduce((total, step) => total + workflow.choicesFor(step.id).length, 0), 66);
  const grouped = slot.options.filter((option) => option.customerDesign?.id === 'navigation-standard');
  assert.equal(grouped.length, 6);
  assert.ok(grouped.every((option) => option.customerDesign.label === 'Standard' && option.customerDesign.representativeOptionId === 'header--variant-g-cut'));
});
