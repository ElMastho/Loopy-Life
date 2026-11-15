"""Prepares a release: python3 tools/release.py <version>

Sets the version everywhere it lives, so phones get the new files right away:
- APP_VERSION in js/config.js and version.json (the update banner compares the two),
- the ?v= of every file in index.html,
- the cache name and the offline file list (CORE) in sw.js, rebuilt from index.html and data/.
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
    if len(sys.argv) != 2 or not sys.argv[1].isdigit():
        sys.exit(__doc__)
    v = int(sys.argv[1])

    write("js/config.js", sub_once(r"const APP_VERSION = \d+;", f"const APP_VERSION = {v};", read("js/config.js"), "APP_VERSION"))
    write("version.json", json.dumps({"version": v}) + "\n")

    html = re.sub(r"\?v=\d+", f"?v={v}", read("index.html"))
    write("index.html", html)

    # everything the page needs offline: the page, its styles and scripts, the question bank, the icons
    assets = re.findall(r'(?:src|href)="([^"]+\?v=\d+)"', html)
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
    sw = sub_once(r'const CACHE = "loopy-life-v\d+";', f'const CACHE = "loopy-life-v{v}";', sw, "CACHE")
    sw = sub_once(r"const CORE = \[[^\]]*\];", lambda m: core_js, sw, "CORE")
    write("sw.js", sw)
    print(f"version {v}: {len(core)} files cached offline")


if __name__ == "__main__":
    main()
