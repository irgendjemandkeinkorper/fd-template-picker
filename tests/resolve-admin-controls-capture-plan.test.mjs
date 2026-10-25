import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAdminControlsCapturePlan as resolvePlan } from '../scripts/resolve-admin-controls-capture-plan.mjs';

function fixture({ variant = 'variant-a-circuit', pageId = '5659', ids = ['23738', '23739'], scrollY = 0, gap = false } = {}) {
  const palette = { '--q-primary': '#e06b4a', '--q-secondary': '#c4553a', '--q-dark': '#38264a', '--q-background': '#fbefe2' };
  const node = (tag, names, box, attrs = {}, text = '') => {
    const item = { tagName: tag.toUpperCase(), className: names, textContent: text, children: [], parentElement: null,
      box, paint: { display: 'block', visibility: 'visible', opacity: '1', getPropertyValue: key => palette[key] || '' },
      getAttribute: key => key === 'class' ? item.className : attrs[key] ?? null,
      getBoundingClientRect: () => ({ ...item.box }),
      closest: selector => { for (let p = item; p; p = p.parentElement) if (selector === '.q-layout' && p.className.split(' ').includes('q-layout')) return p; return null; },
      querySelectorAll: selector => {
        const candidates = [];
        const walk = parent => { for (const child of parent.children) { candidates.push(child); walk(child); } };
        walk(item);
        return candidates.filter(candidate => selector === '[class*="page-variant-"]' ? candidate.className.includes('page-variant-')
          : selector === '[data-test-id="section-content"]' ? candidate.getAttribute('data-test-id') === 'section-content'
          : selector === 'header.consumer-header' ? candidate.tagName === 'HEADER' && candidate.className.includes('consumer-header')
          : selector === 'h1,h2,h3,h4' ? /^H[1-4]$/.test(candidate.tagName)
          : selector === 'img' ? candidate.tagName === 'IMG'
          : selector === '.row.menu a' ? candidate.tagName === 'A' : false);
      } };
    return item;
  };
  const attach = (parent, child) => { parent.children.push(child); child.parentElement = parent; return child; };
  const body = node('body', 'site-170', { x: 0, y: 0, width: 1520.8, height: 3000 });
  const layout = attach(body, node('div', 'q-layout', body.box));
  const concrete = variant === 'variant-f-concrete';
  const header = attach(layout, node('header', 'consumer-header', { x: 0, y: 0, width: concrete ? 240 : 1520.8, height: concrete ? 864 : 56.8 }));
  attach(header, node('a', 'q-btn', { x: 16, y: 16, width: 100, height: 30 }, { href: '/explore-movies' }, 'Films'));
  const page = attach(layout, node('main', `q-page page-${variant}-${pageId}`, { x: concrete ? 240 : 0, y: 56.8 - scrollY, width: concrete ? 1280.8 : 1520.8, height: 2000 }));
  const first = attach(page, node('section', `section-hero-a---showtimes-shelf-${ids[0]}`, { x: 0, y: 56.8 - scrollY, width: 1520.8, height: 600 }, { 'data-test-id': 'section-content' }));
  attach(first, node('h2', '', { x: 20, y: 100 - scrollY, width: 400, height: 50 }, {}, 'Hero title'));
  if (gap) attach(page, node('section', 'section-now-playing-a---board-999', { x: 0, y: 656.8 - scrollY, width: 1520.8, height: 100 }, { 'data-test-id': 'section-content' }));
  const second = attach(page, node('section', `section-hero-a---shelf-${ids[1]}`, { x: 0, y: (gap ? 756.8 : 656.8) - scrollY, width: 1520.8, height: 300 }, { 'data-test-id': 'section-content' }));
  const doc = { body, URL: `https://example.test/${variant}/`, readyState: 'complete', documentElement: { clientWidth: 1520.8, clientHeight: 864, scrollWidth: 1521, scrollHeight: 3000, scrollLeft: 0, scrollTop: scrollY }, querySelectorAll: selector => body.querySelectorAll(selector) };
  const runtime = { observedAt: '2026-10-25T20:00:00Z', innerWidth: 1536, innerHeight: 864, getComputedStyle: element => element.paint };
  const base = { variant, sourceUrl: doc.URL, pageId, destination: 'screenshots/test.jpg' };
  const plan = { required: [{ ...base, optionId: `header--${variant}`, slot: 'header', sectionIds: [] },
    { ...base, optionId: `hero--${variant}`, slot: 'hero', sectionIds: ['23738', '23739'], previousSelectors: ['.section-hero-a---showtimes-shelf-23738', '.section-hero-a---shelf-23739'] }] };
  return { doc, runtime, plan, header, page, first, second, attach, node };
}

test('reads fresh merged source bounds and preserves actual identities', () => {
  const value = fixture();
  const result = resolvePlan(value.plan, value.doc, value.runtime);
  const hero = result.clips[1];
  assert.deepEqual(hero.sectionIds, ['23738', '23739']);
  assert.equal(hero.sourceBounds.height, 900);
  assert.deepEqual(hero.captureBounds, { x: 0, y: 56, width: 1521, height: 901 });
  assert.equal(hero.nativeClipReadyAfterSemanticReview, true);
  assert.equal(hero.semanticReviewRequired, true);
  assert.equal(result.observedAt, value.runtime.observedAt);
  assert.equal(result.nativePalette.dark, '#38264a');
});

test('changed IDs resolve only through prior observed class stems and remain flagged', () => {
  const value = fixture({ ids: ['90001', '90002'] });
  const hero = resolvePlan(value.plan, value.doc, value.runtime).clips[1];
  assert.equal(hero.sourceIdentityChanged, true);
  assert.deepEqual(hero.sectionIds, ['90001', '90002']);
  assert.ok(hero.matchMethods.every(value => value.includes('requires-semantic-review')));
  assert.ok(hero.notes.some(value => value.includes('sourceIdentityVerified')));
  value.plan.required[1].previousSelectors = [];
  assert.equal(resolvePlan(value.plan, value.doc, value.runtime).clips[1].nativeClipReadyAfterSemanticReview, false);
});

test('nonconsecutive merged sources and changed page identity are blocked', () => {
  const value = fixture({ gap: true });
  assert.ok(resolvePlan(value.plan, value.doc, value.runtime).clips[1].blockers.some(value => value.includes('no longer consecutive')));
  value.page.className = 'q-page page-variant-a-circuit-99999';
  assert.ok(resolvePlan(value.plan, value.doc, value.runtime).clips.every(clip => clip.blockers.some(value => value.includes('page ID differs'))));
});

test('Concrete header keeps its real sidebar rectangle and requires document top', () => {
  const value = fixture({ variant: 'variant-f-concrete', pageId: '5903' });
  assert.deepEqual(resolvePlan(value.plan, value.doc, value.runtime).clips[0].captureBounds, { x: 0, y: 0, width: 240, height: 864 });
  value.doc.documentElement.scrollTop = 500;
  assert.ok(resolvePlan(value.plan, value.doc, value.runtime).clips[0].blockers.some(value => value.includes('document top')));
});

test('wrong site, wrong route, phone and missing scroll proof are blocked', () => {
  for (const mutate of [value => { value.doc.body.className = 'site-999'; }, value => { value.doc.URL = 'https://wrong.test/'; }, value => { value.runtime.innerWidth = 390; }, value => { delete value.doc.documentElement.scrollTop; }]) {
    const value = fixture(); mutate(value);
    assert.equal(resolvePlan(value.plan, value.doc, value.runtime).clips.every(clip => !clip.nativeClipReadyAfterSemanticReview), true);
  }
});

test('image loading and hidden ancestor prevent a premature clip', () => {
  const value = fixture();
  const image = value.attach(value.first, value.node('img', '', { x: 100, y: 120, width: 300, height: 300 }, { src: '/hero.jpg' }));
  image.complete = false; image.naturalWidth = 0;
  assert.ok(resolvePlan(value.plan, value.doc, value.runtime).clips[1].blockers.some(value => value.includes('incomplete or broken')));
  value.first.paint.display = 'none';
  assert.ok(resolvePlan(value.plan, value.doc, value.runtime).clips[1].blockers.some(value => value.includes('missing or ambiguous')));
});

test('serializes without module dependencies or unsupported browser globals', () => {
  const value = fixture();
  const serialized = Function(`return (${resolvePlan.toString()})`)();
  assert.equal(serialized(value.plan, value.doc, value.runtime).clips[1].nativeClipReadyAfterSemanticReview, true);
  const code = resolvePlan.toString();
  for (const unsupported of ['new Set', 'new URL', 'new Date', 'defaultView', 'classList', 'localStorage', 'fetch(', '.click(', '.scrollTo(', '.appendChild(']) assert.equal(code.includes(unsupported), false, unsupported);
});
