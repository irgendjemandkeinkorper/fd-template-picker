"""Prepare Odd's actual mobile overlay flow from saved native D v3."""
import hashlib
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
BASE = REPO/'evidence/admin-controls-completion'
OUTPUT = BASE/'qa-corrections'

MOBILE_CORRECTION = '''
/* Odd mobile caption containment: flow the actual absolute-full mobile branch
   below the existing collage print; keep its absolute stamp on the print. */
@media (max-width: 1023px) {
  [class*="section-hero-d---collage-"] [data-test-id="carousel-hero-slide"]:has(.mobile-hero-title),
  [class*="section-hero-d---collage-"] .row.justify-center.position-relative:has(.mobile-hero-title) {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
  }
  [class*="section-hero-d---collage-"] .row.justify-center.position-relative:has(.mobile-hero-title) {
    position: relative !important;
    display: block !important;
  }
  [class*="section-hero-d---collage-"] .flex.absolute-full:has(.mobile-hero-title) {
    position: static !important;
    inset: auto !important;
    transform: none !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    padding: 0 !important;
    margin-top: -.55em !important;
  }
  [class*="section-hero-d---collage-"] .flex.absolute-full:has(.mobile-hero-title) > .container {
    display: block !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    padding: 0 !important;
  }
  [class*="section-hero-d---collage-"] .col.message:has(.mobile-hero-title) {
    position: static !important;
    display: block !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    padding: 16px 0 0 !important;
  }
}
'''


def corrected(css):
    if 'Odd mobile caption containment:' in css:
        raise ValueError('Mobile revision already present.')
    return css.rstrip()+'\n'+MOBILE_CORRECTION


def prepare():
    source = BASE/'native-saved/D-page.css'
    raw = source.read_bytes()
    text = raw.decode('utf-8-sig')
    if text.strip() != (OUTPUT/'D-page-v3.css').read_text(encoding='utf-8-sig').strip():
        raise ValueError('Native D saved source differs from verified v3.')
    before, proposal, metadata = [OUTPUT/name for name in ('D-page-v4.before.css','D-page-v4.css','D-page-v4.json')]
    if any(path.exists() for path in (before,proposal,metadata)):
        raise ValueError('Existing v4 must not be overwritten.')
    after = corrected(text)
    before.write_bytes(raw)
    proposal.write_text(after,encoding='utf-8',newline='\n')
    sha = lambda value: hashlib.sha256(value).hexdigest()
    record = {'schema':'fd-native-qa-correction/v1','field':'D-page','editablePage':5900,'publishedPage':5899,'nativeSavedSource':str(source.relative_to(REPO)).replace('\\','/'),'beforeSnapshot':str(before.relative_to(REPO)).replace('\\','/'),'beforeBytesSha256':sha(raw),'beforeTextSha256':sha(text.encode()),'beforeCharacters':len(text),'proposal':str(proposal.relative_to(REPO)).replace('\\','/'),'proposalBytesSha256':sha(proposal.read_bytes()),'proposalTextSha256':sha(after.encode()),'proposalCharacters':len(after),'status':'prepared-from-native-saved-v3-not-applied-by-generator','observed':{'titleBounds':{'x':16.12,'y':408.10,'width':344.90,'height':85.95},'messageBounds':{'y':147,'height':400},'overlayBounds':{'y':147,'height':208.4375},'canvasBounds':{'y':147,'height':208.4375},'messageDisplay':'flex;justify-content:flex-end;overflow:hidden','overlayClass':'flex bg-clear flex-center absolute-full overlay-none','source':'Root live phone DOM chain and loaded screenshot'},'change':'Only actual mobile-caption branch: flow native overlay after existing collage print; remove fixed400px message height; grow native carousel canvas around image/title/CTA; anchor absolute stamp to relative print canvas.','unchanged':['All prior D v3 CSS as exact prefix','Desktop collage','Existing pseudo-element photo URL, crop, border, tilt and padding','Title font/tilt, stamp size/placement and CTA treatment','All native content/media/configuration, form behavior, unearned-slot semantics','Frozen baseline proposal bundle'],'acceptance':'Root must verify full loaded mobile image/title/stamp/CTA are visible within the expanded carousel, with no clipping or page overflow; recheck both native palettes and desktop after save/publish.'}
    metadata.write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8',newline='\n')
    return record


if __name__=='__main__':
    print(json.dumps(prepare(),indent=2))
