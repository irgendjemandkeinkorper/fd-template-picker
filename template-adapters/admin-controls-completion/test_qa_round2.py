import hashlib
import json
import pathlib
import sys
import unittest

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import prepare_qa_corrections_round2 as corrections
import native_fields as controls


class QARound2Tests(unittest.TestCase):
    def test_exact_current_saved_revisions_preserve_source_geometry(self):
        manifest = json.loads((corrections.OUTPUT/'round2-manifest.json').read_text())
        self.assertEqual(len(manifest['fields']),8)
        for record in manifest['fields']:
            before = (corrections.REPO/record['beforeSnapshot']).read_text(encoding='utf-8')
            proposed = corrections.REPO/record['proposal']
            after = proposed.read_text(encoding='utf-8')
            self.assertEqual(corrections.corrected(record['field'],before),after)
            self.assertEqual(hashlib.sha256(proposed.read_bytes()).hexdigest(),record['proposalBytesSha256'])
            self.assertEqual(controls.original.geometry_declarations(before),controls.original.geometry_declarations(after))

    def test_d_only_changes_kicker_and_preserves_empty_loyalty_slots(self):
        before = (corrections.OUTPUT/'D-page-v2.before.css').read_text(encoding='utf-8')
        after = corrections.corrected('D-page',before)
        self.assertIn('.od-club__stamps span {',after)
        self.assertIn('color: transparent;',after)
        self.assertEqual(after.count('color: transparent;'),before.count('color: transparent;'))
        self.assertEqual(after.count('color: var(--v-muted);'),before.count('color: var(--v-muted);')-1)

    def test_g_repairs_owned_rules_and_keeps_featured_card_overrides(self):
        raw = (corrections.OUTPUT/'G-section-25116-v2.before.css').read_text(encoding='utf-8')
        after = corrections.corrected('G-section-25116',raw)
        self.assertIn('&.fdp-g-membership .fdp-number{display:block;color:var(--q-background);',after)
        self.assertIn('.fdp-card:nth-child(2) :is(h3,p,.fdp-number){color:var(--fd-dark)!important;}',after)

    def test_native_food_and_editorial_bridges_are_scoped(self):
        for field in ('J-section-25127','K-section-25122'):
            css = corrections.corrected(field,'/* existing */\n')
            self.assertIn('&.fdp-'+field[0].lower()+'-food .text-current-color',css)
        for field, marker in [('K-page','section-k-welcome-'),('L-page','section-l-one-more-')]:
            css = corrections.corrected(field,'/* existing */\n')
            self.assertIn(marker,css)
            self.assertIn('.text-white',css)
            self.assertNotIn('padding:',css)
            self.assertNotIn('display:',css)

    def test_ma_strengthens_existing_backdrop_without_changing_caption_offsets(self):
        raw = (corrections.OUTPUT/'I-page-v2.before.css').read_text(encoding='utf-8')
        after = corrections.corrected('I-page',raw)
        self.assertIn('--ma-caption-backdrop: var(--q-dark);',after)
        self.assertNotIn('--ma-caption-backdrop: color-mix(',after)
        self.assertIn('left: 24px !important',after)


if __name__ == '__main__':
    unittest.main()
