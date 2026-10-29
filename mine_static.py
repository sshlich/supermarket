# Static cross-reference of the decompiled C#: every registered id / factory method / class,
# and where (if anywhere) the rest of the code reaches it. Output: data/static/*.json
# ponytail: string-literal matching; ids built at runtime ("seed_" + x) show as unreferenced, the runtime dump + loot tables cover those
import re, json, glob, os, collections

SRC = "src/Assembly-CSharp/"
OUT = "data/static/"
os.makedirs(OUT, exist_ok=True)
files = {os.path.basename(f)[:-3]: open(f).read() for f in sorted(glob.glob(SRC + "*.cs"))}

def lineno(text, pos):
    return text.count("\n", 0, pos) + 1

# 1. directory registrations: Add("id", ...) inside InitDirectory of every Directory subclass
BASES = {"ItemDirectory": "GameItem", "CharacterItemDirectory": "GameCharacterItem",
         "CombatAbilityDirectory": "CombatAbility", "CombatAbilityEffectDirectory": "CombatAbilityEffect"}
def entry_type(cls):
    seen = set()
    while cls in files and cls not in seen:
        seen.add(cls)
        m = re.search(r"class " + re.escape(cls) + r"\s*:\s*(\w+)", files[cls])
        if not m:
            return None
        cls = m.group(1)
        if cls in BASES:
            return BASES[cls]
    return None

registered = {}
for cls, text in files.items():
    if "void InitDirectory" not in text:
        continue
    et = entry_type(cls)
    for m in re.finditer(r'\b(?:Add|Set)\("([^"]+)",', text):
        registered.setdefault(m.group(1), []).append({"directory": cls, "type": et, "line": lineno(text, m.start())})

# 2. every string literal in the code, with location
literals = collections.defaultdict(list)
for cls, text in files.items():
    for m in re.finditer(r'"((?:[^"\\\n]|\\.)*)"', text):
        literals[m.group(1)].append((cls, lineno(text, m.start())))

def refs_outside_registration(ident):
    regs = {(r["directory"], r["line"]) for r in registered.get(ident, [])}
    return [f"{c}:{l}" for c, l in literals.get(ident, []) if (c, l) not in regs]

ids = {}
for ident, regs in sorted(registered.items()):
    refs = refs_outside_registration(ident)
    ids[ident] = {"registered_in": regs, "code_refs": len(refs), "ref_sites": refs[:25],
                  "only_dev_or_debug_refs": bool(refs) and all(re.search(r"Dev|Debug|Test|Console|Cheat", s) for s in refs)}
json.dump(ids, open(OUT + "registered_ids.json", "w"), indent=1)

# 3. static factory methods on *List* / *Helper* classes and whether anything calls them
methods = {}
for cls, text in files.items():
    if "List" not in cls:
        continue
    for m in re.finditer(r"public static (\w[\w<>\[\], ]*) (\w+)\(", text):
        ret, name = m.groups()
        if ret in ("void", "bool", "int", "string", "float"):
            continue
        callers = []
        for c2, t2 in files.items():
            for mm in re.finditer(r"\b" + re.escape(name) + r"\b", t2):
                if c2 == cls and lineno(t2, mm.start()) == lineno(text, m.start()):
                    continue  # the definition itself
                callers.append(f"{c2}:{lineno(t2, mm.start())}")
        methods[f"{cls}.{name}"] = {"returns": ret, "line": lineno(text, m.start()), "callers": len(callers), "call_sites": callers[:15]}
json.dump(methods, open(OUT + "list_factories.json", "w"), indent=1)

# 4. classes nobody names (candidates for dead code; MonoBehaviours may still be attached in scenes, see mine_assets.py)
classes = {}
for cls, text in files.items():
    pat = re.compile(r"\b" + re.escape(cls) + r"\b")
    users = [c2 for c2, t2 in files.items() if c2 != cls and pat.search(t2)]
    base = re.search(r"class " + re.escape(cls) + r"\b[^:{]*:\s*([\w.<>]+)", text)
    classes[cls] = {"base": base.group(1) if base else None, "referenced_by": len(users), "users": users[:10]}
json.dump(classes, open(OUT + "classes.json", "w"), indent=1)

# 5. string-table keys never named in code (loc keys can also be built as prefix + id, flagged separately)
loc = {}
for f in sorted(glob.glob("data/loc_en/*.json")):
    for k, v in json.load(open(f)).items():
        loc[k] = (os.path.basename(f)[:-5], v)
allcode = "\n".join(files.values())
prefixes = set(re.findall(r'"([a-z0-9_]+_)"\s*\+', allcode))
unref_loc = {}
for k, (table, v) in loc.items():
    if k in literals:
        continue
    built = sorted(p for p in prefixes if k.startswith(p) and (k[len(p):] in registered or k[len(p):] in literals))
    unref_loc[k] = {"table": table, "text": v, "maybe_built_from": built[:3]}
json.dump(unref_loc, open(OUT + "loc_unreferenced.json", "w"), indent=1, ensure_ascii=False)

# 6. sprite references from code: SetSprite*(atlas, name)
sprites = collections.defaultdict(list)
for cls, text in files.items():
    for m in re.finditer(r'\.Set\w*Sprite\w*\("([^"]+)",\s*"([^"]+)"', text):
        sprites[m.group(1) + "/" + m.group(2)].append(f"{cls}:{lineno(text, m.start())}")
json.dump(sprites, open(OUT + "code_sprite_refs.json", "w"), indent=1)

print(f"ids {len(ids)} (unreferenced {sum(1 for v in ids.values() if v['code_refs'] == 0)}), "
      f"list factories {len(methods)} (uncalled {sum(1 for v in methods.values() if v['callers'] == 0)}), "
      f"classes {len(classes)} (unnamed {sum(1 for v in classes.values() if v['referenced_by'] == 0)}), "
      f"loc unreferenced {len(unref_loc)}/{len(loc)}, sprite refs {len(sprites)}")
