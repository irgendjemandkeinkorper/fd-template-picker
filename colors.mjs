export const DEFAULT_BRAND_COLORS = Object.freeze({ primary: '#183B4E', secondary: '#F4EEE4' });
export const BRAND_COLOR_NOTE = 'Demo images keep their original colors. Your chosen palette will be used when building your website.';
export const PALETTE_VERSION = 1;
export const COLOR_ROLES = Object.freeze([
  ['primary', 'Primary'], ['secondary', 'Secondary'], ['header', 'Header'], ['accent', 'Accent'], ['dark', 'Dark'], ['background', 'Background'],
  ['positive', 'Positive'], ['negative', 'Negative'], ['info', 'Info'], ['warning', 'Warning'], ['splashBackground', 'Splash background'], ['seatSelected', 'Seat selected'], ['seatAvailable', 'Seat available'],
].map(([id, label], index) => Object.freeze({ id, label, advanced: index >= 6 })));
// Suggested starter values, not captured Admin values or canonical INDY defaults.
export const DEFAULT_PALETTE_ROLES = Object.freeze({ ...DEFAULT_BRAND_COLORS, header: '#183B4E', accent: '#F4EEE4', dark: '#183B4E', background: '#F4EEE4', positive: '#217A43', negative: '#B42318', info: '#126E9B', warning: '#F2C037', splashBackground: '#183B4E', seatSelected: '#183B4E', seatAvailable: '#DCE7DF' });
export const PALETTE_BINDING_NOTE = 'Header and Accent are saved as requested colors. Current template styling uses Dark for Header and Secondary for Accent; these two independent choices need adapter updates before they can appear separately.';
export const NATIVE_COLOR_BINDINGS = Object.freeze(Object.fromEntries(COLOR_ROLES.map(({ id, label, advanced }) => [id, {
  adminField: `${id[0].toUpperCase()}${id.slice(1)}`,
  cssVariable: ['splashBackground', 'seatSelected', 'seatAvailable'].includes(id) ? null : `--q-${id}`,
  templateRole: id === 'header' ? 'dark' : id === 'accent' ? 'secondary' : advanced ? null : id,
  status: ['header', 'accent'].includes(id) ? 'aliased-in-current-adapters' : advanced ? 'native-field-mapping-and-rendered-states-require-verification' : 'current-template-input',
}])));
export const CONTRAST_STANDARD_URL = 'https://www.w3.org/TR/WCAG22/#contrast-minimum';

export function normalizeHexColor(value) {
  if (typeof value !== 'string') return null;
  const hex = value.trim().replace(/^#/, '');
  if (/^[\da-f]{3}$/i.test(hex)) return `#${[...hex].map((digit) => digit.repeat(2)).join('').toUpperCase()}`;
  return /^[\da-f]{6}$/i.test(hex) ? `#${hex.toUpperCase()}` : null;
}

export function normalizeBrandColors(colors) {
  return Object.fromEntries(Object.entries(DEFAULT_BRAND_COLORS).map(([key, fallback]) => [key, normalizeHexColor(colors?.[key]) ?? fallback]));
}

export function normalizePalette(palette, brandColors) {
  const source = palette?.roles ?? {};
  return { version: PALETTE_VERSION, roles: Object.fromEntries(COLOR_ROLES.map(({ id }) => [id, normalizeHexColor(source[id] ?? brandColors?.[id]) ?? DEFAULT_PALETTE_ROLES[id]])), nativeBindings: NATIVE_COLOR_BINDINGS,
    defaultsPolicy: 'Suggested starter colors; not captured target-site values or canonical INDY defaults.' };
}
export function paletteForState(state) {
  const palette = normalizePalette(state?.palette, state?.brandColors);
  // Retain in-progress input so validation can reject it before any commit.
  // Defaults repair missing/imported values; they must not hide invalid edits.
  for (const { id } of COLOR_ROLES) {
    if (Object.hasOwn(state?.palette?.roles ?? {}, id)) palette.roles[id] = state.palette.roles[id];
  }
  // Keep the public two-color compatibility API usable for older callers.
  for (const id of ['primary', 'secondary']) if (state?.brandColors?.[id] !== undefined) palette.roles[id] = state.brandColors[id];
  return palette;
}
export const paletteKey = (palette) => `palette/v${PALETTE_VERSION}|${COLOR_ROLES.map(({ id }) => `${id}:${normalizeHexColor(palette?.roles?.[id]) ?? 'invalid'}`).join('|')}|header:dark|accent:secondary`;
export function assessPalette(palette) {
  const roles = palette?.roles ?? {};
  const pairs = [
    ['brand', 'Primary / Secondary', 'primary', 'secondary'],
    ['body', 'Dark / Background', 'dark', 'background'],
  ].map(([id, label, foreground, background]) => { const ratio = contrastRatio(roles[foreground], roles[background]); return { id, label, foreground, background, ratio, passes: ratio !== null && ratio >= 4.5, minimum: 4.5 }; });
  const valid = COLOR_ROLES.every(({ id }) => normalizeHexColor(roles[id]));
  return { valid: Boolean(valid), pairs, passes: Boolean(valid) && pairs.every((pair) => pair.passes),
    scope: 'Two base text pairs only. Derived surfaces, overlays, semantic states, seats and final native pages still require rendered checks.', standardUrl: CONTRAST_STANDARD_URL };
}

// WCAG 2.2 sRGB relative luminance. Invalid colors must never receive a passing ratio.
export function relativeLuminance(color) {
  const hex = normalizeHexColor(color);
  if (!hex) return null;
  const channels = [1, 3, 5].map((offset) => {
    const srgb = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first), secondLuminance = relativeLuminance(second);
  if (firstLuminance === null || secondLuminance === null) return null;
  return (Math.max(firstLuminance, secondLuminance) + 0.05) / (Math.min(firstLuminance, secondLuminance) + 0.05);
}

export function assessBrandColors(colors) {
  const primary = normalizeHexColor(colors?.primary), secondary = normalizeHexColor(colors?.secondary);
  const ratio = contrastRatio(primary, secondary);
  const valid = ratio !== null;
  const normalText = { minimum: 4.5, passes: valid && ratio >= 4.5 };
  const largeText = { minimum: 3, passes: valid && ratio >= 3 };
  return { primary, secondary, valid, ratio, normalText, largeText,
    status: !valid ? 'invalid' : normalText.passes ? 'pass' : largeText.passes ? 'large-text-only' : 'fail',
    note: BRAND_COLOR_NOTE, standardUrl: CONTRAST_STANDARD_URL };
}
