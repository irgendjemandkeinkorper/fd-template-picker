"""Inset Odd's native food price stickers inside their horizontal clip owner."""
import hashlib
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
BASE = REPO/'evidence/admin-controls-completion'
OUTPUT = BASE/'qa-corrections'
SELECTOR = '[class*="section-food-d---sticker-sheet-"] .q-card .row.items-center.justify-between'


def corrected(css):
    rules = list(re.finditer(r'('+re.escape(SELECTOR)+r'\s*\{)([^{}]*)(\})',css))
    owners = [rule for rule in rules if re.search(r'\bright\s*:\s*-12px\s*;',rule.group(2))]
    if len(owners) != 1:
        raise ValueError(f'Expected one original positioned price rule; found{len(owners)}.')
    owner = owners[0]
    body,count = re.subn(r'(\bright\s*:\s*)-12px(?=\s*;)',r'\g<1>8px',owner.group(2))
    assert count == 1
    return css[:owner.start(2)]+body+css[owner.end(2):]


def prepare():
    source = BASE/'native-saved/D-page.css'
    raw = source.read_bytes()
    before_text = raw.decode('utf-8-sig')
    if before_text.strip() != (OUTPUT/'D-page-v4.css').read_text(encoding='utf-8-sig').strip():
        raise ValueError('Current saved D differs from verified v4.')
    before,proposal,metadata = [OUTPUT/name for name in ('D-page-v5.before.css','D-page-v5.css','D-page-v5.json')]
    if any(item.exists() for item in (before,proposal,metadata)):
        raise ValueError('Existing v5 artifact must not be overwritten.')
    result = corrected(before_text)
    before.write_bytes(raw)
    proposal.write_text(result,encoding='utf-8',newline='\n')
    sha = lambda value: hashlib.sha256(value).hexdigest()
    record = {'schema':'fd-native-qa-correction/v1','field':'D-page','editablePage':5900,'publishedPage':5899,'nativeSavedSource':str(source.relative_to(REPO)).replace('\\','/'),'beforeSnapshot':str(before.relative_to(REPO)).replace('\\','/'),'beforeBytesSha256':sha(raw),'beforeTextSha256':sha(before_text.encode()),'beforeCharacters':len(before_text),'proposal':str(proposal.relative_to(REPO)).replace('\\','/'),'proposalBytesSha256':sha(proposal.read_bytes()),'proposalTextSha256':sha(result.encode()),'proposalCharacters':len(result),'status':'prepared-from-native-saved-v4-not-applied-by-generator','observed':{'nativeClip':'evidence/admin-controls-completion/native-clips/food--variant-d-odd.jpg','priceRowRule':SELECTOR,'priceRowGeometry':'absolute top−12px/right−12px; padding8px10px; rotate6deg','clipOwner':'.q-card__section.q-card__section--vert.column.justify-between.q-px-none.q-py-md: overflow-x:clip;overflow-y:visible','secondPriceRight':680.64,'secondClipRight':666.34,'thirdPriceRight':988.0,'thirdClipRight':974.93,'source':'Root fresh native DOM readback; clipped final decimals visible in native food clip'},'change':'Change only owned right:-12px to right:8px, moving each sticker20px inward before the native horizontal clip.','expectedBounds':'For observed second price, right≈660.65px versus clip666.34px; third≈968.01px versus clip974.93px. Verify native pixels rather than relying on translation arithmetic.','unchanged':['All paints/native palette roles','Top offset,6deg sticker tilt, padding and type','Card/image geometry and native overflow semantics','All D v4 mobile collage fixes','Native content/product/media/form behavior','Frozen baseline proposal bundle'],'acceptance':'Root must verify full currency strings and cents for all seven products on desktop/phone, no overlap with product names, both native palettes and original restoration; recapture D food before catalog acceptance.'}
    metadata.write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8',newline='\n')
    return record


if __name__=='__main__':
    print(json.dumps(prepare(),indent=2))
