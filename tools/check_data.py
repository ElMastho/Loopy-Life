"""Checks the question bank in data/: python3 tools/check_data.py

Every entry needs a unique id, a text in every language, and (for subject questions)
the subject of its file and a depth of 1, 2 or 3. Prints a count per file.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors = []
seen = {}


def load(path):
    try:
        with open(os.path.join(ROOT, path), encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError) as e:
        errors.append(f"{path}: {e}")
        return None


def check_entries(path, items, langs, subject=None, depth=False):
    if not isinstance(items, list):
        errors.append(f"{path}: should be a list")
        return
    for i, q in enumerate(items):
        where = f"{path} #{i + 1}"
        qid = q.get("id")
        if not qid:
            errors.append(f"{where}: no id")
        elif qid in seen:
            errors.append(f"{where}: id {qid} already used in {seen[qid]}")
        else:
            seen[qid] = path
        text = q.get("text") or {}
        for lang in langs:
            if not str(text.get(lang, "")).strip():
                errors.append(f"{where} ({qid}): no {lang} text")
        if subject and q.get("subject") != subject:
            errors.append(f"{where} ({qid}): subject should be {subject}")
        if depth and q.get("depth") not in (1, 2, 3):
            errors.append(f"{where} ({qid}): depth should be 1, 2 or 3")
    print(f"  {path}: {len(items)}")


index = load("data/subjects.json")
if index:
    langs = index["languages"]
    for s in index["subjects"]:
        path = f"data/questions/{s['id']}.json"
        items = load(path)
        if items is not None:
            check_entries(path, items, langs, subject=s["id"], depth=True)
    for p in index["pools"]:
        path = f"data/pools/{p}.json"
        items = load(path)
        if items is not None:
            # date, couple, spicy and speed questions have a depth; votes and challenges do not
            check_entries(path, items, langs, depth=p not in ("who", "challenges"))
    listed = {f"{s['id']}.json" for s in index["subjects"]}
    for name in sorted(os.listdir(os.path.join(ROOT, "data/questions"))):
        if name not in listed:
            errors.append(f"data/questions/{name}: not listed in data/subjects.json")

print(f"{len(seen)} entries")
if errors:
    print("\n".join(errors))
    sys.exit(1)
print("ok")
