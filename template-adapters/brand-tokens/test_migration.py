"""Structural checks for the local, review-only brand token proposals."""
import json
import pathlib
import re
import unittest

from migrate import COLOR, COMMENT, HERE, PROFILES, geometry_declarations, migrate_css, normalize_color


class MigrationTests(unittest.TestCase):
    def test_normalizes_cssom_rgb_and_authored_hex_to_same_identity(self):
        self.assertEqual(normalize_color("#923B2C"), ("#923b2c", 1))
        self.assertEqual(normalize_color("rgb(146, 59, 44)"), ("#923b2c", 1))
        self.assertEqual(normalize_color("rgba(146,59,44,.28)"), ("#923b2c", .28))

    def test_alpha_is_retained_as_explicit_transparency_recipe(self):
        proposed, report = migrate_css(".scope{border:1px solid rgba(87,23,38,.4);}", "B")
        self.assertIn("color-mix(in srgb, var(--fd-primary) 40%, transparent)", proposed)
        self.assertFalse(report["unknownLiteralColors"])

    def test_unknown_paint_is_reported_and_never_guessed(self):
        proposed, report = migrate_css(".scope{color:#123456;}", "B")
        self.assertIn("#123456", proposed)
        self.assertEqual(report["unknownLiteralColors"], {"#123456": 1})

    def test_comments_and_nonpaint_design_are_preserved(self):
        before = '/* #123456 */ .scope{color:#571726;transform:rotate(-1.5deg);font-family:"Pacifico";clip-path:polygon(0 0,100% 0,90% 100%);}'
        after, _ = migrate_css(before, "B")
        self.assertIn("/* #123456 */", after)
        self.assertEqual(geometry_declarations(before), geometry_declarations(after))

    def test_demo_override_is_removed_without_removing_system_alias(self):
        css = '.page{--v-paper:var(--q-background);}.page{--v-paper:#F5F0E6;}'
        after, report = migrate_css(css, "D")
        self.assertIn("--v-paper:var(--q-background)", after)
        self.assertNotIn("#F5F0E6", after)
        self.assertEqual(len(report["removedDemoDeclarations"]), 1)

    def test_profiles_cover_all_twelve_variants(self):
        self.assertEqual(set(PROFILES), set("ABCDEFGHIJKL"))
        self.assertEqual(PROFILES["K"]["literalToRole"]["#e8bb96"], "secondary-tint")
        self.assertEqual(PROFILES["K"]["literalToRole"]["#df9d78"], "accent")

    def test_full_proposals_have_no_remaining_literal_brand_colors(self):
        manifest = json.loads((HERE / "manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["summary"]["variants"], 12)
        self.assertEqual(manifest["summary"]["completeLiteralSubstitutions"], 12)
        self.assertEqual(manifest["summary"]["unmappedLiteralColors"], [])
        self.assertEqual(manifest["coverageScope"], "page-and-section-compiled-css-only")
        self.assertEqual(manifest["summary"]["sharedSiteThemeOrHeaderMigrationsPrepared"], 0)
        self.assertTrue(manifest["source"].endswith("live-template-styles-final.json"))
        for variant in manifest["variants"]:
            before = (HERE / variant["before"]).read_text(encoding="utf-8")
            after = (HERE / variant["proposed"]).read_text(encoding="utf-8")
            with self.subTest(variant=variant["variant"]):
                self.assertEqual(COLOR.findall(COMMENT.sub("", after)), [])
                # Appended paint role splits contain no geometry declarations.
                self.assertEqual(geometry_declarations(before), geometry_declarations(after))
                self.assertTrue(all(i in after for i in variant["identitiesRetained"]))
                self.assertIn("--fd-primary: var(--q-primary)", after)
                self.assertEqual(variant["nativeFieldInstallationStatus"], "not-mapped-to-all-current-editable-fields")
                if variant["variant"] == "variant-i-ma":
                    self.assertIn(".mobile-hero-title", after)
                    self.assertIn(".mobile-hero-subtitle", after)
                    self.assertIn("var(--q-dark) 88%, transparent", after)
                    self.assertIn("--ma-caption-backdrop", after)
                    self.assertIn("left: 24px !important", after)
                    self.assertIn("bottom: 24px !important", after)
                    self.assertIn("text-shadow: 0 0.05em", after)
                    self.assertNotRegex(after, r"text-shadow\s*:\s*none")

    def test_known_low_contrast_case_is_a_release_gate(self):
        manifest = json.loads((HERE / "manifest.json").read_text(encoding="utf-8"))
        failure = next(x for x in manifest["contrastGates"] if x["pair"] == "Background / Secondary")
        self.assertEqual(failure["normalText"], "fail")
        self.assertEqual(manifest["summary"]["certifiedForClientUse"], 0)

    def test_odd_role_patch_has_three_stable_roles_and_no_copy_edits(self):
        patch = json.loads((HERE / "odd-membership-role-patch.json").read_text(encoding="utf-8"))
        self.assertEqual([x["addClass"] for x in patch["cards"]], ["fd-tier-primary", "fd-tier-secondary", "fd-tier-dark"])
        self.assertEqual(patch["sectionId"], "24797")
        self.assertEqual(patch["copyChanges"], [])
        self.assertEqual(patch["geometryChanges"], [])


if __name__ == "__main__":
    unittest.main()
