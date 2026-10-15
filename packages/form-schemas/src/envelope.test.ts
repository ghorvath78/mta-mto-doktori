import { describe, expect, it } from "vitest";
import { createSchemaRegistry, FormDataError, NewerFormatError, type FormSchema, type Tree } from "./envelope.ts";
import { FORM_SCHEMAS, kindOfNamespace } from "./registry.ts";

// Kitalált sémák: "A" a 3. verziónál tart (két lépcső), "B" még az 1.-nél.
const calls: string[] = [];
const schemas: Record<"A" | "B", FormSchema> = {
    A: {
        version: 3,
        migrations: {
            1: (ns) => {
                calls.push("A1");
                const { Régi, ...rest } = ns;
                return { ...rest, Új: Régi };
            },
            2: (ns) => {
                calls.push("A2");
                return { ...ns, Új: `${ns.Új}!` };
            }
        }
    },
    B: { version: 1, migrations: {} }
};
const kindOf = (namespace: string) => (namespace === "A" || namespace === "B" ? namespace : /^A\d+$/.test(namespace) ? "A" : null);
const { loadEmbedded, serializeEmbedded, upgradeNamespace } = createSchemaRegistry(schemas, kindOf);

function load(tree: Tree): Tree {
    calls.length = 0;
    return loadEmbedded(JSON.stringify(tree));
}

describe("loadEmbedded", () => {
    it("a _meta nélküli fájlt 1-es verziónak tekinti, és sorban végigmigrálja", () => {
        expect(load({ A: { Régi: "x", Marad: "y" }, B: { b: "1" } })).toEqual({ A: { Új: "x!", Marad: "y" }, B: { b: "1" } });
        expect(calls).toEqual(["A1", "A2"]);
    });

    it("csak a fájl verziójától induló lépcsőket futtatja", () => {
        expect(load({ _meta: { schema: { A: 2 } }, A: { Új: "x" } })).toEqual({ A: { Új: "x!" } });
        expect(calls).toEqual(["A2"]);
    });

    it("az aktuális verziójú névteret nem módosítja", () => {
        expect(load({ _meta: { schema: { A: 3, B: 1 } }, A: { Új: "x" } })).toEqual({ A: { Új: "x" } });
        expect(calls).toEqual([]);
    });

    it("a sorszámozott névtereket (pl. Előterjesztő<n>) a fajtájuk sémája szerint migrálja", () => {
        expect(load({ _meta: { schema: { A: 1 } }, A1: { Régi: "p" }, A2: { Régi: "q" } })).toEqual({ A1: { Új: "p!" }, A2: { Új: "q!" } });
    });

    it("az ismeretlen gyökérkulcsokat változatlanul hagyja", () => {
        expect(load({ Más: { Régi: "x" } })).toEqual({ Más: { Régi: "x" } });
    });

    it("az újabb verziójú fájlt elutasítja", () => {
        expect(() => load({ _meta: { schema: { A: 4 } }, A: {} })).toThrow(NewerFormatError);
    });

    it("az érvénytelen verziószámot 1-esnek veszi", () => {
        expect(load({ _meta: { schema: { A: "2" } }, A: { Régi: "x" } })).toEqual({ A: { Új: "x!" } });
    });

    it("a sérült vagy nem objektum JSON-ra FormDataError-t dob", () => {
        expect(() => loadEmbedded("{nem json")).toThrow(FormDataError);
        expect(() => loadEmbedded("null")).toThrow(FormDataError);
        expect(() => loadEmbedded("[]")).toThrow(FormDataError);
    });
});

describe("upgradeNamespace", () => {
    it("a bemenetet nem módosítja", () => {
        const ns = { Régi: "x" };
        upgradeNamespace("A", ns, 1);
        expect(ns).toEqual({ Régi: "x" });
    });
});

describe("serializeEmbedded", () => {
    it("a fában szereplő névterek fajtáinak aktuális verzióját írja a _meta-ba", () => {
        const parsed = JSON.parse(serializeEmbedded({ A1: {}, A2: {}, B: {}, Más: {} }));
        expect(Object.keys(parsed)[0]).toBe("_meta");
        expect(parsed._meta.schema).toEqual({ A: 3, B: 1 });
        expect(typeof parsed._meta.savedAt).toBe("string");
    });

    it("a régi _meta-t lecseréli, a visszatöltés nem migrál újra", () => {
        const text = serializeEmbedded({ _meta: { schema: { A: 1 } }, A: { Új: "x" } });
        expect(load(JSON.parse(text))).toEqual({ A: { Új: "x" } });
        expect(calls).toEqual([]);
    });
});

describe("createSchemaRegistry", () => {
    it("hiányzó migrációs lépcső esetén hibát dob", () => {
        expect(() => createSchemaRegistry({ A: { version: 3, migrations: { 1: (ns) => ns } } }, () => "A")).toThrow(/A 2 -> 3/);
    });
});

describe("az adatlapok regisztere", () => {
    it("felismeri a névtereket", () => {
        expect(kindOfNamespace("Kérelmezői")).toBe("Kérelmezői");
        expect(kindOfNamespace("Előterjesztői")).toBe("Előterjesztői");
        expect(kindOfNamespace("Előterjesztő2")).toBe("Előterjesztői");
        expect(kindOfNamespace("Bizottsági")).toBe("Bizottsági");
        expect(kindOfNamespace("_meta")).toBeNull();
        expect(kindOfNamespace("Előterjesztő")).toBeNull();
    });

    it("minden adatlap verziója legalább 1", () => {
        for (const schema of Object.values(FORM_SCHEMAS)) {
            expect(schema.version).toBeGreaterThanOrEqual(1);
        }
    });
});
