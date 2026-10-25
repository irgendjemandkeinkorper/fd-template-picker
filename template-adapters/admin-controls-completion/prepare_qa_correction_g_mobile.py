"""Prepare the narrow, actual-mobile-DOM Cut caption containment revision.

Works from the verified native-saved G v2 readback. Never modifies the frozen
proposal bundle, native source, media configuration, or any other page field.
"""
from __future__ import annotations
import hashlib
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
BASE = REPO / 'evidence/admin-controls-completion'
OUTPUT = BASE / 'qa-corrections'

MOBILE_CORRECTION = '''
/* Cut mobile caption containment: the native mobile overlay is absolute-full.
   Let its actual canvas grow with the caption; retain the desktop poster rules. */
@media (max-width: 899px) {
  [class*="section-hero-g---poster-block-"] [data-test-id="carousel-hero-slide"]:has(.mobile-hero-title),
  [class*="section-hero-g---poster-block-"] .row.justify-center.position-relative:has(.mobile-hero-title) {
    height: auto !important;
    min-height: 0 !important;
  }
  [class*="section-hero-g---poster-block-"] .row.justify-center.position-relative:has(.mobile-hero-title) {
    position: relative !important;
    display: block !important;
  }
  [class*="section-hero-g---poster-block-"] .flex.absolute-full:has(.mobile-hero-title) {
    position: relative !important;
    inset: auto !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 40px 28px 42px !important;
  }
  [class*="section-hero-g---poster-block-"] .flex.absolute-full:has(.mobile-hero-title) > .container {
    display: block !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  [class*="section-hero-g---poster-block-"] .col.message:has(.mobile-hero-title) {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    padding: 0 !important;
  }
  [class*="section-hero-g---poster-block-"] .title.mobile-hero-title {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 0 22px !important;
    font-size: clamp(44px,14vw,62px) !important;
    line-height: 1 !important;
    transform: rotate(-3deg) !important;
    transform-origin: left center;
  }
  [class*="section-hero-g---poster-block-"] .mobile-hero-subtitle {
    width: 100% !important;
    max-width: 100% !important;
  }
}
'''


def corrected(css):
    if 'Cut mobile caption containment:' in css:
        raise ValueError('Mobile revision is already present; do not append twice.')
    if 'color: var(--q-dark) !important;' not in css:
        raise ValueError('Missing saved G v2 action foreground correction.')
    return css.rstrip() + '\n' + MOBILE_CORRECTION


def prepare():
    source = BASE / 'native-saved/G-page.css'
    source_bytes = source.read_bytes()
    source_text = source_bytes.decode('utf-8-sig')
    v2 = OUTPUT / 'G-page-v2.css'
    if source_text.strip() != v2.read_text(encoding='utf-8-sig').strip():
        raise ValueError('Current saved G Page does not match the verified v2 revision.')
    before = OUTPUT / 'G-page-v3.before.css'
    proposal = OUTPUT / 'G-page-v3.css'
    record_path = OUTPUT / 'G-page-v3.json'
    if any(path.exists() for path in (before, proposal, record_path)):
        raise ValueError('A v3 artifact exists; choose a new revision rather than overwriting.')
    result = corrected(source_text)
    before.write_bytes(source_bytes)
    proposal.write_text(result, encoding='utf-8', newline='\n')
    sha = lambda data: hashlib.sha256(data).hexdigest()
    record = {
        'schema': 'fd-native-qa-correction/v1',
        'field': 'G-page',
        'editablePage': 5906,
        'publishedPage': 5905,
        'nativeSavedSource': str(source.relative_to(REPO)).replace('\\', '/'),
        'beforeSnapshot': str(before.relative_to(REPO)).replace('\\', '/'),
        'beforeBytesSha256': sha(source_bytes),
        'beforeTextSha256': sha(source_text.encode()),
        'beforeCharacters': len(source_text),
        'proposal': str(proposal.relative_to(REPO)).replace('\\', '/'),
        'proposalBytesSha256': sha(proposal.read_bytes()),
        'proposalTextSha256': sha(result.encode()),
        'proposalCharacters': len(result),
        'status': 'prepared-from-native-saved-v2-not-applied-by-generator',
        'observed': {
            'viewportWidth': 375,
            'headerBottom': 83.9,
            'titleBounds': {'x': -.511, 'y': 52.211, 'width': 374.626, 'height': 135.117},
            'titleFontSize': 66.368,
            'titleLineHeight': 51.767,
            'titleRotationDegrees': -5,
            'messageBounds': {'y': 84, 'height': 256.525},
            'actualOverlayClass': 'flex bg-clear flex-center absolute-full overlay-none',
            'overlayBounds': {'y': 84, 'height': 240},
            'canvasClass': 'row justify-center position-relative',
            'canvasComputed': {'display': 'grid', 'position': 'static', 'height': '240px', 'overflow': 'hidden'},
            'rootEvidence': 'Root read-only native phone DOM chain and G-after-loaded.jpg',
        },
        'change': 'Only max899px, actual mobile-caption-containing canvas/overlay reflow;40px top/28px sides;44–62px title,line-height1 and−3deg tilt. Existing opaque backings/shadows remain.',
        'unchanged': ['All desktop rules', 'All prior G v2 CSS', 'Media configuration, image URL, crop and native content', 'Forms, product and booking behavior', 'Frozen proposal bundle'],
        'knownDependency': 'Native G mobile hero background image URL is null in current source; preexisting media configuration remains unchanged.',
        'acceptance': 'Root must preview375px and a narrow phone, confirm every title glyph lies below header and inside hero, verify full subtitle/CTA, no page overflow, desktop poster intact, and native saved/readback exact hash.',
    }
    record_path.write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8', newline='\n')
    return record


if __name__ == '__main__':
    print(json.dumps(prepare(), indent=2))
