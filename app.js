import { SCHEMA, SUPPORTED_SCHEMAS, createModel, buildBuildBrief } from './model.mjs?v=fonts-1';
import { assessBrandColors, normalizeHexColor, BRAND_COLOR_NOTE, contrastRatio, CONTRAST_STANDARD_URL, COLOR_ROLES, COLOR_EXAMPLES, DEFAULT_PALETTE_ROLES, normalizePalette, paletteForState, assessPalette, paletteKey, PALETTE_BINDING_NOTE, paletteProceedStatus, CONTRAST_REVIEW_POLICY, CONTRAST_ACKNOWLEDGMENT } from './colors.mjs';
import { GUIDE_STEPS, createWorkflow } from './workflow.mjs?v=fonts-1';
import { HUB_DATA_URL, renderTemplateHub } from './hub.mjs';
import { renderDocumentation } from './documentation.mjs?v=documentation-1';
import { designName } from './names.mjs';
import { FONT_OPTIONS, TYPOGRAPHY_ROLES, typographyForState, typographyKey, normalizeTypography, TYPE_NOTE } from './typography.mjs?v=fonts-1';

const STORAGE_KEY = 'fd-template-picker:guided-selection:v1';
const LEGACY_STORAGE_KEY = 'fd-template-picker:selection';
const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, ...children) => { const node = Object.assign(document.createElement(tag), props); node.append(...children); return node; };
const button = (text, className, action) => el('button', { type: 'button', className, textContent: text, onclick: action });
const link = (text, href, className = '') => el('a', { textContent: text, href, className, target: '_blank', rel: 'noopener noreferrer' });
const encodeState = (value) => btoa(Array.from(new TextEncoder().encode(JSON.stringify(value)), (c) => String.fromCharCode(c)).join(''));
const decodeState = (value) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value), (c) => c.charCodeAt(0))));
const styleName = (option) => designName(option, catalog);
const formatRatio = (ratio) => (Math.floor(ratio * 100) / 100).toFixed(2);
const stepCopy = {
  colors: ['Make it yours.', 'Choose your colors and fonts, then see them together in a sample.'],
  navigation: ['Choose your navigation.', 'The menu that helps visitors find their way.'],
  hero: ['Choose your opening section.', 'Make a first impression with a layout you love.'],
  food: ['Choose your food & drink section.', 'Show off your menu and cinema favorites.'],
  'private-parties': ['Choose your private parties section.', 'Make space for celebrations and private screenings.'],
  membership: ['Choose your membership section.', 'Invite visitors to become regulars.'],
  contact: ['Choose your contact section.', 'Make it easy to start a conversation.'],
  review: ['Your website, coming together.', 'Review your choices, then share them with your website team.'],
};
let catalog, model, workflow, state, toastTimer, saveTimer, catalogText, returnToReview = false;
const loadedPreviews = new Set();
try {
  const response = await fetch('catalog.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Catalog unavailable');
  catalogText = await response.text(); catalog = JSON.parse(catalogText); model = createModel(catalog); workflow = createWorkflow(catalog);
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
  const palette = paletteForState(state);
  return { colorsKey: paletteKey(palette), colorsValid: paletteProceedStatus(palette, state.colorAcknowledgment).canProceed };
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
    right.append(button('Copy link', 'button button--secondary', copyLink), button('Summary ↓', 'button button--secondary', downloadSummary), button('Build brief ↓', 'button button--primary', downloadBuildBrief));
    right.lastElementChild.setAttribute('aria-label', 'Download build brief JSON');
  } else {
    const next = button('', 'button button--primary', () => {
      try {
        if (step.kind === 'colors') {
          if (!colorContext().colorsValid) return;
          state.palette = normalizePalette(paletteForState(state));
          state.brandColors = { primary: state.palette.roles.primary, secondary: state.palette.roles.secondary };
          state.typography = normalizeTypography(typographyForState(state));
        }
        state.workflow = workflow.confirm(state.workflow, state, step.id, colorContext());
        const finished = workflow.firstIncomplete(state.workflow, state, colorContext()) === 'review';
        state.workflow.currentStep = finished ? 'review' : GUIDE_STEPS[index + 1].id;
        if (state.workflow.currentStep === 'review') returnToReview = false;
        save(); render(true);
      } catch { toast('Choose an available option before continuing.'); }
    });
    next.id = 'continue';
    const label = returnToReview ? 'Save choice' : step.kind === 'colors' ? 'Use colors & fonts' : 'Use this style';
    next.append(el('span', { textContent: label }), el('span', { className: 'button-arrow', textContent: '→' }));
    next.disabled = step.kind === 'colors' ? !colorContext().colorsValid : !loadedPreviews.has(workflow.selectedChoice(state, step.id)?.option.id);
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
  const palette = paletteForState(state);
  const fields = el('div', { className: 'color-fields' });
  const advancedFields = el('div', { className: 'color-fields color-fields--advanced' });
  const setColor = (kind, value) => {
    const previous = state.palette.roles[kind], changed = (normalizeHexColor(previous) ?? previous) !== (normalizeHexColor(value) ?? value);
    state.palette.roles[kind] = value; if (['primary', 'secondary'].includes(kind)) state.brandColors[kind] = value;
    if (changed) { state.colorAcknowledgment = null; delete state.workflow.confirmed.colors; }
  };
  for (const { id: kind, label: name, advanced } of COLOR_ROLES) {
    const native = el('input', { type: 'color', id: `${kind}Picker`, className: 'color-input', value: normalizeHexColor(palette.roles[kind]) ?? DEFAULT_PALETTE_ROLES[kind] });
    native.setAttribute('aria-label', `Choose ${name.toLowerCase()} color`);
    const hex = el('input', { type: 'text', id: `${kind}Hex`, className: 'hex-input', value: palette.roles[kind], maxLength: 7, spellcheck: false, autocomplete: 'off' });
    hex.setAttribute('aria-label', `${name} color hex code`); hex.setAttribute('aria-describedby', 'contrastFeedback');
    native.oninput = () => { setColor(kind, native.value.toUpperCase()); hex.value = native.value.toUpperCase(); refreshColorFeedback(); save(); };
    hex.oninput = () => { setColor(kind, hex.value); const valid = normalizeHexColor(hex.value); if (valid) native.value = valid; refreshColorFeedback(); save(); };
    hex.onblur = () => { const valid = normalizeHexColor(hex.value); if (valid) { setColor(kind, valid); hex.value = valid; save(); } };
    const field = el('div', { className: 'color-field' }, el('label', { htmlFor: `${kind}Picker`, textContent: `${name} color` }), el('div', { className: 'color-control' }, native, el('div', {}, hex, el('p', { className: 'hex-hint', textContent: 'Pick a color or enter a hex code' }))));
    if (COLOR_EXAMPLES[kind]) field.append(el('p', { className: 'color-role-hint', textContent: COLOR_EXAMPLES[kind] }));
    (advanced ? advancedFields : fields).append(field);
  }
  const card = el('section', { className: 'contrast-card' }); card.setAttribute('aria-label', 'Color contrast check');
  const samples = el('div', { className: 'contrast-samples' });
  samples.append(el('div', { id: 'primarySample', className: 'contrast-sample' }, el('span', { textContent: 'Secondary text on primary' }), el('p', { textContent: 'Your next great night at the movies.' })), el('div', { id: 'secondarySample', className: 'contrast-sample' }, el('span', { textContent: 'Primary text on secondary' }), el('p', { textContent: 'Your next great night at the movies.' })));
  const fix = button('Suggest a contrasting secondary', 'contrast-fix', () => {
    const primary = normalizeHexColor(state.brandColors.primary); if (!primary) return;
    const secondary = contrastRatio(primary, '#FFFFFF') >= contrastRatio(primary, '#000000') ? '#FFFFFF' : '#000000';
    setColor('secondary', secondary); $('secondaryHex').value = secondary; $('secondaryPicker').value = secondary;
    refreshColorFeedback(); save();
  }); fix.id = 'suggestContrast';
  const feedback = el('div', { id: 'contrastFeedback', className: 'contrast-result' }, el('span', { id: 'contrastStatus', className: 'contrast-status' }), el('span', { id: 'contrastDetail', className: 'contrast-detail' }), fix);
  feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite');
  const bodySample = el('div', { id: 'bodySample', className: 'body-color-sample' }, el('strong', { textContent: 'A night at your cinema' }), el('span', { textContent: 'Dark text on your Background color' }));
  const bodyFeedback = el('p', { id: 'bodyContrastFeedback', className: 'contrast-detail' }); bodyFeedback.setAttribute('aria-live', 'polite');
  const fixBody = button('Suggest a readable Dark color', 'contrast-fix', () => {
    const bg = normalizeHexColor(state.palette.roles.background); if (!bg) return;
    const dark = contrastRatio(bg, '#000000') >= contrastRatio(bg, '#FFFFFF') ? '#000000' : '#FFFFFF';
    setColor('dark', dark); $('darkHex').value = dark; $('darkPicker').value = dark; refreshColorFeedback(); save();
  }); fixBody.id = 'suggestBodyContrast';
  const acknowledgment = el('input', { id: 'contrastAcknowledgment', type: 'checkbox' });
  acknowledgment.onchange = () => {
    state.colorAcknowledgment = acknowledgment.checked ? { policy: CONTRAST_REVIEW_POLICY, paletteKey: paletteKey(paletteForState(state)), acknowledgedAt: new Date().toISOString(), statement: CONTRAST_ACKNOWLEDGMENT } : null;
    delete state.workflow.confirmed.colors; refreshColorFeedback(); save();
  };
  const acknowledgmentBox = el('div', { id: 'contrastAcknowledgmentBox', className: 'contrast-acknowledgment' }, el('p', { textContent: 'You can continue for review when both checked pairs are at least 3:1. Regular text still needs 4.5:1.' }), el('label', { htmlFor: acknowledgment.id }, acknowledgment, el('span', { textContent: CONTRAST_ACKNOWLEDGMENT })));
  const blocked = el('p', { id: 'contrastBlocked', className: 'contrast-blocked', textContent: 'To continue, both checked text pairs must reach at least 3:1. Adjust the colors or use a suggestion above.' });
  card.append(el('div', { className: 'contrast-card__heading' }, el('h3', { textContent: 'Text contrast' }), el('span', { id: 'contrastRatio', className: 'contrast-ratio' })), samples, feedback, bodySample, bodyFeedback, fixBody, acknowledgmentBox, blocked,
    el('p', { className: 'palette-check-note', textContent: 'These checks cover the two base text pairs. Your website team will also check text over images, buttons and other states.' }));
  const advanced = el('details', { className: 'advanced-colors' }, el('summary', { textContent: 'Advanced colors · messages, splash screen & seating' }),
    el('p', { textContent: 'Optional. These suggested starter colors are saved with your choices. Your website team will verify how each is used.' }), advancedFields);
  const roleExample = el('div', { id: 'roleExample', className: 'role-example' }, el('div', { className: 'role-example__header' }, el('strong', { textContent: 'Your cinema' }), el('span', { className: 'role-example__navigation', textContent: 'Movies · Food · Visit' })), el('div', { className: 'role-example__body' }, el('span', { className: 'role-example__eyebrow', textContent: 'Accent divider' }), el('h3', { textContent: 'A night worth sharing' }), el('p', { className: 'role-example__copy', textContent: 'Discover your next favorite film. Bring your friends, settle into your seats and enjoy the big screen.' }), el('span', { className: 'role-example__button', textContent: 'See showtimes' })));
  roleExample.setAttribute('aria-label', 'Sample of your colors and fonts');
  const bindings = el('details', { className: 'palette-bindings', open: true }, el('summary', { textContent: 'See your colors & fonts together' }), el('p', { textContent: PALETTE_BINDING_NOTE }), roleExample, el('p', { textContent: 'Sample only. The template screenshots keep their original colors and fonts; your website team will apply your choices during the build.' }));
  area.append(fields, advanced, card, colorNotice(), renderTypography(), bindings, link('How contrast is checked ↗', CONTRAST_STANDARD_URL, 'contrast-reference'));
  queueMicrotask(refreshColorFeedback);
  return area;
}
function renderTypography() {
  const type = typographyForState(state);
  const fields = el('div', { className: 'font-fields' });
  for (const { id, label, description } of TYPOGRAPHY_ROLES) {
    const select = el('select', { id: `font-${id}`, className: 'font-select' });
    select.setAttribute('aria-describedby', `font-${id}-hint`);
    for (const font of FONT_OPTIONS) select.append(el('option', { value: font.id, textContent: font.label, selected: type.roles[id] === font.id }));
    select.onchange = () => {
      const next = normalizeTypography({ roles: { ...typographyForState(state).roles, [id]: select.value } });
      if (typographyKey(next) !== typographyKey(typographyForState(state))) delete state.workflow.confirmed.colors;
      state.typography = next;
      refreshTypographyPreview(); renderChecklist(); save();
    };
    fields.append(el('div', { className: 'font-field' }, el('label', { htmlFor: select.id, className: 'field-label', textContent: label }), select, el('p', { id: `font-${id}-hint`, className: 'font-hint', textContent: description })));
  }
  const section = el('section', { className: 'typography-panel' }, el('h3', { id: 'fontTitle', textContent: 'Fonts' }), el('p', { className: 'font-intro', textContent: 'Choose a web-safe font for each part of your website.' }), fields, el('p', { className: 'font-note', textContent: TYPE_NOTE }));
  section.setAttribute('aria-labelledby', 'fontTitle');
  return section;
}
function refreshTypographyPreview() {
  const sample = $('roleExample');
  if (!sample) return;
  const type = typographyForState(state);
  for (const { id } of TYPOGRAPHY_ROLES) {
    const font = FONT_OPTIONS.find((entry) => entry.id === type.roles[id]);
    sample.style.setProperty(`--sample-font-${id}`, font.stack);
  }
}
function refreshColorFeedback() {
  if (!$('contrastFeedback')) return;
  const result = assessBrandColors(state.brandColors);
  const palette = paletteForState(state), assessment = assessPalette(palette), body = assessment.pairs[1];
  for (const { id } of COLOR_ROLES) $(`${id}Hex`).setAttribute('aria-invalid', String(!normalizeHexColor(palette.roles[id])));
  for (const [id, background, color] of [['primarySample', result.primary, result.secondary], ['secondarySample', result.secondary, result.primary]]) {
    $(id).style.backgroundColor = background ?? '#ECEEED'; $(id).style.color = color ?? '#183B4E';
  }
  $('contrastRatio').textContent = result.valid ? `${formatRatio(result.ratio)}:1` : 'Enter two colors';
  $('contrastFeedback').classList.toggle('is-failing', !result.normalText.passes);
  $('contrastStatus').textContent = result.normalText.passes ? '✓ Good contrast' : !result.valid ? 'Check your hex codes' : result.largeText.passes ? 'Review required' : 'Below the 3:1 minimum';
  $('contrastDetail').textContent = result.normalText.passes ? 'Readable in either direction. Meets the 4.5:1 minimum for regular text.'
    : !result.valid ? 'Use a 3- or 6-digit hex code, such as #183B4E.'
      : result.largeText.passes ? 'Below 4.5:1 for regular text. You can acknowledge this below and continue for review.'
        : 'Try one light and one dark color so text is easy to read.';
  $('suggestContrast').hidden = result.normalText.passes || !result.valid;
  $('bodySample').style.backgroundColor = normalizeHexColor(palette.roles.background) ?? '#ECEEED';
  $('bodySample').style.color = normalizeHexColor(palette.roles.dark) ?? '#183B4E';
  $('bodyContrastFeedback').textContent = `Dark / Background: ${body.ratio === null ? 'enter valid colors' : `${formatRatio(body.ratio)}:1 · ${body.passes ? 'Good for regular text' : 'Needs 4.5:1 for regular text'}`}${!assessment.valid ? '. Check any invalid hex codes, including Advanced colors.' : ''}`;
  $('bodyContrastFeedback').classList.toggle('is-failing', !body.passes || !assessment.valid);
  $('suggestBodyContrast').hidden = body.passes || body.ratio === null;
  const proceed = paletteProceedStatus(palette, state.colorAcknowledgment);
  const example = $('roleExample');
  if (example) for (const id of ['header', 'accent', 'primary', 'secondary', 'dark', 'background']) example.style.setProperty(`--sample-${id}`, normalizeHexColor(palette.roles[id]) ?? DEFAULT_PALETTE_ROLES[id]);
  refreshTypographyPreview();
  $('contrastAcknowledgmentBox').hidden = !proceed.needsAcknowledgment;
  $('contrastAcknowledgment').checked = Boolean(proceed.acknowledgment);
  $('contrastBlocked').hidden = !proceed.blocked;
  if ($('continue')) $('continue').disabled = !proceed.canProceed;
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
    el('p', { className: 'preview-caption' }, el('span', { textContent: 'Layout preview · original colors and fonts' }), el('span', { textContent: step.id === 'navigation' ? 'Scroll to explore ↔' : 'Scroll to explore ↓' })));
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
  const palette = paletteForState(state);
  const advanced = el('details', { className: 'review-advanced-colors' }, el('summary', { textContent: 'Advanced colors' }));
  const advancedSwatches = el('div', { className: 'advanced-swatches' });
  for (const { id, label, advanced: isAdvanced } of COLOR_ROLES) {
    const dot = el('span', { className: 'color-dot' }); dot.style.backgroundColor = palette.roles[id]; dot.setAttribute('aria-hidden', 'true');
    (isAdvanced ? advancedSwatches : colors).append(el('div', { className: 'review-color' }, dot, el('div', {}, label, el('strong', { textContent: palette.roles[id] }))));
  }
  advanced.append(advancedSwatches);
  const body = assessPalette(palette).pairs[1];
  const colorReview = paletteProceedStatus(palette, state.colorAcknowledgment);
  colors.append(el('span', { className: 'review-ratio', textContent: `${colorReview.passes ? '✓' : 'Review acknowledged ·'} Brand ${formatRatio(result.ratio)}:1 · Text ${formatRatio(body.ratio)}:1` }), button('Edit', 'edit-link', () => goTo('colors')));
  colors.style.marginTop = '18px'; area.append(colors, advanced, colorNotice());
  const fonts = el('div', { className: 'review-fonts' }, el('h3', { textContent: 'Fonts' }));
  const type = typographyForState(state);
  for (const { id, label } of TYPOGRAPHY_ROLES) {
    const font = FONT_OPTIONS.find((entry) => entry.id === type.roles[id]);
    const name = el('strong', { textContent: font.label }); name.style.fontFamily = font.stack;
    fonts.append(el('div', { className: 'review-font' }, el('span', { textContent: label }), name));
  }
  const editFonts = button('Edit', 'edit-link', () => goTo('colors')); editFonts.setAttribute('aria-label', 'Edit fonts'); fonts.append(editFonts);
  area.append(fonts);
  if (colorReview.acknowledgment) area.append(el('p', { className: 'contrast-acknowledgment', textContent: 'Contrast exception acknowledged. Your website team must review text colors before publishing; this palette has not passed the regular-text contrast check.' }));
  const grid = el('div', { className: 'review-grid' });
  for (const step of GUIDE_STEPS.filter((entry) => entry.kind === 'section')) {
    const choice = workflow.selectedChoice(state, step.id); if (!choice) continue;
    const edit = button('Edit', 'edit-link', () => goTo(step.id)); edit.setAttribute('aria-label', `Edit ${step.label.toLowerCase()}`);
    const thumb = button('', `review-thumbnail${choice.option.presentation?.kind === 'sidebar' ? ' review-thumbnail--sidebar' : step.id === 'navigation' ? ' review-thumbnail--navigation' : ''}`, () => openPreview(choice.option, step));
    thumb.setAttribute('aria-label', `Preview ${step.label.toLowerCase()}`); thumb.append(screenshot(choice.option, step));
    grid.append(el('article', { className: 'review-card' }, el('div', { className: 'review-card__heading' }, el('div', {}, el('h3', { textContent: step.label }), el('p', { textContent: styleName(choice.option) })), edit), thumb));
  }
  area.append(grid, el('p', { className: 'review-closing', textContent: 'Your summary includes your colors, fonts and all six section choices. The JSON build brief gives your website team the source references and checks needed to prepare a draft.' }));
  return area;
}
async function copyLink() {
  const compact = { schema: SCHEMA, project: state.project, brandColors: state.brandColors, palette: normalizePalette(paletteForState(state)), typography: normalizeTypography(typographyForState(state)), colorAcknowledgment: state.colorAcknowledgment, workflow: state.workflow,
    sections: GUIDE_STEPS.filter((step) => step.kind === 'section').map((step) => { const choice = workflow.selectedChoice(state, step.id); return { slot: choice.slotId, optionId: choice.option.id, included: true }; }) };
  const url = new URL(location.pathname, location.origin); url.hash = `s=${encodeState(compact)}`;
  try { await navigator.clipboard.writeText(url.href); toast('Selection link copied. Your colors, fonts and choices are included.'); }
  catch { window.prompt('Copy your selection link:', url.href); }
}
function downloadSummary() {
  const summary = workflow.buildCustomerSummary(state);
  downloadFile(summary, 'website-choices.txt', 'text/plain;charset=utf-8');
  toast('Your selection summary is ready.');
}
function downloadFile(content, suffix, type) {
  const filename = `${state.project.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cinema'}-${suffix}`;
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = el('a', { href: url, download: filename }); document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function sha256(text) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
async function downloadBuildBrief() {
  try {
    const response = await fetch('data/build-modules.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Module index unavailable');
    const moduleText = await response.text();
    const context = { catalogSha256: await sha256(catalogText), moduleIndexSha256: await sha256(moduleText), moduleIndex: JSON.parse(moduleText) };
    const brief = buildBuildBrief(catalog, state, location.href, context);
    downloadFile(`${JSON.stringify(brief, null, 2)}\n`, 'build-brief.json', 'application/json;charset=utf-8');
    toast('Your build brief is ready for your website team.');
  } catch { toast('The build brief could not load. Your choices are saved; try again or download the summary.'); }
}
let hubReady = false, activeTab = 'picker';
const studioTabs = ['picker', 'templates', 'documentation'];
$('documentationPane').replaceChildren(renderDocumentation());
async function showTab(tab, focusContent = true) {
  activeTab = tab;
  const templates = tab === 'templates';
  for (const name of studioTabs) {
    const selected = name === tab;
    $(name + 'Pane').hidden = !selected;
    $(name + 'Tab').setAttribute('aria-selected', String(selected)); $(name + 'Tab').tabIndex = selected ? 0 : -1;
  }
  $('restart').hidden = tab !== 'picker'; $('saved').hidden = tab !== 'picker';
  const headingId = templates ? 'templateHubTitle' : tab === 'documentation' ? 'documentationTitle' : 'stepTitle';
  document.querySelector('.skip-link').href = '#' + headingId;
  const tabHash = tab === 'picker' ? '' : '#' + tab;
  if (location.hash !== tabHash) history.replaceState(null, '', location.pathname + location.search + tabHash);
  if (templates) {
    if (!hubReady) {
      try {
        const response = await fetch(HUB_DATA_URL, { cache: 'no-store' }); if (!response.ok) throw new Error('Hub unavailable');
        $('templatesPane').replaceChildren(renderTemplateHub(catalog, await response.json())); hubReady = true;
      } catch { $('templatesPane').replaceChildren(el('div', { className: 'empty-state' }, el('h1', { id: 'templateHubTitle', tabIndex: -1, textContent: 'Templates are taking a moment.' }), el('p', { textContent: 'Your checklist choices are saved. Please try this tab again.' }))); }
    }
    if (activeTab === 'templates' && focusContent) $('templateHubTitle')?.focus({ preventScroll: true });
  } else if (focusContent) $(headingId)?.focus({ preventScroll: true });
}
for (const [index, tab] of studioTabs.entries()) {
  $(tab + 'Tab').onclick = () => showTab(tab);
  $(tab + 'Tab').onkeydown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? studioTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + studioTabs.length) % studioTabs.length;
    $(studioTabs[next] + 'Tab').focus(); showTab(studioTabs[next], false);
  };
}
const tabFromHash = () => studioTabs.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'picker';
showTab(tabFromHash(), false);
window.addEventListener('hashchange', () => {
  // Heading anchors and shared-selection hashes are not tab navigation.
  if (!location.hash || studioTabs.includes(location.hash.slice(1))) showTab(tabFromHash(), false);
});
$('closePreview').onclick = () => $('previewDialog').close();
$('restart').onclick = () => $('restartDialog').showModal();
$('cancelRestart').onclick = () => $('restartDialog').close();
$('confirmRestart').onclick = () => {
  $('restartDialog').close(); state = workflow.normalizeGuidedSelection(model.defaultState());
  state.workflow = workflow.normalizeProgress(null); returnToReview = false; save(); render(true); toast('A fresh selection is ready.');
};
