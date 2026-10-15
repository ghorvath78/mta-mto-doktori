import { createSchemaRegistry, type FormSchema } from "./envelope.ts";
import { bizottsagiV1toV2 } from "./migrations/bizottsagi.ts";
import { eloterjesztoiV1toV2 } from "./migrations/eloterjesztoi.ts";

// A három adatlap sémaverziói és migrációi.
//
// Ha egy változtatás a mentett JSON szerkezetét érinti (mező, csoport, szakasz vagy lap átnevezése,
// áthelyezése, egy érték formátumának változása), akkor az érintett adatlap verzióját eggyel növelni
// kell, és a migrations-be fel kell venni a régi -> új átalakítást (migrations[régi verzió]).
// Új mező felvételéhez nem kell migráció: a hiányzó mezők az alapértéküket kapják.
//
// A migrációk egy névtér részfáján dolgoznak (a "Kérelmezői" stb. kulcs alatti objektumon), így
// ugyanaz a függvény fut a kérelmezői PDF-en, az előterjesztői PDF-be ágyazott kérelmezői adaton, és
// a bizottsági PDF "Kérelmezői" ágán is. Egy már kiadott migrációt soha nem szabad módosítani.
export const FORM_SCHEMAS = {
    Kérelmezői: { version: 1, migrations: {} },
    Előterjesztői: { version: 2, migrations: { 1: eloterjesztoiV1toV2 } },
    Bizottsági: { version: 2, migrations: { 1: bizottsagiV1toV2 } }
} satisfies Record<string, FormSchema>;

export type FormKind = keyof typeof FORM_SCHEMAS;

/** A bizottsági adatlapon az előterjesztők adatai "Előterjesztő<n>" névtér alatt állnak, de az előterjesztői sémát követik. */
export function kindOfNamespace(namespace: string): FormKind | null {
    if (namespace in FORM_SCHEMAS) return namespace as FormKind;
    if (/^Előterjesztő\d+$/.test(namespace)) return "Előterjesztői";
    return null;
}

export const { upgradeNamespace, loadEmbedded, serializeEmbedded } = createSchemaRegistry<FormKind>(FORM_SCHEMAS, kindOfNamespace);
