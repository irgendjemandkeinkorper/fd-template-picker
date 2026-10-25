import hashlib
import json
import pathlib
import sys
import unittest

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import prepare_qa_correction_d_price_clearance as correction


class DPriceTitleClearanceTests(unittest.TestCase):
    def test_only_mobile_top_changes(self):
        before = (correction.OUTPUT/'D-page-v7.before.css').read_text(encoding='utf-8')
        after = (correction.OUTPUT/'D-page-v7.css').read_text(encoding='utf-8')
        self.assertEqual(after,correction.corrected(before))
        self.assertEqual(after.replace('    top: -38px;','    top: -8px;',1),before)
        self.assertEqual(after.count('right: 8px;'),before.count('right: 8px;'))
        self.assertIn('transform: rotate(6deg);',after)
        record = json.loads((correction.OUTPUT/'D-page-v7.json').read_text())
        self.assertEqual(hashlib.sha256((correction.OUTPUT/'D-page-v7.css').read_bytes()).hexdigest(),record['proposalBytesSha256'])
        self.assertAlmostEqual(30-20.45,record['observed']['expectedMinimumNameGapAfterLift'])

    def test_future_generation_keeps_both_insets_and_mobile_title_clearance(self):
        source = (correction.BASE/'native-before/D-page.css').read_text(encoding='utf-8')
        css = correction.normalize_source_price_layout(source)
        positions = [rule.group(2) for rule in correction.RULE.finditer(css) if 'right:' in rule.group(2)]
        self.assertEqual(len(positions),2)
        self.assertTrue(all('right: 8px;' in body for body in positions))
        self.assertIn('top: -12px;',positions[0])
        self.assertIn('top: -38px;',positions[1])
        self.assertEqual(correction.normalize_source_price_layout(css),css)


if __name__=='__main__':
    unittest.main()
