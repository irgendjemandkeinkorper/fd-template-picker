import copy
import hashlib
import json
import os
import pathlib
import shutil
import sys
import tempfile
import unittest
from unittest.mock import patch

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import build_final_qa_report as report
import seal_native_readback_provenance as provenance


class PortableProvenanceTests(unittest.TestCase):
    def fixture(self, root):
        root = pathlib.Path(root).resolve()
        self.assertTrue(root.is_relative_to(HERE.resolve()))
        base = root/'evidence/admin-controls-completion'
        (base/'native-saved').mkdir(parents=True)
        journal = json.loads((report.BASE/'changes-journal.json').read_text())
        journal.pop('nativeReadbackProvenanceSeal',None)
        for field in journal['fields']:
            for key in ('nativeSavedVerifiedAt','nativeSavedVerifiedSha256','nativeSavedVerifiedAtSource'):
                field.pop(key,None)
            original = provenance.field_path(report.BASE,field['field'])
            shutil.copy2(original,provenance.field_path(base,field['field']))
        sealed = provenance.prepare_sealed_journal(journal,base)
        folder = base/'qa-test-desktop'
        folder.mkdir()
        shutil.copy2(report.BASE/'qa-test-desktop/A.json',folder/'A.json')
        return root,base,sealed

    def test_checkout_mtimes_do_not_change_sealed_freshness_or_acceptance(self):
        with tempfile.TemporaryDirectory(prefix='.provenance-test-',dir=HERE) as temporary:
            repo,base,journal = self.fixture(temporary)
            with patch.object(report,'BASE',base),patch.object(report,'REPO',repo):
                before = report.inspect_capture(base/'qa-test-desktop/A.json','A','test','desktop',journal)
                self.assertTrue(before['eligible'],before['reasons'])
                for source in (base/'native-saved').iterdir():
                    future = source.stat().st_mtime+365*86400
                    os.utime(source,(future,future))
                after = report.inspect_capture(base/'qa-test-desktop/A.json','A','test','desktop',journal)
                self.assertTrue(after['eligible'],after['reasons'])
                self.assertEqual(before['nativeReadbackFreshnessCutoff'],after['nativeReadbackFreshnessCutoff'])
                self.assertEqual(after['nativeReadbackFreshnessSource'],'immutable-hash-bound-journal-nativeSavedVerifiedAt')
                self.assertTrue(report.inspect_saved_fields(journal)['portableReadbackProvenanceVerified'])

    def test_altered_artifact_bytes_and_changed_journal_hash_are_rejected(self):
        with tempfile.TemporaryDirectory(prefix='.provenance-test-',dir=HERE) as temporary:
            repo,base,journal = self.fixture(temporary)
            source = base/'native-saved/A-page.css'
            source.write_bytes(source.read_bytes()+b'\n/* changed after native readback */\n')
            with patch.object(report,'BASE',base),patch.object(report,'REPO',repo):
                capture = report.inspect_capture(base/'qa-test-desktop/A.json','A','test','desktop',journal)
                self.assertFalse(capture['eligible'])
                self.assertIn('native-readback-provenance-invalid',capture['reasons'])
                self.assertFalse(report.inspect_saved_fields(journal)['portableReadbackProvenanceVerified'])
                changed_journal = copy.deepcopy(journal)
                next(field for field in changed_journal['fields'] if field['field']=='A-page')['savedSha256'] = hashlib.sha256(source.read_bytes()).hexdigest()
                with self.assertRaisesRegex(ValueError,'differs from immutable seal'):
                    report.validate_provenance_seal(changed_journal)

    def test_seal_is_immutable_and_never_refreshed_from_checkout_mtime(self):
        with tempfile.TemporaryDirectory(prefix='.provenance-test-',dir=HERE) as temporary:
            repo,base,journal = self.fixture(temporary)
            before = json.dumps(journal,sort_keys=True)
            with self.assertRaisesRegex(ValueError,'already sealed'):
                provenance.prepare_sealed_journal(journal,base)
            self.assertEqual(json.dumps(journal,sort_keys=True),before)


if __name__=='__main__':
    unittest.main()
