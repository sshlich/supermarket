# Joins static + asset + runtime results into the unused / experimental / ghost content report:
# data/unused/*.json and UNUSED.md. Run after mine_static.py, mine_assets.py and (optionally) copying the
# PSDataDump output to data/runtime/.
import json, csv, glob, os, re, collections

S, A, R, U = "data/static/", "data/assets/", "data/runtime/", "data/unused/"
os.makedirs(U, exist_ok=True)
SRC = "src/Assembly-CSharp/"
files = {os.path.basename(f)[:-3]: open(f).read() for f in glob.glob(SRC + "*.cs")}
ids = json.load(open(S + "registered_ids.json"))
factories = json.load(open(S + "list_factories.json"))
classes = json.load(open(S + "classes.json"))
attached = json.load(open(A + "attached_scripts.json"))
sprites = json.load(open(A + "sprites.json"))
audio = json.load(open(A + "audio.json"))
items = {r["id"]: r for r in csv.DictReader(open("data/items.csv"))}
loc = {k: v for f in sorted(glob.glob("data/loc_en/*.json")) for k, v in json.load(open(f)).items()}
DEV = re.compile(r"Dev|Debug|Test|Console|Cheat")

# runtime (PSDataDump); missing -> static only
runtime_dirs = {os.path.basename(f)[:-5]: json.load(open(f)) for f in glob.glob(R + "directories/*/*.json")}
# loot: the vanilla tables are ScriptableObjects (mine_assets.py); the runtime registry is empty until a dumping-ground visit
loot = json.load(open(A + "loot_tables.json"))
in_loot = collections.defaultdict(list)
for tid, entries in loot["tables"].items():
    for e in entries:
        if e["enabled"]:
            in_loot[e["value"]].append(tid)
have_runtime = bool(runtime_dirs)

def body(cls, method):
    text = files.get(cls, "")
    m = re.search(r"\b" + re.escape(method) + r"\s*\([^;{)]*\)\s*\{", text)
    if not m:
        return ""
    i, depth = m.end(), 1
    while depth and i < len(text):
        depth += {"{": 1, "}": -1}.get(text[i], 0); i += 1
    return text[m.end():i]

def script_lines(src):
    # dialogue/text in source order: literals and localized keys resolved to English
    out = []
    for m in re.finditer(r'GetLocalized\w*\("([^"]+)"|SetText\([^,()]+,\s*"((?:[^"\\]|\\.)*)"|\b(?:displayName|name|newsName|title|shortDescription|flavorText)\s*=\s*"((?:[^"\\]|\\.)*)"', src):
        key, lit, field = m.groups()
        t = loc.get(key, "[" + key + "]") if key else (lit or field)
        if t and (not out or out[-1] != t):
            out.append(t)
    return out

def item_row(i):
    it = items.get(i, {})
    reg = ids[i]["registered_in"][0]
    rt = runtime_dirs.get(reg["directory"], {}).get(i, {})
    return {"id": i, "directory": reg["directory"], "type": reg["type"], "name": it.get("name") or rt.get("name"),
            "value": it.get("value") or rt.get("unitValue"), "desc": it.get("desc") or rt.get("shortDescription"),
            "code_refs": ids[i]["ref_sites"][:5], "loot_tables": in_loot.get(i, [])[:5],
            "registered_at_runtime": (reg["directory"] in runtime_dirs) if have_runtime else None}

report = collections.OrderedDict()

# A. directories defined in code that the game never instantiates (not attached in any scene/prefab, never named)
defined_dirs = sorted({r["directory"] for v in ids.values() for r in v["registered_in"]})
report["dead_directories"] = [{"directory": d, "entries": sum(1 for v in ids.values() if any(r["directory"] == d for r in v["registered_in"])),
                               "attached_in_scene": d in attached, "named_in_code": classes.get(d, {}).get("referenced_by", 0) > 0,
                               "registered_at_runtime": (d in runtime_dirs) if have_runtime else None}
                              for d in defined_dirs if d not in attached and classes.get(d, {}).get("referenced_by", 0) == 0]
dead_dir_names = {d["directory"] for d in report["dead_directories"]}

report["disabled_loot_entries"] = [dict(table=t, **e) for t, es in loot["tables"].items() for e in es if not e["enabled"]]

# B. items/abilities/effects/characters nothing can reach
rows = []
for i, v in ids.items():
    d = v["registered_in"][0]["directory"]
    real_refs = [s for s in v["ref_sites"] if not DEV.search(s)]
    why = ("directory never loaded" if d in dead_dir_names else
           "UnusedDirectory" if d == "UnusedDirectory" else
           "dev/test only" if v["only_dev_or_debug_refs"] else
           "no code refs" if not v["code_refs"] else None)
    if why and not in_loot.get(i):
        rows.append(dict(item_row(i), why=why))
report["unreachable_entries"] = sorted(rows, key=lambda r: (r["why"], r["directory"], r["id"]))

# C. experimental / test / debug named things anywhere in the registries
pat = re.compile(r"experimental|test|debug|dev_|placeholder|example|old|unused|proto|wip", re.I)
report["experimental_named"] = [item_row(i) for i in ids if pat.search(i)]

# D. content factories (store clients, events, storylines, perks...) nothing calls, with their script
cut = []
for k, v in factories.items():
    if v["callers"]:
        continue
    cls, m = k.split(".")
    b = body(cls, m)
    ident = re.search(r'identifier\s*=\s*"([^"]+)"', b)
    cut.append({"factory": k, "returns": v["returns"], "identifier": ident.group(1) if ident else None,
                "lines": script_lines(b)[:60]})
report["uncalled_content"] = cut

# E. legacy space/raid prototype: Space*/TraderStation*/Raid*/Ship* classes and how alive they are
legacy = [c for c in classes if re.match(r"(Space|TraderStation|Raid|Ship|Overworld|Combat|Expedition|Station)", c)]
report["legacy_prototype_classes"] = [{"class": c, "base": classes[c]["base"], "referenced_by": classes[c]["referenced_by"],
                                       "attached_in_scene": c in attached, "lines": script_lines(files[c])[:12]}
                                      for c in sorted(legacy)]

# F. dead classes: never named in code and not attached to any GameObject.
#    PriorityTrigger.InitBehaviours builds every EventTrigger / ItemUse / ItemTarget subclass by reflection, so those are alive.
def bases(c):
    seen = []
    while c in classes and classes[c]["base"] and c not in seen:
        seen.append(c); c = classes[c]["base"]
    return seen + [c]
REFLECTED = {"PriorityTrigger"}
report["dead_classes"] = sorted(c for c, v in classes.items()
                                if v["referenced_by"] == 0 and c not in attached and not REFLECTED & set(bases(c)))

# G. art and sound nobody uses
report["orphan_sprites"] = [{k: s[k] for k in ("name", "resource", "w", "h", "png")} for s in sprites if s.get("png", "").startswith("sprites/orphan/")]
report["unused_item_sprites"] = [{k: s[k] for k in ("name", "resource", "w", "h", "png")} for s in sprites if s.get("png", "").startswith("sprites/unused_items/")]
report["audio_unused"] = [c for c in audio if not c["scene_ref"] and not c["name_in_code"] and not c["id_in_code"]]

# H. strings: keys never named in code, minus ones the code builds (prefix + id + suffix)
lit = set(re.findall(r'"([A-Za-z0-9_]+)"', "\n".join(files.values())))
prefixes = set(re.findall(r'"([A-Za-z0-9_]+_)"\s*\+', "\n".join(files.values())))
suffixes = set(re.findall(r'\+\s*"(_[A-Za-z0-9_]+)"', "\n".join(files.values()))) | {""}
def built(k):
    for p in [p for p in prefixes if k.startswith(p)]:
        core = k[len(p):]
        if any(core.endswith(s) and (core[:len(core) - len(s)] in lit or core[:len(core) - len(s)] in ids) for s in suffixes):
            return True
    return False
unref = json.load(open(S + "loc_unreferenced.json"))
report["strings_not_in_code"] = {k: v for k, v in unref.items() if not built(k)}

for k, v in report.items():
    json.dump(v, open(U + k + ".json", "w"), indent=1, ensure_ascii=False)

# ---- UNUSED.md
def esc(s):
    return str(s or "").replace("|", "\\|").replace("\n", " ")[:140]
md = ["# Probably Stolen 0.46D — unused, experimental and ghost content", "",
      f"Runtime dump: {'yes (PSDataDump)' if have_runtime else 'no — static analysis only'}. "
      "JSON for every section is in `data/unused/`. 'No code refs' means the id string appears nowhere outside its own registration "
      "and in no loot table; ids the game builds at runtime from parts can show up here, so treat each entry as a lead, not proof.", ""]
md += ["## Disabled loot-table entries", "", "Present in a vanilla loot table but switched off (probability 0).", ""]
md += [f"- `{e['value']}` in `{e['table']}`" for e in report["disabled_loot_entries"]] + [""]
md += ["## Directories the game never loads", "",
       "Directory classes are MonoBehaviours; these are attached to no GameObject and never named in code, so their entries never register.", "",
       "| directory | entries | registered at runtime |", "|---|---|---|"]
md += [f"| {d['directory']} | {d['entries']} | {d['registered_at_runtime']} |" for d in report["dead_directories"]]
by_why = collections.defaultdict(list)
for r in report["unreachable_entries"]:
    by_why[r["why"]].append(r)
for why, rs in by_why.items():
    md += ["", f"## Unreachable entries: {why} ({len(rs)})", "", "| id | directory | name | value | description |", "|---|---|---|---|---|"]
    md += [f"| `{r['id']}` | {r['directory']} | {esc(r['name'])} | {esc(r['value'])} | {esc(r['desc'])} |" for r in rs]
md += ["", f"## Experimental / test / old-named registry entries ({len(report['experimental_named'])})", "",
       "| id | directory | name | refs | in loot |", "|---|---|---|---|---|"]
md += [f"| `{r['id']}` | {r['directory']} | {esc(r['name'])} | {len(r['code_refs'])} | {', '.join(r['loot_tables'][:2])} |" for r in report["experimental_named"]]
md += ["", f"## Cut content: factories nothing calls ({len(cut)})", ""]
for c in cut:
    md += [f"### `{c['factory']}`" + (f" — `{c['identifier']}`" if c["identifier"] else "")]
    md += ["> " + esc(l) for l in c["lines"][:12]] or ["(no text)"]
    md += [""]
md += [f"## Space / raid prototype leftovers ({len(legacy)} classes)", "",
       "The game grew out of a space-trading prototype. `Space*Trigger` events are still instantiated by reflection "
       "(EventTriggerManager is in level1), but they only fire for `GameMaster.current.shipManager.nextPOI` states that need "
       "ShipScene/TurnManager, and no scene contains those, so they are dormant. Raid/combat runs only through RaidScene, which is not in any scene either.", "",
       "| class | base | named by | in scene | first text |", "|---|---|---|---|---|"]
md += [f"| {r['class']} | {r['base']} | {r['referenced_by']} | {r['attached_in_scene']} | {esc(r['lines'][0] if r['lines'] else '')} |"
       for r in report["legacy_prototype_classes"]]
md += ["", f"## Dead classes ({len(report['dead_classes'])})", "", ", ".join(f"`{c}`" for c in report["dead_classes"]), ""]
md += [f"## Orphan art ({len(report['orphan_sprites'])} sprites, PNGs in `data/assets/sprites/orphan/`)", ""]
by_atlas = collections.defaultdict(list)
for s in report["orphan_sprites"]:
    by_atlas[s["resource"]].append(s["name"])
md += [f"- **{a}**: {', '.join(ns)}" for a, ns in sorted(by_atlas.items())]
md += ["", f"Sprites belonging to unused items: {len(report['unused_item_sprites'])} in `data/assets/sprites/unused_items/`. "
       "Runtime-built variants (fill levels, sizes) are in `data/assets/sprites/orphan_variants/`.", ""]
md += [f"## Unused audio ({len(report['audio_unused'])})", "", ", ".join(f"`{c['name']}`" for c in report["audio_unused"]), ""]
by_table = collections.defaultdict(list)
for k, v in report["strings_not_in_code"].items():
    by_table[v["table"]].append((k, v["text"]))
md += [f"## Strings never named in code ({len(report['strings_not_in_code'])})", "",
       "UI/Hint/Tutorial/MainMenu keys are mostly bound by scene components, not code; Dialogue, ClientName, Item, PerkTable and "
       "NetworkUpgrade entries are the interesting ones. Full list in `data/unused/strings_not_in_code.json`.", ""]
for t in ("Dialogue", "ClientName", "Item", "PhoneDialogue", "Interactable", "PerkTable", "RepPerkTable", "NetworkUpgrade"):
    if t in by_table:
        md += [f"### {t} ({len(by_table[t])})", ""] + [f"- `{k}`: {esc(v)}" for k, v in by_table[t][:80]] + [""]
open("UNUSED.md", "w").write("\n".join(md) + "\n")
print({k: len(v) for k, v in report.items()})
