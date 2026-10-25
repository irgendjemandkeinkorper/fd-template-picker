"""Explicitly seal retained native-readback timestamps before portable checkout.

Root attests that these files were written immediately after native UI readback.
Their mtimes are retained provenance, not a server-provided save timestamp.
This one-time command never edits native field artifacts or proposal bundles.
"""
from __future__ import annotations
import argparse
import copy
import datetime as dt
import hashlib
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
BASE = HERE.parents[1]/'evidence/admin-controls-completion'


def digest(value):
    return hashlib.sha256(value).hexdigest()


def field_path(base, field):
    return base/'native-saved'/(field+('.html' if field=='D-membership-24781' else '.css'))


def manifest_digest(fields):
    return digest(json.dumps(fields,sort_keys=True,separators=(',',':')).encode())


def prepare_sealed_journal(journal, base=BASE):
    if journal.get('nativeReadbackProvenanceSeal') or any('nativeSavedVerifiedAt' in field or 'nativeSavedVerifiedSha256' in field for field in journal.get('fields',[])):
        raise ValueError('Native readback provenance is already sealed or partially present; refusing to replace immutable evidence.')
    fields = journal.get('fields',[])
    if len(fields)!=30 or len({field['field'] for field in fields})!=30:
        raise ValueError('Expected exactly30 distinct verified native fields.')
    result = copy.deepcopy(journal)
    records = []
    for field in result['fields']:
        source = field_path(base,field['field'])
        actual_hash = digest(source.read_bytes())
        if actual_hash != field.get('savedSha256') or field.get('nativeSaveDisabled') is not True or field.get('status') not in ('saved','saved-draft'):
            raise ValueError('Current native saved-state/hash is not verified: '+field['field'])
        verified_at = dt.datetime.fromtimestamp(source.stat().st_mtime,dt.timezone.utc).isoformat(timespec='microseconds').replace('+00:00','Z')
        field.update({'nativeSavedVerifiedAt':verified_at,'nativeSavedVerifiedSha256':actual_hash,'nativeSavedVerifiedAtSource':'Retained native-saved artifact mtime; root attests file was written immediately after native UI saved-field readback. This is local readback provenance, not an INDY server save timestamp.'})
        records.append({'field':field['field'],'artifact':'native-saved/'+source.name,'sha256':actual_hash,'verifiedAt':verified_at})
    records.sort(key=lambda row:row['field'])
    result['nativeReadbackProvenanceSeal'] = {'schema':'fd-native-readback-provenance-seal/v1','sealedAt':dt.datetime.now(dt.timezone.utc).isoformat().replace('+00:00','Z'),'operation':'Explicit one-time --seal-current-readbacks command; never run by report/guide builders.','timestampSource':'Existing readback-file mtime captured at explicit root sealing; root-attested immediate write after actual native UI readback. Retained timestamps are thereafter independent of filesystem mtimes.','immutable':True,'fieldCount':len(records),'fields':records,'manifestSha256':manifest_digest(records)}
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--seal-current-readbacks',action='store_true',help='Explicit one-time authorization to add the30 hash-bound timestamp records to the journal.')
    args = parser.parse_args()
    if not args.seal_current_readbacks:
        parser.error('No seal written. Pass --seal-current-readbacks explicitly after reviewing current verified native readbacks.')
    path = BASE/'changes-journal.json'
    before = path.read_bytes()
    result = prepare_sealed_journal(json.loads(before),BASE)
    # Refuse a concurrent journal change; the operation never refreshes an old seal.
    if path.read_bytes()!=before:
        raise ValueError('Journal changed during preparation; no seal written.')
    path.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'sealedFields':30,'manifestSha256':result['nativeReadbackProvenanceSeal']['manifestSha256'],'source':'root-attested retained native UI readback artifact mtimes','nativeArtifactsModified':False},indent=2))


if __name__=='__main__':
    main()
