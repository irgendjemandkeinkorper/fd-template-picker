const SCHEMA = 'fd-template-picker/v1';
const STORAGE_KEY = 'fd-template-picker:selection';
// Header and footer stay pinned to the ends; everything between can be reordered.
const PINNED = new Set(['header', 'footer']);

const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};

const catalog = await (await fetch('catalog.json')).json();
const slotById = new Map(catalog.slots.map((s) => [s.id, s]));
const variants = [];
for (const slot of catalog.slots) {
  for (const o of slot.options) {
    if (o.sharedBy.length === 1 && !variants.some((v) => v.id === o.variant)) {
      variants.push({ id: o.variant, label: o.variantLabel });
    }
  }
}

function defaultState(variantId = variants[0]?.id) {
  const state = { project: '', notes: '', order: catalog.slots.map((s) => s.id), picks: {}, excluded: {}, slotNotes: {} };
  for (const slot of catalog.slots) state.picks[slot.id] = optionForVariant(slot, variantId).id;
  return state;
}

function optionForVariant(slot, variantId) {
  return slot.options.find((o) => o.sharedBy.includes(variantId)) ?? slot.options[0];
}

// Accepts anything shaped like a saved state or an exported file and repairs it
// against the current catalog, so old links keep working after a re-capture.
function normalize(raw) {
  const state = defaultState();
  if (!raw || typeof raw !== 'object') return state;
  if (Array.isArray(raw.sections)) {
    raw = {
      project: raw.project,
      notes: raw.notes,
      order: raw.sections.map((s) => s.slot),
      picks: Object.fromEntries(raw.sections.map((s) => [s.slot, s.optionId])),
      excluded: Object.fromEntries(raw.sections.filter((s) => s.included === false).map((s) => [s.slot, true])),
      slotNotes: Object.fromEntries(raw.sections.filter((s) => s.note).map((s) => [s.slot, s.note])),
    };
  }
  state.project = String(raw.project ?? '');
  state.notes = String(raw.notes ?? '');
  const order = (Array.isArray(raw.order) ? raw.order : []).filter((id, i, a) => slotById.has(id) && a.indexOf(id) === i);
  const middle = [...order, ...state.order.filter((id) => !order.includes(id))].filter((id) => !PINNED.has(id));
  state.order = ['header', ...middle, 'footer'].filter((id) => slotById.has(id));
  for (const slot of catalog.slots) {
    const picked = raw.picks?.[slot.id];
    if (slot.options.some((o) => o.id === picked)) state.picks[slot.id] = picked;
    if (raw.excluded?.[slot.id]) state.excluded[slot.id] = true;
    if (raw.slotNotes?.[slot.id]) state.slotNotes[slot.id] = String(raw.slotNotes[slot.id]);
  }
  return state;
}

const encodeState = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(s))));
const decodeState = (s) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0))));

function loadInitial() {
  try {
    if (location.hash.startsWith('#s=')) {
      const state = normalize(decodeState(location.hash.slice(3)));
      history.replaceState(null, '', location.pathname + location.search);
      return state;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return normalize(JSON.parse(stored));
  } catch (err) {
    console.warn('Could not restore selection', err);
  }
  return defaultState();
}

let state = loadInitial();

let savedTimer;
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $('saved').textContent = 'Saved';
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => ($('saved').textContent = ''), 1500);
  } catch {
    $('saved').textContent = 'Not saved (storage blocked)';
  }
}

let toastTimer;
function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2200);
}

const pickedOption = (slotId) => slotById.get(slotId).options.find((o) => o.id === state.picks[slotId]);

function cycle(slotId, step) {
  const { options } = slotById.get(slotId);
  const i = options.findIndex((o) => o.id === state.picks[slotId]);
  state.picks[slotId] = options[(i + step + options.length) % options.length].id;
  commit(slotId);
}

function move(slotId, step) {
  const i = state.order.indexOf(slotId);
  const j = i + step;
  if (PINNED.has(slotId) || PINNED.has(state.order[j]) || j < 0 || j >= state.order.length) return;
  [state.order[i], state.order[j]] = [state.order[j], state.order[i]];
  commit(slotId, step < 0 ? 'up' : 'down');
}

// Re-render, then put keyboard focus back on the control that was used.
function commit(slotId, focus) {
  focus ??= document.activeElement?.dataset?.act;
  save();
  render();
  if (slotId && focus) document.querySelector(`[data-slot="${slotId}"] [data-act="${focus}"]`)?.focus();
}

function renderSlot(slotId) {
  const slot = slotById.get(slotId);
  const option = pickedOption(slotId);
  const index = slot.options.indexOf(option);
  const off = Boolean(state.excluded[slotId]);
  const single = slot.options.length < 2;
  const position = state.order.indexOf(slotId);
  const pinned = PINNED.has(slotId);

  const iconBtn = (act, text, label, onclick, props = {}) => {
    const b = el('button', { type: 'button', className: 'icon-btn', textContent: text, title: label, onclick, ...props });
    b.dataset.act = act;
    b.setAttribute('aria-label', `${label}: ${slot.label}`);
    return b;
  };

  const toggle = iconBtn('toggle', off ? 'Add back' : 'Remove', off ? 'Add section back' : 'Leave section out', () => {
    if (off) delete state.excluded[slotId];
    else state.excluded[slotId] = true;
    commit(slotId);
  });

  const bar = el(
    'div',
    { className: 'slot__bar' },
    el('span', { className: 'slot__label', textContent: slot.label }),
    el('span', { className: 'slot__name' }, el('strong', { textContent: option.name }), ` · ${option.variantLabel}`),
    el(
      'div',
      { className: 'slot__tools' },
      iconBtn('prev', '‹', 'Previous style', () => cycle(slotId, -1), { disabled: single || off }),
      el('span', { className: 'slot__count', textContent: `${index + 1} / ${slot.options.length}` }),
      iconBtn('next', '›', 'Next style', () => cycle(slotId, 1), { disabled: single || off }),
      iconBtn('up', '↑', 'Move up', () => move(slotId, -1), { disabled: pinned || PINNED.has(state.order[position - 1]) }),
      iconBtn('down', '↓', 'Move down', () => move(slotId, 1), { disabled: pinned || PINNED.has(state.order[position + 1]) }),
      toggle,
    ),
  );

  const arrow = (dir, text, step) => {
    const b = el('button', { type: 'button', className: `slot__arrow slot__arrow--${dir}`, textContent: text, tabIndex: -1, onclick: () => cycle(slotId, step) });
    b.setAttribute('aria-hidden', 'true');
    return b;
  };
  const stage = el(
    'div',
    { className: 'slot__stage' },
    el('img', { src: option.image, alt: `${slot.label}: ${option.name}`, width: option.width, height: option.height }),
  );
  if (!single) stage.append(arrow('prev', '‹', -1), arrow('next', '›', 1));

  const note = el('textarea', {
    className: 'slot__note',
    rows: 1,
    placeholder: `Note for designers about the ${slot.label.toLowerCase()} (optional)`,
    value: state.slotNotes[slotId] ?? '',
    oninput: (e) => {
      if (e.target.value.trim()) state.slotNotes[slotId] = e.target.value;
      else delete state.slotNotes[slotId];
      save();
    },
  });
  note.setAttribute('aria-label', `Note about ${slot.label}`);

  const section = el('section', { className: `slot${off ? ' slot--off' : ''}` }, bar, stage, note);
  section.dataset.slot = slotId;
  section.setAttribute('aria-label', slot.label);
  section.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA' || single || off) return;
    if (e.key === 'ArrowLeft') cycle(slotId, -1);
    if (e.key === 'ArrowRight') cycle(slotId, 1);
  });
  return section;
}

function render() {
  $('slots').replaceChildren(...state.order.map(renderSlot));

  const counts = new Map(variants.map((v) => [v.id, 0]));
  let total = 0;
  for (const id of state.order) {
    const option = pickedOption(id);
    if (state.excluded[id] || option.sharedBy.length > 1) continue;
    counts.set(option.variant, counts.get(option.variant) + 1);
    total += 1;
  }
  $('summary').textContent = variants.map((v) => `${v.label}: ${counts.get(v.id)}`).join('   ') + `   (${total} sections)`;
  for (const b of $('presets').children) {
    b.setAttribute('aria-pressed', String(total > 0 && counts.get(b.dataset.variant) === total));
  }
}

function buildExport() {
  const absolute = (path) => new URL(path, location.href).href;
  return {
    schema: SCHEMA,
    project: state.project.trim(),
    exportedAt: new Date().toISOString(),
    notes: state.notes.trim(),
    catalogGeneratedAt: catalog.generatedAt,
    pickerUrl: `${location.origin}${location.pathname}#s=${encodeState(state)}`,
    sections: state.order.map((slotId, i) => {
      const slot = slotById.get(slotId);
      const o = pickedOption(slotId);
      return {
        position: i + 1,
        slot: slotId,
        slotLabel: slot.label,
        included: !state.excluded[slotId],
        optionId: o.id,
        variant: o.sharedBy.length > 1 ? 'shared' : o.variant,
        variantLabel: o.variantLabel,
        components: o.components,
        sourceUrl: o.sourceUrl,
        screenshot: absolute(o.image),
        note: state.slotNotes[slotId] ?? '',
      };
    }),
  };
}

// ---------- wiring ----------

for (const v of variants) {
  const b = el('button', {
    type: 'button',
    className: 'btn btn--small',
    textContent: v.label,
    onclick: () => {
      for (const slot of catalog.slots) state.picks[slot.id] = optionForVariant(slot, v.id).id;
      commit();
    },
  });
  b.dataset.variant = v.id;
  $('presets').append(b);
}

$('btnShuffle').onclick = () => {
  for (const slot of catalog.slots) state.picks[slot.id] = slot.options[Math.floor(Math.random() * slot.options.length)].id;
  commit();
};

$('project').value = state.project;
$('project').oninput = (e) => { state.project = e.target.value; save(); };
$('notes').value = state.notes;
$('notes').oninput = (e) => { state.notes = e.target.value; save(); };

const setPreview = (on) => {
  document.body.classList.toggle('preview', on);
  $('btnPreview').setAttribute('aria-pressed', String(on));
  window.scrollTo(0, 0);
};
$('btnPreview').onclick = () => setPreview(true);
$('btnExitPreview').onclick = () => setPreview(false);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('preview')) setPreview(false);
});

$('btnExport').onclick = () => {
  const data = buildExport();
  const slug = data.project.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'site';
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' }));
  el('a', { href: url, download: `${slug}-template-selection.json` }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Exported JSON');
};

$('btnShare').onclick = async () => {
  const link = buildExport().pickerUrl;
  try {
    await navigator.clipboard.writeText(link);
    toast('Link copied');
  } catch {
    prompt('Copy this link:', link);
  }
};

$('btnImport').onclick = () => $('fileImport').click();
$('fileImport').onchange = async (e) => {
  const [file] = e.target.files;
  e.target.value = '';
  if (!file) return;
  try {
    const raw = JSON.parse(await file.text());
    if (raw.schema !== SCHEMA) throw new Error('not a template picker export');
    state = normalize(raw);
    $('project').value = state.project;
    $('notes').value = state.notes;
    commit();
    toast('Selection imported');
  } catch (err) {
    toast(`Import failed: ${err.message}`);
  }
};

render();

// Warm the cache so cycling to the next style is instant.
for (const slot of catalog.slots) for (const o of slot.options) new Image().src = o.image;
