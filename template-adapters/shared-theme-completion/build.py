"""Prepare the site-owned theme/header migration without changing INDY."""
from pathlib import Path
import difflib
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
SOURCE = REPO / "evidence/component-controls-repairs/site-theme-after.css"
VARIANTS = ["a-circuit", "b-rep", "c-late", "d-odd", "e-grid", "f-concrete", "g-cut", "h-storybook", "i-ma", "j-box-office", "k-clubhouse", "l-midnight-lounge"]


def scope(variants, body=False):
    members = ", ".join(f'[class*="page-variant-{v}-"]' for v in variants)
    return f'body.site-170:has({members})' if body else f'body.site-170 .q-layout:has({members})'


def prepare(source):
    # These boundaries exclude the original Parlor and retired A/B/C nav pages.
    start = source.index("/* NOCTURNE NAV VARIANTS")
    end = source.index("/* REVIEW PROPOSAL ONLY", start)
    before, active, after = source[:start], source[start:end], source[end:]
    replacements = {
        "#08080a": "var(--q-dark)",
        "#cfc4b2": "var(--q-background)",
        "#a34b3c": "var(--q-primary)",
        "#f5f0e6": "var(--q-background)",
        "#1c1c21": "var(--q-dark)",
        "#571726": "var(--q-dark)",
        "#bf9b45": "var(--q-background)",
    }
    counts = {}
    for literal, role in replacements.items():
        active, counts[literal] = re.subn(re.escape(literal), role, active, flags=re.I)
    functional = {
        "rgba(232,223,209,.12)": "color-mix(in srgb, var(--q-background) 12%, transparent)",
        "rgba(20,20,24,.14)": "color-mix(in srgb, var(--q-dark) 14%, transparent)",
        # A translucent header cannot guarantee contrast on arbitrary images.
        "rgba(8,8,10,.55)": "var(--q-dark)",
        "rgba(191,155,69,.55)": "color-mix(in srgb, var(--q-secondary) 55%, transparent)",
    }
    for literal, role in functional.items():
        assert literal in active, literal
        counts[literal] = active.count(literal)
        active = active.replace(literal, role)
    # Native Header/Accent are deliberately not additional branding dependencies.
    counts["var(--q-header)"] = active.count("var(--q-header)")
    counts["var(--q-accent)"] = active.count("var(--q-accent)")
    active = active.replace("var(--q-header)", "var(--q-dark)")
    active = active.replace("var(--q-accent)", "var(--q-secondary)")
    for old in (
        "main .q-btn.bg-primary{background:var(--q-primary) !important;color:var(--q-background) !important;}",
        "main .q-btn.bg-primary{background:transparent !important;color:var(--q-dark) !important;}",
        "main .q-btn.bg-primary{background:transparent !important;color:var(--q-background) !important;}",
    ):
        assert active.count(old) == 1, old
        active = active.replace(old, "main .q-btn.bg-primary{background:var(--fd-primary-tint) !important;color:var(--q-dark) !important;}")
    if re.search(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(", re.sub(r"/\*.*?\*/", "", active, flags=re.S)):
        raise ValueError("Unmapped literal color in active A-F theme rules; review before generating")
    # Fence the pre-existing D/E/F rules explicitly to this authorized Site.
    active = active.replace('.q-layout:has([class*="page-variant-', 'body.site-170 .q-layout:has([class*="page-variant-')
    body = scope(VARIANTS, body=True)
    layout = scope(VARIANTS)
    standard = scope(VARIANTS[6:])
    dark_header = scope([VARIANTS[i] for i in [0, 2, 4, 5, 6, 7, 8, 9, 10, 11]])
    light_header = scope([VARIANTS[1], VARIANTS[3]])
    primary_ctas = ",\n".join([
        'body.site-170 .q-layout:has(.page-variant-a-circuit-5659) header.consumer-header .row.menu .list-complete-item:last-child',
        'body.site-170 .q-layout:has([class*="page-variant-d-odd-"]) header.consumer-header .row.menu .list-complete-item:last-child a.q-btn',
        'body.site-170 .q-layout:has([class*="page-variant-e-grid-"]) header.consumer-header .row.menu .list-complete-item:last-child a.q-btn',
        'body.site-170 .q-layout:has([class*="page-variant-f-concrete-"]) header.consumer-header .row.menu .list-complete-item:last-child a.q-btn',
    ])
    primary_copy = ",\n".join([
        'body.site-170 .q-layout:has(.page-variant-a-circuit-5659) header.consumer-header .row.menu .list-complete-item:last-child a :is(.q-btn__content, span)',
        'body.site-170 .q-layout:has([class*="page-variant-d-odd-"]) header.consumer-header .row.menu .list-complete-item:last-child a.q-btn :is(.q-btn__content, span)',
        'body.site-170 .q-layout:has([class*="page-variant-e-grid-"]) header.consumer-header .row.menu .list-complete-item:last-child a.q-btn :is(.q-btn__content, span)',
        'body.site-170 .q-layout:has([class*="page-variant-f-concrete-"]) header.consumer-header .row.menu .list-complete-item:last-child a.q-btn :is(.q-btn__content, span)',
    ])
    patch = f'''/* TEMPLATE ADMIN COLOR CONTRACT — A through L only.
   US-BETA / INDY Demo / Adam Template Testing 2 (site-170).
   Header and decorative paint use Primary, Secondary, Dark and Background.
   Text uses the Dark/Background pair; brand fills are fixed derived tints.
   Do not edit this CSS when changing a client's native Theme & Style colors. */
{body} {{
  --fd-primary-tint: color-mix(in srgb, var(--q-primary) 16%, var(--q-background));
  --fd-secondary-tint: color-mix(in srgb, var(--q-secondary) 14%, var(--q-background));
  --pl-ink: var(--q-dark);
  --pl-ink-deep: var(--q-dark);
  --pl-panel: color-mix(in srgb, var(--q-background) 5%, var(--q-dark));
  --pl-cream: var(--q-background);
  --pl-paper: var(--q-background);
  --pl-muted: color-mix(in srgb, var(--q-background) 80%, var(--q-dark));
  --pl-wine: var(--q-primary);
  --pl-line: color-mix(in srgb, var(--q-background) 30%, var(--q-dark));
  background: var(--q-background);
}}

/* Shared Standard navigation and inherited utilities use an opaque surface. */
{standard} header.consumer-header {{
  background: var(--q-dark) !important;
  color: var(--q-background) !important;
}}
{dark_header} header.consumer-header :is(.q-btn, .q-btn__content, .q-icon) {{
  color: var(--q-background) !important;
}}
{light_header} header.consumer-header :is(.q-btn, .q-btn__content, .q-icon) {{
  color: var(--q-dark) !important;
}}

/* Current Primary/Secondary do not pass as solid text backgrounds. Keep their
   exact native hue in the border and tint; all words remain native Dark. */
{primary_ctas} {{
  background: var(--fd-primary-tint) !important;
  border-color: var(--q-primary) !important;
  color: var(--q-dark) !important;
}}
{primary_copy} {{
  color: var(--q-dark) !important;
}}

/* Keep the existing native-action geometry. These rules replace site-owned
   foreground/fill decisions; page/section authors retain their layout rules. */
{layout} main .q-btn.bg-primary {{
  background: var(--fd-primary-tint) !important;
  border-color: var(--q-primary) !important;
  color: var(--q-dark) !important;
}}
{layout} main .q-btn.bg-primary > .q-btn__content {{
  color: inherit !important;
}}

/* Drawer labels stay legible; active state is conveyed by a brand-colored
   rule instead of low-contrast brand-colored copy. */
{layout} .q-drawer :is(.q-router-link--active, .q-item--active) :is(.q-item__label, .q-icon) {{
  color: var(--q-background) !important;
}}
{layout} .q-drawer :is(.q-router-link--active, .q-item--active) {{
  border-inline-start: 3px solid var(--q-secondary);
}}
body.site-170 .q-layout:has([class*="page-variant-d-odd-"]) .q-drawer {{
  background: var(--fd-secondary-tint) !important;
}}
body.site-170 .q-layout:has([class*="page-variant-d-odd-"]) .q-drawer :is(.q-router-link--active, .q-item--active) :is(.q-item__label, .q-icon) {{
  color: var(--q-dark) !important;
}}

/* The Late header overlays the marquee. The opaque native Dark ground is
   image-independent; the shadow protects glyph edges during transitions. */
body.site-170 .q-layout:has(.page-variant-c-late-5663) header.consumer-header :is(.q-btn__content, .q-icon) {{
  text-shadow: 0 1px 2px var(--q-dark), 0 2px 4px var(--q-dark);
}}

/* Concrete keeps the approved 240px containment and native hover geometry.
   Its highlighted link and the Standard navigation inherit the same roles. */
body.site-170 .q-layout:has([class*="page-variant-f-concrete-"]) header.consumer-header .row.menu a.q-btn:hover {{
  background: var(--q-background) !important;
}}
body.site-170 .q-layout:has([class*="page-variant-f-concrete-"]) header.consumer-header .row.menu a.q-btn:hover :is(.q-btn__content, span) {{
  color: var(--q-dark) !important;
}}

/* A two-tone focus cue is visible on both native Dark and Background. */
{layout} :is(a, button, input, select, textarea):focus-visible {{
  outline: 2px solid var(--q-dark) !important;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--q-background) !important;
}}
'''
    return before + active + after.rstrip() + "\n\n" + patch, patch, counts


def main():
    raw = SOURCE.read_bytes()
    source = raw.decode("utf-8")
    result, patch, counts = prepare(source)
    result = result.rstrip() + "\n"
    (ROOT / "site-theme.before.css").write_bytes(raw)
    (ROOT / "site-theme.proposed.css").write_text(result, encoding="utf-8", newline="\n")
    (ROOT / "scoped-color-contract.css").write_text(patch, encoding="utf-8", newline="\n")
    delta = "".join(difflib.unified_diff(source.splitlines(True), result.splitlines(True), fromfile="site-theme.before.css", tofile="site-theme.proposed.css"))
    (ROOT / "site-theme.diff").write_text(delta, encoding="utf-8", newline="\n")
    manifest = {
        "status": "prepared-not-applied",
        "target": ["US-BETA", "INDY Demo", "Adam Template Testing 2"],
        "nativeField": "Theme & Style / Custom Styles",
        "source": str(SOURCE.relative_to(REPO)).replace("\\", "/"),
        "sourceSha256": hashlib.sha256(raw).hexdigest(),
        "proposedSha256": hashlib.sha256(result.encode()).hexdigest(),
        "counts": counts,
        "scope": VARIANTS,
        "unchanged": ["Parlor and native information-page rules", "retired A/B/C nav-page rules", "all font families and sizes", "all transforms and page geometry", "Concrete approved containment block"],
        "roles": {"Primary": "--q-primary", "Secondary": "--q-secondary", "Dark": "--q-dark", "Background": "--q-background"},
        "gates": ["current native field readback hash", "saved desktop/mobile previews including open drawers", "current and second native palettes without CSS changes", "native published state and public recheck"],
    }
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"sourceSha256": manifest["sourceSha256"], "proposedSha256": manifest["proposedSha256"], "bytes": len(result.encode()), "literalSubstitutions": sum(counts.values())}))


if __name__ == "__main__":
    main()
