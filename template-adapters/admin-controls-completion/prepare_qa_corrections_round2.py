"""Create additive v2 QA revisions from exact current native-saved backups.

Does not regenerate or overwrite the frozen 29-field proposal bundle.
"""
from __future__ import annotations
import hashlib
import json
import pathlib
import re

import native_fields as controls

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
BASE = REPO / 'evidence/admin-controls-completion'
OUTPUT = BASE / 'qa-corrections'


def replace_property(css, selector, prop, expected, replacement):
    rule = re.compile(r'(' + re.escape(selector) + r'\s*\{)([^{}]*)(\})')
    matches = list(rule.finditer(css))
    if len(matches) != 1:
        raise ValueError(f'Expected one original rule: {selector}; found {len(matches)}')
    match = matches[0]
    body = match.group(2)
    declaration = re.compile(r'(' + re.escape(prop) + r'\s*:\s*)' + re.escape(expected) + r'(?=\s*;|\s*$)')
    changed, count = declaration.subn(lambda item: item.group(1) + replacement, body)
    if count != 1:
        raise ValueError(f'Expected one exact {prop}:{expected} in {selector}; found {count}')
    return css[:match.start(2)] + changed + css[match.end(2):]


def editorial_bridge(markers, tint):
    scope = ':is(' + ','.join(f'[class*="{marker}"]' for marker in markers) + ')'
    return f"""
/* Native editorial section color bridge; copy and fills use the maintained pair. */
{scope},
{scope} :is(.bg-primary,.bg-secondary,.q-card,.main-content) {{ background:var(--fd-{tint}-tint) !important; color:var(--q-dark) !important; }}
{scope} :is(.text-white,.text-primary,.text-body1,.text-h2,.text-current-color,h1,h2,h3,p,li,a,span) {{ color:var(--q-dark) !important; }}
"""


def corrected(field, css):
    if field == 'D-page':
        return replace_property(css,'[class*="section-events-d---noticeboard-"] .od-note__kicker','color','var(--v-muted)','var(--q-dark)')
    if field == 'G-page':
        return replace_property(css,'[class*="section-contact-g---two-tone-split-"] .q-card__section.row.items-center.justify-center :is(.q-btn__content,span)','color','var(--cut-bone) !important','var(--q-dark) !important')
    if field == 'G-section-25116':
        return replace_property(css,'&.fdp-g-membership .fdp-number','color','var(--fd-accent)','var(--q-background)')
    if field == 'I-page':
        old = '--ma-caption-backdrop: color-mix(in srgb, var(--q-dark) 88%, transparent);'
        assert css.count(old) == 1
        return css.replace(old,'--ma-caption-backdrop: var(--q-dark);',1)
    if field in ('J-section-25127','K-section-25122'):
        letter = field[0].lower()
        return css.rstrip() + f'\n\n/* Native product category titles inherit brand text by default. */\n&.fdp-{letter}-food .text-current-color {{ color:var(--q-dark) !important; }}\n'
    if field == 'K-page':
        return css.rstrip() + '\n' + editorial_bridge(['section-k-welcome-','section-k-stay-awhile-'],'primary')
    if field == 'L-page':
        return css.rstrip() + '\n' + editorial_bridge(['section-l-lounge-ritual-'],'primary') + editorial_bridge(['section-l-one-more-'],'secondary')
    raise ValueError(field)


def prepare():
    fields = ['D-page','G-page','G-section-25116','I-page','J-section-25127','K-section-25122','K-page','L-page']
    OUTPUT.mkdir(exist_ok=True)
    records = []
    for field in fields:
        source = BASE / 'native-saved' / (field + '.css')
        raw = source.read_text(encoding='utf-8-sig')
        result = corrected(field,raw)
        assert controls.original.geometry_declarations(raw) == controls.original.geometry_declarations(result), field + ' geometry changed'
        before = OUTPUT / (field + '-v2.before.css')
        proposal = OUTPUT / (field + '-v2.css')
        before.write_bytes(source.read_bytes())
        proposal.write_text(result,encoding='utf-8',newline='\n')
        sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
        records.append({'field':field,'nativeSavedSource':str(source.relative_to(REPO)).replace('\\','/'),'beforeSnapshot':str(before.relative_to(REPO)).replace('\\','/'),'beforeBytesSha256':sha(before),'beforeTextSha256':hashlib.sha256(raw.encode()).hexdigest(),'beforeCharacters':len(raw),'proposal':str(proposal.relative_to(REPO)).replace('\\','/'),'proposalBytesSha256':sha(proposal),'proposalCharacters':len(result),'geometryPreserved':True,'status':'prepared-qa-correction-not-applied-by-generator'})
    record = {'schema':'fd-native-qa-corrections-round2/v1','status':'prepared-from-native-saved-before-round2','fields':records,'findings':{'D':'Two kicker labels3.61 over strong Secondary scraps; native Dark expected5.59. Seven unearned punch-slot X glyphs deliberately transparent; unchanged.','G':'Exact old submit-content selector overrides generic foreground; set that owned declaration Dark. First membership number uses Secondary on Dark surface2.61; set its native Section base foreground Background, retaining featured-card overrides.','I':'Existing higher-specificity Ma caption backdrop still88%; make its existing custom property opaque Dark.','J-K-food':'Native category text-current-color inherits Primary; constrain only the owning food section to native Dark.','K-editorial':'Native Welcome/Stay Awhile Primary backgrounds and white bodycopy bypass section-role treatment; bridge their exact existing classes to Primary tint/Dark.','L-editorial':'Native Lounge Ritual Primary and One More Secondary fills require corresponding tint/Dark role bridges.'},'unchanged':['Frozen native-proposals bundle and manifest','All content/media/URLs/form routing/native color values','Odd intentionally transparent unearned stamp X slots','Layout, geometry, fonts and fixed tilts'],'guard':'Compare current native field with exact beforeTextSha256 before saving. Root must verify saved/public desktop/mobile and second-palette output.'}
    (OUTPUT / 'round2-manifest.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8',newline='\n')
    return record


if __name__ == '__main__':
    print(json.dumps(prepare(),indent=2))
