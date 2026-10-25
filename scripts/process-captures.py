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

from PIL import Image, ImageDraw, ImageFont


REPO = Path(__file__).resolve().parents[1]
WORKSPACE = REPO.parent

SLOT_LABELS = {
    "header": "Header", "hero": "Hero", "now-playing": "Now Playing",
    "events": "Events", "food": "Food & Drink", "contact": "Contact",
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


def load_tiles(variant, evidence_dir):
    tiles = []
    for item in variant.get("tiles", []):
        filename = item.get("image") or item.get("path") or item.get("file")
        path = resolve_image(filename, evidence_dir)
        im = Image.open(path).convert("RGB")
        css_width = float(item.get("width", im.width))
        # CUA metadata rounds viewport height to an integer; its screenshot is
        # uniformly scaled. Recover the fractional height from that same scale
        # to avoid incorrectly reporting a missing final pixel at the page end.
        css_height = max(float(item.get("height", im.height)), im.height / (im.width / css_width))
        scale_x, scale_y = im.width / css_width, im.height / css_height
        header = rect_of(variant.get("header", {}))
        # Variant F uses a fixed left sidebar. It never covers content below
        # the top edge, and the content rectangles already exclude its width.
        top_overlay = header["height"] if header["width"] > css_width * .75 else 0
        tiles.append({**item, "imageObject": im, "resolvedPath": str(path),
                      "scrollY": float(item.get("scrollY", item.get("y", 0))),
                      "width": css_width, "height": css_height,
                      "headerHeight": item.get("headerHeight", top_overlay),
                      "scaleX": scale_x, "scaleY": scale_y})
    return sorted(tiles, key=lambda tile: tile["scrollY"])


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
    args = parser.parse_args()
    input_path = Path(args.input)
    data = json.loads(input_path.read_text(encoding="utf-8-sig"))
    variants = data if isinstance(data, list) else data.get("variants", data.get("captures", []))
    if isinstance(variants, dict):
        variants = [{"slug": slug, **variant} for slug, variant in variants.items()]
    variants = sorted(variants, key=lambda variant: variant.get("slug") or variant.get("id") or variant.get("variant"))
    options = []
    for variant in variants:
        slug = variant.get("slug") or variant.get("id") or variant.get("variant")
        tiles = load_tiles(variant, input_path.parent)
        if not tiles:
            print(f"SKIP {slug}: no viewport tiles", flush=True)
            continue
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
                # The final A footer extends one rounded CSS pixel beyond the
                # captured document bottom. Keep a truthful one-pixel crop;
                # retain original DOM bounds and disclose the exact exclusion.
                rounded_bottom = round(clip["bounds"]["y"] + clip["bounds"]["height"])
                if slug == "variant-a-circuit" and clip["slot"] == "footer" and gaps == [[rounded_bottom - 1, rounded_bottom]]:
                    excluded = gaps
                    gaps = []
                    image = image.crop((0, 0, image.width, image.height - 1))
                    capture_note = "The final 1 CSS pixel of the source footer was outside the captured viewport and is omitted. Original source bounds are retained."
                target = REPO / image_path
                target.parent.mkdir(parents=True, exist_ok=True)
                image.save(target, quality=91, subsampling=0)
            selectors = []
            for section in clip["sections"]:
                classes = section.get("classes", "").split()
                named = next((c for c in classes if c.startswith("section-")), classes[0] if classes else None)
                published_id = re.search(r"-(\d+)$", named or "")
                selectors.append({"id": section.get("id") or (published_id[1] if published_id else None), "classes": section.get("classes", ""),
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
                      "captureMethod": "browser-viewport-tiles",
                      "capturedAt": variant.get("capturedAt") or (data.get("capturedAt") if isinstance(data, dict) else None),
                      "sectionSelectors": selectors, "sourceBounds": clip["bounds"],
                      "captureBounds": {"x": round(clip["bounds"]["x"]), "y": round(clip["bounds"]["y"]),
                                        "width": image.width if image else round(clip["bounds"]["width"]), "height": image.height if image else 0},
                      "captureEvidence": evidence, "missingDocumentY": gaps,
                      "excludedDocumentY": excluded,
                      "appearanceAltered": False, "sampleDataInjected": False}
            if image is None:
                option["captureNote"] = "This published section currently renders at zero height, so no visible screenshot is available."
            elif capture_note:
                option["captureNote"] = capture_note
            options.append(option)
            print(f"{slug}: {clip['slot']} {option['width']}x{option['height']} {option['captureStatus']}", flush=True)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps({"generatedAt": datetime.now(timezone.utc).isoformat(),
                                     "sourceEvidence": str(input_path), "options": options}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_contact_sheet(options, output_path.parent / "variant-contact-sheet.jpg")
    print(f"Wrote {len(options)} options to {output_path}", flush=True)


if __name__ == "__main__":
    main()
