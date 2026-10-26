import hashlib
import json
import pathlib
import sys
import unittest

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import native_fields as controls
import prepare_qa_corrections_round3 as correction


class QARound3Tests(unittest.TestCase):
    def test_revisions_match_exact_before_and_preserve_geometry(self):
        manifest = json.loads((correction.OUTPUT / 'round3-manifest.json').read_text())
        self.assertEqual(len(manifest['fields']), 4)
        for row in manifest['fields']:
            before = (correction.REPO / row['beforeSnapshot']).read_text(encoding='utf-8')
            proposal = correction.REPO / row['proposal']
            after = proposal.read_text(encoding='utf-8')
            self.assertEqual(after, correction.corrected(row['field'], before))
            self.assertEqual(hashlib.sha256(proposal.read_bytes()).hexdigest(), row['proposalBytesSha256'])
            self.assertEqual(controls.original.geometry_declarations(before), controls.original.geometry_declarations(after))

    def test_earned_stamps_use_dark_without_hiding_any_glyph(self):
        before = (correction.OUTPUT / 'D-page-v3.before.css').read_text(encoding='utf-8')
        after = correction.corrected('D-page', before)
        self.assertEqual(before.count('color: transparent;'), after.count('color: transparent;'))
        self.assertIn('color: var(--q-dark);\n  transform: rotate(-8deg)', after)
        self.assertIn('border-color: var(--q-dark);', after)
        self.assertNotIn('display: none', after[len(before):])

    def test_dark_bridges_target_only_observed_native_section_roles(self):
        for field, marker in [('J-page','section-j-intro-'), ('K-page','section-k-featured-'), ('L-page','section-l-opening-note-')]:
            css = correction.corrected(field, '/* existing */\n')
            self.assertIn(marker + '\"][data-test-id="section-content"]', css)
            self.assertIn('background-color:var(--q-dark)', css)
            self.assertIn(':is(h2,h3).text-current-color', css)
            self.assertIn('color:var(--q-background)', css)
            self.assertNotIn('padding:', css)
            self.assertNotIn('font-size:', css)
        self.assertIn('.text-h5.text-grey-9', correction.corrected('K-page',''))
        self.assertNotIn('.text-h5.text-grey-9', correction.corrected('J-page',''))


if __name__ == '__main__':
    unittest.main()
