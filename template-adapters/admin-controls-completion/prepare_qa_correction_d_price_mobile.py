"""Correct the separate mobile price inset that overrides Odd's base rule."""
import hashlib
import json
import pathlib
import re
from prepare_qa_correction_d_price import SELECTOR

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
BASE = REPO/'evidence/admin-controls-completion'
OUTPUT = BASE/'qa-corrections'


def corrected(css):
    rules = list(re.finditer(r'('+re.escape(SELECTOR)+r'\s*\{)([^{}]*)(\})',css))
    owners = [rule for rule in rules if re.search(r'\bright\s*:\s*-8px\s*;',rule.group(2))]
    if len(owners) != 1:
        raise ValueError(f'Expected one mobile price inset owner; found {len(owners)}.')
    owner = owners[0]
    media = css[css.rfind('@media',0,owner.start()):owner.start()]
    if not media.startswith('@media (max-width: 1023px)'):
        raise ValueError('Price override is not the verified mobile media rule.')
    body,count = re.subn(r'(\bright\s*:\s*)-8px(?=\s*;)',r'\g<1>8px',owner.group(2))
    assert count == 1
    return css[:owner.start(2)]+body+css[owner.end(2):]


def prepare():
    source = BASE/'native-saved/D-page.css'
    raw = source.read_bytes()
    text = raw.decode('utf-8-sig')
    if text.strip() != (OUTPUT/'D-page-v5.css').read_text(encoding='utf-8-sig').strip():
        raise ValueError('Current native D differs from verified v5.')
    before,proposal,metadata = [OUTPUT/name for name in ('D-page-v6.before.css','D-page-v6.css','D-page-v6.json')]
    if any(item.exists() for item in (before,proposal,metadata)):
        raise ValueError('Existing v6 must not be overwritten.')
    result = corrected(text)
    before.write_bytes(raw)
    proposal.write_text(result,encoding='utf-8',newline='\n')
    sha = lambda value: hashlib.sha256(value).hexdigest()
    record = {'schema':'fd-native-qa-correction/v1','field':'D-page','editablePage':5900,'publishedPage':5899,'nativeSavedSource':str(source.relative_to(REPO)).replace('\\','/'),'beforeSnapshot':str(before.relative_to(REPO)).replace('\\','/'),'beforeBytesSha256':sha(raw),'beforeTextSha256':sha(text.encode()),'beforeCharacters':len(text),'proposal':str(proposal.relative_to(REPO)).replace('\\','/'),'proposalBytesSha256':sha(proposal.read_bytes()),'proposalTextSha256':sha(result.encode()),'proposalCharacters':len(result),'status':'prepared-from-native-saved-v5-not-applied-by-generator','change':'Only max1023px owned mobile price right:-8px becomes right:8px. Base right:8px from v5 remains. All two source price positioning rules now inset8px.','observed':{'phonePriceRight':186.93,'phoneClipOwnerRight':179.35,'horizontalClip':7.58,'clipOwner':'.q-card__section: overflow-x:clip;overflow-y:visible','desktopV5Clearance':'all seven prices5.68–7.94px inside clip owner','source':'Root actual mobile DOM clipping chain plus source media-rule audit'},'unchanged':['All paints and desktop v5 inset','Mobile top:-8px, padding6px8px, sticker6deg tilt','All native content/media/form and D v4 collage flow','Native overflow semantics and frozen baseline proposal bundle'],'acceptance':'Root must verify all seven full currency strings and names on both views, both native palettes, original restoration and fresh D food clip review.'}
    metadata.write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8',newline='\n')
    return record


if __name__=='__main__':
    print(json.dumps(prepare(),indent=2))
