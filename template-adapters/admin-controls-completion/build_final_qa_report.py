"""Aggregate current native QA, rejecting old/partial/wrong-palette captures.

Reads only the four explicit final-QA directories and the native save journal.
Does not use the earlier cycle audit, browser, network, or native Admin state.
"""
from __future__ import annotations
import collections
import datetime as dt
import hashlib
import json
import pathlib
import re

import native_fields as controls
from seal_native_readback_provenance import field_path, manifest_digest

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
BASE = REPO / 'evidence/admin-controls-completion'
PALETTES = {
    'original': dict(primary='#e06b4a',secondary='#c4553a',dark='#38264a',background='#fbefe2'),
    'test': dict(primary='#176b9d',secondary='#f2ca52',dark='#122c43',background='#f7fafc'),
}
SOURCES = [('qa-current-desktop','original','desktop'),('qa-current-phone','original','phone'),('qa-test-desktop','test','desktop'),('qa-test-phone','test','phone')]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def timestamp(value):
    return dt.datetime.fromisoformat(value.replace('Z','+00:00')).timestamp() if value else None


def parse_color(value):
    """Only the fully known RGB/sRGB computed forms used by bounded reviews."""
    if value == 'transparent':
        return (0.,0.,0.,0.)
    if value.startswith('#'):
        return (*controls.rgb(value),1.)
    match = re.fullmatch(r'rgba?\(([^)]+)\)',value)
    if match:
        values = [float(v) for v in re.split(r'[,\s/]+',match.group(1).strip())]
        return tuple(v/255 for v in values[:3]) + (values[3] if len(values)>3 else 1.,)
    match = re.fullmatch(r'color\(srgb\s+([^)]+)\)',value)
    if match:
        values = [float(v) for v in re.split(r'[\s/]+',match.group(1).strip())]
        return tuple(values[:3]) + (values[3] if len(values)>3 else 1.,)
    raise ValueError('Unreviewed computed color form: '+value)


def opaque_foreground(color, backing):
    return controls.mix(color[:3],color[3],backing)


def manual_bound(sample, palette):
    """Resolve only the two observed, explicitly bounded decorations."""
    details = sample.get('unresolved') or []
    fg = parse_color(sample['color'])
    threshold = sample.get('threshold',4.5)
    if 'section-membership-c---card-ledger-' in sample.get('section','') and sample.get('element') in ('p.mbc__tier','p.mbc__meta','p.mbc__rate'):
        if len(details) != 1 or details[0].get('kind') != 'image-or-gradient-before-opaque-backing':
            return None
        paint = details[0].get('paint','')
        stops = re.findall(r'color\(srgb\s+([^)]+)\)',paint)
        if not paint.startswith('linear-gradient(') or len(stops) != 2 or stops[0] != stops[1]:
            return None
        backing = parse_color('color(srgb '+stops[0]+')')
        if backing[3] != 1:
            return None
        ratio = controls.contrast(opaque_foreground(fg,backing[:3]),backing[:3])
        return {'review':'C-constant-gradient','mathPass':ratio>=threshold,'minimumRatio':round(ratio,2),'threshold':threshold,'reason':'Both fully opaque computed gradient stops are identical. Recalculate against that actual constant surface, including foreground alpha.','actualSurface':list(backing[:3]),'text':sample.get('text'),'element':sample.get('element')}
    if 'section-contact-d---postcard-' in sample.get('section','') and sample.get('text') == 'MESSAGE' and 'q-field__label' in sample.get('element',''):
        if len(details) != 1 or not details[0].get('paint','').startswith('repeating-linear-gradient(') or '/ 0.22' not in details[0].get('paint',''):
            return None
        source = (BASE/'native-saved/D-page.css').read_text(encoding='utf-8-sig')
        if not re.search(r'--v-line\s*:\s*color-mix\(in oklab,\s*var\(--v-ink\)\s+22%,\s*transparent\)',source):
            return None
        if not re.search(r'--v-ink\s*:\s*var\(--q-dark\)',source) or not re.search(r'--v-paper\s*:\s*var\(--q-background\)',source):
            return None
        paper, dark = controls.rgb(palette['background']),controls.rgb(palette['dark'])
        if any(abs(a-b)>.002 for a,b in zip(sample.get('effectiveBackground',[]),paper)) or len(sample.get('effectiveBackground',[]))<3:
            return None
        stripe = controls.mix(dark,.22,paper)
        ratios = [controls.contrast(opaque_foreground(fg,backing),backing) for backing in (paper,stripe)]
        ratio = min(ratios)
        return {'review':'D-ruled-notepaper-label','mathPass':ratio>=threshold,'minimumRatio':round(ratio,2),'threshold':threshold,'reason':'Bound every possible line position: transparent paper through fully painted 22% Dark rule. The opaque muted label passes over both extrema; stripe position cannot reduce it further.','paperRatio':round(ratios[0],2),'darkestRuleRatio':round(ratios[1],2),'text':sample.get('text'),'element':sample.get('element')}
    return None


def validate_provenance_seal(journal):
    seal = journal.get('nativeReadbackProvenanceSeal')
    if not seal:
        return False
    records = seal.get('fields',[])
    if seal.get('immutable') is not True or seal.get('fieldCount')!=30 or len(records)!=30 or manifest_digest(records)!=seal.get('manifestSha256'):
        raise ValueError('Native readback provenance seal manifest is invalid.')
    by_name = {row['field']:row for row in records}
    if len(by_name)!=30 or len(journal.get('fields',[]))!=30:
        raise ValueError('Native readback provenance field set differs from journal.')
    for field in journal['fields']:
        retained = by_name.get(field['field'],{})
        if retained.get('sha256')!=field.get('savedSha256') or retained.get('sha256')!=field.get('nativeSavedVerifiedSha256') or retained.get('verifiedAt')!=field.get('nativeSavedVerifiedAt') or timestamp(field.get('nativeSavedVerifiedAt')) is None:
            raise ValueError('Native saved-field provenance differs from immutable seal: '+field['field'])
    return True


def latest_native_save_time(variant, journal=None):
    journal = journal or json.loads((BASE/'changes-journal.json').read_text(encoding='utf-8'))
    if validate_provenance_seal(journal):
        selected = [field for field in journal['fields'] if field['field']=='site-theme' or field['field'].startswith(variant+'-')]
        times = []
        for field in selected:
            source = field_path(BASE,field['field'])
            if digest(source.read_bytes())!=field['nativeSavedVerifiedSha256']:
                raise ValueError('Native artifact bytes differ from sealed provenance: '+field['field'])
            times.append(timestamp(field['nativeSavedVerifiedAt']))
        return max(times,default=0)
    # Historical, unsealed local runs remain inspectable. Final acceptance also
    # requires the explicit immutable seal; rebuilding this report never seals.
    paths = [p for p in (BASE/'native-saved').iterdir() if p.name == 'site-theme.css' or re.match(r'^'+variant+r'-(?:page\.css|section-\d+\.css|membership-\d+\.html)$',p.name)]
    return max((p.stat().st_mtime for p in paths),default=0)


def inspect_capture(path, variant, palette_name, mode, journal=None):
    row = {'variant':variant,'palette':palette_name,'mode':mode,'source':str(path.relative_to(REPO)).replace('\\','/'),'eligible':False,'reasons':[]}
    if not path.exists():
        row['reasons'].append('missing-final-capture')
        return row
    raw = path.read_bytes()
    data = json.loads(raw)
    row.update({'sourceSha256':digest(raw),'capturedAt':data.get('capturedAt'),'title':data.get('title'),'summary':data.get('summary',{}),'captions':len(data.get('captions',[])),'textSamples':len(data.get('samples',[])),'manualBounds':[]})
    expected = PALETTES[palette_name]
    actual = {k:str(v).lower() for k,v in data.get('nativePalette',{}).items()}
    row['actualPalette'] = actual
    if actual != expected:
        row['reasons'].append('native-palette-does-not-match-required-exact-values')
    caption_checks = []
    if variant in 'ABCDEFGHI':
        paper_caption = variant in 'BDFH'
        foreground = controls.rgb(expected['dark' if paper_caption else 'background'])
        backing = controls.rgb(expected['background' if paper_caption else 'dark'])
        for caption in data.get('captions',[]):
            try:
                fg, bg = parse_color(caption['color']),parse_color(caption['background'])
                matches = all(abs(a-b)<.002 for a,b in zip(fg[:3],foreground)) and all(abs(a-b)<.002 for a,b in zip(bg[:3],backing)) and fg[3]==bg[3]==1
            except (ValueError,KeyError):
                matches = False
            protected = matches and caption.get('textShadow') not in (None,'none','') and caption.get('backgroundImage','none')=='none'
            caption_checks.append({'element':caption.get('element'),'opaqueNativePairAndShadow':protected})
        if not caption_checks or any(not item['opaqueNativePairAndShadow'] for item in caption_checks):
            row['reasons'].append('media-caption-native-pair-or-opaque-backing-shadow-not-verified')
    row['captionRoleChecks'] = caption_checks
    complete = data.get('completeness',{})
    if complete.get('status') != 'sufficient-for-sampled-current-state' or complete.get('reasons') or len(data.get('samples',[])) < 30:
        row['reasons'].append('missing-or-incomplete-current-sampler-proof')
    captured = timestamp(data.get('capturedAt'))
    try:
        cutoff = latest_native_save_time(variant,journal)
    except (ValueError,KeyError,OSError):
        cutoff = 0
        row['reasons'].append('native-readback-provenance-invalid')
    row['nativeReadbackFreshnessCutoff'] = dt.datetime.fromtimestamp(cutoff,dt.timezone.utc).isoformat()
    source_journal = journal or json.loads((BASE/'changes-journal.json').read_text(encoding='utf-8'))
    row['nativeReadbackFreshnessSource'] = 'immutable-hash-bound-journal-nativeSavedVerifiedAt' if source_journal.get('nativeReadbackProvenanceSeal') else 'legacy-unsealed-readback-file-mtime-not-portable-final-proof'
    if captured is None or captured < cutoff:
        row['reasons'].append('legacy-or-pre-current-native-readback-capture')
    if 'images' not in data or 'visibleLoaders' not in data:
        row['reasons'].append('old-sampler-missing-media-readiness-proof')
    if data.get('visibleLoaders') or any(image.get('src') and (not image.get('complete') or not image.get('naturalWidth')) for image in data.get('images',[])):
        row['reasons'].append('visible-media-or-loader-not-ready')
    viewport = data.get('viewport',{})
    row['viewport'] = viewport
    if viewport.get('scrollWidth',0) > viewport.get('clientWidth',0):
        row['reasons'].append('horizontal-page-overflow')
    if (mode == 'phone' and viewport.get('width',0) > 600) or (mode == 'desktop' and viewport.get('width',0) < 1000):
        row['reasons'].append('viewport-does-not-match-mode')
    summary = row['summary']
    if data.get('failures') or summary.get('fail',0) or summary.get('unparsed-foreground',0):
        row['reasons'].append('measured-text-failure-or-unparsed-foreground')
    for sample in data.get('manual',[]):
        try:
            bound = manual_bound(sample,expected)
        except (ValueError,KeyError):
            bound = None
        row['manualBounds'].append(bound or {'review':'unresolved-manual-case','mathPass':False,'element':sample.get('element'),'text':sample.get('text')})
    if any(not bound['mathPass'] for bound in row['manualBounds']):
        row['reasons'].append('manual-decoration-case-not-mathematically-resolved')
    if summary.get('manual-image-or-group-compositing-check',0) != len(data.get('manual',[])):
        row['reasons'].append('manual-summary-count-mismatch')
    if sum(summary.values()) != len(data.get('samples',[])):
        row['reasons'].append('sample-summary-count-mismatch')
    row['eligible'] = not row['reasons']
    return row


def inspect_saved_fields(journal):
    try:
        portable_provenance = validate_provenance_seal(journal)
        seal_error = None
    except (ValueError,KeyError):
        portable_provenance = False
        seal_error = 'native-readback-provenance-seal-invalid'
    rows = []
    for field in journal.get('fields',[]):
        name = field['field']
        path = BASE/'native-saved'/(name+('.html' if name.startswith('D-membership') else '.css'))
        row = {'field':name,'journalStatus':field.get('status'),'nativeSaveDisabled':field.get('nativeSaveDisabled'),'savedReadbackMatches':False,'roleContractPass':True,'reasons':[]}
        if not path.exists():
            row['reasons'].append('missing-saved-native-field')
        else:
            raw = path.read_bytes()
            text = raw.decode('utf-8-sig')
            row['savedReadbackMatches'] = field.get('savedSha256') in {digest(raw),digest(text.encode()),digest(text.strip().encode())}
            if not row['savedReadbackMatches']:
                row['reasons'].append('saved-hash-differs-from-native-journal')
            if seal_error:
                row['reasons'].append(seal_error)
            if journal.get('nativeReadbackProvenanceSeal') and digest(raw)!=field.get('nativeSavedVerifiedSha256'):
                row['reasons'].append('artifact-bytes-differ-from-sealed-native-readback')
            row['nativeSavedVerifiedAt'] = field.get('nativeSavedVerifiedAt')
            if path.suffix == '.css':
                css = controls.original.COMMENT.sub('',text)
                if re.search(r'var\(--q-(?:header|accent)\)',css):
                    row['reasons'].append('independent-header-or-accent-brand-dependency')
                if re.search(r'--q-(?:primary|secondary|dark|background|header|accent)\s*:',css):
                    row['reasons'].append('template-owned-native-palette-override')
                if name != 'site-theme':
                    for role in ('primary','secondary','dark','background'):
                        if not re.search(r'--fd-'+role+r'\s*:\s*var\(--q-'+role+r'\)',css):
                            row['reasons'].append('missing-native-role-alias-'+role)
            elif any(text.count('fd-tier-'+role) != 1 for role in ('primary','secondary','dark')):
                row['reasons'].append('Odd-semantic-role-classes-not-exact')
        if not str(field.get('status','')).startswith('saved') or not field.get('nativeSaveDisabled'):
            row['reasons'].append('native-save-state-not-verified')
        row['roleContractPass'] = not row['reasons']
        rows.append(row)
    return {'fields':rows,'expectedFields':30,'allSavedReadbackAndRoleChecksPass':len(rows)==30 and all(row['roleContractPass'] for row in rows),'portableReadbackProvenanceVerified':portable_provenance and all(row['roleContractPass'] for row in rows),'provenanceSealSha256':journal.get('nativeReadbackProvenanceSeal',{}).get('manifestSha256')}


def build():
    journal = json.loads((BASE/'changes-journal.json').read_text(encoding='utf-8'))
    captures = [inspect_capture(BASE/folder/(variant+'.json'),variant,palette,mode,journal) for folder,palette,mode in SOURCES for variant in 'ABCDEFGHIJKL']
    groups = []
    for folder,palette,mode in SOURCES:
        rows = [row for row in captures if row['palette']==palette and row['mode']==mode]
        eligible = [row for row in rows if row['eligible']]
        totals = collections.Counter()
        for row in eligible:
            totals.update(row.get('summary',{}))
        groups.append({'directory':folder,'palette':palette,'mode':mode,'acceptedCaptures':len(eligible),'requiredCaptures':12,'acceptedTextSamples':sum(row.get('textSamples',0) for row in eligible),'acceptedSummary':dict(totals),'retryVariants':[row['variant'] for row in rows if not row['eligible']],'all12Accepted':len(eligible)==12})
    saved = inspect_saved_fields(journal)
    published = sorted({row['variant'] for row in journal.get('pages',[]) if row.get('status')=='published'})
    palette = journal.get('palette',{})
    restored = palette.get('status') == 'original-restored-native-save-verified' and palette.get('restoreNativeSaveDisabled') is True and bool(palette.get('restoredAt'))
    complete = all(row['eligible'] for row in captures) and saved['allSavedReadbackAndRoleChecksPass'] and saved['portableReadbackProvenanceVerified'] and published==list('ABCDEFGHIJKL') and restored
    report = {'schema':'fd-native-final-qa-report/v1','generatedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'target':journal['target'],'status':'accepted-with-bounded-manual-decoration-review' if complete else 'awaiting-current-complete-native-evidence','all48FinalCapturesAccepted':all(row['eligible'] for row in captures),'palettes':PALETTES,'paletteRestoration':{'nativeJournalVerified':restored,'journalStatus':palette.get('status'),'restoredAt':palette.get('restoredAt'),'restoredPublicMatrixAccepted':all(row['all12Accepted'] for row in groups if row['palette']=='original')},'publishedVariantsFromJournal':published,'savedFieldAudit':saved,'groups':groups,'captures':captures,'evidenceRules':['Only the four named final-QA directories are aggregated. Earlier cycle audits are historical and excluded.','Require exact body palette, current sampler completeness/media readiness, correct viewport, zero measured text failures, no overflow, and mathematically resolved known decorations.','Capture must have capturedAt at/after the latest relevant native-saved file readback mtime. This conservative filesystem freshness check is not a native publish timestamp.','Only visible current sampled states are certified. No all-slide, hover/focus, destination-site Library, form delivery or future populated programming certification is inferred.','Screenshots require independent loaded-pixel review. DOM/media readiness alone does not prove the raster captured after paint.'],'scope':{'completedImplementation':'A–L maintained Primary/Secondary/Dark roles and Background canvas, native-form/caption/action bridges, semantic Odd tier colors; approved CSS-field corrections saved and scoped pages published per native journal.','notCertified':['Arbitrary unvalidated palettes','Editable template typography or arbitrary slant/layout presets','Source HTML/editorial product data bindings','CSS-generated customer wording relocation','Destination-site Library copy/link/unlink workflow','Form delivery/booking/product configuration','Every film/image/hover/focus/drawer state','Picker screenshot/catalog refresh until separate capture review']}}
    manual_summary = []
    for palette_name in PALETTES:
        for kind in ('C-constant-gradient','D-ruled-notepaper-label'):
            bounds = [bound for row in captures if row['eligible'] and row['palette']==palette_name for bound in row.get('manualBounds',[]) if bound['review']==kind]
            if bounds:
                manual_summary.append({'palette':palette_name,'review':kind,'acceptedSampleCount':len(bounds),'minimumRatio':min(bound['minimumRatio'] for bound in bounds),'allMathPass':all(bound['mathPass'] for bound in bounds)})
    report['manualReviewSummary'] = manual_summary
    report['evidenceRules'][2] = 'Capture timestamps must follow the latest relevant sealed journal nativeSavedVerifiedAt. Each timestamp is bound to the exact retained native artifact SHA-256, with an immutable manifest. These root-attested local readback times are not INDY server save times; checkout filesystem mtimes do not affect acceptance. Report/guide rebuilds never create or refresh seals.'
    ingestion_path = BASE/'captures/admin-controls-published-clips-001/ingestion.json'
    if ingestion_path.exists():
        ingestion_bytes = ingestion_path.read_bytes()
        ingestion = json.loads(ingestion_bytes)
        screenshot_complete = ingestion.get('status')=='applied-byte-identically' and ingestion.get('clipCount')==66
        report['catalogScreenshotRefresh'] = {'status':ingestion.get('status'),'clipCount':ingestion.get('clipCount'),'appliedAt':ingestion.get('appliedAt'),'evidence':str(ingestion_path.relative_to(REPO)).replace('\\','/'),'evidenceSha256':digest(ingestion_bytes),'completedAsSeparateEvidence':screenshot_complete,'boundary':'Genuine native pixels copied unchanged with independent hash-bound review. Source product placeholders remain native output; no missing media was fabricated.'}
        if screenshot_complete:
            report['scope']['notCertified'] = [scope for scope in report['scope']['notCertified'] if not scope.startswith('Picker screenshot/catalog refresh')]
            report['scope']['completedScreenshotWork'] = '66 reviewed native clips ingested byte-identically into the customer catalog; separate capture/ingestion evidence, not inferred from native saves.'
    (BASE/'final-qa-report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    lines = ['# Native color and overlay migration status','',f"Generated from saved evidence: {report['generatedAt']}.", '', f"**Status:** {report['status']}. This report covers the approved color and overlay implementation; it does not certify every Admin control.", '', f"The native journal records {len(published)} published template pages and {len(saved['fields'])} saved fields. Saved-readback/role checks: {'pass' if saved['allSavedReadbackAndRoleChecksPass'] else 'pending'}. Original palette restoration is {'verified in the native journal' if restored else 'not yet verified in the native journal'}; the restored public matrix is {'accepted' if report['paletteRestoration']['restoredPublicMatrixAccepted'] else 'still awaiting current complete captures'}.", '', '| Palette | View | Accepted captures | Accepted text samples | Retry |','|---|---|---:|---:|---|']
    for group in groups:
        lines.append(f"| {group['palette']} | {group['mode']} | {group['acceptedCaptures']}/12 | {group['acceptedTextSamples']} | {', '.join(group['retryVariants']) or 'None'} |")
    lines += ['', '| Bounded decoration | Palette | Minimum copy contrast |','|---|---|---:|']
    for item in manual_summary:
        lines.append(f"| {item['review']} | {item['palette']} | {item['minimumRatio']:.2f}:1 |")
    lines += ['', 'The [machine-readable report](../../evidence/admin-controls-completion/final-qa-report.json) records each exact-palette, completeness, freshness, overflow and failure gate. Freshness uses immutable, hash-bound journal readback timestamps; checkout file mtimes do not change acceptance. Those retained local readback times are not INDY server save timestamps. Report/guide rebuilds never create or refresh a seal. Old cycle files do not contribute accepted evidence.', '', 'Maintained client colors come from native Primary, Secondary and Dark, with native Background as the opposing canvas/copy color. Header aliases consume Dark; Accent decoration consumes Secondary. Status/error colors retain their service meaning. CTA/card tints keep meaningful copy on a measured native pair. Opaque caption panels and shadows protect the observed A–I media captions; J–L editorial heroes use their explicit native panel roles.', '', 'C’s six manual gradient flags are bounded by their actual identical, opaque computed stops; foreground alpha is included in the recalculated ratios. D’s MESSAGE label is tested against both bare paper and the darkest 22% Dark ruling. The report retains the exact per-capture bounds instead of treating the sampler’s ancestor-only ratio as final.', '', 'Template fonts, design slants/structure, source HTML/data bindings, CSS-generated wording, Library transfer behavior and service configuration remain separate work. An arbitrary future palette still needs whole-page checks. The picker’s two-color check covers one pair and cannot certify the final native site.', '', 'F’s missing hero media and G’s null mobile background-image configuration are preexisting source-media dependencies. This migration did not change their media configuration.']
    if report.get('catalogScreenshotRefresh',{}).get('completedAsSeparateEvidence'):
        lines += ['', 'The separate [66-clip customer screenshot refresh is applied byte-identically](../../evidence/admin-controls-completion/captures/admin-controls-published-clips-001/ingestion.json), with independent hash-bound native pixel reviews. Source product placeholders remain unchanged.']
    (HERE/'FINAL-STATUS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8',newline='\n')
    return report


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--require-complete',action='store_true',help='Exit 1 unless all 48 current captures, saved fields, publications and native restoration pass.')
    args = parser.parse_args()
    result = build()
    print(json.dumps({'status':result['status'],'groups':result['groups'],'savedFieldsPass':result['savedFieldAudit']['allSavedReadbackAndRoleChecksPass'],'restoration':result['paletteRestoration']},indent=2))
    if args.require_complete and result['status'] != 'accepted-with-bounded-manual-decoration-review':
        raise SystemExit(1)
