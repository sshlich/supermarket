# Builds showcase/back-room.html: the datamine findings as one self-contained page, with the game's own
# sprites, portraits, store layers and pixel font embedded as data URIs. Run from the workspace root after mine_report.py.
import UnityPy, json, re, glob, base64, io, os, csv, collections

os.chdir(os.path.join(os.path.dirname(__file__), ".."))
SRC = "src/Assembly-CSharp/"
files = {os.path.basename(f)[:-3]: open(f).read() for f in glob.glob(SRC + "*.cs")}
loc = {k: v for f in sorted(glob.glob("data/loc_en/*.json")) for k, v in json.load(open(f)).items()}
items = {r["id"]: r for r in csv.DictReader(open("data/items.csv"))}
U = lambda n: json.load(open(f"data/unused/{n}.json"))
env = UnityPy.load("game/Probably Stolen_Data/")
byfile = {os.path.basename(n): f for n, f in env.files.items()}
meta = json.load(open("data/assets/sprites.json"))
by_res = {(s["resource"], s["name"]): s for s in meta if s["resource"]}
by_shared = {}
for s in meta:
    if not s["resource"]:
        by_shared.setdefault(s["name"], s)

def uri_png(img):
    b = io.BytesIO(); img.save(b, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(b.getvalue()).decode()

def sprite(s, crop=False):
    if not s:
        return None
    img = byfile[s["file"]].objects[s["path_id"]].read().image.convert("RGBA")
    if crop:
        box = img.getbbox()
        if not box:
            return None
        return {"src": uri_png(img.crop(box)), "x": box[0], "y": box[1], "w": box[2] - box[0], "h": box[3] - box[1]}
    # wiped slice: the rectangle survives in the atlas, the pixels under it were erased
    return {"src": uri_png(img), "w": img.width, "h": img.height, "blank": img.getchannel("A").getextrema()[1] < 16}

def body(cls, method):
    text = files.get(cls, "")
    m = re.search(r"\b" + re.escape(method) + r"\s*\([^;{)]*\)\s*\{", text)
    if not m:
        return ""
    i, depth = m.end(), 1
    while depth and i < len(text):
        depth += {"{": 1, "}": -1}.get(text[i], 0); i += 1
    return text[m.end():i]

def clean(t):
    return re.sub(r"\s*\\r\\n\s*|\s*\\n\s*", " ", t).replace('\\"', '"').strip()

# ---- items: directory registration -> factory -> first SetSprite*(atlas, name)
factory_of = {}
for cls, text in files.items():
    if "void InitDirectory" in text:
        for m in re.finditer(r'\bAdd\("([^"]+)",\s*\(\)\s*=>\s*(\w+)\(', text):
            factory_of.setdefault(m.group(1), (cls, m.group(2)))

def item_sprite(i):
    cls, meth = factory_of.get(i, (None, None))
    m = re.search(r'\.Set\w*Sprite\w*\("([^"]+)",\s*"([^"]+)"', body(cls, meth)) if cls else None
    return sprite(by_res.get((m.group(1).lower(), m.group(2)))) if m else None

def factory_text(i, field_re):
    cls, meth = factory_of.get(i, (None, None))
    m = re.search(field_re, body(cls, meth)) if cls else None
    if not m:
        return None
    lit, key = m.group(1), m.group(2) if m.lastindex and m.lastindex > 1 else None
    return clean(lit) if lit else loc.get(key)

def item(i):
    it = items.get(i, {})
    name = (it.get("name") or factory_text(i, r'\.name = (?:"((?:[^"\\]|\\.)+)"|LocHelper\.GetLocalizedItem\("(\w+)"\))|SetName\((?:"([^"]+)"|LocHelper\.GetLocalizedItem\("(\w+)"\))')
            or loc.get(f"item_{i}_name") or i.replace("_", " ").title())
    desc = it.get("desc") or factory_text(i, r'shortDescription = (?:"((?:[^"\\]|\\.)*)"|LocHelper\.GetLocalizedItem\("(\w+)"\))') or ""
    return {"id": i, "name": name, "value": it.get("value"), "desc": clean(desc),
            "flavor": clean(it.get("flavor") or ""), "types": it.get("types"), "sprite": item_sprite(i)}

out = {}

# hero: the store front, rebuilt from its 960x540 layers in draw order
LAYERS = ["wall", "wall2", "store_background", "store_background_rail", "store_mid", "store_mid_rail", "store_mid_stairs",
          "window_top", "window", "door", "hidden_space", "poster", "poster_down", "calendar", "radio", "phone",
          "shutter_door", "desk", "front_counter", "wires", "wires2", "wires_table"]
out["store"] = {n: sprite(by_shared.get(n), crop=True) for n in LAYERS}

# 1. UnusedDirectory, in registration order
ud = re.findall(r'\bAdd\("([^"]+)"', files["UnusedDirectory"])
out["unused_directory"] = [item(i) for i in ud]

# 2. live items nothing can reach
out["unreachable"] = [item(r["id"]) for r in U("unreachable_entries") if r["why"] == "no code refs" and r["type"] == "GameItem"]
perks = [r["id"] for r in U("unreachable_entries") if r["directory"] == "PerkDirectory"]
pd = files["PerkDirectory"]
out["unused_perks"] = [{"id": p, "name": loc.get(f"{p}_name") or (re.search(r'Add\("' + p + r'".*?"([^"]+)"\)', pd) or [None, p])[1]} for p in perks]

# 3. experimental injectors: prototype combat stims vs the release's pharmacy
eff = {}
for cls in ("CombatAbilityEffectInstantDirectory", "CombatAbilityEffectStandardDirectory", "CombatAbilityEffectPermanentDirectory"):
    for m in re.finditer(r'Add\("([^"]+)", \(\) => new CombatAbilityEffect\("[^"]+", (-?\d+), (-?\d+), CombatAbilityEffect\.EffectType\.(\w+)', files[cls]):
        eff[m.group(1)] = {"value": int(m.group(2)), "turns": int(m.group(3)), "kind": m.group(4)}
inj = []
for m in re.finditer(r'Add\("(experimental_injector_\w+)", \(\) => StandardAbility\("([^"]+)", "([^"]*)", (\d+), \w+, ([^)]*)\)\)', files["StandardCombatAbilityDirectory"]):
    effects = re.findall(r'"([^"]+)"', m.group(5))
    inj.append({"id": m.group(1), "name": m.group(2), "desc": m.group(3), "cooldown": int(m.group(4)),
                "effects": [{"id": e, **eff.get(e, {})} for e in effects]})
out["injectors"] = inj
art = {"red": "injector_blood_red", "black": "injector_black", "green": "injector_green", "white": "injector_pure_white", "purple": "purple_serum"}
out["injector_art"] = {c: sprite(by_res.get(("items/items_medical", n))) for c, n in art.items()}
out["release_injectors"] = [item(i) for i in ("black_injector", "pure_white_injector", "large_purple_injector", "pink_injector", "pink_alt_injector")]

# 4. cut customers: every uncalled StoreClient factory with its dialogue, speaker by speaker
def speaker(expr, name):
    expr = expr.strip()
    if "displayName" in expr:
        return name
    lit = re.fullmatch(r'"([^"]*)"', expr)
    if lit:
        return "You" if lit.group(1) == "PLAYER" else lit.group(1)
    k = re.search(r'GetLocalized\w*\("([^"]+)"\)', expr)
    return loc.get(k.group(1), name) if k else name

def text_of(expr):
    k = re.fullmatch(r'\s*LocHelper\.GetLocalized\w*\("([^"]+)"[^)]*\)\s*', expr)
    if k:
        return loc.get(k.group(1), "[" + k.group(1) + "]")
    lit = re.fullmatch(r'\s*"((?:[^"\\]|\\.)*)"\s*', expr)
    return clean(lit.group(1)) if lit else None

def client(factory):
    cls, meth = factory.split(".")
    b = body(cls, meth)
    dn = re.search(r'displayName = (?:"([^"]+)"|LocHelper\.GetLocalizedClientName\("([^"]+)"\))', b)
    name = (dn.group(1) or loc.get(dn.group(2), dn.group(2))) if dn else None
    sn = re.search(r'spriteName = (?:"([^"]+)"|(\w+\.\w+)\(\))', b)
    sprite_name = sn.group(1) if sn and sn.group(1) else ("random face" if sn else None)
    lines = []
    for m in re.finditer(r'(\w?)\.SetText\(([^,()]+(?:\([^)]*\))?),\s*(LocHelper\.GetLocalized\w*\("[^"]+"[^)]*\)|"(?:[^"\\]|\\.)*")\)'
                         r'|\.AddChoice\([^,]+,\s*(LocHelper\.GetLocalized\w*\("[^"]+"[^)]*\)|"(?:[^"\\]|\\.)*")', b):
        if m.group(4):
            t = text_of(m.group(4))
            if t:
                lines.append({"who": "choice", "text": t})
        else:
            t = text_of(m.group(3))
            who = speaker(m.group(2), name)
            if t:
                lines.append({"who": "choice" if who == "You" and m.group(1) else who, "text": t})
    budget = re.search(r'SetBudget\((\d+)\)', b)
    intent = re.search(r'ClientIntent\.(\w+)', b)
    return {"factory": factory, "id": (re.search(r'identifier = "([^"]+)"', b) or [None, None])[1], "name": name,
            "sprite_name": sprite_name, "portrait": sprite(by_shared.get(sprite_name)) if sprite_name else None,
            "intent": intent.group(1) if intent else None, "budget": int(budget.group(1)) if budget else None, "lines": lines}

cut = [c for c in U("uncalled_content") if c["returns"] == "StoreClient"]
out["customers"] = [c for c in (client(c["factory"]) for c in cut) if c["lines"]]

# 5. faces with no living owner
out["faces"] = {n: sprite(by_shared.get(n)) for n in ("grandpa_cheng", "trailer_rev2", "trailer_rev1")}

# 6. space prototype events
space = []
for cls in sorted(c for c in files if re.match(r"(Space|TraderStation)\w*Trigger$", c) and c != "SpaceExampleTrigger"):
    t = files[cls]
    st = re.search(r'SetText\("([^"]+)", "((?:[^"\\]|\\.)*)"', t)
    if not st:
        continue
    lines = [clean(st.group(2))] + [clean(x) for x in re.findall(r'text\.AddLine\("((?:[^"\\]|\\.)*)"', t)][:3]
    choices = [clean(x) for x in re.findall(r'AddChoice\([^,]+,\s*"((?:[^"\\]|\\.)+)"', t)][:5]
    outcomes = [clean(x) for x in re.findall(r'new RichTextBuilder\(\)\.Add\("((?:[^"\\]|\\.)+)"', t)][:3]
    img = re.search(r'SetImage\("([^"]+)"', t)
    space.append({"cls": cls, "title": st.group(1), "lines": [l for l in lines if l], "choices": choices, "outcomes": outcomes,
                  "image": img.group(1) if img else None, "image_exists": bool(img and img.group(1) in by_shared)})
out["space"] = space

# 7. faction statuses (full) and threat events (stubs)
fs = []
for m in re.finditer(r'public static FactionStatus (\w+)\(\)\s*\{(.*?)\n\t\}', files["FactionStatusList"], re.S):
    f = dict(re.findall(r'(\w+) = "?([^",\n]+)"?,?\n', m.group(2)))
    if f.get("displayName") and "FactionStatusList." + m.group(1) in {c["factory"] for c in U("uncalled_content")}:
        fs.append({"name": f["displayName"], "desc": clean(f.get("description", "")), "days": f.get("duration"),
                   "mods": {k[:-8]: int(v) for k, v in f.items() if k.endswith("Modifier")}})
out["faction"] = fs
out["threats"] = [k.split(".")[1] for k in (c["factory"] for c in U("uncalled_content")) if k.startswith("EventListThreat.")]

# 8. combat layer: NPC roster and ability names
npc = []
nt = files["NpcCharacterItemDirectory"]
for m in re.finditer(r'Add\("([^"]+)", \(\) => (.*?)\);\n', nt):
    rhs = m.group(2)
    fm = re.match(r"(\w+)\(\)$", rhs)
    src = body("NpcCharacterItemDirectory", fm.group(1)) if fm else rhs
    name = re.search(r'"([A-Z][^"]+)"', src)
    ai = re.search(r"Create(\w+?)AI\(", src)
    build = re.search(r"(?:Build|Create)(\w+)", rhs if not fm else src)
    npc.append({"id": m.group(1), "label": name.group(1) if name else m.group(1),
                "side": "hostile" if re.search(r"isEnemy: true|Hostile", src) else "neutral",
                "ai": re.sub(r"(?<!^)(?=[A-Z])", " ", ai.group(1)) if ai else None})
out["npcs"] = npc
out["abilities"] = sorted({m for m in re.findall(r'StandardAbility\("([^"]+)"', files["StandardCombatAbilityDirectory"])})

# 9. loot: the access-card table with its two switched-off keycards
lt = json.load(open("data/assets/loot_tables.json"))
out["keycards"] = [dict(e, item=item(e["value"])) for e in lt["tables"]["accessCardTable"]]
out["loot_counts"] = {"tables": len(lt["tables"]), "groups": len(lt["groups"])}

# 10. orphan art wall, grouped by atlas
wall = collections.defaultdict(list)
for s in U("orphan_sprites"):
    p = "data/assets/" + s["png"]
    if os.path.exists(p):
        wall[s["resource"].split("/")[-1]].append({"name": s["name"], "w": s["w"], "h": s["h"], "blank": s["blank"],
                                                   "src": "data:image/png;base64," + base64.b64encode(open(p, "rb").read()).decode()})
out["orphans"] = dict(sorted(wall.items(), key=lambda kv: -len(kv[1])))

# 11. lines nobody says
sn = U("strings_not_in_code")
out["dead_lines"] = [{"key": k, "table": v["table"], "text": v["text"]} for k, v in sn.items() if v["table"] in ("Dialogue", "ClientName", "Item", "PhoneDialogue")]

# stats for the receipt
uis = U("unused_item_sprites")
rep_extra = {"wiped_item_sprites": sum(1 for x in uis if x["blank"]), "orphan_art": sum(1 for x in U("orphan_sprites") if not x["blank"]),
             "orphan_wiped": sum(1 for x in U("orphan_sprites") if x["blank"])}
rep = {k: len(U(k)) for k in ("dead_directories", "unreachable_entries", "uncalled_content", "legacy_prototype_classes", "dead_classes", "orphan_sprites", "unused_item_sprites", "audio_unused", "disabled_loot_entries")}
rt = json.load(open("data/runtime/summary.json"))
out["stats"] = dict(rep, **rep_extra, items=len(items), strings=len(loc), classes=len(files), live_directories=len(rt["directories"]),
                    list_factories=sum(rt["lists"].values()), portraits=sum(1 for s in meta if (s["w"], s["h"]) == (288, 211)),
                    sprites=len(meta), audio=len(json.load(open("data/assets/audio.json"))))

font = base64.b64encode(open(os.environ.get("TANDY", "showcase/Tandy2K-outline.ttf"), "rb").read()).decode()
tpl = open("showcase/template.html").read()
html = tpl.replace("/*FONT*/", font).replace("/*DATA*/", json.dumps(out, separators=(",", ":"), ensure_ascii=False))
open("showcase/back-room.html", "w").write(html)
print(f"{len(html) / 1e6:.2f} MB;", {k: (len(v) if hasattr(v, '__len__') else v) for k, v in out.items() if k != "stats"})
