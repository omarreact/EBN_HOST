#!/usr/bin/env python3
"""Block production uploads from replacing the working PHP, CDN, player, or catalogue."""
from pathlib import Path
from html.parser import HTMLParser
import sys

root = Path(__file__).resolve().parents[1]
site = root / "site"
required = {
    "index.html",
    "css/cinematic-polish.css",
    "js/cinematic-polish.js",
}
allowed = required | {".gitkeep"}

present = {str(p.relative_to(site)) for p in site.rglob("*") if p.is_file()}
missing = required - present
unexpected = present - allowed
if missing or unexpected:
    print("Refusing UI release: missing or non-UI files detected.")
    for p in sorted(missing):
        print("MISSING:", p)
    for p in sorted(unexpected):
        print("NON-UI FILE:", p)
    sys.exit(1)

class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts = set()
        self.styles = set()
        self.app = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script" and a.get("src"):
            self.scripts.add(a["src"].split("?")[0])
        if tag == "link" and a.get("rel") == "stylesheet":
            self.styles.add(a.get("href", "").split("?")[0])
        if tag == "div" and a.get("id") == "app":
            self.app = True

refs = References()
refs.feed((site / "index.html").read_text(encoding="utf-8"))
scripts = {
    "https://cdn.tailwindcss.com",
    "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js",
    "data/catalogue.js",
    "js/app.bundle.js",
    "js/cinematic-polish.js",
}
styles = {"css/styles.css", "css/cinematic-polish.css"}
if not refs.app or not scripts.issubset(refs.scripts) or not styles.issubset(refs.styles):
    sys.exit("Refusing UI release: original player/CDN/catalogue references changed.")
print("UI-only verification passed: original HLS, player, catalogue and base styling references retained.")
