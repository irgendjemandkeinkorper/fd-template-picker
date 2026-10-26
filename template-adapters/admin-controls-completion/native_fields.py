"""Prepare reversible native-field patches. Never contacts or writes to INDY.

This operates on the exact raw Custom CSS field, preserving INDY's page/section
scope syntax. It deliberately rejects compiled public output. A caller must
capture each current native field separately and retain its original bytes.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import importlib.util
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
spec = importlib.util.spec_from_file_location("fd_original_color_migration", HERE.parent / "brand-tokens/migrate.py")
original = importlib.util.module_from_spec(spec)
spec.loader.exec_module(original)

# Branding is maintained by Primary / Secondary / Dark plus the native canvas.
# Native error/warning status is separate from client branding.
ROLES = {
    "primary": "var(--q-primary)",
    "secondary": "var(--q-secondary)",
    "dark": "var(--q-dark)",
    "background": "var(--q-background)",
    "header": "var(--q-dark)",
    "accent": "var(--q-secondary)",
    "warning": "var(--q-warning)",
    "on-primary": "var(--q-dark)",
    "on-secondary": "var(--q-dark)",
    "on-accent": "var(--q-dark)",
    "surface-dark": "color-mix(in srgb, var(--q-primary) 12%, var(--q-dark))",
    "muted-on-dark": "color-mix(in srgb, var(--q-background) 85%, var(--q-dark))",
    "muted-on-paper": "color-mix(in srgb, var(--q-dark) 85%, var(--q-background))",
    "line-on-paper": "color-mix(in srgb, var(--q-dark) 45%, var(--q-background))",
    "line-on-dark": "color-mix(in srgb, var(--q-background) 45%, var(--q-dark))",
    "paper-muted": "color-mix(in srgb, var(--q-dark) 5%, var(--q-background))",
    "primary-tint": "color-mix(in srgb, var(--q-primary) 16%, var(--q-background))",
    "secondary-tint": "color-mix(in srgb, var(--q-secondary) 14%, var(--q-background))",
    "accent-tint": "color-mix(in srgb, var(--q-secondary) 20%, var(--q-background))",
    "dark-tint": "color-mix(in srgb, var(--q-dark) 10%, var(--q-background))",
}

HERO_MARKERS = {
    "A": "hero-a---showtimes-shelf-", "B": "hero-b---plate-and-note-",
    "C": "hero-c---marquee-", "D": "hero-d---collage-",
    "E": "hero-e---product-panel-", "F": "hero-f---reference-print-",
    "G": "hero-g---poster-block-", "H": "hero-h---framed-plate-",
    "I": "hero-i---one-still-one-line-",
}
PAPER_CAPTION_VARIANTS = frozenset("BDFH")
CAPTION_ROLES = ":is(.hero-title,.hero-subtitle,.mobile-hero-title,.mobile-hero-subtitle)"
NATIVE_BRAND_PROPERTIES = frozenset('--q-' + role for role in ('primary','secondary','dark','background','header','accent'))


def remove_native_brand_overrides(css):
    """Template CSS must inherit native branding rather than shadow its inputs.

    Converting --q-primary:#hex into --q-primary:var(--fd-primary) creates a
    same-element custom-property cycle because fd-primary reads q-primary.
    Keep status/error variables and every ordinary paint declaration intact.
    """
    comments = []
    def hide(match):
        comments.append(match.group())
        return f'/*__FD_NATIVE_COMMENT_{len(comments)-1}__*/'
    working = original.COMMENT.sub(hide, css)
    removed = []
    def declaration(match):
        prop, _, value = match.groups()
        if prop in NATIVE_BRAND_PROPERTIES:
            removed.append({'property':prop,'oldValue':value,'reason':'Inherit maintained native body palette; prevent template shadow and fd/q alias cycle.'})
            return ''
        return match.group()
    working = original.DECLARATION.sub(declaration, working)
    for index, comment in enumerate(comments):
        working = working.replace(f'/*__FD_NATIVE_COMMENT_{index}__*/', comment)
    return working, removed


def role_contract(selector, letter):
    roles = {**ROLES, 'copy-emphasis': 'var(--fd-muted-on-dark)' if letter in 'ACEL' else 'var(--fd-muted-on-paper)'}
    return "/* Maintained native brand roles; change Theme & Style, not this CSS. */\n" + selector + " {\n" + "\n".join(f"  --fd-{name}: {value};" for name, value in roles.items()) + "\n}\n"


def readable_literal_foregrounds(css, letter):
    """Split color-identity reuse at the source declaration, not in all elements.

    Peer-reviewed A/B/C/H/I/J/K/L occurrences paint copy on the base dark/paper
    canvas. Background, border, shadow and custom-property declarations remain
    brand-owned. Other families use narrow selector adapters below.
    """
    if letter not in 'ABCH IJKL'.replace(' ', ''):
        return css, []
    comments = []
    def hide(match):
        comments.append(match.group())
        return f'/*__FD_TEXT_COMMENT_{len(comments)-1}__*/'
    working = original.COMMENT.sub(hide, css)
    changes = []
    def declaration(match):
        prop, separator, value = match.groups()
        if prop.lower() != 'color':
            return match.group()
        replacement = value
        if re.search(r'var\(--fd-(?:primary|secondary|accent)\)', value):
            replacement = 'var(--fd-copy-emphasis)' + (' !important' if '!important' in value else '')
        elif letter in 'AC':
            alpha = re.fullmatch(r'\s*color-mix\(in\s+srgb,\s*var\(--fd-background\)\s+([\d.]+)%,\s*transparent\)\s*(!important)?\s*', value)
            if alpha and float(alpha.group(1)) < 85:
                replacement = 'color-mix(in srgb, var(--fd-background) 85%, transparent)' + (' !important' if alpha.group(2) else '')
        if replacement != value:
            changes.append({'property': prop, 'before': value, 'after': replacement})
        return prop + separator + replacement
    working = original.DECLARATION.sub(declaration, working)
    for index, comment in enumerate(comments):
        working = working.replace(f'/*__FD_TEXT_COMMENT_{index}__*/', comment)
    return working, changes


def expand_at_root_roles(css, letter):
    """Native authored @at-root header rules do not inherit section aliases."""
    roles = {**ROLES, 'copy-emphasis': ROLES['muted-on-dark' if letter in 'ACEL' else 'muted-on-paper']}
    pieces = []
    cursor = 0
    for match in re.finditer(r'@at-root\s*\{', css):
        if match.start() < cursor:
            continue
        depth, index, quote = 1, match.end(), None
        while index < len(css) and depth:
            char = css[index]
            if quote:
                if char == quote and css[index-1] != '\\':
                    quote = None
            elif char in '\"\'':
                quote = char
            elif char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
            index += 1
        if depth:
            raise ValueError('Unbalanced native @at-root block')
        block = css[match.start():index]
        for _ in range(4):
            block = re.sub(r'var\(--fd-([\w-]+)\)', lambda found: roles.get(found.group(1), found.group()), block)
        pieces += [css[cursor:match.start()], block]
        cursor = index
    return ''.join(pieces) + css[cursor:] if pieces else css


def overlay_adapter(letter):
    """Page-field append for actual A-I carousel captions, desktop and mobile.

    Opaque backing makes image brightness irrelevant. The palette gate remains
    necessary: no CSS adapter can make two arbitrary identical native colors
    contrasting. J/K/L have editorial hero alternatives rather than carousels.
    """
    if letter not in HERO_MARKERS:
        return ""
    hero = f'[class*="section-{HERO_MARKERS[letter]}"]'
    caption = f'{hero} [data-test-id="carousel-hero-slide"] [data-test-id="carousel-slide-content"] {CAPTION_ROLES}'
    paper = letter in PAPER_CAPTION_VARIANTS
    background = "--q-background" if paper else "--q-dark"
    foreground = "--q-dark" if paper else "--q-background"
    return f"""
/* Readable media captions. Solid backing protects every image frame. */
{caption} {{
  color: var({foreground}) !important;
  background-color: var({background}) !important;
  box-shadow: 0 0 0 .18em var({background}) !important;
  text-shadow: 0 .04em .08em color-mix(in srgb, var({background}) 85%, transparent) !important;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}}
/* Keep empty native captions from painting blank bars. */
{caption}:empty {{
  background: transparent !important;
  box-shadow: none !important;
}}
/* Icons remain visible over light and dark frames without intercepting input. */
{hero} :is(.swiper-button-prev,.swiper-button-next) {{
  color: var(--q-background) !important;
  background-color: var(--q-dark) !important;
  text-shadow: 0 .05em .12em var(--q-dark) !important;
}}
"""


def form_adapter(selector):
    return f"""
/* Native form widgets emit inline neutral defaults; bind their maintained roles. */
{selector} .generic-form-field {{
  --generic-form-field-background: var(--q-background) !important;
  --generic-form-field-text: var(--q-dark) !important;
  --generic-form-field-border: var(--q-dark) !important;
  --generic-form-field-label: var(--q-dark) !important;
  --generic-form-field-placeholder: color-mix(in srgb, var(--q-dark) 85%, var(--q-background)) !important;
  --generic-form-field-focus: var(--q-dark) !important;
}}
"""


def action_adapter(selector, letter):
    """Native Primary tint/Dark action, with solid Primary decorative border.

    Uses only known clickable controls. Does not change native links, disabled
    status, pagination, .q-focus-helper, or arbitrary descendants of a button.
    """
    extra = {
        'A': ',.ha-shelf__book,.mba__cta,.fua__cta',
        'B': '',
        'C': ',.mbc__cta,.fuc__cta,.ev-c__cta',
        'D': ',.od-club__cta,.od-note--ask .od-note__link',
        'E': ',.gr-btn--primary',
    }.get(letter, '')
    # The data attribute is observed on native section roots. It provides enough
    # scope to override older page-level widget paints without touching another
    # page or relying on a fabricated ID/selector specificity trick.
    native_section = f'{selector}[data-test-id="section-content"]'
    control = f'{native_section} :is(.q-btn.bg-primary,.fdp-action{extra})'
    result = f"""
/* Brand actions use a tint because the native solid Primary/Dark pair can fail. */
{control} {{
  background: color-mix(in srgb, var(--q-primary) 16%, var(--q-background)) !important;
  color: var(--q-dark) !important;
  border-color: var(--q-primary) !important;
}}
{control} :is(.q-btn__content,span) {{ color: var(--q-dark) !important; }}
{control}:focus-visible {{
  outline: 3px solid var(--q-dark) !important;
  outline-offset: 3px;
  box-shadow: 0 0 0 6px var(--q-background) !important;
}}
{control}:hover {{ text-decoration: underline; }}
"""
    if letter == 'A':
        result += f"""
/* Circuit's text-only event link keeps its layout and brand underline. */
{native_section} a.ev-a__link {{ color:var(--q-background) !important; text-decoration:underline; text-decoration-color:var(--q-primary); }}
"""
    if letter == 'B':
        result += f"""
/* Rep's editorial links retain their transparent, underlined treatment. */
{native_section} :is(a.ev-b__link,a.mbb__cta,a.fub__cta) {{ background:transparent !important; color:var(--q-dark) !important; border-color:var(--q-primary) !important; }}
"""
    if letter == 'I':
        result += f"""
/* Ma's quiet membership link stays transparent and underlined. */
{native_section} .fdp-action {{ background:transparent !important; color:var(--q-dark) !important; border-bottom-color:var(--q-primary) !important; }}
"""
    return result


def odd_role_adapter():
    scope = '[class*="section-membership-d---loyalty-card-"]'
    result = ["\n/* Semantic Odd card roles; apply only with the matching HTML class patch. */"]
    for name, tint in (("primary", "primary-tint"), ("secondary", "secondary-tint"), ("dark", "dark-tint")):
        card = f"{scope} .od-club__tier.fd-tier-{name}"
        result += [f"{card} {{ background:var(--fd-{tint}) !important; color:var(--q-dark) !important; }}", f"{card} :is(h2,h3,p,li,span,.od-club__price) {{ color:var(--q-dark) !important; }}"]
    result += [f"{scope} .od-club__cta {{ background:var(--fd-primary-tint); color:var(--q-dark); border-color:var(--q-primary); }}"]
    return "\n".join(result) + "\n"


def cut_card_adapter():
    return """
/* Cut's two featured cards use maintainable tints, avoiding solid Secondary text. */
.fdp-g-membership .fdp-card:nth-child(2) { background:var(--fd-secondary-tint) !important; color:var(--q-dark) !important; }
.fdp-g-membership .fdp-card:nth-child(3) { background:var(--fd-primary-tint) !important; color:var(--q-dark) !important; }
.fdp-g-membership .fdp-card:is(:nth-child(2),:nth-child(3)) :is(h3,p,.fdp-number) { color:var(--q-dark) !important; }
"""


def variant_readability_adapter(letter):
    """Narrow paint splits verified against retained original selectors.

    Never changes positioning, clipping, slants, inventory or content. Native
    draft/public checks still decide whether these exact selectors match.
    """
    if letter == 'A':
        return """
/* Circuit keeps outlined showtimes and gains a readable branded hover/focus. */
[class*="now-playing-a---departure-board"] .showings .q-btn.showing.bg-primary.text-white:is(:hover,:focus-visible) { background:var(--fd-primary-tint) !important; color:var(--q-dark) !important; }
[class*="now-playing-a---departure-board"] .showings .q-btn.showing.bg-primary.text-white:is(:hover,:focus-visible) :is(.q-btn__content,span) { color:var(--q-dark) !important; }
"""
    if letter == 'C':
        return """
/* Late's product copy overlays imagery; an opaque panel protects all product art. */
[class*="section-food-c---tile-wall-"] .q-card .q-card__section { background:var(--q-dark) !important; color:var(--q-background) !important; text-shadow:0 .05em .12em var(--q-dark) !important; }
[class*="section-food-c---tile-wall-"] .q-card .q-card__section :is(.text-weight-bold,span) { color:var(--q-background) !important; }
/* Movie copy also crosses a decorative image; leave the poster and row geometry. */
[class*="now-playing-c---late-rail"] .movie-container > .row.container > div { background:var(--q-dark) !important; text-shadow:0 .05em .12em var(--q-dark) !important; }
[class*="now-playing-c---late-rail"] .showings .q-btn.showing.bg-primary.text-white:is(:hover,:focus-visible) { background:var(--fd-primary-tint) !important; color:var(--q-dark) !important; }
[class*="now-playing-c---late-rail"] .showings .q-btn.showing.bg-primary.text-white:is(:hover,:focus-visible) :is(.q-btn__content,span) { color:var(--q-dark) !important; }
"""
    if letter == 'D':
        return """
/* Odd's small editorial copy and price stickers use readable native pairs. */
[class*="section-"] { --v-muted:color-mix(in srgb,var(--q-dark) 85%,var(--q-background)); }
[class*="section-food-d---sticker-sheet-"] .q-card .row.items-center.justify-between { background:var(--fd-secondary-tint) !important; color:var(--q-dark) !important; }
[class*="section-food-d---sticker-sheet-"] .q-card .row.items-center.justify-between span { color:var(--q-dark) !important; }
[class*="section-"] :is(h1,h2,h3,h4) em { color:var(--q-dark) !important; text-decoration:underline; text-decoration-color:var(--q-primary); }
[class*="section-"] :is(.od-line em,.od-board__eyebrow,.od-map__kicker,.od-club__kicker,.od-note__kicker) { color:var(--q-dark) !important; }
[class*="section-membership-d---loyalty-card-"] .od-club__stamps span.is-stamped { color:var(--q-dark); border-color:var(--q-dark); }
"""
    if letter == 'E':
        return """
/* Grid's faint metadata stays readable; Secondary badges keep Dark text. */
[class*="section-"] { --v-muted:color-mix(in srgb,var(--q-background) 85%,var(--q-dark)); --v-faint:color-mix(in srgb,var(--q-background) 85%,var(--q-dark)); }
[class*="section-events-e---packages-"] .gr-pack__badge,
[class*="section-membership-e---tiers-"] .gr-mem__badge { background:var(--fd-secondary-tint) !important; color:var(--q-dark) !important; }
"""
    if letter == 'G':
        return """
/* Cut keeps its alternating panels and slants, with native readable tint pairs. */
[class*="section-food-g---colour-tile-wall-"] .row.justify-start.items-stretch > .q-card.q-card--bordered:nth-child(3n+2),
[class*="section-food-g---colour-tile-wall-"] .col-2 :is(.q-btn,button):nth-child(3n+2),
[class*="section-food-g---colour-tile-wall-"] :is(.col-2,.col-md-2) .q-item:nth-child(3n+2),
[class*="section-events-g---diagonal-stack-"] article.cut-event:nth-of-type(3n+2),
[class*="section-contact-g---two-tone-split-"] .q-card__section:first-child { background:var(--fd-primary-tint) !important; color:var(--q-dark) !important; }
[class*="section-food-g---colour-tile-wall-"] .row.justify-start.items-stretch > .q-card.q-card--bordered:nth-child(3n),
[class*="section-food-g---colour-tile-wall-"] .col-2 :is(.q-btn,button):nth-child(3n),
[class*="section-food-g---colour-tile-wall-"] :is(.col-2,.col-md-2) .q-item:nth-child(3n),
[class*="section-events-g---diagonal-stack-"] article.cut-event:nth-of-type(3n) { background:var(--fd-secondary-tint) !important; color:var(--q-dark) !important; }
[class*="section-food-g---colour-tile-wall-"] .row.justify-start.items-stretch > .q-card .opacity-80 { opacity:1 !important; }
[class*="section-contact-g---two-tone-split-"] .text-h2 { color:var(--q-dark) !important; }
[class*="section-contact-g---two-tone-split-"] .q-card__section.row.items-center.justify-center .q-btn { background:var(--fd-primary-tint) !important; color:var(--q-dark) !important; }
[class*="section-contact-g---two-tone-split-"] .q-card__section.row.items-center.justify-center :is(.q-btn__content,span) { color:var(--q-dark) !important; }
"""
    if letter == 'J':
        return dark_native_role_bridge(['section-j-intro-','section-j-visit-'])
    if letter == 'K':
        return editorial_role_bridge(['section-k-welcome-','section-k-stay-awhile-'],'primary') + dark_native_role_bridge(['section-k-featured-'],empty_state=True)
    if letter == 'L':
        return editorial_role_bridge(['section-l-lounge-ritual-'],'primary') + editorial_role_bridge(['section-l-one-more-'],'secondary') + dark_native_role_bridge(['section-l-opening-note-'])
    return ''


def dark_native_role_bridge(markers, empty_state=False):
    scopes = [f'[class*="{marker}"][data-test-id="section-content"]' for marker in markers]
    result = '\n/* Native Dark editorial/widget panels use Background for meaningful copy. */\n'
    result += ',\n'.join(scopes) + ' { background-color:var(--q-dark) !important; color:var(--q-background) !important; }\n'
    result += ',\n'.join(scope + ' :is(h2,h3).text-current-color' for scope in scopes) + ' { color:var(--q-background) !important; }\n'
    if empty_state:
        result += ',\n'.join(scope + ' .text-h5.text-grey-9' for scope in scopes) + ' { color:var(--q-background) !important; }\n'
    return result


def editorial_role_bridge(markers, tint):
    scope = ':is(' + ','.join(f'[class*="{marker}"]' for marker in markers) + ')'
    return f"""
/* Native editorial section color bridge; copy and fills use the maintained pair. */
{scope},
{scope} :is(.bg-primary,.bg-secondary,.q-card,.main-content) {{ background:var(--fd-{tint}-tint) !important; color:var(--q-dark) !important; }}
{scope} :is(.text-white,.text-primary,.text-body1,.text-h2,.text-current-color,h1,h2,h3,p,li,a,span) {{ color:var(--q-dark) !important; }}
"""


def transform_native_css(css, letter, kind, *, include_adapters=True, odd_classes_verified=False):
    letter = letter.upper()
    if letter not in original.PROFILES or kind not in ("page", "section"):
        raise ValueError("Expected variant A-L and native field kind page/section")
    scope_check = original.COMMENT.sub("", css)
    # C's actual native Page CSS has a deliberate @at-root header repair using
    # :has(.page-...). That selector is authored raw input, not a compiled page
    # prefix. Keep it and expand aliases to native tokens in that external scope.
    if '@at-root' in scope_check:
        scope_check = re.sub(r':has\(\s*\.page-variant-[a-l]-[\w-]+-\d+\s*\)', ':has(__verified_native_page__)', scope_check)
    if re.search(r"\.page-variant-[a-l]-[\w-]+-\d+", scope_check):
        raise ValueError("Compiled public page scope detected; capture the raw native field instead")
    if kind == "page" and re.search(r"\.section-[\w-]+-\d+", original.COMMENT.sub("", css)):
        # Old A authoring can legitimately contain exact section selectors. Do
        # not strip them automatically: native readback is the source of truth.
        pass
    native_inputs_cleaned, removed_native_overrides = remove_native_brand_overrides(css)
    transformed, report = original.migrate_css(native_inputs_cleaned, letter)
    if report["unknownLiteralColors"]:
        raise ValueError("Unmapped native colors: " + ", ".join(sorted(report["unknownLiteralColors"])))
    # No independent brand dependence on Header/Accent. Preserve native Warning
    # as a status meaning, not a branding field.
    transformed = transformed.replace("var(--q-header)", "var(--q-dark)").replace("var(--q-accent)", "var(--q-secondary)")
    transformed, text_role_changes = readable_literal_foregrounds(transformed, letter)
    transformed = expand_at_root_roles(transformed, letter)
    if letter == 'D' and kind == 'page':
        from prepare_qa_correction_d_price_clearance import normalize_source_price_layout
        transformed = normalize_source_price_layout(transformed)
    if letter == 'I':
        # The existing .text-white caption rule is more specific than the new
        # bridge. Strengthen its owned backing, rather than losing the cascade.
        transformed = re.sub(r'(--ma-caption-backdrop\s*:\s*)color-mix\(in\s+srgb,\s*var\(--q-dark\)\s+88%,\s*transparent\)', r'\1var(--q-dark)', transformed)
    selector = '[class*="section-"]' if kind == "page" else "&"
    result = role_contract(selector, letter) + transformed.rstrip() + "\n"
    if include_adapters:
        result += form_adapter(selector) + action_adapter(selector, letter)
        if kind == "page":
            result += overlay_adapter(letter)
            result += variant_readability_adapter(letter)
            if letter == "D" and odd_classes_verified:
                result += odd_role_adapter()
            if letter == "D":
                from prepare_qa_correction_d_mobile import MOBILE_CORRECTION
                result += MOBILE_CORRECTION
            if letter == "G":
                result += cut_card_adapter()
                # Separate from paint-only adapters: actual native mobile DOM
                # needs a growing caption canvas. Frozen proposals stay intact.
                from prepare_qa_correction_g_mobile import MOBILE_CORRECTION
                result += MOBILE_CORRECTION
        elif letter == 'G' and '.fdp-g-membership' in css:
            result += '\n/* Base card number reads on the dark surface; featured cards retain their explicit copy. */\n&.fdp-g-membership .fdp-number { color:var(--q-background); }\n'
        elif letter in 'JK' and f'.fdp-{letter.lower()}-food' in css:
            result += f'\n/* Native product category titles inherit brand text by default. */\n&.fdp-{letter.lower()}-food .text-current-color {{ color:var(--q-dark) !important; }}\n'
    return result.rstrip() + "\n", {
        **report, "variant": letter, "kind": kind,
        "sourceSha256": hashlib.sha256(css.encode()).hexdigest(),
        "proposedSha256": hashlib.sha256((result.rstrip() + "\n").encode()).hexdigest(),
        "status": "prepared-native-field-not-applied",
        "nativeScopePreserved": True,
        "paletteGate": "Verify Background/Dark, actual tints, muted roles and all rendered states. No arbitrary-palette guarantee.",
        "oddClassGate": "verified" if odd_classes_verified else "not-verified; role CSS omitted",
        "foregroundRoleChanges": text_role_changes,
        "removedNativeBrandOverrides": removed_native_overrides,
    }


def patch_odd_html(source):
    """Add only semantic role class tokens to the three existing named cards."""
    pattern = re.compile(r'(<[a-z][\w:-]*\b[^>]*?\bclass\s*=\s*)([\"\'])([^\"\']*\bod-club__tier\b[^\"\']*)(\2)', re.I)
    matches = list(pattern.finditer(source))
    if len(matches) != 3:
        raise ValueError(f"Expected exactly three Odd tier wrappers, found {len(matches)}")
    expected = ("Regular", "Regular, but more", "Practically staff")
    roles = ("primary", "secondary", "dark")
    replacements = []
    for index, (match, name, role) in enumerate(zip(matches, expected, roles)):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(source)
        card = source[match.end():end]
        heading = re.search(r'<p\b[^>]*\bclass\s*=\s*([\"\'])[^\"\']*\bod-club__tiername\b[^\"\']*\1[^>]*>(.*?)</p\s*>', card, re.I | re.S)
        paragraph_heading = heading is not None
        if heading is None:
            heading = re.search(r'<h[1-6]\b[^>]*>(.*?)</h[1-6]\s*>', card, re.I | re.S)
        text = html.unescape(re.sub(r'<[^>]+>', '', heading.group(2 if paragraph_heading else 1))).strip() if heading else None
        if text != name:
            raise ValueError(f"Card {index + 1} heading mismatch: {text!r}; expected {name!r}")
        classes = match.group(3).split()
        if "od-tilt" not in classes:
            raise ValueError("Existing Odd tilt class missing; inspect current field")
        existing_roles = [c for c in classes if c.startswith("fd-tier-")]
        required = "fd-tier-" + role
        if existing_roles and existing_roles != [required]:
            raise ValueError("Existing semantic role differs; do not reassign by position")
        if not existing_roles:
            replacements.append((match.start(3), match.end(3), match.group(3) + " " + required))
    patched = source
    for start, end, replacement in reversed(replacements):
        patched = patched[:start] + replacement + patched[end:]
    return patched


def rgb(value):
    value = value.lstrip("#")
    if len(value) == 3:
        value = "".join(c * 2 for c in value)
    if not re.fullmatch(r"[\da-fA-F]{6}", value):
        raise ValueError("Expected 6-digit native palette color")
    return tuple(int(value[i:i+2], 16) / 255 for i in (0, 2, 4))


def mix(left, percentage, right):
    return tuple(a * percentage + b * (1-percentage) for a, b in zip(left, right))


def contrast(left, right):
    def lum(value):
        channels = [c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4 for c in value]
        return sum(c * weight for c, weight in zip(channels, (.2126, .7152, .0722)))
    a, b = sorted((lum(left), lum(right)), reverse=True)
    return (a+.05) / (b+.05)


def palette_report(palette):
    colors = {key: rgb(palette[key]) for key in ("primary", "secondary", "dark", "background")}
    paints = {
        "Background/Dark and opaque media captions": (colors["background"], colors["dark"]),
        "Primary16% tint/Dark": (mix(colors["primary"], .16, colors["background"]), colors["dark"]),
        "Secondary14% tint/Dark": (mix(colors["secondary"], .14, colors["background"]), colors["dark"]),
        "Secondary20% tint/Dark": (mix(colors["secondary"], .20, colors["background"]), colors["dark"]),
        "Dark10% tint/Dark": (mix(colors["dark"], .10, colors["background"]), colors["dark"]),
        "Muted dark85%/Background": (mix(colors["dark"], .85, colors["background"]), colors["background"]),
        "Muted Background85%/Dark": (mix(colors["background"], .85, colors["dark"]), colors["dark"]),
        "Background/Primary12% Dark surface": (colors["background"], mix(colors["primary"], .12, colors["dark"])),
    }
    pairs = [{"pair": name, "ratio": round(contrast(*pair), 2), "normalTextPass": contrast(*pair) >= 4.5} for name, pair in paints.items()]
    return {"palette": palette, "pairs": pairs, "pass": all(pair["normalTextPass"] for pair in pairs), "scope": "Exact sRGB recipes in this module, not all original Oklab-derived roles or rendered native states."}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=pathlib.Path, required=True)
    parser.add_argument("--variant", required=True, choices=list("ABCDEFGHIJKL"))
    parser.add_argument("--kind", required=True, choices=("page", "section"))
    parser.add_argument("--output", type=pathlib.Path, required=True)
    parser.add_argument("--odd-classes-verified", action="store_true")
    args = parser.parse_args()
    result, report = transform_native_css(args.input.read_text(encoding="utf-8-sig"), args.variant, args.kind, odd_classes_verified=args.odd_classes_verified)
    if args.output.exists():
        raise SystemExit("Refusing to overwrite an existing proposal. Use a new revision path.")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(result, encoding="utf-8")
    args.output.with_suffix(args.output.suffix + ".json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
