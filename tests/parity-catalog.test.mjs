import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildCoverage, buildSelectionCoverage, componentForOption, createModel } from '../model.mjs';

const load = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));

test('every A-L preset represents all six required source components', async () => {
  const catalog = await load('catalog.json');
  const coverage = buildCoverage(catalog);
  assert.equal(catalog.variants.length, 12);
  assert.equal(coverage.total, 72);
  assert.equal(coverage.sourcePresent, 72);
  const model = createModel(catalog);
  for (const variant of catalog.variants) {
    const selected = buildSelectionCoverage(catalog, model.defaultState(variant.id));
    assert.equal(selected.sourcePresent, 6, variant.id);
    assert.ok(selected.components.every((component) => component.variant === variant.id), `A different variant was substituted into ${variant.id}`);
  }
});

test('repaired choices retain actual published/draft identities and B public programme remains optional', async () => {
  const catalog = await load('evidence/demo-refresh/legacy-catalog.json');
  const journal = await load('evidence/indy-parity-changes.json');
  assert.equal(journal.changes.length, 16);
  const choices = catalog.slots.flatMap((slot) => slot.options.map((option) => ({ slot, option })));
  for (const change of journal.changes) {
    const matches = choices.filter(({ slot, option }) => option.variant === change.variant && componentForOption(slot, option) === change.component);
    assert.equal(matches.length, 1, `${change.variant}/${change.component}`);
    const { option } = matches[0];
    assert.deepEqual(option.sectionIds, [String(change.publishedSectionId)]);
    assert.deepEqual(option.draftSectionIds, [String(change.draftSectionId)]);
    assert.equal(String(option.pageId), String(change.publishedPageId));
    assert.equal(String(option.draftId), String(change.draftPageId));
    assert.equal(option.nativeWidgetType, change.nativeWidgetType ?? change.type);
  }
  const playbill = choices.find(({ option }) => option.variant === 'variant-b-rep' && option.sectionIds.includes('23726'));
  assert.equal(playbill.slot.id, 'programme');
  assert.equal(componentForOption(playbill.slot, playbill.option), null);
  const privateParty = choices.find(({ slot, option }) => slot.id === 'events' && option.variant === 'variant-b-rep');
  assert.deepEqual(privateParty.option.sectionIds, ['25134']);
  assert.ok(choices.filter(({ option }) => option.captureStatus === 'not-rendered').every(({ slot, option }) => componentForOption(slot, option) === null));
});

test('current demo choices point to the exact live Site/Page/Section behind each refreshed capture', async () => {
  const catalog = await load('catalog.json'), captures = await load('evidence/demo-refresh/desktop-captures.json');
  for (const record of captures) for (const region of record.componentRegions) {
    const option = catalog.slots.find(s => s.id === region.slot).options.find(o => o.variant === record.slug);
    assert.equal(option.sourceSite.siteId, record.id);
    if (option.standaloneSource) {
      const map = await load(option.standaloneSource.map);
      const page = map.pages[option.standaloneSource.pageRole];
      const refreshed = (await load(option.standaloneSource.captures)).captures.find(capture => capture.slot === region.slot);
      assert.equal(map.siteId, record.id);
      assert.equal(option.sourceUrl, page.url);
      assert.equal(option.pageId, String(page.publishedPageId));
      assert.deepEqual(option.sectionIds, refreshed.sectionIds.map(String));
      assert.equal(option.image, refreshed.image);
      assert.ok(option.preStandaloneSourceReference);
      assert.ok(option.legacySourceReference);
      assert.equal(option.capture.appearanceAltered, false);
      assert.equal(option.capture.sampleDataInjected, false);
      continue;
    }
    assert.equal(option.sourceUrl, record.url);
    assert.equal(option.pageId, record.mainClass.match(/-(\d+)$/)[1]);
    assert.deepEqual(option.sectionIds, region.slot === 'header' ? [] : [region.className.match(/section-[a-z0-9-]+-(\d+)/)[1]]);
    assert.ok(option.legacySourceReference);
    assert.equal(option.image, region.image);
    assert.equal(option.capture.appearanceAltered, false);
    assert.equal(option.capture.sampleDataInjected, false);
  }
});
