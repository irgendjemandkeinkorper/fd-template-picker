import { normalizeBrandColors, assessBrandColors, normalizePalette, paletteForState, assessPalette, paletteKey, COLOR_ROLES, PALETTE_BINDING_NOTE, normalizeColorAcknowledgment, paletteProceedStatus } from './colors.mjs';
import { designName, DEMO_DESIGN_NAMES } from './names.mjs';
import { normalizeTypography, typographyKey, typographyForState, typographyBindings, TYPOGRAPHY_ROLES, TYPE_NOTE } from './typography.mjs?v=fonts-1';

export const SCHEMA = 'fd-template-picker/v3';
export const SUPPORTED_SCHEMAS = new Set(['fd-template-picker/v1', 'fd-template-picker/v2', SCHEMA]);
export const PINNED = new Set(['header', 'footer']);
export const REQUIRED_COMPONENTS = Object.freeze([
  { id: 'navigation', label: 'Navigation', slotIds: ['header', 'navigation'] },
  { id: 'hero', label: 'Hero', slotIds: ['hero'] },
  { id: 'food', label: 'Food & Drink', slotIds: ['food'] },
  { id: 'private-parties', label: 'Private Parties', slotIds: ['private-parties'] },
  { id: 'membership', label: 'Membership', slotIds: ['membership'] },
  { id: 'contact', label: 'Contact Us', slotIds: ['contact'] },
]);
export const MOVIE_COMPONENTS = new Set(['now-playing', 'coming-soon', 'ticket-finder']);
const checklistSteps = [
  { id: 'colors', label: 'Colors & fonts' }, ...REQUIRED_COMPONENTS, { id: 'review', label: 'Review' },
];
function normalizeWorkflow(raw, brandColors, palette, acknowledgment, typography) {
  const allowed = new Set(checklistSteps.filter((step) => step.id !== 'review').map((step) => step.id));
  const confirmed = Object.fromEntries([...allowed].filter((id) => typeof raw?.confirmed?.[id] === 'string' && raw.confirmed[id])
    .map((id) => [id, raw.confirmed[id]]));
  const assessment = assessBrandColors(brandColors);
  const fullPalette = normalizePalette(palette, brandColors);
  const legacyKey = `${assessment.primary}|${assessment.secondary}`;
  const currentKey = paletteKey(fullPalette), previousBindingKey = currentKey.replace('|header:header|accent:accent', '|header:dark|accent:secondary');
  const fontsKey = typographyKey(typography), brandingKey = `${currentKey}|${fontsKey}`;
  const normalizedFonts = normalizeTypography(typography);
  const validFontInput = typography === undefined || Boolean(typography && typeof typography === 'object' && !Array.isArray(typography)
    && Object.keys(typography).every((key) => ['schema', 'roles'].includes(key)) && typography.schema === normalizedFonts.schema
    && typography.roles && typeof typography.roles === 'object' && !Array.isArray(typography.roles)
    && Object.keys(typography.roles).length === TYPOGRAPHY_ROLES.length
    && TYPOGRAPHY_ROLES.every(({ id }) => Object.hasOwn(typography.roles, id) && typography.roles[id] === normalizedFonts.roles[id]));
  const legacyFonts = fontsKey === typographyKey();
  if (!validFontInput || !paletteProceedStatus(palette ?? { ...fullPalette, roles: { ...fullPalette.roles, ...brandColors } }, acknowledgment).canProceed
    || !(confirmed.colors === brandingKey || legacyFonts && [legacyKey, currentKey, previousBindingKey].includes(confirmed.colors))) delete confirmed.colors;
  else confirmed.colors = brandingKey;
  return { currentStep: checklistSteps.some((step) => step.id === raw?.currentStep) ? raw.currentStep : 'colors', confirmed };
}

// A generic Events or Experience section is not evidence of private hire or food.
// An audited option can explicitly declare its canonical purpose when its slot differs.
export function componentForOption(slot, option) {
  return option.canonicalComponent ?? slot.canonicalComponent ?? REQUIRED_COMPONENTS.find((component) => component.slotIds.includes(slot.id))?.id ?? null;
}

const noteText = (notes) => Array.isArray(notes) ? notes.join(' ') : notes ?? '';
export const visualCaptureKey = (option) => JSON.stringify([option.image ?? null, option.width ?? null, option.height ?? null, option.capture?.capturedAt ?? null, option.sectionIds ?? []]);
export function visualReviewForOption(option) {
  const review = option.visualReview;
  const current = Boolean(review && review.captureKey === visualCaptureKey(option));
  return { ...(review ?? {}), status: current ? review.status : 'not-reviewed', current,
    notes: current ? noteText(review.notes) : 'This preview has not been checked against its label.' };
}
const captureState = (option) => option.captureStatus === 'not-rendered' ? 'not-visible'
  : (option.captureStatus === 'partial' || option.capture?.mode === 'partial') ? 'partial-capture'
    : option.captureStatus === 'captured-live' && option.image && option.width > 0 && option.height > 0 && option.capture?.mode === 'live'
      && !option.capture.appearanceAltered && !option.capture.sampleDataInjected
      ? ({ passed: 'captured', rejected: 'visual-rejected', 'needs-review': 'visual-review' }[visualReviewForOption(option).status] ?? 'visual-pending') : 'capture-pending';
function assessOption(catalog, slot, option, variant = option.variant) {
  const component = componentForOption(slot, option);
  const audit = catalog.componentAudit?.find((entry) => entry.variant === variant && entry.component === component);
  const sourceStatus = option.componentStatus ?? audit?.status ?? 'present';
  return { component, sourceStatus,
    status: sourceStatus === 'missing' ? 'missing-source' : sourceStatus === 'partial' ? 'partial-source'
      : sourceStatus === 'unverified' ? 'needs-audit' : captureState(option),
    notes: noteText(option.componentNote || audit?.notes), auditedAt: option.componentAuditedAt ?? audit?.auditedAt ?? null,
    visualReview: visualReviewForOption(option) };
}

export function buildCoverage(catalog) {
  const { variants } = createModel(catalog);
  const rows = variants.map((variant) => {
    const components = REQUIRED_COMPONENTS.map((component) => {
      const matches = catalog.slots.flatMap((slot) => slot.options
        .filter((option) => (option.sharedBy ?? [option.variant]).includes(variant.id) && componentForOption(slot, option) === component.id)
        .map((option) => ({ slot, option })));
      const audit = catalog.componentAudit?.find((entry) => entry.variant === variant.id && entry.component === component.id);
      const rank = { captured: 0, 'visual-pending': 1, 'visual-review': 2, 'visual-rejected': 3, 'partial-capture': 4, 'capture-pending': 5, 'not-visible': 6, 'partial-source': 7, 'needs-audit': 8, 'missing-source': 9 };
      matches.sort((a, b) => rank[assessOption(catalog, a.slot, a.option, variant.id).status] - rank[assessOption(catalog, b.slot, b.option, variant.id).status]);
      const match = matches[0];
      const assessment = match ? assessOption(catalog, match.slot, match.option, variant.id) : null;
      const sourceStatus = assessment?.sourceStatus ?? audit?.status ?? 'unverified';
      const status = assessment?.status ?? (sourceStatus === 'missing' ? 'missing-source' : sourceStatus === 'partial' ? 'partial-source'
        : sourceStatus === 'present' ? 'capture-pending' : 'needs-audit');
      return { component: component.id, label: component.label, status, sourceStatus,
        slotId: match?.slot.id ?? null, optionId: match?.option.id ?? null,
        notes: assessment?.notes || noteText(audit?.notes), auditedAt: assessment?.auditedAt ?? audit?.auditedAt ?? null,
        designNote: match?.option.designNote ?? null, visualReview: assessment?.visualReview ?? null };
    });
    const captured = components.filter((component) => component.status === 'captured').length;
    return { variant: variant.id, label: variant.label, captured, sourcePresent: components.filter((component) => component.sourceStatus === 'present').length, total: REQUIRED_COMPONENTS.length,
      complete: captured === REQUIRED_COMPONENTS.length, components };
  });
  return { scope: 'catalog', required: REQUIRED_COMPONENTS, rows,
    captured: rows.reduce((total, row) => total + row.captured, 0),
    sourcePresent: rows.reduce((total, row) => total + row.sourcePresent, 0),
    total: rows.length * REQUIRED_COMPONENTS.length,
    completeVariants: rows.filter((row) => row.complete).length };
}

export function buildSelectionCoverage(catalog, state) {
  const model = createModel(catalog);
  const components = REQUIRED_COMPONENTS.map((component) => {
    const selected = state.order.filter((id) => !state.excluded[id]).map((id) => ({ slot: model.slotById.get(id), option: model.pickedOption(state, id) }))
      .filter(({ slot, option }) => componentForOption(slot, option) === component.id);
    const assessed = selected.map(({ slot, option }) => ({ ...assessOption(catalog, slot, option), slotId: slot.id, optionId: option.id, variant: option.variant }));
    const match = assessed.find((entry) => entry.status === 'captured') ?? assessed[0];
    return { component: component.id, label: component.label, ...(match ?? { status: 'missing-selection', sourceStatus: null, slotId: null, optionId: null, variant: null, notes: 'No matching component is included in this selection.' }) };
  });
  const captured = components.filter((component) => component.status === 'captured').length;
  return { scope: 'included-selection', captured, sourcePresent: components.filter((component) => component.sourceStatus === 'present').length, total: REQUIRED_COMPONENTS.length, complete: captured === REQUIRED_COMPONENTS.length, components };
}

export function createModel(catalog) {
  if (!Array.isArray(catalog?.slots) || !catalog.slots.length) throw new Error('The catalog has no sections.');
  const slotById = new Map();
  const optionIds = new Set();
  for (const slot of catalog.slots) {
    if (!slot.id || slotById.has(slot.id) || !slot.options?.length) throw new Error('The catalog has duplicate or empty sections.');
    slotById.set(slot.id, slot);
    for (const option of slot.options) {
      if (!option.id || optionIds.has(option.id)) throw new Error('The catalog has duplicate option identifiers.');
      optionIds.add(option.id);
    }
  }
  const variants = catalog.variants ? [...catalog.variants] : [];
  for (const slot of catalog.slots) for (const option of slot.options) {
    for (const id of option.sharedBy ?? [option.variant]) {
      if (!variants.some((v) => v.id === id)) variants.push({ id, label: option.variantLabel, sourceUrl: option.sourceUrl });
    }
  }
  const optionForVariant = (slot, variantId) => slot.options.find((o) => (o.sharedBy ?? [o.variant]).includes(variantId));
  const capturedVariants = variants.filter((v) => catalog.slots.some((s) => optionForVariant(s, v.id)));
  const ordered = (order) => {
    const ids = [...new Set([...order, ...catalog.slots.map((s) => s.id)])].filter((id) => slotById.has(id));
    return [...(slotById.has('header') ? ['header'] : []), ...ids.filter((id) => !PINNED.has(id)), ...(slotById.has('footer') ? ['footer'] : [])];
  };
  function applyVariant(state, variantId) {
    const variant = variants.find((v) => v.id === variantId);
    state.order = ordered(variant?.sectionOrder ?? catalog.slots.map((s) => s.id));
    for (const slot of catalog.slots) {
      const option = optionForVariant(slot, variantId);
      if (option) {
        state.picks[slot.id] = option.id;
        delete state.excluded[slot.id];
      } else {
        state.picks[slot.id] ??= slot.options[0].id;
        state.excluded[slot.id] = true;
      }
    }
    return state;
  }
  function defaultState(variantId = capturedVariants[0]?.id) {
    return applyVariant({ project: '', notes: '', brandColors: normalizeBrandColors(), palette: normalizePalette(), typography: normalizeTypography(), colorAcknowledgment: null, workflow: normalizeWorkflow(), order: [], picks: {}, excluded: {}, slotNotes: {} }, variantId);
  }
  function normalize(raw) {
    const state = defaultState();
    if (!raw || typeof raw !== 'object') return state;
    if (Array.isArray(raw.sections)) {
      const sections = raw.sections.filter((s) => s && typeof s === 'object');
      raw = {
        schema: raw.schema, project: raw.project, notes: raw.notes, brandColors: raw.brandColors, palette: raw.palette, typography: raw.typography, colorAcknowledgment: raw.colorAcknowledgment, workflow: raw.workflow,
        order: sections.map((s) => s.slot),
        picks: Object.fromEntries(sections.map((s) => [s.slot, s.optionId])),
        excluded: Object.fromEntries(sections.filter((s) => s.included === false).map((s) => [s.slot, true])),
        slotNotes: Object.fromEntries(sections.filter((s) => s.note).map((s) => [s.slot, s.note])),
      };
    }
    state.project = String(raw.project ?? '');
    state.notes = String(raw.notes ?? '');
    const inputPalette = raw.palette && raw.schema !== SCHEMA ? { ...raw.palette, roles: { ...raw.palette.roles, ...raw.brandColors } } : raw.palette;
    state.palette = normalizePalette(inputPalette, raw.brandColors);
    state.brandColors = normalizeBrandColors(state.palette.roles);
    state.typography = normalizeTypography(raw.typography);
    state.colorAcknowledgment = normalizeColorAcknowledgment(raw.colorAcknowledgment, inputPalette ?? { ...state.palette, roles: { ...state.palette.roles, ...raw.brandColors } });
    state.workflow = normalizeWorkflow(raw.workflow, inputPalette?.roles ?? raw.brandColors, inputPalette, state.colorAcknowledgment, raw.typography);
    const providedOrder = Array.isArray(raw.order) ? raw.order : null;
    state.order = ordered(providedOrder ?? []);
    state.excluded = providedOrder ? {} : { ...state.excluded };
    for (const slot of catalog.slots) {
      if (slot.options.some((o) => o.id === raw.picks?.[slot.id])) state.picks[slot.id] = raw.picks[slot.id];
      if (raw.excluded?.[slot.id] || (providedOrder && !providedOrder.includes(slot.id))) state.excluded[slot.id] = true;
      if (raw.slotNotes?.[slot.id]) state.slotNotes[slot.id] = String(raw.slotNotes[slot.id]);
    }
    return state;
  }
  const pickedOption = (state, slotId) => slotById.get(slotId)?.options.find((o) => o.id === state.picks[slotId]);
  return { variants, capturedVariants, slotById, optionForVariant, applyVariant, defaultState, normalize, pickedOption };
}

export function libraryPlan(slot, option) {
  const global = PINNED.has(slot.id);
  const clubhouseFood = slot.id === 'food' && option.variant === 'variant-k-clubhouse';
  return {
    status: clubhouseFood ? 'verified-one-section-page-import-and-unlink' : option.library?.status ?? 'not-created',
    sourcePageTitle: option.sourcePageTitle ?? option.variant,
    proposedPageTitle: global ? null : (option.library?.pageTitle ?? `${option.variant}_${(componentForOption(slot, option) ?? slot.id).replaceAll('-', '_')}`),
    libraryPageId: clubhouseFood ? '5971' : option.library?.pageId ?? null,
    libraryScope: clubhouseFood ? { siteId: '138', role: 'source-library-only' } : option.library?.scope ?? null,
    importPolicy: global ? 'Inspect and recreate the required Theme & Style, Navigations and Global Widgets at the destination. Page Library import does not transfer these site-level settings.' : 'Add From Library, then Unlink and verify Not Linked before local customization. Disabling Library Updates alone retains a link that Force Update can refresh.',
    kind: global ? 'site-global' : 'section-page',
    dependencies: option.dependencies ?? [],
    dependenciesStatus: option.dependenciesStatus ?? 'unverified',
    notes: global ? 'Header/footer configuration must be handled separately from page sections.' : clubhouseFood ? 'A one-section Page was imported cross-site and unlinked. Existing-Page assembly was separately verified by native widget recreation and ordering. A later independent copy passed current-palette desktop and 390px consumer checks. Direct Library Section insertion, cross-page copy, arbitrary palettes, physical devices, Mobile App, checkout and controlled empty state remain unverified; the mobile category label can lag after a successful jump.' : 'Proposed carrier page; portability is unverified for this component. Library Page import creates a separate Page; existing-Page assembly requires its own verified installation method.',
  };
}

export function buildExport(catalog, state, baseUrl, exportedAt = new Date().toISOString()) {
  const model = createModel(catalog);
  const absolute = (path) => path ? new URL(path, baseUrl).href : null;
  const palette = normalizePalette(paletteForState(state));
  const typography = typographyForState(state);
  return {
    schema: SCHEMA,
    project: state.project.trim(), exportedAt, notes: state.notes.trim(),
    brandColors: normalizeBrandColors(state.brandColors),
    brandColorAssessment: assessBrandColors(normalizeBrandColors(state.brandColors)),
    palette, paletteAssessment: assessPalette(palette),
    typography, typographyBindings: typographyBindings(typography),
    colorAcknowledgment: normalizeColorAcknowledgment(state.colorAcknowledgment, paletteForState(state)),
    colorReview: paletteProceedStatus(paletteForState(state), state.colorAcknowledgment),
    workflow: normalizeWorkflow(state.workflow, state.brandColors, paletteForState(state), state.colorAcknowledgment, state.typography),
    catalogGeneratedAt: catalog.generatedAt,
    sourceSite: catalog.sourceSite ?? { url: catalog.source },
    captureNotes: catalog.captureNotes ?? [],
    requiredComponentCoverage: buildCoverage(catalog),
    selectionComponentCoverage: buildSelectionCoverage(catalog, state),
    movieModulePolicy: catalog.movieModulePolicy ?? null,
    sections: state.order.map((slotId, i) => {
      const slot = model.slotById.get(slotId);
      const option = model.pickedOption(state, slotId);
      const assessment = assessOption(catalog, slot, option);
      return {
        position: i + 1, slot: slotId, slotLabel: slot.label, included: !state.excluded[slotId],
        optionId: option.id, variant: option.variant, variantLabel: designName(option, catalog, { grouped:false }),
        displayName: DEMO_DESIGN_NAMES[option.variant] ? `${designName(option, catalog, { grouped:false })} — ${slot.label}` : option.name,
        sourceName: option.sourceName ?? option.name, sourceAliasNote: option.sourceAliasNote ?? null,
        sharedBy: option.sharedBy ?? [option.variant], components: option.components,
        sourceUrl: option.sourceUrl, sourcePageTitle: option.sourcePageTitle ?? option.variant,
        publishedPageId: option.pageId ?? null, draftPageId: option.draftId ?? null,
        sourceIdsOnly: true,
        sourceSite: option.sourceSite ?? catalog.sourceSite ?? null,
        sourceReference: { site: option.sourceSite ?? catalog.sourceSite ?? null, publishedPageId: option.pageId ?? null, draftPageId: option.draftId ?? null, sectionIds: option.sectionIds ?? [], draftSectionIds: option.draftSectionIds ?? [], url: option.sourceUrl },
        legacySourceReference: option.legacySourceReference ?? null,
        demoProvenance: option.demoProvenance ?? null,
        adminUrl: option.adminUrl ?? null, sectionIds: option.sectionIds ?? [], draftSectionIds: option.draftSectionIds ?? [],
        screenshot: absolute(option.image), screenshots: Object.fromEntries(Object.entries(option.screenshots ?? { desktop: { image: option.image, width: option.width, height: option.height } }).map(([device, capture]) => [device, { ...capture, image: absolute(capture.image) }])),
        captureStatus: option.captureStatus ?? null, capture: option.capture ?? null, library: libraryPlan(slot, option),
        visualReview: assessment.visualReview,
        canonicalComponent: componentForOption(slot, option),
        componentGroup: MOVIE_COMPONENTS.has(slotId) ? 'optional-movie-module' : componentForOption(slot, option) ? 'required-component' : 'additional-section',
        componentStatus: assessment.component ? assessment.sourceStatus : null,
        componentNote: assessment.notes, componentAuditedAt: assessment.auditedAt,
        designNote: option.designNote ?? null,
        presentation: option.presentation ?? null,
        note: state.slotNotes[slotId] ?? '',
      };
    }),
  };
}

export function buildBuildBrief(catalog, state, baseUrl, context = {}, exportedAt) {
  if (!/^[a-f0-9]{64}$/.test(context.catalogSha256 ?? '') || !/^[a-f0-9]{64}$/.test(context.moduleIndexSha256 ?? '')) throw new Error('Verified catalog and module index digests are required.');
  if (context.moduleIndex?.schema !== 'fd-picker-module-index/v1' || context.moduleIndex.catalogSha256 !== context.catalogSha256) throw new Error('The module index does not match this catalog.');
  const data = buildExport(catalog, state, baseUrl, exportedAt);
  const modules = data.sections.filter((section) => section.included).map((section) => ({
    component: section.canonicalComponent ?? section.slot, slot: section.slot, optionId: section.optionId,
    sourceReference: section.sourceReference,
    ...(context.moduleIndex?.modules?.[section.optionId] ?? { readiness: 'unverified-portability', installationMethod: 'manual-source-review-required', artifacts: [], limitations: ['No verified portable installation package is registered for this option.'] }),
  }));
  data.buildContract = {
    version: 1, publicationPolicy: 'draft-only', destination: null, destinationAuthorizationRequired: true,
    sourceIdsAreDestinationIds: false, sourceReferencePolicy: 'All catalog/native IDs identify source evidence only. Resolve or create destination IDs after exact target authorization.',
    catalog: { generatedAt: catalog.generatedAt ?? null, sha256: context.catalogSha256 },
    moduleIndex: { schema: context.moduleIndex?.schema ?? null, sha256: context.moduleIndexSha256 },
    paletteBindingNote: PALETTE_BINDING_NOTE,
    typographyBindingNote: TYPE_NOTE,
    typographyApplicationPolicy: 'Resolve destination native font controls and verify each requested role before applying; these bindings are choices, not native application evidence.',
    checklistComplete: paletteProceedStatus(data.palette, data.colorAcknowledgment).canProceed && data.workflow.confirmed.colors === `${paletteKey(data.palette)}|${typographyKey(data.typography)}` && REQUIRED_COMPONENTS.every(({ id }) => {
      const matches = modules.filter((module) => module.component === id);
      return matches.length === 1 && data.workflow.confirmed[id] === matches[0].optionId;
    }),
    componentOrder: modules.map((module) => module.component), modules,
    executionReadiness: 'requires-target-preflight-and-module-validation',
    requiredPreflight: ['Confirm destination Region, Circuit, Site and new/existing-site scope.', 'Validate catalog/module/artifact digests and native field ownership.', 'Resolve destination navigation, catalog, forms, media and booking dependencies.', 'Preview draft desktop/real phone and rendered contrast; do not publish or provision hosting from source IDs.'],
  };
  return data;
}

export function buildHandoff(data) {
  const lines = [`# ${data.project || 'Cinema'} template handoff`, '', `Exported: ${data.exportedAt}`, '',
    'This is a visual selection and transfer plan. It does not create INDY pages or prove that Library copies are ready.', ''];
  const colors = normalizeBrandColors(data.brandColors), contrast = assessBrandColors(colors);
  lines.push('## Brand colors', '', `- Primary: ${colors.primary}`, `- Secondary: ${colors.secondary}`,
    `- Text contrast: ${contrast.ratio.toFixed(2)}:1; ${contrast.normalText.passes ? 'meets' : 'below'} the 4.5:1 minimum for normal text.`,
    `- Large text: ${contrast.largeText.passes ? 'meets' : 'below'} the 3:1 minimum.`,
    `- ${contrast.note}`, '- This color-pair check does not assess the completed website.', '');
  const palette = normalizePalette(data.palette, data.brandColors);
  lines.push(...COLOR_ROLES.filter(({ id }) => !['primary', 'secondary'].includes(id)).map(({ id, label }) => `- ${label}: ${palette.roles[id]}`), `- ${PALETTE_BINDING_NOTE}`, '');
  if (data.colorAcknowledgment) lines.push(`- Contrast exception acknowledged for this palette at ${data.colorAcknowledgment.acknowledgedAt}.`, `- ${data.colorAcknowledgment.statement}`, '- Website team: review text colors before publishing; acknowledgment does not establish accessibility compliance.', '');
  const fonts = typographyBindings(data.typography);
  lines.push('## Fonts', '', ...TYPOGRAPHY_ROLES.map(({ id, label }) => `- ${label}: ${fonts[id].family}; CSS stack: ${fonts[id].stack}; applies to ${fonts[id].appliesTo}`), `- ${TYPE_NOTE}`, '');
  const progress = normalizeWorkflow(data.workflow, data.brandColors, palette, data.colorAcknowledgment, data.typography);
  const recordedSteps = checklistSteps.filter((step) => progress.confirmed[step.id]).map((step) => step.label);
  lines.push(`Checklist saved at: ${checklistSteps.find((step) => step.id === progress.currentStep).label}.`,
    `Recorded confirmations: ${recordedSteps.join(', ') || 'None yet'}.`, '');
  if (data.selectionComponentCoverage) {
    const coverage = data.selectionComponentCoverage;
    lines.push(`Required source components in this selection: ${coverage.sourcePresent}/${coverage.total} present.`, `Required previews visually checked: ${coverage.captured}/${coverage.total}.`, '');
    for (const component of coverage.components.filter((entry) => entry.status !== 'captured')) lines.push(`- ${component.label}: ${component.status.replaceAll('-', ' ')}. ${component.notes}`);
    lines.push('', 'Movie discovery and booking modules are optional design choices while native layouts are verified.', '');
  }
  for (const section of data.sections.filter((s) => s.included)) {
    lines.push(`## ${section.position}. ${section.slotLabel} — ${section.variantLabel}`, '',
      `- Components: ${section.components.join(' + ')}`, `- Source: ${section.sourceUrl}`,
      `- Published page: ${section.publishedPageId ?? 'Unverified'}; sections: ${section.sectionIds.join(', ') || 'Unverified'}`,
      `- Screenshot: ${section.screenshot || 'Not captured'}`, `- Library status: ${section.library.status}`,
      `- Transfer object: ${section.library.proposedPageTitle || 'Site-level configuration'}`,
      `- Transfer policy: ${section.library.importPolicy}`);
    lines.push(`- Transfer notes: ${section.library.notes}`);
    lines.push(`- Preview review: ${section.visualReview?.status ?? 'not-reviewed'}. ${section.visualReview?.notes ?? ''}`);
    if (section.sourceAliasNote) lines.push(`- Source alias: ${section.sourceAliasNote}`);
    if (section.componentStatus === 'partial') lines.push(`- Required component coverage: partial ${section.canonicalComponent ?? 'source section'}; review before use.`);
    if (section.componentNote) lines.push(`- Component audit: ${section.componentNote}`);
    if (section.designNote) lines.push(`- Design review: ${section.designNote}`);
    if (section.draftPageId) lines.push(`- Separate editable draft: ${section.draftPageId}; draft sections: ${section.draftSectionIds.join(', ') || 'Unverified'}`);
    lines.push(`- Dependency review: ${section.library.dependenciesStatus}`);
    if (section.library.dependencies.length) lines.push(`- Dependencies: ${section.library.dependencies.join('; ')}`);
    if (section.note) lines.push(`- Designer note: ${section.note}`);
    lines.push('');
  }
  if (data.captureNotes.length) lines.push('## Screenshot notes', '', ...data.captureNotes.map((n) => `- ${n}`), '');
  if (data.notes) lines.push('## Project notes', '', data.notes, '');
  return lines.join('\n');
}
