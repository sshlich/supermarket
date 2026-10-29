# Static item catalog: parse ItemDirectory factories in the decompiled C#.
# ponytail: regex over decompiled source, not a runtime dump; values set inside shared helpers are missed.
import re, json, glob, csv
SRC = "src/Assembly-CSharp/"
loc = {k: v for f in sorted(glob.glob("data/loc_en/*.json")) for k, v in json.load(open(f)).items()}
allsrc = {f: open(f).read() for f in glob.glob(SRC + "*.cs")}

def body_of(method, home):
    # brace-balanced body of "method(...) {", searching the directory's own file first
    pat = re.compile(r"\b" + re.escape(method) + r"\s*\([^;{)]*\)\s*\{")
    for text in [allsrc[home], *allsrc.values()]:
        m = pat.search(text)
        if not m:
            continue
        i, depth = m.end(), 1
        while depth and i < len(text):
            depth += {"{": 1, "}": -1}.get(text[i], 0); i += 1
        return text[m.end():i]
    return ""

rows = []
for f in sorted(glob.glob(SRC + "*Directory.cs")):
    text = allsrc[f]
    for m in re.finditer(r'^\s*Add\("([^"]+)",\s*\(\)\s*=>\s*([A-Za-z_][\w.]*)\(', text, re.M):
        ident, call = m.groups()
        body = body_of(call.split(".")[-1], f)
        ctx = m.group(0) + text[m.end():text.find("\n", m.end())] + body
        key = (re.search(r'(?:SetName\(|\bname\s*=\s*)LocHelper\.GetLocalized\w+\("([^"]+)"', ctx)
               or re.search(r'GetLocalized\w+\("([^"]+_name)"\)', ctx))
        val = re.search(r"unit(?:Base)?Value\s*=\s*(-?\d+)L?", body)
        if "Combat" in f:
            continue  # combat effects/abilities, not items
        rows.append({
            "id": ident,
            "directory": f.split("/")[-1][:-3],
            "name": loc.get(key.group(1), key.group(1)) if key else "",
            "value": int(val.group(1)) if val else "",
            "types": " ".join(dict.fromkeys(re.findall(r'SetGameItemType\("([^"]+)"', body))),
            "desc": loc.get(key.group(1).replace("_name", "_desc"), "") if key else "",
            "flavor": loc.get(key.group(1).replace("_name", "_flavor"), "") if key else "",
        })
with open("data/items.csv", "w", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=rows[0].keys()); w.writeheader(); w.writerows(rows)
named = sum(1 for r in rows if r["name"]); priced = sum(1 for r in rows if r["value"] != "")
print(len(rows), "entries,", named, "named,", priced, "priced")
assert len(rows) > 550 and named > 420, "parser regressed"
