() => {
  // Read rendered DOM only. No fetch, storage, mutation, event dispatch or app state.
  const clamp = n => Math.min(1, Math.max(0, n));
  const channel = token => token.endsWith('%') ? Number.parseFloat(token) / 100 : Number.parseFloat(token);
  const compand = n => clamp(n <= .0031308 ? 12.92 * n : 1.055 * n ** (1 / 2.4) - .055);
  const oklabToRgb = (L, a, b) => {
    const l = (L + .3963377774 * a + .2158037573 * b) ** 3;
    const m = (L - .1055613458 * a - .0638541728 * b) ** 3;
    const s = (L - .0894841775 * a - 1.2914855480 * b) ** 3;
    return [compand(4.0767416621 * l - 3.3077115913 * m + .2309699292 * s), compand(-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s), compand(-.0041960863 * l - .7034186147 * m + 1.7076147010 * s)];
  };
  const parse = source => {
    const value = source.trim().toLowerCase();
    if (value === 'transparent') return [0, 0, 0, 0];
    if (/^#[\da-f]{3,8}$/.test(value)) {
      let hex = value.slice(1);
      if (hex.length === 3 || hex.length === 4) hex = [...hex].map(c => c + c).join('');
      if (hex.length !== 6 && hex.length !== 8) return null;
      return [0, 2, 4].map(i => Number.parseInt(hex.slice(i, i + 2), 16) / 255).concat(hex.length === 8 ? Number.parseInt(hex.slice(6), 16) / 255 : 1);
    }
    const match = value.match(/^(rgba?|color|oklab|oklch)\((.*)\)$/);
    if (!match) return null;
    let content = match[2].trim();
    if (match[1] === 'color') {
      if (!content.startsWith('srgb ')) return null;
      content = content.slice(5);
    }
    const pieces = content.replaceAll(',', ' ').replaceAll('/', ' ').split(/\s+/).filter(Boolean);
    if (pieces.length < 3) return null;
    let rgb;
    if (match[1].startsWith('rgb')) rgb = pieces.slice(0, 3).map(token => token.endsWith('%') ? channel(token) : Number(token) / 255);
    else if (match[1] === 'color') rgb = pieces.slice(0, 3).map(channel);
    else {
      const L = channel(pieces[0]);
      let a = Number(pieces[1]), b = Number(pieces[2]);
      if (match[1] === 'oklch') {
        const angle = Number.parseFloat(pieces[2]) * Math.PI / 180;
        a = Number(pieces[1]) * Math.cos(angle);
        b = Number(pieces[1]) * Math.sin(angle);
      }
      rgb = oklabToRgb(L, a, b);
    }
    return rgb.every(Number.isFinite) ? [...rgb.map(clamp), pieces[3] ? clamp(channel(pieces[3])) : 1] : null;
  };
  const composite = (front, back) => {
    const alpha = front[3] + back[3] * (1 - front[3]);
    if (!alpha) return [0, 0, 0, 0];
    return [0, 1, 2].map(i => (front[i] * front[3] + back[i] * back[3] * (1 - front[3])) / alpha).concat(alpha);
  };
  const lum = rgb => rgb.slice(0, 3).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
  const ratio = (a, b) => { const [high, low] = [lum(a), lum(b)].sort((x, y) => y - x); return (high + .05) / (low + .05); };
  const short = element => `${element.tagName.toLowerCase()}${String(element.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 7).map(c => '.' + c).join('')}`;
  const safeMatches = (element, selector) => {
    try { return typeof element.matches === 'function' ? element.matches(selector) : null; } catch { return null; }
  };
  const contains = (container, child) => {
    for (let item = child; item; item = item.parentElement) if (item === container) return true;
    return false;
  };
  const shown = element => {
    const box = element.getBoundingClientRect();
    if (box.width <= 1 || box.height <= 1) return false;
    try { if (typeof element.getClientRects === 'function' && !element.getClientRects().length) return false; } catch { /* Bounding rectangle remains the supported visibility check. */ }
    for (let item = element; item; item = item.parentElement) {
      const style = getComputedStyle(item);
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || Number(style.opacity) === 0 || item.getAttribute('aria-hidden') === 'true') return false;
    }
    return true;
  };
  const background = element => {
    const layers = [];
    const unresolved = [];
    let foundOpaque = false;
    let opaqueElement = null;
    for (let item = element; item; item = item.parentElement) {
      const style = getComputedStyle(item);
      if (style.backgroundImage !== 'none') unresolved.push({kind: 'image-or-gradient-before-opaque-backing', element: short(item), paint: style.backgroundImage.slice(0, 160)});
      const color = parse(style.backgroundColor);
      if (!color) unresolved.push({kind: 'unparsed-background', element: short(item), value: style.backgroundColor});
      else if (color[3] > 0) layers.push(color);
      if (color?.[3] >= .999) { foundOpaque = true; opaqueElement = item; break; }
    }
    let result = [1, 1, 1, 1];
    for (const layer of layers.reverse()) result = composite(layer, result);
    // A positioned sibling image can cover an ancestor's computed background.
    // Conservative overlap detection prevents a false contrast pass there.
    if (opaqueElement && opaqueElement !== element) {
      const textBounds = element.getBoundingClientRect();
      for (const media of opaqueElement.querySelectorAll('img,video')) {
        if (contains(element,media) || !shown(media)) continue;
        const mediaBounds = media.getBoundingClientRect();
        if (Math.min(textBounds.right,mediaBounds.right) > Math.max(textBounds.left,mediaBounds.left) && Math.min(textBounds.bottom,mediaBounds.bottom) > Math.max(textBounds.top,mediaBounds.top)) {
          unresolved.push({kind:'overlapping-media-inside-ancestor-backing',element:short(media)});
        }
      }
    }
    return {color: result, unresolved, foundOpaque};
  };
  const sample = element => {
    const style = getComputedStyle(element);
    const bg = background(element);
    const raw = parse(style.color);
    let opacity = 1;
    const opacityGroups = [];
    for (let item = element; item; item = item.parentElement) {
      const own = getComputedStyle(item);
      const alpha = Number(own.opacity);
      opacity *= alpha;
      if (alpha < .999 && (parse(own.backgroundColor)?.[3] || own.backgroundImage !== 'none')) opacityGroups.push(short(item));
    }
    const fg = raw ? [...raw.slice(0, 3), raw[3] * opacity] : null;
    const paintedForeground = fg ? composite(fg, bg.color) : null;
    const text = (element.innerText || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
    const graphic = /material icons/i.test(style.fontFamily) || /^[✓✕↗↘→←•]+$/.test(text);
    const large = Number.parseFloat(style.fontSize) >= 24 || (Number.parseFloat(style.fontSize) >= 18.667 && Number.parseFloat(style.fontWeight) >= 700);
    const threshold = graphic || large ? 3 : 4.5;
    const value = paintedForeground ? ratio(paintedForeground, bg.color) : null;
    const disabled = !!element.closest('[disabled],[aria-disabled="true"],.disabled');
    const emptyLoyaltySlot = element.tagName.toLowerCase() === 'span' && !!element.closest('.od-club__stamps') && !String(element.getAttribute('class') || '').split(/\s+/).includes('is-stamped') && text === '✕' && raw?.[3] === 0;
    const box = element.getBoundingClientRect();
    return {element: short(element), text, section: element.closest('[data-test-id="section-content"]')?.className || null, color: style.color, background: style.backgroundColor, effectiveBackground: bg.color, opacity, fontSize: style.fontSize, fontWeight: style.fontWeight, textShadow: style.textShadow, backgroundImage: style.backgroundImage, disabled, hovered: safeMatches(element,':hover'), focused: safeMatches(element,':focus-visible'), bounds: {x: box.x, y: box.y, width: box.width, height: box.height}, ratio: value === null ? null : Math.round(value * 100) / 100, threshold, result: emptyLoyaltySlot ? 'decorative-empty-loyalty-slot-excluded' : disabled ? 'disabled-control-excluded' : !fg ? 'unparsed-foreground' : bg.unresolved.length || opacityGroups.length ? 'manual-image-or-group-compositing-check' : value >= threshold ? 'pass' : 'fail', exclusionReason: emptyLoyaltySlot ? 'Odd unearned punch slot: intentionally transparent X; only is-stamped slots display the mark.' : null, unresolved: [...bg.unresolved, ...opacityGroups.map(item => ({kind:'group-opacity-with-painted-background',element:item}))]};
  };
  const page = document.querySelector('main .q-page') || document.querySelector('.q-page') || document.querySelector('main');
  const header = document.querySelector('header.consumer-header');
  const captions = [...document.querySelectorAll('[data-test-id="carousel-slide-content"] :is(.hero-title,.hero-subtitle,.mobile-hero-title,.mobile-hero-subtitle)')].filter(e => shown(e) && e.textContent.trim()).map(sample);
  const textElements = [];
  const seen = [];
  for (const root of [header, page].filter(Boolean)) {
    for (const parent of root.querySelectorAll('*')) {
      if (textElements.length >= 450) break;
      if (!parent.textContent?.trim() || seen.includes(parent) || parent.closest('script,style,noscript,.screen-reader-only,.sr-only') || !shown(parent)) continue;
      let ownText = null;
      try {
        const nodes = parent.childNodes;
        if (nodes && typeof nodes.length === 'number') ownText = [...nodes].filter(node => node.nodeType === 3).map(node => node.textContent || '').join('').trim();
      } catch { /* Some read-only DOM sandboxes omit text-node access. */ }
      let textSelection = 'own-text-node';
      if (ownText === null) {
        const leaf = parent.querySelectorAll('*').length === 0;
        const semantic = /^(h[1-6]|p|a|button|span|label|li|dt|dd|small|strong|b|em|i|legend)$/.test(parent.tagName.toLowerCase());
        if (!leaf && !semantic) continue;
        textSelection = leaf ? 'leaf-element' : 'semantic-parent-fallback';
      } else if (!ownText) continue;
      seen.push(parent);
      textElements.push({...sample(parent),textSelection});
    }
  }
  const native = getComputedStyle(document.body);
  const viewportWidth = typeof innerWidth === 'undefined' ? document.documentElement.clientWidth : innerWidth;
  const viewportHeight = typeof innerHeight === 'undefined' ? document.documentElement.clientHeight : innerHeight;
  const inViewport = element => {
    const box = element.getBoundingClientRect();
    return shown(element) && box.right > 0 && box.bottom > 0 && box.x < viewportWidth && box.y < viewportHeight;
  };
  const images = [...document.querySelectorAll('img')].filter(inViewport).map(element => ({src:element.currentSrc || element.getAttribute('src') || '',complete:element.complete,naturalWidth:element.naturalWidth,naturalHeight:element.naturalHeight,element:short(element)}));
  const visibleLoaders = [...document.querySelectorAll('.q-inner-loading,.q-loading,.q-spinner,[role="progressbar"]')].filter(inViewport).map(element=>{const box=element.getBoundingClientRect();return {element:short(element),bounds:{x:box.x,y:box.y,width:box.width,height:box.height}};});
  const renderedSections = [...document.querySelectorAll('[data-test-id="section-content"]')].filter(shown).length;
  const expectsHeroCaption = /page-variant-[a-i]-/.test(page?.className || '');
  const incompleteReasons = [];
  if (textElements.length < 30) incompleteReasons.push('Fewer than30 rendered text samples; native content may still be loading.');
  if (renderedSections < 4) incompleteReasons.push('Fewer than4 rendered native sections; core template coverage is incomplete.');
  if (expectsHeroCaption && !captions.length) incompleteReasons.push('Expected A-I hero caption family has no visible nonempty caption.');
  if (images.some(image=>image.src && (image.complete === false || image.naturalWidth === 0))) incompleteReasons.push('Visible image has not completed a successful load; screenshot is not ready.');
  if (visibleLoaders.length) incompleteReasons.push('Visible native loading indicator remains in viewport; screenshot is not ready.');
  const completeness = {status:incompleteReasons.length ? 'incomplete-retry-after-native-content-load' : 'sufficient-for-sampled-current-state',textSamples:textElements.length,minimumTextSamples:30,renderedSections,expectsHeroCaption,visibleCaptions:captions.length,reasons:incompleteReasons};
  return {url: document.URL || (typeof location === 'undefined' ? null : location.href), title: document.title, pageClass: page?.className || null, completeness, images, visibleLoaders, viewport: {width:viewportWidth,height:viewportHeight,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}, nativePalette: Object.fromEntries(['primary','secondary','dark','background'].map(name => [name,native.getPropertyValue('--q-'+name).trim()])), captions, summary: Object.fromEntries(['pass','fail','manual-image-or-group-compositing-check','disabled-control-excluded','decorative-empty-loyalty-slot-excluded','unparsed-foreground'].map(result => [result,textElements.filter(item=>item.result===result).length])), failures: textElements.filter(item=>item.result==='fail'), manual: textElements.filter(item=>item.result==='manual-image-or-group-compositing-check'), samples: textElements};
}
