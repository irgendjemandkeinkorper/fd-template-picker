export const FONT_OPTIONS = Object.freeze([
  { id: 'arial', label: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
  { id: 'verdana', label: 'Verdana', stack: 'Verdana, Geneva, sans-serif' },
  { id: 'tahoma', label: 'Tahoma', stack: 'Tahoma, Verdana, Arial, sans-serif' },
  { id: 'trebuchet-ms', label: 'Trebuchet MS', stack: '"Trebuchet MS", Arial, sans-serif' },
  { id: 'georgia', label: 'Georgia', stack: 'Georgia, "Times New Roman", Times, serif' },
  { id: 'times-new-roman', label: 'Times New Roman', stack: '"Times New Roman", Times, serif' },
  { id: 'courier-new', label: 'Courier New', stack: '"Courier New", Courier, monospace' },
].map(Object.freeze));

export const TYPOGRAPHY_ROLES = Object.freeze([
  { id: 'headings', label: 'Headings', description: 'Page headings and section titles.' },
  { id: 'body', label: 'Body text', description: 'Paragraphs, descriptions and supporting copy.' },
  { id: 'interface', label: 'Buttons & navigation', description: 'Buttons, navigation links and interface labels.' },
].map(Object.freeze));

export const DEFAULT_TYPOGRAPHY_ROLES = Object.freeze({ headings: 'georgia', body: 'arial', interface: 'arial' });
export const TYPE_NOTE = 'These web-safe fonts use installed system fonts and fallbacks, so their appearance can vary by device. Demo screenshots keep their original fonts. Your choices will be used when building your website.';
const FONT_IDS = new Set(FONT_OPTIONS.map(({ id }) => id));

export function normalizeTypography(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    && (value.schema === undefined || value.schema === 'fd-typography/v1')
    && value.roles && typeof value.roles === 'object' && !Array.isArray(value.roles) ? value.roles : {};
  return { schema: 'fd-typography/v1', roles: Object.fromEntries(TYPOGRAPHY_ROLES.map(({ id }) => [id,
    Object.hasOwn(source, id) && FONT_IDS.has(source[id]) ? source[id] : DEFAULT_TYPOGRAPHY_ROLES[id],
  ])) };
}

export const typographyForState = (state) => normalizeTypography(state?.typography);
export const typographyKey = (value) => {
  const typography = normalizeTypography(value);
  return `${typography.schema}|${TYPOGRAPHY_ROLES.map(({ id }) => `${id}:${typography.roles[id]}`).join('|')}`;
};

// Derived descriptions for the build brief. These do not assert that INDY has
// native controls for all three roles or authorize an installation method.
export function typographyBindings(value) {
  const typography = normalizeTypography(value);
  return Object.fromEntries(TYPOGRAPHY_ROLES.map(({ id, description }) => {
    const font = FONT_OPTIONS.find(({ id: fontId }) => fontId === typography.roles[id]);
    return [id, { fontId: font.id, family: font.label, stack: font.stack, appliesTo: description }];
  }));
}
