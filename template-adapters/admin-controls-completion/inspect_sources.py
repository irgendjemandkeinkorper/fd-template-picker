"""Read-only ownership/readability inventory from retained public DOM evidence."""
from __future__ import annotations

import hashlib
import json
import pathlib
import re
from html.parser import HTMLParser

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
WORKSPACE = REPO.parent


class PaintParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paints = []
        self.caption_roles = []
        self.odd_cards = []
        self.authored_links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        style = attrs.get("style", "")
        if re.search(r"(?:^|;)\s*(?:color|background(?:-color)?|fill|stroke|border(?:-color)?)\s*:", style, re.I):
            self.paints.append({"tag": tag, "class": attrs.get("class", ""), "style": style})
        elif re.search(r"--generic-form-field-", style):
            self.paints.append({"tag": tag, "class": attrs.get("class", ""), "style": style, "ownership": "Native generated form custom properties; bridge with scoped template CSS rather than editing generated HTML."})
        if any(x in classes for x in ("hero-title", "hero-subtitle", "mobile-hero-title", "mobile-hero-subtitle")):
            self.caption_roles.append({"tag": tag, "class": attrs.get("class", "")})
        if "od-club__tier" in classes:
            self.odd_cards.append({"tag": tag, "class": attrs.get("class", "")})
        if tag == 'a' and attrs.get('href') and classes and not any(c in classes for c in ('q-btn', 'link', 'cursor-pointer')):
            self.authored_links.append({'class': ' '.join(classes), 'href': attrs['href']})


def inspect(path):
    observed = json.loads(path.read_text(encoding="utf-8-sig"))
    variants = []
    for variant in observed:
        sections = []
        for section in variant["sections"]:
            parser = PaintParser()
            parser.feed(section["html"])
            sections.append({
                "publishedClass": next((c for c in section["className"].split() if c.startswith("section-")), section["className"].split()[0]),
                "hasNativeHero": "carousel-hero-slide" in section["html"],
                "captionRoles": parser.caption_roles,
                "inlinePaints": parser.paints,
                "oddMembershipCards": parser.odd_cards,
                "authoredLinks": parser.authored_links,
            })
        variants.append({"variant": variant["variant"], "capturedAt": variant["capturedAt"], "sections": sections})
    return {"schema": "fd-admin-controls-source-dom/v1", "source": str(path), "sourceSha256": hashlib.sha256(path.read_bytes()).hexdigest(), "scope": "Retained public DOM; native editable fields and native settings remain separate readbacks.", "variants": variants}


if __name__ == "__main__":
    result = inspect(WORKSPACE / "evidence/admin-controls-audit/live-template-styles-final.json")
    (HERE / "source-dom-inventory.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    for variant in result["variants"]:
        hero = [s for s in variant["sections"] if s["hasNativeHero"]]
        print(variant["variant"], "native heroes:", [s["publishedClass"] for s in hero], "inline paint count:", sum(len(s["inlinePaints"]) for s in variant["sections"]))
        print('  authored links:', sorted(set(a['class'] for s in variant['sections'] for a in s['authoredLinks'])))

    candidates = {}
    for path in sorted((HERE.parent / 'brand-tokens/proposals').glob('*.before.css')):
        css = re.sub(r'/\*[\s\S]*?\*/', '', path.read_text(encoding='utf-8'))
        entries = []
        for selector, body in re.findall(r'([^{}]+)\{([^{}]+)\}', css):
            paints = [(p.strip(), v.strip()) for p, v in re.findall(r'((?:background(?:-color)?)|(?:color))\s*:\s*([^;{}]+)', body)]
            if paints and re.search(r'(?:q-btn|__cta|__book|\.fdp-action|\.cn-action|\.rd-)', selector):
                entries.append({'selector': selector.strip(), 'paints': paints})
        candidates[path.stem] = entries
    (HERE / 'action-paint-inventory.json').write_text(json.dumps(candidates, indent=2) + '\n', encoding='utf-8')
