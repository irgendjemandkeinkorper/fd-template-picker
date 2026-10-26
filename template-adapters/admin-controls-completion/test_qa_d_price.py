import hashlib
import json
import pathlib
import sys
import unittest

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import prepare_qa_correction_d_price as correction


class DPriceContainmentTests(unittest.TestCase):
    def test_one_owned_inset_is_only_css_change(self):
        before = (correction.OUTPUT/'D-page-v5.before.css').read_text(encoding='utf-8')
        after = (correction.OUTPUT/'D-page-v5.css').read_text(encoding='utf-8')
        self.assertEqual(after,correction.corrected(before))
        self.assertEqual(before.strip(),(correction.OUTPUT/'D-page-v4.css').read_text(encoding='utf-8').strip())
        self.assertEqual(after.replace('  right: 8px;','  right: -12px;',1),before)
        self.assertIn('top: -12px;',after)
        self.assertIn('transform: rotate(6deg);',after)
        self.assertIn('Odd mobile caption containment:',after)
        record = json.loads((correction.OUTPUT/'D-page-v5.json').read_text())
        self.assertEqual(hashlib.sha256((correction.OUTPUT/'D-page-v5.css').read_bytes()).hexdigest(),record['proposalBytesSha256'])


if __name__=='__main__':
    unittest.main()
