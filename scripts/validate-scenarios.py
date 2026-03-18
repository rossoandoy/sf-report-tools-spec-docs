#!/usr/bin/env python3
"""
scenario-catalog.yaml と sf-report-knowledge.yaml の整合性検証スクリプト
"""

import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML is required. Install with: pip install pyyaml")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = ROOT / "data" / "manabie-erp-schema.json"
CATALOG_PATH = ROOT / "data" / "scenario-catalog.yaml"
KNOWLEDGE_PATH = ROOT / "data" / "sf-report-knowledge.yaml"

VALID_DOMAINS = {"billing", "lesson", "student", "exam", "staff", "event", "core", "other"}
VALID_DIFFICULTIES = {"basic", "intermediate", "advanced"}
VALID_REPORT_TYPES = {"standard", "custom", "joined"}

errors: list[str] = []
warnings: list[str] = []


def error(msg: str) -> None:
    errors.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


def load_schema() -> dict:
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        return json.load(f)


def load_yaml(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def validate_catalog(catalog: dict, schema: dict) -> None:
    object_names = set(schema.keys())

    if "version" not in catalog:
        error("scenario-catalog.yaml: missing 'version' field")
    if "scenarios" not in catalog:
        error("scenario-catalog.yaml: missing 'scenarios' field")
        return

    scenarios = catalog["scenarios"]
    if not isinstance(scenarios, list):
        error("scenario-catalog.yaml: 'scenarios' must be a list")
        return

    scenario_ids = set()
    domain_counts: dict[str, int] = {}

    for i, s in enumerate(scenarios):
        sid = s.get("id", f"<index {i}>")

        # ID uniqueness
        if sid in scenario_ids:
            error(f"{sid}: duplicate scenario ID")
        scenario_ids.add(sid)

        # Required fields
        for field in ["id", "domain", "title", "description", "user_story", "difficulty",
                       "objects", "sf_features", "pitfalls", "steps", "tags"]:
            if field not in s:
                error(f"{sid}: missing required field '{field}'")

        # Domain
        domain = s.get("domain", "")
        if domain not in VALID_DOMAINS:
            error(f"{sid}: invalid domain '{domain}'")
        domain_counts[domain] = domain_counts.get(domain, 0) + 1

        # Difficulty
        difficulty = s.get("difficulty", "")
        if difficulty not in VALID_DIFFICULTIES:
            error(f"{sid}: invalid difficulty '{difficulty}'")

        # Objects: primary must exist in schema
        objects = s.get("objects", {})
        primary = objects.get("primary", "")
        if primary and primary not in object_names:
            error(f"{sid}: primary object '{primary}' not found in schema")

        # Objects: related must exist in schema
        for rel in objects.get("related", []):
            rel_obj = rel.get("object", "")
            if rel_obj and rel_obj not in object_names:
                error(f"{sid}: related object '{rel_obj}' not found in schema")

        # SF features
        sf = s.get("sf_features", {})
        report_type = sf.get("report_type", "")
        if report_type not in VALID_REPORT_TYPES:
            error(f"{sid}: invalid report_type '{report_type}'")

        # Steps must be sequential
        steps = s.get("steps", [])
        for j, step in enumerate(steps):
            expected = j + 1
            actual = step.get("step", -1)
            if actual != expected:
                error(f"{sid}: step {j+1} has step number {actual}, expected {expected}")

        # Related scenarios reference check
        for ref in s.get("related_scenarios", []):
            if ref not in scenario_ids and ref not in {sc.get("id") for sc in scenarios}:
                warn(f"{sid}: related_scenario '{ref}' not found in catalog")

    # Check minimum scenario counts
    if len(scenarios) < 30:
        error(f"scenario-catalog.yaml: only {len(scenarios)} scenarios, minimum 30 required")

    # Check all 6 domains have scenarios
    required_domains = {"billing", "lesson", "exam", "staff", "student", "event"}
    for d in required_domains:
        if d not in domain_counts:
            error(f"scenario-catalog.yaml: no scenarios for domain '{d}'")

    print(f"  Scenarios: {len(scenarios)}")
    print(f"  Domains: {dict(sorted(domain_counts.items()))}")


def validate_knowledge(knowledge: dict) -> None:
    if "version" not in knowledge:
        error("sf-report-knowledge.yaml: missing 'version' field")

    # Concepts
    concepts = knowledge.get("concepts", {})
    required_concepts = {"custom_report_type", "joined_report", "bucket_field",
                         "cross_filter", "report_formula"}
    for c in required_concepts:
        if c not in concepts:
            error(f"sf-report-knowledge.yaml: missing concept '{c}'")
        else:
            concept = concepts[c]
            for field in ["sf_name", "business_name", "analogy", "when_to_use", "manabie_examples"]:
                if field not in concept:
                    error(f"sf-report-knowledge.yaml: concept '{c}' missing field '{field}'")

    print(f"  Concepts: {len(concepts)} ({', '.join(sorted(concepts.keys()))})")

    # Decision tree
    dt = knowledge.get("decision_tree", {})
    if "start" not in dt:
        error("sf-report-knowledge.yaml: decision_tree missing 'start'")
    if "nodes" not in dt:
        error("sf-report-knowledge.yaml: decision_tree missing 'nodes'")
    if "outcomes" not in dt:
        error("sf-report-knowledge.yaml: decision_tree missing 'outcomes'")

    nodes = dt.get("nodes", [])
    outcomes = dt.get("outcomes", {})
    node_ids = {n["id"] for n in nodes}
    outcome_ids = set(outcomes.keys())
    all_targets = node_ids | outcome_ids

    for node in nodes:
        nid = node.get("id", "?")
        # YAML parses unquoted yes/no as booleans True/False
        for direction in ["yes", "no", True, False]:
            if direction in node:
                target = node[direction]
                label = "yes" if direction in ("yes", True) else "no"
                if target not in all_targets:
                    error(f"sf-report-knowledge.yaml: node '{nid}' {label}='{target}' not found in nodes or outcomes")

    print(f"  Decision tree: {len(nodes)} nodes, {len(outcomes)} outcomes")


def main() -> int:
    print("=== Validating scenario-catalog.yaml ===")
    schema = load_schema()
    catalog = load_yaml(CATALOG_PATH)
    validate_catalog(catalog, schema)

    print("\n=== Validating sf-report-knowledge.yaml ===")
    knowledge = load_yaml(KNOWLEDGE_PATH)
    validate_knowledge(knowledge)

    if warnings:
        print(f"\n⚠ {len(warnings)} warning(s):")
        for w in warnings:
            print(f"  WARN: {w}")

    if errors:
        print(f"\n✗ {len(errors)} error(s):")
        for e in errors:
            print(f"  ERROR: {e}")
        return 1

    print(f"\n✓ All validations passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
