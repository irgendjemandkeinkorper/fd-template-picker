import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_BRAND_COLORS, normalizeHexColor, normalizeBrandColors, relativeLuminance, contrastRatio, assessBrandColors } from '../colors.mjs';

test('hex colors are normalized while unsupported or malformed values are rejected', () => {
  assert.equal(normalizeHexColor(' #abc '), '#AABBCC');
  assert.equal(normalizeHexColor('12abef'), '#12ABEF');
  for (const invalid of ['', '#12', '#abcd', '#12345678', '#zzzzzz', 'red', 'rgb(0, 0, 0)', null, 123456, {}, Infinity]) {
    assert.equal(normalizeHexColor(invalid), null, `Invalid color: ${invalid}`);
  }
  assert.deepEqual(normalizeBrandColors({ primary: '#abc', secondary: 'invalid' }), { primary: '#AABBCC', secondary: DEFAULT_BRAND_COLORS.secondary });
  assert.deepEqual(normalizeBrandColors(), DEFAULT_BRAND_COLORS);
});

test('WCAG ratios have known endpoints and are the same in either text direction', () => {
  assert.equal(relativeLuminance('#000'), 0);
  assert.equal(relativeLuminance('#FFF'), 1);
  assert.equal(contrastRatio('#000', '#FFF'), 21);
  assert.equal(contrastRatio('#183B4E', '#183B4E'), 1);
  assert.equal(contrastRatio('#183B4E', '#F4EEE4'), contrastRatio('#F4EEE4', '#183B4E'));
  assert.ok(Math.abs(contrastRatio('#FF0000', '#FFF') - 3.9984767707539985) < 1e-12);
});

test('relative luminance handles the channels on each side of the sRGB gamma threshold', () => {
  assert.ok(Math.abs(relativeLuminance('#0A0A0A') - (10 / 255 / 12.92)) < 1e-15);
  assert.ok(Math.abs(relativeLuminance('#0B0B0B') - (((11 / 255 + 0.055) / 1.055) ** 2.4)) < 1e-15);
  assert.equal(relativeLuminance('bad color'), null);
});

test('contrast status uses unrounded normal and large text thresholds', () => {
  const normalPass = assessBrandColors({ primary: '#767676', secondary: '#FFF' });
  const normalFail = assessBrandColors({ primary: '#777777', secondary: '#FFF' });
  assert.equal(normalPass.status, 'pass');
  assert.equal(normalPass.normalText.passes, true);
  assert.equal(normalFail.ratio.toFixed(1), '4.5');
  assert.equal(normalFail.normalText.passes, false, 'Rounding up must not turn a failing pair into a pass.');
  assert.equal(normalFail.largeText.passes, true);
  assert.equal(normalFail.status, 'large-text-only');
  assert.equal(assessBrandColors({ primary: '#949494', secondary: '#FFF' }).largeText.passes, true);
  assert.equal(assessBrandColors({ primary: '#959595', secondary: '#FFF' }).largeText.passes, false);
  assert.equal(assessBrandColors({ primary: '#FFF', secondary: '#FFF' }).status, 'fail');
  assert.equal(assessBrandColors(DEFAULT_BRAND_COLORS).normalText.passes, true);
});

test('invalid input cannot pass contrast by being silently substituted with a default color', () => {
  for (const colors of [undefined, {}, { primary: '#FFF' }, { primary: 'invalid', secondary: '#000' }, { primary: '#FFF', secondary: '#1234' }]) {
    const result = assessBrandColors(colors);
    assert.equal(result.valid, false);
    assert.equal(result.ratio, null);
    assert.equal(result.status, 'invalid');
    assert.equal(result.normalText.passes, false);
    assert.equal(result.largeText.passes, false);
  }
  assert.equal(contrastRatio('#000', 'invalid'), null);
});
