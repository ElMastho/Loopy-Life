"""Prepares a release: python3 tools/release.py <patch|minor|major|X.Y.Z>

Versions follow semantic versioning (major.minor.patch):
- patch (1.0.0 -> 1.0.1): a fix, a wording change, a few questions,
- minor (1.0.1 -> 1.1.0): a new feature, game, option or subject,
- major (1.1.0 -> 2.0.0): a big change, for example to saved stories.

Sets the version everywhere it lives, so phones get the new files right away:
- APP_VERSION in js/config.js and version.json (the update banner compares the two),
- the ?v= of every file in index.html,
- the cache name and the offline file list (CORE) in sw.js, rebuilt from index.html and data/.
Also adds a heading for the new version at the top of CHANGELOG.md, to fill in.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


def write(path, text):
    with open(os.path.join(ROOT, path), "w", encoding="utf-8") as f:
        f.write(text)


def sub_once(pattern, repl, text, what):
    new, n = re.subn(pattern, repl, text)
    if n != 1:
        sys.exit(f"{what}: expected 1 match, found {n}")
    return new


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    current = re.search(r'const APP_VERSION = "(\d+)\.(\d+)\.(\d+)";', read("js/config.js"))
    if not current:
        sys.exit("APP_VERSION not found in js/config.js")
    major, minor, patch = map(int, current.groups())
    arg = sys.argv[1]
    if arg == "patch":
        v = f"{major}.{minor}.{patch + 1}"
    elif arg == "minor":
        v = f"{major}.{minor + 1}.0"
    elif arg == "major":
        v = f"{major + 1}.0.0"
    elif re.fullmatch(r"\d+\.\d+\.\d+", arg):
        v = arg
    else:
        sys.exit(__doc__)

    write("js/config.js", sub_once(r'const APP_VERSION = "[^"]*";', f'const APP_VERSION = "{v}";', read("js/config.js"), "APP_VERSION"))
    write("version.json", json.dumps({"version": v}) + "\n")
    log = read("CHANGELOG.md")
    if f"## {v}" not in log:
        head, sep, rest = log.partition("\n## ")
        write("CHANGELOG.md", f"{head.rstrip()}\n\n## {v}\n\n- \n" + (f"\n## {rest}" if sep else ""))

    html = re.sub(r"\?v=[0-9.]+", f"?v={v}", read("index.html"))
    write("index.html", html)

    # everything the page needs offline: the page, its styles and scripts, the question bank, the icons
    assets = re.findall(r'(?:src|href)="([^"]+\?v=[0-9.]+)"', html)
    data = ["data/subjects.json"]
    index = json.loads(read("data/subjects.json"))
    data += [f"data/questions/{s['id']}.json" for s in index["subjects"]]
    data += [f"data/pools/{p}.json" for p in index["pools"]]
    core = ["./", "index.html"] + assets + [f"{d}?v={v}" for d in data]
    core += ["manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"]
    for path in core:
        clean = path.split("?")[0]
        if clean not in ("./",) and not os.path.exists(os.path.join(ROOT, clean)):
            sys.exit(f"missing file: {clean}")
    core_js = "const CORE = [\n" + "".join(f'  "{p}",\n' for p in core) + "];"
    sw = read("sw.js")
    sw = sub_once(r'const CACHE = "loopy-life-v[0-9.]+";', f'const CACHE = "loopy-life-v{v}";', sw, "CACHE")
    sw = sub_once(r"const CORE = \[[^\]]*\];", lambda m: core_js, sw, "CORE")
    write("sw.js", sw)
    print(f"version {v}: {len(core)} files cached offline")


if __name__ == "__main__":
    main()
