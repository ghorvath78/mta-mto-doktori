import { describe, expect, it } from "vitest";
import { moveSectionToPage } from "./helpers.ts";
import { kindOfNamespace, loadEmbedded, type Tree } from "./index.ts";
import { listEmbeddedForms } from "../../../test-fixtures/fixtures.ts";

describe("moveSectionToPage", () => {
    it("a szakaszt a teljes részfájával áthelyezi, a kiürült lapot törli", () => {
        const ns = { Régi: { Sz: { Mező: "x", Csoport: [{ a: "1" }] } }, Más: { M: "y" } };
        expect(moveSectionToPage(ns, "Régi", "Sz", "Új")).toEqual({ Más: { M: "y" }, Új: { Sz: { Mező: "x", Csoport: [{ a: "1" }] } } });
    });

    it("a forrás lap többi szakaszát meghagyja, a cél lap meglévő szakaszaihoz hozzáad", () => {
        const ns = { Régi: { Sz: { a: "1" }, Marad: { b: "2" } }, Új: { Van: { c: "3" } } };
        expect(moveSectionToPage(ns, "Régi", "Sz", "Új")).toEqual({ Régi: { Marad: { b: "2" } }, Új: { Van: { c: "3" }, Sz: { a: "1" } } });
    });

    it("hiányzó forrás esetén nem változtat", () => {
        expect(moveSectionToPage({ Más: {} }, "Régi", "Sz", "Új")).toEqual({ Más: {} });
        expect(moveSectionToPage({ Régi: { Egyéb: {} } }, "Régi", "Sz", "Új")).toEqual({ Régi: { Egyéb: {} } });
    });
});

// A valódi v1-es minták (public/mintak) adataival: a két szakasz tartalma bitre azonosan megérkezik.
const v1Samples: { label: string; raw: Tree; migrated: Tree }[] = [];
for (const { label, version, text } of await listEmbeddedForms()) {
    if (version !== 1) continue;
    const raw = JSON.parse(text) as Record<string, Tree>;
    const migrated = loadEmbedded(text) as Record<string, Tree>;
    for (const namespace of Object.keys(raw)) {
        const kind = kindOfNamespace(namespace);
        if (kind === "Előterjesztői" || kind === "Bizottsági") {
            v1Samples.push({ label: `${label} › ${namespace}`, raw: raw[namespace], migrated: migrated[namespace] });
        }
    }
}

// Az illetékesség és a formai alkalmasság szakaszai a "Pályázó adatai" lapról saját lapra kerültek.
describe("Előterjesztői és Bizottsági v1 -> v2", () => {
    it("áthelyezi a két szakaszt, a többi lapot nem érinti", () => {
        const v1 = {
            "Pályázó adatai": { Illetékesség: { "Illetékesség megállapítása": "igen" }, Alkalmasság: { "Formai alkalmasság megállapítása": "nem|indok" } },
            "Összefoglaló javaslat": { x: "1" }
        };
        for (const namespace of ["Előterjesztői", "Előterjesztő2", "Bizottsági"]) {
            expect(loadEmbedded(JSON.stringify({ [namespace]: v1 }))).toEqual({
                [namespace]: {
                    Illetékesség: { Illetékesség: { "Illetékesség megállapítása": "igen" } },
                    Alkalmasság: { Alkalmasság: { "Formai alkalmasság megállapítása": "nem|indok" } },
                    "Összefoglaló javaslat": { x: "1" }
                }
            });
        }
    });

    it("a kérelmezői adatot nem érinti", () => {
        const kerelmezoi = { "Pályázó adatai": { Illetékesség: { a: "1" } } };
        expect(loadEmbedded(JSON.stringify({ Kérelmezői: kerelmezoi }))).toEqual({ Kérelmezői: kerelmezoi });
    });

    it("vannak v1-es minták", () => {
        expect(v1Samples.length).toBeGreaterThan(0);
    });

    it.each(v1Samples)("$label", ({ raw, migrated }) => {
        const palyazo = raw["Pályázó adatai"] as Tree;
        expect(palyazo.Illetékesség).toBeTruthy();
        expect(palyazo.Alkalmasság).toBeTruthy();
        expect((migrated.Illetékesség as Tree).Illetékesség).toEqual(palyazo.Illetékesség);
        expect((migrated.Alkalmasság as Tree).Alkalmasság).toEqual(palyazo.Alkalmasság);
        expect(migrated["Pályázó adatai"]).toBeUndefined();
    });
});
