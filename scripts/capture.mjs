// Refresh approved, stable section selectors. This captures the published page
// exactly as served; it never injects programming fixtures or corrects site CSS.
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(await readFile(join(root, 'catalog.json'), 'utf8'));
const variantArg = process.argv.find((arg) => arg.startsWith('--variant='))?.slice(10);
const mobile = process.argv.includes('--mobile');
const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const variants = catalog.variants.filter((v) => !variantArg || v.id === variantArg);
if (!variants.length) throw new Error('No matching verified variant.');
const jobs = [];
for (const variant of variants) {
  for (const slot of catalog.slots) {
    const option = slot.options.find((o) => o.variant === variant.id);
    if (!option) continue;
    const selectors = option.capture?.selectors ?? option.sectionSelectors;
    if (!selectors?.length) {
      console.warn(`Skipped ${option.id}: stable capture selectors have not been verified.`);
      continue;
    }
    jobs.push({ variant, slot, option, selectors });
  }
}
if (!jobs.length) throw new Error('No verified capture selectors. Record exact DOM selectors in option.capture.selectors before refreshing. Existing catalog and screenshots were preserved.');

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport });
  let currentUrl;
  for (const { variant, slot, option, selectors } of jobs) {
    if (currentUrl !== variant.sourceUrl) {
      await page.goto(variant.sourceUrl, { waitUntil: 'networkidle' });
      currentUrl = variant.sourceUrl;
      const accept = page.getByRole('button', { name: /^accept$/i });
      if (await accept.count()) await accept.first().click();
      // Settle lazy assets without substituting data or changing the page styles.
      for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += viewport.height) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(150);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => document.fonts.ready);
    }
    const boxes = [];
    const hidden = [];
    for (const selector of selectors) {
      const locator = page.locator(selector);
      if (await locator.count() !== 1) throw new Error(`${option.id}: selector must resolve exactly once: ${selector}`);
      const box = await locator.boundingBox();
      if (!box || box.height < 1) { hidden.push(selector); continue; }
      boxes.push(box);
    }
    if (!boxes.length) {
      const capture = { mode: 'live', capturedAt: new Date().toISOString(), viewport, selectors, notes: ['No visible content at this viewport size.'] };
      option.screenshots ??= {};
      option.screenshots[mobile ? 'mobile' : 'desktop'] = { image: null, width: viewport.width, height: 0, capture };
      if (!mobile) Object.assign(option, { captureStatus: 'not-rendered', image: null, height: 0, capture });
      console.log(`${option.id}: not visibly rendered at ${viewport.width}px`);
      continue;
    }
    const x = Math.max(0, Math.floor(Math.min(...boxes.map((b) => b.x))));
    const right = Math.min(viewport.width, Math.ceil(Math.max(...boxes.map((b) => b.x + b.width))));
    const y = Math.max(0, Math.floor(Math.min(...boxes.map((b) => b.y))));
    const bottom = Math.ceil(Math.max(...boxes.map((b) => b.y + b.height)));
    const image = `screenshots/${slot.id}/${variant.id}${mobile ? '-mobile' : ''}.png`;
    await mkdir(dirname(join(root, image)), { recursive: true });
    await page.screenshot({ path: join(root, image), fullPage: true, clip: { x, y, width: right - x, height: bottom - y } });
    const capture = { mode: 'live', capturedAt: new Date().toISOString(), viewport, selectors, notes: ['Published page captured without data fixtures or CSS repairs.', ...(hidden.length ? [`${hidden.length} grouped component(s) have no visible content at this viewport size.`] : [])] };
    option.screenshots ??= {};
    option.screenshots[mobile ? 'mobile' : 'desktop'] = { image, width: right - x, height: bottom - y, capture };
    if (!mobile) Object.assign(option, { image, width: right - x, height: bottom - y, capture, captureStatus: 'captured-live' });
    console.log(`${option.id}: ${right - x} × ${bottom - y}`);
  }
  catalog.generatedAt = new Date().toISOString();
  await writeFile(join(root, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
} finally { await browser.close(); }
