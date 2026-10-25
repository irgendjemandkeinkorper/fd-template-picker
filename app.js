import { SUPPORTED_SCHEMAS, PINNED, MOVIE_COMPONENTS, componentForOption, buildCoverage, createModel, libraryPlan, buildExport as exportSelection, buildHandoff } from './model.mjs';

const STORAGE_KEY = 'fd-template-picker:selection';
const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};
const link = (label, href, className = '') => el('a', { textContent: label, href, className, target: '_blank', rel: 'noopener noreferrer' });
const encodeState = (s) => btoa(Array.from(new TextEncoder().encode(JSON.stringify(s)), (c) => String.fromCharCode(c)).join(''));
const decodeState = (s) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0))));

let catalog, model;
try {
  const response = await fetch('catalog.json');
  if (!response.ok) throw new Error(`Catalog returned ${response.status}`);
  catalog = await response.json();
  model = createModel(catalog);
} catch (error) {
  $('slots').replaceChildren(el('div', { className: 'empty', textContent: `The template catalog could not load. Refresh the page to try again. ${error.message}` }));
  throw error;
}
const { variants, capturedVariants, slotById, optionForVariant, applyVariant, defaultState, normalize } = model;
const coverage = buildCoverage(catalog);
const coverageLabels = { captured: 'Captured', 'partial-source': 'Partial source', 'missing-source': 'Missing source', 'needs-audit': 'Needs audit', 'capture-pending': 'Capture pending', 'partial-capture': 'Partial capture', 'not-visible': 'Not visible' };
const groupForSlot = (slot) => MOVIE_COMPONENTS.has(slot.id) ? 'movies' : slot.options.some((option) => componentForOption(slot, option)) ? 'required' : 'additional';
function retiredChoices(raw) {
  const picks = Array.isArray(raw?.sections) ? Object.fromEntries(raw.sections.filter(Boolean).map((s) => [s.slot, s.optionId])) : raw?.picks ?? {};
  return Object.entries(picks).filter(([id, pick]) => !slotById.get(id)?.options.some((o) => o.id === pick)).length;
}
let restoreMessage = '';

function loadInitial() {
  try {
    if (location.hash.startsWith('#s=')) {
      const raw = decodeState(location.hash.slice(3));
      const result = normalize(raw);
      if (retiredChoices(raw)) restoreMessage = 'Some saved styles have changed. Review the current selection before handing it off.';
      history.replaceState(null, '', location.pathname + location.search);
      return result;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const raw = JSON.parse(stored);
      if (retiredChoices(raw)) restoreMessage = 'Some saved styles have changed. Review the current selection before handing it off.';
      return normalize(raw);
    }
  } catch (error) { console.warn('Could not restore selection', error); }
  return defaultState();
}
let state = loadInitial();
let savedTimer, toastTimer;
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $('saved').textContent = 'Saved in this browser';
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => ($('saved').textContent = ''), 1800);
  } catch { $('saved').textContent = 'Browser storage unavailable'; }
}
function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3200);
}
const pickedOption = (slotId) => model.pickedOption(state, slotId);
function commit(slotId, focus) {
  focus ??= document.activeElement?.dataset?.act;
  save(); render();
  if (slotId && focus) [...document.querySelectorAll('[data-slot]')].find((node) => node.dataset.slot === slotId)?.querySelector(`[data-act="${focus}"]`)?.focus();
}
function cycle(slotId, step) {
  const { options } = slotById.get(slotId);
  const i = options.findIndex((o) => o.id === state.picks[slotId]);
  state.picks[slotId] = options[(i + step + options.length) % options.length].id;
  commit(slotId);
}
function move(slotId, step) {
  const i = state.order.indexOf(slotId), j = i + step;
  if (PINNED.has(slotId) || PINNED.has(state.order[j]) || j < 0 || j >= state.order.length) return;
  [state.order[i], state.order[j]] = [state.order[j], state.order[i]];
  commit(slotId, step < 0 ? 'up' : 'down');
}
function chooseVariant(id) {
  applyVariant(state, id);
  $('filterGroup').value = 'required'; $('filterSection').value = ''; $('filterText').value = '';
  commit();
  toast(`Started from ${variants.find((v) => v.id === id)?.label}. Mix individual sections below.`);
}
function screenshot(option, className = '') {
  if (option.captureStatus === 'not-rendered') return el('div', { className: 'image-missing', textContent: 'No visible content on the published source page. This section currently renders at zero height.' });
  if (!option.image) return el('div', { className: 'image-missing', textContent: 'Screenshot pending' });
  const img = el('img', { src: option.image, alt: option.name, width: option.width, height: option.height, loading: 'lazy', className: `${className}${option.presentation?.kind === 'sidebar' ? ' sidebar-reference' : ''}`.trim() });
  img.onerror = () => { img.replaceWith(el('div', { className: 'image-missing', textContent: 'Screenshot unavailable — open the source page to view this style.' })); };
  return img;
}
function captureDescription(option) {
  if (option.captureStatus === 'not-rendered') return 'Not visibly rendered on source';
  if (option.captureStatus === 'partial' || option.capture?.mode === 'partial') return 'Partial capture · some areas pending';
  if (option.capture?.mode === 'live') return 'Live page capture';
  if (option.capture?.mode === 'illustrative') return 'Illustrative capture · adjusted from the live page';
  return 'Capture details pending';
}
function renderSource(slot, option) {
  const plan = libraryPlan(slot, option);
  const details = el('details', { className: 'source-details' }, el('summary', { textContent: 'Source & reuse details' }));
  const content = el('div', { className: 'source-details__content' },
    link('Open source page ↗', option.sourceUrl),
    el('span', { className: 'badge', textContent: captureDescription(option) }),
    el('span', { className: 'badge', textContent: plan.status === 'verified' ? 'Library transfer verified' : 'Library transfer pending' }),
    el('p', { textContent: `INDY components: ${option.components.join(' + ')}` }),
    el('p', { textContent: plan.proposedPageTitle ? `Proposed carrier page: ${plan.proposedPageTitle}` : 'Site-level settings' }),
    el('p', { textContent: plan.notes }),
    el('p', { textContent: plan.importPolicy }),
    el('p', { textContent: `Dependency review: ${plan.dependenciesStatus}` }),
  );
  if (option.componentStatus === 'partial') content.append(el('p', { className: 'capture-note', textContent: `Partial required component: ${option.componentNote || 'This section only covers part of the required purpose.'}` }));
  if (option.designNote) content.append(el('p', { className: 'capture-note', textContent: option.designNote }));
  if (option.adminUrl) content.append(link('Open in INDY Admin ↗', option.adminUrl));
  if (option.capture?.notes?.length) content.append(el('p', { className: 'capture-note', textContent: option.capture.notes.join(' ') }));
  if (plan.dependencies.length) content.append(el('p', { textContent: `Depends on: ${plan.dependencies.join('; ')}` }));
  details.append(content);
  return details;
}

function renderSlot(slotId) {
  const slot = slotById.get(slotId), option = pickedOption(slotId);
  const index = slot.options.indexOf(option), off = Boolean(state.excluded[slotId]), single = slot.options.length < 2;
  const position = state.order.indexOf(slotId), pinned = PINNED.has(slotId);
  const iconBtn = (act, text, label, onclick, props = {}) => {
    const button = el('button', { type: 'button', className: 'icon-btn', textContent: text, title: label, onclick, ...props });
    button.dataset.act = act;
    button.setAttribute('aria-label', `${label}: ${slot.label}`);
    return button;
  };
  const toggle = iconBtn('toggle', off ? 'Add back' : 'Remove', off ? 'Add section back' : 'Leave section out', () => {
    if (off) delete state.excluded[slotId]; else state.excluded[slotId] = true;
    commit(slotId);
  });
  const bar = el('div', { className: 'slot__bar' },
    el('span', { className: 'slot__label', textContent: slot.label }),
    el('span', { className: 'slot__name' }, el('strong', { textContent: option.variantLabel }), ` · ${option.name}`),
    el('div', { className: 'slot__tools' },
      iconBtn('browse', 'Browse styles', 'Browse all styles', () => openGallery(slotId)),
      iconBtn('prev', '‹', 'Previous style', () => cycle(slotId, -1), { disabled: single || off }),
      el('span', { className: 'slot__count', textContent: `${index + 1} / ${slot.options.length}` }),
      iconBtn('next', '›', 'Next style', () => cycle(slotId, 1), { disabled: single || off }),
      iconBtn('up', '↑', 'Move up', () => move(slotId, -1), { disabled: pinned || position < 1 || PINNED.has(state.order[position - 1]) }),
      iconBtn('down', '↓', 'Move down', () => move(slotId, 1), { disabled: pinned || position >= state.order.length - 1 || PINNED.has(state.order[position + 1]) }), toggle,
    ),
  );
  const stage = el('div', { className: 'slot__stage' }, screenshot(option));
  const note = el('textarea', { className: 'slot__note', rows: 1,
    placeholder: `Notes about the ${slot.label.toLowerCase()} (optional)`, value: state.slotNotes[slotId] ?? '',
    oninput: (event) => { if (event.target.value.trim()) state.slotNotes[slotId] = event.target.value; else delete state.slotNotes[slotId]; save(); },
  });
  note.setAttribute('aria-label', `Note about ${slot.label}`);
  const section = el('section', { className: `slot${off ? ' slot--off' : ''}${option.captureStatus === 'not-rendered' ? ' slot--not-rendered' : ''}` }, bar, stage, renderSource(slot, option), note);
  if (option.componentStatus === 'partial') stage.before(el('p', { className: 'slot__warning capture-note', textContent: `Partial source: ${option.componentNote || 'Needs more content to meet the required component purpose.'}` }));
  section.dataset.slot = slotId;
  if (option.presentation?.kind === 'sidebar') section.style.setProperty('--sidebar-width', `${option.presentation.width}px`);
  section.setAttribute('aria-label', slot.label);
  section.addEventListener('keydown', (event) => {
    if (['TEXTAREA', 'INPUT', 'SELECT'].includes(event.target.tagName) || single || off) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); cycle(slotId, event.key === 'ArrowLeft' ? -1 : 1); }
  });
  return section;
}

let gallerySlot;
function openGallery(slotId) {
  gallerySlot = slotId;
  $('galleryTitle').textContent = `${slotById.get(slotId).label} styles`;
  $('galleryVariant').value = '';
  renderGallery();
  $('gallery').showModal();
}
function renderGallery() {
  const slot = slotById.get(gallerySlot), filter = $('galleryVariant').value;
  const options = slot.options.filter((o) => !filter || (o.sharedBy ?? [o.variant]).includes(filter));
  $('galleryCards').replaceChildren(...options.map((option) => {
    const selected = state.picks[slot.id] === option.id;
    const button = el('button', { type: 'button', className: `btn ${selected ? '' : 'btn--primary'}`, textContent: selected ? 'Selected' : 'Use this style', onclick: () => {
      state.picks[slot.id] = option.id; delete state.excluded[slot.id];
      $('gallery').close(); commit(slot.id, 'browse');
    } });
    button.setAttribute('aria-pressed', String(selected));
    return el('article', { className: `style-card${selected ? ' style-card--selected' : ''}` },
      el('div', { className: 'style-card__image' }, screenshot(option)),
      el('div', { className: 'style-card__body' }, el('h3', { textContent: option.variantLabel }),
        el('p', { textContent: option.name }), el('p', { className: 'muted', textContent: captureDescription(option) }),
        ...(option.componentStatus === 'partial' ? [el('p', { className: 'capture-note', textContent: `Partial source: ${option.componentNote || 'Needs more content to meet the required component purpose.'}` })] : []),
        ...(option.designNote ? [el('p', { className: 'capture-note', textContent: option.designNote })] : []),
        el('div', { className: 'card-actions' }, button, link('View source ↗', option.sourceUrl))),
    );
  }));
  if (!options.length) $('galleryCards').append(el('p', { className: 'empty', textContent: 'No captured style for this variant in this section yet.' }));
}

function renderVariants() {
  $('variantCards').replaceChildren(...variants.map((variant) => {
    const available = catalog.slots.filter((s) => optionForVariant(s, variant.id));
    const options = available.map((s) => optionForVariant(s, variant.id));
    const images = options.filter((o) => o.image).length;
    const partial = options.filter((o) => o.captureStatus === 'partial').length;
    const heroSlot = slotById.get('hero');
    const hero = heroSlot ? optionForVariant(heroSlot, variant.id) : undefined;
    const body = el('div', { className: 'variant-card__body' },
      el('h3', { textContent: variant.label }),
      el('p', { className: 'muted', textContent: `${images} screenshots · ${available.length} section choices${partial ? ` · ${partial} partial` : ''}` }),
    );
    const row = coverage.rows.find((entry) => entry.variant === variant.id);
    if (row) {
      body.append(el('p', { className: `variant-coverage${row.complete ? ' variant-coverage--complete' : ''}`, textContent: `${row.captured}/${row.total} required component styles captured` }));
      const pending = row.components.filter((component) => component.status !== 'captured');
      if (pending.length) body.append(el('p', { className: 'muted', textContent: `To complete: ${pending.map((component) => `${component.label} (${coverageLabels[component.status].toLowerCase()})`).join('; ')}.` }));
    }
    if (variant.sectionCount) body.append(el('p', { className: 'muted', textContent: `${variant.sectionCount} configured page sections in INDY; screenshots also include the header and footer.` }));
    const actions = el('div', { className: 'card-actions' });
    actions.append(el('button', { type: 'button', className: 'btn btn--small', textContent: available.length ? 'Start with this variant' : 'Capture pending', disabled: !available.length, onclick: () => { chooseVariant(variant.id); $('variantLibrary').open = false; } }));
    if (variant.sourceUrl) actions.append(link('Live page ↗', variant.sourceUrl));
    body.append(actions);
    const card = el('article', { className: 'variant-card' });
    if (hero) card.append(el('div', { className: 'variant-card__image' }, screenshot(hero)));
    else card.append(el('div', { className: 'variant-card__image image-missing', textContent: 'Page inventoried · screenshot pending' }));
    card.append(body); return card;
  }));
}

function renderCoverage() {
  $('coverageCount').textContent = `${coverage.captured}/${coverage.total} captured`;
  $('coverageSummary').textContent = `${coverage.completeVariants} of ${coverage.rows.length} variants have all six required component styles captured. Navigation, hero, food, private parties, membership and contact form the shared baseline. Now Playing, Coming Soon and Ticket Finder are tracked separately.`;
  const header = el('tr', {}, el('th', { scope: 'col', textContent: 'Variant' }), ...coverage.required.map((component) => el('th', { scope: 'col', textContent: component.label })));
  const rows = coverage.rows.map((row) => el('tr', {}, el('th', { scope: 'row', textContent: row.label }), ...row.components.map((component) => {
    const label = coverageLabels[component.status];
    const cell = el('td', { className: `coverage-cell coverage-cell--${component.status}` });
    if (component.optionId) {
      const button = el('button', { type: 'button', textContent: label, title: component.notes || `${row.label}: ${component.label}`, onclick: () => { openGallery(component.slotId); $('galleryVariant').value = row.variant; renderGallery(); } });
      button.setAttribute('aria-label', `${row.label}, ${component.label}: ${label}. Browse source style.`);
      cell.append(button);
    } else cell.append(el('span', { textContent: label, title: component.notes }));
    return cell;
  })));
  $('coverageTable').replaceChildren(el('thead', {}, header), el('tbody', {}, ...rows));
}

function render() {
  const groupFilter = $('filterGroup').value, sectionFilter = $('filterSection').value, query = $('filterText').value.toLowerCase().trim();
  const order = state.order.filter((id) => {
    if (document.body.classList.contains('preview')) return true;
    const slot = slotById.get(id), option = pickedOption(id);
    return (!groupFilter || groupForSlot(slot) === groupFilter) && (!sectionFilter || id === sectionFilter) && (!query || `${slot.label} ${option.variantLabel} ${option.name}`.toLowerCase().includes(query));
  });
  $('slots').replaceChildren(...order.map(renderSlot));
  const header = slotById.has('header') ? pickedOption('header') : null;
  const sidebar = document.body.classList.contains('preview') && !state.excluded.header && header?.presentation?.kind === 'sidebar';
  $('slots').classList.toggle('slots--sidebar', Boolean(sidebar));
  $('slots').style.removeProperty('grid-template-rows');
  if (sidebar) {
    const rows = state.order.filter((id) => id !== 'header' && !state.excluded[id] && pickedOption(id).captureStatus !== 'not-rendered').length;
    $('slots').style.setProperty('--sidebar-ratio', `${100 * header.presentation.width / header.presentation.canvasWidth}%`);
    $('slots').style.setProperty('--sidebar-rows', Math.max(1, rows));
    $('slots').style.gridTemplateRows = `repeat(${Math.max(1, rows)}, auto)`;
  }
  if (!order.length) $('slots').append(el('p', { className: 'empty', textContent: 'No sections match. Clear the filters to return to your page.' }));
  const included = state.order.filter((id) => !state.excluded[id]);
  const common = capturedVariants.filter((v) => included.length && included.every((id) => (pickedOption(id).sharedBy ?? [pickedOption(id).variant]).includes(v.id)));
  $('summary').textContent = `${included.length} of ${state.order.length} sections included · ${common.length ? common[0].label : 'Mixed variants'}`;
  $('presetSelect').value = common[0]?.id ?? '';
  $('shownCount').textContent = `${order.length} sections shown`;
}

function buildExport() {
  const result = exportSelection(catalog, state, location.href);
  result.pickerUrl = `${location.origin}${location.pathname}#s=${encodeState(state)}`;
  return result;
}
function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  el('a', { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const projectSlug = () => state.project.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'site';

for (const variant of capturedVariants) $('presetSelect').append(el('option', { value: variant.id, textContent: variant.label }));
for (const variant of variants) $('galleryVariant').append(el('option', { value: variant.id, textContent: variant.label }));
for (const slot of catalog.slots) $('filterSection').append(el('option', { value: slot.id, textContent: slot.label }));
$('presetSelect').onchange = (event) => { if (event.target.value) chooseVariant(event.target.value); };
$('galleryVariant').onchange = renderGallery;
$('galleryClose').onclick = () => $('gallery').close();
$('gallery').addEventListener('click', (event) => { if (event.target === $('gallery')) $('gallery').close(); });
$('filterSection').onchange = () => { const slot = slotById.get($('filterSection').value); if (slot) $('filterGroup').value = groupForSlot(slot); render(); };
$('filterGroup').onchange = () => { $('filterSection').value = ''; render(); };
$('filterText').oninput = render;
$('btnShuffle').onclick = () => {
  for (const slot of catalog.slots) state.picks[slot.id] = slot.options[Math.floor(Math.random() * slot.options.length)].id;
  commit();
};
$('project').value = state.project;
$('project').oninput = (event) => { state.project = event.target.value; save(); };
$('notes').value = state.notes;
$('notes').oninput = (event) => { state.notes = event.target.value; save(); };
function setPreview(on) {
  document.body.classList.toggle('preview', on);
  $('btnPreview').setAttribute('aria-pressed', String(on));
  render(); window.scrollTo(0, 0);
}
$('btnPreview').onclick = () => setPreview(true);
$('btnExitPreview').onclick = () => setPreview(false);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && document.body.classList.contains('preview')) setPreview(false); });
$('btnExport').onclick = () => { download(`${JSON.stringify(buildExport(), null, 2)}\n`, `${projectSlug()}-template-selection.json`, 'application/json'); toast('Selection and source details exported'); };
$('btnHandoff').onclick = () => { download(buildHandoff(buildExport()), `${projectSlug()}-template-handoff.md`, 'text/markdown'); toast('Designer handoff exported'); };
$('btnShare').onclick = async () => {
  const shareUrl = buildExport().pickerUrl;
  try { await navigator.clipboard.writeText(shareUrl); toast('Selection link copied'); }
  catch { prompt('Copy this selection link:', shareUrl); }
};
$('btnImport').onclick = () => $('fileImport').click();
$('fileImport').onchange = async (event) => {
  const [file] = event.target.files; event.target.value = ''; if (!file) return;
  try {
    if (file.size > 2_000_000) throw new Error('Choose a selection file smaller than 2 MB');
    const raw = JSON.parse(await file.text());
    if (!SUPPORTED_SCHEMAS.has(raw.schema) || !Array.isArray(raw.sections)) throw new Error('Choose a template picker export');
    state = normalize(raw);
    $('project').value = state.project; $('notes').value = state.notes;
    commit(); toast(retiredChoices(raw) ? 'Imported with changed styles. Review the current selection before handing it off.' : 'Selection imported');
  } catch (error) { toast(`Import failed: ${error.message}`); }
};

$('catalogCount').textContent = `${variants.length} variants · ${catalog.slots.reduce((n, s) => n + s.options.length, 0)} section choices`;
$('catalogContext').textContent = catalog.sourceSite ? `${catalog.sourceSite.region} / ${catalog.sourceSite.circuit} / ${catalog.sourceSite.site}` : 'Adam Template Testing 2';
$('captureNotes').replaceChildren(...(catalog.captureNotes ?? []).map((text) => el('p', { textContent: text })));
renderCoverage(); renderVariants(); render();
if (restoreMessage) toast(restoreMessage);
