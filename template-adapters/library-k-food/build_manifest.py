"""Record dependencies from retained evidence; never edits native or older artifacts."""
import hashlib
import json
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

    def preview_summary(data):
        return {'mode': data['mode'], 'capturedAt': data['capturedAt'],
                'pageId': data['pageId'], 'sectionId': data['sectionId'],
                'clientWidth': data['clientWidth'], 'scrollWidth': data['scrollWidth'],
                'overflowPx': max(0, data['scrollWidth'] - data['clientWidth']),
                'cards': len(data['cards']), 'images': len(data['images']),
                'loadedImages': sum(bool(image.get('loaded')) for image in data['images'])}

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
            'existingPageInsertion': 'not-tested; successful separate Page import does not prove Section insertion',
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
            'insertionIntoExistingPage': 'not-tested',
            'mobileApp': 'not-tested',
        },
        'openQuestions': [
            'Verify actual consumer rendering and phone geometry of the saved unpublished carrier; Admin-frame mobile has 3px overflow and uses outer viewport units.',
            'Verify consumer Theme colors, real phone geometry and a controlled empty catalogue on the destination; no consumer publication occurred.',
            'Verify Library update/version propagation separately; independent destination is already unlinked.',
            'Verify a supported insertion operation separately from separate-Page Library import.',
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
