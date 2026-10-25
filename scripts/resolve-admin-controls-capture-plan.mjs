// Serializable, DOM-only observation. It neither scrolls nor changes the page.
// Pass resolveAdminControlsCapturePlan.toString() into the existing supported
// read-only browser evaluation API; do not install a script in the page.
export function resolveAdminControlsCapturePlan(plan, doc, runtime) {
  const context = runtime || {};
  const observedAt = context.observedAt || null; // Stamp from the CUA/Node caller.
  const all = (root, selector) => Array.from(root.querySelectorAll(selector));
  const unique = items => items.filter((item, index) => items.indexOf(item) === index);
  const classes = node => String(node.getAttribute('class') || '').split(/\s+/).filter(Boolean);
  const style = node => typeof getComputedStyle === 'function' ? getComputedStyle(node) : context.getComputedStyle(node);
  const viewportWidth = typeof innerWidth === 'undefined' ? context.innerWidth || doc.documentElement.clientWidth : innerWidth;
  const viewportHeight = typeof innerHeight === 'undefined' ? context.innerHeight || doc.documentElement.clientHeight : innerHeight;
  const scrollX = Number.isFinite(context.scrollX) ? context.scrollX : Number(doc.documentElement.scrollLeft);
  const scrollY = Number.isFinite(context.scrollY) ? context.scrollY : Number(doc.documentElement.scrollTop);
  const rect = node => {
    const value = node.getBoundingClientRect();
    return { x: value.x, y: value.y, width: value.width, height: value.height };
  };
  const shown = node => {
    const bounds = rect(node);
    if (!(bounds.width > 0 && bounds.height > 0)) return false;
    for (let parent = node; parent; parent = parent.parentElement) {
      const paint = style(parent);
      if (paint.display === 'none' || paint.visibility === 'hidden' || paint.visibility === 'collapse'
        || Number(paint.opacity || 1) === 0 || parent.getAttribute('aria-hidden') === 'true') return false;
    }
    return true;
  };
  const documentRect = node => {
    const value = rect(node);
    return { ...value, x: value.x + scrollX, y: value.y + scrollY };
  };
  const normalizeURL = value => {
    return String(value || '').split('#')[0].split('?')[0].replace(/\/+$/, '') + '/';
  };
  const currentURL = doc.URL || context.currentURL || '';
  const required = Array.isArray(plan) ? plan : plan.required;
  if (!Array.isArray(required)) throw new Error('Expected reviewed capture-plan required choices');
  const pageChoices = required.filter(item => normalizeURL(item.sourceUrl) === normalizeURL(currentURL));
  const blockers = [];
  if (!classes(doc.body).includes('site-170')) blockers.push('Wrong or unverified native Site body');
  if (!pageChoices.length) blockers.push('Current URL is not a planned published source route');
  if (doc.readyState && doc.readyState !== 'complete') blockers.push('Document is still loading');
  if (!Number.isFinite(scrollX) || !Number.isFinite(scrollY)) blockers.push('Actual scroll offsets unavailable; provide observed runtime scrollX/scrollY before resolving document clips');
  if (viewportWidth < 1024) blockers.push('Mobile viewport: keep phone QA separate from desktop picker assets');
  const variants = unique(pageChoices.map(item => item.variant));
  if (variants.length !== 1) blockers.push('Planned source variant is absent or ambiguous');
  const variant = variants[0];
  const pageCandidates = variant ? all(doc, '[class*="page-variant-"]').filter(node => shown(node)
    && classes(node).some(value => value.startsWith(`page-${variant}-`) && /-\d+$/.test(value))) : [];
  if (pageCandidates.length !== 1) blockers.push('Expected exactly one visible native page wrapper');
  const page = pageCandidates.length === 1 ? pageCandidates[0] : null;
  const pageClass = page ? classes(page).find(value => value.startsWith(`page-${variant}-`) && /-\d+$/.test(value)) : null;
  const pageId = pageClass?.match(/-(\d+)$/)?.[1] ?? null;
  const layout = page?.closest('.q-layout');
  const headers = layout ? all(layout, 'header.consumer-header').filter(shown) : [];
  const header = headers.length === 1 ? headers[0] : null;
  const sections = page ? all(page, '[data-test-id="section-content"]').filter(shown).map((node, index) => {
    const named = unique(classes(node).filter(value => /^section-[a-z0-9-]+-\d+$/.test(value)));
    return { node, index, classes: named, ids: unique(named.map(value => value.match(/-(\d+)$/)[1])),
      dataAttributes: { 'data-test-id': node.getAttribute('data-test-id') },
      headings: all(node, 'h1,h2,h3,h4').filter(shown).map(item => item.textContent.trim()).filter(Boolean),
      sourceBounds: documentRect(node), viewportBounds: rect(node) };
  }) : [];
  const palette = Object.fromEntries(['primary', 'secondary', 'dark', 'background'].map(role => [role, style(doc.body).getPropertyValue(`--q-${role}`).trim()]));
  if (Object.values(palette).some(value => !value)) blockers.push('Native body palette is incomplete');
  const union = members => {
    const x = Math.min(...members.map(item => item.x)), y = Math.min(...members.map(item => item.y));
    return { x, y, width: Math.max(...members.map(item => item.x + item.width)) - x,
      height: Math.max(...members.map(item => item.y + item.height)) - y };
  };
  const clips = pageChoices.map(choice => {
    const issues = [...blockers], notes = [], matches = [], methods = [];
    if (pageId !== String(choice.pageId)) issues.push('Actual page ID differs from catalog; existing correction pipeline requires explicit plan/catalog identity review');
    if (choice.slot === 'header') {
      if (!header) issues.push('Expected exactly one visible native header inside the actual layout');
      if (Math.abs(scrollX) > 1 || Math.abs(scrollY) > 1) issues.push('Read header again at document top before native capture');
    } else {
      const oldIds = (choice.sectionIds ?? []).map(String);
      if (!oldIds.length) issues.push('Content option has no reviewed source section IDs');
      for (const id of oldIds) {
        let found = sections.filter(item => item.ids.includes(id));
        let method = 'exact-published-section-id';
        if (!found.length) {
          // Names are identity hints, never semantic approval. Derive stems
          // only from the exact old selectors already recorded in the catalog.
          const oldNames = (choice.previousSelectors ?? []).flatMap(selector => selector.match(/section-[a-z0-9-]+-\d+/g) ?? [])
            .filter(value => value.endsWith(`-${id}`)).map(value => value.replace(/-\d+$/, ''));
          found = sections.filter(item => item.classes.some(value => oldNames.includes(value.replace(/-\d+$/, ''))));
          method = 'old-class-stem-hint-requires-semantic-review';
        }
        if (found.length !== 1 || found[0].ids.length !== 1) issues.push(`Published source ${id} is missing or ambiguous; inspect the actual named section`);
        else { matches.push(found[0]); methods.push(method); }
      }
      if (unique(matches.map(item => item.node)).length !== matches.length) issues.push('Multiple reviewed sections resolved to the same element');
      if (matches.length > 1) {
        const positions = matches.map(item => item.index).sort((a, b) => a - b);
        if (positions[positions.length - 1] - positions[0] + 1 !== positions.length) issues.push('Merged source sections are no longer consecutive; do not capture an unrelated intervening component');
      }
    }
    const nodes = choice.slot === 'header' ? (header ? [header] : []) : matches.map(item => item.node);
    const bounds = nodes.length ? union(nodes.map(documentRect)) : null;
    const viewportBounds = nodes.length ? union(nodes.map(rect)) : null;
    let captureBounds = null;
    if (bounds) {
      if (bounds.x < 0 || bounds.y < 0 || !Number.isFinite(bounds.width + bounds.height)) issues.push('Invalid or negative document bounds; inspect containment');
      else captureBounds = { x: Math.floor(bounds.x), y: Math.floor(bounds.y),
        width: Math.ceil(bounds.x + bounds.width) - Math.floor(bounds.x),
        height: Math.ceil(bounds.y + bounds.height) - Math.floor(bounds.y) };
      if (header && choice.slot !== 'header') {
        const h = documentRect(header);
        if (bounds.x < h.x + h.width && bounds.x + bounds.width > h.x && bounds.y < h.y + h.height && bounds.y + bounds.height > h.y)
          notes.push('Current fixed/sticky header overlaps this document rectangle; inspect screenshot occlusion and choose a supported native capture position');
      }
    }
    const images = nodes.flatMap(node => all(node, 'img')).filter(shown).map(node => ({ src: node.currentSrc || node.getAttribute('src'),
      complete: node.complete, naturalWidth: node.naturalWidth, naturalHeight: node.naturalHeight, viewportBounds: rect(node) }));
    if (images.some(image => !image.complete || image.naturalWidth === 0)) issues.push('An observed image is incomplete or broken; wait/inspect before capture');
    const observedIds = choice.slot === 'header' ? [] : matches.flatMap(item => item.ids);
    const changed = JSON.stringify([...observedIds].sort()) !== JSON.stringify((choice.sectionIds ?? []).map(String).sort());
    if (changed) notes.push('Published section IDs changed: explicit sourceIdentityVerified is required after semantic review');
    const selectors = choice.slot === 'header' ? (header ? [{ selector: `body.site-170 .q-layout:has(.${pageClass}) header.consumer-header` }] : [])
      : matches.map(item => ({ id: item.ids[0], selector: `.${pageClass} .${item.classes[0]}`, classes: classes(item.node).join(' '), headings: item.headings }));
    return { optionId: choice.optionId, variant: choice.variant, slot: choice.slot, sourceUrl: choice.sourceUrl, observedURL: currentURL, pageId,
      sectionIds: observedIds, sectionSelectors: selectors, sourceBounds: bounds, viewportBounds, captureBounds,
      matchMethods: methods, sourceIdentityChanged: changed, semanticReviewRequired: true,
      nativeClipReadyAfterSemanticReview: issues.length === 0, blockers: issues, notes, images,
      nativeHeaderLinks: choice.slot === 'header' && header ? all(header, '.row.menu a').filter(shown).map(node => ({ text: node.textContent.trim(), href: node.getAttribute('href') })) : undefined };
  });
  return { schema: 'fd-native-capture-dom-observation/v1', observedAt, currentURL, variant, pageClass, pageId,
    viewport: { width: viewportWidth, height: viewportHeight }, scroll: { x: scrollX, y: scrollY },
    devicePixelRatio: context.devicePixelRatio ?? null, visualViewportScale: context.visualViewportScale ?? null,
    document: { clientWidth: doc.documentElement.clientWidth, scrollWidth: doc.documentElement.scrollWidth, scrollHeight: doc.documentElement.scrollHeight },
    nativePalette: palette, sourceState: 'requires-root-published-route-verification', blockers,
    renderedSectionCount: sections.length,
    actualSections: sections.map(({ node, ...item }) => item), clips,
    safety: 'Read-only DOM and computed geometry; no scroll, click, CSS change, fixture, network request, private app state or automatic semantic approval.' };
}
