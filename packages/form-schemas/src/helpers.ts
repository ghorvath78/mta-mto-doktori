// Segédfüggvények a migrációkhoz. Egy névtér részfáján dolgoznak (a "Kérelmezői" stb. kulcs alatti
// objektumon), és helyben módosítják: az upgradeNamespace a migrációs lánc előtt lemásolja a bemenetet.
//
// A részfa szerkezete: lap › szakasz › csoport › mező. Ha a csoport kulcsa megegyezik a szakaszéval, a
// csoportszint kimarad, a csoport mezői közvetlenül a szakasz alatt állnak (ld. FormStore.toJSON).

import type { Tree } from "./envelope.ts";

function isTree(value: unknown): value is Tree {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Egy szakaszt a teljes részfájával egy másik lap alá helyez át, változatlan szakaszkulccsal (a
 * szakasz átnevezése a fenti csoportszint-összevonás miatt a részfa átalakítását is igényelné). A
 * célhelyen esetleg már álló szakaszt felülírja; ha a forrás lap üressé válik, azt törli.
 */
export function moveSectionToPage(ns: Tree, fromPage: string, section: string, toPage: string): Tree {
    const source = ns[fromPage];
    if (!isTree(source) || !(section in source)) return ns;

    const target = isTree(ns[toPage]) ? (ns[toPage] as Tree) : {};
    target[section] = source[section];
    ns[toPage] = target;

    delete source[section];
    if (Object.keys(source).length === 0) delete ns[fromPage];
    return ns;
}
