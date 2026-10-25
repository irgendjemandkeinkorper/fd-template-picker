"""Build review-only, fully scoped color migrations from observed public CSS.

These are compiled CSS proposals, not native Admin field exports. They must not
be pasted into Page Custom CSS, where INDY would add a second page prefix.
Nothing in this script contacts INDY or changes a published source.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
WORKSPACE = REPO.parent
PROFILES = json.loads((HERE / "profiles.json").read_text(encoding="utf-8"))
DECLARATION = re.compile(r"([\w-]+)(\s*:\s*)([^;{}]*)(?=[;}])")
COLOR = re.compile(r"#[0-9a-fA-F]{3,8}\b|rgba?\(\s*[\d.]+(?:\s*,\s*[\d.]+){2,3}\s*\)")
COMMENT = re.compile(r"/\*[\s\S]*?\*/")

ROLES = {
    "primary": "var(--q-primary)",
    "secondary": "var(--q-secondary)",
    "dark": "var(--q-dark)",
    "background": "var(--q-background)",
    "header": "var(--q-header)",
    "accent": "var(--q-accent)",
    "warning": "var(--q-warning)",
    # Foregrounds are explicit candidates, not a promise for arbitrary palettes.
    "on-primary": "var(--q-header)",
    "on-secondary": "var(--q-background)",
    "on-accent": "var(--q-dark)",
    "surface-dark": "color-mix(in oklab, var(--q-primary) 12%, var(--q-dark))",
    "muted-on-dark": "color-mix(in oklab, var(--q-background) 80%, var(--q-dark))",
    "muted-on-paper": "color-mix(in oklab, var(--q-dark) 80%, var(--q-background))",
    "line-on-paper": "color-mix(in oklab, var(--q-dark) 28%, var(--q-background))",
    "line-on-dark": "color-mix(in oklab, var(--q-background) 30%, var(--q-dark))",
    "paper-muted": "color-mix(in oklab, var(--q-dark) 5%, var(--q-background))",
    "primary-tint": "color-mix(in oklab, var(--q-primary) 16%, var(--q-background))",
    "secondary-tint": "color-mix(in oklab, var(--q-secondary) 14%, var(--q-background))",
    "accent-tint": "color-mix(in oklab, var(--q-accent) 20%, var(--q-background))",
    "dark-tint": "color-mix(in oklab, var(--q-dark) 10%, var(--q-background))",
}


def normalize_color(value: str) -> tuple[str, float]:
    """Return an RGB hex identity and opacity without inferring its role."""
    if value.startswith("#"):
        value = value.lower()
        if len(value) in (4, 5):
            value = "#" + "".join(c * 2 for c in value[1:])
        alpha = int(value[7:9], 16) / 255 if len(value) == 9 else 1
        return value[:7], alpha
    values = [float(x) for x in re.findall(r"[\d.]+", value)]
    return "#" + "".join(f"{int(x):02x}" for x in values[:3]), values[3] if len(values) == 4 else 1


def migrate_css(css: str, letter: str) -> tuple[str, dict]:
    profile = PROFILES[letter]
    unknown: dict[str, int] = {}
    replacements: dict[str, dict] = {}
    removed_demo = []
    original_comments = []

    def hide_comment(match):
        original_comments.append(match.group())
        return f"/*__FD_COMMENT_{len(original_comments)-1}__*/"

    working = COMMENT.sub(hide_comment, css)

    def declaration(match):
        prop, separator, value = match.groups()
        # Delete the actual same-scope demo override, retaining native aliases.
        if letter in "DE" and prop.startswith("--v-") and COLOR.fullmatch(value.strip()):
            removed_demo.append({"property": prop, "oldValue": value.strip()})
            return ""

        def color(found):
            literal = found.group()
            identity, alpha = normalize_color(literal)
            role = profile["literalToRole"].get(identity)
            if role is None:
                unknown[identity] = unknown.get(identity, 0) + 1
                return literal
            replacement = f"var(--fd-{role})"
            if alpha < 1:
                percentage = f"{alpha * 100:.4f}".rstrip("0").rstrip(".")
                replacement = f"color-mix(in srgb, {replacement} {percentage}%, transparent)"
            key = f"{literal} -> {replacement}"
            entry = replacements.setdefault(key, {"literal": literal, "role": role, "replacement": replacement, "count": 0})
            entry["count"] += 1
            return replacement

        return prop + separator + COLOR.sub(color, value)

    working = DECLARATION.sub(declaration, working)
    for index, comment in enumerate(original_comments):
        working = working.replace(f"/*__FD_COMMENT_{index}__*/", comment)
    return working, {"replacements": list(replacements.values()), "unknownLiteralColors": unknown, "removedDemoDeclarations": removed_demo}


def role_contract(scope: str) -> str:
    # Defining aliases on the page AND sections covers native section-level roots.
    selectors = f"{scope},\n{scope} [data-test-id=\"section-content\"]"
    lines = ["/* Candidate role contract. Pair checks in manifest.json are release gates. */", selectors + " {"]
    lines += [f"  --fd-{role}: {value};" for role, value in ROLES.items()]
    return "\n".join(lines + ["}", ""])


def explicit_role_splits(scope: str, letter: str) -> str:
    """Resolve reused source paint with narrow semantic selectors, not hue guesses."""
    if letter == "D":
        return f"""
/* Apply atomically with odd-membership-role-patch.json. Tilts remain unchanged. */
{scope} [class*="section-membership-d---loyalty-card-"] .od-club__tier.fd-tier-primary {{ background:var(--fd-primary-tint); color:var(--fd-dark); }}
{scope} [class*="section-membership-d---loyalty-card-"] .od-club__tier.fd-tier-secondary {{ background:var(--fd-secondary-tint); color:var(--fd-dark); }}
{scope} [class*="section-membership-d---loyalty-card-"] .od-club__tier.fd-tier-dark {{ background:var(--fd-dark-tint); color:var(--fd-dark); }}
{scope} [class*="section-membership-d---loyalty-card-"] .od-club__cta {{ background:var(--fd-primary); color:var(--fd-on-primary); }}
"""
    if letter == "G":
        return f"""
/* Amber source paint is split into CTA, featured card and ornamental roles. */
{scope} [class*="section-hero-g---poster-block-"] .q-btn.bg-primary {{ background:var(--fd-primary)!important; color:var(--fd-on-primary)!important; }}
{scope} [class*="section-hero-g---poster-block-"] .q-btn.bg-primary :is(.q-btn__content,span) {{ color:var(--fd-on-primary)!important; }}
{scope} .fdp-g-membership .fdp-action {{ background:var(--fd-primary); color:var(--fd-on-primary); }}
{scope} .fdp-g-membership .fdp-card:nth-child(2) {{ background:var(--fd-secondary); color:var(--fd-on-secondary); }}
{scope} .fdp-g-membership .fdp-card:nth-child(2) :is(h3,p,.fdp-number) {{ color:var(--fd-on-secondary); }}
{scope} .fdp-g-membership .fdp-card:nth-child(3) {{ background:var(--fd-primary); color:var(--fd-on-primary); }}
{scope} .fdp-g-membership .fdp-card:nth-child(3) :is(h3,p,.fdp-number) {{ color:var(--fd-on-primary); }}
"""
    if letter == "I":
        return f"""
/* Ma retains its transparent underlined action, rather than a filled button. */
{scope} .fdp-i-membership .fdp-action {{ background:transparent; color:var(--fd-dark); border-bottom-color:var(--fd-primary); }}
"""
    if letter in "BHJK":
        # Existing local editorial actions are solid fills, unlike ordinary links.
        return f"""
/* Editorial action foreground is independent of surrounding paper copy. */
{scope} [class*="fdp-{letter.lower()}-"] .fdp-action {{ background:var(--fd-primary); color:var(--fd-on-primary); }}
"""
    return ""


def geometry_declarations(css):
    properties = {"transform", "transform-origin", "clip-path", "font-family", "font-size", "font-weight", "font-style", "line-height", "writing-mode", "grid-template-columns", "grid-template-rows", "gap", "padding", "margin", "width", "height", "min-height", "max-width", "object-fit", "object-position", "filter"}
    return [(p, v.strip()) for p, _, v in DECLARATION.findall(COMMENT.sub("", css)) if p in properties]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=pathlib.Path, default=WORKSPACE / "evidence/admin-controls-audit/live-template-styles-final.json")
    parser.add_argument("--k-source", type=pathlib.Path, default=WORKSPACE / "evidence/admin-controls-audit/k-all-styles.json")
    parser.add_argument("--output", type=pathlib.Path, default=HERE / "proposals")
    args = parser.parse_args()
    observed = json.loads(args.source.read_text(encoding="utf-8-sig"))
    k_observed = json.loads(args.k_source.read_text(encoding="utf-8-sig"))
    args.output.mkdir(parents=True, exist_ok=True)
    manifest = {
        "schema": "fd-brand-token-migration-proposals/v1",
        "status": "local-review-only-not-applied",
        "coverageScope": "page-and-section-compiled-css-only",
        "excludedScopes": ["Shared Site Theme Custom CSS", "Global typography and framework styles", "Site-owned header/navigation paint, except incidental existing page-level navigation selectors"],
        "headerMigrationStatus": "Not prepared: literal A/B/C and shared G-L Site Theme/header paint remains a separate migration gate; D/E/F native-token navigation still inherits shared theme rules.",
        "source": str(args.source.relative_to(WORKSPACE)).replace("\\", "/"),
        "sourceSha256": hashlib.sha256(args.source.read_bytes()).hexdigest(),
        "compiledCssWarning": "These retain observed page/section scopes. They are replacement/proof artifacts, not native Admin field exports. Pasting into Page Custom CSS would double-prefix selectors. Split and map to exact editable fields before installation.",
        "paletteBoundary": "Mappings are semantic design decisions, not nearest-color substitutions. Neutral white/black in existing color-mix recipes remain fixed design neutrals, not client brand colors.",
        "contrastGates": [
            {"pair": "Background / Dark", "currentRatio": 12.01, "normalText": "pass"},
            {"pair": "Header / Primary", "currentRatio": 5.05, "normalText": "pass-current-palette-only"},
            {"pair": "Background / Secondary", "currentRatio": 3.94, "normalText": "fail", "blocks": "G solid Secondary highlighted membership card"},
            {"pair": "Primary / Secondary", "currentRatio": 1.35, "normalText": "fail"},
            {"pair": "Background / Primary", "currentRatio": 2.91, "normalText": "fail", "blocks": "Any inherited Background text on a Primary action not explicitly split"},
            {"pair": "Dark / Primary", "currentRatio": 4.13, "normalText": "fail"},
            {"pair": "All tints, muted text, image overlays and native states", "normalText": "requires-rendered-test", "note": "No guarantee from a parent role or base-pair pass."},
        ],
        "variants": [],
        "releaseGates": ["Resolve every unknown color and every failed actual foreground/background pairing.", "Read current native editable fields and map compiled blocks back to page versus section ownership.", "Apply Odd stable card role classes with its CSS, retaining original body information and tilts.", "Verify native field/media/CTA/product edits without CSS changes.", "Use a second distinct native brand palette and inspect all templates on desktop/mobile.", "Prove a destination Library copy/unlink without source-ID selector dependence."]
    }
    for variant in observed:
        letter = variant["variant"].split("-")[1].upper()
        scope = "." + next(x for x in variant["pageClass"].split() if x.startswith("page-"))
        if letter == "K":
            raw = "\n".join(rule for sheet in k_observed["sheets"] for rule in sheet.get("rules", []) if "fdp-k" in rule or "section-" in rule)
            source_kind = "current-cssom-section-rules"
        else:
            raw = "\n".join(x for x in variant["styles"] if "@import" not in x)
            source_kind = "current-compiled-page-and-section-css"
        transformed, report = migrate_css(raw, letter)
        assert geometry_declarations(raw) == geometry_declarations(transformed), letter + " geometry changed"
        # K native sections are not descendants of their own root: provide roles
        # at the page too so its scoped section rules inherit the same contract.
        proposed = role_contract(scope) + transformed + "\n" + explicit_role_splits(scope, letter)
        slug = variant["variant"]
        (args.output / f"{slug}.before.css").write_text(raw.rstrip("\r\n") + "\n", encoding="utf-8")
        (args.output / f"{slug}.proposed.css").write_text(proposed.rstrip("\r\n") + "\n", encoding="utf-8")
        ids = sorted(set(re.findall(r"(?:section-[\w-]+-\d+|page-[\w-]+-\d+)", raw)))
        assert all(identity in proposed for identity in ids), letter + " identity changed"
        manifest["variants"].append({
            "variant": slug, "scope": scope, "sourceKind": source_kind, "capturedAt": variant["capturedAt"],
            "before": f"proposals/{slug}.before.css", "proposed": f"proposals/{slug}.proposed.css",
            "sourceCharacters": len(raw), "identitiesRetained": ids, "geometryPreserved": True,
            "mappingStatus": "complete-literal-substitution" if not report["unknownLiteralColors"] else "blocked-unmapped-literal",
            "renderedContrastStatus": "unverified-after-migration", "nativeFieldInstallationStatus": "not-mapped-to-all-current-editable-fields",
            "reviewNotes": PROFILES[letter]["reviewNotes"], **report,
        })
    manifest["releaseGates"].insert(0, "Prepare and verify the separate shared Site Theme/header paint migration; preserve the approved Concrete navigation repair.")
    manifest["rebasedRepair"] = {"variant": "variant-i-ma", "source": "Final published 2026-10-25 public CSS capture", "preserved": ["Native Light Text class behavior", "Desktop and mobile caption selectors", "88% native Dark backdrop", "Text shadow", "Positive 24px desktop caption offsets"], "siteThemeExcluded": "Concrete header repair belongs to excluded shared Site Theme CSS and is not replaced by these proposals."}
    manifest["summary"] = {"variants": len(manifest["variants"]), "coverageScope": "page-and-section-compiled-css-only", "completeLiteralSubstitutions": sum(not x["unknownLiteralColors"] for x in manifest["variants"]), "unmappedLiteralColors": sorted({c for x in manifest["variants"] for c in x["unknownLiteralColors"]}), "sharedSiteThemeOrHeaderMigrationsPrepared": 0, "published": 0, "certifiedForClientUse": 0}
    (HERE / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(manifest["summary"], indent=2))


if __name__ == "__main__":
    main()
