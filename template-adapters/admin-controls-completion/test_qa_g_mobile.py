import hashlib
import json
import pathlib
import re
import sys
import unittest

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import prepare_qa_correction_g_mobile as correction


class GMobileContainmentTests(unittest.TestCase):
    def test_revision_preserves_verified_v2_as_prefix(self):
        before = (correction.OUTPUT / 'G-page-v3.before.css').read_text(encoding='utf-8')
        after = (correction.OUTPUT / 'G-page-v3.css').read_text(encoding='utf-8')
        self.assertEqual(after, correction.corrected(before))
        self.assertTrue(after.startswith(before.rstrip() + '\n'))
        self.assertEqual(before, (correction.OUTPUT / 'G-page-v2.css').read_text(encoding='utf-8'))

    def test_added_rules_apply_only_actual_mobile_hero_branch(self):
        added = correction.MOBILE_CORRECTION
        self.assertEqual(added.count('@media (max-width: 899px)'), 1)
        self.assertNotIn('.hero-title', added)
        self.assertIn('.flex.absolute-full:has(.mobile-hero-title)', added)
        self.assertIn('.row.justify-center.position-relative:has(.mobile-hero-title)', added)
        for selector in re.findall(r'([^{}]+)\{', added)[1:]:
            if selector.strip().startswith('@media'):
                continue
            self.assertIn('section-hero-g---poster-block-', selector)
            self.assertIn('.mobile-hero-', selector)
        self.assertIn('position: relative !important;', added)
        self.assertIn('height: auto !important;', added)
        self.assertIn('padding: 40px 28px 42px !important;', added)
        self.assertIn('line-height: 1 !important;', added)
        self.assertIn('transform: rotate(-3deg) !important;', added)
        self.assertNotIn('background', added)
        self.assertNotIn('url(', added)

    def test_manifest_hash_and_source_proof(self):
        record = json.loads((correction.OUTPUT / 'G-page-v3.json').read_text())
        self.assertEqual(record['beforeBytesSha256'], hashlib.sha256((correction.OUTPUT / 'G-page-v3.before.css').read_bytes()).hexdigest())
        self.assertEqual(record['proposalBytesSha256'], hashlib.sha256((correction.OUTPUT / 'G-page-v3.css').read_bytes()).hexdigest())
        self.assertLess(record['observed']['titleBounds']['y'], record['observed']['headerBottom'])
        with self.assertRaises(ValueError):
            correction.corrected((correction.OUTPUT / 'G-page-v3.css').read_text())


if __name__ == '__main__':
    unittest.main()
