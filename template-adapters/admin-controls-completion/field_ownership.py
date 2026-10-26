"""Infer native CSS ownership from compiler scopes; preserve raw-field authority."""
from __future__ import annotations

from collections import Counter
import hashlib
import json
import pathlib
import re

import native_fields as controls

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
SOURCE = REPO.parent / 'evidence/admin-controls-audit/live-template-styles-final.json'
BEFORE = REPO / 'evidence/admin-controls-completion/native-before'


def analyze(css):
    css = controls.original.COMMENT.sub('', css)
    page_rules = 0
    section_counts = Counter()
    for selector, declarations in re.findall(r'([^{}]+)\{([^{}]*)\}', css):
        if '.page-variant-' in selector:
            page_rules += 1
        else:
            for match in re.finditer(r'(?:^|,)\s*\.((?:section-[\w-]+)-\d+)', selector):
                section_counts[match.group(1)] += 1
    return {'pageScopedRules': page_rules, 'directNativeSectionScopes': dict(section_counts)}


def main():
    data = json.loads(SOURCE.read_text(encoding='utf-8-sig'))
    report = []
    for variant in data:
        letter = variant['variant'].split('-')[1].upper()
        if letter == 'K':
            css = (HERE.parent / 'brand-tokens/proposals/variant-k-clubhouse.before.css').read_text(encoding='utf-8')
        else:
            css = '\n'.join(style for style in variant['styles'] if '@import' not in style)
        record = {'variant': variant['variant'], **analyze(css)}
        path = BEFORE / (letter + '-page.css')
        if path.exists():
            raw = path.read_text(encoding='utf-8-sig')
            # Attribute quotes/minified whitespace/compiled nesting can differ;
            # literal paint inventory is a stable additional comparison, not an
            # assertion of exact native/public equivalence.
            def paint_inventory(value):
                value = controls.original.COMMENT.sub('', value)
                return Counter(controls.original.normalize_color(color)[0] for color in controls.original.COLOR.findall(value))
            # Some retained style blocks concatenate both native field kinds.
            # Work at leaf-rule level, not whole stylesheet level, to exclude
            # directly section-rooted declarations from the Page comparison.
            page_styles = '\n'.join(selector + '{' + declarations + '}' for selector, declarations in re.findall(r'([^{}]+)\{([^{}]*)\}', controls.original.COMMENT.sub('', css)) if '.page-variant-' in selector)
            actual, old = paint_inventory(raw), paint_inventory(page_styles)
            record['nativePageReadback'] = {'file': str(path.relative_to(REPO)).replace('\\', '/'), 'bytesSha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'characters': len(raw), 'literalColors': dict(actual), 'colorsNotInPublicSnapshot': sorted(actual.keys() - old.keys()), 'publicColorsNotInPageReadback': sorted(old.keys() - actual.keys()), 'nativePublicPagePaintCountsEqual': actual == old, 'nativeMinusPublicPagePaintCounts': dict(actual-old), 'publicMinusNativePagePaintCounts': dict(old-actual), 'note': 'Comparison uses retained public leaf rules containing page scope; separately section-rooted CSS excluded. Matching paint inventory does not prove full content equivalence. Native raw field remains installation authority.'}
        report.append(record)
    result = {'schema': 'fd-compiler-scope-ownership/v1', 'source': str(SOURCE), 'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'variants': report, 'interpretation': 'Rules prefixed by a page scope came from Page CSS. Rules rooted directly at generated section scopes indicate separate native Section CSS. Shared Theme and embedded visual-editor content are outside this inference. Verify actual raw field and draft ID before saving.'}
    (HERE / 'native-field-ownership.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(json.dumps([{'variant': x['variant'], 'pageRules': x['pageScopedRules'], 'nativeSectionScopes': x['directNativeSectionScopes'], 'newNativeColors': x.get('nativePageReadback', {}).get('colorsNotInPublicSnapshot', [])} for x in report], indent=2))


if __name__ == '__main__':
    main()
