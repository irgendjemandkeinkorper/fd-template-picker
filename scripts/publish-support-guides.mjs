// Export the nine reviewed guides, not the workspace audit archive.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUPPORT_GUIDES } from '../documentation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(root, '../internal-template-support');
const destination = path.join(root, 'support');
fs.mkdirSync(destination, { recursive: true });
const isEvidence = href => href.startsWith('../');
for (const guide of SUPPORT_GUIDES) {
  let html = fs.readFileSync(path.join(source, guide.id + '.html'), 'utf8');
  html = html.replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (full, before, href, after, label) => {
    if (isEvidence(href)) return `<span class="maintainer-reference">${label} (maintainer record)</span>`;
    if (href === 'index.html#historical') return '';
    if (href === 'index.html') return `<a${before}href="../#documentation"${after}>${label.replace('Support home', 'Documentation')}</a>`;
    return full;
  });
  html = html.replace(/Internal reference/g, 'Support guide')
    .replace(/ — internal support guide/g, ' — support guide')
    .replace(/Local internal documentation\. Saved evidence is a checkpoint; verify the current INDY target before editing\. These files are not an authenticated staff service\./g,
      'Published support guide · Reviewed October 26, 2026. Maintainer records are retained separately. Confirm the current INDY Site before editing.');
  html = html.replace(/(<div class="guide-tools">[\s\S]*?<\/div>)/,
    '$1<p class="public-guide-note">Editing instructions for the demo site. References marked “maintainer record” identify the saved audit checkpoint; raw audit files are not included in this published guide.</p>');
  let markdown = fs.readFileSync(path.join(source, guide.id + '.md'), 'utf8')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/\[([^\]]+)\]\((\.\.\/[^)]+)\)/g, '$1 (maintainer record)')
    .replace(/ — internal support guide/g, ' — support guide')
    .replace(/ {2,}(?=\r?$)/gm, '<br>');
  markdown = '> Published support guide. Raw maintainer audit records are retained separately. Reviewed October 26, 2026.\n\n' + markdown;
  fs.writeFileSync(path.join(destination, guide.id + '.html'), html);
  fs.writeFileSync(path.join(destination, guide.id + '.md'), markdown);
}
for (const file of ['current-portal.css', 'current-portal.js']) {
  fs.copyFileSync(path.join(source, file), path.join(destination, file));
}
fs.appendFileSync(path.join(destination, 'current-portal.css'), '\n.public-guide-note{font-size:13px;color:#536272;margin:0 0 20px}.maintainer-reference{color:inherit}\n');
console.log('Exported nine support guides with local audit links removed.');
