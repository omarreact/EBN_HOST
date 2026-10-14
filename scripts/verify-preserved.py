#!/usr/bin/env python3
"""Block cPanel uploads if original user-provided PHP, APIs, CDN or player code changes."""
import hashlib
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
expected = json.loads((root / "scripts/protected-digests.json").read_text())
site = root / "site"
missing = [name for name in ("index.html", "js/cinematic-polish.js", "css/cinematic-polish.css") if not (site / name).is_file()]
changed = [
    name for name, sha in expected.items()
    if not (site / name).is_file()
    or hashlib.sha256((site / name).read_bytes()).hexdigest() != sha
]
if missing or changed:
    print("Blocked: cPanel package is incomplete or protected playback files differ.")
    for name in missing:
        print("MISSING:", name)
    for name in changed:
        print("MISSING OR MODIFIED PROTECTED FILE:", name)
    sys.exit(1)
print(f"Verified {len(expected)} original playback/API/CDN/catalogue files.")
