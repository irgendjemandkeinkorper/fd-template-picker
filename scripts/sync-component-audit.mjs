import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REQUIRED_COMPONENTS } from '../model.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const auditFile = resolve(process.argv[2] ?? join(root, '..', 'evidence', 'component-parity.json'));
const catalog = JSON.parse(await readFile(join(root, 'catalog.json'), 'utf8'));
const audit = JSON.parse(await readFile(auditFile, 'utf8'));
const entries = audit.componentAudit ?? audit.entries;
if (audit.schema !== 'fd-component-parity-audit/v1' || !Array.isArray(entries)) throw new Error('Unsupported component audit.');
if (audit.sourceSite?.url?.replace(/\/$/, '') !== catalog.source.replace(/\/$/, '')) throw new Error('The audit belongs to another source site.');
const allowed = new Set(REQUIRED_COMPONENTS.map((component) => component.id));
const variants = new Set(catalog.variants.map((variant) => variant.id));
const seen = new Set();
for (const entry of entries) {
  const key = `${entry.variant}/${entry.component}`;
  if (!variants.has(entry.variant) || !allowed.has(entry.component) || !['present', 'partial', 'missing'].includes(entry.status) || seen.has(key)) throw new Error(`Invalid component audit entry: ${key}`);
  seen.add(key);
  if (entry.sourceOptionId) {
    const option = catalog.slots.flatMap((slot) => slot.options).find((candidate) => candidate.id === entry.sourceOptionId);
    if (!option || !(option.sharedBy ?? [option.variant]).includes(entry.variant)) throw new Error(`Audited option is not in the catalog: ${entry.sourceOptionId}`);
    option.canonicalComponent = entry.component;
    option.componentStatus = entry.status;
    option.componentNote = entry.notes.join(' ');
    option.componentAuditedAt = audit.auditedAt;
  }
}
if (seen.size !== variants.size * allowed.size) throw new Error('The audit must cover every variant and required component.');
catalog.componentAudit = entries.map((entry) => ({
  variant: entry.variant, component: entry.component, status: entry.status,
  sourceOptionId: entry.sourceOptionId, sourceSectionIds: entry.sourceSectionIds,
  sourceUrl: entry.sourceUrl, auditedAt: audit.auditedAt, notes: entry.notes,
}));
catalog.componentAuditSource = { file: 'evidence/component-parity.json', auditedAt: audit.auditedAt, scope: audit.scope };
catalog.movieModulePolicy = {
  status: 'optional-pending-live-verification',
  note: 'Native movie widgets can support distinct layouts. Keep discovery and booking choices separate from the six required design components until implemented presets have populated desktop/mobile evidence. Empty states do not prove a unique layout.',
  research: 'docs/MOVIE-WIDGETS.md',
};
catalog.slots.find((slot) => slot.id === 'header').label = 'Navigation';
catalog.slots.find((slot) => slot.id === 'events').label = 'Private Parties';
catalog.slots.find((slot) => slot.id === 'food').label = 'Food & Drink';
catalog.slots.find((slot) => slot.id === 'contact').label = 'Contact Us';
for (const slot of catalog.slots) for (const option of slot.options) {
  if (slot.id === 'header' && /^variant-[g-l]-/.test(option.variant)) option.designNote = 'G–L currently share the same navigation design. These captures show source coverage, not six distinct navigation styles.';
  if (slot.id === 'hero' && /^variant-[j-l]-/.test(option.variant)) option.designNote = 'This is a basic page introduction. A deliberate hero-design pass is still needed to match the maturity of A–I.';
}
await mkdir(join(root, 'evidence'), { recursive: true });
if (auditFile !== join(root, 'evidence', 'component-parity.json')) await copyFile(auditFile, join(root, 'evidence', 'component-parity.json'));
await writeFile(join(root, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Applied ${seen.size} audited component records; no screenshots or source pages changed.`);
