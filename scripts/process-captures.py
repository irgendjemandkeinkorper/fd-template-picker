"""Crop genuine browser viewport tiles into catalog assets without altering pages.

Input is the evidence/captures.json collected from the user's Chrome session.
The output records include coverage and source selectors so an incomplete capture
can never silently be presented as a complete screenshot.
"""
from __future__ import annotations

import argparse
import json
import math
import re
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat


REPO = Path(__file__).resolve().parents[1]
WORKSPACE = REPO.parent

SLOT_LABELS = {
    "header": "Navigation", "hero": "Hero", "now-playing": "Now Playing",
    "events": "Private Parties", "food": "Food & Drink", "contact": "Contact Us",
    "find-us": "Find Us", "membership": "Membership", "gift-cards": "Gift Cards",
    "footer": "Footer", "ticket-finder": "Ticket Finder", "experience": "Cinema Experience",
    "programme": "Programme", "about": "About", "newsletter": "Newsletter",
    "visit": "Plan Your Visit", "coming-soon": "Coming Soon",
    "after-show": "After the Show", "contact-anchor": "Contact Anchor",
    "contact-channels": "Contact Channels",
}


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", str(text).lower()).strip("-")


def label_for_variant(slug):
    match = re.match(r"variant-([a-z])-(.+)", slug)
    return f"{match[1].upper()} · {match[2].replace('-', ' ').title()}" if match else slug.replace("-", " ").title()


def section_name(section):
    named = section.get("name") or section.get("componentName") or section.get("title")
    if named:
        return named
    classes = section.get("classes", "").split()
    component_class = next((c for c in classes if c.startswith("section-")), "")
    if component_class:
        component_class = re.sub(r"^section-|\-\d+$", "", component_class)
        return " - ".join(part.replace("-", " ").title() for part in component_class.split("---"))
    return " / ".join(section.get("headings", [])) or "Section"


def semantic_slot(section, index):
    if section.get("slot"):
        return section["slot"]
    # Match component classes before editorial headings: the classes preserve
    # named CMS components when the visible copy uses different language.
    classes = section.get("classes", "").lower()
    # These reviewed native additions have stable purpose classes. Private
    # parties retain the existing picker slot ID `events` for saved selections.
    purpose = re.search(r"\bfdp-[a-l]-(private-parties|food|membership|contact)\b", classes)
    if purpose:
        return "events" if purpose[1] == "private-parties" else purpose[1]
    if "section-private-parties-" in classes:
        return "events"
    # B's original Playbill mixes public programming and one hire item. Keep it
    # as an optional programme after adding a dedicated private-party module.
    if re.search(r"\bsection-events-b---playbill-\d+\b", classes):
        return "programme"
    if "section-contact-" in classes and "---anchor-" in classes:
        return "contact-anchor"
    if "section-contact-" in classes and "---channels-" in classes:
        return "contact-channels"
    for slot in ["gift-cards", "now-playing", "find-us", "hero", "events", "food", "contact", "membership"]:
        if f"section-{slot}-" in classes:
            return slot
    class_concepts = [
        ("hero", r"section-[a-z]-(?:intro|welcome|opening-note)-"),
        ("ticket-finder", r"section-[a-z]-(?:reserve|book-now|tickets-after-dark)-"),
        ("now-playing", r"section-[a-z]-(?:featured|today|late-lineup)-"),
        ("coming-soon", r"section-[a-z]-coming-up-"),
        ("visit", r"section-[a-z]-visit-"),
        ("experience", r"section-[a-z]-(?:stay-awhile|lounge-ritual)-"),
        ("after-show", r"section-[a-z]-one-more-"),
        ("membership", r"section-[a-z]-join-the-club-"),
    ]
    for slot, pattern in class_concepts:
        if re.search(pattern, classes):
            return slot
    text = " ".join([section_name(section), classes, section.get("text", "")]).lower()
    patterns = [
        ("gift-cards", r"gift[ -]?card|voucher|denomination"),
        ("find-us", r"find[ -]us|\bmap\b|\bdirections\b|street[ -]plate"),
        ("membership", r"membership|join[ -]the[ -]club|subscriber|member[ -]benefit|\btiers?\b"),
        ("contact", r"\bcontact\b|enquiry|\benquiries\b"),
        ("food", r"\bfood\b|\bdining\b|\bmenu\b|concessions"),
        ("events", r"\bevents?\b|private[ -]hire|private[ -]screen|playbill"),
        ("ticket-finder", r"\breserve\b|select movie|buy tickets|ticket[ -]finder|quick[ -]book"),
        ("now-playing", r"now[ -]playing|\bfeatured\b|\blineup\b|no movies here|\bfilms?\b|departure[ -]board"),
        ("hero", r"\bhero\b|\bwelcome\b|\bmarquee\b|\bintro\b"),
        ("newsletter", r"newsletter|mailing[ -]list|sign[ -]up"),
        ("experience", r"stay[ -]awhile|experience|our[ -]space|the[ -]lounge|\batmosphere\b"),
        ("programme", r"\bprogramme\b|\bprogram\b|editor[ -]picks|curated"),
        ("about", r"\babout\b|our[ -]story"),
    ]
    # The first visible content section is commonly an intro, but never force
    # later unknown sections into an unrelated existing slot.
    for slot, pattern in patterns:
        if re.search(pattern, text):
            return slot
    if index == 0:
        return "hero"
    seed = re.sub(r"^section-[a-z]-", "", classes.split()[0] if classes else section_name(section))
    return re.sub(r"-\d+$", "", slugify(seed)) or "content"


def rect_of(item):
    rect = item.get("rect") or item.get("bounds") or item
    return {"x": float(rect.get("x", 0)), "y": float(rect.get("y", rect.get("top", 0))),
            "width": float(rect.get("width", 0)), "height": float(rect.get("height", 0))}


def resolve_image(path, evidence_dir):
    candidate = Path(path)
    for source in [candidate, WORKSPACE / candidate, evidence_dir / candidate, evidence_dir / candidate.name, REPO / candidate]:
        if source.is_file():
            return source.resolve()
    raise FileNotFoundError(path)


def repeated_viewport_period(image, viewport_height, scale):
    """Find obvious repeated top viewports, not repeated colors or menu cards.

    Full-page browser captures can silently repeat a stale viewport. Dimensions
    alone still look valid. Require a detailed top band to match at two later
    multiples of the same near-viewport period before rejecting the input.
    """
    if not viewport_height:
        return None
    viewport_pixels = float(viewport_height) * scale
    band_height = min(300, max(1, round(viewport_pixels * .65)))
    first_period = max(band_height, round(viewport_pixels * .6))
    last_period = min(round(viewport_pixels * 1.6), (image.height - band_height) // 2)
    if last_period < first_period:
        return None
    sample = image.resize((min(96, image.width), image.height), Image.Resampling.LANCZOS)
    reference = sample.crop((0, 0, sample.width, band_height))
    # A uniform page background is not evidence of a repeated viewport.
    if sum(ImageStat.Stat(reference).stddev) / 3 < 16:
        return None

    def error_at(y):
        other = sample.crop((0, y, sample.width, y + band_height))
        return sum(ImageStat.Stat(ImageChops.difference(reference, other)).mean) / 3

    for period in range(first_period, last_period + 1):
        if error_at(period) <= 2 and error_at(period * 2) <= 2:
            return period
    return None


def validate_tile_image(variant, image, css_width, css_height, filename):
    """Reject dimension/scale contradictions before cropping any source pixels."""
    label = variant.get("slug") or variant.get("id") or variant.get("variant") or "variant"
    prefix = f"{label}: invalid capture {filename}: "
    if not all(math.isfinite(value) and value > 0 for value in (css_width, css_height)):
        raise ValueError(prefix + "CSS image dimensions must be positive finite numbers")
    scale_x = image.width / css_width
    expected_height = css_height * scale_x
    # Permit rounded CSS geometry and a final missing pixel, but not a browser
    # resize, stretched image or different X/Y scaling disguised as a full page.
    if abs(image.height - expected_height) > max(2, expected_height * .01):
        raise ValueError(prefix + f"inconsistent image scale (X {scale_x:.4f}, Y {image.height / css_height:.4f}); recapture at a stable viewport")
    viewport = variant.get("viewport", {})
    section_clip = variant.get("captureMethod") == "live-browser-section-clips"
    viewport_width = viewport.get("width")
    if not section_clip and viewport_width and abs(css_width - float(viewport_width)) > 2:
        raise ValueError(prefix + "tile CSS width differs from the recorded viewport; recapture without resizing")
    if variant.get("captureMethod") == "live-browser-full-page":
        period = repeated_viewport_period(image, viewport.get("height"), scale_x)
        if period:
            raise ValueError(prefix + f"repeated top viewport every {period} image pixels; use fresh overlapping viewport captures")
    elif not section_clip and viewport.get("height") and abs(css_height - float(viewport["height"])) > 2:
        raise ValueError(prefix + "tile CSS height differs from the recorded viewport; recapture without resizing")


def load_tiles(variant, evidence_dir):
    tiles = []
    for item in variant.get("tiles", []):
        filename = item.get("image") or item.get("path") or item.get("file")
        path = resolve_image(filename, evidence_dir)
        im = Image.open(path).convert("RGB")
        css_width = float(item.get("cssWidth", item.get("width", im.width)))
        requested_height = float(item.get("cssHeight", item.get("height", im.height)))
        validate_tile_image(variant, im, css_width, requested_height, filename)
        # CUA metadata rounds viewport height to an integer; its screenshot is
        # uniformly scaled. Recover the fractional height from that same scale
        # to avoid incorrectly reporting a missing final pixel at the page end.
        native_height = im.height / (im.width / css_width)
        if variant.get("captureMethod") == "live-browser-full-page":
            # Native full-page captures have uniform pixel scale. A rounded
            # scrollHeight can exceed the actual image by one bottom pixel;
            # keep that exclusion visible instead of stretching the page.
            css_height = min(requested_height, native_height)
        else:
            css_height = float(item["cssHeight"]) if item.get("cssHeight") is not None else max(requested_height, native_height)
        scale_x, scale_y = im.width / css_width, im.height / css_height
        if tiles and abs(scale_x - tiles[0]["scaleX"]) > max(.01, tiles[0]["scaleX"] * .01):
            raise ValueError(f"{variant.get('slug', 'variant')}: screenshot scale changed between viewport tiles; recapture without resizing")
        header = rect_of(variant.get("header", {}))
        # Variant F uses a fixed left sidebar. It never covers content below
        # the top edge, and the content rectangles already exclude its width.
        top_overlay = header["height"] if header["width"] > css_width * .75 else 0
        if variant.get("captureMethod") == "live-browser-section-clips":
            top_overlay = 0  # Exact document clips already exclude any overlay.
        tiles.append({**item, "imageObject": im, "resolvedPath": str(path),
                      "scrollY": float(item.get("scrollY", item.get("y", 0))),
                      "width": css_width, "height": css_height,
                      "headerHeight": item.get("headerHeight", top_overlay),
                      "scaleX": scale_x, "scaleY": scale_y})
    return sorted(tiles, key=lambda tile: tile["scrollY"])


def preflight_captures(variants, evidence_dir, variant_metadata=None):
    """Validate every input before main writes or replaces any output assets."""
    variant_metadata = variant_metadata or {}
    for variant in variants:
        slug = variant.get("slug") or variant.get("id") or variant.get("variant")
        tiles = load_tiles({**variant, **variant_metadata.get(slug, {})}, evidence_dir)
        for tile in tiles:
            tile["imageObject"].close()


def crop_section(bounds, tiles, include_header=False):
    # Round shared boundaries consistently. Fractional CSS geometry otherwise
    # creates artificial one-pixel gaps at adjacent sections and the page end.
    left, top = round(bounds["x"]), round(bounds["y"])
    right, bottom = round(bounds["x"] + bounds["width"]), round(bounds["y"] + bounds["height"])
    width, height = right - left, bottom - top
    if width <= 0 or height <= 0:
        raise ValueError(f"Non-positive screenshot rectangle: {bounds}")
    output = Image.new("RGB", (width, height), (231, 231, 231))
    covered = [False] * height
    used = []
    for tile in tiles:
        # The initial viewport contains the real header. In a later viewport a
        # fixed header overlays page pixels, so those pixels cannot be reused.
        overlay = 0 if include_header or tile["scrollY"] < 1 else float(tile.get("headerHeight", 0))
        usable_top = tile["scrollY"] + overlay
        usable_bottom = tile["scrollY"] + tile["height"]
        y0 = max(top, round(usable_top))
        y1 = min(bottom, round(usable_bottom))
        if y1 <= y0:
            continue
        runs, start = [], None
        for y in range(y0, y1):
            if not covered[y - top] and start is None:
                start = y
            if covered[y - top] and start is not None:
                runs.append((start, y)); start = None
        if start is not None:
            runs.append((start, y1))
        for start, end in runs:
            box = (round(left * tile["scaleX"]), round((start - tile["scrollY"]) * tile["scaleY"]),
                   round(right * tile["scaleX"]), round((end - tile["scrollY"]) * tile["scaleY"]))
            piece = tile["imageObject"].crop(box)
            if piece.size != (width, end - start):
                piece = piece.resize((width, end - start), Image.Resampling.LANCZOS)
            output.paste(piece, (0, start - top))
            for y in range(start, end):
                covered[y - top] = True
            used.append({"image": tile.get("image") or tile.get("path"), "scrollY": tile["scrollY"],
                         "sourceDocumentY": [start, end], "outputY": [start - top, end - top]})
    gaps, start = [], None
    for y in range(height + 1):
        missing = y < height and not covered[y]
        if missing and start is None:
            start = y
        elif not missing and start is not None:
            gaps.append([top + start, top + y]); start = None
    return output, used, gaps


def variant_clips(variant):
    clips = []
    if variant.get("header"):
        clips.append({"slot": "header", "names": ["Site header"], "sections": [], "bounds": rect_of(variant["header"])})
    for index, section in enumerate(variant.get("sections", [])):
        bounds = rect_of(section)
        slot = semantic_slot(section, index)
        name = section_name(section)
        # Related consecutive hero panels are one option, matching the earlier
        # catalog. Other sections retain their own individually linkable asset.
        if slot == "hero" and clips and clips[-1]["slot"] == slot:
            clip = clips[-1]
            clip["bounds"]["height"] = bounds["y"] + bounds["height"] - clip["bounds"]["y"]
            clip["names"].append(name); clip["sections"].append(section)
        else:
            clips.append({"slot": slot, "names": [name], "sections": [section], "bounds": bounds})
    if variant.get("footer"):
        clips.append({"slot": "footer", "names": ["Site footer"], "sections": [], "bounds": rect_of(variant["footer"])})
    return clips


def source_ids(sections):
    ids = []
    for section in sections:
        named = next((c for c in section.get("classes", "").split() if c.startswith("section-")), "")
        match = re.search(r"-(\d+)$", named)
        value = section.get("id") or (match[1] if match else None)
        if value is not None:
            ids.append(str(value))
    return ids


REVIEW_FIELDS = (
    "canonicalComponent", "componentStatus", "componentNote", "componentAuditedAt",
    "designNote", "draftSectionIds", "nativeWidgetType", "dependencies", "dependenciesStatus",
)


def reviewed_metadata(variant, clip, metadata):
    """Only carry a review that identifies these exact published source IDs.

    A screenshot or a recognizable class name alone cannot certify parity.
    Metadata may be embedded in a single captured section or supplied by a
    separately reviewed sidecar (including header/footer reviews with no IDs).
    """
    result = {}
    if len(clip["sections"]) == 1:
        section = clip["sections"][0]
        result.update({key: section[key] for key in REVIEW_FIELDS if key in section})
        if section.get("draftSectionId") is not None:
            result["draftSectionIds"] = [str(section["draftSectionId"])]
    slug = variant.get("slug") or variant.get("id") or variant.get("variant")
    ids = sorted(source_ids(clip["sections"]))
    matches = [item for item in metadata.get("options", [])
               if item.get("variant") == slug and item.get("slot", item.get("slotId")) == clip["slot"]
               and sorted(str(value) for value in item.get("sectionIds", [])) == ids]
    if len(matches) > 1:
        raise ValueError(f"Duplicate reviewed metadata: {slug}/{clip['slot']}/{ids}")
    if matches:
        result.update({key: matches[0][key] for key in REVIEW_FIELDS if key in matches[0]})
    if result.get("componentStatus") and result["componentStatus"] not in ("present", "partial", "missing", "unverified"):
        raise ValueError(f"Invalid component status: {slug}/{clip['slot']}")
    return result


def capture_variants(data):
    variants = data if isinstance(data, list) else data.get("variants", data.get("captures", []))
    if isinstance(variants, dict):
        return [{"slug": slug, **variant} for slug, variant in variants.items()]
    return variants


def write_contact_sheet(options, path):
    by_variant = {}
    for option in options:
        by_variant.setdefault(option["variant"], []).append(option)
    if not by_variant:
        return
    thumb_width, thumb_height, padding = 300, 190, 16
    cols = 3
    rows = math.ceil(len(by_variant) / cols)
    sheet = Image.new("RGB", (cols * (thumb_width + 2 * padding), rows * (thumb_height + 67)), "#f4f2ef")
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 18)
        small = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 13)
    except OSError:
        font = small = ImageFont.load_default()
    for index, (_, records) in enumerate(by_variant.items()):
        x, y = index % cols * (thumb_width + 2 * padding) + padding, index // cols * (thumb_height + 67) + padding
        preferred = next((o for o in records if o["slot"] == "hero" and o["image"]), next((o for o in records if o["image"]), None))
        if preferred is None:
            continue
        im = Image.open(REPO / preferred["image"]).convert("RGB")
        im.thumbnail((thumb_width, thumb_height), Image.Resampling.LANCZOS)
        draw.rectangle((x, y, x + thumb_width, y + thumb_height), fill="#ddd9d4")
        sheet.paste(im, (x + (thumb_width - im.width) // 2, y))
        draw.text((x, y + thumb_height + 5), preferred["variantLabel"], font=font, fill="#191918")
        visible = sum(bool(record["image"]) for record in records)
        draw.text((x, y + thumb_height + 30), f"{visible} visible section captures", font=small, fill="#565451")
    sheet.save(path, quality=90)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", nargs="?", default=str(WORKSPACE / "evidence" / "captures.json"))
    parser.add_argument("--output", default=str(WORKSPACE / "evidence" / "captured-options.json"))
    parser.add_argument("--baseline", help="Preserve unchanged variants from this earlier capture manifest.")
    parser.add_argument("--metadata", help="Reviewed metadata sidecar matched by variant, slot, and exact published section IDs.")
    parser.add_argument("--validate-only", action="store_true", help="Check every input image without writing screenshots, a manifest or a contact sheet.")
    args = parser.parse_args()
    input_path = Path(args.input)
    data = json.loads(input_path.read_text(encoding="utf-8-sig"))
    variants = capture_variants(data)
    if args.baseline:
        baseline = json.loads(Path(args.baseline).read_text(encoding="utf-8-sig"))
        combined = {item.get("slug") or item.get("id") or item.get("variant"): item for item in capture_variants(baseline)}
        combined.update({item.get("slug") or item.get("id") or item.get("variant"): item for item in variants})
        variants = list(combined.values())
    metadata = json.loads(Path(args.metadata).read_text(encoding="utf-8-sig")) if args.metadata else {}
    expected_site = metadata.get("sourceSite", {}).get("url", "").rstrip("/")
    if expected_site and any(not (item.get("sourceUrl") or item.get("url", "")).startswith(expected_site + "/") for item in variants):
        raise ValueError("Capture metadata belongs to another source site.")
    variant_metadata = {item["id"]: item for item in metadata.get("variants", [])}
    variants = sorted(variants, key=lambda variant: variant.get("slug") or variant.get("id") or variant.get("variant"))
    if metadata.get("requireAllReviewedOptions"):
        captured_keys = set()
        for variant in variants:
            slug = variant.get("slug") or variant.get("id") or variant.get("variant")
            for clip in variant_clips(variant):
                captured_keys.add((slug, clip["slot"], tuple(sorted(source_ids(clip["sections"])))))
        absent = [item for item in metadata.get("options", []) if
                  (item["variant"], item.get("slot", item.get("slotId")), tuple(sorted(str(value) for value in item.get("sectionIds", [])))) not in captured_keys]
        if absent:
            raise ValueError("Reviewed published sources are absent from the capture manifest: " +
                             ", ".join(f"{item['variant']}/{item.get('slot', item.get('slotId'))}/{item.get('sectionIds', [])}" for item in absent))
    # A late invalid variant must not leave earlier screenshots replaced by a
    # half-completed ingestion. Preflight all files, then crop the valid set.
    preflight_captures(variants, input_path.parent, variant_metadata)
    if args.validate_only:
        print(f"Validated {len(variants)} capture manifests; no output files were written.", flush=True)
        return
    options = []
    observed_variants = []
    for variant in variants:
        slug = variant.get("slug") or variant.get("id") or variant.get("variant")
        variant = {**variant, **variant_metadata.get(slug, {})}
        tiles = load_tiles(variant, input_path.parent)
        if not tiles:
            print(f"SKIP {slug}: no viewport tiles", flush=True)
            continue
        observed_variants.append({"id": slug, "pageId": variant.get("pageId"),
            "pageTitle": variant.get("title") or variant.get("pageTitle"),
            "sourceUrl": variant.get("sourceUrl") or variant.get("url"),
            "sectionCount": variant.get("sectionCount", len(variant.get("sections", []))),
            **{key: variant[key] for key in ("draftId", "adminUrl", "sourceVerifiedAt", "renderedSectionCount") if key in variant}})
        for clip in variant_clips(variant):
            # A single semantic slot may legitimately have multiple panels.
            # Keep distinct options when they are not consecutive hero panels.
            same_slot = sum(o["variant"] == slug and o["slot"] == clip["slot"] for o in options)
            suffix = f"-{same_slot + 1}" if same_slot else ""
            image_path = Path("screenshots") / clip["slot"] / f"{slug}{suffix}.jpg"
            excluded = []
            capture_note = None
            if clip["bounds"]["height"] < 0.5:
                image, evidence, gaps = None, [], []
            else:
                image, evidence, gaps = crop_section(clip["bounds"], tiles, clip["slot"] == "header")
                # A fractional document bottom can extend one rounded CSS pixel
                # beyond the native image. Keep a truthful one-pixel footer
                # crop; retain original DOM bounds and disclose the exclusion.
                rounded_bottom = round(clip["bounds"]["y"] + clip["bounds"]["height"])
                if clip["slot"] == "footer" and gaps == [[rounded_bottom - 1, rounded_bottom]]:
                    excluded = gaps
                    gaps = []
                    image = image.crop((0, 0, image.width, image.height - 1))
                    capture_note = "The final 1 CSS pixel of the source footer was outside the captured browser image and is omitted. Original source bounds are retained."
                target = REPO / image_path
                target.parent.mkdir(parents=True, exist_ok=True)
                image.save(target, quality=91, subsampling=0)
            selectors = []
            for section in clip["sections"]:
                classes = section.get("classes", "").split()
                named = next((c for c in classes if c.startswith("section-")), classes[0] if classes else None)
                published_id = re.search(r"-(\d+)$", named or "")
                source_id = section.get("id") or (published_id[1] if published_id else None)
                selectors.append({"id": str(source_id) if source_id is not None else None, "classes": section.get("classes", ""),
                                  "selector": f".{named}" if named else section.get("selector"),
                                  "headings": section.get("headings", [])})
            option = {"id": f"{clip['slot']}--{slug}{suffix}", "slot": clip["slot"],
                      "slotLabel": SLOT_LABELS.get(clip["slot"], clip["slot"].replace("-", " ").title()),
                      "variant": slug, "variantLabel": variant.get("label") or variant.get("variantLabel") or label_for_variant(slug),
                      "name": " + ".join(clip["names"]), "components": clip["names"],
                      "image": image_path.as_posix() if image else None,
                      "width": image.width if image else round(clip["bounds"]["width"]), "height": image.height if image else 0,
                      "sourceUrl": variant.get("sourceUrl") or variant.get("url"), "sharedBy": [slug],
                      "sourcePageTitle": variant.get("title"), "pageId": variant.get("pageId"),
                      "sectionIds": [s["id"] for s in selectors if s["id"]],
                      "captureStatus": "not-rendered" if image is None else "partial" if gaps else "captured-live",
                      "captureMethod": variant.get("captureMethod", "browser-viewport-tiles"),
                      "capturedAt": variant.get("capturedAt") or (data.get("capturedAt") if isinstance(data, dict) else None),
                      "sectionSelectors": selectors, "sourceBounds": clip["bounds"],
                      "captureBounds": {"x": round(clip["bounds"]["x"]), "y": round(clip["bounds"]["y"]),
                                        "width": image.width if image else round(clip["bounds"]["width"]), "height": image.height if image else 0},
                      "captureEvidence": evidence, "missingDocumentY": gaps,
                      "excludedDocumentY": excluded,
                      "appearanceAltered": False, "sampleDataInjected": False}
            option.update(reviewed_metadata(variant, clip, metadata))
            if image is None:
                option["captureNote"] = "This published section currently renders at zero height, so no visible screenshot is available."
            elif capture_note:
                option["captureNote"] = capture_note
            options.append(option)
            print(f"{slug}: {clip['slot']} {option['width']}x{option['height']} {option['captureStatus']}", flush=True)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps({"generatedAt": datetime.now(timezone.utc).isoformat(),
                                     "sourceEvidence": str(input_path),
                                     "baselineEvidence": args.baseline, "reviewedMetadata": args.metadata,
                                     "variants": observed_variants, "options": options}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_contact_sheet(options, output_path.parent / "variant-contact-sheet.jpg")
    print(f"Wrote {len(options)} options to {output_path}", flush=True)


if __name__ == "__main__":
    main()
