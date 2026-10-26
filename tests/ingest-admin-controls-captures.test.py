"""Test provenance rejection and byte-preserving ingestion in temporary folders."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("ingest_native", Path(__file__).resolve().parents[1] / "scripts/ingest-admin-controls-captures.py")
ingest = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ingest)


class NativeClipIngestTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent)
        self.path = Path(self.temp.name)
        # Synthetic test fixture only; it is never added to catalog/screenshots.
        ingest.Image.new("RGB", (100, 120), (47, 31, 58)).save(self.path / "native-test.jpg", format="JPEG")
        (self.path / "journal.json").write_text('{"testFixture":true}', encoding="utf-8")
        self.option = {"id": "food--v", "variant": "v", "sourceUrl": "https://example.test/v/", "pageId": "1", "sectionIds": ["2"], "image": "screenshots/food/v.jpg", "width": 90, "height": 90, "displayName": "Keep reviewed label", "draftSectionIds": ["10"], "customerDesign": {"id": "keep-design"}, "library": {"status": "not-created"}, "capture": {"capturedAt": "old"}}
        self.catalog = {"slots": [{"id": "food", "options": [self.option]}, {"id": "contact", "options": [{"id": "keep"}]}]}
        self.plan = {"target": ingest.TARGET, "required": [{"optionId": "food--v", "variant": "v", "slot": "food", "sourceUrl": self.option["sourceUrl"], "pageId": "1", "sectionIds": ["2"], "destination": self.option["image"]}]}
        self.capture = {"optionId": "food--v", "variant": "v", "slot": "food", "sourceUrl": self.option["sourceUrl"], "pageId": "1", "sectionIds": ["2"], "rawImage": "native-test.jpg", "width": 100, "height": 120, "captureMethod": "live-browser-section-clips", "sourceState": "published", "capturedAt": "2026-10-25T19:00:01Z", "domObservedAt": "2026-10-25T19:00:00Z", "sourceBounds": {"x": 0, "y": 20, "width": 100, "height": 120}, "captureBounds": {"x": 0, "y": 20, "width": 100, "height": 120}, "viewport": {"width": 1536, "height": 864}, "sectionSelectors": [{"selector": ".section-food-2"}], "appearanceAltered": False, "sampleDataInjected": False, "visualReview": {"status": "passed", "reviewedAt": "2026-10-25", "notes": "Synthetic unit fixture reviewed for validator only.", "imageSha256": ingest.sha(self.path / "native-test.jpg"), "evidence": "unit-test-only"}}
        self.batch = {"target": ingest.TARGET, "batchId": "unit-test-only", "paletteState": "restored-current-native", "nativeChangeJournal": str(self.path / "journal.json"), "captures": [self.capture]}

    def tearDown(self):
        self.temp.cleanup()

    def prepare(self, **kwargs):
        return ingest.prepare(self.plan, self.batch, self.catalog, self.path / "manifest.json", **kwargs)

    def test_validation_uses_existing_pipeline_and_preserves_all_other_fields(self):
        before = copy.deepcopy(self.catalog)
        prepared = self.prepare()
        updated = ingest.validate_with_existing_pipeline(prepared, self.catalog)
        self.assertEqual(self.catalog, before)
        self.assertEqual(updated["slots"][1], before["slots"][1])
        result = updated["slots"][0]["options"][0]
        for key in ("displayName", "draftSectionIds", "customerDesign", "library"):
            self.assertEqual(result[key], self.option[key])
        self.assertEqual(result["visualReview"]["imageSha256"], ingest.sha(self.path / "native-test.jpg"))
        self.assertIn("nativeChangeJournalSha256", result["capture"]["evidence"][0])
        self.assertFalse((self.path / "evidence").exists(), "Default validation writes nothing")

    def test_node_utf8_output_preserves_original_unicode_semantic_metadata(self):
        self.option.update({"displayName": "B · Rép — café", "sourceName": "Printed menu → 原版", "componentNote": "Chef’s “Snacks” · goûter\nSecond line — unchanged."})
        self.catalog["slots"][1]["options"][0]["name"] = "Contact · Écrivez-nous"
        before = copy.deepcopy(self.catalog)
        updated = ingest.validate_with_existing_pipeline(self.prepare(), self.catalog)
        actual = updated["slots"][0]["options"][0]
        for field in ("displayName", "sourceName", "componentNote"):
            self.assertEqual(actual[field], before["slots"][0]["options"][0][field])
        self.assertEqual(updated["slots"][1], before["slots"][1])

    def test_changed_source_ids_need_explicit_identity_review(self):
        self.capture["sectionIds"] = ["999"]
        with self.assertRaisesRegex(ValueError, "sourceIdentityVerified"):
            self.prepare()
        self.capture["visualReview"]["sourceIdentityVerified"] = True
        self.prepare()

    def test_changed_pixels_altered_source_or_partial_clip_fail(self):
        for key, value, message in [("appearanceAltered", True, "unaltered"), ("sampleDataInjected", True, "no-fixture"), ("missingDocumentY", [[40, 50]], "Partial")]:
            with self.subTest(key=key):
                altered = copy.deepcopy(self.batch)
                altered["captures"][0][key] = value
                with self.assertRaisesRegex(ValueError, message):
                    ingest.prepare(self.plan, altered, self.catalog, self.path / "manifest.json")
        self.capture["visualReview"]["imageSha256"] = "bad"
        with self.assertRaisesRegex(ValueError, "actual native pixels"):
            self.prepare()

    def test_identity_duplicate_and_incomplete_batches_fail(self):
        self.batch["captures"].append(copy.deepcopy(self.capture))
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            self.prepare()
        self.batch["captures"].pop()
        self.plan["required"].append({**self.plan["required"][0], "optionId": "other"})
        with self.assertRaisesRegex(ValueError, "exactly 2"):
            self.prepare()
        self.prepare(allow_partial=True)

    def test_crop_omissions_and_resized_dimensions_fail(self):
        self.capture["captureBounds"]["height"] = 100
        with self.assertRaisesRegex(ValueError, "omit"):
            self.prepare()
        self.capture["captureBounds"]["height"] = 120
        self.capture["width"] = 200
        with self.assertRaisesRegex(ValueError, "raster dimensions"):
            self.prepare()

    def test_draft_phone_and_temporary_palette_are_not_picker_assets(self):
        self.capture["sourceState"] = "draft"
        with self.assertRaisesRegex(ValueError, "published public"):
            self.prepare()
        self.capture["sourceState"] = "published"
        self.capture["viewport"]["width"] = 390
        with self.assertRaisesRegex(ValueError, "mobile QA is separate"):
            self.prepare()
        self.capture["viewport"]["width"] = 1536
        self.batch["paletteState"] = "temporary-second-palette"
        with self.assertRaisesRegex(ValueError, "restored current native palette"):
            self.prepare()

    def test_apply_copies_exact_bytes_and_keeps_rollback_catalog(self):
        prepared = self.prepare()
        updated = ingest.validate_with_existing_pipeline(prepared, self.catalog)
        with patch.object(ingest, "REPO", self.path):
            destination = self.path / "screenshots/food/v.jpg"
            destination.parent.mkdir(parents=True)
            destination.write_bytes(b"old canonical test bytes")
            old_catalog = (json.dumps(self.catalog) + "\n").encode()
            (self.path / "catalog.json").write_bytes(old_catalog)
            prepared["copies"] = [(self.path / "journal.json", self.path / prepared["evidenceRoot"] / "native-change-journal.snapshot.json"), (self.path / "native-test.jpg", self.path / prepared["evidenceRoot"] / "raw/food--v.jpg"), (self.path / "native-test.jpg", destination)]
            ingest.apply(prepared, updated)
            self.assertEqual(destination.read_bytes(), (self.path / "native-test.jpg").read_bytes())
            evidence = self.path / prepared["evidenceRoot"]
            self.assertEqual((evidence / "catalog.before.json").read_bytes(), old_catalog)
            self.assertEqual((evidence / "raw/food--v.jpg").read_bytes(), destination.read_bytes())
            self.assertEqual((evidence / "native-change-journal.snapshot.json").read_bytes(), (self.path / "journal.json").read_bytes())
            self.assertEqual(json.loads((evidence / "ingestion.json").read_text())["status"], "applied-byte-identically")

    def test_mid_apply_file_failure_restores_canonical_bytes_and_catalog(self):
        prepared = self.prepare()
        updated = ingest.validate_with_existing_pipeline(prepared, self.catalog)
        with patch.object(ingest, "REPO", self.path):
            destination = self.path / "screenshots/food/v.jpg"
            destination.parent.mkdir(parents=True)
            destination.write_bytes(b"old canonical test bytes")
            (self.path / "catalog.json").write_text("old-catalog", encoding="utf-8")
            prepared["copies"] = [(self.path / "journal.json", self.path / prepared["evidenceRoot"] / "native-change-journal.snapshot.json"), (self.path / "native-test.jpg", self.path / prepared["evidenceRoot"] / "raw/food--v.jpg"), (self.path / "native-test.jpg", destination)]
            original_replace = ingest.os.replace
            counter = 0
            def failing_replace(source, target):
                nonlocal counter
                counter += 1
                if counter == 4:
                    raise OSError("simulated staged catalog failure")
                return original_replace(source, target)
            with patch.object(ingest.os, "replace", side_effect=failing_replace):
                with self.assertRaisesRegex(OSError, "simulated"):
                    ingest.apply(prepared, updated)
            self.assertEqual(destination.read_bytes(), b"old canonical test bytes")
            self.assertEqual((self.path / "catalog.json").read_text(), "old-catalog")
            self.assertFalse((self.path / prepared["evidenceRoot"] / "raw/food--v.jpg").exists())

    def test_catalog_only_utf8_repair_preserves_existing_batch_inputs_and_pixels(self):
        self.option["displayName"] = "B · Rep"
        prepared = self.prepare()
        updated = ingest.validate_with_existing_pipeline(prepared, self.catalog)
        with patch.object(ingest, "REPO", self.path):
            destination = self.path / "screenshots/food/v.jpg"
            destination.parent.mkdir(parents=True)
            destination.write_bytes(b"old test bytes")
            (self.path / "catalog.json").write_text(json.dumps(self.catalog, ensure_ascii=False), encoding="utf-8")
            batch = self.path / prepared["evidenceRoot"]
            prepared["copies"] = [(self.path / "journal.json", batch / "native-change-journal.snapshot.json"), (self.path / "native-test.jpg", batch / "raw/food--v.jpg"), (self.path / "native-test.jpg", destination)]
            # Evidence links are repository-relative even in the temp fixture.
            for evidence in prepared["observations"]["options"][0]["captureEvidence"]:
                evidence["nativeChangeJournalSnapshot"] = f'{prepared["evidenceRoot"]}/native-change-journal.snapshot.json'
            ingest.apply(prepared, updated)
            fixed = (self.path / "catalog.json").read_bytes()
            garbled = fixed.decode("cp1252").encode("utf-8")
            (self.path / "catalog.json").write_bytes(garbled)
            immutable = {file: file.read_bytes() for file in batch.rglob('*') if file.is_file()}
            pixels = destination.read_bytes()
            with patch.object(ingest, "validate_with_existing_pipeline", return_value=updated):
                proof = ingest.repair_catalog_utf8(batch)
                self.assertEqual(proof["status"], "validated-catalog-only-utf8-repair")
                self.assertEqual((self.path / "catalog.json").read_bytes(), garbled)
                proof = ingest.repair_catalog_utf8(batch, True)
            self.assertEqual(proof["status"], "repaired-catalog-only-utf8")
            self.assertEqual((self.path / "catalog.json").read_bytes(), fixed)
            self.assertEqual((batch / "catalog.before-utf8-repair.json").read_bytes(), garbled)
            self.assertEqual(destination.read_bytes(), pixels)
            for file, original in immutable.items():
                self.assertEqual(file.read_bytes(), original, file.name)


if __name__ == "__main__":
    unittest.main()
