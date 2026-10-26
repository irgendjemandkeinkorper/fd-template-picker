import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { prepareStandaloneRefresh, STANDALONE_ROUTES, imageSize } from '../scripts/refresh-standalone-catalog.mjs';
import { visualCaptureKey } from '../model.mjs';

const load = async name => JSON.parse(await readFile(new URL(`../${name}`, import.meta.url), 'utf8'));
const catalog = await load('catalog.json'), hub = await load('data/template-hub.json');
// Reuse actual encoded pixels solely to exercise geometry validation. Every
// native identity and QA declaration below remains a synthetic unit fixture.
const bytes = await readFile(new URL('../screenshots/demos/components/showcase-header.jpg', import.meta.url));
const size = imageSize(bytes);
const digest = createHash('sha256').update(bytes).digest('hex');
const variant = 'variant-a-circuit', origin = 'https://template-showcase-demo-indy-consumer.netlify.app/';
const now = '2026-10-26T18:00:00.000Z';
const bounds = { x: 0, y: 60, ...size };

function fixture() {
  const map = { siteId: 193, pages: {} }, native = { siteId: 193, name: 'Showcase', pages: {} };
  for (const [index, [role, route]] of Object.entries(STANDALONE_ROUTES).entries()) {
    const publishedPageId = 100 + index, publishedSectionId = 600 + index, editableSectionId = 700 + index;
    map.pages[role] = { url: new URL(`${route ?? variant}/`, origin).href, publishedPageId,
      mainClass: `q-page page-${route ?? variant}-${publishedPageId}`,
      sections: [{ className: `section-content-${publishedSectionId}`, publishedSectionIds: [publishedSectionId] }] };
    if (role === 'home') { native.home = publishedPageId; native.homeEditable = 200 + index; native.homeSections = [{ id: editableSectionId }]; }
    else native.pages[role === 'private-hire' ? 'privateHire' : role] = { pageId: publishedPageId, editableId: 200 + index, sections: [{ id: editableSectionId }] };
  }
  const slots = { food: ['food', 'Concessions Menu'], events: ['private-hire', 'Custom'], membership: ['membership', 'Custom'], contact: ['visit', 'Generic Form'] };
  const captures = { schema: 'fd-standalone-captures/v1', captures: Object.entries(slots).map(([slot, [pageRole, nativeWidgetType]]) => {
    const page = map.pages[pageRole], sectionId = page.sections[0].publishedSectionIds[0];
    return { slot, pageRole, nativeWidgetType, sourceUrl: page.url, pageId: page.publishedPageId, sectionIds: [sectionId], draftSectionIds: [sectionId + 100],
      image: `${slot}.jpg`, ...size, capturedAt: now, sourceBounds: bounds, captureBounds: bounds,
      selectors: [`body.site-193 .section-content-${sectionId}`], parts: [{ image: `${slot}.jpg`, bounds, offset: 0 }],
      appearanceAltered: false, sampleDataInjected: false, visualReview: { status: 'passed', reviewedAt: now, imageSha256: digest, notes: 'Synthetic unit fixture only.', evidence: 'unit-test' } };
  }) };
  const qa = { schema: 'indy-standalone-public-qa/v1', status: 'passed', checkedAt: now,
    checks: { routesChecked: 7, viewportModesChecked: 2, correctSiteOnAllRoutes: true, bodyHorizontalOverflow: false,
      localSevenItemPhoneDrawerVerified: true, phoneViewportWidths: [390], desktopViewportWidths: [1536] }, pages: structuredClone(map.pages), issues: [] };
  return { manifest: { schema: 'fd-standalone-refresh/v1', variant }, map, native, captures, qa, pageCss: '/* saved support CSS */', themeCss: '/* saved theme CSS */' };
}
const run = input => prepareStandaloneRefresh(catalog, hub, input, { readAsset: async () => bytes });
const optionAt = (data, slot, id = variant) => data.slots.find(entry => entry.id === slot).options.find(option => option.variant === id);

test('standalone promotion moves only the four reviewed choices and preserves source history', async () => {
  const snapshot = JSON.stringify({ catalog, hub }), input = fixture(), result = await run(input);
  assert.equal(JSON.stringify({ catalog, hub }), snapshot);
  assert.equal(result.promoted.length, 4);
  for (const capture of input.captures.captures) {
    const before = optionAt(catalog, capture.slot), after = optionAt(result.catalog, capture.slot);
    assert.equal(after.sourceUrl, capture.sourceUrl);
    assert.equal(after.pageId, String(capture.pageId));
    assert.deepEqual(after.sectionIds, capture.sectionIds.map(String));
    assert.deepEqual(after.draftSectionIds, capture.draftSectionIds.map(String));
    assert.equal(after.visualReview.captureKey, visualCaptureKey(after));
    assert.equal(after.visualReview.imageSha256, digest);
    assert.deepEqual(after.legacySourceReference, before.legacySourceReference);
    assert.equal(after.preStandaloneSourceReference.sourceUrl, before.preStandaloneSourceReference?.sourceUrl ?? before.sourceUrl);
    assert.equal(after.nativeWidgetType, capture.nativeWidgetType);
    assert.equal(after.demoProvenance.nativePageCss, 'evidence/standalone-sites/showcase/supporting-page.css');
    assert.ok(result.files.has(after.image));
    assert.ok(result.files.has(after.demoProvenance.nativeThemeCss));
    assert.deepEqual(optionAt(result.catalog, capture.slot, 'variant-b-rep'), optionAt(catalog, capture.slot, 'variant-b-rep'));
  }
  assert.deepEqual(optionAt(result.catalog, 'header'), optionAt(catalog, 'header'));
  assert.deepEqual(optionAt(result.catalog, 'hero'), optionAt(catalog, 'hero'));
  assert.equal(result.hub.templates[0].demoSite.siteStructure.pages.length, 7);
  assert.equal(result.hub.templates[0].demoSite.siteStructure.status, 'standalone');
  assert.equal(result.hub.templates[0].demoSite.showcaseUrl, null);
  assert.match(result.hub.templates[0].demoSite.siteStructure.scope, /Library portability remains unverified/);
});

test('partial screenshot sets cannot silently mark a site fully promoted', async () => {
  const input = fixture(); input.captures.captures.pop();
  await assert.rejects(run(input), /food, private-party, membership and contact/);
});

test('a rollout can require a hero captured after its native repair without changing generic imports', async () => {
  const input = fixture(); input.manifest.heroCaptureAfter = now;
  await assert.rejects(run(input), /reviewed hero capture after/);
  const page = input.map.pages.home, sectionId = page.sections[0].publishedSectionIds[0];
  const hero = { ...structuredClone(input.captures.captures[0]), slot:'hero', pageRole:'home', nativeWidgetType:'Showtimes',
    image:'hero.jpg', sourceUrl:page.url, pageId:page.publishedPageId, sectionIds:[sectionId], draftSectionIds:[sectionId + 100],
    selectors:[`body.site-193 .section-content-${sectionId}`] };
  input.captures.captures.push(hero);
  hero.capturedAt = '2026-10-26T17:00:00.000Z';
  await assert.rejects(run(input), /reviewed hero capture after/);
  hero.capturedAt = now;
  assert.equal((await run(input)).promoted.length, 5);
  input.manifest.heroCaptureAfter = 'unknown';
  await assert.rejects(run(input), /saved-repair timestamp/);
});

test('per-page saved CSS remains attached to its exact standalone source', async () => {
  const input = fixture();
  input.pageCssByRole = { visit: '/* saved form fix */', membership: '/* saved tier fix */' };
  const result = await run(input), base = 'evidence/standalone-sites/showcase';
  assert.equal(optionAt(result.catalog, 'contact').demoProvenance.nativePageCss, `${base}/page-css/visit.css`);
  assert.equal(optionAt(result.catalog, 'membership').demoProvenance.nativePageCss, `${base}/page-css/membership.css`);
  assert.equal(optionAt(result.catalog, 'food').demoProvenance.nativePageCss, `${base}/supporting-page.css`);
  assert.equal(result.files.get(`${base}/page-css/visit.css`).toString(), input.pageCssByRole.visit);
  assert.equal(result.files.get(`${base}/supporting-page.css`).toString(), input.pageCss);
  const visit = result.hub.templates[0].demoSite.siteStructure.pages.find(page => page.role === 'visit');
  assert.equal(visit.nativePageCss, `${base}/page-css/visit.css`);
  assert.equal(optionAt(result.catalog, 'hero').demoProvenance.nativePageCss, optionAt(catalog, 'hero').demoProvenance.nativePageCss);
});

test('unknown or empty saved CSS overrides cannot be promoted', async () => {
  for (const pageCssByRole of [{ privateHire: '/* wrong role */' }, { visit: '' }, { visit: null }, []]) {
    const input = fixture(); input.pageCssByRole = pageCssByRole;
    await assert.rejects(run(input), /Saved Page CSS overrides/);
  }
});

test('foreign Sites, routes and published IDs are rejected', async () => {
  for (const mutate of [
    input => { input.map.siteId = 170; },
    input => { input.map.pages.food.url = 'https://another-site.example/food-drink/'; },
    input => { input.native.pages.food.pageId = 999; },
    input => { input.captures.captures[0].sectionIds = [999]; },
    input => { input.captures.captures[0].pageId = 999; },
    input => { input.captures.captures[0].selectors = ['body.site-170 .section-content-602']; },
  ]) { const input = fixture(); mutate(input); await assert.rejects(run(input), /identity|selector/); }
});

test('a public events programme cannot replace a private-party choice', async () => {
  const input = fixture(); input.captures.captures[1].pageRole = 'events';
  await assert.rejects(run(input), /wrong-page/);
});

test('before-edit native records cannot manufacture editable mappings or widget types', async () => {
  const unknown = fixture(); unknown.captures.captures[0].draftSectionIds = [77777];
  await assert.rejects(run(unknown), /Unrecorded editable/);
  const missing = fixture(); delete missing.captures.captures[0].nativeWidgetType;
  await assert.rejects(run(missing), /Incomplete live capture/);
  const absent = fixture(); delete absent.native.pages.food.editableId; absent.captures.captures[0].draftSectionIds = [];
  const result = await run(absent);
  assert.equal(optionAt(result.catalog, 'food').draftId, null);
  assert.deepEqual(optionAt(result.catalog, 'food').draftSectionIds, []);
});

test('stale, altered and incomplete screenshots cannot pass promotion', async () => {
  for (const mutate of [
    capture => { capture.visualReview.imageSha256 = '0'.repeat(64); },
    capture => { capture.visualReview.status = 'needs-review'; },
    capture => { capture.appearanceAltered = true; },
    capture => { capture.sampleDataInjected = true; },
    capture => { capture.missingDocumentY = [[100, 150]]; },
    capture => { capture.parts = []; },
    capture => { capture.captureBounds.width = 0; },
  ]) { const input = fixture(); input.captures.captures[0].captureBounds = { ...bounds }; mutate(input.captures.captures[0]); await assert.rejects(run(input), /review|capture|bounds/); }
});

test('a measured seven-page QA result is required, including real phone navigation', async () => {
  for (const mutate of [
    input => { input.qa.status = 'requires-presentation-fixes'; },
    input => { input.qa.checks.localSevenItemPhoneDrawerVerified = false; },
    input => { input.qa.checks.routesChecked = 6; },
    input => { input.qa.checks.phoneViewportWidths = [768]; },
    input => { input.qa.issues.push({ severity: 'presentation', status: 'awaiting-native-fix' }); },
    input => { input.qa.pages.visit.publishedPageId = 12345; },
  ]) { const input = fixture(); mutate(input); await assert.rejects(run(input), /QA/); }
  const input = fixture(); input.qa.issues.push({ severity: 'behavior-note', status: 'observed', finding: 'Native routing drops contact hash but reaches Visit.' });
  assert.equal((await run(input)).promoted.length, 4);
});

test('undeclared scaled screenshots, representative crops and missing tile pixels cannot be called complete', async () => {
  for (const mutate of [
    c => { c.width += 15; c.captureBounds = { ...c.captureBounds, width:c.width }; },
    c => { c.sourceBounds = { ...c.sourceBounds, height:c.height + 100 }; },
    c => { c.parts[0].offset = 1; },
    c => { c.parts[0].bounds = { ...c.parts[0].bounds, height:c.height - 1 }; },
    c => { c.parts[0].imageCropBounds = {x:0,y:0,...size}; c.parts[0].expectedRawSize = {width:size.width + 15,height:size.height}; },
  ]) { const input = fixture(); mutate(input.captures.captures[0]); await assert.rejects(run(input), /pixel|geometry|coverage|bounds/); }
});

// The same encoded unit-fixture image represents both final and raw images.
// These declarations test coordinate validation only, not real capture pixels.
function scaledFixture() {
  const input = fixture(), c = input.captures.captures[0];
  const css = { x:0, y:60, width:size.width * 2, height:size.height * 2 };
  c.nativeScale = { kind:'uniform-provider-resize', pixelsPerCssPixel:.5,
    cssViewport:{width:css.width,height:css.height}, rounding:'nearest-segment' };
  c.sourceBounds = {...css}; c.captureBounds = {...css};
  const heights = [56, css.height - 56];
  let offset = 0, pixelOffset = 0;
  c.parts = heights.map(height => {
    const part = { image:'raw.png', bounds:{...css,y:css.y + offset,height}, offset,pixelOffset,
      expectedRawSize:{...size}, viewportScrollY:css.y + offset,
      rawCaptureBounds:{x:0,y:css.y + offset,width:css.width,height:css.height},
      imageCropBounds:{x:0,y:0,width:size.width,height:Math.round(height * .5)} };
    offset += height; pixelOffset += part.imageCropBounds.height; return part;
  });
  return input;
}

test('explicit uniform native provider scale preserves CSS and encoded pixel geometry', async () => {
  const input = scaledFixture(), result = await run(input), c = input.captures.captures[0];
  const promoted = optionAt(result.catalog,'food');
  assert.deepEqual(promoted.capture.nativeScale,c.nativeScale);
  assert.deepEqual(promoted.capture.captureBounds,c.captureBounds);
  assert.deepEqual(promoted.capture.evidence.map(p => p.pixelOffset),[0,28]);
  assert.equal(promoted.height,57);
  assert.equal(promoted.capture.captureBounds.height,114);
  assert.match(promoted.capture.notes[1],/uniformly resized/);
  const archived = JSON.parse(result.files.get('evidence/standalone-sites/showcase/component-captures.json'));
  assert.deepEqual(archived.captures[0].nativeScale,c.nativeScale);
});

test('native scale rejects nonuniform resizing, inconsistent tiles, omitted rows and shifted crops', async () => {
  for (const mutate of [
    c => { c.nativeScale.pixelsPerCssPixel = .6; },
    c => { c.nativeScale.cssViewport.height += 4; c.parts.forEach(p => p.rawCaptureBounds.height += 4); },
    c => { c.parts[1].rawCaptureBounds.width += 1; },
    c => { c.parts[1].pixelOffset += 1; },
    c => { c.parts[1].imageCropBounds.y += 1; },
    c => { c.parts[1].expectedRawSize.width += 1; },
    c => { c.parts[1].viewportScrollY += 1; },
    c => { c.parts[1].bounds.height -= 2; c.parts[1].imageCropBounds.height -= 1; },
    c => { delete c.parts[0].imageCropBounds; },
    c => { delete c.parts[0].rawCaptureBounds; },
    c => { delete c.nativeScale; },
  ]) { const input = scaledFixture(); mutate(input.captures.captures[0]); await assert.rejects(run(input),/scale|pixel|geometry|bounds/); }
});

test('exact viewport crop metadata survives archival for reproducible assembly', async () => {
  const input = fixture();
  Object.assign(input.captures.captures[0].parts[0], { imageCropBounds:{x:0,y:0,...size}, expectedRawSize:size, viewportScrollY:60, rawCaptureBounds:{x:0,y:60,...size} });
  const result = await run(input), part = optionAt(result.catalog,'food').capture.evidence[0];
  assert.deepEqual(part.expectedRawSize,size);
  assert.deepEqual(part.imageCropBounds,{x:0,y:0,...size});
  assert.equal(part.viewportScrollY,60);
});

test('an exact viewport crop cannot shift the declared source or hide a missing row', async () => {
  for (const mutate of [
    p => { p.imageCropBounds.y = 1; p.imageCropBounds.height -= 1; p.bounds.height -= 1; },
    p => { p.rawCaptureBounds.y -= 1; },
    p => { p.rawCaptureBounds.width += 1; },
    p => { p.viewportScrollY += 1; },
  ]) {
    const input = fixture(), c = input.captures.captures[0];
    c.parts[0].bounds = {...c.parts[0].bounds};
    Object.assign(c.parts[0], { imageCropBounds:{x:0,y:0,...size}, expectedRawSize:{...size}, viewportScrollY:60, rawCaptureBounds:{x:0,y:60,...size} });
    // A one-row-offset crop still fits inside the actual viewport PNG/JPEG.
    // It must fail its source-origin mapping before aggregate height checking.
    mutate(c.parts[0]);
    await assert.rejects(run(input),/Raw viewport pixel dimensions or crop differ/);
  }
});
