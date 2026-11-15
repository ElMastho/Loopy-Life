"""Checks that a release is consistent: python3 tools/check_release.py

The version must be the same in js/config.js, version.json, every ?v= of index.html and the
service worker; the service worker must keep every script, style and question file offline;
CHANGELOG.md must have a heading for the version. Run tools/release.py to fix most of it.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


errors = []
version = json.loads(read("version.json"))["version"]
config = re.search(r'APP_VERSION = "([0-9.]+)"', read("js/config.js"))
if not config or config.group(1) != version:
    errors.append(f"js/config.js APP_VERSION is {config and config.group(1)}, version.json says {version}")

html = read("index.html")
for v in set(re.findall(r"\?v=([0-9.]+)", html)):
    if v != version:
        errors.append(f"index.html loads a file with ?v={v}, expected {version}")

sw = read("sw.js")
if f'const CACHE = "loopy-life-v{version}";' not in sw:
    errors.append(f"sw.js cache name is not loopy-life-v{version}")
core = set(p.split("?")[0] for p in re.findall(r'^\s*"([^"]+)",$', sw, re.M))
needed = set(p.split("?")[0] for p in re.findall(r'(?:src|href)="([^"]+\?v=[0-9.]+)"', html))
index = json.loads(read("data/subjects.json"))
needed |= {"data/subjects.json"}
needed |= {f"data/questions/{s['id']}.json" for s in index["subjects"]}
needed |= {f"data/pools/{p}.json" for p in index["pools"]}
for path in sorted(needed - core):
    errors.append(f"sw.js does not keep {path} offline")
for path in sorted(core):
    if path != "./" and not os.path.exists(os.path.join(ROOT, path)):
        errors.append(f"sw.js lists a missing file: {path}")

if f"## {version}" not in read("CHANGELOG.md"):
    errors.append(f"CHANGELOG.md has no heading for {version}")

for e in errors:
    print("error:", e)
print(f"version {version}: {'OK' if not errors else f'{len(errors)} error(s)'}")
sys.exit(1 if errors else 0)
