#!/usr/bin/env python3
"""Generic HTTP caller for NocoBase Resource:Action API.

Patterns used by NocoBase docs:
  GET  {baseURL}/api/{collection}:list
  POST {baseURL}/api/{collection}:create
  POST {baseURL}/api/{collection}:update?filterByTk={id}
  POST {baseURL}/api/{collection}:destroy?filterByTk={id}

Auth:
  Authorization: Bearer <API key>
Optional:
  X-Role: <roleName>

This script is intentionally generic: pass the API path (starting with /api/...).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict, Optional, Tuple
from urllib.parse import urlencode, urljoin
import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def str_to_bool(s: str) -> bool:
    return s.strip().lower() in ("1", "true", "yes", "y", "on")


def build_url(base_url: str, path: str, params: Dict[str, str]) -> str:
    base = base_url.rstrip("/")
    p = path.lstrip("/")
    url = f"{base}/{p}"
    if params:
        url = f"{url}?{urlencode(params)}"
    return url


def parse_kv_list(items: Optional[list[str]]) -> Dict[str, str]:
    out: Dict[str, str] = {}
    if not items:
        return out
    for item in items:
        if "=" not in item:
            raise ValueError(f"Expected key=value, got: {item}")
        k, v = item.split("=", 1)
        out[k.strip()] = v.strip()
    return out


def load_json_arg(json_inline: Optional[str], json_file: Optional[str]) -> Optional[Any]:
    if json_inline and json_file:
        raise ValueError("Use only one of --json or --json-file")
    if json_file:
        with open(json_file, "r", encoding="utf-8") as f:
            return json.load(f)
    if json_inline:
        return json.loads(json_inline)
    return None


def build_headers(api_key: str, role: Optional[str] = None, extra: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    headers: Dict[str, str] = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if role:
        headers["X-Role"] = role
    if extra:
        headers.update(extra)
    return headers


def request_nocobase(
    method: str,
    url: str,
    headers: Dict[str, str],
    body: Optional[Any],
    timeout_s: int,
    verify_ssl: bool,
) -> Tuple[int, str, Dict[str, Any]]:
    resp = requests.request(
        method=method.upper(),
        url=url,
        headers=headers,
        json=body,
        timeout=timeout_s,
        verify=verify_ssl,
    )
    content_type = resp.headers.get("Content-Type", "")
    parsed: Dict[str, Any] = {}
    if "application/json" in content_type:
        try:
            parsed = resp.json()
        except Exception:
            parsed = {"_raw": resp.text}
    else:
        parsed = {"_raw": resp.text}
    return resp.status_code, content_type, parsed


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=os.getenv("NOCOBASE_BASE_URL", "").strip(), help="e.g., https://my-nocobase")
    parser.add_argument("--api-key", default=os.getenv("NOCOBASE_API_KEY", "").strip(), help="API key (Bearer token)")
    parser.add_argument("--role", default=os.getenv("NOCOBASE_ROLE", "").strip(), help="Optional X-Role header value")
    parser.add_argument("--method", required=True, help="GET|POST|PUT|PATCH|DELETE")
    parser.add_argument("--path", required=True, help="API path, e.g. /api/todos:list")
    parser.add_argument("--param", action="append", help="Query param as key=value (repeatable)")
    parser.add_argument("--header", action="append", help="Extra header as key=value (repeatable)")
    parser.add_argument("--json", dest="json_inline", help="Inline JSON string body")
    parser.add_argument("--json-file", help="Path to JSON file body")
    parser.add_argument("--timeout", type=int, default=int(os.getenv("NOCOBASE_TIMEOUT_SECONDS", "30")), help="Request timeout seconds")
    parser.add_argument("--verify-ssl", default=os.getenv("NOCOBASE_VERIFY_SSL", "true"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not args.base_url:
        print("ERROR: missing --base-url (or NOCOBASE_BASE_URL).", file=sys.stderr)
        return 2
    if not args.api_key:
        print("ERROR: missing --api-key (or NOCOBASE_API_KEY).", file=sys.stderr)
        return 2

    params = parse_kv_list(args.param)
    extra_headers = parse_kv_list(args.header)
    body = load_json_arg(args.json_inline, args.json_file)
    verify_ssl = str_to_bool(args.verify_ssl)

    url = build_url(args.base_url, args.path, params)
    role = args.role if args.role else None
    headers = build_headers(api_key=args.api_key, role=role, extra=extra_headers)

    if args.dry_run:
        print("DRY RUN")
        print(json.dumps({"method": args.method.upper(), "url": url, "headers": headers, "body": body}, indent=2))
        return 0

    status, content_type, parsed = request_nocobase(
        method=args.method,
        url=url,
        headers=headers,
        body=body,
        timeout_s=args.timeout,
        verify_ssl=verify_ssl,
    )

    print(f"HTTP {status} ({content_type})")
    print(json.dumps(parsed, indent=2))
    return 0 if 200 <= status < 300 else 1


if __name__ == "__main__":
    raise SystemExit(main())
