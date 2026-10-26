// Generate recapture identities from the same reviewed choices customers see.
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWorkflow } from '../workflow.mjs';
import { componentForOption, REQUIRED_COMPONENTS } from '../model.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const raw = await readFile(resolve(root, 'catalog.json'));
const catalog = JSON.parse(raw);
const workflow = createWorkflow(catalog);
const choices = REQUIRED_COMPONENTS.flatMap(({ id, label }) => workflow.choicesFor(id).map(({ slotId, option }) => ({
  optionId: option.id, slot: slotId, component: id, componentLabel: label,
  customerLabel: option.customerDesign?.label ?? option.variantLabel,
  variant: option.variant, sourceUrl: option.sourceUrl, pageId: String(option.pageId),
  sectionIds: (option.sectionIds ?? []).map(String),
  destination: option.image,
  previousSelectors: option.capture?.selectors ?? [],
  previousBoundsHintOnly: option.capture?.sourceBounds ?? null,
  groupedSources: option.customerDesign?.id ? catalog.slots.flatMap(slot => slot.options)
    .filter(candidate => candidate.customerDesign?.id === option.customerDesign.id && candidate.id !== option.id)
    .map(candidate => candidate.id) : [],
  captureRequirement: 'Fresh published DOM identity and bounds; native JPEG element clip; no temporary CSS, fixtures or pixel edits.',
})));
const selected = new Set(choices.map(choice => choice.optionId));
const omittedCore = catalog.slots.flatMap(slot => slot.options
  .filter(option => REQUIRED_COMPONENTS.some(component => component.id === componentForOption(slot, option)) && !selected.has(option.id))
  .map(option => ({ optionId: option.id, variant: option.variant, slot: slot.id,
    reason: option.customerDesign?.representativeOptionId && option.id !== option.customerDesign.representativeOptionId
      ? 'Reviewed duplicate Standard navigation; optional source-evidence refresh.'
      : 'Not currently an eligible customer choice; inspect source separately before adding a new choice.',
    captureStatus: option.captureStatus, representativeOptionId: option.customerDesign?.representativeOptionId ?? null })));
const plan = {
  schemaVersion: 1, generatedAt: new Date().toISOString(),
  target: ['US-BETA', 'INDY Demo', 'Adam Template Testing 2'],
  sourceCatalogSha256: createHash('sha256').update(raw).digest('hex'),
  sourceCatalogOptionCount: catalog.slots.reduce((count, slot) => count + slot.options.length, 0),
  minimumNativeClipCount: choices.length,
  componentCounts: Object.fromEntries(REQUIRED_COMPONENTS.map(({ id }) => [id, choices.filter(choice => choice.component === id).length])),
  required: choices,
  omittedCore,
  notes: [
    'Old IDs and rectangles are identity hints only. Publishing may change section IDs, and Admin color/caption changes can change height. Re-read actual published DOM and clipping bounds.',
    'Capture the restored current palette only after saved/published source verification; keep second-palette and mobile QA images separate from desktop picker assets.',
    'For each horizontal header scroll to document top, retain actual links and account/search controls. Concrete is a fixed sidebar: capture its complete actual header rectangle, not a top-strip guess.',
    'Native image clips are byte-copied. Do not resize, recolor, stitch, render labels, inject fixture data or temporarily change styles to improve a screenshot.',
    'Every image needs a dated visual review bound to its exact SHA-256. Source identity changes need explicit sourceIdentityVerified in that review.',
    'The Standard representative remains G. H-L source navigation clips are optional evidence and must not create additional customer choices.',
  ],
};
const output = process.argv.find(arg => arg.startsWith('--output='))?.slice('--output='.length);
if (process.argv.slice(2).some(arg => !arg.startsWith('--output='))) throw new Error('Usage: node scripts/plan-admin-controls-captures.mjs [--output=plan.json]');
if (output) {
  await mkdir(dirname(resolve(output)), { recursive: true });
  await writeFile(resolve(output), `${JSON.stringify(plan, null, 2)}\n`);
  console.log(`Prepared ${choices.length} native customer clips: ${JSON.stringify(plan.componentCounts)}. No images or catalog entries changed.`);
} else console.log(JSON.stringify(plan, null, 2));
