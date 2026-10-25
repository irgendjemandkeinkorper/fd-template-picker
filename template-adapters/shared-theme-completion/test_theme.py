"""Structural checks for a review bundle; these do not prove a native save."""
from pathlib import Path
import hashlib
import json
import re
import unittest

from build import SOURCE, ROOT, VARIANTS, prepare


def luminance(rgb):
    channels = [v / 255 for v in rgb]
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in channels]
    return sum(a * b for a, b in zip(linear, [.2126, .7152, .0722]))


def rgb(hex_value):
    return tuple(int(hex_value[i:i + 2], 16) for i in (1, 3, 5))


def ratio(a, b):
    x, y = sorted([luminance(a), luminance(b)])
    return (y + .05) / (x + .05)


def mix(a, percentage, b):
    return tuple(x * percentage + y * (1 - percentage) for x, y in zip(a, b))


class SharedThemeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original = SOURCE.read_bytes().decode("utf-8")
        cls.result, cls.patch, cls.counts = prepare(cls.original)

    def test_non_template_rules_unchanged(self):
        marker = "/* NOCTURNE NAV VARIANTS"
        self.assertEqual(self.original.split(marker)[0], self.result.split(marker)[0])

    def test_concrete_approved_containment_unchanged(self):
        marker = "/* REVIEW PROPOSAL ONLY"
        original_block = self.original[self.original.index(marker):].rstrip()
        self.assertIn(original_block, self.result)

    def test_active_template_paints_have_no_literals_or_extra_brand_inputs(self):
        active = self.result.split("/* NOCTURNE NAV VARIANTS")[1].split("/* REVIEW PROPOSAL ONLY")[0]
        self.assertNotRegex(active, r"#[0-9a-fA-F]{3,8}\b|\brgba?\(")
        self.assertNotIn("--q-header", active)
        self.assertNotIn("--q-accent", active)
        self.assertEqual(self.counts["var(--q-header)"], 7)

    def test_new_paints_fail_closed(self):
        changed = self.original.replace("/* NOCTURNE NAV VARIANTS", "/* NOCTURNE NAV VARIANTS */\n.x{color:#123456}\n/*")
        with self.assertRaisesRegex(ValueError, "Unmapped"):
            prepare(changed)

    def test_all_twelve_variants_are_scoped(self):
        for variant in VARIANTS:
            self.assertIn(f'page-variant-{variant}-', self.patch)
        self.assertNotIn(":root", self.patch)
        self.assertNotIn("--q-primary:", self.patch)
        self.assertNotIn("--q-secondary:", self.patch)
        self.assertNotIn("--q-dark:", self.patch)
        self.assertNotIn("--q-background:", self.patch)

    def test_existing_geometry_and_fonts_preserved(self):
        # New roles can replace paint and add focus/active cues; original
        # position, dimensions, type and transforms remain byte-for-byte.
        properties = r"(?:font(?:-[a-z-]+)?|transform|width|min-width|max-width|height|min-height|max-height|position|top|left|right|bottom|padding(?:-[a-z-]+)?|margin(?:-[a-z-]+)?|gap|display|flex(?:-[a-z-]+)?|align-items|justify-content)"
        rx = re.compile(r"(?<![-\w])" + properties + r"\s*:[^;{}]*[;}]", re.I)
        old = rx.findall(self.original)
        new = rx.findall(self.result.split("/* TEMPLATE ADMIN COLOR CONTRACT")[0])
        self.assertEqual(old, new)

    def test_current_palette_contract_passes_and_unsafe_pairs_stay_known(self):
        p, s, d, b = map(rgb, ["#e06b4a", "#c4553a", "#38264a", "#fbefe2"])
        self.assertGreater(ratio(d, b), 4.5)
        self.assertGreater(ratio(d, mix(p, .16, b)), 4.5)
        self.assertGreater(ratio(d, mix(s, .14, b)), 4.5)
        self.assertLess(ratio(d, p), 4.5)
        self.assertLess(ratio(b, s), 4.5)
        # An arbitrary pair can still fail. Native colors require a check.
        self.assertLess(ratio(b, b), 4.5)

    def test_second_palette_contract_is_css_independent(self):
        p, s, d, b = map(rgb, ["#1765a8", "#e0a800", "#151f2e", "#f7fafc"])
        for paint in (b, mix(p, .16, b), mix(s, .14, b)):
            self.assertGreater(ratio(d, paint), 4.5)
        for token in ("--q-primary", "--q-secondary", "--q-dark", "--q-background"):
            self.assertIn(token, self.patch)

    def test_native_primary_actions_match_page_adapter_contract(self):
        for slug, ident in [("a-circuit", "5659"), ("b-rep", "5661"), ("c-late", "5663")]:
            self.assertIn(f'has(.page-variant-{slug}-{ident}) main .q-btn.bg-primary{{background:var(--fd-primary-tint) !important;color:var(--q-dark) !important;}}', self.result)
        self.assertIn("main .q-btn.bg-primary {\n  background: var(--fd-primary-tint) !important;\n  border-color: var(--q-primary) !important;\n  color: var(--q-dark) !important;", self.patch)
        self.assertIn("--pl-wine: var(--q-primary);", self.patch)
        # In the actual retained site CSS this alias is used only as fill.
        self.assertEqual(self.original.count("var(--pl-wine)"), 1)
        self.assertIn("background: var(--pl-wine)", self.original)

    def test_manifest_matches_generated_file(self):
        manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["sourceSha256"], hashlib.sha256(SOURCE.read_bytes()).hexdigest())
        self.assertEqual(manifest["proposedSha256"], hashlib.sha256((ROOT / "site-theme.proposed.css").read_bytes()).hexdigest())
        self.assertEqual(manifest["status"], "prepared-not-applied")


if __name__ == "__main__":
    unittest.main()
