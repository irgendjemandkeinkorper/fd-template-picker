import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DEMO_DESIGN_NAMES, designName } from '../names.mjs';
import { createModel, buildBuildBrief, buildHandoff } from '../model.mjs';
import { createWorkflow, GUIDE_STEPS } from '../workflow.mjs';
import { createTemplateHubModel } from '../hub.mjs';

const catalog = JSON.parse(await readFile(new URL('../catalog.json',import.meta.url),'utf8'));
const hub = JSON.parse(await readFile(new URL('../data/template-hub.json',import.meta.url),'utf8'));
const names = ['Showcase','Reel','Neon','Cameo','Metropolis','Encore','Splice','Prologue','Pause'];

test('all customer choices and Hub labels use the approved names', () => {
  const workflow = createWorkflow(catalog);
  assert.deepEqual(Object.values(DEMO_DESIGN_NAMES),names);
  for (const step of GUIDE_STEPS.filter(step => step.kind === 'section')) {
    for (const {option} of workflow.choicesFor(step.id)) {
      assert.ok(designName(option,catalog).split(' / ').every(name => names.includes(name)));
    }
  }
  assert.deepEqual(createTemplateHubModel(catalog,hub).templates.map(t => t.currentLabel),names);
  const staleHub = structuredClone(hub); staleHub.templates[0].displayName = 'Circuit';
  assert.throws(() => createTemplateHubModel(catalog,staleHub),/approved cinema design name/);
});

test('stale historical labels cannot leak into the summary or build brief human labels', () => {
  const stale = structuredClone(catalog);
  for (const slot of stale.slots) for (const option of slot.options) {
    if (!DEMO_DESIGN_NAMES[option.variant]) continue;
    option.variantLabel = `Variant ${option.variant}`;
    option.name = 'Legacy native section title';
    if (option.customerDesign) option.customerDesign.label = 'Legacy shared Variant navigation';
  }
  const workflow = createWorkflow(stale), model = createModel(stale), hash = 'a'.repeat(64);
  for (const [variant,name] of Object.entries(DEMO_DESIGN_NAMES)) {
    const state = workflow.normalizeGuidedSelection(model.defaultState(variant));
    const summary = workflow.buildCustomerSummary(state);
    assert.doesNotMatch(summary,/Variant|Legacy/);
    assert.ok(summary.includes(name));
    const brief = buildBuildBrief(stale,state,'https://example.test/picker/',{
      catalogSha256:hash,moduleIndexSha256:hash,moduleIndex:{schema:'fd-picker-module-index/v1',catalogSha256:hash,modules:{}}
    });
    for (const section of brief.sections.filter(section => section.included)) {
      assert.equal(section.variantLabel,DEMO_DESIGN_NAMES[section.variant]);
      assert.equal(section.displayName,`${section.variantLabel} — ${section.slotLabel}`);
      const original = stale.slots.find(slot => slot.id === section.slot).options.find(option => option.id === section.optionId);
      assert.equal(section.sourceName,original.sourceName ?? original.name);
      assert.equal(section.sourcePageTitle,original.sourcePageTitle ?? original.variant);
      assert.equal(section.sourceReference.url,original.sourceUrl);
    }
    const handoffHeadings = buildHandoff(brief).split('\n').filter(line => /^## \d/.test(line));
    assert.ok(handoffHeadings.every(line => names.some(expected => line.endsWith(`— ${expected}`))));
  }
});

test('shared navigation name is derived without changing group or selection IDs', () => {
  const option = catalog.slots.find(slot => slot.id === 'header').options.find(option => option.variant === 'variant-g-cut');
  const before = JSON.stringify(catalog);
  assert.equal(designName(option,catalog),'Splice / Prologue / Pause');
  assert.equal(designName({...option,variantLabel:'G · Cut'},catalog,{grouped:false}),'Splice');
  assert.equal(JSON.stringify(catalog),before);
});
