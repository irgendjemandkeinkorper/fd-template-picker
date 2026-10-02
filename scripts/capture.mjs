// Captures one screenshot per component slot from each INDY variant site and
// writes catalog.json, which the picker reads. Re-run after the variants change:
//   npm run capture
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://adam-template-testing-2-indy-consumer.netlify.app';
const WIDTH = 1440;
const VIEWPORT_HEIGHT = 900;

const SLOTS = [
  { id: 'header', label: 'Header' },
  { id: 'hero', label: 'Hero' },
  { id: 'now-playing', label: 'Now Playing' },
  { id: 'events', label: 'Events' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'contact', label: 'Contact' },
  { id: 'find-us', label: 'Find Us' },
  { id: 'membership', label: 'Membership' },
  { id: 'gift-cards', label: 'Gift Cards' },
  { id: 'footer', label: 'Footer' },
];

// `sections` lists, in page order, which slot each [data-test-id=section]
// belongs to and the component name the variant gives it. Consecutive sections
// sharing a slot are captured as one image.
const VARIANTS = [
  {
    id: 'variant-a-circuit',
    label: 'A · Circuit',
    sections: [
      ['hero', 'Hero A - Showtimes Shelf'],
      ['hero', 'Hero A - Shelf'],
      ['now-playing', 'Now Playing A - Departure Board'],
      ['events', 'Events A - Rate Card'],
      ['food', 'Food A - Chip Rail'],
      ['contact', 'Contact A - Compressed Column'],
      ['find-us', 'Find Us A - Map Strip'],
      ['membership', 'Membership A - Tier Rail'],
      ['gift-cards', 'Gift Cards A - Denomination Rail'],
    ],
  },
  {
    id: 'variant-b-rep',
    label: 'B · Rep',
    sections: [
      ['hero', 'Hero B - Plate and Note'],
      ['events', 'Events B - Playbill'],
      ['food', 'Food B - Printed Menu'],
      ['now-playing', 'Now Playing B - Programme Broadsheet'],
      ['contact', 'Contact B - Split Desk'],
      ['find-us', 'Find Us B - Street Plate'],
      ['membership', 'Membership B - Subscriber Bill'],
      ['gift-cards', 'Gift Cards B - Paper Voucher'],
    ],
  },
  {
    id: 'variant-c-late',
    label: 'C · Late',
    sections: [
      ['hero', 'Hero C - Marquee'],
      ['hero', 'Hero C - Dock'],
      ['now-playing', 'Now Playing C - Late Rail'],
      ['events', 'Events C - Ticket Stack'],
      ['food', 'Food C - Tile Wall'],
      ['contact', 'Contact C - Statement Line'],
      ['find-us', 'Find Us C - Night Map'],
      ['membership', 'Membership C - Card Ledger'],
      ['gift-cards', 'Gift Cards C - Bar Tab'],
    ],
  },
];

const catalog = {
  generatedAt: new Date().toISOString(),
  source: BASE,
  slots: SLOTS.map((s) => ({ ...s, options: [] })),
};
const slotById = Object.fromEntries(catalog.slots.map((s) => [s.id, s]));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: VIEWPORT_HEIGHT } });
const stitcher = await browser.newPage();

// Map iframes only paint when they are really on screen, so a full-page
// screenshot leaves them blank: Find Us is captured as viewport-sized tiles and
// stitched. Everything else uses one full-page clip, which keeps sticky
// elements (side navs) from repeating in every tile.
async function captureClip(clip) {
  const top = Math.round(clip.y);
  const height = Math.round(clip.height);
  if (clip.slot !== 'find-us') {
    await page.evaluate(() => window.scrollTo(0, 0));
    return page.screenshot({
      type: 'jpeg',
      quality: 88,
      fullPage: true,
      clip: { x: 0, y: top, width: WIDTH, height },
    });
  }
  const tiles = [];
  for (let done = 0; done < height; ) {
    await page.evaluate((y) => window.scrollTo(0, y), top + done);
    await page.waitForTimeout(3000);
    const offset = top + done - (await page.evaluate(() => window.scrollY));
    const tileHeight = Math.min(VIEWPORT_HEIGHT - offset, height - done);
    const png = await page.screenshot({ clip: { x: 0, y: offset, width: WIDTH, height: tileHeight } });
    tiles.push({ y: done, data: png.toString('base64') });
    done += tileHeight;
  }
  const jpeg = await stitcher.evaluate(
    async ({ tiles, width, height }) => {
      const canvas = Object.assign(document.createElement('canvas'), { width, height });
      const ctx = canvas.getContext('2d');
      for (const tile of tiles) {
        const img = new Image();
        img.src = `data:image/png;base64,${tile.data}`;
        await img.decode();
        ctx.drawImage(img, 0, tile.y);
      }
      return canvas.toDataURL('image/jpeg', 0.88).split(',')[1];
    },
    { tiles, width: WIDTH, height },
  );
  return Buffer.from(jpeg, 'base64');
}

for (const variant of VARIANTS) {
  const url = `${BASE}/${variant.id}/`;
  console.log(`\n${variant.label}  ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // The cookie notice floats over the hero; dismiss it (first visit only).
  const accept = page.getByRole('button', { name: /accept/i });
  if (await accept.count()) await accept.first().click();

  // Map embeds are lazy iframes, which stay blank in a full-page capture.
  await page.evaluate(() => {
    for (const frame of document.querySelectorAll('iframe[loading="lazy"]')) {
      frame.loading = 'eager';
      frame.src = frame.src;
    }
  });

  // Scroll the whole page once so lazy images and scroll-in animations settle.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  const boxes = await page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { y: r.top + window.scrollY, height: r.height };
    };
    return {
      header: box(document.querySelector('[data-test-id="consumer-header"]')),
      footer: box(document.querySelector('[data-test-id="global-widget-footer"]')),
      sections: [...document.querySelectorAll('[data-test-id="custom-page"] [data-test-id="section"]')].map(box),
    };
  });

  if (boxes.sections.length !== variant.sections.length) {
    throw new Error(
      `${variant.id}: expected ${variant.sections.length} sections, found ${boxes.sections.length}. Update VARIANTS in scripts/capture.mjs.`,
    );
  }

  // Merge consecutive sections of the same slot into one clip.
  const clips = [{ slot: 'header', names: ['Site header'], ...boxes.header }];
  variant.sections.forEach(([slot, name], i) => {
    const prev = clips[clips.length - 1];
    const b = boxes.sections[i];
    if (prev.slot === slot) {
      prev.height = b.y + b.height - prev.y;
      prev.names.push(name);
    } else {
      clips.push({ slot, names: [name], ...b });
    }
  });
  clips.push({ slot: 'footer', names: ['Site footer'], ...boxes.footer });

  for (const clip of clips) {
    const image = `screenshots/${clip.slot}/${variant.id}.jpg`;
    const file = join(ROOT, image);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, await captureClip(clip));
    // The header is fixed; once captured, keep it out of every later tile.
    if (clip.slot === 'header') {
      await page.addStyleTag({ content: '[data-test-id="consumer-header"] { visibility: hidden !important; }' });
    }
    slotById[clip.slot].options.push({
      id: `${clip.slot}--${variant.id}`,
      variant: variant.id,
      variantLabel: variant.label,
      name: clip.names.join(' + '),
      components: clip.names,
      image,
      width: WIDTH,
      height: Math.round(clip.height),
      sourceUrl: url,
    });
    console.log(`  ${clip.slot.padEnd(12)} ${Math.round(clip.height)}px  ${clip.names.join(' + ')}`);
  }
}

await browser.close();

// A slot that renders identically on every variant (the shared footer today)
// is one option, not three.
for (const slot of catalog.slots) {
  const seen = new Map();
  for (const option of slot.options) {
    const hash = createHash('sha1').update(await readFile(join(ROOT, option.image))).digest('hex');
    if (seen.has(hash)) {
      const kept = seen.get(hash);
      kept.variantLabel = 'All variants';
      kept.sharedBy.push(option.variant);
      await rm(join(ROOT, option.image));
    } else {
      seen.set(hash, Object.assign(option, { sharedBy: [option.variant] }));
    }
  }
  slot.options = [...seen.values()];
}
await writeFile(join(ROOT, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
console.log('\nWrote catalog.json');
