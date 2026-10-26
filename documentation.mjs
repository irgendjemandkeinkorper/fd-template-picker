export const SUPPORT_GUIDES = Object.freeze([
  ['showcase', 'Showcase', 'Gold accents, compact cards and cinema navigation.'],
  ['reel', 'Reel', 'Printed menus, editorial occasions and subscriber benefits.'],
  ['neon', 'Neon', 'Dark teal panels, ticket cards and a tiled menu.'],
  ['cameo', 'Cameo', 'Paper collage, postcards and tilted membership cards.'],
  ['metropolis', 'Metropolis', 'Orderly packages, product grids and tier comparisons.'],
  ['encore', 'Encore', 'Numbered navigation, price-led menus and graphic ledgers.'],
  ['splice', 'Splice', 'Poster typography, diagonal panels and alternating tiles.'],
  ['prologue', 'Prologue', 'Framed invitations, soft tints and a letter-style form.'],
  ['pause', 'Pause', 'Quiet numbered rows, generous space and fine dividers.'],
].map(([id, name, description]) => Object.freeze({ id, name, description })));

export function renderDocumentation() {
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  const section = node('section', 'template-hub documentation');
  const heading = node('h1', '', 'Template documentation');
  heading.id = 'documentationTitle'; heading.tabIndex = -1;
  section.append(node('p', 'eyebrow', 'For your website team'), heading,
    node('p', 'documentation-intro', 'Choose a design for editing instructions, color mappings and answers to common support questions.'));
  const grid = node('div', 'documentation-grid');
  for (const guide of SUPPORT_GUIDES) {
    const card = node('article', `documentation-card documentation-card--${guide.id}`);
    const link = node('a', 'button button--secondary', `Read ${guide.name} guide`);
    link.href = `support/${guide.id}.html`;
    card.append(node('h2', '', guide.name), node('p', '', guide.description), link);
    grid.append(card);
  }
  section.append(grid, node('p', 'documentation-note', 'Guides cover the nine current demo sites and include exact Admin locations, saved color repairs and known limitations. Last reviewed October 26, 2026.'));
  return section;
}
