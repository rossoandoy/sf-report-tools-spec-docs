#!/usr/bin/env python3
"""
enrich-schema.py — manabie-erp-schema.json を型定義に合わせて補完する

追加するフィールド:
  - 各オブジェクトに domain (domain-summary.json から逆引き)
  - 各オブジェクトに lookups 配列 (fields 内の Lookup/MasterDetail から抽出)
  - fields[].required を boolean に正規化

冪等: 何度実行しても同じ結果になる
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = ROOT / "data" / "manabie-erp-schema.json"
DOMAIN_SUMMARY_PATH = ROOT / "data" / "domain-summary.json"
OUTPUT_PATH = SCHEMA_PATH  # 上書き


def build_domain_map(domain_summary: dict) -> dict[str, str]:
    """オブジェクトAPI名 → ドメイン の逆引きマップを構築"""
    obj_to_domain: dict[str, str] = {}
    for domain, info in domain_summary.items():
        for obj_name in info["objects"]:
            obj_to_domain[obj_name] = domain
    return obj_to_domain


def extract_lookups(obj_api_name: str, fields: list[dict]) -> list[dict]:
    """fields から Lookup/MasterDetail 関係を抽出"""
    lookups = []
    for field in fields:
        if field.get("type") in ("Lookup", "MasterDetail") and field.get("referenceTo"):
            lookups.append({
                "field": field["api_name"],
                "source": obj_api_name,
                "target": field["referenceTo"],
                "type": field["type"],
            })
    return lookups


def normalize_required(value) -> bool:
    """required フィールドを boolean に正規化"""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() == "true"
    return False


def enrich(schema: dict, domain_map: dict[str, str]) -> dict:
    """スキーマを補完して返す"""
    enriched = {}

    for api_name, obj in schema.items():
        # domain を付与
        domain = domain_map.get(api_name, "other")

        # fields の required を boolean に正規化
        fields = obj.get("fields", [])
        for field in fields:
            field["required"] = normalize_required(field.get("required", False))

        # lookups を抽出
        lookups = extract_lookups(api_name, fields)

        enriched[api_name] = {
            "name": obj.get("name", api_name),
            "api_name": api_name,
            "domain": domain,
            "fields": fields,
            "lookups": lookups,
        }

    return enriched


def main():
    if not SCHEMA_PATH.exists():
        print(f"ERROR: Schema file not found: {SCHEMA_PATH}", file=sys.stderr)
        sys.exit(1)

    if not DOMAIN_SUMMARY_PATH.exists():
        print(f"ERROR: Domain summary not found: {DOMAIN_SUMMARY_PATH}", file=sys.stderr)
        sys.exit(1)

    print(f"Loading schema: {SCHEMA_PATH}")
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)

    print(f"Loading domain summary: {DOMAIN_SUMMARY_PATH}")
    with open(DOMAIN_SUMMARY_PATH, "r", encoding="utf-8") as f:
        domain_summary = json.load(f)

    domain_map = build_domain_map(domain_summary)
    print(f"Domain map: {len(domain_map)} objects mapped")

    enriched = enrich(schema, domain_map)

    # 統計
    total_objects = len(enriched)
    total_lookups = sum(len(obj["lookups"]) for obj in enriched.values())
    domains_used = set(obj["domain"] for obj in enriched.values())

    print(f"\nEnriched: {total_objects} objects, {total_lookups} lookups")
    print(f"Domains: {sorted(domains_used)}")

    # domain ごとのオブジェクト数を表示
    from collections import Counter
    domain_counts = Counter(obj["domain"] for obj in enriched.values())
    for domain, count in sorted(domain_counts.items()):
        print(f"  {domain}: {count} objects")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)

    print(f"\nWritten to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
