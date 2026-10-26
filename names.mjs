// Presentation names only. Native IDs, source Page titles and source evidence
// retain their original values so saved selections remain resolvable.
export const DEMO_DESIGN_NAMES = Object.freeze({
  'variant-a-circuit': 'Showcase',
  'variant-b-rep': 'Reel',
  'variant-c-late': 'Neon',
  'variant-d-odd': 'Cameo',
  'variant-e-grid': 'Metropolis',
  'variant-f-concrete': 'Encore',
  'variant-g-cut': 'Splice',
  'variant-h-storybook': 'Prologue',
  'variant-i-ma': 'Pause',
});

export function designName(option, catalog, { grouped = true } = {}) {
  const group = option.customerDesign;
  if (grouped && group?.id && group.reviewedAt) {
    const names = new Set((catalog?.slots ?? []).flatMap(slot => slot.options ?? [])
      .filter(candidate => candidate.customerAvailable !== false
        && candidate.customerDesign?.id === group.id && candidate.customerDesign.reviewedAt)
      .map(candidate => DEMO_DESIGN_NAMES[candidate.variant]).filter(Boolean));
    if (names.size) return [...names].join(' / ');
    if (group.label) return group.label;
  }
  return DEMO_DESIGN_NAMES[option.variant ?? option.id] ?? option.variantLabel ?? option.displayName ?? option.label ?? 'Design';
}
