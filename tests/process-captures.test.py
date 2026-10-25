"""Focused semantic and provenance checks; run directly with Python."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("process_captures", Path(__file__).resolve().parents[1] / "scripts" / "process-captures.py")
capture = importlib.util.module_from_spec(spec)
spec.loader.exec_module(capture)


class CaptureSemanticsTests(unittest.TestCase):
    def test_one_full_page_tile_covers_sections_below_the_viewport(self):
        image = capture.Image.new("RGB", (16, 80), "white")
        for y in range(80):
            for x in range(16):
                image.putpixel((x, y), (y, x, 0))
        tiles = [{"imageObject": image, "image": "full.png", "scrollY": 0,
                  "width": 16, "height": 80, "scaleX": 1, "scaleY": 1, "headerHeight": 4}]
        cropped, evidence, gaps = capture.crop_section({"x": 0, "y": 60, "width": 16, "height": 20}, tiles)
        self.assertEqual(gaps, [])
        self.assertEqual(cropped.getpixel((0, 0)), (60, 0, 0))
        self.assertEqual(cropped.getpixel((15, 19)), (79, 15, 0))
        self.assertEqual(evidence[0]["sourceDocumentY"], [60, 80])

    def test_dedicated_parties_and_public_programme_remain_separate(self):
        self.assertEqual(capture.semantic_slot({"classes": "section-events-b---playbill-23726"}, 3), "programme")
        self.assertEqual(capture.semantic_slot({"classes": "fdp-b-private-parties section-private-parties-b---your-own-evening-25134"}, 5), "events")
        for letter in "jkl":
            self.assertEqual(capture.semantic_slot({"classes": f"fdp-{letter}-private-parties section-private-parties-{letter}---gather-25136"}, 5), "events")

    def test_new_native_components_use_purpose_before_editorial_copy(self):
        for component in ("food", "membership", "contact"):
            self.assertEqual(capture.semantic_slot({"classes": f"fdp-k-{component}", "text": "Book your next private screening"}, 3), component)

    def test_only_exact_published_ids_receive_reviewed_metadata(self):
        variant = {"slug": "variant-k-clubhouse"}
        clip = {"slot": "food", "sections": [{"classes": "fdp-k-food section-food-k---clubhouse-kitchen-25135"}]}
        metadata = {"options": [{"variant": variant["slug"], "slot": "food", "sectionIds": ["25135"], "canonicalComponent": "food", "componentStatus": "present", "draftSectionIds": ["25122"]}]}
        self.assertEqual(capture.reviewed_metadata(variant, clip, metadata)["draftSectionIds"], ["25122"])
        clip["sections"][0]["classes"] = "fdp-k-food section-food-k---clubhouse-kitchen-99999"
        self.assertEqual(capture.reviewed_metadata(variant, clip, metadata), {})


if __name__ == "__main__":
    unittest.main()
