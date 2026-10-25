export const DEFAULT_BRAND_COLORS = Object.freeze({ primary: '#183B4E', secondary: '#F4EEE4' });
export const BRAND_COLOR_NOTE = 'Demo images keep their original colors. Your primary and secondary colors will be used when building your website.';
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
