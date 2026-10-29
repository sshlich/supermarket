# Dump every English localization table to data/loc_en/<Table>.json as {key: text}.
import UnityPy, json, os
B = "game/Probably Stolen_Data/StreamingAssets/aa/StandaloneWindows64/"
shared = {}
for o in UnityPy.load(B + "localization-assets-shared_assets_all.bundle").objects:
    if o.type.name == "MonoBehaviour":
        d = o.read_typetree()
        if "m_TableCollectionName" in d:
            shared[o.path_id] = {e["m_Id"]: e["m_Key"] for e in d["m_Entries"]}
os.makedirs("data/loc_en", exist_ok=True)
total = 0
for o in UnityPy.load(B + "localization-string-tables-english(en)_assets_all.bundle").objects:
    if o.type.name == "MonoBehaviour":
        d = o.read_typetree()
        if "m_TableData" not in d:
            continue
        k = shared[d["m_SharedData"]["m_PathID"]]
        out = {k.get(e["m_Id"], str(e["m_Id"])): e["m_Localized"] for e in d["m_TableData"]}
        name = d["m_Name"].removesuffix("_en")
        json.dump(out, open(f"data/loc_en/{name}.json", "w"), indent=1, ensure_ascii=False)
        print(f"{len(out):6} {name}"); total += len(out)
print(total, "strings")
