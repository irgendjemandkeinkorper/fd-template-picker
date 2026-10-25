"""Static package guarantees only; native isolation/import remains an acceptance test."""
import hashlib
import json
from pathlib import Path
import re
import unittest

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
CSS = (HERE / 'section.proposed.css').read_text(encoding='utf-8')
MANIFEST = json.loads((HERE / 'dependency-manifest.json').read_text(encoding='utf-8'))


def selectors():
    # Flat rules only; preserve commas in :is() and color functions.
    source = re.sub(r'/\*.*?\*/', '', CSS, flags=re.S)
    for match in re.finditer(r'([^{}]+)\{([^{}]*)\}', source):
        selector, depth, start = match[1].strip(), 0, 0
        for index, char in enumerate(selector + ','):
            if char == '(':
                depth += 1
            elif char == ')':
                depth -= 1
            elif char == ',' and depth == 0:
                yield selector[start:index].strip()
                start = index + 1


class FoodPortabilityTests(unittest.TestCase):
    def test_scope_is_exact_stable_section_not_source_identity(self):
        scope = list(selectors())
        self.assertGreater(len(scope), 15)
        for selector in scope:
            self.assertTrue(selector.startswith('&.fdp-k-food'), selector)
        self.assertNotRegex(CSS, r'\bbody\b|site-170|\.page-|section-[a-z-]+-\d+|25122|25135|5915|5916|@at-root|@import')

    def test_native_variable_dependency_closure_and_no_token_overrides(self):
        inputs = set(re.findall(r'var\((--[\w-]+)', CSS))
        self.assertEqual(inputs, {'--q-primary', '--q-dark', '--q-background'})
        self.assertEqual(inputs, set(MANIFEST['package']['nativeThemeInputsRead']))
        self.assertFalse(re.findall(r'--[\w-]+\s*:', CSS))
        self.assertNotRegex(CSS, r'--(?:fd|pl|n|v)-|#[0-9a-fA-F]{3,8}\b|url\(')

    def test_selector_substitution_needs_no_source_ids(self):
        for root in ('.section-food-lab-912345', '.section-kitchen-pilot-987654'):
            compiled = CSS.replace('&', root)
            for selector in selectors():
                self.assertTrue(selector.replace('&', root).startswith(root + '.fdp-k-food'))
            self.assertIn(root + '.fdp-k-food h2', compiled)
            self.assertNotIn('&', compiled)

    def test_local_typography_and_controls_do_not_need_source_theme(self):
        self.assertIn('font-family: Georgia, "Times New Roman", serif !important;', CSS)
        self.assertIn('font-weight: 600 !important;', CSS)
        self.assertIn('font-family: Arial, "Helvetica Neue", sans-serif;', CSS)
        self.assertIn('&.fdp-k-food [data-category-id] .q-btn', CSS)
        self.assertNotRegex(CSS, r'data-category-id\s*=')
        self.assertIn(':focus-visible', CSS)
        self.assertIn('0 0 0 4px var(--q-background)', CSS)
        self.assertIn('color-mix(in srgb,var(--q-primary) 16%,var(--q-background))', CSS)
        self.assertNotIn('.generic-form-field', CSS)
        self.assertFalse(MANIFEST['package']['pageCssRequired'])
        self.assertFalse(MANIFEST['package']['sourceSiteThemeCssRequired'])

    def test_source_evidence_and_proposed_bytes_are_unchanged(self):
        for entry in MANIFEST['sourceArtifacts']:
            self.assertEqual(hashlib.sha256((REPO / entry['path']).read_bytes()).hexdigest(), entry['sha256'], entry['path'])
        self.assertEqual(hashlib.sha256((HERE / 'section.proposed.css').read_bytes()).hexdigest(), MANIFEST['package']['sectionCssSha256'])

    def test_actual_food_identity_and_honest_readiness(self):
        self.assertEqual(MANIFEST['source']['nativeWidgetType'], 'Concessions Menu')
        self.assertEqual(MANIFEST['source']['publishedSectionId'], '25135')
        self.assertEqual(MANIFEST['source']['editableSectionId'], '25122')
        self.assertEqual(MANIFEST['source']['catalogPublishedSectionIds'], ['25135'])
        self.assertEqual(MANIFEST['source']['catalogEditableSectionIds'], ['25122'])
        self.assertEqual(MANIFEST['source']['currentNativeWidgetConfiguration']['categoriesVisibilityOverride'], [])
        self.assertFalse(MANIFEST['source']['renderedCategoryIdsAreWidgetConfiguration'])
        self.assertTrue(MANIFEST['source']['currentSectionSettings']['square'])
        self.assertTrue(MANIFEST['source']['currentSectionSettings']['flat'])
        self.assertEqual(MANIFEST['package']['sectionCount'], 1)
        self.assertEqual(MANIFEST['package']['carrierPageCss'], '')
        self.assertFalse(MANIFEST['package']['sourceProductRecordsIncluded'])
        for key in ('consumerTheme', 'realPhoneConsumerViewport', 'insertionIntoExistingPage'):
            self.assertEqual(MANIFEST['verification'][key], 'not-tested')

    def test_saved_carrier_and_admin_preview_limits_match_native_pilot_evidence(self):
        pilot = json.loads((REPO / MANIFEST['pilot']['journal']).read_text(encoding='utf-8'))
        self.assertEqual(MANIFEST['pilot']['carrier'], pilot['carrier'])
        self.assertEqual(MANIFEST['pilot']['authorization'], pilot['authorization'])
        self.assertFalse(MANIFEST['pilot']['carrier']['published'])
        self.assertEqual(MANIFEST['pilot']['carrier']['sectionCount'], 1)
        self.assertEqual(MANIFEST['pilot']['carrier']['pageCss'], '')
        self.assertEqual(MANIFEST['pilot']['carrier']['libraryStatus'], 'Linked with Updates')
        self.assertTrue(MANIFEST['pilot']['currentEditableObject']['reopenVerified'])
        self.assertTrue(MANIFEST['pilot']['savedPageCssEmpty'])
        self.assertTrue(MANIFEST['pilot']['nativePageSaveDisabled'])
        self.assertTrue(MANIFEST['pilot']['savedCssLogicallyMatchesPreparedFile'])
        saved_path = REPO / MANIFEST['pilot']['savedSectionCss']
        self.assertEqual(hashlib.sha256(saved_path.read_bytes()).hexdigest(), MANIFEST['pilot']['savedSectionCssSha256'])
        saved = saved_path.read_text(encoding='utf-8').strip()
        self.assertEqual(saved, CSS.strip())
        self.assertNotEqual(MANIFEST['pilot']['currentEditableObject']['pageId'], MANIFEST['source']['editablePageId'])
        self.assertNotEqual(MANIFEST['pilot']['currentEditableObject']['sectionId'], MANIFEST['source']['editableSectionId'])
        self.assertEqual(MANIFEST['pilot']['desktopAdminPreview']['overflowPx'], 0)
        self.assertEqual(MANIFEST['pilot']['phoneAdminPreview']['overflowPx'], 3)
        self.assertEqual(MANIFEST['pilot']['phoneAdminPreview']['headingFontSize'], '62px')
        self.assertTrue(MANIFEST['pilot']['phoneAdminPreview']['limitations'])
        for mode in ('desktopAdminPreview', 'phoneAdminPreview'):
            evidence = json.loads((REPO / MANIFEST['pilot'][mode + 'Evidence']).read_text(encoding='utf-8'))
            self.assertEqual(MANIFEST['pilot'][mode]['pageId'], MANIFEST['pilot']['currentEditableObject']['pageId'])
            self.assertEqual(MANIFEST['pilot'][mode]['sectionId'], MANIFEST['pilot']['currentEditableObject']['sectionId'])
            self.assertEqual(MANIFEST['pilot'][mode]['cards'], len(evidence['cards']))
            self.assertEqual(MANIFEST['pilot'][mode]['loadedImages'], sum(bool(image.get('loaded')) for image in evidence['images']))
        self.assertIn('carrier-draft-', MANIFEST['pilot']['desktopAdminPreviewEvidence'])
        self.assertIn('carrier-draft-', MANIFEST['pilot']['phoneAdminPreviewEvidence'])
        self.assertEqual(MANIFEST['pilot']['librarySelected'], pilot['library'])
        self.assertEqual(MANIFEST['pilot']['destinationSiteSelected'], pilot['destination']['site'])

    def test_library_transfer_and_unlinked_local_edit_are_separate_from_visual_qa(self):
        pilot = json.loads((REPO / MANIFEST['pilot']['journal']).read_text(encoding='utf-8'))
        transfer = MANIFEST['libraryTransfer']
        self.assertEqual(transfer['status'], pilot['libraryTransfer'])
        self.assertEqual(transfer['library'], pilot['library'])
        self.assertEqual(transfer['destination'], pilot['destination'])
        self.assertEqual(transfer['destination']['libraryStatus'], 'Not Linked')
        self.assertFalse(transfer['destination']['published'])
        self.assertEqual(transfer['destination']['sectionCount'], 1)
        self.assertEqual(transfer['destination']['pageCss'], '')
        self.assertTrue(transfer['independentDestination']['masterAfterLocalEdit']['nameUnchanged'])
        self.assertTrue(transfer['independentDestination']['masterAfterLocalEdit']['cssUnchanged'])
        binding = transfer['catalogueRuntimeBinding']
        self.assertNotEqual(set(binding['sourceCategoryIds']), {category['id'] for category in binding['destinationCategories']})
        self.assertNotEqual(binding['libraryRuntimeProductCount'], binding['destinationProductCount'])
        self.assertEqual(binding['categoriesVisibilityOverride'], [])
        self.assertFalse(binding['commerceCheckoutVerified'])
        for entry in transfer['evidence']:
            self.assertEqual(hashlib.sha256((REPO / entry['path']).read_bytes()).hexdigest(), entry['sha256'])
        self.assertEqual(MANIFEST['verification']['destinationVisualQa'], 'native-scope-restored-in-Admin; consumer-visual-QA-not-tested')

    def test_scope_refresh_proposal_changes_comments_only_and_does_not_hide_native_bug(self):
        issue = MANIFEST['libraryTransfer']['nativeScopeIssue']
        proposal_path = HERE / issue['refreshProposal']
        proposal = proposal_path.read_text(encoding='utf-8')
        strip = lambda text: re.sub(r'/\*.*?\*/', '', text, flags=re.S).strip()
        self.assertEqual(strip(proposal), strip(CSS))
        self.assertEqual(hashlib.sha256(proposal_path.read_bytes()).hexdigest(), issue['refreshProposalSha256'])
        before = issue['beforeRefresh']
        self.assertIn(before['actualGeneratedRoot'], before['actualRootClass'])
        self.assertNotEqual(before['actualGeneratedRoot'], before['staleCompiledGeneratedRoot'])
        self.assertIn('Roboto', before['observedHeadingFont'])
        self.assertFalse(before['reopeningPageFixedIssue'])
        failing_style = json.loads((REPO / 'evidence/library-k-food-pilot/destination-style-before-reopen.json').read_text(encoding='utf-8'))
        compiled_styles = '\n'.join(failing_style['styles'])
        self.assertIn('.' + before['staleCompiledGeneratedRoot'] + '.fdp-k-food', compiled_styles)
        self.assertNotIn('.' + before['actualGeneratedRoot'] + '.fdp-k-food', compiled_styles)

    def test_approved_scope_refresh_restored_only_destination_native_scope(self):
        issue = MANIFEST['libraryTransfer']['nativeScopeIssue']
        resolution = issue['resolution']
        self.assertEqual(resolution['status'], 'verified-after-reopen')
        self.assertTrue(resolution['approvedByUser'])
        saved = REPO / resolution['savedSectionCss']
        proposal = HERE / issue['refreshProposal']
        self.assertEqual(saved.read_bytes(), proposal.read_bytes())
        self.assertEqual(hashlib.sha256(saved.read_bytes()).hexdigest(), resolution['savedSectionCssSha256'])
        self.assertTrue(resolution['nativeFieldReadback']['savedCssMatchesApprovedProposal'])
        self.assertTrue(resolution['nativeFieldReadback']['nonCssFieldValuesUnchanged'])
        self.assertTrue(resolution['nativeFieldReadback']['sameDesignRules'])
        self.assertEqual(resolution['reopenedPageId'], MANIFEST['libraryTransfer']['destination']['editablePageId'])
        self.assertEqual(resolution['sectionId'], MANIFEST['libraryTransfer']['destination']['editableSectionId'])
        self.assertEqual(resolution['pageCss'], '')
        self.assertIn('Georgia', resolution['headingFont'])
        current = json.loads((REPO / 'evidence/library-k-food-pilot/destination-scope-refresh-after-reopen.json').read_text(encoding='utf-8'))
        compiled = '\n'.join(current['styles'])
        self.assertIn('.' + issue['beforeRefresh']['actualGeneratedRoot'] + '.fdp-k-food', compiled)
        self.assertNotIn('.' + issue['beforeRefresh']['staleCompiledGeneratedRoot'] + '.fdp-k-food', compiled)
        for mode in ('desktopAdminPreview', 'phoneAdminPreview'):
            evidence = json.loads((REPO / resolution[mode + 'Evidence']).read_text(encoding='utf-8'))
            row = resolution[mode]
            self.assertEqual(row['pageId'], resolution['reopenedPageId'])
            self.assertEqual(row['sectionId'], resolution['sectionId'])
            self.assertEqual(row['cards'], len(evidence['cards']))
            self.assertEqual(row['loadedImages'], sum(bool(image.get('loaded')) for image in evidence['images']))
            self.assertTrue(row['compiledCurrentScope'])
            self.assertFalse(row['compiledStaleScope'])
            self.assertIn('Georgia', row['headingFont'])
            self.assertTrue(row['limitations'])
        self.assertEqual(resolution['desktopAdminPreview']['overflowPx'], 0)
        self.assertEqual(resolution['phoneAdminPreview']['overflowPx'], 3)
        for entry in resolution['evidence']:
            self.assertEqual(hashlib.sha256((REPO / entry['path']).read_bytes()).hexdigest(), entry['sha256'])


if __name__ == '__main__':
    unittest.main()
