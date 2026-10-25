import copy
import json
import pathlib
import sys
import unittest
from unittest.mock import patch

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import build_final_qa_report as report


class FinalQAReportTests(unittest.TestCase):
    def test_exact_palette_completeness_and_freshness_are_required(self):
        path = report.BASE/'qa-test-desktop/A.json'
        data = json.loads(path.read_bytes())
        with patch.object(report,'latest_native_save_time',return_value=0):
            self.assertTrue(report.inspect_capture(path,'A','test','desktop')['eligible'])
            changed = copy.deepcopy(data)
            changed['nativePalette']['primary'] = '#176b9e'
            with patch.object(pathlib.Path,'read_bytes',return_value=json.dumps(changed).encode()):
                self.assertIn('native-palette-does-not-match-required-exact-values',report.inspect_capture(path,'A','test','desktop')['reasons'])
            changed = copy.deepcopy(data)
            changed['completeness']['status'] = 'retry-after-native-content-loaded'
            with patch.object(pathlib.Path,'read_bytes',return_value=json.dumps(changed).encode()):
                self.assertIn('missing-or-incomplete-current-sampler-proof',report.inspect_capture(path,'A','test','desktop')['reasons'])
            changed = copy.deepcopy(data)
            changed['captions'][0]['textShadow'] = 'none'
            with patch.object(pathlib.Path,'read_bytes',return_value=json.dumps(changed).encode()):
                self.assertIn('media-caption-native-pair-or-opaque-backing-shadow-not-verified',report.inspect_capture(path,'A','test','desktop')['reasons'])
        with patch.object(report,'latest_native_save_time',return_value=report.timestamp(data['capturedAt'])+1):
            self.assertIn('legacy-or-pre-current-native-readback-capture',report.inspect_capture(path,'A','test','desktop')['reasons'])

    def test_only_actual_constant_c_gradient_can_be_bounded(self):
        data = json.loads((report.BASE/'qa-test-desktop/C.json').read_bytes())
        for sample in data['manual']:
            bound = report.manual_bound(sample,report.PALETTES['test'])
            self.assertTrue(bound['mathPass'])
            self.assertGreater(bound['minimumRatio'],7)
        changed = copy.deepcopy(data['manual'][0])
        changed['unresolved'][0]['paint'] = 'linear-gradient(140deg, color(srgb 0 0 0), color(srgb 1 1 1))'
        self.assertIsNone(report.manual_bound(changed,report.PALETTES['test']))

    def test_d_label_bound_tests_darkest_ruling_in_both_palettes(self):
        for folder,palette,expected in [('qa-test-desktop','test',5.62),('qa-current-desktop','original',5.12)]:
            data = json.loads((report.BASE/folder/'D.json').read_bytes())
            sample = next(item for item in data['manual'] if item['text']=='MESSAGE')
            bound = report.manual_bound(sample,report.PALETTES[palette])
            self.assertEqual(bound['minimumRatio'],expected)
            self.assertTrue(bound['mathPass'])
            self.assertLess(bound['darkestRuleRatio'],bound['paperRatio'])


if __name__=='__main__':
    unittest.main()
