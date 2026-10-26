"""Focused semantic and provenance checks; run directly with Python."""
import importlib.util
import json
from pathlib import Path
import random
import tempfile
import unittest
from unittest.mock import patch

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


class CaptureInputValidationTests(unittest.TestCase):
    @staticmethod
    def detailed_image(width=120, height=250):
        rng = random.Random(37)
        return capture.Image.frombytes("RGB", (width, height), rng.randbytes(width * height * 3))

    def repeated_image(self):
        viewport = self.detailed_image()
        image = capture.Image.new("RGB", (viewport.width, viewport.height * 4))
        for y in range(0, image.height, viewport.height):
            image.paste(viewport, (0, y))
        return image

    def test_repeated_full_page_viewport_is_rejected_even_with_plausible_dimensions(self):
        image = self.repeated_image()
        # Simulate the discovered 1.25x repetition period: declared viewport200,
        # actual repeated band250, while the outer1000px file dimensions agree.
        variant = {"slug": "corrupt", "captureMethod": "live-browser-full-page",
                   "viewport": {"width": 120, "height": 200}}
        with self.assertRaisesRegex(ValueError, "repeated top viewport every 250"):
            capture.validate_tile_image(variant, image, 120, 1000, "repeated.jpg")

    def test_uniform_background_and_repeated_headers_are_not_rejected(self):
        self.assertIsNone(capture.repeated_viewport_period(capture.Image.new("RGB", (120, 1000), "white"), 200, 1))
        image = self.detailed_image(height=1000)
        header = self.detailed_image(height=40)
        for y in range(0, image.height, 250):
            image.paste(header, (0, y))
        self.assertIsNone(capture.repeated_viewport_period(image, 200, 1))

    def test_inconsistent_declared_xy_scale_is_rejected(self):
        variant = {"slug": "stretched", "viewport": {"width": 120, "height": 200}}
        with self.assertRaisesRegex(ValueError, "inconsistent image scale"):
            capture.validate_tile_image(variant, self.detailed_image(height=250), 120, 200, "stretched.jpg")

    def test_uniform_retina_scale_and_one_rounded_bottom_pixel_are_allowed(self):
        variant = {"slug": "valid", "captureMethod": "live-browser-full-page",
                   "viewport": {"width": 120, "height": 200}}
        capture.validate_tile_image(variant, self.detailed_image(width=240, height=999), 120, 500, "retina.jpg")

    def test_exact_section_clips_allow_different_sizes_without_header_occlusion(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent) as temp:
            directory = Path(temp)
            self.detailed_image(width=120, height=100).save(directory / "first.png")
            self.detailed_image(width=120, height=250).save(directory / "second.png")
            variant = {"slug": "clips", "captureMethod": "live-browser-section-clips",
                       "viewport": {"width": 136, "height": 200},
                       "header": {"x": 0, "y": 0, "width": 136, "height": 50},
                       "tiles": [{"image": "first.png", "cssWidth": 120, "cssHeight": 100, "scrollY": 0},
                                 {"image": "second.png", "cssWidth": 120, "cssHeight": 250, "scrollY": 200}]}
            tiles = capture.load_tiles(variant, directory)
            self.assertEqual([tile["headerHeight"] for tile in tiles], [0, 0])
            result, _, gaps = capture.crop_section({"x": 0, "y": 200, "width": 120, "height": 250}, tiles)
            self.assertEqual(gaps, [])
            self.assertEqual(result.tobytes(), self.detailed_image(width=120, height=250).tobytes())

    def test_changed_scale_between_tiles_is_rejected(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent) as temp:
            directory = Path(temp)
            self.detailed_image(width=120, height=100).save(directory / "first.png")
            self.detailed_image(width=240, height=200).save(directory / "second.png")
            variant = {"slug": "resized", "captureMethod": "live-browser-section-clips", "tiles": [
                {"image": "first.png", "cssWidth": 120, "cssHeight": 100, "scrollY": 0},
                {"image": "second.png", "cssWidth": 120, "cssHeight": 100, "scrollY": 100}]}
            with self.assertRaisesRegex(ValueError, "scale changed between viewport tiles"):
                capture.load_tiles(variant, directory)

    def test_late_corrupt_input_fails_before_any_asset_or_manifest_is_written(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent) as temp:
            directory = Path(temp)
            self.detailed_image(height=1000).save(directory / "valid.png")
            self.repeated_image().save(directory / "corrupt.png")
            variants = []
            for slug, filename in [("a-valid", "valid.png"), ("z-corrupt", "corrupt.png")]:
                variants.append({"slug": slug, "captureMethod": "live-browser-full-page",
                    "viewport": {"width": 120, "height": 200}, "header": {"width": 120, "height": 50},
                    "tiles": [{"image": filename, "width": 120, "height": 1000, "scrollY": 0}]})
            manifest = directory / "input.json"
            manifest.write_text(json.dumps({"variants": variants}), encoding="utf-8")
            output = directory / "result.json"
            with patch.object(capture, "REPO", directory), patch("sys.argv", ["process-captures.py", str(manifest), "--output", str(output)]):
                with self.assertRaisesRegex(ValueError, "repeated top viewport"):
                    capture.main()
            self.assertFalse((directory / "screenshots").exists())
            self.assertFalse(output.exists())
            self.assertFalse((directory / "variant-contact-sheet.jpg").exists())

    def test_validate_only_success_does_not_write_outputs(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent) as temp:
            directory = Path(temp)
            self.detailed_image(height=1000).save(directory / "valid.png")
            manifest = directory / "input.json"
            manifest.write_text(json.dumps({"variants": [{"slug": "valid", "captureMethod": "live-browser-full-page",
                "viewport": {"width": 120, "height": 200}, "header": {"width": 120, "height": 50},
                "tiles": [{"image": "valid.png", "width": 120, "height": 1000, "scrollY": 0}]}]}), encoding="utf-8")
            output = directory / "result.json"
            with patch.object(capture, "REPO", directory), patch("sys.argv", ["process-captures.py", str(manifest), "--output", str(output), "--validate-only"]):
                capture.main()
            self.assertFalse((directory / "screenshots").exists())
            self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()
