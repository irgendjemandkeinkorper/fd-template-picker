// Promote reviewed standalone-page references without rebuilding the catalog
// from the historical authoring Site. All native IDs remain source IDs.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative, join, sep, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { visualCaptureKey, componentForOption } from '../model.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const clone = value => structuredClone(value);
const ids = values => (values ?? []).map(String);
const positiveId = value => /^\d+$/.test(String(value)) && Number(value) > 0;
export const STANDALONE_ROUTES = Object.freeze({
  home: null, films: 'movie-lineup', food: 'food-drink',
  'private-hire': 'private-hire', membership: 'membership',
  visit: 'visit', events: 'events-late-nights',
});
const labels = { home: 'Home', films: 'Films', food: 'Food & Drink', 'private-hire': 'Private Events', membership: 'Membership', visit: 'Visit & Contact', events: 'Events' };
const slotPage = { header: 'home', hero: 'home', food: 'food', events: 'private-hire', membership: 'membership', contact: 'visit' };
const movedSlots = ['food', 'events', 'membership', 'contact'];
const currentReference = option => Object.fromEntries([
  'sourceSite', 'sourceUrl', 'pageId', 'draftId', 'sectionIds', 'draftSectionIds',
  'nativeWidgetType', 'image', 'width', 'height', 'capture', 'visualReview', 'demoProvenance',
].map(key => [key, clone(option[key])]));

// Read encoded dimensions rather than assuming a browser screenshot used the
// requested CSS-pixel size. Native viewport screenshots can be scaled.
export function imageSize(bytes) {
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 3 < bytes.length) {
      if (bytes[offset++] !== 255) continue;
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 218 || marker === 217) break;
      if (marker === 1 || marker >= 208 && marker <= 216) continue;
      const length = bytes.readUInt16BE(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if (marker >= 192 && marker <= 207 && ![196, 200, 204].includes(marker) && length >= 7) {
        return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
      }
      offset += length;
    }
  }
  throw new Error('Capture is not a readable JPEG or PNG image.');
}

function checkQa(qa) {
  const c = qa?.checks;
  if (qa?.schema !== 'indy-standalone-public-qa/v1' || qa.status !== 'passed' || !qa.checkedAt
    || c?.routesChecked !== 7 || c.viewportModesChecked !== 2 || c.correctSiteOnAllRoutes !== true
    || c.bodyHorizontalOverflow !== false || c.localSevenItemPhoneDrawerVerified !== true
    || !c.phoneViewportWidths?.includes(390) || !c.desktopViewportWidths?.some(width => width >= 1280)
    || qa.issues?.some(issue => issue.severity !== 'behavior-note' && !['fixed', 'resolved', 'passed'].includes(issue.status))) {
    throw new Error('Standalone promotion requires passed seven-page desktop/390px QA with no unresolved presentation issues.');
  }
}

function nativePage(native, role) {
  if (role === 'home') return { pageId: native.home ?? native.homeId, editablePageId: native.homeEditable ?? null, sections: native.homeSections ?? [] };
  return native.pages?.[role === 'private-hire' ? 'privateHire' : role];
}

function checkBounds(value, label) {
  if (!value || !['x', 'y', 'width', 'height'].every(key => Number.isFinite(value[key])) || value.width <= 0 || value.height <= 0) {
    throw new Error(`Invalid ${label}.`);
  }
}

function nativeScaleFor(capture) {
  if (capture.nativeScale === undefined) return null;
  const scale = capture.nativeScale, viewport = scale?.cssViewport;
  if (scale?.kind !== 'uniform-provider-resize' || scale.rounding !== 'nearest-segment'
    || !Number.isFinite(scale.pixelsPerCssPixel) || scale.pixelsPerCssPixel <= 0 || scale.pixelsPerCssPixel > 1
    || !viewport || !['width', 'height'].every(key => Number.isInteger(viewport[key]) && viewport[key] > 0)) {
    throw new Error(`Invalid native screenshot scale geometry: ${capture.slot}.`);
  }
  return scale;
}

// The pure updater validates the entire site before returning any replacement
// data. readAsset resolves paths relative to component-captures.json.
export async function prepareStandaloneRefresh(catalog, hub, input, { readAsset } = {}) {
  const { manifest, map, native, captures: captureDocument, qa, pageCss, themeCss, pageCssByRole = {} } = input;
  if (manifest?.schema !== 'fd-standalone-refresh/v1' || !readAsset) throw new Error('Unsupported standalone refresh manifest.');
  const heroCaptureAfter = manifest.heroCaptureAfter === undefined ? null : Date.parse(manifest.heroCaptureAfter);
  if (manifest.heroCaptureAfter !== undefined && (typeof manifest.heroCaptureAfter !== 'string' || !Number.isFinite(heroCaptureAfter))) {
    throw new Error('heroCaptureAfter must be a saved-repair timestamp.');
  }
  const updated = clone(catalog), nextHub = clone(hub);
  const template = nextHub.templates.find(item => item.id === manifest.variant);
  if (!template || template.demoSite?.status !== 'published-display-only'
    || map.siteId !== template.demoSite.nativeSiteId || (native.siteId ?? native.id) !== map.siteId
    || (native.name && native.name !== template.displayName)) throw new Error('Standalone Site identity does not match its existing reviewed demo.');
  checkQa(qa);
  if (!pageCss?.trim() || !themeCss?.trim()) throw new Error('Saved supporting Page CSS and Site Theme CSS are required.');
  if (!pageCssByRole || typeof pageCssByRole !== 'object' || Array.isArray(pageCssByRole)
    || Object.entries(pageCssByRole).some(([role, css]) => !Object.hasOwn(STANDALONE_ROUTES, role) || typeof css !== 'string' || !css.trim())) {
    throw new Error('Saved Page CSS overrides must name known Page roles and contain nonempty CSS.');
  }
  const host = new URL(template.demoSite.homepageUrl), slug = template.displayName.toLowerCase();
  const base = `evidence/standalone-sites/${slug}`;
  const files = new Map(), pages = [];
  const pageCssPath = role => Object.hasOwn(pageCssByRole, role)
    ? `${base}/page-css/${role}.css` : role === 'home' ? null : `${base}/supporting-page.css`;
  const addJson = (name, value) => files.set(`${base}/${name}`, Buffer.from(`${JSON.stringify(value, null, 2)}\n`));
  const seenPageIds = new Set();
  for (const [role, route] of Object.entries(STANDALONE_ROUTES)) {
    const page = map.pages?.[role], record = nativePage(native, role);
    const expectedUrl = new URL(`${route ?? manifest.variant}/`, host).href;
    if (!page || page.url !== expectedUrl || !positiveId(page.publishedPageId)
      || !new RegExp(`(?:^| )page-[a-z0-9-]+-${page.publishedPageId}(?: |$)`).test(page.mainClass ?? '')
      || seenPageIds.has(String(page.publishedPageId)) || !record
      || String(record.pageId) !== String(page.publishedPageId)) throw new Error(`Native Page identity mismatch: ${role}.`);
    seenPageIds.add(String(page.publishedPageId));
    const qaPage = qa.pages?.[role];
    if (!qaPage || qaPage.url !== page.url || String(qaPage.publishedPageId) !== String(page.publishedPageId)) throw new Error(`QA Page identity mismatch: ${role}.`);
    const editable = record.editablePageId ?? record.editableId ?? page.editablePageIdFromNativeRecord ?? null;
    pages.push({ role, label: labels[role], url: page.url, pageId: String(page.publishedPageId), editablePageId: editable === null ? null : String(editable),
      ...(pageCssPath(role) ? { nativePageCss: pageCssPath(role) } : {}) });
  }
  if (captureDocument?.schema !== 'fd-standalone-captures/v1' || !Array.isArray(captureDocument.captures)) throw new Error('Unsupported standalone component captures.');
  const seenSlots = new Set(), promoted = [], archivedCaptures = [];
  for (const capture of captureDocument.captures) {
    const role = slotPage[capture.slot];
    if (!role || capture.pageRole !== role || seenSlots.has(capture.slot)) throw new Error(`Unknown, duplicate or wrong-page capture: ${capture.slot}.`);
    seenSlots.add(capture.slot);
    const page = map.pages[role], record = nativePage(native, role);
    const slot = updated.slots.find(entry => entry.id === capture.slot);
    const option = slot?.options.find(entry => entry.variant === manifest.variant);
    if (!option || option.sourceSite?.siteId !== map.siteId || !option.demoProvenance) throw new Error(`Existing demo option missing: ${capture.slot}.`);
    const sectionIds = ids(capture.sectionIds), knownSections = new Set(page.sections.flatMap(section => ids(section.publishedSectionIds)));
    if (capture.sourceUrl !== page.url || String(capture.pageId) !== String(page.publishedPageId)
      || new Set(sectionIds).size !== sectionIds.length || sectionIds.some(id => !knownSections.has(id))
      || (capture.slot === 'header' ? sectionIds.length !== 0 : sectionIds.length === 0)) throw new Error(`Published source identity mismatch: ${capture.slot}.`);
    const draftSectionIds = ids(capture.draftSectionIds);
    const knownDraftIds = new Set(ids(record.sectionIds ?? record.sections?.map(section => section.id)));
    if (draftSectionIds.some(id => !knownDraftIds.has(id))) throw new Error(`Unrecorded editable Section ID: ${capture.slot}.`);
    if (!capture.capturedAt || capture.appearanceAltered !== false || capture.sampleDataInjected !== false
      || capture.missingDocumentY?.length || !/\.jpg$/i.test(capture.image ?? '')
      || !(capture.width > 0 && capture.height > 0) || !capture.parts?.length
      || !capture.selectors?.length || (capture.slot !== 'header' && !capture.nativeWidgetType)) throw new Error(`Incomplete live capture: ${capture.slot}.`);
    for (const selector of capture.selectors) {
      if (!selector.includes(`body.site-${map.siteId}`) || (capture.slot !== 'header' && !sectionIds.some(id => selector.includes(`-${id}`)))) throw new Error(`Capture selector does not identify its Site/Section: ${capture.slot}.`);
    }
    checkBounds(capture.sourceBounds, 'source bounds');
    checkBounds(capture.captureBounds, 'capture bounds');
    const bytes = await readAsset(capture.image), digest = sha(bytes), review = capture.visualReview;
    const actualSize = imageSize(bytes), source = capture.sourceBounds, crop = capture.captureBounds;
    const nativeScale = nativeScaleFor(capture), scale = nativeScale?.pixelsPerCssPixel ?? 1;
    if (actualSize.width !== capture.width || actualSize.height !== capture.height
      || (nativeScale ? Math.round(crop.width * scale) !== capture.width : crop.width !== capture.width || crop.height !== capture.height)) {
      throw new Error(`Capture pixel dimensions differ from recorded geometry: ${capture.slot}.`);
    }
    if (crop.x > source.x + 1 || crop.y > source.y + 1 || crop.x + crop.width < source.x + source.width - 1
      || crop.y + crop.height < source.y + source.height - 1) throw new Error(`Partial source coverage cannot be promoted as a complete section: ${capture.slot}.`);
    if (review?.status !== 'passed' || !review.reviewedAt || !review.notes || !review.evidence || review.imageSha256 !== digest) throw new Error(`Missing or stale visual review: ${capture.slot}.`);
    const image = `screenshots/demos/components/${slug}-${capture.slot}.jpg`;
    files.set(image, bytes);
    const evidence = [];
    let covered = 0, pixelCovered = 0, scaledRawSize = null;
    for (const [index, part] of capture.parts.entries()) {
      checkBounds(part.bounds, 'raw clip bounds');
      if (!/\.(?:jpg|png)$/i.test(part.image ?? '') || !Number.isFinite(part.offset)) throw new Error(`Incomplete raw clip: ${capture.slot}.`);
      const raw = await readAsset(part.image), extension = part.image.split('.').at(-1).toLowerCase();
      const rawSize = imageSize(raw);
      if (part.offset !== covered || part.bounds.x !== crop.x || Math.abs(part.bounds.y - crop.y - covered) > 1
        || part.bounds.width !== crop.width) throw new Error(`Raw clips do not cover consecutive source pixels: ${capture.slot}.`);
      if (nativeScale) {
        const b = part.imageCropBounds, rawBounds = part.rawCaptureBounds, expected = part.expectedRawSize;
        checkBounds(b, 'scaled viewport crop bounds'); checkBounds(rawBounds, 'native viewport CSS bounds');
        const expectedCrop = { x: Math.round((part.bounds.x - rawBounds.x) * scale), y: Math.round((part.bounds.y - rawBounds.y) * scale),
          width: Math.round(part.bounds.width * scale), height: Math.round(part.bounds.height * scale) };
        if (!expected || rawSize.width !== expected.width || rawSize.height !== expected.height
          || rawBounds.x !== 0 || rawBounds.y !== part.viewportScrollY
          || rawBounds.width !== nativeScale.cssViewport.width || rawBounds.height !== nativeScale.cssViewport.height
          || Math.abs(rawSize.width / rawBounds.width - scale) > 1e-10 || Math.abs(rawSize.height - rawBounds.height * scale) > 1
          || (scaledRawSize && (rawSize.width !== scaledRawSize.width || rawSize.height !== scaledRawSize.height))
          || part.pixelOffset !== pixelCovered || !Object.keys(expectedCrop).every(key => b[key] === expectedCrop[key])
          || b.x < 0 || b.y < 0 || b.x + b.width > rawSize.width || b.y + b.height > rawSize.height
          || part.bounds.x < rawBounds.x || part.bounds.y < rawBounds.y
          || part.bounds.x + part.bounds.width > rawBounds.x + rawBounds.width
          || part.bounds.y + part.bounds.height > rawBounds.y + rawBounds.height) {
          throw new Error(`Native provider scale or crop geometry differs: ${capture.slot}.`);
        }
        scaledRawSize = rawSize; pixelCovered += b.height;
      } else if (part.imageCropBounds) {
        checkBounds(part.imageCropBounds, 'viewport crop bounds');
        checkBounds(part.rawCaptureBounds, 'native viewport CSS bounds');
        const b = part.imageCropBounds, expected = part.expectedRawSize, frame = part.rawCaptureBounds;
        if (!expected || rawSize.width !== expected.width || rawSize.height !== expected.height
          || frame.y !== part.viewportScrollY || frame.width !== rawSize.width || frame.height !== rawSize.height
          || b.x !== Math.round(part.bounds.x - frame.x) || b.y !== Math.round(part.bounds.y - frame.y)
          || part.bounds.x < frame.x || part.bounds.y < frame.y
          || part.bounds.x + part.bounds.width > frame.x + frame.width
          || part.bounds.y + part.bounds.height > frame.y + frame.height
          || b.x < 0 || b.y < 0 || b.x + b.width > rawSize.width || b.y + b.height > rawSize.height
          || b.width !== part.bounds.width || b.height !== part.bounds.height) throw new Error(`Raw viewport pixel dimensions or crop differ: ${capture.slot}.`);
      } else if (rawSize.width !== part.bounds.width || rawSize.height !== part.bounds.height) {
        throw new Error(`A raw viewport crop needs explicit pixel geometry: ${capture.slot}.`);
      }
      covered += part.bounds.height;
      const path = `${base}/raw/${capture.slot}-${index + 1}.${extension}`;
      files.set(path, raw);
      evidence.push({ ...part, image: path, rawImageSha256: sha(raw) });
    }
    if (covered !== crop.height || (nativeScale && pixelCovered !== capture.height)) throw new Error(`Raw clips omit section pixels: ${capture.slot}.`);
    option.preStandaloneSourceReference ??= currentReference(option);
    const resolvedPage = pages.find(entry => entry.role === role);
    Object.assign(option, {
      sourceUrl: page.url, pageId: String(page.publishedPageId), draftId: resolvedPage.editablePageId,
      sectionIds, draftSectionIds, image, width: capture.width, height: capture.height,
      captureStatus: 'captured-live', componentStatus: 'present', componentAuditedAt: qa.checkedAt,
      componentNote: capture.slot === 'header' ? 'Site-wide native navigation; seven local destinations checked on desktop and phone.'
        : capture.slot === 'hero' ? 'Native Showtimes opening the standalone homepage. Display-only; ticketing remains disabled.'
          : `Dedicated ${labels[role]} Page on the standalone ${template.displayName} demo. Native content and desktop/phone presentation reviewed.`,
      capture: { mode: 'live', capturedAt: capture.capturedAt, method: 'live-browser-section-clips', selectors: capture.selectors,
        sourceBounds: capture.sourceBounds, captureBounds: capture.captureBounds, evidence,
        ...(nativeScale ? { nativeScale: clone(nativeScale) } : {}),
        appearanceAltered: false, sampleDataInjected: false,
        notes: ['Actual published standalone Page. Raw clips preserve native content and styling; no browser CSS injection or sample-data substitution.',
          ...(nativeScale ? ['The browser provider uniformly resized each native viewport image. CSS coordinates, encoded pixel coordinates and the verified scale are retained; assembly only crops and joins native pixels.'] : [])] },
      standaloneSource: { schema: 'fd-standalone-source/v1', pageRole: role, map: `${base}/public-native-map.json`, nativeRecord: `${base}/native-records.json`, captures: `${base}/component-captures.json`, qa: `${base}/verification.json`, sourceIdsOnly: true },
    });
    if (capture.nativeWidgetType) option.nativeWidgetType = capture.nativeWidgetType;
    if (capture.nativeName) option.sourceName = capture.nativeName;
    option.demoProvenance = { ...option.demoProvenance, sourceUrl: page.url, verifiedAt: qa.checkedAt,
      nativePageCss: pageCssPath(role) ?? option.demoProvenance.nativePageCss,
      nativeThemeCss: `${base}/site-theme.css`, standaloneMap: `${base}/public-native-map.json` };
    option.visualReview = { ...review, captureKey: visualCaptureKey(option), imageSha256: digest, evidence: `${base}/component-captures.json` };
    archivedCaptures.push({ ...capture, image, parts: evidence, visualReview: { ...review, sourceEvidence: review.evidence, evidence: `${base}/component-captures.json` } });
    const audit = updated.componentAudit?.find(entry => entry.variant === option.variant && entry.component === componentForOption(slot, option));
    if (audit) Object.assign(audit, { sourceOptionId: option.id, sourceSectionIds: sectionIds, sourceUrl: page.url, auditedAt: qa.checkedAt, status: 'present', notes: [option.componentNote] });
    promoted.push(option.id);
  }
  if (movedSlots.some(slot => !seenSlots.has(slot))) throw new Error('A standalone refresh needs reviewed food, private-party, membership and contact captures together.');
  if (heroCaptureAfter !== null) {
    const refreshedHero = captureDocument.captures.find(capture => capture.slot === 'hero');
    if (!refreshedHero || !(Date.parse(refreshedHero.capturedAt) >= heroCaptureAfter)
      || !(Date.parse(refreshedHero.visualReview.reviewedAt) >= heroCaptureAfter)) {
      throw new Error('This rollout requires a reviewed hero capture after its recorded native repair.');
    }
  }
  addJson('public-native-map.json', map); addJson('native-records.json', native);
  addJson('component-captures.json', { ...captureDocument, assetPathsRelativeTo: 'repository-root', captures: archivedCaptures }); addJson('verification.json', qa);
  files.set(`${base}/supporting-page.css`, Buffer.from(pageCss)); files.set(`${base}/site-theme.css`, Buffer.from(themeCss));
  for (const [role, css] of Object.entries(pageCssByRole)) files.set(pageCssPath(role), Buffer.from(css));
  template.demoSite.siteStructure = { status: 'standalone', checkedAt: qa.checkedAt, pages,
    verification: `${base}/verification.json`, nativeMap: `${base}/public-native-map.json`,
    scope: 'Seven local published Pages with shared navigation and design styling. Display-only; no form submission or checkout certification. Library portability remains unverified.' };
  template.demoSite.sectionShowcasePagesStatus = 'integrated-standalone-pages';
  const hero = captureDocument.captures.find(capture => capture.slot === 'hero');
  if (hero) {
    const image = `screenshots/demos/components/${slug}-hero.jpg`;
    template.demoSite.preview = { ...template.demoSite.preview, image, width: hero.width, height: hero.height,
      imageSha256: sha(files.get(image)), reviewedAt: hero.visualReview.reviewedAt, sourceUrl: hero.sourceUrl };
  }
  const completed = nextHub.templates.filter(entry => entry.demoSite?.siteStructure?.status === 'standalone').length;
  nextHub.scope.standaloneSitesVerified = completed;
  nextHub.scope.contentPlan = 'Native Showtimes homepage plus local Films, Food & Drink, Private Events, Membership, Visit & Contact and Events Pages. Library packaging remains deferred.';
  nextHub.notice = completed === 9
    ? 'Nine complete cinema demos with distinct palettes and local supporting pages. Showtimes are display-only. Library packaging remains deferred.'
    : `Nine live cinema demos; ${completed} ${completed === 1 ? 'has' : 'have'} completed standalone-page review. Showtimes are display-only. Library packaging remains deferred.`;
  updated.generatedAt = qa.checkedAt;
  const note = `${template.displayName}: reviewed standalone source Pages replace stacked-homepage references. Evidence: ${base}/verification.json.`;
  updated.captureNotes ??= [];
  if (!updated.captureNotes.includes(note)) updated.captureNotes.push(note);
  return { catalog: updated, hub: nextHub, files, promoted };
}

async function main() {
  const args = process.argv.slice(2), check = args.includes('--check');
  const paths = args.filter(arg => !arg.startsWith('--'));
  if (paths.length !== 1 || args.some(arg => arg.startsWith('--') && arg !== '--check')) throw new Error('Usage: node scripts/refresh-standalone-catalog.mjs path/to/catalog-refresh.json [--check]');
  const manifestPath = resolve(paths[0]), manifestRoot = dirname(manifestPath);
  const load = async path => JSON.parse(await readFile(path, 'utf8'));
  const manifest = await load(manifestPath);
  const required = ['publicMap', 'nativeRecord', 'captures', 'qa', 'pageCss', 'themeCss'];
  if (required.some(field => typeof manifest[field] !== 'string' || !manifest[field])) throw new Error('Manifest must name map, native record, captures, QA, saved Page CSS and Theme CSS.');
  const overridePaths = manifest.pageCssByRole ?? {};
  if (!overridePaths || typeof overridePaths !== 'object' || Array.isArray(overridePaths)
    || Object.entries(overridePaths).some(([role, path]) => !Object.hasOwn(STANDALONE_ROUTES, role) || typeof path !== 'string' || !path)) {
    throw new Error('Manifest Page CSS overrides must map known Page roles to saved CSS file paths.');
  }
  const [catalog, hub, map, native, captures, qa, pageCss, themeCss] = await Promise.all([
    load(join(root, 'catalog.json')), load(join(root, 'data/template-hub.json')),
    ...['publicMap', 'nativeRecord', 'captures', 'qa'].map(field => load(resolve(manifestRoot, manifest[field]))),
    ...['pageCss', 'themeCss'].map(field => readFile(resolve(manifestRoot, manifest[field]), 'utf8')),
  ]);
  const assetRoot = dirname(resolve(manifestRoot, manifest.captures));
  const pageCssByRole = Object.fromEntries(await Promise.all(Object.entries(overridePaths)
    .map(async ([role, path]) => [role, await readFile(resolve(manifestRoot, path), 'utf8')])));
  const result = await prepareStandaloneRefresh(catalog, hub, { manifest, map, native, captures, qa, pageCss, themeCss, pageCssByRole }, {
    readAsset: async filename => {
      const path = resolve(assetRoot, filename), inside = relative(assetRoot, path);
      if (!inside || isAbsolute(inside) || inside.startsWith(`..${sep}`) || inside === '..' || resolve(path) === assetRoot) throw new Error('Capture assets must be inside the capture manifest folder.');
      return readFile(path);
    },
  });
  if (!check) {
    for (const [filename, bytes] of result.files) { const path = join(root, filename); await mkdir(dirname(path), { recursive: true }); await writeFile(path, bytes); }
    await writeFile(join(root, 'catalog.json'), `${JSON.stringify(result.catalog, null, 2)}\n`);
    await writeFile(join(root, 'data/template-hub.json'), `${JSON.stringify(result.hub, null, 2)}\n`);
  }
  console.log(`${check ? 'Validated without writing' : 'Promoted'} ${result.promoted.length} standalone source choices. ${check ? '' : 'Run node scripts/build-module-index.mjs and node --test next.'}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
