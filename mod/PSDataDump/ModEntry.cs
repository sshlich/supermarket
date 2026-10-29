using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Newtonsoft.Json;

namespace PSDataDump
{
    // Runtime datamine: once a game is loaded, builds every registered directory entry, loot table,
    // registry static and *List factory and writes them as JSON to persistentDataPath/ModData/ps_datadump/.
    public class ModEntry : IMod
    {
        const string ID = "ps_datadump";
        const BindingFlags Inst = BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic;
        const BindingFlags Stat = BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic;
        static readonly string[] SkipVerbs = { "Get", "Is", "Has", "Find", "Register", "Init", "Load", "Save", "Reset", "Clear", "Remove", "Set", "Try", "Apply", "Start", "Open", "Close", "Play", "Show", "Hide", "Update", "Handle", "Check", "Can", "On" };

        ModLog log;
        bool done;

        public void Init(ModManifest manifest)
        {
            log = new ModLog(manifest);
            ModHook.OnGameLoadedLate += () => { if (!done) { done = true; DumpAll(); } };
        }
        public void OnEnable() { }
        public void OnDisable() { }

        void DumpAll()
        {
            var summary = new Dictionary<string, object>();
            Try("directories", () => summary["directories"] = DumpDirectories());
            Try("loot", () => summary["loot"] = DumpLoot());
            Try("registries", () => summary["registries"] = DumpStatics(t => t.Name.EndsWith("Registry") || t.Name == "Difficulty", "registries"));
            Try("lists", () => summary["lists"] = DumpFactories());
            summary["version"] = UnityEngine.Application.version;
            Write("summary.json", summary);
            log.Log("PSDataDump: done -> " + ModHelper.GetModDataFolder(ID));
        }

        void Try(string what, Action a)
        {
            try { a(); } catch (Exception e) { log.Error("PSDataDump " + what + ": " + e); }
        }

        void Write(string rel, object data)
        {
            var sw = new StringWriter();
            using (var w = new JsonTextWriter(sw) { Formatting = Formatting.Indented })
                new Walker(w).Value(data, 0);
            ModHelper.WriteModDataFileText(ID, rel, sw.ToString());
        }

        Dictionary<string, int> DumpDirectories()
        {
            var counts = new Dictionary<string, int>();
            var dirs = (IDictionary)typeof(DirectoryMaster).GetField("singletonInstance", Stat).GetValue(null);
            foreach (DictionaryEntry kv in dirs)
            {
                foreach (var dir in (IEnumerable)kv.Value)
                {
                    var dt = dir.GetType();
                    var factories = (IDictionary)dt.GetProperty("factoryDictionary").GetValue(dir);
                    var create = dt.GetMethod("Create", new[] { typeof(string) });
                    var outp = new Dictionary<string, object>();
                    foreach (var id in factories.Keys.Cast<string>().ToList())
                    {
                        try { outp[id] = create.Invoke(dir, new object[] { id }); }
                        catch (Exception e) { outp[id] = new Dictionary<string, object> { ["__error"] = (e.InnerException ?? e).Message }; }
                    }
                    Write("directories/" + ((Type)kv.Key).Name + "/" + dt.Name + ".json", outp);
                    counts[dt.Name] = outp.Count;
                }
            }
            return counts;
        }

        int DumpLoot()
        {
            var tables = LootRegistry.TableIds.ToDictionary(id => id, id => (object)LootRegistry.GetTableEntries(id));
            var groups = LootRegistry.GroupIds.ToDictionary(id => id, id => (object)LootRegistry.GetGroupEntries(id));
            Write("loot.json", new Dictionary<string, object> { ["tables"] = tables, ["groups"] = groups });
            return tables.Count + groups.Count;
        }

        static IEnumerable<Type> GameTypes() =>
            typeof(DirectoryMaster).Assembly.GetTypes().Where(t => !t.IsGenericTypeDefinition && !t.Name.StartsWith("<"));

        // static fields of registry-like classes (plant/trait/appraisal/paper registries, difficulty tiers)
        Dictionary<string, int> DumpStatics(Func<Type, bool> pick, string folder)
        {
            var counts = new Dictionary<string, int>();
            foreach (var t in GameTypes().Where(pick))
            {
                var outp = new Dictionary<string, object>();
                foreach (var f in t.GetFields(Stat).Where(f => !f.Name.Contains("<") && !typeof(Delegate).IsAssignableFrom(f.FieldType)))
                    try { outp[f.Name] = f.GetValue(null); } catch (Exception e) { outp[f.Name] = "__error: " + e.Message; }
                Write(folder + "/" + t.Name + ".json", outp);
                counts[t.Name] = outp.Count;
            }
            return counts;
        }

        // static factory methods on *List* classes (store clients, events, operations, hirelings, perks...):
        // every parameterless-callable static method that returns a game object
        // ponytail: name-based verb blacklist keeps mutators out; a factory with side effects can still run, so dump on a throwaway save
        Dictionary<string, int> DumpFactories()
        {
            var asm = typeof(DirectoryMaster).Assembly;
            var counts = new Dictionary<string, int>();
            foreach (var t in GameTypes().Where(t => t.Name.Contains("List") && !typeof(UnityEngine.Object).IsAssignableFrom(t)))
            {
                var outp = new Dictionary<string, object>();
                foreach (var m in t.GetMethods(Stat).Where(m => m.DeclaringType == t && !m.IsSpecialName && !m.ContainsGenericParameters
                         && m.ReturnType != typeof(void) && (m.ReturnType.Assembly == asm || IsGameList(m.ReturnType, asm))
                         && m.GetParameters().All(p => p.IsOptional) && !SkipVerbs.Any(v => m.Name.StartsWith(v) && m.Name.Length > v.Length && char.IsUpper(m.Name[v.Length]))))
                {
                    try { outp[m.Name] = m.Invoke(null, m.GetParameters().Select(p => p.DefaultValue).ToArray()); }
                    catch (Exception e) { outp[m.Name] = new Dictionary<string, object> { ["__error"] = (e.InnerException ?? e).Message }; }
                }
                if (outp.Count == 0) continue;
                Write("lists/" + t.Name + ".json", outp);
                counts[t.Name] = outp.Count;
            }
            return counts;
        }

        static bool IsGameList(Type t, Assembly asm) =>
            t.IsGenericType && typeof(IEnumerable).IsAssignableFrom(t) && t.GetGenericArguments().All(a => a.Assembly == asm);

        // Reflection JSON walker: public fields + auto-properties, Unity objects by name, delegates by method name,
        // cycles and deep nesting cut off.
        class Walker
        {
            const int MaxDepth = 7, MaxItems = 2000;
            readonly JsonWriter w;
            readonly HashSet<object> path = new HashSet<object>(new RefEq());
            static readonly Dictionary<Type, FieldInfo[]> fieldCache = new Dictionary<Type, FieldInfo[]>();
            public Walker(JsonWriter w) { this.w = w; }

            public void Value(object o, int depth)
            {
                if (o == null) { w.WriteNull(); return; }
                var t = o.GetType();
                if (o is string s) { w.WriteValue(s); return; }
                if (o is bool b) { w.WriteValue(b); return; }
                if (o is Enum) { w.WriteValue(o.ToString()); return; }
                if (o is float f) { if (float.IsNaN(f) || float.IsInfinity(f)) w.WriteValue(f.ToString()); else w.WriteValue(f); return; }
                if (o is double d) { if (double.IsNaN(d) || double.IsInfinity(d)) w.WriteValue(d.ToString()); else w.WriteValue(d); return; }
                if (t.IsPrimitive || o is decimal) { w.WriteValue(o); return; }
                if (o is Delegate del) { w.WriteValue("fn:" + del.Method.DeclaringType?.Name + "." + del.Method.Name); return; }
                if (o is Type ty) { w.WriteValue("type:" + ty.FullName); return; }
                if (o is UnityEngine.Object uo) { w.WriteValue(uo ? t.Name + ":" + uo.name : null); return; }
                if (depth >= MaxDepth) { w.WriteValue(Ident(o) ?? "…" + t.Name); return; }
                if (!t.IsValueType && !path.Add(o)) { w.WriteValue("cycle:" + (Ident(o) ?? t.Name)); return; }
                try
                {
                    if (o is IDictionary dict)
                    {
                        w.WriteStartObject();
                        int n = 0;
                        foreach (DictionaryEntry e in dict) { if (n++ >= MaxItems) break; w.WritePropertyName(e.Key?.ToString() ?? "null"); Value(e.Value, depth + 1); }
                        w.WriteEndObject();
                    }
                    else if (o is IEnumerable en)
                    {
                        w.WriteStartArray();
                        int n = 0;
                        foreach (var x in en) { if (n++ >= MaxItems) break; Value(x, depth + 1); }
                        w.WriteEndArray();
                    }
                    else
                    {
                        w.WriteStartObject();
                        if (depth > 0 || !t.IsValueType) { w.WritePropertyName("$type"); w.WriteValue(t.Name); }
                        foreach (var fi in Fields(t))
                        {
                            object v;
                            try { v = fi.GetValue(o); } catch { continue; }
                            if (v == null) continue; // ponytail: nulls dropped to keep files readable
                            w.WritePropertyName(fi.Name.StartsWith("<") ? fi.Name.Substring(1, fi.Name.IndexOf('>') - 1) : fi.Name);
                            Value(v, depth + 1);
                        }
                        w.WriteEndObject();
                    }
                }
                finally { if (!t.IsValueType) path.Remove(o); }
            }

            static string Ident(object o) =>
                o is DirectoryEntry de ? "ref:" + de.identifier : null;

            static FieldInfo[] Fields(Type t)
            {
                if (fieldCache.TryGetValue(t, out var fs)) return fs;
                var list = new List<FieldInfo>();
                for (var c = t; c != null && c != typeof(object); c = c.BaseType)
                    list.AddRange(c.GetFields(Inst | BindingFlags.DeclaredOnly).Where(f => f.IsPublic || f.Name.EndsWith(">k__BackingField")));
                return fieldCache[t] = list.ToArray();
            }

            class RefEq : IEqualityComparer<object>
            {
                public new bool Equals(object a, object b) => ReferenceEquals(a, b);
                public int GetHashCode(object o) => System.Runtime.CompilerServices.RuntimeHelpers.GetHashCode(o);
            }
        }
    }
}
