import { SCHEMA, SUPPORTED_SCHEMAS, createModel } from './model.mjs';
import { assessBrandColors, normalizeHexColor, DEFAULT_BRAND_COLORS, BRAND_COLOR_NOTE, contrastRatio, CONTRAST_STANDARD_URL } from './colors.mjs';
import { GUIDE_STEPS, createWorkflow } from './workflow.mjs';

const STORAGE_KEY = 'fd-template-picker:guided-selection:v1';
const LEGACY_STORAGE_KEY = 'fd-template-picker:selection';
const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, ...children) => { const node = Object.assign(document.createElement(tag), props); node.append(...children); return node; };
const button = (text, className, action) => el('button', { type: 'button', className, textContent: text, onclick: action });
const link = (text, href, className = '') => el('a', { textContent: text, href, className, target: '_blank', rel: 'noopener noreferrer' });
const encodeState = (value) => btoa(Array.from(new TextEncoder().encode(JSON.stringify(value)), (c) => String.fromCharCode(c)).join(''));
const decodeState = (value) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value), (c) => c.charCodeAt(0))));
const styleName = (option) => option.variantLabel.replace(/^[A-Z]\s*·\s*/, '');
const formatRatio = (ratio) => (Math.floor(ratio * 100) / 100).toFixed(2);
const stepCopy = {
  colors: ['Make it yours.', 'Pick a primary and secondary color for your website.'],
  navigation: ['Choose your navigation.', 'The menu that helps visitors find their way.'],
  hero: ['Choose your opening section.', 'Make a first impression with a layout you love.'],
  food: ['Choose your food & drink section.', 'Show off your menu and cinema favorites.'],
  'private-parties': ['Choose your private parties section.', 'Make space for celebrations and private screenings.'],
  membership: ['Choose your membership section.', 'Invite visitors to become regulars.'],
  contact: ['Choose your contact section.', 'Make it easy to start a conversation.'],
  review: ['Your website, coming together.', 'Review your choices, then share them with your website team.'],
};
let catalog, model, workflow, state, toastTimer, saveTimer, returnToReview = false;
const loadedPreviews = new Set();
try {
  const response = await fetch('catalog.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Catalog unavailable');
  catalog = await response.json(); model = createModel(catalog); workflow = createWorkflow(catalog);
  let raw = null, restoreError = false;
  try {
    if (location.hash.startsWith('#s=')) {
      raw = decodeState(location.hash.slice(3));
      if (!raw || (raw.schema && !SUPPORTED_SCHEMAS.has(raw.schema)) || (!Array.isArray(raw.sections) && !raw.picks)) throw new Error('Invalid selection');
      history.replaceState(null, '', location.pathname + location.search);
    } else {
      const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) raw = JSON.parse(stored);
    }
  } catch { raw = null; restoreError = true; }
  state = workflow.normalizeGuidedSelection(model.normalize(raw));
  state.workflow = workflow.normalizeProgress(state.workflow);
  state.workflow.currentStep = workflow.accessibleStep(state.workflow, state, state.workflow.currentStep, colorContext());
  render();
  if (restoreError) toast('That saved selection could not be opened. You can start a new one here.');
} catch {
  $('restart').disabled = true;
  $('stepPanel').replaceChildren(el('div', { className: 'step-content' }, el('div', { className: 'empty-state' }, el('h2', { id: 'stepTitle', textContent: 'Let’s try that again.' }), el('p', { textContent: 'The styles could not load. Refresh this page to continue.' }), button('Refresh', 'button button--primary', () => location.reload()))));
}

function colorContext() {
  const assessment = assessBrandColors(state.brandColors);
  return { colorsKey: `${assessment.primary}|${assessment.secondary}`, colorsValid: assessment.normalText.passes };
}
function toast(message) {
  clearTimeout(toastTimer); $('toast').textContent = message; $('toast').classList.add('is-visible');
  toastTimer = setTimeout(() => $('toast').classList.remove('is-visible'), 3500);
}
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schema: SCHEMA, ...state }));
    $('saved').textContent = '✓ Saved on this device';
    clearTimeout(saveTimer); saveTimer = setTimeout(() => $('saved').textContent = 'Progress saves on this device', 2200);
  } catch { $('saved').textContent = 'Use a selection link to save your choices'; }
}
function goTo(stepId) {
  if (state.workflow.currentStep === 'review' && stepId !== 'review') returnToReview = true;
  if (stepId === 'review') returnToReview = false;
  state.workflow.currentStep = workflow.accessibleStep(state.workflow, state, stepId, colorContext());
  save(); render(true);
}
function completedCount() { return GUIDE_STEPS.filter((step) => step.kind !== 'review' && workflow.completed(state.workflow, state, step.id, colorContext())).length; }
function renderChecklist() {
  const firstIndex = GUIDE_STEPS.findIndex((step) => step.id === workflow.firstIncomplete(state.workflow, state, colorContext()));
  $('checklist').replaceChildren(...GUIDE_STEPS.map((step, index) => {
    const current = state.workflow.currentStep === step.id;
    const done = step.kind !== 'review' && workflow.completed(state.workflow, state, step.id, colorContext());
    const control = button('', `step-link${done ? ' is-complete' : ''}`, () => goTo(step.id));
    control.disabled = index > firstIndex;
    control.setAttribute('aria-label', `${step.label}${done ? ', complete' : ''}`);
    if (current) control.setAttribute('aria-current', 'step');
    const number = el('span', { className: 'step-number', textContent: done ? '✓' : String(index + 1) }); number.setAttribute('aria-hidden', 'true');
    control.append(number, el('span', { textContent: step.label }));
    return el('li', {}, control);
  }));
  $('progress').value = completedCount(); $('progressLabel').textContent = `${completedCount()} of 7`;
}
function stageHeading(step) {
  const index = GUIDE_STEPS.findIndex((entry) => entry.id === step.id);
  return el('div', { className: 'stage-heading' },
    el('p', { className: 'eyebrow', textContent: `Step ${index + 1} of ${GUIDE_STEPS.length} · ${step.label}` }),
    el('h2', { id: 'stepTitle', tabIndex: -1, textContent: step.id === 'review' && state.project.trim() ? `${state.project.trim()}, coming together.` : stepCopy[step.id][0] }),
    el('p', { textContent: stepCopy[step.id][1] }));
}
function render(focus = false) {
  renderChecklist();
  const step = GUIDE_STEPS.find((entry) => entry.id === state.workflow.currentStep) ?? GUIDE_STEPS[0];
  const content = el('div', { className: 'step-content' }, stageHeading(step));
  if (step.kind === 'colors') content.append(renderColors());
  else if (step.kind === 'section') content.append(renderStyles(step));
  else content.append(renderReview());
  $('stepPanel').replaceChildren(content, renderActions(step));
  if (focus) {
    $('stepTitle').focus({ preventScroll: true });
    $('checklist').querySelector('[aria-current="step"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}
function renderActions(step) {
  const index = GUIDE_STEPS.findIndex((entry) => entry.id === step.id);
  const back = button('← Back', 'button button--back', () => goTo(GUIDE_STEPS[index - 1].id));
  back.disabled = index === 0;
  const actions = el('div', { className: 'step-actions' }, back);
  const right = el('div', { className: 'action-right' });
  if (step.kind === 'review') {
    right.append(button('Copy link', 'button button--secondary', copyLink), button('Download summary ↓', 'button button--primary', downloadSummary));
  } else {
    const next = button('', 'button button--primary', () => {
      try {
        if (step.kind === 'colors') {
          const assessment = assessBrandColors(state.brandColors);
          if (!assessment.normalText.passes) return;
          state.brandColors = { primary: assessment.primary, secondary: assessment.secondary };
        }
        state.workflow = workflow.confirm(state.workflow, state, step.id, colorContext());
        const finished = workflow.firstIncomplete(state.workflow, state, colorContext()) === 'review';
        state.workflow.currentStep = finished ? 'review' : GUIDE_STEPS[index + 1].id;
        if (state.workflow.currentStep === 'review') returnToReview = false;
        save(); render(true);
      } catch { toast('Choose an available option before continuing.'); }
    });
    next.id = 'continue';
    const label = returnToReview ? 'Save choice' : step.kind === 'colors' ? 'Use these colors' : 'Use this style';
    next.append(el('span', { textContent: label }), el('span', { className: 'button-arrow', textContent: '→' }));
    next.disabled = step.kind === 'colors' ? !assessBrandColors(state.brandColors).normalText.passes : !loadedPreviews.has(workflow.selectedChoice(state, step.id)?.option.id);
    right.append(el('span', { className: 'action-hint', textContent: 'You can change your choices later.' }), next);
  }
  actions.append(right); return actions;
}
function colorNotice() {
  const mark = el('span', { className: 'info-mark', textContent: 'i' }); mark.setAttribute('aria-hidden', 'true');
  return el('p', { className: 'color-note' }, mark, el('span', { textContent: BRAND_COLOR_NOTE }));
}
function renderColors() {
  const area = el('div', { className: 'colors-layout' });
  const project = el('input', { id: 'project', type: 'text', className: 'project-input', value: state.project, placeholder: 'e.g. The Picture House', maxLength: 100, autocomplete: 'organization' });
  project.oninput = () => { state.project = project.value; save(); };
  area.append(el('label', { className: 'project-field', htmlFor: 'project' }, el('span', { className: 'field-label' }, 'Your cinema name', el('span', { className: 'optional', textContent: ' (optional)' })), project));
  const fields = el('div', { className: 'color-fields' });
  for (const kind of ['primary', 'secondary']) {
    const name = kind === 'primary' ? 'Primary' : 'Secondary';
    const native = el('input', { type: 'color', id: `${kind}Picker`, className: 'color-input', value: normalizeHexColor(state.brandColors[kind]) ?? DEFAULT_BRAND_COLORS[kind] });
    native.setAttribute('aria-label', `Choose ${kind} color`);
    const hex = el('input', { type: 'text', id: `${kind}Hex`, className: 'hex-input', value: state.brandColors[kind], maxLength: 7, spellcheck: false, autocomplete: 'off' });
    hex.setAttribute('aria-label', `${name} color hex code`); hex.setAttribute('aria-describedby', 'contrastFeedback');
    native.oninput = () => { state.brandColors[kind] = native.value.toUpperCase(); hex.value = state.brandColors[kind]; refreshColorFeedback(); save(); };
    hex.oninput = () => { state.brandColors[kind] = hex.value; const valid = normalizeHexColor(hex.value); if (valid) native.value = valid; refreshColorFeedback(); save(); };
    hex.onblur = () => { const valid = normalizeHexColor(hex.value); if (valid) { state.brandColors[kind] = valid; hex.value = valid; save(); } };
    fields.append(el('div', { className: 'color-field' }, el('label', { htmlFor: `${kind}Picker`, textContent: `${name} color` }), el('div', { className: 'color-control' }, native, el('div', {}, hex, el('p', { className: 'hex-hint', textContent: 'Pick a color or enter a hex code' })))));
  }
  const card = el('section', { className: 'contrast-card' }); card.setAttribute('aria-label', 'Color contrast check');
  const samples = el('div', { className: 'contrast-samples' });
  samples.append(el('div', { id: 'primarySample', className: 'contrast-sample' }, el('span', { textContent: 'Secondary text on primary' }), el('p', { textContent: 'Your next great night at the movies.' })), el('div', { id: 'secondarySample', className: 'contrast-sample' }, el('span', { textContent: 'Primary text on secondary' }), el('p', { textContent: 'Your next great night at the movies.' })));
  const fix = button('Suggest a contrasting secondary', 'contrast-fix', () => {
    const primary = normalizeHexColor(state.brandColors.primary); if (!primary) return;
    const secondary = contrastRatio(primary, '#FFFFFF') >= contrastRatio(primary, '#000000') ? '#FFFFFF' : '#000000';
    state.brandColors.secondary = secondary; $('secondaryHex').value = secondary; $('secondaryPicker').value = secondary;
    refreshColorFeedback(); save();
  }); fix.id = 'suggestContrast';
  const feedback = el('div', { id: 'contrastFeedback', className: 'contrast-result' }, el('span', { id: 'contrastStatus', className: 'contrast-status' }), el('span', { id: 'contrastDetail', className: 'contrast-detail' }), fix);
  feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite');
  card.append(el('div', { className: 'contrast-card__heading' }, el('h3', { textContent: 'See how they work together' }), el('span', { id: 'contrastRatio', className: 'contrast-ratio' })), samples, feedback);
  area.append(fields, card, colorNotice(), link('How contrast is checked ↗', CONTRAST_STANDARD_URL, 'contrast-reference'));
  queueMicrotask(refreshColorFeedback);
  return area;
}
function refreshColorFeedback() {
  if (!$('contrastFeedback')) return;
  const result = assessBrandColors(state.brandColors);
  for (const kind of ['primary', 'secondary']) $(`${kind}Hex`).setAttribute('aria-invalid', String(!normalizeHexColor(state.brandColors[kind])));
  for (const [id, background, color] of [['primarySample', result.primary, result.secondary], ['secondarySample', result.secondary, result.primary]]) {
    $(id).style.backgroundColor = background ?? '#ECEEED'; $(id).style.color = color ?? '#183B4E';
  }
  $('contrastRatio').textContent = result.valid ? `${formatRatio(result.ratio)}:1` : 'Enter two colors';
  $('contrastFeedback').classList.toggle('is-failing', !result.normalText.passes);
  $('contrastStatus').textContent = result.normalText.passes ? '✓ Good contrast' : result.valid ? 'More contrast needed' : 'Check your hex codes';
  $('contrastDetail').textContent = result.normalText.passes ? 'Readable in either direction. Meets the 4.5:1 minimum for regular text.'
    : !result.valid ? 'Use a 3- or 6-digit hex code, such as #183B4E.'
      : result.largeText.passes ? 'Works for large text only. Choose more contrast for regular text.'
        : 'Try one light and one dark color so text is easy to read.';
  $('suggestContrast').hidden = result.normalText.passes || !result.valid;
  if ($('continue')) $('continue').disabled = !result.normalText.passes;
  renderChecklist();
}
function imageUrl(option) {
  const version = option.visualReview?.imageSha256?.slice(0, 12) ?? option.capture?.capturedAt;
  return `${option.image}${version ? `?v=${encodeURIComponent(version)}` : ''}`;
}
function screenshot(option, step) {
  const image = el('img', { src: imageUrl(option), alt: `${styleName(option)} ${step.label.toLowerCase()} example`, width: option.width, height: option.height });
  const updateContinue = (loaded) => {
    const active = workflow.selectedChoice(state, state.workflow.currentStep);
    if ($('continue') && active?.option.id === option.id) $('continue').disabled = !loaded;
  };
  image.onload = () => { loadedPreviews.add(option.id); updateContinue(true); };
  image.onerror = () => {
    loadedPreviews.delete(option.id); updateContinue(false);
    image.replaceWith(el('p', { className: 'loading', textContent: 'This preview could not load. Choose another style or refresh the page.' }));
    toast('A preview could not load. Try another style.');
  };
  return image;
}
function renderStyles(step) {
  const area = el('div');
  const choices = workflow.choicesFor(step.id), selected = workflow.selectedChoice(state, step.id);
  if (!selected || !choices.length) return el('div', { className: 'empty-state' }, el('h3', { textContent: 'These styles are getting a refresh.' }), el('p', { textContent: 'Please return to this step shortly. Your other choices are saved.' }));
  const picker = el('fieldset', { className: 'style-picker' }, el('legend', {}, 'Pick a style ', el('span', { className: 'style-count', textContent: `${choices.length} available` })));
  const options = el('div', { className: 'style-options' });
  choices.forEach((choice, index) => {
    const radio = el('input', { type: 'radio', name: 'section-style', id: `style-${index}`, value: choice.option.id, checked: choice.option.id === selected.option.id });
    radio.onchange = () => {
      if (!radio.checked) return;
      for (const other of choices) state.excluded[other.slotId] = true;
      state.picks[choice.slotId] = choice.option.id; delete state.excluded[choice.slotId];
      save(); render();
      [...document.querySelectorAll('input[name="section-style"]')].find((input) => input.value === choice.option.id)?.focus({ preventScroll: true });
    };
    const number = el('span', { className: 'style-order', textContent: String(index + 1).padStart(2, '0') }); number.setAttribute('aria-hidden', 'true');
    const tick = el('span', { className: 'choice-tick', textContent: '✓' }); tick.setAttribute('aria-hidden', 'true');
    options.append(el('div', { className: 'style-option' }, radio, el('label', { htmlFor: radio.id }, number, el('span', { textContent: styleName(choice.option) }), tick)));
  });
  picker.append(options);
  const preview = el('div', { className: 'preview-card' });
  const scroll = el('div', { className: `preview-scroll${selected.option.presentation?.kind === 'sidebar' ? ' preview-scroll--sidebar' : step.id === 'navigation' ? ' preview-scroll--navigation' : ''}` }, screenshot(selected.option, step));
  scroll.tabIndex = 0; scroll.setAttribute('role', 'region'); scroll.setAttribute('aria-label', `${step.label} preview, scroll to explore`);
  preview.append(el('div', { className: 'preview-card__bar' }, el('div', {}, el('span', { className: 'eyebrow', textContent: 'Your choice' }), el('h3', { textContent: styleName(selected.option) })), button('View larger ↗', '', () => openPreview(selected.option, step))), scroll,
    el('p', { className: 'preview-caption' }, el('span', { textContent: 'Layout preview · sample content and original colors' }), el('span', { textContent: step.id === 'navigation' ? 'Scroll to explore ↔' : 'Scroll to explore ↓' })));
  area.append(picker, preview); return area;
}
function openPreview(option, step) {
  $('previewTitle').textContent = styleName(option); $('previewCategory').textContent = step.label;
  $('previewImage').className = `dialog-image${option.presentation?.kind === 'sidebar' ? ' is-sidebar' : step.id === 'navigation' ? ' is-navigation' : ''}`;
  $('previewImage').replaceChildren(screenshot(option, step));
  $('previewImage').scrollTop = 0; $('previewImage').scrollLeft = 0; $('previewDialog').showModal();
}
function renderReview() {
  const area = el('div'); const result = assessBrandColors(state.brandColors);
  area.append(el('p', { className: 'review-intro' }, el('span', { textContent: '✓' }), 'All 7 choices are complete.'));
  const colors = el('div', { className: 'review-colors' }, el('h3', { textContent: 'Brand colors' }));
  for (const kind of ['primary', 'secondary']) {
    const dot = el('span', { className: 'color-dot' }); dot.style.backgroundColor = state.brandColors[kind]; dot.setAttribute('aria-hidden', 'true');
    colors.append(el('div', { className: 'review-color' }, dot, el('div', {}, kind === 'primary' ? 'Primary' : 'Secondary', el('strong', { textContent: state.brandColors[kind] }))));
  }
  colors.append(el('span', { className: 'review-ratio', textContent: `✓ ${formatRatio(result.ratio)}:1 contrast` }), button('Edit', 'edit-link', () => goTo('colors')));
  colors.style.marginTop = '18px'; area.append(colors, colorNotice());
  const grid = el('div', { className: 'review-grid' });
  for (const step of GUIDE_STEPS.filter((entry) => entry.kind === 'section')) {
    const choice = workflow.selectedChoice(state, step.id); if (!choice) continue;
    const edit = button('Edit', 'edit-link', () => goTo(step.id)); edit.setAttribute('aria-label', `Edit ${step.label.toLowerCase()}`);
    const thumb = button('', `review-thumbnail${choice.option.presentation?.kind === 'sidebar' ? ' review-thumbnail--sidebar' : step.id === 'navigation' ? ' review-thumbnail--navigation' : ''}`, () => openPreview(choice.option, step));
    thumb.setAttribute('aria-label', `Preview ${step.label.toLowerCase()}`); thumb.append(screenshot(choice.option, step));
    grid.append(el('article', { className: 'review-card' }, el('div', { className: 'review-card__heading' }, el('div', {}, el('h3', { textContent: step.label }), el('p', { textContent: styleName(choice.option) })), edit), thumb));
  }
  area.append(grid, el('p', { className: 'review-closing', textContent: 'Your summary includes your colors and all six section choices. You can return to any step to make changes.' }));
  return area;
}
async function copyLink() {
  const compact = { schema: SCHEMA, project: state.project, brandColors: state.brandColors, workflow: state.workflow,
    sections: GUIDE_STEPS.filter((step) => step.kind === 'section').map((step) => { const choice = workflow.selectedChoice(state, step.id); return { slot: choice.slotId, optionId: choice.option.id, included: true }; }) };
  const url = new URL(location.pathname, location.origin); url.hash = `s=${encodeState(compact)}`;
  try { await navigator.clipboard.writeText(url.href); toast('Selection link copied. Your colors and choices are included.'); }
  catch { window.prompt('Copy your selection link:', url.href); }
}
function downloadSummary() {
  const summary = workflow.buildCustomerSummary(state);
  const filename = `${state.project.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cinema'}-website-choices.txt`;
  const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
  const anchor = el('a', { href: url, download: filename }); document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Your selection summary is ready.');
}
$('closePreview').onclick = () => $('previewDialog').close();
$('restart').onclick = () => $('restartDialog').showModal();
$('cancelRestart').onclick = () => $('restartDialog').close();
$('confirmRestart').onclick = () => {
  $('restartDialog').close(); state = workflow.normalizeGuidedSelection(model.defaultState());
  state.workflow = workflow.normalizeProgress(null); returnToReview = false; save(); render(true); toast('A fresh selection is ready.');
};
