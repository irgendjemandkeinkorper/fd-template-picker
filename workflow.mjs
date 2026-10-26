import { REQUIRED_COMPONENTS, componentForOption, visualReviewForOption } from './model.mjs';
import { designName } from './names.mjs';
import { assessBrandColors, BRAND_COLOR_NOTE, paletteForState, assessPalette, COLOR_ROLES, PALETTE_BINDING_NOTE, paletteProceedStatus } from './colors.mjs';

export const GUIDE_STEPS = Object.freeze([
  Object.freeze({ id: 'colors', label: 'Brand colors', kind: 'colors' }),
  ...REQUIRED_COMPONENTS.map((component) => Object.freeze({ id: component.id, label: component.label, kind: 'section' })),
  Object.freeze({ id: 'review', label: 'Review', kind: 'review' }),
]);

// Customer choices must be backed by a current visual review, not just an image file.
export function isDemoOption(catalog, slot, option) {
  const component = componentForOption(slot, option);
  const audit = catalog.componentAudit?.find((entry) => entry.variant === option.variant && entry.component === component);
  const sourceStatus = option.componentStatus ?? audit?.status ?? 'present';
  return option.customerAvailable !== false && sourceStatus === 'present' && option.captureStatus === 'captured-live'
    && Boolean(option.image && option.width > 0 && option.height > 0)
    && option.capture?.mode === 'live' && !option.capture.appearanceAltered && !option.capture.sampleDataInjected
    && visualReviewForOption(option).status === 'passed';
}

export function createWorkflow(catalog) {
  const stepIds = new Set(GUIDE_STEPS.map((step) => step.id));
  const sectionSteps = GUIDE_STEPS.filter((step) => step.kind === 'section');
  const availableChoices = new Map(sectionSteps.map((step) => [step.id, catalog.slots.flatMap((slot) => slot.options
    .filter((option) => componentForOption(slot, option) === step.id && isDemoOption(catalog, slot, option))
    .map((option) => ({ slotId: slot.id, slot, option })))]));
  // Group only explicitly reviewed design equivalences; separate captures remain source evidence.
  const designKey = (option) => option.customerDesign?.id && option.customerDesign?.reviewedAt
    ? `design:${option.customerDesign.id}` : `option:${option.id}`;
  const choices = new Map(sectionSteps.map((step) => {
    const groups = new Map();
    for (const choice of availableChoices.get(step.id)) {
      const key = designKey(choice.option);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(choice);
    }
    return [step.id, [...groups.values()].map((group) => group.find(({ option }) => option.id === option.customerDesign?.representativeOptionId) ?? group[0])];
  }));
  const choicesFor = (stepId) => choices.get(stepId) ?? [];
  const selectedChoice = (state, stepId) => choicesFor(stepId).find(({ slotId, option }) => !state.excluded?.[slotId] && state.picks?.[slotId] === option.id) ?? null;
  const selectionKey = (state, stepId, { colorsKey = '', colorsValid = false } = {}) => stepId === 'colors'
    ? (colorsValid ? colorsKey : '') : selectedChoice(state, stepId)?.option.id ?? '';

  function normalizeGuidedSelection(state) {
    const picks = { ...state.picks }, excluded = Object.fromEntries(catalog.slots.map((slot) => [slot.id, true]));
    const confirmed = { ...state.workflow?.confirmed };
    const requiredOrder = sectionSteps.map((step) => {
      const available = choicesFor(step.id);
      const previous = availableChoices.get(step.id).find(({ slotId, option }) => state.picks?.[slotId] === option.id);
      const choice = available.find(({ slotId, option }) => state.picks?.[slotId] === option.id)
        ?? (previous ? available.find(({ option }) => designKey(option) === designKey(previous.option)) : null) ?? available[0];
      if (!choice) throw new Error(`No reviewed ${step.label.toLowerCase()} styles are available.`);
      if (!previous || previous.option.id !== choice.option.id) delete confirmed[step.id];
      picks[choice.slotId] = choice.option.id;
      delete excluded[choice.slotId];
      return choice.slotId;
    });
    return { ...state, picks, excluded, ...(state.workflow ? { workflow: { ...state.workflow, confirmed } } : {}), order: [...new Set([...requiredOrder, ...catalog.slots.map((slot) => slot.id)])] };
  }

  function buildCustomerSummary(state) {
    const assessment = assessBrandColors(state.brandColors);
    const palette = paletteForState(state), paletteAssessment = assessPalette(palette);
    const lines = [`${String(state.project ?? '').trim() || 'Your website'} — Template selection`, '', 'Brand colors',
      `Primary: ${assessment.primary ?? 'Not selected'}`, `Secondary: ${assessment.secondary ?? 'Not selected'}`,
      `Text contrast: ${assessment.valid ? `${assessment.ratio.toFixed(2)}:1 — ${assessment.normalText.passes ? 'Meets the 4.5:1 requirement for regular text.' : 'Below the 4.5:1 requirement for regular text.'}` : 'Choose two valid colors.'}`,
      ...COLOR_ROLES.filter(({ id }) => !['primary', 'secondary'].includes(id)).map(({ id, label }) => `${label}: ${palette.roles[id]}`),
      `Dark / Background contrast: ${paletteAssessment.pairs[1].ratio?.toFixed(2) ?? 'Invalid'}:1`,
      ...(paletteProceedStatus(palette, state.colorAcknowledgment).acknowledgment ? [`Contrast exception acknowledged: ${state.colorAcknowledgment.acknowledgedAt}.`, state.colorAcknowledgment.statement, 'Website team: review text colors before publishing. This acknowledgment does not establish accessibility compliance.'] : []),
      PALETTE_BINDING_NOTE, BRAND_COLOR_NOTE, '', 'Your sections'];
    for (const [index, step] of sectionSteps.entries()) {
      const choice = selectedChoice(state, step.id);
      lines.push(`${index + 1}. ${step.label}: ${choice ? designName(choice.option, catalog) : 'Not selected'}`);
    }
    return `${lines.join('\n')}\n`;
  }

  function normalizeProgress(raw) {
    const confirmed = {};
    for (const step of GUIDE_STEPS.filter((entry) => entry.kind !== 'review')) {
      if (typeof raw?.confirmed?.[step.id] === 'string' && raw.confirmed[step.id]) confirmed[step.id] = raw.confirmed[step.id];
    }
    return { currentStep: stepIds.has(raw?.currentStep) ? raw.currentStep : 'colors', confirmed };
  }
  function completed(progress, state, stepId, colors = {}) {
    if (stepId === 'review') return sectionSteps.every((step) => completed(progress, state, step.id, colors)) && completed(progress, state, 'colors', colors);
    const key = selectionKey(state, stepId, colors);
    return Boolean(key && progress?.confirmed?.[stepId] === key);
  }
  const firstIncomplete = (progress, state, colors = {}) => GUIDE_STEPS.find((step) => step.kind !== 'review' && !completed(progress, state, step.id, colors))?.id ?? 'review';
  function confirm(progress, state, stepId, colors = {}) {
    if (!stepIds.has(stepId) || stepId === 'review') throw new RangeError('Choose a checklist step.');
    const key = selectionKey(state, stepId, colors);
    if (!key) throw new Error(stepId === 'colors' ? 'Choose two readable brand colors.' : 'Choose an available style before continuing.');
    return { ...normalizeProgress(progress), confirmed: { ...normalizeProgress(progress).confirmed, [stepId]: key } };
  }
  function accessibleStep(progress, state, requestedStep, colors = {}) {
    const first = firstIncomplete(progress, state, colors);
    const requestedIndex = GUIDE_STEPS.findIndex((step) => step.id === requestedStep);
    const firstIndex = GUIDE_STEPS.findIndex((step) => step.id === first);
    return requestedIndex >= 0 && requestedIndex <= firstIndex ? requestedStep : first;
  }
  return { steps: GUIDE_STEPS, choicesFor, selectedChoice, selectionKey, normalizeGuidedSelection, buildCustomerSummary, normalizeProgress, completed, firstIncomplete, confirm, accessibleStep };
}
