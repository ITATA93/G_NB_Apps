#!/usr/bin/env python3
"""Dump NocoBase Swagger/OpenAPI JSON from the API documentation endpoints.

Typical endpoints (version dependent):
  /api/swagger:get
  /api/swagger:get?ns=core
  /api/swagger:get?ns=plugins
  /api/swagger:get?ns=collections
  /api/swagger:get?ns=collections/{name}

Use this to discover what exists in YOUR instance.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict
from urllib.parse import urlencode

import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def str_to_bool(s: str) -> bool:
    return s.strip().lower() in ("1", "true", "yes", "y", "on")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=os.getenv("NOCOBASE_BASE_URL", "").strip())
    parser.add_argument("--api-key", default=os.getenv("NOCOBASE_API_KEY", "").strip())
    parser.add_argument("--ns", default="collections", help="core|plugins|collections|...")
    parser.add_argument("--name", default="", help="Optional collection name")
    parser.add_argument("--out", default="swagger.json")
    parser.add_argument("--timeout", type=int, default=int(os.getenv("NOCOBASE_TIMEOUT_SECONDS", "30")))
    parser.add_argument("--verify-ssl", default=os.getenv("NOCOBASE_VERIFY_SSL", "true"))
    args = parser.parse_args()

    if not args.base_url:
        print("ERROR: missing --base-url (or NOCOBASE_BASE_URL).", file=sys.stderr)
        return 2
    if not args.api_key:
        print("ERROR: missing --api-key (or NOCOBASE_API_KEY).", file=sys.stderr)
        return 2

    verify_ssl = str_to_bool(args.verify_ssl)

    base = args.base_url.rstrip("/")
    if args.ns == "collections" and args.name:
        path = f"/api/swagger:get?{urlencode({'ns': f'collections/{args.name}'})}"
    else:
        path = f"/api/swagger:get?{urlencode({'ns': args.ns})}" if args.ns else "/api/swagger:get"

    url = f"{base}{path}"
    headers = {"Authorization": f"Bearer {args.api_key}", "Accept": "application/json"}

    resp = requests.get(url, headers=headers, timeout=args.timeout, verify=verify_ssl)
    try:
        data: Dict[str, Any] = resp.json()
    except Exception:
        print(f"ERROR: Non-JSON response. HTTP {resp.status_code}", file=sys.stderr)
        print(resp.text)
        return 1

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Wrote {args.out} (HTTP {resp.status_code})")
    return 0 if 200 <= resp.status_code < 300 else 1


if __name__ == "__main__":
    raise SystemExit(main())
