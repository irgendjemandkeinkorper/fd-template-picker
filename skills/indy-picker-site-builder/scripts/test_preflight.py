"""Local fixture tests; these are not native INDY provisioning/QA evidence."""
import copy
import json
import tempfile
import unittest
from pathlib import Path

from preflight import CONTRAST_ACKNOWLEDGMENT, CONTRAST_REVIEW_POLICY, REQUIRED, ROLES, check, local_path, sha256

REFERENCE_ROLLOUT_VARIANTS = ("variant-a-circuit", "variant-b-rep", "variant-c-late", "variant-d-odd", "variant-e-grid", "variant-f-concrete", "variant-g-cut", "variant-h-storybook", "variant-i-ma")


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    return sha256(path.read_bytes())


class PreflightTests(unittest.TestCase):
    def setUp(self):
        # Keep test fixtures beneath this explicitly writable staged package.
        self.temp = tempfile.TemporaryDirectory(prefix="indy-skill-fixture-", dir=Path(__file__).resolve().parents[1])
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.repo = self.root / "repository"
        self.repo.mkdir()
        (self.repo / "source.css").write_text("&.fixture { color: var(--q-dark); }\n", encoding="utf-8")
        artifact = {"path": "source.css", "sha256": sha256((self.repo / "source.css").read_bytes()), "purpose": "Source Page CSS only", "sourceOnly": True}
        slots, sections, modules, registry, confirmed = [], [], [], {}, {}
        variant = REFERENCE_ROLLOUT_VARIANTS[0]
        for position, component in enumerate(REQUIRED):
            slot = "header" if component == "navigation" else "events" if component == "private-parties" else component
            option_id = f"{slot}--{variant}"
            option = {"id": option_id, "variant": variant, "canonicalComponent": component, "pageId": "5659", "draftId": "5660", "sectionIds": [str(100 + position)], "draftSectionIds": [str(200 + position)], "sourceUrl": "https://source.invalid/variant-a/"}
            slots.append({"id": slot, "options": [option]})
            source = {"publishedPageId": option["pageId"], "draftPageId": option["draftId"], "sectionIds": option["sectionIds"], "draftSectionIds": option["draftSectionIds"], "url": option["sourceUrl"]}
            sections.append({"position": position + 1, "slot": slot, "included": True, "optionId": option_id, "variant": variant, "canonicalComponent": component, "sourceIdsOnly": True, "sourceReference": source, **{key: source[key] for key in ("publishedPageId", "draftPageId", "sectionIds", "draftSectionIds")}})
            entry = {"moduleVersion": 1, "readiness": "unverified-portability", "installationMethod": "manual-source-review-and-native-recreation", "artifacts": [artifact], "limitations": ["Not portable proof"]}
            registry[option_id] = entry
            modules.append({"component": component, "slot": slot, "optionId": option_id, "sourceReference": source, **entry})
            confirmed[component] = option_id
        source_site = {"region": "US-BETA", "circuit": "INDY Demo", "site": "Adam Template Testing 2"}
        catalog_hash = write_json(self.repo / "catalog.json", {"generatedAt": "2026-10-25T00:00:00Z", "sourceSite": source_site, "slots": slots})
        index = {"schema": "fd-picker-module-index/v1", "catalogSha256": catalog_hash, "sourceOnly": True, "modules": registry}
        index_hash = write_json(self.repo / "data/build-modules.json", index)
        roles = {role: "#183B4E" for role in ROLES}
        roles.update(secondary="#F4EEE4", background="#F4EEE4", accent="#F4EEE4")
        confirmed["colors"] = "palette/v1|" + "|".join(f"{role}:{roles[role]}" for role in ROLES) + "|header:dark|accent:secondary"
        self.brief = {"schema": "fd-template-picker/v3", "sourceSite": source_site, "palette": {"version": 1, "roles": roles, "nativeBindings": {"header": {"templateRole": "dark"}, "accent": {"templateRole": "secondary"}}}, "brandColors": {key: roles[key] for key in ("primary", "secondary")}, "workflow": {"confirmed": confirmed}, "sections": sections,
                      "buildContract": {"version": 1, "publicationPolicy": "draft-only", "destination": None, "destinationAuthorizationRequired": True, "sourceIdsAreDestinationIds": False, "catalog": {"sha256": catalog_hash}, "moduleIndex": {"sha256": index_hash, "schema": index["schema"]}, "modules": modules, "componentOrder": list(REQUIRED), "checklistComplete": True}}
        self.brief_path = self.root / "brief.json"
        brief_hash = write_json(self.brief_path, self.brief)
        seed_hash = write_json(self.repo / "sample-seed.json", {"schema": "fixture-only", "records": []})
        self.request = {"schema": "fd-indy-build-request/v1", "pickerBriefSha256": brief_hash, "destination": {"region": "US-BETA", "circuit": {"mode": "create", "name": "Website Templates", "id": None}, "site": {"mode": "create", "name": "Fixture Review Site", "id": None}, "startingTemplate": {"name": "Fixture operational seed", "verifiedInNativeUi": True}}, "authorization": {"basis": "user-session", "evidence": "Fixture instruction; not actual user/native authorization", "actions": ["create-circuit", "create-site", "save-drafts", "configure-theme", "configure-navigation", "seed-sample-content"], "sourceMutationAllowed": False}, "hosting": {"createConsumerWebsite": False, "triggerDeploy": False, "customDomain": None}, "publicationPolicy": "draft-only", "designScope": {"allowedVariants": list(REFERENCE_ROLLOUT_VARIANTS)}, "sitePlan": {"homepage": {"title": "Home", "assignAsHomepage": False}, "sectionShowcases": True, "showcaseTitles": {component: component.title() for component in REQUIRED[1:]}, "finalSectionNames": {part["optionId"]: [f"Fixture {part['canonicalComponent']}"] for part in sections[1:]}}, "content": {"policy": "same-approved-demo-content", "seedManifestPath": "sample-seed.json", "seedManifestSha256": seed_hash}, "stopForReview": True}
        self.request_path = self.root / "request.json"
        write_json(self.request_path, self.request)

    def run_check(self, brief=None, request=None):
        if brief is not None:
            self.request["pickerBriefSha256"] = write_json(self.brief_path, brief)
        if request is not None:
            self.request = request
        write_json(self.request_path, self.request)
        return check(self.brief_path, self.repo, self.request_path)

    def test_source_review_is_not_portability(self):
        result = self.run_check()
        self.assertEqual([], result["errors"])
        self.assertTrue(result["inputValid"])
        self.assertFalse(result["readyForNativePreflight"])
        self.assertEqual(6, sum(part["packagingRequired"] for part in result["modules"]))
        self.assertFalse(result["nativeAuthorizationEstablished"])

    def test_hash_bound_catalog_change_rejected(self):
        with (self.repo / "catalog.json").open("a", encoding="utf-8") as stream:
            stream.write(" ")
        self.assertTrue(any("catalog SHA256" in issue for issue in self.run_check()["errors"]))

    def test_artifact_change_rejected_without_touching_export(self):
        (self.repo / "source.css").write_text("body { color: red }", encoding="utf-8")
        result = self.run_check()
        self.assertTrue(any("artifact" in issue for issue in result["errors"]))
        self.assertTrue(all(not part["artifactIntegrity"] for part in result["modules"]))

    def test_export_cannot_upgrade_registry_readiness(self):
        data = copy.deepcopy(self.brief)
        data["buildContract"]["modules"][0]["readiness"] = "verified"
        self.assertTrue(any("readiness differs" in issue for issue in self.run_check(data)["errors"]))

    def test_source_only_target_rules(self):
        data = copy.deepcopy(self.brief)
        data["buildContract"]["destination"] = {"siteId": "170"}
        self.assertTrue(any("source-only" in issue for issue in self.run_check(data)["errors"]))
        self.request["destination"]["site"]["id"] = "170"
        self.assertTrue(any("must not reuse" in issue for issue in self.run_check()["errors"]))

    def test_publish_deploy_and_domain_outside_draft_contract(self):
        self.request["authorization"]["actions"].append("publish")
        self.request["hosting"]["triggerDeploy"] = True
        self.request["hosting"]["customDomain"] = "https://customer.invalid"
        result = self.run_check()
        self.assertTrue(any("unsupported actions" in issue for issue in result["errors"]))
        self.assertTrue(any("Deploy/domain" in issue for issue in result["errors"]))

    def test_palette_change_invalidates_confirmation_and_checks_contrast(self):
        data = copy.deepcopy(self.brief)
        data["palette"]["roles"]["dark"] = "#F4EEE4"
        result = self.run_check(data)
        self.assertTrue(any("Palette confirmation" in issue for issue in result["blockers"]))
        self.assertTrue(any("dark/background" in issue for issue in result["blockers"]))

    def test_independent_header_choice_does_not_erase_binding_caveat(self):
        data = copy.deepcopy(self.brief)
        data["palette"]["nativeBindings"]["header"]["templateRole"] = "header"
        self.assertTrue(any("adapter-binding" in issue for issue in self.run_check(data)["errors"]))

    def current_palette(self, primary=None, acknowledge=False):
        data = copy.deepcopy(self.brief)
        for role in ("header", "accent"):
            data["palette"]["nativeBindings"][role]["templateRole"] = role
        if primary:
            data["palette"]["roles"].update(primary=primary, secondary="#FFFFFF")
            data["brandColors"].update(primary=primary, secondary="#FFFFFF")
        key = "palette/v1|" + "|".join(f"{role}:{data['palette']['roles'][role]}" for role in ROLES) + "|header:header|accent:accent"
        data["workflow"]["confirmed"]["colors"] = key
        if acknowledge:
            data["colorAcknowledgment"] = {"policy": CONTRAST_REVIEW_POLICY, "paletteKey": key,
                "acknowledgedAt": "2026-10-26T12:00:00.000Z", "statement": CONTRAST_ACKNOWLEDGMENT}
        return data

    def test_current_independent_palette_contract_is_accepted(self):
        result = self.run_check(self.current_palette())
        self.assertEqual([], result["errors"])
        self.assertTrue(result["colorReview"]["passesNormalText"])
        self.assertFalse(any("Palette" in issue or "contrast" in issue for issue in result["blockers"]))

    def test_acknowledged_warning_palette_is_review_only(self):
        result = self.run_check(self.current_palette("#FF0000", acknowledge=True))
        self.assertEqual([], result["errors"])
        self.assertEqual("acknowledged-for-review", result["colorReview"]["status"])
        self.assertFalse(result["colorReview"]["passesNormalText"])
        self.assertTrue(result["colorReview"]["requiresRenderedReview"])
        self.assertFalse(any("contrast" in issue for issue in result["blockers"]))
        self.assertFalse(result["readyForNativePreflight"])
        self.assertFalse(result["nativeAuthorizationEstablished"])

    def test_warning_palette_without_acknowledgment_stays_blocked(self):
        result = self.run_check(self.current_palette("#FF0000"))
        self.assertEqual("acknowledgment-required", result["colorReview"]["status"])
        self.assertTrue(any("contrast needs" in issue for issue in result["blockers"]))

    def test_any_role_change_invalidates_prior_acknowledgment(self):
        data = self.current_palette("#FF0000", acknowledge=True)
        data["palette"]["roles"]["warning"] = "#FFCC00"
        data["workflow"]["confirmed"]["colors"] = data["workflow"]["confirmed"]["colors"].replace("warning:#183B4E", "warning:#FFCC00")
        result = self.run_check(data)
        self.assertEqual("acknowledgment-required", result["colorReview"]["status"])
        self.assertFalse(any("Palette confirmation" in issue for issue in result["blockers"]))

    def test_invalid_acknowledgment_metadata_cannot_bypass_warning(self):
        for field, value in (("policy", "unknown"), ("statement", "yes"), ("acknowledgedAt", "invalid")):
            with self.subTest(field=field):
                data = self.current_palette("#FF0000", acknowledge=True)
                data["colorAcknowledgment"][field] = value
                self.assertFalse(self.run_check(data)["colorReview"]["acknowledgedForReview"])

    def test_unrounded_three_to_one_floor_cannot_be_acknowledged(self):
        for color, allowed in (("#949494", True), ("#959595", False)):
            with self.subTest(color=color):
                result = self.run_check(self.current_palette(color, acknowledge=True))
                self.assertEqual(allowed, result["colorReview"]["acknowledgedForReview"])
                self.assertEqual(not allowed, any("3:1 minimum" in issue for issue in result["blockers"]))

    def test_module_component_cannot_be_relabelled(self):
        data = copy.deepcopy(self.brief)
        data["buildContract"]["modules"][0]["component"] = "hero"
        data["buildContract"]["componentOrder"][0] = "hero"
        self.assertTrue(any("Canonical component" in issue for issue in self.run_check(data)["errors"]))

    def test_missing_final_names_and_starting_template_block(self):
        self.request["sitePlan"]["finalSectionNames"] = {}
        self.request["destination"]["startingTemplate"]["verifiedInNativeUi"] = False
        result = self.run_check()
        self.assertTrue(any("final ordered" in issue for issue in result["blockers"]))
        self.assertTrue(any("Starting Template" in issue for issue in result["blockers"]))

    def test_missing_request_is_not_implied_by_source_ids(self):
        result = check(self.brief_path, self.repo)
        self.assertEqual([], result["errors"])
        self.assertTrue(any("destination permission" in issue for issue in result["blockers"]))

    def test_no_local_write_side_effect(self):
        before = {str(path): path.read_bytes() for path in self.root.rglob("*") if path.is_file()}
        check(self.brief_path, self.repo, self.request_path)
        after = {str(path): path.read_bytes() for path in self.root.rglob("*") if path.is_file()}
        self.assertEqual(before, after)

    def test_older_selection_requires_migration(self):
        data = copy.deepcopy(self.brief)
        data["schema"] = "fd-template-picker/v2"
        self.assertTrue(any("v3 JSON" in issue for issue in self.run_check(data)["errors"]))

    def test_new_site_creation_does_not_authorize_hosting(self):
        self.request["hosting"]["createConsumerWebsite"] = True
        self.assertTrue(any("Consumer-site provisioning" in issue for issue in self.run_check()["blockers"]))

    def test_explicit_consumer_creation_keeps_manual_deploy_disabled(self):
        self.request["hosting"]["createConsumerWebsite"] = True
        self.request["authorization"]["actions"].append("create-consumer-website")
        result = self.run_check()
        self.assertEqual([], result["errors"])
        self.assertFalse(any("Consumer-site provisioning" in issue for issue in result["blockers"]))
        self.assertFalse(self.request["hosting"]["triggerDeploy"])
        self.assertTrue(all(part["packagingRequired"] for part in result["modules"]))

    def test_artifact_cannot_escape_repository_or_be_absolute(self):
        for path in ("../outside.css", str(self.root / "outside.css"), "C:\\other\\source.css"):
            with self.subTest(path=path), self.assertRaises(ValueError):
                local_path(self.repo, path)

    def test_legacy_numeric_source_ids_keep_identity_structure(self):
        data = copy.deepcopy(self.brief)
        source = data["sections"][0]["sourceReference"]
        source["publishedPageId"] = int(source["publishedPageId"])
        data["sections"][0]["publishedPageId"] = source["publishedPageId"]
        data["buildContract"]["modules"][0]["sourceReference"] = source
        self.assertEqual([], self.run_check(data)["errors"])

    def test_current_source_site_identity_is_checked(self):
        data = copy.deepcopy(self.brief)
        site = data["sourceSite"]
        for section, module in zip(data["sections"], data["buildContract"]["modules"]):
            section["sourceReference"]["site"] = site
            section["sourceSite"] = site
            module["sourceReference"] = copy.deepcopy(section["sourceReference"])
        self.assertEqual([], self.run_check(data)["errors"])
        data["sections"][0]["sourceReference"]["site"] = {**site, "site": "Different Site"}
        self.assertTrue(any("Source-only identity" in issue for issue in self.run_check(data)["errors"]))

    def test_per_option_site_identity_cannot_be_omitted(self):
        catalog = json.loads((self.repo / "catalog.json").read_text(encoding="utf-8"))
        catalog["slots"][0]["options"][0]["sourceSite"] = {"siteId": 193, "site": "Showcase"}
        catalog_hash = write_json(self.repo / "catalog.json", catalog)
        index = json.loads((self.repo / "data/build-modules.json").read_text(encoding="utf-8"))
        index["catalogSha256"] = catalog_hash
        self.brief["buildContract"]["catalog"]["sha256"] = catalog_hash
        self.brief["buildContract"]["moduleIndex"]["sha256"] = write_json(self.repo / "data/build-modules.json", index)
        self.assertTrue(any("Source-only identity" in issue for issue in self.run_check(self.brief)["errors"]))

    def test_no_content_seed_is_reported_even_with_complete_checklist(self):
        self.request["content"]["seedManifestPath"] = None
        result = self.run_check()
        self.assertEqual([], result["errors"])
        self.assertTrue(any("seed manifest is missing" in issue for issue in result["blockers"]))

    def rebind_fixture_variant(self, variant):
        """Make a matching new catalog/brief, rather than editing a pinned export."""
        previous = REFERENCE_ROLLOUT_VARIANTS[0]
        replace = lambda value: json.loads(json.dumps(value).replace(previous, variant))
        catalog = replace(json.loads((self.repo / "catalog.json").read_text(encoding="utf-8")))
        index = replace(json.loads((self.repo / "data/build-modules.json").read_text(encoding="utf-8")))
        self.brief, self.request = replace(self.brief), replace(self.request)
        catalog_hash = write_json(self.repo / "catalog.json", catalog)
        index["catalogSha256"] = catalog_hash
        self.brief["buildContract"]["catalog"]["sha256"] = catalog_hash
        self.brief["buildContract"]["moduleIndex"]["sha256"] = write_json(self.repo / "data/build-modules.json", index)

    def test_general_builder_accepts_catalog_variants_outside_reference_rollout(self):
        self.rebind_fixture_variant("variant-z-customer")
        self.request.pop("designScope")
        result = self.run_check(self.brief)
        self.assertEqual([], result["errors"])
        self.assertFalse(any("outside" in issue or "beyond A" in issue for issue in result["blockers"]))
        self.assertTrue(all(part["packagingRequired"] for part in result["modules"]))

    def test_explicit_request_design_restriction_is_still_enforced(self):
        self.rebind_fixture_variant("variant-z-customer")
        self.request["designScope"] = {"allowedVariants": list(REFERENCE_ROLLOUT_VARIANTS)}
        result = self.run_check(self.brief)
        self.assertEqual([], result["errors"])
        self.assertEqual(6, sum("outside the explicit design scope" in issue for issue in result["blockers"]))

    def test_customer_destination_and_content_are_not_demo_defaults(self):
        self.request["destination"]["region"] = "EU-TEST"
        self.request["destination"]["circuit"]["name"] = "Customer Cinema Group"
        self.request["content"]["policy"] = "approved-customer-content"
        self.request["authorization"]["actions"].remove("seed-sample-content")
        self.request["authorization"]["actions"].append("configure-content")
        result = self.run_check()
        self.assertEqual([], result["errors"])
        self.assertFalse(any("content" in issue.lower() or "scope is unresolved" in issue for issue in result["blockers"]))
        self.assertFalse(result["nativeAuthorizationEstablished"])


if __name__ == "__main__":
    unittest.main()
