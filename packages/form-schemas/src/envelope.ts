// A PDF-be ágyazott form JSON-ok verziózása és migrálása.
//
// A mentett JSON gyökerében névterek állnak ("Kérelmezői", "Előterjesztői", "Bizottsági",
// "Előterjesztő<n>"), mellettük pedig a "_meta" boríték, ami névtér-fajtánként rögzíti, hogy a
// fájlt író kód melyik sémaverziót használta:
//
//     { "_meta": { "schema": { "Kérelmezői": 2, "Előterjesztői": 1 }, "savedAt": "...", "build": "..." },
//       "Előterjesztői": { ... }, "Kérelmezői": { ... } }
//
// A "_meta" nélküli (a verziózás bevezetése előtt mentett) fájlok minden névtere 1-es verziójú.
// Betöltéskor minden névtér a saját migrációs láncán (n -> n+1 lépésekben) jut el az aktuális
// verzióig, így a hívók mindig az aktuális szerkezetű fát kapják, a "_meta" nélkül.

export type Tree = Record<string, unknown>;

/** Egy névtér részfáját (pl. a "Kérelmezői" kulcs alatti objektumot) alakítja át a következő verzióra. */
export type Migration = (ns: Tree) => Tree;

export type FormSchema = {
    /** Az aktuális sémaverzió (1-től indul). */
    version: number;
    /** migrations[n] az n-es verziójú részfát n+1-esre alakítja; minden 1 <= n < version-re meg kell adni. */
    migrations: Record<number, Migration>;
};

export const META_KEY = "_meta";

export type EmbeddedMeta = {
    /** Névtér-fajtánként (nem névterenként: az "Előterjesztő<n>" névterek az "Előterjesztői" verzióját követik) */
    schema: Record<string, number>;
    savedAt?: string;
    build?: string;
};

/** Felhasználónak megjeleníthető hiba a beágyazott adat betöltésekor. */
export class FormDataError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FormDataError";
    }
}

/** Az adatlapot a programnak egy újabb, ennél frissebb változata mentette. */
export class NewerFormatError extends FormDataError {
    readonly kind: string;
    readonly fileVersion: number;
    readonly supportedVersion: number;

    constructor(kind: string, fileVersion: number, supportedVersion: number) {
        super(
            `Az adatlapot (${kind}) a program egy újabb változata mentette (adatverzió: ${fileVersion}, ez a változat legfeljebb a(z) ${supportedVersion}. verziót ismeri). ` +
                "Kérem, frissítse az oldalt (szükség esetén a böngésző gyorsítótárának ürítésével), majd próbálja újra."
        );
        this.name = "NewerFormatError";
        this.kind = kind;
        this.fileVersion = fileVersion;
        this.supportedVersion = supportedVersion;
    }
}

declare const BUILD_DATE: string;

function isTree(value: unknown): value is Tree {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readMeta(value: unknown): EmbeddedMeta | null {
    if (!isTree(value) || !isTree(value.schema)) return null;
    const schema: Record<string, number> = {};
    for (const [kind, version] of Object.entries(value.schema)) {
        if (typeof version === "number" && Number.isInteger(version) && version >= 1) {
            schema[kind] = version;
        }
    }
    return { ...value, schema };
}

export function createSchemaRegistry<K extends string>(schemas: Record<K, FormSchema>, kindOfNamespace: (namespace: string) => K | null) {
    for (const [kind, schema] of Object.entries<FormSchema>(schemas)) {
        for (let v = 1; v < schema.version; v++) {
            if (!schema.migrations[v]) {
                throw new Error(`Hiányzó migráció: ${kind} ${v} -> ${v + 1}`);
            }
        }
    }

    /** Egy névtér részfáját a `from` verzióról az aktuálisra hozza. A bemenetet nem módosítja. */
    function upgradeNamespace(kind: K, ns: Tree, from: number): Tree {
        const { version, migrations } = schemas[kind];
        if (from > version) {
            throw new NewerFormatError(kind, from, version);
        }
        let current = from < version ? structuredClone(ns) : ns;
        for (let v = from; v < version; v++) {
            current = migrations[v](current);
        }
        return current;
    }

    /**
     * Egy PDF-ből kiolvasott form JSON szövegét értelmezi: leválasztja a "_meta" borítékot, és minden
     * ismert névteret az aktuális sémaverzióra migrál. Hibás vagy túl új adat esetén FormDataError-t dob.
     */
    function loadEmbedded(text: string): Tree {
        let parsed: unknown;
        try {
            parsed = JSON.parse(text);
        } catch {
            throw new FormDataError("A PDF-be ágyazott adatlap sérült, nem olvasható be.");
        }
        if (!isTree(parsed)) {
            throw new FormDataError("A PDF-be ágyazott adatlap formátuma ismeretlen, nem olvasható be.");
        }

        const { [META_KEY]: rawMeta, ...tree } = parsed;
        const meta = readMeta(rawMeta);
        const result: Tree = {};
        for (const [namespace, value] of Object.entries(tree)) {
            const kind = kindOfNamespace(namespace);
            result[namespace] = kind && isTree(value) ? upgradeNamespace(kind, value, meta?.schema[kind] ?? 1) : value;
        }
        return result;
    }

    /**
     * Mentéshez alakítja szöveggé a form JSON-t: a gyökérbe a "_meta" boríték kerül, benne a fában
     * szereplő névterek aktuális sémaverziójával. A fának már az aktuális szerkezetűnek kell lennie
     * (pl. store.toJSON(), vagy egy loadEmbedded által visszaadott fa).
     */
    function serializeEmbedded(tree: Tree): string {
        const schema: Record<string, number> = {};
        for (const namespace of Object.keys(tree)) {
            const kind = kindOfNamespace(namespace);
            if (kind) schema[kind] = schemas[kind].version;
        }
        const meta: EmbeddedMeta = {
            schema,
            savedAt: new Date().toISOString(),
            ...(typeof BUILD_DATE !== "undefined" ? { build: BUILD_DATE } : {})
        };
        const { [META_KEY]: _ignored, ...rest } = tree;
        return JSON.stringify({ [META_KEY]: meta, ...rest }, null, 4);
    }

    return { upgradeNamespace, loadEmbedded, serializeEmbedded };
}
