# Asset-side inventory: which scripts are attached in scenes/prefabs, which Resources sprites and audio clips
# the code never names, and PNG exports of the orphan / unused-item sprites. Output: data/assets/*
# Needs data/static/*.json from mine_static.py.
import UnityPy, struct, json, os, re, collections

D = "game/Probably Stolen_Data/"
OUT = "data/assets/"
os.makedirs(OUT, exist_ok=True)
env = UnityPy.load(D)
byname = {os.path.basename(n): f for n, f in env.files.items()}

def target_file(af, file_id):
    if file_id == 0:
        return af
    # generated type trees report some PPtrs (m_Script) with out-of-range file ids; treat them as unresolvable
    return byname.get(os.path.basename(af.externals[file_id - 1].path)) if 0 < file_id <= len(af.externals) else None

# MonoBehaviours ship without type trees; generate them from the game's Managed DLLs (TypeTreeGeneratorAPI)
from UnityPy.helpers.TypeTreeGenerator import TypeTreeGenerator
gen = TypeTreeGenerator("2021.3.45f2")
gen.load_local_game("game/")
env.typetree_generator = gen

# 0. every object reference held by a scene/prefab object (components, ScriptableObjects, animation frames).
#    SpriteAtlas is skipped: it lists every packed sprite whether used or not.
REF_TYPES = {"MonoBehaviour", "AudioSource", "SpriteRenderer", "AnimationClip", "Animator", "ParticleSystemRenderer", "Material"}
scene_refs = set()
def walk(af, node):
    if isinstance(node, dict):
        if "m_PathID" in node and "m_FileID" in node and node["m_PathID"]:
            tf = target_file(af, node["m_FileID"])
            if tf is not None:
                scene_refs.add((tf.name, node["m_PathID"]))
        else:
            for v in node.values():
                walk(af, v)
    elif isinstance(node, list):
        for v in node:
            walk(af, v)
for o in env.objects:
    if o.type.name in REF_TYPES:
        try:
            walk(o.assets_file, o.read_typetree())
        except Exception:
            pass

# 1. MonoBehaviour -> script class, by parsing the fixed header (m_GameObject, m_Enabled, m_Script);
#    the full read needs type trees this build does not ship.
scripts = {}
def script_name(af, fid, pid):
    tf = target_file(af, fid)
    if tf is None or pid not in tf.objects:
        return None
    key = (tf.name, pid)
    if key not in scripts:
        scripts[key] = tf.objects[pid].read().m_ClassName
    return scripts[key]

attached = collections.defaultdict(collections.Counter)
for o in env.objects:
    if o.type.name != "MonoBehaviour":
        continue
    raw = o.get_raw_data()
    fid, pid = struct.unpack_from("<iq", raw, 16)
    name = script_name(o.assets_file, fid, pid)
    if name:
        attached[name][o.assets_file.name] += 1
json.dump({k: dict(v) for k, v in sorted(attached.items())}, open(OUT + "attached_scripts.json", "w"), indent=1)

# 2. Resources sprites, keyed like the code's SetSprite*("Atlas/path", "name")
gg = byname["globalgamemanagers"]
rm = next(o for o in gg.objects.values() if o.type.name == "ResourceManager").read_typetree()
res_path = {}
for path, ptr in rm["m_Container"]:
    tf = target_file(gg, ptr["m_FileID"])
    if tf is not None:
        res_path[(tf.name, ptr["m_PathID"])] = path

static = json.load(open("data/static/code_sprite_refs.json"))
code_refs = {k.lower() for k in static}
names_in_code = set(re.findall(r'"([A-Za-z0-9_\-]+)"', "\n".join(open(f).read() for f in __import__("glob").glob("src/Assembly-CSharp/*.cs"))))

sprites = []
for o in env.objects:
    if o.type.name != "Sprite":
        continue
    path = res_path.get((o.assets_file.name, o.path_id))
    s = o.read()
    key = f"{path}/{s.m_Name}".lower() if path else None
    sprites.append({"name": s.m_Name, "resource": path, "file": o.assets_file.name, "path_id": o.path_id,
                    "w": round(s.m_Rect.width), "h": round(s.m_Rect.height),
                    "code_ref": bool(key and key in code_refs), "name_in_code": s.m_Name in names_in_code,
                    "scene_ref": (o.assets_file.name, o.path_id) in scene_refs})
json.dump(sprites, open(OUT + "sprites.json", "w"), indent=1)

# 3. audio: AudioDirectory (one MonoBehaviour in level1) maps identifier -> clip in 8 serialized AudioAsset arrays;
#    parsed raw: header, m_Name, then per array: count, {identifier string (4-aligned), PPtr<AudioClip>}
def read_str(raw, off):
    n = struct.unpack_from("<i", raw, off)[0]; off += 4
    return raw[off:off + n].decode("utf-8", "replace"), (off + n + 3) & ~3

ARRAYS = ["audioAsset", "audioAsset2", "audioAsset3", "music", "music2", "item1", "item2", "effect1"]
clip_ids = collections.defaultdict(list)
for o in env.objects:
    if o.type.name == "MonoBehaviour" and o.assets_file.name == "level1":
        raw = o.get_raw_data()
        if script_name(o.assets_file, *struct.unpack_from("<iq", raw, 16)) != "AudioDirectory":
            continue
        _, off = read_str(raw, 28)
        for arr in ARRAYS:
            n = struct.unpack_from("<i", raw, off)[0]; off += 4
            for _ in range(n):
                ident, off = read_str(raw, off)
                fid, pid = struct.unpack_from("<iq", raw, off); off += 12
                tf = target_file(o.assets_file, fid)
                clip_ids[(tf.name if tf else None, pid)].append({"array": arr, "identifier": ident})
clips = []
for o in env.objects:
    if o.type.name == "AudioClip":
        c = o.read()
        ids_ = clip_ids.get((o.assets_file.name, o.path_id), [])
        clips.append({"name": c.m_Name, "file": o.assets_file.name, "seconds": round(c.m_Length, 1) if hasattr(c, "m_Length") else None,
                      "directory_ids": ids_, "id_in_code": any(i["identifier"] in names_in_code for i in ids_),
                      "name_in_code": c.m_Name in names_in_code, "scene_ref": (o.assets_file.name, o.path_id) in scene_refs})
json.dump(clips, open(OUT + "audio.json", "w"), indent=1)

# 4. PNGs: Resources sprites never named anywhere in code, plus sprites of unreferenced / UnusedDirectory items
ids = json.load(open("data/static/registered_ids.json"))
unused_ids = {k for k, v in ids.items() if v["code_refs"] == 0 or any(r["directory"] == "UnusedDirectory" for r in v["registered_in"])}
unused_sprite_keys = {k.lower() for k, sites in static.items()
                      if any(s.split(":")[0] == "UnusedDirectory" for s in sites)}
# sprite refs inside factories of unreferenced items: match by sprite name == id as a cheap proxy
# ponytail: item->sprite link comes from the runtime dump when available (exported again by mine_report.py)
exported = []
referenced_names = {x['name'] for x in sprites if x['code_ref'] or x['name_in_code'] or x['scene_ref']}
ref_by_res = collections.defaultdict(set)
for x in sprites:
    if x["resource"] and (x["code_ref"] or x["name_in_code"] or x["scene_ref"]):
        ref_by_res[x["resource"]].add(x["name"])
code_prefixes = {n for n in names_in_code if n.endswith("_") and len(n) > 2}
for s in sprites:
    key = f"{s['resource']}/{s['name']}".lower() if s["resource"] else None
    orphan = s["resource"] and not s["code_ref"] and not s["name_in_code"] and not s["scene_ref"]
    unused = key in unused_sprite_keys or s["name"] in unused_ids
    if not (orphan or unused):
        continue
    # fill levels / sizes / frames are built at runtime ("vending" + 25): stem named in code (or by a referenced sprite) = variant
    stem = re.sub(r"(_?\d+|_[a-z]{1,2})+$", "", s["name"])
    # ...or the name extends a referenced sprite of the same atlas ("100ml" -> "100ml_blue_25"), or a "prefix_" literal ("dark_" + colour)
    base = next((r for r in ref_by_res[s["resource"]] if s["name"].startswith(r + "_") or s["name"][len(r):].isdigit() and s["name"].startswith(r)), None) if orphan else None
    pre = next((p for p in code_prefixes if s["name"].startswith(p)), None) if orphan else None
    s["variant_of"] = base or pre or (stem if orphan and stem != s["name"] and (stem in names_in_code or stem + "_" in names_in_code
                                                                  or any(n.startswith(stem) for n in referenced_names)) else None)
    folder = "unused_items" if unused else "orphan_variants" if s["variant_of"] else "orphan"
    rel = f"sprites/{folder}/{(s['resource'] or s['file']).replace('/', '_')}/{s['name']}.png"
    os.makedirs(os.path.dirname(OUT + rel), exist_ok=True)
    try:
        byname[s["file"]].objects[s["path_id"]].read().image.save(OUT + rel)
        s["png"] = rel
        exported.append(s)
    except Exception as e:
        s["png_error"] = str(e)
json.dump(sprites, open(OUT + "sprites.json", "w"), indent=1)

print(f"scripts attached {len(attached)}, sprites {len(sprites)} (resources {sum(1 for s in sprites if s['resource'])}, "
      f"orphan {sum(1 for s in exported if '/orphan/' in s['png'])}, variants {sum(1 for s in exported if '/orphan_variants/' in s['png'])}, "
      f"unused-item {sum(1 for s in exported if '/unused_items/' in s['png'])}), audio {len(clips)} "
      f"(unreferenced {sum(1 for c in clips if not c['scene_ref'] and not c['name_in_code'] and not c['id_in_code'])})")

# 5. loot tables (RNGNeeds ProbabilityList ScriptableObjects) and the scene wiring that names them.

def pl_items(pl, value):
    return [{"value": value(i["m_Value"]), "probability": round(i["m_BaseProbability"], 4), "enabled": bool(i["m_Enabled"]),
             "weight": i.get("m_Weight"), "units": i.get("m_Units")} for i in pl.get("m_ProbabilityItems", [])]

assets_by_id, groups_raw, wiring = {}, {}, {}
for o in env.objects:
    if o.type.name != "MonoBehaviour" or o.assets_file.name not in ("sharedassets1.assets", "level1"):
        continue
    try:
        t = o.read_typetree()
    except Exception:
        continue
    if isinstance(t.get("table"), dict) and "m_ProbabilityItems" in t["table"]:
        assets_by_id[(o.assets_file.name, o.path_id)] = t["m_Name"]
        wiring.setdefault("_tables", {})[t["m_Name"]] = pl_items(t["table"], str)
    elif isinstance(t.get("tableGroup"), dict) and "m_ProbabilityItems" in t["tableGroup"]:
        assets_by_id[(o.assets_file.name, o.path_id)] = t["m_Name"]
        groups_raw[t["m_Name"]] = (o.assets_file, t["tableGroup"])
    for key, idk, ref in (("tableEntries", "tableId", "lootTable"), ("tableGroupEntries", "tableGroupId", "tableGroup")):
        if key in t:
            wiring[key] = [(e[idk], o.assets_file, e[ref]) for e in t[key]]

def asset_name(af, ptr):
    tf = target_file(af, ptr["m_FileID"])
    return assets_by_id.get((tf.name if tf else None, ptr["m_PathID"]))

loot = {"tables": wiring.get("_tables", {}),
        "groups": {n: pl_items(g, lambda p, af=af: asset_name(af, p)) for n, (af, g) in groups_raw.items()},
        "scene_table_ids": {tid: asset_name(af, p) for tid, af, p in wiring.get("tableEntries", [])},
        "scene_group_ids": {gid: asset_name(af, p) for gid, af, p in wiring.get("tableGroupEntries", [])}}
json.dump(loot, open(OUT + "loot_tables.json", "w"), indent=1)
print(f"loot tables {len(loot['tables'])}, groups {len(loot['groups'])}, "
      f"disabled entries {sum(1 for es in loot['tables'].values() for e in es if not e['enabled'])}")
