#!/usr/bin/env python3
"""Read-only integrity/readiness check for picker v3 and a separate build request.

Exit 0: local inputs ready for native preflight (not native authorization).
Exit 1: invalid/inconsistent input. Exit 2: valid input, blocked preparation.
No browser, network, native writes, file generation or permission inference.
"""
import argparse
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path

REQUIRED = ("navigation", "hero", "food", "private-parties", "membership", "contact")
ROLES = ("primary", "secondary", "header", "accent", "dark", "background", "positive", "negative", "info", "warning", "splashBackground", "seatSelected", "seatAvailable")
ACTIONS = {"create-circuit", "create-site", "save-drafts", "configure-theme", "configure-navigation", "configure-content", "configure-forms", "configure-memberships", "seed-sample-content", "create-consumer-website", "assign-homepage"}
HEX = re.compile(r"^#[a-fA-F0-9]{6}$")
DIGEST = re.compile(r"^[a-f0-9]{64}$")
TYPOGRAPHY_SCHEMA = "fd-typography/v1"
TYPOGRAPHY_ROLES = ("headings", "body", "interface")
WEB_SAFE_FONT_IDS = ("arial", "verdana", "tahoma", "trebuchet-ms", "georgia", "times-new-roman", "courier-new")
CONTRAST_REVIEW_POLICY = "contrast-review/v1"
CONTRAST_ACKNOWLEDGMENT = "I understand these colors do not meet the 4.5:1 accessibility requirement for regular text. I want to continue with this palette for review."


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def load_json(path):
    data = path.read_bytes()
    value = json.loads(data.decode("utf-8-sig"))
    if not isinstance(value, dict):
        raise ValueError(f"JSON root must be an object: {path.name}")
    return value, sha256(data)


def local_path(root, relative):
    if not isinstance(relative, str) or not relative or Path(relative).is_absolute() or re.match(r"^[A-Za-z]:|^[\\/]", relative):
        raise ValueError("Artifact path must be repository-relative")
    result = (root / relative).resolve()
    if not result.is_relative_to(root.resolve()):
        raise ValueError("Artifact path escapes the supplied repository")
    return result


def luminance(value):
    rgb = [int(value[index:index + 2], 16) / 255 for index in (1, 3, 5)]
    rgb = [part / 12.92 if part <= .04045 else ((part + .055) / 1.055) ** 2.4 for part in rgb]
    return sum(part * weight for part, weight in zip(rgb, (.2126, .7152, .0722)))


def contrast(one, two):
    a, b = luminance(one), luminance(two)
    return (max(a, b) + .05) / (min(a, b) + .05)


def acknowledged_palette(value, key):
    """Accept only the exact current palette's recorded review acknowledgment."""
    if not isinstance(value, dict) or value.get("policy") != CONTRAST_REVIEW_POLICY or value.get("paletteKey") != key:
        return False
    if value.get("statement") != CONTRAST_ACKNOWLEDGMENT or not isinstance(value.get("acknowledgedAt"), str):
        return False
    try:
        datetime.fromisoformat(value["acknowledgedAt"].replace("Z", "+00:00"))
    except ValueError:
        return False
    return True


def validate_typography(brief, errors):
    """Validate requested font IDs without implying native font application."""
    review = {"provided": "typography" in brief, "nativeMappingVerified": False}
    if not review["provided"]:
        return {**review, "status": "not-specified"}
    value = brief["typography"]
    if not isinstance(value, dict) or value.get("schema") != TYPOGRAPHY_SCHEMA:
        errors.append("Typography must be an fd-typography/v1 object when supplied")
        return {**review, "status": "invalid"}
    if set(value) != {"schema", "roles"}:
        errors.append("Typography supports only schema and roles; font files, URLs and CSS are not accepted")
        return {**review, "status": "invalid"}
    roles = value["roles"]
    if not isinstance(roles, dict) or set(roles) != set(TYPOGRAPHY_ROLES):
        errors.append("Typography roles must be exactly headings, body and interface")
        return {**review, "status": "invalid"}
    invalid = [role for role in TYPOGRAPHY_ROLES if not isinstance(roles[role], str) or roles[role] not in WEB_SAFE_FONT_IDS]
    if invalid:
        errors.append("Typography has unapproved web-safe font IDs for: " + ", ".join(invalid))
        return {**review, "status": "invalid"}
    if "typographyBindings" in brief:
        bindings = brief["typographyBindings"]
        if (not isinstance(bindings, dict) or set(bindings) != set(TYPOGRAPHY_ROLES)
                or any(not isinstance(bindings[role], dict) or bindings[role].get("fontId") != roles[role]
                       for role in TYPOGRAPHY_ROLES)):
            errors.append("Derived typographyBindings font IDs must match the authoritative typography roles")
            return {**review, "status": "invalid"}
    return {**review, "status": "requested-build-settings", "schema": TYPOGRAPHY_SCHEMA,
            "roles": {role: roles[role] for role in TYPOGRAPHY_ROLES},
            "requiresNativeMappingReview": True, "requiresRenderedReview": True}


def final_name(value):
    return isinstance(value, str) and bool(value.strip()) and not any(token in value for token in ("<", ">", "TODO", "TBD"))


def source_identity(value):
    """Normalize numeric legacy IDs, preserving object/array structure."""
    if isinstance(value, dict):
        return {key: source_identity(part) for key, part in value.items()}
    if isinstance(value, list):
        return [source_identity(part) for part in value]
    if isinstance(value, int) and not isinstance(value, bool):
        return str(value)
    return value


def check(brief_path, repository, request_path=None, module_index_path="data/build-modules.json"):
    report = {"schema": "fd-indy-preflight-report/v1", "inputValid": False, "readyForNativePreflight": False,
              "nativeAuthorizationEstablished": False, "errors": [], "blockers": [], "modules": [], "nextActions": [],
              "limits": ["Local validation cannot verify current native UI, target, permission, provisioning outcome or human authorization.",
                         "Native preview/consumer QA and draft-only state still require observed evidence."]}
    errors, blockers = report["errors"], report["blockers"]
    try:
        brief, brief_hash = load_json(Path(brief_path))
        report["pickerBriefSha256"] = brief_hash
        report["typographyReview"] = validate_typography(brief, errors)
        if brief.get("schema") != "fd-template-picker/v3":
            raise ValueError("Use a v3 JSON build brief; older selections/TXT need explicit migration through the picker")
        contract = brief.get("buildContract")
        if not isinstance(contract, dict) or contract.get("version") != 1:
            raise ValueError("Missing or unsupported buildContract.version")
        if (contract.get("publicationPolicy") != "draft-only" or contract.get("destination") is not None
                or "destination" not in contract or contract.get("destinationAuthorizationRequired") is not True
                or contract.get("sourceIdsAreDestinationIds") is not False):
            errors.append("Picker build contract must retain null destination, source-only IDs and draft-only policy")

        repository = Path(repository).resolve()
        catalog, catalog_hash = load_json(repository / "catalog.json")
        index, index_hash = load_json(local_path(repository, module_index_path))
        for name, actual in (("catalog", catalog_hash), ("moduleIndex", index_hash)):
            expected = contract.get(name, {}).get("sha256")
            if not isinstance(expected, str) or not DIGEST.fullmatch(expected) or actual != expected:
                errors.append(f"{name} SHA256 mismatch or missing digest; obtain the matching package, do not regenerate to bypass it")
        if index.get("schema") != "fd-picker-module-index/v1" or index.get("sourceOnly") is not True:
            errors.append("Unsupported or non-source-only module index")
        if index.get("catalogSha256") != catalog_hash:
            errors.append("Module index does not bind this exact catalog")
        if brief.get("sourceSite") != catalog.get("sourceSite", {"url": catalog.get("source")}):
            errors.append("Exported source Site differs from the hash-bound catalog")
        if contract.get("moduleIndex", {}).get("schema") != index.get("schema"):
            errors.append("Exported module-index schema differs from supplied registry")

        options = {}
        for slot in catalog.get("slots", []):
            for option in slot.get("options", []):
                if option.get("id") in options:
                    errors.append("Catalog has duplicate option identities")
                options[option.get("id")] = (slot, option)
        selected = [section for section in brief.get("sections", []) if section.get("included") is True]
        modules = contract.get("modules", [])
        if not isinstance(modules, list):
            raise ValueError("buildContract.modules must be an array")
        if [part.get("optionId") for part in selected] != [part.get("optionId") for part in modules]:
            errors.append("Included sections and ordered build modules disagree")
        if len({part.get("optionId") for part in selected}) != len(selected):
            errors.append("Duplicate included option IDs")
        if contract.get("componentOrder") != [part.get("component") for part in modules]:
            errors.append("componentOrder disagrees with module order")
        confirmed = brief.get("workflow", {}).get("confirmed", {})
        if contract.get("checklistComplete") is not True:
            blockers.append("Picker checklist is not complete; confirm current colors and each selected component")
        for component in REQUIRED:
            matches = [part for part in selected if part.get("canonicalComponent") == component]
            if len(matches) != 1:
                errors.append(f"Require exactly one included canonical {component} component")
            elif confirmed.get(component) != matches[0].get("optionId"):
                blockers.append(f"Current {component} option is not confirmed")

        palette = brief.get("palette", {})
        roles = palette.get("roles", {})
        bindings = palette.get("nativeBindings", {})
        binding_pair = (bindings.get("header", {}).get("templateRole"), bindings.get("accent", {}).get("templateRole"))
        current_bindings = binding_pair == ("header", "accent")
        if binding_pair not in (("header", "accent"), ("dark", "secondary")):
            errors.append("Unsupported Header/Accent adapter-binding pair; retain a complete current or legacy binding contract")
        valid_palette = palette.get("version") == 1 and all(isinstance(roles.get(role), str) and HEX.fullmatch(roles[role]) for role in ROLES)
        if not valid_palette:
            errors.append("Require palette version 1 with all thirteen six-digit requested role colors")
        else:
            expected_key = "palette/v1|" + "|".join(f"{role}:{roles[role].upper()}" for role in ROLES) + f"|header:{binding_pair[0]}|accent:{binding_pair[1]}"
            expected_confirmation = expected_key
            typography_review = report["typographyReview"]
            if typography_review["status"] == "requested-build-settings":
                fonts_key = TYPOGRAPHY_SCHEMA + "|" + "|".join(f"{role}:{typography_review['roles'][role]}" for role in TYPOGRAPHY_ROLES)
                expected_confirmation += "|" + fonts_key
            if confirmed.get("colors") != expected_confirmation:
                blockers.append("Palette confirmation does not match current role colors/bindings or supplied typography")
            ratios = {f"{a}/{b}": contrast(roles[a], roles[b]) for a, b in (("primary", "secondary"), ("dark", "background"))}
            report["baseContrast"] = {pair: round(ratio, 4) for pair, ratio in ratios.items()}
            normal_text = all(ratio >= 4.5 for ratio in ratios.values())
            below_floor = any(ratio < 3 for ratio in ratios.values())
            acknowledged = current_bindings and not normal_text and not below_floor and acknowledged_palette(brief.get("colorAcknowledgment"), expected_key)
            for pair, ratio in ratios.items():
                if ratio < 3:
                    blockers.append(f"Base {pair} contrast is below the picker 3:1 minimum and cannot be acknowledged")
                elif ratio < 4.5 and not acknowledged:
                    blockers.append(f"Base {pair} contrast needs a current palette-bound review acknowledgment; legacy briefs require 4.5:1")
            report["colorReview"] = {
                "passesNormalText": normal_text,
                "acknowledgedForReview": acknowledged,
                "requiresRenderedReview": True,
                "status": "blocked" if below_floor else "passes-base-text-checks" if normal_text else "acknowledged-for-review" if acknowledged else "acknowledgment-required",
            }
            for role in ("primary", "secondary"):
                if brief.get("brandColors", {}).get(role, "").upper() != roles[role].upper():
                    errors.append(f"Legacy brandColors.{role} differs from requested palette")

        request = {}
        if request_path:
            request, report["requestSha256"] = load_json(Path(request_path))
            validate_request(request, brief_hash, repository, errors, blockers)
        else:
            blockers.append("No separately bound destination/build authorization request; source selection is not destination permission")
        catalog_variants = sorted({option.get("variant") for _, option in options.values() if isinstance(option.get("variant"), str)})
        allowed = request.get("designScope", {}).get("allowedVariants", catalog_variants)
        if not isinstance(allowed, list) or not allowed or any(not isinstance(item, str) for item in allowed):
            errors.append("designScope.allowedVariants must be a nonempty explicit list")
            allowed = catalog_variants

        for position, section in enumerate(selected):
            option_id = section.get("optionId")
            match = options.get(option_id)
            module = modules[position] if position < len(modules) else {}
            row = {"optionId": option_id, "component": section.get("canonicalComponent") or section.get("slot"), "artifactIntegrity": True, "packagingRequired": True}
            report["modules"].append(row)
            if not match:
                errors.append(f"Unknown selected option: {option_id}")
                continue
            slot, option = match
            if section.get("slot") != slot.get("id") or section.get("variant") != option.get("variant"):
                errors.append(f"Selected slot/variant differs from catalog for {option_id}")
            canonical = option.get("canonicalComponent") or slot.get("canonicalComponent") or {"header": "navigation", "navigation": "navigation", "hero": "hero", "food": "food", "private-parties": "private-parties", "membership": "membership", "contact": "contact"}.get(slot.get("id"))
            if section.get("canonicalComponent") != canonical or module.get("component") != (canonical or section.get("slot")) or module.get("slot") != section.get("slot"):
                errors.append(f"Canonical component/module slot differs from catalog for {option_id}")
            if option.get("variant") not in allowed:
                blockers.append(f"Selected {option_id} is outside the explicit design scope")
            expected_source = {"publishedPageId": option.get("pageId"), "draftPageId": option.get("draftId"), "sectionIds": option.get("sectionIds", []), "draftSectionIds": option.get("draftSectionIds", []), "url": option.get("sourceUrl")}
            # Current multi-Site catalogs identify the source for every choice.
            # Retain legacy single-source briefs only when the catalog has no
            # per-option Site override; a missing Site must not erase that scope.
            expected_site = option.get("sourceSite", catalog.get("sourceSite"))
            if "sourceSite" in option or "site" in (section.get("sourceReference") or {}):
                expected_source["site"] = expected_site
            if "sourceSite" in section and source_identity(section["sourceSite"]) != source_identity(expected_site):
                errors.append(f"Source Site differs from catalog for {option_id}")
            if section.get("sourceIdsOnly") is not True or source_identity(section.get("sourceReference")) != source_identity(expected_source):
                errors.append(f"Source-only identity mapping differs from catalog for {option_id}")
            for key in ("publishedPageId", "draftPageId", "sectionIds", "draftSectionIds"):
                if source_identity(section.get(key)) != source_identity(expected_source[key]):
                    errors.append(f"Legacy source {key} differs from catalog for {option_id}")
            if module.get("sourceReference") != section.get("sourceReference"):
                errors.append(f"Module source reference disagrees with section for {option_id}")
            registered = index.get("modules", {}).get(option_id)
            if not isinstance(registered, dict):
                errors.append(f"No module registry entry for {option_id}")
                continue
            for key, value in registered.items():
                if module.get(key) != value:
                    errors.append(f"Exported module {key} differs from hash-bound registry for {option_id}")
            row["readiness"] = registered.get("readiness")
            row["installationMethod"] = registered.get("installationMethod")
            artifacts = registered.get("artifacts", [])
            if not isinstance(artifacts, list) or not artifacts:
                blockers.append(f"{option_id}: no complete hashed native installation artifacts")
                artifacts = []
            for artifact in artifacts:
                try:
                    path = local_path(repository, artifact.get("path"))
                    if artifact.get("sourceOnly") is not True or not DIGEST.fullmatch(artifact.get("sha256", "")) or sha256(path.read_bytes()) != artifact["sha256"]:
                        raise ValueError("source-only flag or artifact SHA256 mismatch")
                except (OSError, ValueError, TypeError) as exc:
                    row["artifactIntegrity"] = False
                    errors.append(f"{option_id}: artifact {artifact.get('path')}: {exc}")
            # A source Page CSS hash cannot establish a portable module. This narrow
            # positive case matches retained native proof; new capabilities need review.
            proven_k = (option_id == "food--variant-k-clubhouse" and registered.get("readiness") == "native-library-transfer-and-existing-page-recreation-verified-admin-scope"
                        and registered.get("installationMethod") == "native-concessions-menu-recreation-with-section-package"
                        and row["artifactIntegrity"] and len(artifacts) >= 2)
            row["packagingRequired"] = not proven_k
            if not proven_k:
                blockers.append(f"{option_id}: portable mixed-site installation not verified; prepare native-field/dependency/isolation packaging plan")
            if request and row["component"] not in ("navigation", "header", "footer"):
                names = request.get("sitePlan", {}).get("finalSectionNames", {}).get(option_id)
                if not isinstance(names, list) or not names or not all(final_name(name) for name in names):
                    blockers.append(f"{option_id}: final ordered internal Section Names unresolved")
        report["inputValid"] = not errors
        report["readyForNativePreflight"] = not errors and not blockers
        report["nextActions"] = (["Resolve invalid input/digest findings using the matching immutable package."] if errors else []) + (["Complete each named packaging, target, final-name or content blocker before assembly."] if blockers else ["Verify actual user scope, signed-in Chrome target and native capabilities before authorized draft creation."])
        if report["typographyReview"]["status"] == "requested-build-settings":
            report["nextActions"].append("Map requested headings/body/interface fonts to the authorized destination's native fields or scoped module styles; verify saved values and rendered desktop/phone output before claiming application.")
    except (OSError, ValueError, TypeError, AttributeError, KeyError) as exc:
        errors.append(str(exc))
    return report


def validate_request(request, brief_hash, repository, errors, blockers):
    if request.get("schema") != "fd-indy-build-request/v1" or request.get("pickerBriefSha256") != brief_hash:
        errors.append("Execution request schema or bound pickerBriefSha256 is invalid")
    if request.get("publicationPolicy") != "draft-only" or request.get("stopForReview") is not True:
        errors.append("Execution request must stop for review with draft-only publication policy")
    authorization = request.get("authorization", {})
    actions = authorization.get("actions", [])
    if not isinstance(actions, list) or any(action not in ACTIONS for action in actions):
        errors.append("Execution request contains unsupported actions, including any publication/deploy/delete scope")
        actions = []
    if authorization.get("basis") != "user-session" or not final_name(authorization.get("evidence")) or authorization.get("sourceMutationAllowed") is not False:
        blockers.append("Record actual scoped user instruction evidence and read-only source policy; a request cannot authorize itself")
    destination = request.get("destination", {})
    if not final_name(destination.get("region")):
        blockers.append("Exact destination Region unresolved")
    for kind in ("circuit", "site"):
        target = destination.get(kind, {})
        if not final_name(target.get("name")):
            blockers.append(f"Final destination {kind} name unresolved")
        if target.get("mode") not in ("create", "existing") or kind == "site" and target.get("mode") != "create":
            errors.append(f"Unsupported {kind} mode; this skill creates a new Site")
        if target.get("mode") == "create":
            if target.get("id") is not None:
                errors.append(f"New {kind} must not reuse a source/preassigned ID")
            if f"create-{kind}" not in actions:
                blockers.append(f"Actual create-{kind} scope is unresolved")
        elif not final_name(str(target.get("id") or "")):
            blockers.append(f"Existing {kind} needs a verified destination ID")
    starting = destination.get("startingTemplate", {})
    if not final_name(starting.get("name")) or starting.get("verifiedInNativeUi") is not True:
        blockers.append("Operational Starting Template must be resolved in native UI; visual variant is not that template")
    for action in ("save-drafts", "configure-theme", "configure-navigation"):
        if action not in actions:
            blockers.append(f"Full-site {action} scope is unresolved")
    hosting = request.get("hosting", {})
    if hosting.get("createConsumerWebsite") not in (True, False) or "createConsumerWebsite" not in hosting:
        blockers.append("Choose createConsumerWebsite explicitly; Site creation does not imply hosting")
    if hosting.get("createConsumerWebsite") is True and "create-consumer-website" not in actions:
        blockers.append("Consumer-site provisioning requires explicit separate scope and public-shell disclosure")
    if hosting.get("triggerDeploy") is not False or hosting.get("customDomain") is not None:
        errors.append("Deploy/domain changes are outside this draft-build request")
    plan = request.get("sitePlan", {})
    if not final_name(plan.get("homepage", {}).get("title")):
        blockers.append("Final homepage creation title unresolved")
    if plan.get("homepage", {}).get("assignAsHomepage") is True and "assign-homepage" not in actions:
        blockers.append("Homepage assignment can take effect immediately and needs explicit scope")
    if plan.get("sectionShowcases") is True:
        for component in REQUIRED[1:]:
            if not final_name(plan.get("showcaseTitles", {}).get(component)):
                blockers.append(f"Final {component} showcase Page creation title unresolved")
    content = request.get("content", {})
    if content.get("policy") not in ("same-approved-demo-content", "approved-customer-content"):
        blockers.append("Specify an approved demo or customer content policy and hash-bound manifest")
    if not content.get("seedManifestPath") or not content.get("seedManifestSha256"):
        blockers.append("Approved content seed manifest is missing; export does not contain complete movies/food/venue data")
    else:
        try:
            if sha256(local_path(repository, content["seedManifestPath"]).read_bytes()) != content["seedManifestSha256"]:
                errors.append("Sample-content seed manifest SHA256 mismatch")
        except (OSError, ValueError, TypeError) as exc:
            errors.append(f"Sample-content seed manifest: {exc}")
    content_action = "configure-content" if content.get("policy") == "approved-customer-content" else "seed-sample-content"
    if content_action not in actions:
        blockers.append(f"Content creation/rebinding requires explicit {content_action} scope")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("brief", type=Path)
    parser.add_argument("--repository", required=True, type=Path)
    parser.add_argument("--request", type=Path)
    parser.add_argument("--module-index", default="data/build-modules.json")
    args = parser.parse_args()
    report = check(args.brief, args.repository, args.request, args.module_index)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report["errors"] else 2 if report["blockers"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
