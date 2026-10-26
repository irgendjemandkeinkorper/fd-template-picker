import hashlib
import json
import pathlib
import re
import sys
import unittest

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import prepare_qa_correction_d_price_mobile as correction


class DMobilePriceTests(unittest.TestCase):
    def test_only_mobile_inset_changes_and_both_owners_are_inset(self):
        before = (correction.OUTPUT/'D-page-v6.before.css').read_text(encoding='utf-8')
        after = (correction.OUTPUT/'D-page-v6.css').read_text(encoding='utf-8')
        self.assertEqual(after,correction.corrected(before))
        self.assertEqual(after.replace('    right: 8px;','    right: -8px;',1),before)
        rules = re.findall(re.escape(correction.SELECTOR)+r'\s*\{([^{}]*)\}',after)
        insets = [re.search(r'\bright\s*:\s*([^;]+);',body).group(1) for body in rules if re.search(r'\bright\s*:',body)]
        self.assertEqual(insets,['8px','8px'])
        self.assertIn('    top: -8px;',after)
        self.assertIn('    padding: 6px 8px;',after)
        self.assertIn('transform: rotate(6deg);',after)
        record = json.loads((correction.OUTPUT/'D-page-v6.json').read_text())
        self.assertEqual(hashlib.sha256((correction.OUTPUT/'D-page-v6.css').read_bytes()).hexdigest(),record['proposalBytesSha256'])


if __name__=='__main__':
    unittest.main()
