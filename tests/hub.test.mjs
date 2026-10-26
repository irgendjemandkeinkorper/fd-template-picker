import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createTemplateHubModel, renderTemplateHub } from '../hub.mjs';

const catalog = JSON.parse(fs.readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'));
const data = JSON.parse(fs.readFileSync(new URL('../data/template-hub.json', import.meta.url), 'utf8'));

class TestNode {
  constructor(tag) { this.tag = tag; this.children = []; this.attributes = {}; this.ownText = ''; }
  set textContent(value) { this.ownText = String(value); }
  get textContent() { return [this.ownText, ...this.children.map(child => child.textContent)].join(' '); }
  append(...nodes) { this.children.push(...nodes); }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener() {}
}
const document = { createElement: tag => new TestNode(tag) };
const descendants = node => [node, ...node.children.flatMap(descendants)];

test('Hub preserves the approved A–I mapping and reviewed catalog sources without mutating inputs', () => {
  const snapshot = JSON.stringify({ catalog, data });
  const model = createTemplateHubModel(catalog, data);
  assert.deepEqual(model.templates.map(template => template.id), catalog.variants.slice(0, 9).map(variant => variant.id));
  assert.deepEqual(model.templates.map(template => template.displayName), [
    'Showcase', 'Reel', 'Neon', 'Cameo', 'Metropolis', 'Encore', 'Splice', 'Prologue', 'Pause',
  ]);
  for (const template of model.templates) {
    assert.equal(template.sourceUrl, catalog.variants.find(variant => variant.id === template.id).sourceUrl);
    assert.ok(fs.existsSync(new URL(`../${template.thumbnail.src.split('?')[0]}`, import.meta.url)));
  }
  assert.equal(model.templates.find(template => template.letter === 'F').thumbnail.slotId, 'food');
  assert.equal(JSON.stringify({ catalog, data }), snapshot);
});

test('a provisioned empty shell stays internal and cannot become an advertised Hub demo', () => {
  const model = createTemplateHubModel(catalog, data);
  const showcase = model.templates.find(template => template.letter === 'A');
  assert.equal(showcase.demoSiteStatus, 'shell-provisioned');
  assert.equal(showcase.homepageUrl, null);
  assert.equal(showcase.showcaseUrl, null);
  assert.notEqual(showcase.sourceUrl, data.scope.pilot.consumerShellUrl);
  for (const field of ['homepageUrl', 'showcaseUrl']) {
    const unready = structuredClone(data);
    unready.templates[0].demoSite[field] = data.scope.pilot.consumerShellUrl;
    assert.throws(() => createTemplateHubModel(catalog, unready), /Unverified demo Site URLs/);
  }
  const root = renderTemplateHub(catalog, data, { document });
  const links = descendants(root).filter(node => node.tag === 'a');
  assert.equal(links.length, 9);
  assert.deepEqual(links.map(link => link.href), model.templates.map(template => template.sourceUrl));
  assert.ok(links.every(link => link.target === '_blank' && link.rel === 'noopener noreferrer'));
  assert.ok(links.every(link => link.textContent.trim() === 'View current demo ↗'));
  assert.doesNotMatch(root.textContent, /shell|provision|404|103|183|pending|approved|source demo/i);
  assert.ok(root.textContent.includes('Demo images keep their original colors.'));
});

test('Hub refuses extra designs and foreign source links rather than silently showing them', () => {
  const extra = structuredClone(data);
  extra.templates.push({ id: 'variant-j-box-office' });
  assert.throws(() => createTemplateHubModel(catalog, extra), /A–I/);
  const foreign = structuredClone(catalog);
  foreign.variants[0].sourceUrl = 'https://unverified.example/';
  assert.throws(() => createTemplateHubModel(foreign, data), /does not match the catalog/);
});
