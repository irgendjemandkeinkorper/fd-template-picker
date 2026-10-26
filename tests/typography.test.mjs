import test from 'node:test';
import assert from 'node:assert/strict';
import { FONT_OPTIONS, TYPOGRAPHY_ROLES, DEFAULT_TYPOGRAPHY_ROLES, normalizeTypography, typographyKey, typographyForState, TYPE_NOTE } from '../typography.mjs';
import { createModel, buildExport, buildBuildBrief, buildHandoff, visualCaptureKey } from '../model.mjs';
import { createWorkflow, GUIDE_STEPS } from '../workflow.mjs';
import { paletteForState, paletteKey, paletteProceedStatus, CONTRAST_REVIEW_POLICY } from '../colors.mjs';

function fixture() {
  return { variants: [{ id: 'a', label: 'A' }], slots: ['header', 'hero', 'food', 'events', 'membership', 'contact'].map((id) => {
    const option = { id: `${id}-a`, variant: 'a', name: id, variantLabel: 'A', sourceUrl: 'https://source.test/a/',
      components: [id], image: `${id}.jpg`, width: 1440, height: 500, captureStatus: 'captured-live', capture: { mode: 'live' },
      ...(id === 'events' ? { canonicalComponent: 'private-parties' } : {}) };
    option.visualReview = { status: 'passed', captureKey: visualCaptureKey(option) };
    return { id, label: id, options: [option] };
  }) };
}
const context = { catalogSha256: 'a'.repeat(64), moduleIndexSha256: 'b'.repeat(64), moduleIndex: { schema: 'fd-picker-module-index/v1', catalogSha256: 'a'.repeat(64), modules: {} } };
const colorContext = (state) => ({ colorsKey: paletteKey(paletteForState(state)), colorsValid: paletteProceedStatus(paletteForState(state), state.colorAcknowledgment).canProceed });
function complete(catalog, state) {
  const workflow = createWorkflow(catalog);
  for (const { id, kind } of GUIDE_STEPS) if (kind !== 'review') state.workflow = workflow.confirm(state.workflow, state, id, colorContext(state));
  state.workflow.currentStep = 'review';
  return state;
}

test('font controls expose only seven web-safe families and three fixed roles', () => {
  assert.deepEqual(FONT_OPTIONS.map(({ id }) => id), ['arial', 'verdana', 'tahoma', 'trebuchet-ms', 'georgia', 'times-new-roman', 'courier-new']);
  assert.deepEqual(TYPOGRAPHY_ROLES.map(({ id }) => id), ['headings', 'body', 'interface']);
  assert.deepEqual(DEFAULT_TYPOGRAPHY_ROLES, { headings: 'georgia', body: 'arial', interface: 'arial' });
  assert.ok(FONT_OPTIONS.every(({ label, stack }) => label && stack && !/https?:|url\(|@import|template default/i.test(stack)));
  assert.equal(GUIDE_STEPS[0].id, 'colors');
  assert.equal(GUIDE_STEPS[0].label, 'Colors & fonts');
});

test('normalization repairs external, custom and malformed fonts without retaining arbitrary properties', () => {
  const fallback = normalizeTypography();
  for (const value of [null, [], 'Georgia', { schema: 'other', roles: { body: 'verdana' } }, { roles: [] }]) assert.deepEqual(normalizeTypography(value), fallback);
  const typography = normalizeTypography({ schema: 'fd-typography/v1', roles: { headings: 'url(https://evil.test/font.woff)', body: 'Comic Sans MS', interface: 'tahoma', extra: 'arial' }, stack: 'custom' });
  assert.deepEqual(typography, { schema: 'fd-typography/v1', roles: { headings: 'georgia', body: 'arial', interface: 'tahoma' } });
  for (const { id } of FONT_OPTIONS) for (const { id: role } of TYPOGRAPHY_ROLES) {
    assert.equal(normalizeTypography({ roles: { [role]: id } }).roles[role], id);
  }
  const first = normalizeTypography(), second = normalizeTypography(); first.roles.body = 'verdana';
  assert.equal(second.roles.body, 'arial');
});

test('typography survives JSON share links, exported sections and saved-state restoration', () => {
  const catalog = fixture(), model = createModel(catalog), state = complete(catalog, model.defaultState());
  state.typography.roles = { headings: 'times-new-roman', body: 'verdana', interface: 'trebuchet-ms' };
  complete(catalog, state);
  state.project = 'Ciné Palace'; state.slotNotes.food = 'Use our menu';
  const shared = JSON.parse(Buffer.from(Buffer.from(JSON.stringify({ schema: 'fd-template-picker/v3', ...state }), 'utf8').toString('base64'), 'base64').toString('utf8'));
  const restored = model.normalize(shared);
  assert.deepEqual(restored, state);
  assert.deepEqual(model.normalize(buildExport(catalog, state, 'https://picker.test/')), state);
  assert.deepEqual(typographyForState(restored), state.typography);
  assert.match(typographyKey(restored.typography), /headings:times-new-roman\|body:verdana\|interface:trebuchet-ms$/);
});

test('older selections migrate to explicit safe defaults while preserving matching colors and section confirmations', () => {
  const catalog = fixture(), model = createModel(catalog), state = complete(catalog, model.defaultState());
  const legacy = { ...state, schema: 'fd-template-picker/v2', workflow: { ...state.workflow, confirmed: { ...state.workflow.confirmed, colors: paletteKey(paletteForState(state)) } } };
  delete legacy.typography;
  const restored = model.normalize(legacy);
  assert.deepEqual(restored.typography, normalizeTypography());
  assert.deepEqual(restored.picks, state.picks);
  assert.deepEqual(restored.palette, state.palette);
  assert.equal(restored.workflow.confirmed.food, state.workflow.confirmed.food);
  assert.equal(restored.workflow.confirmed.colors, `${paletteKey(restored.palette)}|${typographyKey()}`);
  assert.equal(createWorkflow(catalog).completed(restored.workflow, restored, 'review', colorContext(restored)), true);
});

test('a changed allowed font invalidates branding only and preserves palette-bound contrast acknowledgment', () => {
  const catalog = fixture(), model = createModel(catalog), workflow = createWorkflow(catalog), state = model.defaultState();
  state.brandColors = { primary: '#FF0000', secondary: '#FFFFFF' }; Object.assign(state.palette.roles, state.brandColors);
  state.colorAcknowledgment = { policy: CONTRAST_REVIEW_POLICY, paletteKey: paletteKey(state.palette), acknowledgedAt: '2026-10-26T12:00:00Z' };
  complete(catalog, state);
  assert.equal(buildBuildBrief(catalog, state, 'https://picker.test/', context).buildContract.checklistComplete, true);
  const priorFood = state.workflow.confirmed.food, priorAcknowledgment = model.normalize(state).colorAcknowledgment;
  state.typography.roles.interface = 'tahoma';
  assert.equal(workflow.completed(state.workflow, state, 'colors', colorContext(state)), false);
  assert.equal(workflow.firstIncomplete(state.workflow, state, colorContext(state)), 'colors');
  const restored = model.normalize({ schema: 'fd-template-picker/v3', ...state });
  assert.equal(restored.workflow.confirmed.colors, undefined);
  assert.equal(restored.workflow.confirmed.food, priorFood);
  assert.deepEqual(restored.colorAcknowledgment, priorAcknowledgment);
  assert.equal(buildBuildBrief(catalog, restored, 'https://picker.test/', context).buildContract.checklistComplete, false);
  restored.workflow = workflow.confirm(restored.workflow, restored, 'colors', colorContext(restored));
  assert.equal(buildBuildBrief(catalog, restored, 'https://picker.test/', context).buildContract.checklistComplete, true);
});

test('malformed supplied typography repairs safely but cannot inherit either legacy or current branding confirmation', () => {
  const catalog = fixture(), model = createModel(catalog), state = complete(catalog, model.defaultState());
  const cases = [null, [], {}, { schema: 'unknown', roles: { ...DEFAULT_TYPOGRAPHY_ROLES } },
    { schema: 'fd-typography/v1', roles: { ...DEFAULT_TYPOGRAPHY_ROLES, body: 'external-font' } },
    { schema: 'fd-typography/v1', roles: { ...DEFAULT_TYPOGRAPHY_ROLES, custom: 'arial' } }];
  for (const typography of cases) for (const key of [state.workflow.confirmed.colors, paletteKey(state.palette)]) {
    const restored = model.normalize({ ...state, typography, workflow: { ...state.workflow, confirmed: { ...state.workflow.confirmed, colors: key } } });
    assert.equal(restored.workflow.confirmed.colors, undefined);
    assert.equal(restored.workflow.confirmed.hero, state.workflow.confirmed.hero);
    assert.deepEqual(restored.typography, normalizeTypography());
  }
});

test('brief, support handoff and customer summary carry selected families, CSS stacks and role meanings', () => {
  const catalog = fixture(), model = createModel(catalog), state = model.defaultState();
  state.typography.roles = { headings: 'courier-new', body: 'tahoma', interface: 'verdana' }; complete(catalog, state);
  const brief = buildBuildBrief(catalog, state, 'https://picker.test/', context, '2026-10-26T12:00:00Z');
  assert.deepEqual(brief.typography, state.typography);
  assert.deepEqual(brief.typographyBindings.interface, { fontId: 'verdana', family: 'Verdana', stack: 'Verdana, Geneva, sans-serif', appliesTo: 'Buttons, navigation links and interface labels.' });
  assert.equal(brief.typographyBindings.headings.family, 'Courier New');
  assert.equal(brief.typographyBindings.body.family, 'Tahoma');
  assert.equal(brief.buildContract.typographyBindingNote, TYPE_NOTE);
  assert.match(brief.buildContract.typographyApplicationPolicy, /native font controls/);
  assert.equal(brief.buildContract.publicationPolicy, 'draft-only');
  const handoff = buildHandoff(brief), summary = createWorkflow(catalog).buildCustomerSummary(state);
  assert.match(handoff, /Headings: Courier New; CSS stack: "Courier New", Courier, monospace/);
  assert.match(handoff, /Buttons & navigation: Verdana/);
  assert.match(summary, /Body text: Tahoma/);
  assert.ok(handoff.includes(TYPE_NOTE) && summary.includes(TYPE_NOTE));
});
