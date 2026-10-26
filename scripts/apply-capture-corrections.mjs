// Apply reviewed corrections to individual existing choices. A partial capture
// observation must never remove the other choices belonging to that variant.
import { createHash } from 'node:crypto';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { visualCaptureKey } from '../model.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sameIds = (a, b) => JSON.stringify((a ?? []).map(String).sort()) === JSON.stringify((b ?? []).map(String).sort());
const validStatuses = new Set(['passed', 'needs-review', 'rejected']);

export async function applyCaptureCorrections(catalog, observations, declarations, { readImage } = {}) {
  const updated = structuredClone(catalog);
  const choices = new Map(updated.slots.flatMap((slot) => slot.options.map((option) => [option.id, { slot, option }])));
  const corrected = observations.flatMap((observation) => observation.options ?? []);
  if (!corrected.length) throw new Error('No individual capture corrections supplied.');
  const reviews = declarations.reviews ?? [];
  const reviewed = new Map();
  for (const review of reviews) {
    if (!review.optionId || reviewed.has(review.optionId)) throw new Error(`Duplicate or missing review option ID: ${review.optionId}`);
    reviewed.set(review.optionId, review);
  }
  const ids = new Set();
  const readPixels = readImage ?? (async (image) => {
    const path = resolve(root, image);
    if (!path.startsWith(join(root, 'screenshots') + sep)) throw new Error('Correction images must be inside this repository screenshots folder.');
    return readFile(path);
  });
  for (const observation of corrected) {
    if (ids.has(observation.id)) throw new Error(`Duplicate corrected option: ${observation.id}`);
    ids.add(observation.id);
    const match = choices.get(observation.id);
    if (!match) throw new Error(`Correction refers to an unknown existing option: ${observation.id}`);
    const { slot, option } = match;
    if (observation.variant !== option.variant || observation.slot !== slot.id || observation.sourceUrl !== option.sourceUrl
      || String(observation.pageId) !== String(option.pageId)) throw new Error(`Source identity mismatch: ${observation.id}`);
    const review = reviewed.get(observation.id);
    if (!review || !validStatuses.has(review.status) || !review.notes || !(review.reviewedAt ?? declarations.reviewedAt)
      || !(review.evidence ?? declarations.evidence)) throw new Error(`An explicit dated visual review with notes and evidence is required: ${observation.id}`);
    if (!sameIds(option.sectionIds, observation.sectionIds) && review.sourceIdentityVerified !== true) {
      throw new Error(`Published source IDs changed; explicitly verify sourceIdentityVerified before applying: ${observation.id}`);
    }
    if (!observation.image || !(observation.width > 0) || !(observation.height > 0) || !observation.capturedAt
      || !observation.sourceBounds || !observation.captureBounds || !observation.captureMethod) throw new Error(`Incomplete capture correction: ${observation.id}`);
    const imageSha256 = createHash('sha256').update(await readPixels(observation.image)).digest('hex');
    if (review.imageSha256 !== imageSha256) throw new Error(`Reviewed image hash differs from current pixels: ${observation.id}`);
    if (review.status === 'passed' && (observation.captureStatus !== 'captured-live' || observation.appearanceAltered !== false
      || observation.sampleDataInjected !== false || observation.missingDocumentY?.length)) throw new Error(`An altered, partial or incomplete capture cannot pass: ${observation.id}`);

    // Keep every semantic, CMS-name, draft-ID, alias, dependency, presentation
    // and Library field. Only the declared existing option's capture changes.
    Object.assign(option, {
      image: observation.image, width: observation.width, height: observation.height,
      captureStatus: observation.captureStatus, sectionIds: (observation.sectionIds ?? []).map(String),
      sourceUrl: observation.sourceUrl, pageId: observation.pageId,
      capture: {
        ...option.capture,
        mode: observation.captureStatus === 'partial' ? 'partial' : 'live',
        capturedAt: observation.capturedAt, method: observation.captureMethod,
        selectors: (observation.sectionSelectors ?? []).map((entry) => entry.selector).filter(Boolean),
        sourceBounds: observation.sourceBounds, captureBounds: observation.captureBounds,
        evidence: observation.captureEvidence ?? [], missingDocumentY: observation.missingDocumentY ?? [],
        excludedDocumentY: observation.excludedDocumentY ?? [],
        appearanceAltered: observation.appearanceAltered, sampleDataInjected: observation.sampleDataInjected,
        notes: ['Actual published appearance; no data fixtures or CSS repairs.', ...(observation.captureNote ? [observation.captureNote] : [])],
      },
    });
    option.visualReview = {
      status: review.status, reviewedAt: review.reviewedAt ?? declarations.reviewedAt,
      captureKey: visualCaptureKey(option), imageSha256,
      method: review.method ?? declarations.method ?? 'local-image-pixel-and-label-review',
      notes: review.notes, issues: review.issues ?? [], evidence: review.evidence ?? declarations.evidence,
    };
  }
  if (reviews.length !== ids.size || reviews.some((review) => !ids.has(review.optionId))) throw new Error('Visual review declarations must match exactly the corrected option IDs.');
  return updated;
}

async function main() {
  const args = process.argv.slice(2);
  const reviewFile = args.find((arg) => arg.startsWith('--reviews='))?.slice('--reviews='.length);
  const files = args.filter((arg) => !arg.startsWith('--'));
  if (!reviewFile || !files.length || args.some((arg) => arg.startsWith('--') && !arg.startsWith('--reviews='))) {
    throw new Error('Usage: node scripts/apply-capture-corrections.mjs --reviews=review-declarations.json corrected-options.json [more-options.json]');
  }
  const catalogFile = join(root, 'catalog.json');
  const [catalog, declarations, ...observations] = await Promise.all([catalogFile, resolve(reviewFile), ...files.map((file) => resolve(file))]
    .map(async (path) => JSON.parse(await readFile(path, 'utf8'))));
  const updated = await applyCaptureCorrections(catalog, observations, declarations);
  const temp = `${catalogFile}.corrections.tmp`;
  await writeFile(temp, `${JSON.stringify(updated, null, 2)}\n`);
  await rename(temp, catalogFile);
  console.log(`Updated ${observations.reduce((count, observation) => count + observation.options.length, 0)} existing choices; other catalog entries preserved.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
