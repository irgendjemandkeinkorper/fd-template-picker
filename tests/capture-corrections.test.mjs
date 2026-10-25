import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { applyCaptureCorrections } from '../scripts/apply-capture-corrections.mjs';
import { visualCaptureKey } from '../model.mjs';

const pixels = Buffer.from('reviewed screenshot bytes');
const hash = createHash('sha256').update(pixels).digest('hex');
const source = 'https://example.test/variant/';
const option = { id: 'food--v', variant: 'v', name: 'Reviewed picker label', sourceName: 'Original CMS name', displayName: 'Reviewed picker label',
  sourceAliasNote: 'CMS alias retained', components: ['Original CMS name'], canonicalComponent: 'food', componentStatus: 'present',
  componentNote: 'Explicit source purpose', draftSectionIds: ['10'], draftId: '20', nativeWidgetType: 'Concessions Menu',
  designNote: 'Design caveat', library: { status: 'not-created' }, dependencies: ['Website inventory'], dependenciesStatus: 'verified',
  sourceUrl: source, pageId: '1', sectionIds: ['2'], image: 'screenshots/food/v.jpg', width: 100, height: 100,
  capture: { mode: 'live', capturedAt: 'old-date' } };
const fixture = () => ({ variants: [{ id: 'v', sectionOrder: ['food', 'contact'] }], componentAudit: [{ variant: 'v', component: 'food', status: 'present' }],
  slots: [{ id: 'food', options: [structuredClone(option)] }, { id: 'contact', options: [{ id: 'contact--v', variant: 'v', name: 'Keep me', capture: { capturedAt: 'old-date' } }] }] });
const observation = () => ({ id: 'food--v', slot: 'food', variant: 'v', name: 'Raw source capture name', sourceUrl: source, pageId: 1, sectionIds: ['2'],
  image: 'screenshots/food/v.jpg', width: 100, height: 120, capturedAt: '2026-10-25T15:00:00Z', captureMethod: 'live-browser-section-clips',
  sourceBounds: { x: 0, y: 20, width: 100, height: 120 }, captureBounds: { x: 0, y: 20, width: 100, height: 120 },
  captureEvidence: [{ image: 'source.jpg', sourceDocumentY: [20, 140] }], sectionSelectors: [{ selector: '.section-food-2' }],
  captureStatus: 'captured-live', appearanceAltered: false, sampleDataInjected: false, missingDocumentY: [] });
const declarations = () => ({ reviewedAt: '2026-10-25', evidence: 'independent-review.md', reviews: [{ optionId: 'food--v', status: 'passed',
  imageSha256: hash, notes: 'Actual food heading and all products visible.' }] });
const readImage = async () => pixels;

test('an individual correction preserves every semantic field and all unrelated entries', async () => {
  const catalog = fixture();
  const before = structuredClone(catalog);
  const result = await applyCaptureCorrections(catalog, [{ options: [observation()] }], declarations(), { readImage });
  assert.deepEqual(catalog, before, 'Caller data is not partially mutated on failure.');
  assert.deepEqual(result.slots[1], before.slots[1]);
  assert.deepEqual(result.variants, before.variants);
  assert.deepEqual(result.componentAudit, before.componentAudit);
  const corrected = result.slots[0].options[0];
  for (const key of ['name', 'sourceName', 'displayName', 'sourceAliasNote', 'components', 'canonicalComponent', 'componentStatus', 'componentNote',
    'draftSectionIds', 'draftId', 'nativeWidgetType', 'designNote', 'library', 'dependencies', 'dependenciesStatus']) assert.deepEqual(corrected[key], before.slots[0].options[0][key], key);
  assert.equal(corrected.height, 120);
  assert.equal(corrected.visualReview.captureKey, visualCaptureKey(corrected));
  assert.equal(corrected.visualReview.imageSha256, hash);
  assert.equal(corrected.visualReview.status, 'passed');
});

test('a new capture cannot automatically receive a passed review or a mismatched image hash', async () => {
  await assert.rejects(applyCaptureCorrections(fixture(), [{ options: [observation()] }], { reviews: [] }, { readImage }), /explicit dated visual review/);
  const reviews = declarations(); reviews.reviews[0].imageSha256 = 'wrong';
  await assert.rejects(applyCaptureCorrections(fixture(), [{ options: [observation()] }], reviews, { readImage }), /hash differs/);
});

test('partial captures cannot pass and declared review-needed state stays explicit', async () => {
  const partial = { ...observation(), captureStatus: 'partial', missingDocumentY: [[50, 60]] };
  await assert.rejects(applyCaptureCorrections(fixture(), [{ options: [partial] }], declarations(), { readImage }), /cannot pass/);
  const reviews = declarations(); reviews.reviews[0].status = 'needs-review';
  const result = await applyCaptureCorrections(fixture(), [{ options: [partial] }], reviews, { readImage });
  assert.equal(result.slots[0].options[0].visualReview.status, 'needs-review');
  assert.equal(result.slots[0].options[0].capture.mode, 'partial');
});

test('unknown, duplicate, different-site and changed-source corrections fail without mutating the catalog', async () => {
  for (const [changes, pattern] of [
    [[{ ...observation(), id: 'unknown' }], /unknown existing option/],
    [[observation(), observation()], /Duplicate corrected option/],
    [[{ ...observation(), sourceUrl: 'https://another-site.test/' }], /Source identity mismatch/],
    [[{ ...observation(), sectionIds: ['999'] }], /Published source IDs changed/],
  ]) {
    const catalog = fixture(), before = structuredClone(catalog);
    await assert.rejects(applyCaptureCorrections(catalog, [{ options: changes }], declarations(), { readImage }), pattern);
    assert.deepEqual(catalog, before);
  }
});
