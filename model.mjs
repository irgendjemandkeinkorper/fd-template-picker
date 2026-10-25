export const SCHEMA = 'fd-template-picker/v2';
export const SUPPORTED_SCHEMAS = new Set(['fd-template-picker/v1', SCHEMA]);
export const PINNED = new Set(['header', 'footer']);

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
    return applyVariant({ project: '', notes: '', order: [], picks: {}, excluded: {}, slotNotes: {} }, variantId);
  }
  function normalize(raw) {
    const state = defaultState();
    if (!raw || typeof raw !== 'object') return state;
    if (Array.isArray(raw.sections)) {
      const sections = raw.sections.filter((s) => s && typeof s === 'object');
      raw = {
        project: raw.project, notes: raw.notes,
        order: sections.map((s) => s.slot),
        picks: Object.fromEntries(sections.map((s) => [s.slot, s.optionId])),
        excluded: Object.fromEntries(sections.filter((s) => s.included === false).map((s) => [s.slot, true])),
        slotNotes: Object.fromEntries(sections.filter((s) => s.note).map((s) => [s.slot, s.note])),
      };
    }
    state.project = String(raw.project ?? '');
    state.notes = String(raw.notes ?? '');
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
  return {
    status: option.library?.status ?? 'not-created',
    sourcePageTitle: option.sourcePageTitle ?? option.variant,
    proposedPageTitle: global ? null : (option.library?.pageTitle ?? `${option.variant}_${slot.id.replaceAll('-', '_')}`),
    libraryPageId: option.library?.pageId ?? null,
    libraryScope: option.library?.scope ?? null,
    importPolicy: global ? 'Inspect and recreate the required Theme & Style, Navigations and Global Widgets at the destination. Page Library import does not transfer these site-level settings.' : 'Add From Library, then Unlink and verify Not Linked before local customization. Disabling Library Updates alone retains a link that Force Update can refresh.',
    kind: global ? 'site-global' : 'section-page',
    dependencies: option.dependencies ?? [],
    dependenciesStatus: option.dependenciesStatus ?? 'unverified',
    notes: global ? 'Header/footer configuration must be handled separately from page sections.' : 'Proposed carrier page; creation and cross-site transfer have not been verified. Importing creates a separate Page; assembling it into an existing homepage is unverified.',
  };
}

export function buildExport(catalog, state, baseUrl, exportedAt = new Date().toISOString()) {
  const model = createModel(catalog);
  const absolute = (path) => path ? new URL(path, baseUrl).href : null;
  return {
    schema: SCHEMA,
    project: state.project.trim(), exportedAt, notes: state.notes.trim(),
    catalogGeneratedAt: catalog.generatedAt,
    sourceSite: catalog.sourceSite ?? { url: catalog.source },
    captureNotes: catalog.captureNotes ?? [],
    sections: state.order.map((slotId, i) => {
      const slot = model.slotById.get(slotId);
      const option = model.pickedOption(state, slotId);
      return {
        position: i + 1, slot: slotId, slotLabel: slot.label, included: !state.excluded[slotId],
        optionId: option.id, variant: option.variant, variantLabel: option.variantLabel,
        sharedBy: option.sharedBy ?? [option.variant], components: option.components,
        sourceUrl: option.sourceUrl, sourcePageTitle: option.sourcePageTitle ?? option.variant,
        publishedPageId: option.pageId ?? null, draftPageId: option.draftId ?? null,
        adminUrl: option.adminUrl ?? null, sectionIds: option.sectionIds ?? [], draftSectionIds: option.draftSectionIds ?? [],
        screenshot: absolute(option.image), screenshots: Object.fromEntries(Object.entries(option.screenshots ?? { desktop: { image: option.image, width: option.width, height: option.height } }).map(([device, capture]) => [device, { ...capture, image: absolute(capture.image) }])),
        capture: option.capture ?? null, library: libraryPlan(slot, option),
        presentation: option.presentation ?? null,
        note: state.slotNotes[slotId] ?? '',
      };
    }),
  };
}

export function buildHandoff(data) {
  const lines = [`# ${data.project || 'Cinema'} template handoff`, '', `Exported: ${data.exportedAt}`, '',
    'This is a visual selection and transfer plan. It does not create INDY pages or prove that Library copies are ready.', ''];
  for (const section of data.sections.filter((s) => s.included)) {
    lines.push(`## ${section.position}. ${section.slotLabel} — ${section.variantLabel}`, '',
      `- Components: ${section.components.join(' + ')}`, `- Source: ${section.sourceUrl}`,
      `- Published page: ${section.publishedPageId ?? 'Unverified'}; sections: ${section.sectionIds.join(', ') || 'Unverified'}`,
      `- Screenshot: ${section.screenshot || 'Not captured'}`, `- Library status: ${section.library.status}`,
      `- Transfer object: ${section.library.proposedPageTitle || 'Site-level configuration'}`,
      `- Transfer policy: ${section.library.importPolicy}`);
    lines.push(`- Transfer notes: ${section.library.notes}`);
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
