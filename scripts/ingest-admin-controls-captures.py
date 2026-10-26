"""Validate and ingest reviewed, unmodified native element JPEGs.

Default is read-only validation. --apply byte-copies clips and uses the existing
capture-correction validator to preserve every non-capture catalog field.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

from PIL import Image

REPO = Path(__file__).resolve().parents[1]
TARGET = ["US-BETA", "INDY Demo", "Adam Template Testing 2"]
NODE_VALIDATOR = r'''
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const data = JSON.parse(readFileSync(0, 'utf8'));
const { applyCaptureCorrections } = await import(pathToFileURL(resolve(process.argv[1], 'scripts/apply-capture-corrections.mjs')));
const updated = await applyCaptureCorrections(data.catalog, [data.observations], data.reviews, {
  readImage: async image => readFile(data.rawFiles[image]),
});
process.stdout.write(JSON.stringify(updated, null, 2) + '\n');
'''


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def finite_rect(value, name):
    if not isinstance(value, dict) or any(key not in value for key in ("x", "y", "width", "height")):
        raise ValueError(f"{name}: a fresh actual x/y/width/height rectangle is required")
    if any(not isinstance(value[key], (int, float)) or not math.isfinite(value[key]) for key in value):
        raise ValueError(f"{name}: rectangle values must be finite")
    if value["x"] < 0 or value["y"] < 0 or value["width"] <= 0 or value["height"] <= 0:
        raise ValueError(f"{name}: non-positive or negative document bounds")
    return value


def validate_identity(capture, planned, option, review):
    for key in ("variant", "slot", "sourceUrl"):
        if capture.get(key) != planned.get(key) or capture.get(key) != option.get(key):
            raise ValueError(f"Source {key} mismatch: {capture.get('optionId')}")
    if str(capture.get("pageId")) != planned["pageId"] or str(capture.get("pageId")) != str(option.get("pageId")):
        raise ValueError(f"Source pageId mismatch: {capture.get('optionId')}")
    old = sorted(map(str, option.get("sectionIds", [])))
    observed = sorted(map(str, capture.get("sectionIds", [])))
    if old != observed and review.get("sourceIdentityVerified") is not True:
        raise ValueError(f"Changed published section IDs need explicit sourceIdentityVerified: {capture.get('optionId')}")
    if capture.get("slot") != "header" and not observed:
        raise ValueError(f"A content clip must identify actual published sections: {capture.get('optionId')}")
    if not capture.get("sectionSelectors") or any(not item.get("selector") for item in capture["sectionSelectors"]):
        raise ValueError(f"Fresh observed selector required: {capture.get('optionId')}")


def validate_native_pixels(capture, path, review):
    if capture.get("sourceState") != "published":
        raise ValueError("Explicit published public source state is required")
    if capture.get("captureMethod") != "live-browser-section-clips":
        raise ValueError("Only actual native element clips may use this byte-preserving helper")
    if capture.get("appearanceAltered") is not False or capture.get("sampleDataInjected") is not False:
        raise ValueError("Explicit unaltered source and no-fixture declarations are required")
    if capture.get("missingDocumentY") or capture.get("excludedDocumentY"):
        raise ValueError("Partial or excluded element pixels require recapture, not an eligible picker replacement")
    if not capture.get("capturedAt") or not capture.get("domObservedAt"):
        raise ValueError("Capture and fresh DOM observation times are required")
    for key in ("capturedAt", "domObservedAt"):
        datetime.fromisoformat(capture[key].replace("Z", "+00:00"))
    source = finite_rect(capture.get("sourceBounds"), "sourceBounds")
    bounds = finite_rect(capture.get("captureBounds"), "captureBounds")
    viewport = capture.get("viewport", {})
    if not (viewport.get("width", 0) >= 1024 and viewport.get("height", 0) > 0):
        raise ValueError("Actual desktop viewport dimensions are required; mobile QA is separate")
    # Outward rounding may add a subpixel edge; it may not omit real content.
    if bounds["x"] > source["x"] + .01 or bounds["y"] > source["y"] + .01 or bounds["x"] + bounds["width"] < source["x"] + source["width"] - .01 or bounds["y"] + bounds["height"] < source["y"] + source["height"] - .01:
        raise ValueError("Capture bounds omit part of the observed source element")
    if max(abs(bounds[key] - source[key]) for key in ("x", "y", "width", "height")) > 2:
        raise ValueError("Capture rectangle differs by more than native outward rounding")
    with Image.open(path) as image:
        if image.format != "JPEG":
            raise ValueError("Canonical picker images are JPEG: capture native JPEG rather than transcoding")
        width, height = image.size
        if (width, height) != (capture.get("width"), capture.get("height")):
            raise ValueError("Recorded raster dimensions differ from actual native image")
        sx, sy = width / bounds["width"], height / bounds["height"]
        if abs(sx - sy) > max(.01, sx * .01):
            raise ValueError("Native clip X/Y scale mismatch; recapture without resizing")
        if not (width > 0 and height > 0):
            raise ValueError("Empty native image")
        image.verify()
    digest = sha(path)
    if review.get("imageSha256") != digest:
        raise ValueError("Dated visual review does not match actual native pixels")
    if review.get("status") not in ("passed", "needs-review", "rejected") or not review.get("notes") or not review.get("reviewedAt") or not review.get("evidence"):
        raise ValueError("Explicit dated pixel/label review and evidence are required")
    return digest


def prepare(plan, batch, catalog, manifest_path, allow_partial=False):
    if batch.get("target") != TARGET or plan.get("target") != TARGET:
        raise ValueError("Wrong Region/Circuit/Site")
    if batch.get("paletteState") != "restored-current-native":
        raise ValueError("Picker assets require the restored current native palette, not the temporary palette test")
    batch_id = batch.get("batchId", "")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{2,70}", batch_id):
        raise ValueError("batchId must be a short, unique lowercase slug")
    journal = Path(batch.get("nativeChangeJournal", ""))
    if not journal.is_absolute():
        journal = REPO / journal
    if not journal.is_file():
        raise ValueError("Existing final native change journal is required")
    planned = {item["optionId"]: item for item in plan["required"]}
    options = {option["id"]: {**option, "slot": slot["id"]} for slot in catalog["slots"] for option in slot["options"]}
    captures = batch.get("captures", [])
    if not captures:
        raise ValueError("No actual native clips provided")
    ids = [item.get("optionId") for item in captures]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate option capture")
    if not allow_partial and set(ids) != set(planned):
        raise ValueError(f"Complete customer batch requires exactly {len(planned)} clips; use --allow-partial for a reviewed subset")
    observations, reviews, raw_files, copies = [], [], {}, []
    evidence_root = Path("evidence/admin-controls-completion/captures") / batch_id
    journal_snapshot = evidence_root / "native-change-journal.snapshot.json"
    copies.append((journal, REPO / journal_snapshot))
    for capture in captures:
        option_id = capture["optionId"]
        if option_id not in planned or option_id not in options:
            raise ValueError(f"Unknown or non-customer choice: {option_id}")
        review = capture.get("visualReview", {})
        validate_identity(capture, planned[option_id], options[option_id], review)
        destination = Path(planned[option_id]["destination"])
        if not (REPO / destination).resolve().is_relative_to((REPO / "screenshots").resolve()):
            raise ValueError("Destination must stay in the repository screenshots directory")
        if destination.as_posix() != options[option_id].get("image"):
            raise ValueError("Current destination identity changed; rebuild capture plan")
        raw = Path(capture.get("rawImage", ""))
        if not raw.is_absolute():
            raw = manifest_path.parent / raw
        digest = validate_native_pixels(capture, raw, review)
        retained = evidence_root / "raw" / f"{option_id}.jpg"
        raw_files[destination.as_posix()] = str(raw.resolve())
        copies.extend([(raw, REPO / retained), (raw, REPO / destination)])
        observation = {key: capture[key] for key in ("variant", "slot", "sourceUrl", "pageId", "sectionIds", "width", "height", "capturedAt", "captureMethod", "sourceBounds", "captureBounds", "sectionSelectors")}
        observation.update({"id": option_id, "image": destination.as_posix(), "captureStatus": "captured-live", "appearanceAltered": False, "sampleDataInjected": False, "missingDocumentY": [], "excludedDocumentY": [],
            "captureEvidence": [{"image": retained.as_posix(), "rawImageSha256": digest, "viewport": capture["viewport"], "domObservedAt": capture["domObservedAt"], "sourceState": capture["sourceState"], "paletteState": batch["paletteState"], "nativeChangeJournal": str(journal.relative_to(REPO)).replace("\\", "/") if journal.is_relative_to(REPO) else str(journal), "nativeChangeJournalSnapshot": journal_snapshot.as_posix(), "nativeChangeJournalSha256": sha(journal), "sourceDocumentY": [capture["sourceBounds"]["y"], capture["sourceBounds"]["y"] + capture["sourceBounds"]["height"]], "outputY": [0, capture["height"]]}],
            "captureNote": "Permanent source changes are recorded in the native change journal. This is the actual published restored-palette appearance; no temporary capture styles, fixtures, image edits, stitching or re-encoding."})
        observations.append(observation)
        reviews.append({"optionId": option_id, **review})
    return {"batchId": batch_id, "evidenceRoot": evidence_root.as_posix(), "observations": {"recordedAt": datetime.now(timezone.utc).isoformat(), "options": observations}, "reviews": {"reviews": reviews}, "rawFiles": raw_files, "copies": copies}


def validate_with_existing_pipeline(prepared, catalog):
    result = subprocess.run(["node", "--input-type=module", "-e", NODE_VALIDATOR, str(REPO)], input=json.dumps({"catalog": catalog, "observations": prepared["observations"], "reviews": prepared["reviews"], "rawFiles": prepared["rawFiles"]}), text=True, encoding="utf-8", errors="strict", capture_output=True, check=False)
    if result.returncode:
        raise ValueError("Existing correction validator rejected batch: " + result.stderr.strip())
    return json.loads(result.stdout)


def repair_catalog_utf8(batch_directory, apply_repair=False):
    """Rebuild only catalog.json from an existing batch's immutable UTF-8 inputs."""
    batch = Path(batch_directory).resolve()
    if not batch.is_relative_to((REPO / "evidence/admin-controls-completion/captures").resolve()):
        raise ValueError("Repair source must be an existing repository capture batch")
    record = load(batch / "ingestion.json")
    if record.get("status") != "applied-byte-identically":
        raise ValueError("Only a previously applied byte-identical capture batch may be repaired")
    baseline = load(batch / "catalog.before.json")
    observations, reviews = load(batch / "observations.json"), load(batch / "visual-reviews.json")
    raw_files = {}
    for option in observations["options"]:
        evidence = option.get("captureEvidence", [])
        if not evidence:
            raise ValueError("Retained raw evidence is missing")
        raw = (REPO / evidence[0]["image"]).resolve()
        if not raw.is_relative_to(batch) or sha(raw) != evidence[0].get("rawImageSha256"):
            raise ValueError("Immutable batch raw image identity/hash mismatch")
        canonical = (REPO / option["image"]).resolve()
        if not canonical.is_relative_to((REPO / "screenshots").resolve()) or sha(canonical) != sha(raw):
            raise ValueError("Current canonical pixels differ; this is not a catalog-only encoding repair")
        snapshot = evidence[0].get("nativeChangeJournalSnapshot")
        if snapshot and sha(REPO / snapshot) != evidence[0].get("nativeChangeJournalSha256"):
            raise ValueError("Retained native journal snapshot hash mismatch")
        raw_files[option["image"]] = str(raw)
    updated = validate_with_existing_pipeline({"observations": observations, "reviews": reviews, "rawFiles": raw_files}, baseline)
    # The existing correction function owns its capture-only changes. Verify
    # every original semantic field across every option before writing a repair.
    capture_fields = {"image", "width", "height", "captureStatus", "sectionIds", "sourceUrl", "pageId", "capture", "visualReview"}
    original_options = {option["id"]: option for slot in baseline["slots"] for option in slot["options"]}
    corrected_options = {option["id"]: option for slot in updated["slots"] for option in slot["options"]}
    if original_options.keys() != corrected_options.keys():
        raise ValueError("Catalog option identities changed")
    for option_id, original in original_options.items():
        expected = {key: value for key, value in original.items() if key not in capture_fields}
        actual = {key: value for key, value in corrected_options[option_id].items() if key not in capture_fields}
        if actual != expected:
            raise ValueError(f"Semantic metadata changed: {option_id}")
    catalog_path = REPO / "catalog.json"
    before = catalog_path.read_bytes()
    after = (json.dumps(updated, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
    proof = {"status": "validated-catalog-only-utf8-repair", "optionCount": len(original_options), "captureCount": len(observations["options"]),
        "baselineSha256": sha(batch / "catalog.before.json"), "beforeSha256": hashlib.sha256(before).hexdigest(), "afterSha256": hashlib.sha256(after).hexdigest(),
        "semanticMetadata": "All original non-capture fields preserved exactly from the immutable pre-ingestion catalog", "pixelFiles": "Unchanged; canonical bytes match retained raw hashes", "nodeSubprocessEncoding": "utf-8, strict"}
    if apply_repair and before != after:
        backup = batch / "catalog.before-utf8-repair.json"
        with backup.open("xb") as output:
            output.write(before)
        with tempfile.NamedTemporaryFile(prefix="catalog-utf8-", suffix=".tmp", dir=REPO, delete=False) as output:
            output.write(after)
            temporary = Path(output.name)
        try:
            os.replace(temporary, catalog_path)
            proof["status"] = "repaired-catalog-only-utf8"
            (batch / "utf8-repair.json").write_text(json.dumps(proof, indent=2) + "\n", encoding="utf-8")
        except Exception:
            catalog_path.write_bytes(before)
            raise
        finally:
            if temporary.exists():
                temporary.unlink()
    elif before == after:
        proof["status"] = "catalog-already-matches-utf8-reconstruction"
    return proof


def apply(prepared, updated_catalog):
    evidence = REPO / prepared["evidenceRoot"]
    if evidence.exists():
        raise ValueError("Batch evidence already exists; use a fresh unique batchId")
    # Stage every byte before changing a canonical screenshot. Backups make
    # any ordinary file-operation failure recoverable as one reviewed batch.
    with tempfile.TemporaryDirectory(prefix="native-clips-", dir=REPO) as tmp:
        staging = Path(tmp)
        def json_bytes(value):
            return (json.dumps(value, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
        generated = {
            REPO / "catalog.json": json_bytes(updated_catalog),
            evidence / "observations.json": json_bytes(prepared["observations"]),
            evidence / "visual-reviews.json": json_bytes(prepared["reviews"]),
            evidence / "catalog.before.json": (REPO / "catalog.json").read_bytes(),
            evidence / "ingestion.json": json_bytes({"status": "applied-byte-identically", "batchId": prepared["batchId"], "appliedAt": datetime.now(timezone.utc).isoformat(), "clipCount": len(prepared["observations"]["options"]), "method": "Native JPEG bytes copied unchanged; existing applyCaptureCorrections validates identities, review hashes and preserves semantic metadata."}),
        }
        outputs = prepared["copies"] + [(None, path) for path in generated]
        backup = []
        for index, (source, destination) in enumerate(outputs):
            old = staging / f"{index}.before"
            exists = destination.is_file()
            if exists:
                shutil.copyfile(destination, old)
            backup.append((destination, old, exists))
            new = staging / f"{index}.after"
            if source is None:
                new.write_bytes(generated[destination])
            else:
                shutil.copyfile(source, new)
        try:
            for index, (_, destination) in enumerate(outputs):
                destination.parent.mkdir(parents=True, exist_ok=True)
                os.replace(staging / f"{index}.after", destination)
        except Exception:
            for destination, old, existed in reversed(backup):
                if existed:
                    shutil.copyfile(old, destination)
                elif destination.is_file():
                    destination.unlink()
            raise


def main():
    if sys.argv[1:2] == ["repair-catalog-utf8"]:
        parser = argparse.ArgumentParser(description="Repair only catalog.json from an already applied capture batch; pixels and batch inputs remain unchanged")
        parser.add_argument("batch_directory", type=Path)
        parser.add_argument("--apply", action="store_true")
        args = parser.parse_args(sys.argv[2:])
        print(json.dumps(repair_catalog_utf8(args.batch_directory, args.apply), indent=2))
        return
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan", type=Path)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--allow-partial", action="store_true")
    parser.add_argument("--apply", action="store_true", help="Byte-copy validated JPEGs and update only their capture/review catalog fields")
    args = parser.parse_args()
    prepared = prepare(load(args.plan), load(args.manifest), load(REPO / "catalog.json"), args.manifest.resolve(), args.allow_partial)
    updated = validate_with_existing_pipeline(prepared, load(REPO / "catalog.json"))
    if args.apply:
        apply(prepared, updated)
    print(json.dumps({"status": "applied-byte-identically" if args.apply else "validated-no-files-written", "clips": len(prepared["observations"]["options"]), "batchId": prepared["batchId"]}))


if __name__ == "__main__":
    main()
