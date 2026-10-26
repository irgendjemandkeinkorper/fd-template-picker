"""Prepare exact backed-up field proposals; no network or Admin writes."""
from __future__ import annotations

import hashlib
import json
import pathlib
import re

import native_fields as controls

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
BEFORE = REPO / 'evidence/admin-controls-completion/native-before'
OUTPUT = REPO / 'evidence/admin-controls-completion/native-proposals'
EXPECTED_SECTIONS = {'B': [25132], 'G': [25116], 'H': [25120], 'I': [25123], 'J': [25127,25129,25131,25133], 'K': [25122,25128,24894,25117], 'L': [25119,25124,25126,25130]}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def prepare():
    if OUTPUT.exists() and any(OUTPUT.iterdir()):
        raise ValueError('Frozen baseline proposal folder is non-empty. Create an additive QA revision from the current saved field instead.')
    OUTPUT.mkdir(exist_ok=True, parents=True)
    records = []
    odd_verified = False
    odd_before = BEFORE / 'D-membership-24781.html'
    odd_record = None
    if odd_before.exists():
        raw_html = odd_before.read_text(encoding='utf-8-sig')
        odd_record = {'field': odd_before.stem, 'variant': 'D', 'kind': 'editorial-html', 'before': str(odd_before.relative_to(REPO)).replace('\\', '/'), 'beforeBytesSha256': digest(odd_before.read_bytes()), 'beforeTextSha256': digest(raw_html.encode()), 'beforeCharacters': len(raw_html)}
        try:
            patched = controls.patch_odd_html(raw_html)
            destination = OUTPUT / (odd_before.stem + '.proposed.html')
            destination.write_text(patched, encoding='utf-8')
            odd_record.update({'status': 'prepared-not-applied', 'proposed': str(destination.relative_to(REPO)).replace('\\', '/'), 'proposedBytesSha256': digest(destination.read_bytes()), 'proposedCharacters': len(patched), 'operation': 'Only append fd-tier-primary/secondary/dark to verified card wrappers. Preserve all content, hrefs, spacing and existing classes.'})
            odd_verified = True
        except ValueError as error:
            odd_record.update({'status': 'blocked-review-required', 'error': str(error)})
    for path in sorted(BEFORE.glob('*.css')):
        identity = re.fullmatch(r'([A-L])-(page|section-\d+)', path.stem)
        if not identity:
            continue
        letter, field = identity.groups()
        kind = 'page' if field == 'page' else 'section'
        raw = path.read_text(encoding='utf-8-sig')
        record = {'field': path.stem, 'variant': letter, 'kind': kind, 'before': str(path.relative_to(REPO)).replace('\\', '/'), 'beforeBytesSha256': digest(path.read_bytes()), 'beforeTextSha256': digest(raw.encode()), 'beforeCharacters': len(raw), 'status': 'not-prepared'}
        if kind == 'section' and not raw.strip():
            record['status'] = 'captured-empty-no-change-required'
            records.append(record)
            continue
        try:
            proposed, report = controls.transform_native_css(raw, letter, kind, odd_classes_verified=(letter == 'D' and odd_verified))
            # Source layout/geometry must remain unchanged before appends. This
            # checks the non-adapter transformed source, where only paint edits
            # are expected, rather than comparing newly added focus outlines.
            transformed, _ = controls.original.migrate_css(raw, letter)
            assert controls.original.geometry_declarations(raw) == controls.original.geometry_declarations(transformed)
            assert not controls.original.COLOR.search(controls.original.COMMENT.sub('', proposed)), 'Literal paint remained in native proposal'
            assert 'var(--q-header)' not in proposed and 'var(--q-accent)' not in proposed, 'Extra brand-role dependency remained'
            destination = OUTPUT / (path.stem + '.proposed.css')
            destination.write_text(proposed, encoding='utf-8')
            record.update({'status': 'prepared-not-applied', 'proposed': str(destination.relative_to(REPO)).replace('\\', '/'), 'proposedBytesSha256': digest(destination.read_bytes()), 'proposedCharacters': len(proposed), 'originalGeometryPreserved': True, 'report': report})
        except (ValueError, AssertionError) as error:
            record.update({'status': 'blocked-review-required', 'error': str(error)})
        records.append(record)
    if odd_record:
        records.append(odd_record)
    expected = [letter+'-page' for letter in 'ABCDEFGHIJKL'] + [letter+'-section-'+str(identity) for letter, identities in EXPECTED_SECTIONS.items() for identity in identities] + ['D-membership-24781']
    prepared = {record['field'] for record in records if record['status'] == 'prepared-not-applied'}
    manifest = {'schema': 'fd-native-field-proposals/v1', 'target': {'region': 'US-BETA', 'circuit': 'INDY Demo', 'site': 'Adam Template Testing 2'}, 'status': 'prepared-from-current-native-backups-not-applied', 'fields': records, 'summary': {status: sum(r['status'] == status for r in records) for status in ('prepared-not-applied', 'captured-empty-no-change-required', 'blocked-review-required')}, 'gates': ['Compare the actual current native field with beforeTextSha256 immediately before saving.', 'Page and Section proposals are distinct native fields; never paste compiled public CSS.', 'Preview desktop/mobile before publishing the named page.', 'Odd semantic role adapter is included only after exact backed-up card class/name matching; save HTML and CSS atomically.', 'Native second-palette test and actual state/contrast verification remain required.']}
    manifest['coverage'] = {'expectedNativeChanges': len(expected), 'preparedExpectedChanges': sum(field in prepared for field in expected), 'missingOrBlocked': [field for field in expected if field not in prepared], 'sharedTheme': 'Separate shared-theme-completion bundle; not counted among these29 field changes.'}
    (OUTPUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    return manifest


if __name__ == '__main__':
    manifest = prepare()
    print(json.dumps({'summary': manifest['summary'], 'coverage': manifest['coverage'], 'blocked': [{'field': r['field'], 'error': r['error']} for r in manifest['fields'] if 'error' in r]}, indent=2))
