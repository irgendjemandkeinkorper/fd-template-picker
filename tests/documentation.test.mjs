import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUPPORT_GUIDES } from '../documentation.mjs';
import { DEMO_DESIGN_NAMES } from '../names.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Every approved demo has a published guide with working links and heading anchors', () => {
  assert.deepEqual(SUPPORT_GUIDES.map(g => g.name), Object.values(DEMO_DESIGN_NAMES).slice(0, 9));
  for (const guide of SUPPORT_GUIDES) {
    const file = path.join(root, 'support', guide.id + '.html');
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /Quick fixes/);
    assert.match(html, /Color cleanup: scoped repairs verified/);
    assert.doesNotMatch(html, /(?:file:\/\/|localhost|127\.0\.0\.1|C:[/\\]|href="\.\.\/(?:planning|fd-template-picker))/i);
    for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^https?:/.test(href)) continue;
      const [relative, fragment] = href.split('#');
      let target = relative ? path.resolve(path.dirname(file), relative.split('?')[0]) : file;
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
      assert.ok(fs.existsSync(target), `${guide.name}: missing ${href}`);
      if (fragment && fragment !== 'documentation') assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${fragment}"`), `${guide.name}: broken ${href}`);
    }
  }
});
