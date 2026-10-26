"""Create only A v2 from the frozen v1; never rewrite approved frozen files."""
import hashlib
import json
import pathlib
import re

import native_fields as controls

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
BASE = REPO / 'evidence/admin-controls-completion'
source = BASE / 'native-proposals/A-page.proposed.css'
destination = BASE / 'qa-corrections/A-page-v2.css'
css = source.read_text(encoding='utf-8')
corrected, removed = controls.remove_native_brand_overrides(css)
assert len(removed) == 1 and removed[0]['property'] == '--q-primary' and removed[0]['oldValue'] == 'var(--fd-primary)'
assert corrected == css.replace('--q-primary:var(--fd-primary)','',1)
destination.parent.mkdir(exist_ok=True)
destination.write_text(corrected,encoding='utf-8')
writes = []
for path in sorted((BASE / 'native-before').glob('*.css')):
    clean = controls.original.COMMENT.sub('',path.read_text(encoding='utf-8-sig'))
    entries = [{'property':prop,'value':value} for prop,_,value in controls.original.DECLARATION.findall(clean) if prop.startswith('--q-')]
    if entries:
        writes.append({'source':str(path.relative_to(REPO)).replace('\\','/'),'nativeCustomPropertyWrites':entries})
digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
record = {'schema':'fd-native-qa-correction/v1','status':'prepared-for-authorized-qa-correction-not-applied-by-generator','variant':'A','field':'Page Custom Styles (CSS)','editablePageId':5660,'publishedPageId':5659,'sourceFrozenProposal':str(source.relative_to(REPO)).replace('\\','/'),'sourceFrozenSha256':digest(source),'correction':str(destination.relative_to(REPO)).replace('\\','/'),'correctionSha256':digest(destination),'removedNativeOverrides':removed,'change':'Remove the single template-owned --q-primary declaration. All other approved CSS bytes remain unchanged.','liveFindingReportedByRoot':{'bodyPrimary':'#e06b4a','contactPrimary':'empty','contactFdPrimary':'empty','contactPrimaryTint':'empty','symptom':'Send text Dark on Dark after publication'},'expectedAfterNativeSave':{'contactPrimary':'Inherited #e06b4a from native body','fdPrimary':'Resolves to inherited native Primary','fdPrimaryTint':'Resolves to Primary16%/Background surface','send':'Dark text on Primary tint, current expected ratio10.24'},'nativeOverrideAudit':writes,'statusPreserved':'No other --q-* template writes found in current raw CSS backups; --q-warning/status/error references retained. No frozen proposal or manifest modified.'}
(BASE / 'qa-corrections/A-page-v2.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'correction':str(destination),'sha256':digest(destination),'removed':removed,'nativeWriteAudit':writes},indent=2))
