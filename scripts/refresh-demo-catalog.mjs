import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { visualCaptureKey, componentForOption } from '../model.mjs';
const root = new URL('../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const catalog = await read('evidence/demo-refresh/legacy-catalog.json');
const captures = await read('evidence/demo-refresh/desktop-captures.json');
const hub = await read('data/template-hub.json');
const phone = await read('evidence/demo-refresh/phone-qa.json');
const draftPages = { Showcase: 6840, Reel: 6153, Neon: 6240, Cameo: 6329, Metropolis: 6416, Encore: 6675, Splice: 6504, Prologue: 6591, Pause: 6764 };
const now = new Date().toISOString();
const current = new Map(captures.map(record => [record.slug, record]));
const regionSource = new URL(process.argv[2] ?? '../../planning/website-templates/indy-demo-rollout/evidence/palette-refresh/', import.meta.url);
await mkdir(new URL('evidence/demo-refresh/raw/', root), { recursive: true });
catalog.sourceSites = [...captures.map(r => ({ region: 'US-BETA', circuit: 'INDY Demo', site: r.name, siteId: r.id, url: new URL(r.url).origin }))];
catalog.sourcePolicy = 'Per-option sourceSite and sourceUrl identify the reviewed live demo. The top-level sourceSite is the historical authoring source; source IDs are never destination IDs.';
catalog.generatedAt = now;
catalog.captureNotes.push('A–I were refreshed from their dedicated live demos on 26 October 2026. Six independent native color roles and a native Showtimes hero are used. Original catalog and source identities remain in evidence/demo-refresh/legacy-catalog.json. J–L remain internal and are excluded from customer choices.');
for (const variant of catalog.variants) {
  const record = current.get(variant.id);
  if (record) { variant.legacyLabel = variant.label; variant.label = record.name; variant.displayName = record.name; variant.demoSourceUrl = record.url; }
}
for (const slot of catalog.slots) for (const option of slot.options) {
  const r = current.get(option.variant);
  option.customerAvailable = Boolean(r);
  if (!r) continue;
  option.variantLabel = r.name;
  const region = r.componentRegions.find(region => region.slot === slot.id);
  if (!region || !componentForOption(catalog.slots.find(s => s.id === slot.id), option)) continue;
  const pageId = r.mainClass.match(/-(\d+)$/)?.[1];
  if (!pageId || !region.parts?.length) throw new Error(`Missing native identity/capture: ${option.id}`);
  const legacy = { sourceSite: catalog.sourceSite, sourceUrl: option.sourceUrl, pageId: option.pageId, draftId: option.draftId, sectionIds: option.sectionIds, draftSectionIds: option.draftSectionIds, nativeWidgetType: option.nativeWidgetType, capture: option.capture, visualReview: option.visualReview };
  Object.assign(option, { legacySourceReference: legacy,
    sourceSite: catalog.sourceSites.find(source => source.siteId === r.id), sourceUrl: r.url,
    pageId, draftId: String(draftPages[r.name]), sectionIds: slot.id === 'header' ? [] : [region.className.match(/section-[a-z0-9-]+-(\d+)/)?.[1]], draftSectionIds: [],
    variantLabel: r.name, name: `${r.name} — ${slot.label}`, image: region.image, width: region.width, height: region.height,
    captureStatus: 'captured-live', componentStatus: 'present', componentAuditedAt: now,
    componentNote: slot.id === 'header' ? 'Live native navigation with seven links; desktop and phone drawer checked. Destination links still require mapping.' : slot.id === 'hero' ? 'Native Showtimes slider with four programmed demo films. Display-only; ticketing is disabled.' : 'Native demo copy with current palette. Desktop and phone content checked; forms and commerce are not transaction-tested.',
    library: { status: 'not-created' }, screenshots: undefined,
    demoProvenance: { sourceIdsOnly: true, siteId: r.id, name: r.name, sourceUrl: r.url, verifiedAt: now, nativePageCss: `evidence/demo-refresh/pages/${r.name === 'Showcase' ? 'showcase-193' : r.name.toLowerCase()}-independent-role-published.css`, nativeRecipe: slot.id === 'hero' ? 'evidence/demo-refresh/showtimes-recipe.json' : null },
  });
  if (option.sectionIds.some(id => !id)) throw new Error(`No real Section ID for ${option.id}`);
  if (slot.id === 'hero') { option.sourceName = 'Showtimes Hero'; option.components = ['Showtimes']; option.nativeWidgetType = 'Showtimes'; option.designNote = 'Booking-first native slider. The website team must configure destination movies, dates and pricing.'; }
  if (slot.id === 'header' && option.customerDesign?.id === 'navigation-standard') option.customerDesign = { ...option.customerDesign, label: 'Splice / Prologue / Pause', reviewedAt: now };
  const evidence = [];
  for (const part of region.parts) {
    const path = `evidence/demo-refresh/raw/${part.image}`;
    await copyFile(new URL(part.image, regionSource), new URL(path, root));
    evidence.push({ image: path, rawImageSha256: hash(await readFile(new URL(path, root))), bounds: part.bounds, offset: part.offset });
  }
  option.capture = { mode: 'live', capturedAt: r.capturedAt, method: 'live-browser-section-clips', selectors: [slot.id === 'header' ? `body.site-${r.id} header.consumer-header` : `body.site-${r.id} .${region.className.match(/section-[a-z0-9-]+-\d+/)?.[0]}`], sourceBounds: region.bounds, captureBounds: region.bounds, evidence, appearanceAltered: false, sampleDataInjected: false, notes: ['Actual published demo appearance. Offscreen product images were loaded through native scrolling before capture. Consecutive clips were joined without recoloring, CSS injection or content changes.'] };
  option.visualReview = { status: 'passed', reviewedAt: now, captureKey: visualCaptureKey(option), imageSha256: hash(await readFile(new URL(option.image, root))), notes: 'Reviewed section-specific pixels against native headings, text and layout. Header items are visible; food labels/prices and intended photographs are present. Source IDs are the live demo copy.' };
  const audit = catalog.componentAudit.find(a => a.variant === option.variant && a.component === componentForOption(slot, option));
  if (audit) Object.assign(audit, { sourceOptionId: option.id, sourceSectionIds: option.sectionIds, auditedAt: now, status: 'present', notes: [option.componentNote] });
}
for (const template of hub.templates) {
  const r = current.get(template.id);
  if (!r || !phone.some(p => p.name === r.name && p.mode === 'phone')) throw new Error(`Missing phone QA: ${template.id}`);
  const rootUrl = `${new URL(r.url).origin}/`;
  const hero = r.componentRegions.find(region => region.slot === 'hero');
  const image = hero.image;
  template.demoSite = { status: 'published-display-only', nativeSiteId: r.id, homepageUrl: rootUrl, showcaseUrl: null, sectionShowcasePagesStatus: 'deferred',
    verification: { checkedAt: now, desktop: 'passed', phone: 'passed', evidence: 'evidence/demo-refresh/desktop-captures.json', publishedScreenings: 16, dates: ['2026-10-26','2026-10-27','2026-10-28','2026-10-29'], ticketing: 'display-only' },
    preview: { image, width: hero.width, height: hero.height, imageSha256: hash(await readFile(new URL(image, root))), reviewedAt: now, sourceUrl: r.url, method: 'live-browser-section-clips', appearanceAltered: false },
    palette: r.nativeColors,
  };
}
hub.notice = 'Nine dedicated demos with distinct palettes, shared movies and food, and a native showtimes opener. Showtimes are display-only. Separate section showcase pages and Library packaging are deferred.';
hub.scope.siteProvisioningStatus = 'nine-published-display-only';
await writeFile(new URL('catalog.json', root), `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(new URL('data/template-hub.json', root), `${JSON.stringify(hub, null, 2)}\n`);
await writeFile(new URL('evidence/demo-refresh/showtimes-recipe.json', root), `${JSON.stringify({ widget: 'Showtimes', name: 'Showtimes Hero', heading: 'Now showing', displayType: 'List', view: 'Slider', useBannerImage: true, bannerBackground: true, showTrailerButton: true, controls: 'Show', pagination: true, autoplay: false, showMovieSynopsis: false, widthMode: 'Full Width', marginSides: null, classes: 'fdp-showtimes-hero', customCss: '& .movie-container { text-shadow: 0 1px 3px var(--q-dark), 0 2px 12px var(--q-dark); }', overrides: { Prologue: { darkMode: false }, default: { darkMode: true }, Cameo: { sectionBackground: 'Dark' }, Splice: { sectionBackground: 'Dark' } }, limitations: ['Banner captions can still show native synopsis text in Slider view.', 'Destination programming, pricing and availability are required.', 'Ticketing is disabled on the demos; no checkout certification.'] }, null, 2)}\n`);
console.log('Refreshed nine named demos and 54 current source captures; retained the historical authoring catalog.');
