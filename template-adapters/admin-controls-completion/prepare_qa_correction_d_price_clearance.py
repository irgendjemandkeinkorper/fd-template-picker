"""Lift only Odd's mobile price sticker clear of the native product title."""
import hashlib
import json
import pathlib
import re
from prepare_qa_correction_d_price import SELECTOR

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
BASE = REPO/'evidence/admin-controls-completion'
OUTPUT = BASE/'qa-corrections'
RULE = re.compile(r'('+re.escape(SELECTOR)+r'\s*\{)([^{}]*)(\})')


def corrected(css):
    owners = [rule for rule in RULE.finditer(css) if re.search(r'\btop\s*:\s*-8px\s*;',rule.group(2)) and re.search(r'\bright\s*:\s*8px\s*;',rule.group(2))]
    if len(owners) != 1:
        raise ValueError(f'Expected one mobile price placement owner; found {len(owners)}.')
    owner = owners[0]
    media = css[css.rfind('@media',0,owner.start()):owner.start()]
    if not media.startswith('@media (max-width: 1023px)'):
        raise ValueError('Price rule is not the verified mobile media override.')
    body,count = re.subn(r'(\btop\s*:\s*)-8px(?=\s*;)',r'\g<1>-38px',owner.group(2))
    assert count == 1
    return css[:owner.start(2)]+body+css[owner.end(2):]


def normalize_source_price_layout(css):
    """Carry the measured base/mobile inset and mobile title clearance forward."""
    def replace(rule):
        body = re.sub(r'(\bright\s*:\s*)-(?:12|8)px(?=\s*;)',r'\g<1>8px',rule.group(2))
        media = css[css.rfind('@media',0,rule.start()):rule.start()]
        if re.match(r'@media\s*\(max-width:\s*1023px\)',media):
            body = re.sub(r'(\btop\s*:\s*)-8px(?=\s*;)',r'\g<1>-38px',body)
        return rule.group(1)+body+rule.group(3)
    return RULE.sub(replace,css)


def prepare():
    source = BASE/'native-saved/D-page.css'
    raw = source.read_bytes()
    text = raw.decode('utf-8-sig')
    if text.strip() != (OUTPUT/'D-page-v6.css').read_text(encoding='utf-8-sig').strip():
        raise ValueError('Current native D differs from verified v6.')
    before,proposal,metadata = [OUTPUT/name for name in ('D-page-v7.before.css','D-page-v7.css','D-page-v7.json')]
    if any(item.exists() for item in (before,proposal,metadata)):
        raise ValueError('Existing v7 must not be overwritten.')
    result = corrected(text)
    before.write_bytes(raw)
    proposal.write_text(result,encoding='utf-8',newline='\n')
    sha = lambda value: hashlib.sha256(value).hexdigest()
    record = {'schema':'fd-native-qa-correction/v1','field':'D-page','editablePage':5900,'publishedPage':5899,'nativeSavedSource':str(source.relative_to(REPO)).replace('\\','/'),'beforeSnapshot':str(before.relative_to(REPO)).replace('\\','/'),'beforeBytesSha256':sha(raw),'beforeTextSha256':sha(text.encode()),'beforeCharacters':len(text),'proposal':str(proposal.relative_to(REPO)).replace('\\','/'),'proposalBytesSha256':sha(proposal.read_bytes()),'proposalTextSha256':sha(result.encode()),'proposalCharacters':len(result),'status':'prepared-from-native-saved-v6-not-applied-by-generator','change':'Only max1023px owned mobile price top:-8px becomes top:-38px, lifting the sticker30px onto the bottom photo area. Both right:8px insets remain.','observed':{'proof':'evidence/admin-controls-completion/qa-current-phone/D-food-final-proof.jpg','nativeProductTitle':'.col.text-left.text-body2','allSevenOverlapPixels':[16.6,20.45],'worstExampleNameTop':3429.0,'worstExamplePriceBottom':3449.45,'expectedMinimumNameGapAfterLift':9.55,'source':'Root full-phone food proof and all seven native title/price bounds'},'unchanged':['All colors and desktop v6 placement','Both right:8px price insets','Mobile padding6px8px and sticker6deg tilt','Native product names/type/row widths, media and overflow semantics','D v4 collage flow, native content/form and frozen baseline proposal bundle'],'acceptance':'Verify all seven complete prices above product names with positive separation on phone; desktop unchanged; both exact native palettes and original restoration; retain fresh phone food proof and final D matrix.'}
    metadata.write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8',newline='\n')
    return record


if __name__=='__main__':
    print(json.dumps(prepare(),indent=2))
