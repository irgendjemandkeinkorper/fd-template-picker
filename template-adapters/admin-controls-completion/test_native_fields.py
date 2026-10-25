import json
import hashlib
import pathlib
import re
import sys
import unittest

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import native_fields as migration


class NativeFieldSafetyTests(unittest.TestCase):
    def test_frozen_baseline_hashes_and_generator_overwrite_guard(self):
        import prepare_native_proposals as baseline
        manifest_path = baseline.OUTPUT / 'manifest.json'
        manifest_bytes = manifest_path.read_bytes()
        manifest = json.loads(manifest_bytes)
        prepared = [row for row in manifest['fields'] if row.get('proposed')]
        self.assertEqual(len(prepared),29)
        for row in prepared:
            self.assertEqual(hashlib.sha256((baseline.REPO/row['proposed']).read_bytes()).hexdigest(),row['proposedBytesSha256'])
        with self.assertRaisesRegex(ValueError,'Frozen baseline'):
            baseline.prepare()
        self.assertEqual(manifest_bytes,manifest_path.read_bytes())

    def test_native_brand_overrides_removed_without_altering_status_or_geometry(self):
        raw = '.contact{--q-primary:#A34B3C;--q-secondary:var(--client-secondary);--q-warning:var(--status-warning);--accessible-feedback-field-error-control-color:var(--status-error);padding:12px;background:#08080A;}'
        css, report = migration.transform_native_css(raw,'A','page')
        self.assertNotIn('--q-primary:',css)
        self.assertNotIn('--q-secondary:',css)
        self.assertIn('--fd-primary: var(--q-primary)',css)
        self.assertIn('--q-warning:var(--status-warning)',css)
        self.assertIn('--accessible-feedback-field-error-control-color:var(--status-error)',css)
        self.assertIn('padding:12px',css)
        self.assertEqual(len(report['removedNativeBrandOverrides']),2)

    def test_rejects_compiled_page_css_instead_of_double_prefixing(self):
        with self.assertRaisesRegex(ValueError, "Compiled"):
            migration.transform_native_css('.page-variant-b-rep-5661 .title{color:#141418;}', 'B', 'page')

    def test_actual_native_at_root_header_rule_uses_native_tokens(self):
        raw = '@at-root{body.site-170 .q-layout:has(.page-variant-c-late-5663) header{color:#F5F0E6;}}'
        css, _ = migration.transform_native_css(raw, 'C', 'page')
        self.assertIn(':has(.page-variant-c-late-5663)', css)
        self.assertIn('header{color:var(--q-background);}', css)

    def test_native_section_root_and_geometry_are_preserved(self):
        raw = '&.fdp-j-food{color:#241c19;background:#f3eee5;transform:rotate(-4deg);padding:22px;}'
        proposed, report = migration.transform_native_css(raw, 'J', 'section')
        self.assertIn('&.fdp-j-food', proposed)
        self.assertIn('& {', proposed)
        self.assertNotIn('.page-', proposed)
        self.assertIn('transform:rotate(-4deg);padding:22px;', proposed)
        self.assertEqual(report['unknownLiteralColors'], {})

    def test_unmapped_native_color_blocks_proposal(self):
        with self.assertRaisesRegex(ValueError, '#123456'):
            migration.transform_native_css('h2{color:#123456;}', 'J', 'page')

    def test_demo_overrides_removed_and_native_other_brand_roles_collapsed(self):
        raw = '[class*="section-"]{--v-paper:var(--q-background);--v-go:var(--q-primary);--v-pop:var(--q-accent);--v-go:#3F6B4E;}'
        proposed, report = migration.transform_native_css(raw, 'D', 'page')
        self.assertNotIn('#3F6B4E', proposed)
        self.assertNotIn('var(--q-accent)', proposed)
        self.assertNotIn('var(--q-header)', proposed)
        self.assertEqual(len(report['removedDemoDeclarations']), 1)

    def test_existing_ma_geometry_fix_retained_and_opacity_strengthened(self):
        raw = (HERE.parents[1] / 'evidence/component-controls-repairs/i-page-css-final-saved.css').read_text(encoding='utf-8')
        proposed, _ = migration.transform_native_css(raw, 'I', 'page')
        self.assertIn('left: 24px !important', proposed)
        self.assertIn('max-width: calc(100% - 48px)', proposed)
        self.assertIn('background-color: var(--q-dark) !important', proposed)
        self.assertIn('--ma-caption-backdrop: var(--q-dark);',proposed)
        self.assertIn('.mobile-hero-title', proposed)
        self.assertIn('.mobile-hero-subtitle', proposed)

    def test_no_global_caption_or_interaction_wrapper_changes(self):
        for letter in 'ABCDEFGHI':
            css = migration.overlay_adapter(letter)
            self.assertIn('[data-test-id="carousel-slide-content"]', css)
            self.assertIn('text-shadow:', css)
            self.assertNotIn('position:', css)
            self.assertNotIn('pointer-events:', css)
            self.assertNotIn('background-image:', css)
        self.assertEqual(migration.overlay_adapter('J'), '')
        self.assertEqual(migration.overlay_adapter('K'), '')
        self.assertEqual(migration.overlay_adapter('L'), '')

    def test_odd_patch_only_adds_role_classes_and_is_idempotent(self):
        raw = ''.join(f'<article class="od-club__tier od-tilt"><h3>{h}</h3><p>Keep £9.00 <a href="/membership/">details</a>.</p></article>' for h in ('Regular', 'Regular, but more', 'Practically staff'))
        patched = migration.patch_odd_html(raw)
        for role in ('primary', 'secondary', 'dark'):
            self.assertIn(' fd-tier-' + role, patched)
        self.assertEqual(re.sub(r' fd-tier-(?:primary|secondary|dark)', '', patched), raw)
        self.assertEqual(migration.patch_odd_html(patched), patched)
        with self.assertRaisesRegex(ValueError, 'heading mismatch'):
            migration.patch_odd_html(raw.replace('Practically staff', 'New plan'))

    def test_actual_native_odd_paragraph_titles_are_matched(self):
        path = HERE.parents[1] / 'evidence/admin-controls-completion/native-before/D-membership-24781.html'
        if not path.exists():
            self.skipTest('Current native HTML readback not present')
        source = path.read_text(encoding='utf-8-sig')
        patched = migration.patch_odd_html(source)
        self.assertEqual(re.sub(r' fd-tier-(?:primary|secondary|dark)', '', patched), source)

    def test_odd_css_gate_prevents_painting_unverified_cards(self):
        raw = '[class*="section-"]{--v-paper:var(--q-background);}'
        css, report = migration.transform_native_css(raw, 'D', 'page')
        self.assertNotIn('.od-club__tier.fd-tier-primary', css)
        css, report = migration.transform_native_css(raw, 'D', 'page', odd_classes_verified=True)
        self.assertIn('.od-club__tier.fd-tier-primary', css)

    def test_native_form_bridge_leaves_service_status_alone(self):
        css = migration.form_adapter('&')
        self.assertIn('--generic-form-field-background: var(--q-background) !important', css)
        self.assertNotIn('error', css)
        self.assertNotIn('display:', css)
        self.assertNotIn('disabled', css)

    def test_actual_custom_actions_are_covered_without_filling_ma_link(self):
        for letter, known in [('A','.ha-shelf__book'),('C','.mbc__cta'),('D','.od-club__cta'),('E','.gr-btn--primary')]:
            self.assertIn(known, migration.action_adapter('[class*="section-"]', letter))
        ma = migration.action_adapter('[class*="section-"]', 'I')
        self.assertIn('.fdp-action { background:transparent !important', ma)
        rep = migration.action_adapter('[class*="section-"]', 'B')
        self.assertIn('a.ev-b__link', rep)
        self.assertIn('background:transparent !important', rep)

    def test_original_form_error_values_are_retained_by_css_transform(self):
        # No generated inline HTML is rewritten by the CSS migration.
        css = '.generic-form-field{--generic-form-field-text:#241c19;}'
        proposed, _ = migration.transform_native_css(css, 'J', 'section')
        self.assertNotIn('--accessible-feedback-field-error-', proposed)

    def test_known_derived_text_and_colored_card_failures_are_split(self):
        odd = migration.variant_readability_adapter('D')
        grid = migration.variant_readability_adapter('E')
        cut = migration.variant_readability_adapter('G')
        self.assertIn('--v-muted:color-mix(in srgb,var(--q-dark) 85%', odd)
        self.assertIn('.row.items-center.justify-between span { color:var(--q-dark)', odd)
        self.assertIn('--v-faint:color-mix(in srgb,var(--q-background) 85%', grid)
        self.assertIn('.gr-mem__badge { background:var(--fd-secondary-tint)', grid)
        self.assertIn('article.cut-event:nth-of-type(3n)', cut)
        self.assertIn('.q-card__section:first-child', cut)
        for css in (odd, grid, cut):
            self.assertNotIn('transform:', css)
            self.assertNotIn('clip-path:', css)
            self.assertNotIn('padding:', css)

    def test_foreground_split_preserves_brand_paint_and_decorative_image_opacity(self):
        raw = 'h3{color:var(--fd-primary);border-color:var(--fd-primary);background:var(--fd-primary);} p{color:color-mix(in srgb, var(--fd-background) 42%, transparent);} img{opacity:.3;}'
        css, changes = migration.readable_literal_foregrounds(raw, 'A')
        self.assertIn('color:var(--fd-copy-emphasis)', css)
        self.assertIn('border-color:var(--fd-primary)', css)
        self.assertIn('background:var(--fd-primary)', css)
        self.assertIn('var(--fd-background) 85%', css)
        self.assertIn('opacity:.3', css)
        self.assertEqual(len(changes), 2)

    def test_late_food_overlay_is_opaque_and_scoped_to_copy_panel(self):
        css = migration.variant_readability_adapter('C')
        self.assertIn('section-food-c---tile-wall-', css)
        self.assertIn('background:var(--q-dark) !important', css)
        self.assertNotIn('img', css)
        self.assertNotIn('position:', css)
        self.assertIn('.movie-container > .row.container > div', css)

    def test_showtime_hover_keeps_readable_foreground_despite_specific_originals(self):
        for letter in 'AC':
            css = migration.variant_readability_adapter(letter)
            self.assertIn('.q-btn.showing.bg-primary.text-white:is(:hover,:focus-visible)', css)
            self.assertIn(':is(.q-btn__content,span) { color:var(--q-dark) !important', css)
        cut = migration.variant_readability_adapter('G')
        self.assertIn('.row.justify-start.items-stretch > .q-card .opacity-80 { opacity:1 !important', cut)

    def test_native_qa_discoveries_are_kept_in_future_generation(self):
        self.assertIn('.od-note__kicker',migration.variant_readability_adapter('D'))
        self.assertIn('.od-club__stamps span.is-stamped { color:var(--q-dark)',migration.variant_readability_adapter('D'))
        self.assertIn('section-j-intro-',migration.variant_readability_adapter('J'))
        self.assertIn('.q-card__section.row.items-center.justify-center :is(.q-btn__content,span)',migration.variant_readability_adapter('G'))
        self.assertIn('section-k-stay-awhile-',migration.variant_readability_adapter('K'))
        self.assertIn('.text-h5.text-grey-9',migration.variant_readability_adapter('K'))
        self.assertIn('section-l-one-more-',migration.variant_readability_adapter('L'))
        self.assertIn('section-l-opening-note-',migration.variant_readability_adapter('L'))
        css,_ = migration.transform_native_css('h1{color:var(--q-background);}','G','page')
        self.assertIn('Cut mobile caption containment:',css)
        self.assertIn('.flex.absolute-full:has(.mobile-hero-title)',css)
        css,_ = migration.transform_native_css('&.fdp-g-membership .fdp-number{color:#f5bf32;}','G','section')
        self.assertIn('&.fdp-g-membership .fdp-number { color:var(--q-background); }',css)
        css,_ = migration.transform_native_css('&.fdp-j-food p{color:#241c19;}','J','section')
        self.assertIn('&.fdp-j-food .text-current-color { color:var(--q-dark) !important; }',css)

    def test_current_and_second_palette_pass_implemented_recipes(self):
        current = dict(primary='#e06b4a', secondary='#c4553a', dark='#38264a', background='#fbefe2')
        second = dict(primary='#0055a4', secondary='#f2c94c', dark='#101820', background='#f7fbff')
        for palette in (current, second):
            self.assertTrue(migration.palette_report(palette)['pass'])
        self.assertFalse(migration.palette_report(dict.fromkeys(current, '#eeeeee'))['pass'])
        # Demonstrate why the old solid native pairs must not be reused.
        self.assertLess(migration.contrast(migration.rgb(current['dark']), migration.rgb(current['primary'])), 4.5)
        self.assertLess(migration.contrast(migration.rgb(current['background']), migration.rgb(current['secondary'])), 4.5)


if __name__ == '__main__':
    unittest.main()
