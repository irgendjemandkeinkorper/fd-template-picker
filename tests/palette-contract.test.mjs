import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { SCHEMA, SUPPORTED_SCHEMAS, createModel, buildExport, buildBuildBrief } from '../model.mjs';
import { createWorkflow, GUIDE_STEPS } from '../workflow.mjs';
import { COLOR_ROLES, DEFAULT_PALETTE_ROLES, normalizeHexColor, normalizePalette, paletteForState, paletteKey, assessPalette, NATIVE_COLOR_BINDINGS, paletteProceedStatus, CONTRAST_REVIEW_POLICY, CONTRAST_ACKNOWLEDGMENT } from '../colors.mjs';
import { typographyKey } from '../typography.mjs';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const catalogBytes = await readFile(new URL('../catalog.json', import.meta.url));
const catalog = JSON.parse(catalogBytes);
const indexBytes = await readFile(new URL('../data/build-modules.json', import.meta.url));
const moduleIndex = JSON.parse(indexBytes);
const context = { catalogSha256: hash(catalogBytes), moduleIndexSha256: hash(indexBytes), moduleIndex };
const model = createModel(catalog), workflow = createWorkflow(catalog);
function completedState() {
  const state = workflow.normalizeGuidedSelection(model.defaultState());
  const colors = { colorsKey: paletteKey(state.palette), colorsValid: assessPalette(state.palette).passes };
  for (const step of GUIDE_STEPS.filter(({ kind }) => kind !== 'review')) state.workflow = workflow.confirm(state.workflow, state, step.id, colors);
  state.workflow.currentStep = 'review'; return state;
}

test('palette exposes six core and seven advanced roles with honest native binding metadata', () => {
  assert.equal(COLOR_ROLES.filter(({ advanced }) => !advanced).length, 6);
  assert.equal(COLOR_ROLES.filter(({ advanced }) => advanced).length, 7);
  assert.equal(NATIVE_COLOR_BINDINGS.header.templateRole, 'header');
  assert.equal(NATIVE_COLOR_BINDINGS.accent.templateRole, 'accent');
  assert.equal(NATIVE_COLOR_BINDINGS.splashBackground.adminField, 'SplashBackground');
  assert.equal(NATIVE_COLOR_BINDINGS.seatAvailable.cssVariable, null, 'Do not invent unverified native CSS-variable names.');
  assert.match(normalizePalette().defaultsPolicy, /Suggested starter/);
});

test('contrast review allows 3–4.5 only with a palette-bound acknowledgment, never below 3', () => {
  const state = completedState();
  state.brandColors = { primary: '#FF0000', secondary: '#FFFFFF' };
  Object.assign(state.palette.roles, state.brandColors);
  const palette = paletteForState(state);
  const ack = { policy: CONTRAST_REVIEW_POLICY, paletteKey: paletteKey(palette), acknowledgedAt: '2026-10-26T12:00:00Z' };
  assert.equal(assessPalette(palette).passes, false);
  assert.equal(paletteProceedStatus(palette).canProceed, false);
  assert.equal(paletteProceedStatus(palette, ack).canProceed, true);
  state.colorAcknowledgment = ack;
  state.workflow.confirmed.colors = paletteKey(palette);
  const exported = buildBuildBrief(catalog, state, 'https://picker.test/', context);
  assert.equal(exported.buildContract.checklistComplete, true);
  assert.equal(exported.paletteAssessment.passes, false, 'Consent must not claim WCAG compliance.');
  assert.equal(exported.colorReview.status, 'acknowledged-for-review');
  assert.equal(exported.colorAcknowledgment.statement, CONTRAST_ACKNOWLEDGMENT);
  assert.equal(model.normalize(exported).workflow.confirmed.colors, `${paletteKey(palette)}|${typographyKey()}`);
  assert.match(workflow.buildCustomerSummary(model.normalize(exported)), /Contrast exception acknowledged/);
  const changed = structuredClone(exported); changed.palette.roles.accent = '#123456';
  assert.equal(model.normalize(changed).workflow.confirmed.colors, undefined);
  assert.equal(model.normalize(changed).colorAcknowledgment, null);
  palette.roles.primary = '#959595'; palette.roles.secondary = '#FFFFFF';
  ack.paletteKey = paletteKey(palette);
  assert.equal(paletteProceedStatus(palette, ack).canProceed, false);
  assert.equal(paletteProceedStatus(palette, ack).status, 'blocked');
  palette.roles.primary = '#949494'; ack.paletteKey = paletteKey(palette);
  assert.equal(paletteProceedStatus(palette, ack).canProceed, true);
  palette.roles.dark = palette.roles.background;
  ack.paletteKey = paletteKey(palette);
  assert.equal(paletteProceedStatus(palette, ack).canProceed, false, 'Body text below 3 cannot be waived.');
  for (const bad of [{ ...ack, acknowledgedAt: 'nonsense' }, { ...ack, policy: 'other' }]) assert.equal(paletteProceedStatus(normalizePalette(), bad).acknowledgment, null);
});

test('v1/v2 state and links preserve colors, styles and matching progress during palette migration', () => {
  assert.ok(SUPPORTED_SCHEMAS.has('fd-template-picker/v1'));
  assert.ok(SUPPORTED_SCHEMAS.has('fd-template-picker/v2'));
  const state = completedState();
  const legacy = buildExport(catalog, state, 'https://picker.test/');
  legacy.schema = 'fd-template-picker/v2'; delete legacy.palette;
  legacy.brandColors = { primary: '#000000', secondary: '#FFFFFF' };
  legacy.workflow.confirmed.colors = '#000000|#FFFFFF';
  const restored = workflow.normalizeGuidedSelection(model.normalize(legacy));
  assert.deepEqual(restored.brandColors, legacy.brandColors);
  assert.equal(restored.picks.food, state.picks.food);
  assert.equal(restored.workflow.confirmed.food, state.workflow.confirmed.food);
  assert.equal(restored.workflow.currentStep, 'review');
  assert.equal(restored.workflow.confirmed.colors, `${paletteKey(restored.palette)}|${typographyKey()}`);
  assert.equal(restored.palette.roles.dark, DEFAULT_PALETTE_ROLES.dark);
});

test('all thirteen palette values survive v3 links/export/import with requested Header and Accent kept independent', () => {
  const state = completedState();
  for (const { id } of COLOR_ROLES.filter(({ id }) => !['primary', 'secondary', 'dark', 'background'].includes(id))) state.palette.roles[id] = '#336699';
  state.workflow.confirmed.colors = paletteKey(state.palette);
  const data = buildExport(catalog, state, 'https://picker.test/');
  assert.equal(data.schema, SCHEMA);
  assert.equal(data.palette.roles.header, '#336699');
  assert.notEqual(data.palette.roles.header, data.palette.roles.dark);
  assert.deepEqual(model.normalize(data).palette, normalizePalette(state.palette));
  const link = { schema: SCHEMA, project: state.project, brandColors: state.brandColors, palette: state.palette, workflow: state.workflow, sections: data.sections.filter(({ included }) => included) };
  const restored = workflow.normalizeGuidedSelection(model.normalize(JSON.parse(JSON.stringify(link))));
  assert.equal(restored.workflow.confirmed.colors, `${paletteKey(state.palette)}|${typographyKey()}`);
  assert.deepEqual(restored.palette.roles, state.palette.roles);
});

test('any palette edit invalidates only color confirmation; invalid advanced values and unreadable body pair cannot pass', () => {
  const state = completedState(), originalFood = state.workflow.confirmed.food;
  state.palette.roles.warning = '#123456';
  const changed = model.normalize({ schema: SCHEMA, ...state });
  assert.equal(changed.workflow.confirmed.colors, undefined);
  assert.equal(changed.workflow.confirmed.food, originalFood);
  const palette = normalizePalette(); palette.roles.dark = palette.roles.background;
  assert.equal(assessPalette(palette).pairs[0].passes, true);
  assert.equal(assessPalette(palette).pairs[1].passes, false);
  assert.equal(assessPalette(palette).passes, false);
  palette.roles.dark = '#000000'; palette.roles.warning = 'invalid';
  assert.equal(assessPalette(palette).valid, false);
  assert.equal(assessPalette(palette).passes, false);
  assert.notEqual(paletteKey(palette), paletteKey(normalizePalette()));
});

test('in-progress invalid hex edits stay visible and block the application color-confirmation path for every role', () => {
  for (const { id } of COLOR_ROLES) for (const invalid of ['', '#12', 'invalid']) {
    const state = completedState();
    state.palette.roles[id] = invalid;
    if (['primary', 'secondary'].includes(id)) state.brandColors[id] = invalid;
    const visiblePalette = paletteForState(state);
    assert.equal(visiblePalette.roles[id], invalid, `${id}: do not replace entered text with a starter color`);
    assert.equal(normalizeHexColor(visiblePalette.roles[id]), null, `${id}: feedback must mark this field invalid`);
    const colorContext = { colorsKey: paletteKey(visiblePalette), colorsValid: assessPalette(visiblePalette).passes };
    assert.equal(colorContext.colorsValid, false, `${id}: Continue must stay disabled`);
    assert.equal(workflow.completed(state.workflow, state, 'colors', colorContext), false);
    assert.throws(() => workflow.confirm(state.workflow, state, 'colors', colorContext), /readable brand colors/);
    assert.equal(state.palette.roles[id], invalid, `${id}: validation must not mutate entered text`);
  }
});

test('build brief pins source evidence, rejects stale registries and never infers a destination or publish permission', () => {
  const state = completedState();
  const brief = buildBuildBrief(catalog, state, 'https://picker.test/', context, '2026-10-26T00:00:00Z');
  assert.equal(brief.buildContract.checklistComplete, true);
  assert.equal(brief.buildContract.destination, null);
  assert.equal(brief.buildContract.publicationPolicy, 'draft-only');
  assert.equal(brief.buildContract.sourceIdsAreDestinationIds, false);
  assert.equal(brief.buildContract.modules.length, 6);
  assert.deepEqual(brief.buildContract.componentOrder, ['navigation', 'hero', 'food', 'private-parties', 'membership', 'contact']);
  assert.ok(brief.sections.every(({ sourceIdsOnly }) => sourceIdsOnly));
  assert.ok(brief.buildContract.modules.every(({ artifacts }) => artifacts.every(({ sha256 }) => /^[a-f0-9]{64}$/.test(sha256))));
  state.workflow.confirmed.food = 'wrong-food';
  assert.equal(buildBuildBrief(catalog, state, 'https://picker.test/', context).buildContract.checklistComplete, false);
  assert.throws(() => buildBuildBrief(catalog, state, 'https://picker.test/', {}), /digests/);
  assert.throws(() => buildBuildBrief(catalog, state, 'https://picker.test/', { ...context, catalogSha256: '0'.repeat(64) }), /does not match/);
});

test('registered artifact hashes match local bytes and K has bounded Library and assembly readiness', async () => {
  assert.equal(moduleIndex.catalogSha256, hash(catalogBytes));
  const uniqueArtifacts = new Map(Object.values(moduleIndex.modules).flatMap(({ artifacts }) => artifacts).map((artifact) => [artifact.path, artifact]));
  for (const artifact of uniqueArtifacts.values()) assert.equal(hash(await readFile(new URL(`../${artifact.path}`, import.meta.url))), artifact.sha256, artifact.path);
  const state = model.defaultState('variant-k-clubhouse');
  const data = buildBuildBrief(catalog, state, 'https://picker.test/', context);
  const food = data.buildContract.modules.find(({ component }) => component === 'food');
  assert.equal(food.optionId, 'food--variant-k-clubhouse');
  assert.equal(food.installationMethod, 'native-concessions-menu-recreation-with-section-package');
  assert.equal(food.verification.libraryTransfer, 'verified-one-section-page-import-and-unlink');
  assert.match(food.verification.insertionIntoExistingPage, /^verified-native-recreation/);
  assert.equal(food.readiness, 'native-library-transfer-and-existing-page-recreation-verified-admin-scope', 'Do not silently change the existing readiness enum.');
  assert.equal(food.verification.consumerTheme, 'not-tested', 'Historical Admin-pilot flags remain historical evidence.');
  const live = food.liveIndependentCopyVerification;
  assert.equal(live.status, 'verified-current-palette-desktop-and-mobile-consumer');
  assert.equal(live.sourceReference.publishedSectionId, '25157');
  assert.equal(live.sourceReference.sourceIdsOnly, true);
  assert.equal(live.consumerChecks.desktop.columns, 3);
  assert.equal(live.consumerChecks.mobile.columns, 1);
  for (const mode of ['desktop', 'mobile']) {
    assert.equal(live.consumerChecks[mode].loadedPhotos, 7);
    assert.equal(live.consumerChecks[mode].rootOverflowPx, 0);
    assert.equal(live.consumerChecks[mode].documentOverflowPx, 0);
  }
  assert.equal(live.consumerChecks.mobile.viewport.width, 390);
  assert.equal(live.evidence.length, 6);
  assert.ok(live.knownIssues.some((issue) => /label can remain Drinks/.test(issue)));
  assert.ok(food.limitations.some((limit) => /arbitrary palette changes.*remain untested/.test(limit)));
  assert.ok(!food.limitations.some((limit) => /^Consumer Theme, real phone.*remain unverified/.test(limit)));
  assert.ok(food.limitations.some((value) => /Direct Library Section insertion.*unverified/.test(value)));
  assert.equal(data.sections.find(({ slot }) => slot === 'food').library.libraryPageId, '5971');
  assert.equal(data.palette.roles.primary, paletteForState(state).roles.primary);
});
