#!/usr/bin/env python3
"""Seed data into NocoBase collections using:
  POST {baseURL}/api/{collection}:create

Reads seed data from app-spec/app.yaml (seed: section).
"""

from __future__ import annotations

import argparse
import os
import sys
from typing import Any, Dict
from urllib.parse import urljoin

import requests
import yaml


def str_to_bool(s: str) -> bool:
    return s.strip().lower() in ("1", "true", "yes", "y", "on")


def build_headers(api_key: str, role: str | None) -> Dict[str, str]:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if role:
        headers["X-Role"] = role
    return headers


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--spec", default="app-spec/app.yaml")
    parser.add_argument("--base-url", default=os.getenv("NOCOBASE_BASE_URL", "").strip())
    parser.add_argument("--api-key", default=os.getenv("NOCOBASE_API_KEY", "").strip())
    parser.add_argument("--role", default=os.getenv("NOCOBASE_ROLE", "").strip())
    parser.add_argument("--timeout", type=int, default=int(os.getenv("NOCOBASE_TIMEOUT_SECONDS", "30")))
    parser.add_argument("--verify-ssl", default=os.getenv("NOCOBASE_VERIFY_SSL", "true"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not args.base_url:
        print("ERROR: missing --base-url (or NOCOBASE_BASE_URL).", file=sys.stderr)
        return 2
    if not args.api_key:
        print("ERROR: missing --api-key (or NOCOBASE_API_KEY).", file=sys.stderr)
        return 2

    verify_ssl = str_to_bool(args.verify_ssl)
    role = args.role if args.role else None
    headers = build_headers(args.api_key, role)

    with open(args.spec, "r", encoding="utf-8") as f:
        spec = yaml.safe_load(f)

    seed = spec.get("seed", {}) if isinstance(spec, dict) else {}
    if not seed:
        print("No seed data found in spec.")
        return 0

    base = args.base_url.rstrip("/") + "/"
    failures = 0

    for collection, rows in seed.items():
        if not isinstance(rows, list):
            print(f"WARNING: seed.{collection} is not a list; skipping.")
            continue

        endpoint = f"{base.rstrip('/')}/{collection}:create"
        for idx, row in enumerate(rows, start=1):
            if not isinstance(row, dict):
                print(f"WARNING: seed.{collection}[{idx}] is not an object; skipping.")
                continue

            if args.dry_run:
                print(f"DRY RUN: POST {endpoint} body={row}")
                continue

            resp = requests.post(endpoint, headers=headers, json=row, timeout=args.timeout, verify=verify_ssl)
            ok = 200 <= resp.status_code < 300
            print(f"[{collection} #{idx}] HTTP {resp.status_code} {'OK' if ok else 'FAIL'}")

            if not ok:
                failures += 1
                try:
                    print(resp.json())
                except Exception:
                    print(resp.text)

    return 0 if failures == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
