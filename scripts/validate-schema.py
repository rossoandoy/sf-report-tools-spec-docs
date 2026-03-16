#!/usr/bin/env python3
"""
validate-schema.py — manabie-erp-schema.json の整合性チェック

チェック項目:
  1. 全オブジェクトに必須フィールド (name, api_name, domain, fields, lookups) がある
  2. domain が有効な値 (billing, lesson, student, exam, staff, event, core, other)
  3. lookups の target が schema 内に存在する
  4. lookups の source が自オブジェクトと一致する
  5. fields[].required が boolean
  6. domain-summary.json との整合性
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = ROOT / "data" / "manabie-erp-schema.json"
DOMAIN_SUMMARY_PATH = ROOT / "data" / "domain-summary.json"

VALID_DOMAINS = {"billing", "lesson", "student", "exam", "staff", "event", "core", "other"}
REQUIRED_OBJECT_FIELDS = {"name", "api_name", "domain", "fields", "lookups"}

errors: list[str] = []
warnings: list[str] = []


def error(msg: str):
    errors.append(msg)
    print(f"  ERROR: {msg}", file=sys.stderr)


def warn(msg: str):
    warnings.append(msg)
    print(f"  WARN: {msg}", file=sys.stderr)


def validate_object(api_name: str, obj: dict, all_objects: set[str]):
    """1オブジェクトの検証"""
    # 必須フィールド
    for field_name in REQUIRED_OBJECT_FIELDS:
        if field_name not in obj:
            error(f"{api_name}: missing required field '{field_name}'")

    # domain
    domain = obj.get("domain")
    if domain and domain not in VALID_DOMAINS:
        error(f"{api_name}: invalid domain '{domain}'")

    # fields
    fields = obj.get("fields", [])
    if not isinstance(fields, list):
        error(f"{api_name}: 'fields' is not an array")
    else:
        for i, field in enumerate(fields):
            req = field.get("required")
            if not isinstance(req, bool):
                error(f"{api_name}.fields[{i}]: 'required' is not boolean (got {type(req).__name__}: {req})")

    # lookups
    lookups = obj.get("lookups", [])
    if not isinstance(lookups, list):
        error(f"{api_name}: 'lookups' is not an array")
    else:
        for i, lookup in enumerate(lookups):
            # source チェック
            if lookup.get("source") != api_name:
                error(f"{api_name}.lookups[{i}]: source '{lookup.get('source')}' != '{api_name}'")

            # target が存在するか
            target = lookup.get("target")
            if target and target not in all_objects:
                warn(f"{api_name}.lookups[{i}]: target '{target}' not found in schema")

            # type チェック
            ltype = lookup.get("type")
            if ltype not in ("Lookup", "MasterDetail"):
                error(f"{api_name}.lookups[{i}]: invalid type '{ltype}'")


def validate_domain_summary(schema: dict, domain_summary: dict):
    """domain-summary.json との整合性チェック"""
    print("\nChecking domain-summary.json consistency...")

    for domain, info in domain_summary.items():
        for obj_name in info["objects"]:
            if obj_name not in schema:
                warn(f"domain-summary[{domain}]: '{obj_name}' not in schema")
            elif schema[obj_name].get("domain") != domain:
                error(f"domain-summary[{domain}]: '{obj_name}' has domain '{schema[obj_name].get('domain')}' in schema")


def main():
    if not SCHEMA_PATH.exists():
        print(f"ERROR: Schema file not found: {SCHEMA_PATH}", file=sys.stderr)
        sys.exit(1)

    print(f"Validating: {SCHEMA_PATH}")
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)

    all_objects = set(schema.keys())
    print(f"Objects: {len(all_objects)}")

    for api_name, obj in schema.items():
        validate_object(api_name, obj, all_objects)

    # domain-summary との整合性
    if DOMAIN_SUMMARY_PATH.exists():
        with open(DOMAIN_SUMMARY_PATH, "r", encoding="utf-8") as f:
            domain_summary = json.load(f)
        validate_domain_summary(schema, domain_summary)

    # サマリ
    print(f"\n{'='*40}")
    print(f"Errors:   {len(errors)}")
    print(f"Warnings: {len(warnings)}")

    if errors:
        print("\nValidation FAILED")
        sys.exit(1)
    else:
        print("\nValidation PASSED")
        sys.exit(0)


if __name__ == "__main__":
    main()
