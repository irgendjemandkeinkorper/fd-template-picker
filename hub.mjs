export const HUB_DATA_URL = './data/template-hub.json';

const INITIAL_VARIANT_IDS = Object.freeze([
  'variant-a-circuit', 'variant-b-rep', 'variant-c-late',
  'variant-d-odd', 'variant-e-grid', 'variant-f-concrete',
  'variant-g-cut', 'variant-h-storybook', 'variant-i-ma',
]);

function requireText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing Hub ${field}`);
  return value.trim();
}

function currentSourceUrl(variant, sourceOrigin) {
  const url = new URL(requireText(variant.sourceUrl, 'source URL'));
  if (url.protocol !== 'https:' || url.origin !== sourceOrigin) throw new Error('Hub source URL does not match the catalog');
  return url.href;
}

function thumbnailFor(catalog, template, displayName) {
  const slot = catalog.slots?.find((entry) => entry.id === template.thumbnailSlotId);
  const option = slot?.options?.find((entry) => entry.variant === template.id);
  if (!option || option.captureStatus !== 'captured-live' || option.visualReview?.status !== 'passed') {
    throw new Error(`No reviewed Hub thumbnail for ${template.id}`);
  }
  const path = requireText(option.image, 'thumbnail');
  if (!/^screenshots\/[a-z0-9/_.-]+\.jpg$/i.test(path) || path.split('/').includes('..')) {
    throw new Error('Hub thumbnail must be a catalog screenshot');
  }
  const version = option.visualReview.imageSha256?.slice(0, 12) ?? option.capture?.capturedAt;
  return {
    src: `${path}${version ? `?v=${encodeURIComponent(version)}` : ''}`,
    alt: `${displayName} ${slot.label.toLowerCase()} preview`,
    width: option.width,
    height: option.height,
    sourceOptionId: option.id,
    slotId: slot.id,
  };
}

// This is a read-only catalog view. It neither normalizes nor saves picker choices.
export function createTemplateHubModel(catalog, data) {
  if (data?.schema !== 'fd-template-hub/v1' || !Array.isArray(data.templates)) throw new Error('Unsupported Hub data');
  const source = new URL(requireText(catalog?.source, 'catalog source'));
  const catalogVariants = new Map((catalog.variants ?? []).map((variant) => [variant.id, variant]));
  const dataById = new Map();
  for (const template of data.templates) {
    if (!INITIAL_VARIANT_IDS.includes(template.id) || dataById.has(template.id)) throw new Error('Hub must contain A–I once each');
    dataById.set(template.id, template);
  }
  if (dataById.size !== INITIAL_VARIANT_IDS.length) throw new Error('Hub must contain all nine initial templates');
  const displayNames = new Set();
  const templates = INITIAL_VARIANT_IDS.map((id, index) => {
    const template = dataById.get(id);
    const variant = catalogVariants.get(id);
    if (!variant) throw new Error(`Hub source missing from catalog: ${id}`);
    const displayName = requireText(template.displayName, 'display name');
    if (!/^[A-Za-z]+$/.test(displayName) || displayNames.has(displayName.toLowerCase())) throw new Error('Hub names must be distinct single words');
    displayNames.add(displayName.toLowerCase());
    // A provisioned shell is not a reviewed template demo.
    const demoSiteStatus = template.demoSite?.status;
    if (!['not-provisioned', 'shell-provisioned'].includes(demoSiteStatus) || template.demoSite.homepageUrl !== null || template.demoSite.showcaseUrl !== null) {
      throw new Error('Unverified demo Site URLs must not be exposed by the initial Hub');
    }
    const currentLabel = requireText(variant.label, 'catalog label').replace(/^[A-Z]\s*·\s*/, '');
    return {
      id,
      letter: String.fromCharCode(65 + index),
      displayName,
      nameStatus: data.nameStatus,
      currentLabel,
      description: requireText(template.description, 'description'),
      sourceUrl: currentSourceUrl(variant, source.origin),
      sourceLinkLabel: 'View current demo ↗',
      thumbnail: thumbnailFor(catalog, template, displayName),
      demoSiteStatus,
      homepageUrl: null,
      showcaseUrl: null,
    };
  });
  return {
    title: requireText(data.title, 'title'),
    description: requireText(data.description, 'description'),
    notice: requireText(data.notice, 'notice'),
    nameStatus: data.nameStatus,
    scope: data.scope,
    templates,
  };
}

export function renderTemplateHub(catalog, data, { document: ownerDocument = globalThis.document } = {}) {
  if (!ownerDocument?.createElement) throw new Error('A document is required to render the Hub');
  const model = createTemplateHubModel(catalog, data);
  const element = (tag, className, text) => {
    const node = ownerDocument.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const root = element('section', 'template-hub');
  root.setAttribute('aria-labelledby', 'templateHubTitle');
  const intro = element('div', 'hub-intro');
  const heading = element('h1', '', model.title);
  heading.id = 'templateHubTitle';
  heading.tabIndex = -1;
  intro.append(heading, element('p', '', model.description));
  root.append(intro, element('p', 'hub-notice', 'Demo images keep their original colors.'));
  const grid = element('div', 'hub-grid');
  grid.setAttribute('role', 'list');
  for (const template of model.templates) {
    const card = element('article', 'hub-card');
    card.setAttribute('role', 'listitem');
    const image = element('img', 'hub-card__image');
    image.src = template.thumbnail.src;
    image.alt = template.thumbnail.alt;
    image.width = template.thumbnail.width;
    image.height = template.thumbnail.height;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.replaceWith(element('p', 'hub-card__status', 'The image is unavailable. You can still open the current demo.'));
    }, { once: true });
    const body = element('div', 'hub-card__body');
    const title = element('h2', 'hub-card__title', template.displayName);
    title.id = `hub-${template.id}`;
    card.setAttribute('aria-labelledby', title.id);
    const actions = element('div', 'hub-card__actions');
    const demoLink = element('a', 'hub-card__link', template.sourceLinkLabel);
    demoLink.href = template.sourceUrl;
    demoLink.target = '_blank';
    demoLink.rel = 'noopener noreferrer';
    demoLink.setAttribute('aria-label', `View ${template.displayName} demo in a new tab`);
    actions.append(demoLink);
    body.append(
      title,
      element('p', 'hub-card__description', template.description),
      actions,
    );
    card.append(image, body);
    grid.append(card);
  }
  root.append(grid);
  return root;
}
