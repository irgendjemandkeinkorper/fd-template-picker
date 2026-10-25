import hashlib
import json
import pathlib
import sys
import unittest

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import prepare_qa_correction_d_mobile as correction


class DMobileContainmentTests(unittest.TestCase):
    def test_exact_saved_v3_prefix_and_proposal_hash(self):
        before = (correction.OUTPUT/'D-page-v4.before.css').read_text(encoding='utf-8')
        after = (correction.OUTPUT/'D-page-v4.css').read_text(encoding='utf-8')
        self.assertEqual(after,correction.corrected(before))
        self.assertEqual(before.strip(),(correction.OUTPUT/'D-page-v3.css').read_text(encoding='utf-8').strip())
        record = json.loads((correction.OUTPUT/'D-page-v4.json').read_text())
        self.assertEqual(hashlib.sha256((correction.OUTPUT/'D-page-v4.css').read_bytes()).hexdigest(),record['proposalBytesSha256'])

    def test_only_actual_mobile_flow_changes_preserving_print_and_type(self):
        css = correction.MOBILE_CORRECTION
        self.assertIn('@media (max-width: 1023px)',css)
        self.assertIn('.flex.absolute-full:has(.mobile-hero-title)',css)
        self.assertIn('.col.message:has(.mobile-hero-title)',css)
        self.assertIn('height: auto !important;',css)
        self.assertIn('position: static !important;',css)
        self.assertIn('overflow: visible !important;',css)
        self.assertNotIn('::before',css)
        self.assertNotIn('.mobile-hero-subtitle',css)
        self.assertNotIn('font-size:',css)
        self.assertNotIn('rotate(',css)
        self.assertNotIn('background',css)


if __name__=='__main__':
    unittest.main()
