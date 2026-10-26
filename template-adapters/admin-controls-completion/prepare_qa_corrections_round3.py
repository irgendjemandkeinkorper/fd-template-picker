"""Prepare source-owned corrections found by the native second-palette QA."""
from __future__ import annotations
import hashlib
import json
import pathlib

import native_fields as controls
from prepare_qa_corrections_round2 import replace_property

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
BASE = REPO / 'evidence/admin-controls-completion'
OUTPUT = BASE / 'qa-corrections'


def dark_native_bridge(markers, empty_state=False):
    scopes = [f'[class*="{marker}"][data-test-id="section-content"]' for marker in markers]
    heading = ',\n'.join(scope + ' :is(h2,h3).text-current-color' for scope in scopes)
    result = '\n/* Native Dark editorial/widget panels use Background for meaningful copy. */\n'
    result += ',\n'.join(scopes) + ' { background-color:var(--q-dark) !important; color:var(--q-background) !important; }\n'
    result += heading + ' { color:var(--q-background) !important; }\n'
    if empty_state:
        result += ',\n'.join(scope + ' .text-h5.text-grey-9' for scope in scopes) + ' { color:var(--q-background) !important; }\n'
    return result


def corrected(field, css):
    if field == 'D-page':
        selector = '[class*="section-membership-d---loyalty-card-"] .od-club__stamps span.is-stamped'
        css = replace_property(css, selector, 'border-color', 'var(--v-stamp)', 'var(--q-dark)')
        return replace_property(css, selector, 'color', 'var(--v-stamp)', 'var(--q-dark)')
    if field == 'J-page':
        return css.rstrip() + '\n' + dark_native_bridge(['section-j-intro-', 'section-j-visit-'])
    if field == 'K-page':
        return css.rstrip() + '\n' + dark_native_bridge(['section-k-featured-'], empty_state=True)
    if field == 'L-page':
        return css.rstrip() + '\n' + dark_native_bridge(['section-l-opening-note-'])
    raise ValueError(field)


def prepare():
    records = []
    for field, version in [('D-page', 3), ('J-page', 2), ('K-page', 3), ('L-page', 3)]:
        source = BASE / 'native-saved' / (field + '.css')
        raw_bytes = source.read_bytes()
        raw = raw_bytes.decode('utf-8-sig')
        expected = BASE / ('native-proposals/J-page.proposed.css' if field == 'J-page' else 'qa-corrections/' + field + '-v2.css')
        if raw.strip() != expected.read_text(encoding='utf-8-sig').strip():
            raise ValueError(field + ': current native-saved source differs from expected saved revision')
        result = corrected(field, raw)
        assert controls.original.geometry_declarations(raw) == controls.original.geometry_declarations(result), field
        before = OUTPUT / f'{field}-v{version}.before.css'
        proposal = OUTPUT / f'{field}-v{version}.css'
        if before.exists() or proposal.exists():
            raise ValueError('Existing revision would be overwritten: ' + str(proposal))
        before.write_bytes(raw_bytes)
        proposal.write_text(result, encoding='utf-8', newline='\n')
        sha = lambda data: hashlib.sha256(data).hexdigest()
        records.append({'field': field, 'revision': version, 'nativeSavedSource': str(source.relative_to(REPO)).replace('\\','/'), 'beforeSnapshot': str(before.relative_to(REPO)).replace('\\','/'), 'beforeBytesSha256': sha(raw_bytes), 'beforeTextSha256': sha(raw.encode()), 'beforeCharacters': len(raw), 'proposal': str(proposal.relative_to(REPO)).replace('\\','/'), 'proposalBytesSha256': sha(proposal.read_bytes()), 'proposalCharacters': len(result), 'geometryPreserved': True, 'status': 'prepared-from-native-saved-not-applied-by-generator'})
    record = {
        'schema': 'fd-native-qa-corrections-round3/v1',
        'status': 'prepared-from-native-second-palette-findings',
        'fields': records,
        'nativeTestPalette': {'Primary':'#176B9D','Secondary':'#F2CA52','Dark':'#122C43','Background':'#F7FAFC'},
        'sourceQA': 'evidence/admin-controls-completion/qa-test-phone/{D,J,K,L}.json',
        'findings': {
            'D': 'Three visible earned is-stamped glyphs and outlines use Secondary on nearly-white card1.53:1. Change their owned Page foreground/border to native Dark; preserve seven transparent unearned slots and tilts.',
            'J': 'Native intro and visit text-current-color headings use Primary on Dark2.47:1. Bind those exact known Dark panels and h2/h3 heading foreground to native Dark/Background.',
            'K': 'Native featured heading Primary/Dark2.47 and empty widget .text-h5.text-grey-9 gray/Dark1.42. Bind that exact Dark panel, heading and empty-state foreground to Dark/Background.',
            'L': 'Native opening-note text-current-color heading Primary/Dark2.47. Bind its exact Dark panel and h2/h3 heading foreground to native Dark/Background.'
        },
        'expectedBaseCopyContrast': {'approvedWarmPalette': 12.01, 'nativeTestPalette': 13.66},
        'unchanged': ['All content/media/URLs/form routing/native color values', 'All Section CSS fields', 'All geometry and typography', 'D intentionally transparent unearned stamp slots', 'Frozen baseline proposal bundle'],
        'guard': 'Compare current native field exact before hash; root must verify native save/readback, scoped publish, warm and test palette live desktop/phone evidence.'
    }
    manifest = OUTPUT / 'round3-manifest.json'
    if manifest.exists():
        raise ValueError('Round3 manifest already exists; choose a new revision.')
    manifest.write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8', newline='\n')
    return record


if __name__ == '__main__':
    print(json.dumps(prepare(), indent=2))
