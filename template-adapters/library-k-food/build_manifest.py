"""Record dependencies from retained evidence; never edits native or older artifacts."""
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build():
    evidence_paths = [
        'evidence/admin-controls-completion/native-saved/K-section-25122.css',
        'evidence/admin-controls-completion/native-saved/K-page.css',
        'evidence/admin-controls-completion/native-before/K-section-25122.json',
        'evidence/admin-controls-completion/native-before/K-page.json',
        'template-adapters/shared-theme-completion/site-theme.proposed.css',
        'evidence/admin-controls-completion/native-clips/K-dom.json',
        'evidence/indy-parity-changes.json',
        'evidence/library-k-food-pilot/source-k-food-dom-desktop.json',
        'evidence/library-k-food-pilot/source-k-food-widget.txt',
        'evidence/library-k-food-pilot/source-k-food-section-settings.json',
        'evidence/library-k-food-pilot/source-k-food-section.css',
    ]
    catalog = json.loads((REPO / 'catalog.json').read_text(encoding='utf-8'))
    option = next(o for s in catalog['slots'] if s['id'] == 'food'
                  for o in s['options'] if o['id'] == 'food--variant-k-clubhouse')
    section = json.loads((REPO / evidence_paths[2]).read_text(encoding='utf-8'))
    settings = [f for f in section['fields'] if f.get('label') and f['label'] != 'Custom CSS']
    parity = json.loads((REPO / 'evidence/indy-parity-changes.json').read_text(encoding='utf-8'))
    food = next(c for c in parity['changes'] if c['variant'] == 'variant-k-clubhouse' and c['component'] == 'food')
    pilot_base = REPO / 'evidence/library-k-food-pilot'
    pilot = json.loads((pilot_base / 'pilot-journal.json').read_text(encoding='utf-8'))
    desktop = json.loads((pilot_base / 'carrier-draft-desktop-dom.json').read_text(encoding='utf-8'))
    phone = json.loads((pilot_base / 'carrier-draft-phone-dom.json').read_text(encoding='utf-8'))
    editable_page_id = pilot['carrier']['editablePageId']
    editable_section_id = pilot['carrier']['editableSectionId']
    saved_css = pilot_base / f'carrier-draft-section-{editable_section_id}.saved.css'
    saved_page_path = f'evidence/library-k-food-pilot/carrier-draft-{editable_page_id}-fields.json'
    saved_page = json.loads((REPO / saved_page_path).read_text(encoding='utf-8'))
    page_css = next(field['value'] for field in saved_page['fields'] if field['label'] == 'Custom Styles (CSS)')
    css_matches = saved_css.read_text(encoding='utf-8').strip() == (HERE / 'section.proposed.css').read_text(encoding='utf-8').strip()
    master_before = json.loads((pilot_base / 'library-master-before.json').read_text(encoding='utf-8'))
    destination_menu = json.loads((pilot_base / 'destination-menu-before-local-edit.json').read_text(encoding='utf-8'))
    independence = json.loads((pilot_base / 'library-master-independence-check.json').read_text(encoding='utf-8'))
    scope_issue = json.loads((pilot_base / 'destination-style-before-reopen.json').read_text(encoding='utf-8'))
    scope_resolution = json.loads((pilot_base / 'destination-scope-refresh-after-reopen.json').read_text(encoding='utf-8'))
    refresh_readback = json.loads((pilot_base / 'destination-scope-refresh-readback-check.json').read_text(encoding='utf-8'))
    destination_desktop = json.loads((pilot_base / 'destination-scope-refreshed-desktop-dom.json').read_text(encoding='utf-8'))
    destination_phone = json.loads((pilot_base / 'destination-scope-refreshed-phone-dom.json').read_text(encoding='utf-8'))
    refresh_evidence_paths = [
        'evidence/library-k-food-pilot/destination-section-25155.scope-refreshed.css',
        'evidence/library-k-food-pilot/destination-scope-refresh-after-fields.json',
        'evidence/library-k-food-pilot/destination-scope-refresh-readback-check.json',
        'evidence/library-k-food-pilot/destination-scope-refresh-after-reopen.json',
        'evidence/library-k-food-pilot/destination-scope-refreshed-desktop-dom.json',
        'evidence/library-k-food-pilot/destination-scope-refreshed-phone-dom.json',
        'evidence/library-k-food-pilot/destination-scope-refresh-final-status.txt',
    ]
    transfer_evidence_paths = [
        'evidence/library-k-food-pilot/library-master-before.json',
        'evidence/library-k-food-pilot/library-master-section-25153.css',
        'evidence/library-k-food-pilot/library-master-independence-check.json',
        'evidence/library-k-food-pilot/library-master-section-25153-after-local-edit.css',
        'evidence/library-k-food-pilot/destination-menu-before-local-edit.json',
        'evidence/library-k-food-pilot/destination-section-25155.css',
        'evidence/library-k-food-pilot/destination-section-25155-settings.json',
        'evidence/library-k-food-pilot/destination-style-before-reopen.json',
    ]
    assembly_base = REPO / 'evidence/library-k-food-assembly'
    assembly = json.loads((assembly_base / 'assembly-journal.json').read_text(encoding='utf-8'))
    assembly_proposal = json.loads((assembly_base / 'assembly-proposal.json').read_text(encoding='utf-8'))
    assembly_before = json.loads((assembly_base / 'target-5586-before-fields.json').read_text(encoding='utf-8'))
    assembly_after = json.loads((assembly_base / 'target-5586-final-page-state.json').read_text(encoding='utf-8'))
    assembly_desktop = json.loads((assembly_base / 'mixed-desktop-dom.json').read_text(encoding='utf-8'))
    assembly_phone = json.loads((assembly_base / 'mixed-phone-dom.json').read_text(encoding='utf-8'))
    assembly_adjacent_menu = json.loads((assembly_base / 'adjacent-menu-category-bar.json').read_text(encoding='utf-8'))
    assembly_readback = json.loads((assembly_base / 'new-section-25156-settings-readback.json').read_text(encoding='utf-8'))
    assembly_main_ax = (assembly_base / 'new-section-25156-reopened-main.txt').read_text(encoding='utf-8').split('container Edit Section (25156)')[-1]
    assembly_settings_ax = (assembly_base / 'new-section-25156-reopened-settings.txt').read_text(encoding='utf-8').split('text Section Settings')[-1]
    field_values = {}
    for field in assembly_readback['fields']:
        if field.get('label'):
            field_values.setdefault(field['label'], []).append(field['value'])
    field_checks = []

    def record_check(field, expected, observed):
        field_checks.append({'field': field, 'expected': expected, 'observed': observed, 'matches': expected == observed})

    main_fields = assembly_proposal['newSection']['mainWidgetFields']
    section_fields = assembly_proposal['newSection']['sectionSettings']
    for key, label, index in [
        ('heading','Heading',0), ('headingFontSize','Font Size',0), ('headingFont','Fonts',0),
        ('headingTextAlign','Text Align',0), ('headingColorField','Color',0), ('headingStyle','Style',0),
        ('salesChannelVisibility','Sales Channel Visibility',0), ('categoryFiltersPosition','Category Filters Position',0),
        ('displayMode','Display Mode',0), ('viewMode','View Mode',0),
        ('categoryNameAlignment','Category Name Alignment',0), ('categoryNameStyle','Style',1),
        ('categoryNameColorField','Color',1), ('itemCardTheme','Item Card Theme',0), ('itemBackgroundColor','Item Background Color',0),
    ]:
        record_check(key, main_fields[key], field_values[label][index])
    for key, label in [('categoryNameFontSizePx','Category Name Font Size'),('titleFontSizePx','Title Font Size'),
                       ('descriptionFontSizePx','Description Font Size'),('priceFontSizePx','Price Font Size')]:
        record_check(key, main_fields[key], int(field_values[label][0]))
    for key, label in [('showHeading','Show Heading'),('showCategoryFilters','Show Category Filters'),
                       ('showCategoryDivider','Show Category Divider'),('showCategoryName','Show Category Name'),
                       ('showImage','Show Image'),('showDescription','Show Description'),('showPrice','Show Price')]:
        value = re.search(r'switch Description: '+re.escape(label)+r', Value: ([01])', assembly_main_ax)
        record_check(key, main_fields[key], value is not None and value[1] == '1')
    for key, label in [('itemsPerRow','Items Per Row'),('itemsPerRowInMobile','Items Per Row in Mobile'),
                       ('spacing','Spacing'),('itemBorderRadius','Item Border Radius'),('itemShadow','Item Shadow')]:
        value = re.search(r'text '+re.escape(label)+r'\s+\d+ slider (\d+)', assembly_main_ax)
        record_check(key, main_fields[key], int(value[1]) if value else None)
    record_check('description', main_fields['description'], '\n'.join(assembly_readback['description']))
    record_check('categoriesVisibilityOverride', main_fields['categoriesVisibilityOverride'],
                 [] if field_values['Categories Visibility Override'][0] == '' else field_values['Categories Visibility Override'][0])
    record_check('finalInternalName', assembly_proposal['newSection']['name'], field_values['Name'][0])
    for key, label in [('widthMode','Width Mode'),('marginSides','Margin Sides'),('marginTop','Margin Top'),
                       ('marginBottom','Margin Bottom'),('backgroundColor','Background Color'),
                       ('classes','Classes'),('styles','Styles'),('whoCanSee','Who can see this section?')]:
        record_check(key, section_fields[key], field_values[label][-1])
    for key, label in [('square','Square'),('flat','Flat')]:
        value = re.search(r'checkbox Description: '+label+r', Value: ([01])', assembly_settings_ax)
        record_check(key, section_fields[key], value is not None and value[1] == '1')
    visible = re.search(r'switch Description: On, Value: ([01])', assembly_settings_ax)
    record_check('visible', section_fields['visible'], visible is not None and visible[1] == '1')
    for key, label in [('startDate','Start Date'),('endDate','End Date')]:
        record_check(key, section_fields[key], field_values[label][-1])
    record_check('visibleFor', section_fields['visibleFor'], field_values['Visible For'][0].split(', '))
    assembly_evidence_paths = [
        'evidence/library-k-food-assembly/assembly-journal.json',
        'evidence/library-k-food-assembly/assembly-proposal.json',
        'evidence/library-k-food-assembly/target-5586-before-fields.json',
        'evidence/library-k-food-assembly/target-5586-final-page-state.json',
        'evidence/library-k-food-assembly/new-section-25156-settings-readback.json',
        'evidence/library-k-food-assembly/new-section-25156-reopened-main.txt',
        'evidence/library-k-food-assembly/new-section-25156-reopened-settings.txt',
        'evidence/library-k-food-assembly/new-section-25156.css',
        'evidence/library-k-food-assembly/mixed-desktop-dom.json',
        'evidence/library-k-food-assembly/mixed-phone-dom.json',
        'evidence/library-k-food-assembly/category-interaction.json',
        'evidence/library-k-food-assembly/adjacent-menu-category-bar.json',
    ]

    def preview_summary(data):
        return {'mode': data['mode'], 'capturedAt': data['capturedAt'],
                'pageId': data['pageId'], 'sectionId': data['sectionId'],
                'clientWidth': data['clientWidth'], 'scrollWidth': data['scrollWidth'],
                'overflowPx': max(0, data['scrollWidth'] - data['clientWidth']),
                'cards': len(data['cards']), 'images': len(data['images']),
                'loadedImages': sum(bool(image.get('loaded')) for image in data['images'])}

    def assembly_preview_summary(data):
        return {'mode': data['mode'], 'capturedAt': data['capturedAt'],
                'pageId': data['pageId'], 'sectionId': data['sectionId'],
                'clientWidth': data['root']['clientWidth'], 'scrollWidth': data['root']['scrollWidth'],
                'overflowPx': data['overflowPx'], 'columns': data['columns'],
                'cards': len(data['cards']), 'images': len(data['images']),
                'loadedImages': sum(bool(image.get('loaded')) for image in data['images']),
                'headingFont': data['heading']['fontFamily'], 'compiledCurrentScope': data['compiledCurrentScope'],
                'limitations': data['limitations']}

    manifest = {
        'schema': 'fd-library-module-dependencies/v1',
        'preparedAt': datetime.now(timezone.utc).isoformat(),
        'moduleId': 'variant-k-clubhouse_food',
        'status': 'library-transfer-and-destination-admin-scope-restoration-verified',
        'source': {
            'region': 'US-BETA', 'circuit': 'INDY Demo', 'site': 'Adam Template Testing 2',
            'siteId': '170', 'pageTitle': 'Variant K Clubhouse',
            'publishedPageId': '5915', 'editablePageId': '5916',
            'sectionName': 'Food K - Clubhouse Kitchen',
            'nativeWidgetType': 'Concessions Menu',
            'publishedSectionId': '25135', 'editableSectionId': '25122',
            'stableSectionClass': 'fdp-k-food',
            'sourceUrl': option['sourceUrl'],
            'heading': 'Good company. Good things to share.',
            'subtitle': 'Explore the kitchen and bar before you settle in.',
            'catalogOptionId': option['id'],
            'catalogPublishedSectionIds': option['sectionIds'],
            'catalogEditableSectionIds': option['draftSectionIds'],
            'observedNativeConfigurationOlderJournal': food['nativeConfiguration'],
            'nativeWidgetMainFieldsCapturedCompletely': True,
            'currentNativeWidgetConfiguration': {
                'showHeading': True,
                'heading': 'Good company. Good things to share.',
                'headingFontSize': 'H 2', 'headingFont': 'Default', 'headingTextAlign': 'Center',
                'headingColorField': 'Primary', 'headingStyle': 'Default',
                'description': 'Explore the kitchen and bar before you settle in.',
                'salesChannelVisibility': 'Website', 'categoriesVisibilityOverride': [],
                'showCategoryFilters': True, 'categoryFiltersPosition': 'Left',
                'displayMode': 'Block', 'viewMode': 'Grid',
                'itemsPerRow': 3, 'itemsPerRowInMobile': 1, 'spacing': 12,
                'showCategoryDivider': True, 'showCategoryName': True,
                'categoryNameFontSizePx': 24, 'categoryNameAlignment': 'Left',
                'categoryNameStyle': 'Default', 'categoryNameColorField': 'Primary',
                'showImage': True, 'showDescription': True, 'showPrice': True,
                'itemCardTheme': 'Frame', 'itemBackgroundColor': 'Default',
                'itemBorderRadius': 8, 'itemShadow': 0,
                'titleFontSizePx': 20, 'descriptionFontSizePx': 16, 'priceFontSizePx': 16,
            },
            'currentSectionSettings': {
                'visible': True, 'visibleFor': ['Desktop Web', 'Mobile Web', 'Mobile App'],
                'whoCanSee': 'Everyone', 'startDate': '', 'endDate': '',
                'widthMode': 'Centered', 'marginSides': 'Extra Small', 'marginTop': '', 'marginBottom': '',
                'backgroundColor': '', 'backgroundImage': None, 'square': True, 'flat': True,
                'classes': 'fdp-k-food', 'styles': '',
            },
            'renderedSourceCategoriesForEvidenceOnly': [
                {'id': '596', 'name': 'Snacks'}, {'id': '597', 'name': 'Drinks'}, {'id': '598', 'name': 'Desserts'},
            ],
            'renderedCategoryIdsAreWidgetConfiguration': False,
            'sectionSettingsRawLabelValues': settings,
        },
        'sourceArtifacts': [{'path': p, 'sha256': sha256(REPO / p)} for p in evidence_paths],
        'pilot': {
            'scope': pilot['scope'], 'authorization': pilot['authorization'],
            'carrier': pilot['carrier'],
            'currentEditableObject': {'pageId': editable_page_id, 'sectionId': editable_section_id,
                                      'reopenVerified': pilot['carrier']['draftReopenVerified']},
            'initialBaseObject': {'pageId': pilot['carrier']['pageId'],
                                  'sectionId': pilot['carrier']['initialSectionId'],
                                  'meaning': 'Initial unpublished base/list object; not the current editable draft'},
            'savedPageFields': saved_page_path,
            'savedPageCssEmpty': page_css == '',
            'nativePageSaveDisabled': all(button['disabled'] for button in saved_page['buttons']),
            'savedSectionCss': str(saved_css.relative_to(REPO)).replace('\\', '/'),
            'savedSectionCssSha256': sha256(saved_css),
            'savedCssLogicallyMatchesPreparedFile': css_matches,
            'journal': 'evidence/library-k-food-pilot/pilot-journal.json',
            'nativeSavedSettings': f'evidence/library-k-food-pilot/carrier-draft-section-{editable_section_id}-settings.json',
            'nativeSavedWidget': f'evidence/library-k-food-pilot/carrier-draft-section-{editable_section_id}-widget.txt',
            'desktopAdminPreviewEvidence': 'evidence/library-k-food-pilot/carrier-draft-desktop-dom.json',
            'phoneAdminPreviewEvidence': 'evidence/library-k-food-pilot/carrier-draft-phone-dom.json',
            'desktopAdminPreview': preview_summary(desktop),
            'phoneAdminPreview': {**preview_summary(phone), 'headingFontSize': phone['heading'].get('fontSize'),
                                  'limitations': phone['limitations'], 'outerChromeViewportWidth': phone['outerViewport']['width'],
                                  'observedSidePaddingPx': 72},
            'previewPalette': 'Admin framework, not consumer Site Theme',
            'unpublishedConsumerRoute': 'https://adam-template-testing-2-indy-consumer.netlify.app/variant-k-clubhouse-food/',
            'unpublishedConsumerRouteObservation': 'redirects-to-homepage; no published carrier render',
            'librarySelected': pilot['library'], 'destinationSiteSelected': pilot['destination']['site'],
            'destinationCopyPolicy': 'independent-unlinked-copy',
            'policyMeaning': 'Unlink and verify Not Linked before destination customization. Disabled automatic updates still leaves a link that Force Update can refresh.',
            'libraryPromotionPerformed': True, 'libraryImportPerformed': True,
            'sourceCarrierLibraryId': pilot['library']['pageId'],
            'historicalPreviewEvidence': [
                {'path': 'evidence/library-k-food-pilot/carrier-desktop-dom.json', 'meaning': 'Initial unpublished base Page preview; superseded by persisted editable draft preview'},
                {'path': 'evidence/library-k-food-pilot/carrier-phone-dom.json', 'meaning': 'Initial unpublished base Page preview; superseded by persisted editable draft preview'},
            ],
        },
        'libraryTransfer': {
            'status': pilot['libraryTransfer'],
            'library': pilot['library'], 'destination': pilot['destination'],
            'sourceCarrierLibraryStatus': pilot['carrier']['libraryStatus'],
            'independentDestination': {
                'policy': 'Unlink / Save / verify Not Linked before local customization',
                'localInternalName': pilot['destination']['sectionName'],
                'masterAfterLocalEdit': independence,
                'verification': 'Destination local Name saved/reopened; Library master Name and CSS unchanged',
            },
            'catalogueRuntimeBinding': {
                'sourceCategoryIds': ['596', '597', '598'],
                'destinationCategories': destination_menu['categories'],
                'destinationProductCount': destination_menu['productCount'],
                'libraryRuntimeCategories': master_before['categories'],
                'libraryRuntimeProductCount': master_before['productCount'],
                'categoriesVisibilityOverride': [],
                'status': 'verified-local-native-runtime-categories-and-product-count',
                'meaning': 'Widget resolves local Site catalogue; no product records or category IDs were copied by this pilot',
                'commerceCheckoutVerified': False,
            },
            'evidence': [{'path': path, 'sha256': sha256(REPO / path)} for path in transfer_evidence_paths],
            'existingDestinationPages': {'count': 6, 'status': 'unchanged; only one new carrier Page imported'},
            'publication': 'source carrier, Library master and destination carrier all unpublished',
            'existingPageInsertion': 'Direct Library Section import/cross-page copy remains unverified; native recreation on an existing Page is verified separately under existingPageAssembly',
            'nativeScopeIssue': {
                'status': pilot['destination']['cssScopeRefresh'],
                'trigger': 'Local internal Section Name changed from Food K - Clubhouse Kitchen to Food - Clubhouse Kitchen',
                'beforeRefresh': {
                    'evidence': 'evidence/library-k-food-pilot/destination-style-before-reopen.json',
                    'actualRootClass': scope_issue['class'],
                    'actualGeneratedRoot': 'section-food---clubhouse-kitchen-25155',
                    'staleCompiledGeneratedRoot': 'section-food-k---clubhouse-kitchen-25155',
                    'observedHeadingFont': scope_issue['headingFont'],
                    'reopeningPageFixedIssue': False,
                    'destinationVisualQa': 'Historical failure: native scoped style did not match renamed root',
                },
                'expectedHeadingFont': 'Georgia, Times New Roman, serif',
                'refreshProposal': 'destination-scope-refresh.proposed.css',
                'refreshProposalSha256': sha256(HERE / 'destination-scope-refresh.proposed.css'),
                'refreshProposalChange': 'One appended comment only; comment-stripped CSS and dependencies unchanged',
                'resolution': {
                    'status': pilot['destination']['cssScopeRefresh'],
                    'approvedByUser': pilot['authorization']['cssScopeRefreshConfirmedByUser'],
                    'journalVerification': pilot['scopeRefreshVerification'],
                    'savedSectionCss': 'evidence/library-k-food-pilot/' + pilot['destination']['currentSectionCss'],
                    'savedSectionCssSha256': pilot['destination']['currentSectionCssSha256'],
                    'nativeFieldReadback': refresh_readback,
                    'reopenedPageId': scope_resolution['pageId'], 'sectionId': scope_resolution['sectionId'],
                    'actualRootClass': scope_resolution['actualRootClass'],
                    'headingFont': scope_resolution['headingFont'], 'pageCss': scope_resolution['pageCss'],
                    'desktopAdminPreview': {**preview_summary(destination_desktop),
                        'compiledCurrentScope': destination_desktop['compiledCurrentScope'],
                        'compiledStaleScope': destination_desktop['compiledStaleScope'],
                        'headingFont': destination_desktop['heading']['fontFamily'],
                        'limitations': destination_desktop['limitations']},
                    'phoneAdminPreview': {**preview_summary(destination_phone),
                        'compiledCurrentScope': destination_phone['compiledCurrentScope'],
                        'compiledStaleScope': destination_phone['compiledStaleScope'],
                        'headingFont': destination_phone['heading']['fontFamily'],
                        'limitations': destination_phone['limitations']},
                    'desktopAdminPreviewEvidence': 'evidence/library-k-food-pilot/destination-scope-refreshed-desktop-dom.json',
                    'phoneAdminPreviewEvidence': 'evidence/library-k-food-pilot/destination-scope-refreshed-phone-dom.json',
                    'desktopImage': 'evidence/library-k-food-pilot/destination-scope-refreshed-desktop.jpg',
                    'phoneImage': 'evidence/library-k-food-pilot/destination-scope-refreshed-phone.jpg',
                    'evidence': [{'path': path, 'sha256': sha256(REPO / path)} for path in refresh_evidence_paths],
                    'scopeOfVerification': 'Saved/reopened native Admin scope restoration only; simulated phone retains 3px preview overflow; consumer Site Theme and real phone are untested',
                },
                'routineEditing': 'Edit Heading and Description for customer-facing copy. Keep internal Name stable; renaming requires a maintainer scope check.',
            },
        },
        'existingPageAssembly': {
            'status': assembly['status'],
            'method': 'Native Add Section > Concessions Menu; recreate recorded module fields/class/Section CSS, then native Set Order',
            'directLibrarySectionImportVerified': False, 'crossPageCopyVerified': False,
            'target': assembly['target'], 'authorization': assembly['authorization'],
            'result': assembly['result'],
            'journal': 'evidence/library-k-food-assembly/assembly-journal.json',
            'newSectionId': assembly['newSectionId'],
            'newSectionCss': 'evidence/library-k-food-assembly/new-section-25156.css',
            'newSectionCssSha256': sha256(assembly_base / 'new-section-25156.css'),
            'newSectionCssMatchesBaseline': (assembly_base / 'new-section-25156.css').read_text(encoding='utf-8').strip() == (HERE / 'section.proposed.css').read_text(encoding='utf-8').strip(),
            'originalSectionIdsInOrder': [row['id'] for row in assembly_proposal['before']['originalSectionsInOrder']],
            'savedSectionRows': assembly_after['sectionRows'],
            'savedPageFieldsUnchanged': assembly_before['fields'] == assembly_after['fields'],
            'savedPageFieldCount': len(assembly_after['fields']),
            'recordedFieldChecks': field_checks,
            'allRecordedFieldChecksMatch': all(check['matches'] for check in field_checks),
            'fieldReadbackEvidence': ['evidence/library-k-food-assembly/new-section-25156-settings-readback.json',
                'evidence/library-k-food-assembly/new-section-25156-reopened-main.txt',
                'evidence/library-k-food-assembly/new-section-25156-reopened-settings.txt'],
            'draftState': 'Saved/reopened with Save disabled and Unpublished Changes; existing published Page was not updated',
            'desktopAdminPreview': assembly_preview_summary(assembly_desktop),
            'phoneAdminPreview': assembly_preview_summary(assembly_phone),
            'desktopAdminPreviewEvidence': 'evidence/library-k-food-assembly/mixed-desktop-dom.json',
            'phoneAdminPreviewEvidence': 'evidence/library-k-food-assembly/mixed-phone-dom.json',
            'desktopImage': 'evidence/library-k-food-assembly/mixed-desktop.jpg',
            'phoneImage': 'evidence/library-k-food-assembly/mixed-phone.jpg',
            'categoryInteraction': assembly['result']['newMenuCategoryInteraction'],
            'adjacentMenuCategoryBar': {'evidence': 'evidence/library-k-food-assembly/adjacent-menu-category-bar.json',
                                      'observation': assembly_adjacent_menu,
                                      'status': 'Observed Admin-preview limitation; original menu preserved and no fix applied',
                                      'finishedPageGuidance': 'Normally choose one food Section per finished slot. Removing or changing the original menu needs separate authorization.'},
            'evidence': [{'path': path, 'sha256': sha256(REPO / path)} for path in assembly_evidence_paths],
            'verificationScope': 'Existing-Page native widget recreation, saved order/settings and bounded Admin preview only; consumer Theme/real phone/publication/checkout remain unverified',
        },
        'package': {
            'carrierPageTitleProposed': 'variant-k-clubhouse_food',
            'carrierPageCss': '',
            'sectionCount': 1,
            'nativeWidgetType': 'Concessions Menu',
            'sectionClasses': 'fdp-k-food',
            'sectionCss': 'section.proposed.css',
            'sectionCssSha256': sha256(HERE / 'section.proposed.css'),
            'cssField': 'Section Settings > Custom CSS',
            'cssScopingSyntax': '&.fdp-k-food',
            'nativeThemeInputsRead': ['--q-background', '--q-dark', '--q-primary'],
            'nativeThemeInputsWritten': [],
            'privateAliasesRead': [],
            'sourceSiteOrGeneratedIdSelectors': [],
            'pageCssRequired': False,
            'sourceSiteThemeCssRequired': False,
            'customBlockRequired': False,
            'sourceProductRecordsIncluded': False,
            'externalFontImportsRequired': [],
            'systemFontStacks': [
                ['Georgia', 'serif'],
                ['Georgia', 'Times New Roman', 'serif'],
                ['Arial', 'Helvetica Neue', 'sans-serif'],
            ],
        },
        'dependencies': [
            {'id': 'native-concessions-runtime', 'owner': 'INDY', 'kind': 'native-widget', 'required': True,
             'action': 'Retain the native widget; do not replace live catalogue markup with static HTML.'},
            {'id': 'destination-theme-palette', 'owner': 'destination-site', 'kind': 'native-theme', 'required': True,
             'action': 'Configure Primary, Dark and Background, then check rendered text and all native control states.'},
            {'id': 'destination-catalogue', 'owner': 'destination-site', 'kind': 'data', 'required': True,
             'action': 'Bind destination items, categories, variations, prices, descriptions and images. Confirm Website sales-channel availability.'},
            {'id': 'native-widget-configuration', 'owner': 'module', 'kind': 'configuration', 'required': True,
             'action': 'Copy currentNativeWidgetConfiguration and currentSectionSettings. Keep category override empty unless destination requirements explicitly change it; do not copy rendered category IDs.'},
            {'id': 'module-section-css', 'owner': 'module', 'kind': 'style', 'required': True,
             'action': 'Carry the fdp-k-food class and the complete proposed Section CSS; leave carrier Page CSS empty.'},
            {'id': 'destination-global-css-review', 'owner': 'destination-site', 'kind': 'compatibility', 'required': True,
             'action': 'Check destination global selectors for overrides during actual import; arbitrary global CSS cannot be guaranteed harmless.'},
        ],
        'notPartOfModule': ['K Welcome', 'K Featured', 'K Reserve', 'Private Parties K - Gather Your People',
                            'K Stay Awhile', 'Membership K - Your Place In The Clubhouse', 'Contact K - Say Hello',
                            'global header/navigation', 'global footer', 'source-site Google Fonts imports'],
        'sourceCouplingAudit': {
            'savedSectionUsesGeneratedIdOrPageSelector': False,
            'savedSectionDefinesOwnFdAliases': True,
            'savedSectionContainsUnrelatedGenericFormBridge': True,
            'savedSectionInheritsSourceSiteHeadingAndButtonTreatment': True,
            'proposalChanges': [
                'Use destination native palette variables directly; remove all private alias declarations and references.',
                'Bring the source Theme heading/button/focus treatment inside the stable Section scope.',
                'Bind observed subtitle/native body text and category button labels to Dark instead of native black defaults.',
                'Remove unrelated Generic Form bridge and unused roles.',
            ],
        },
        'verification': {
            'sourceRender': 'published K checked previously at desktop and phone in two palettes',
            'staticDependencyClosure': 'run test_portability.py',
            'isolatedNativeCarrier': 'saved-draft-admin-preview-reviewed-consumer-isolation-pending',
            'consumerTheme': 'not-tested',
            'realPhoneConsumerViewport': 'not-tested',
            'libraryTransfer': pilot['libraryTransfer'],
            'destinationCatalogueRebinding': 'verified-local-native-runtime-categories-and-product-count',
            'localCopyIndependence': 'verified-destination-local-name-change-leaves-master-name-and-css-unchanged',
            'destinationVisualQa': 'native-scope-restored-in-Admin; consumer-visual-QA-not-tested',
            'destinationAdminScopeRestoration': pilot['destination']['cssScopeRefresh'],
            'destinationAdminPhoneGeometry': 'reviewed-3px-overflow-in-simulated-frame; real-phone-not-tested',
            'insertionIntoExistingPage': 'verified-native-recreation-and-ordering; direct-Library-section-import-not-tested',
            'directLibrarySectionImport': 'not-tested',
            'crossPageSectionCopy': 'not-tested',
            'mobileApp': 'not-tested',
        },
        'openQuestions': [
            'Verify actual consumer rendering and phone geometry of the saved unpublished carrier; Admin-frame mobile has 3px overflow and uses outer viewport units.',
            'Verify consumer Theme colors, real phone geometry and a controlled empty catalogue on the destination; no consumer publication occurred.',
            'Verify Library update/version propagation separately; independent destination is already unlinked.',
            'Verify a direct Library Section import or native cross-page copy operation separately; current existing-Page proof uses native recreation.',
            'Choose one food Section per finished slot, or separately authorize and verify handling of adjacent native menu floating category bars.',
        ],
        'historicalReferenceCaveats': [
            {'path': 'docs/INDY-LIBRARY.md', 'reason': 'Earlier revision proposed the Experience-only module; current findings are maintained separately from these retained source hashes.'},
            {'path': '../library-research.md', 'reason': 'Older inventory predates the native Clubhouse Kitchen food Section.'},
        ],
    }
    (HERE / 'dependency-manifest.json').write_bytes((json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
    return manifest


if __name__ == '__main__':
    result = build()
    print(json.dumps({'status': result['status'], 'sourceArtifacts': len(result['sourceArtifacts']),
                      'sectionCssSha256': result['package']['sectionCssSha256']}))
