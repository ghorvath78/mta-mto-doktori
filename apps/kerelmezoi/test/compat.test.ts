import { describe, expect, it } from "vitest";
import { FormStore } from "@repo/form-engine";
import { FORM_SCHEMAS, loadEmbedded, serializeEmbedded } from "@repo/form-schemas";
import { kerelmezoiFormDescriptor } from "../src/kerelmezoiform";
import { loadMigratedNamespaces } from "../../../test-fixtures/fixtures";

// A kérelmezői adat minden helyen, ahol egy mentett PDF-ben előfordul: a kérelmezői PDF-ben, az
// előterjesztői PDF-be ágyazva (kétszer is), és a bizottsági PDF "Kérelmezői" ágában.
const samples = await loadMigratedNamespaces("Kérelmezői");
const { formName, pages } = kerelmezoiFormDescriptor;

describe("Kérelmezői adatlap visszafelé kompatibilitása", () => {
    it("vannak minta adatlapok", () => {
        expect(samples.length).toBeGreaterThan(0);
    });

    it.each(samples)("$label: minden mező betölthető", ({ ns }) => {
        const store = new FormStore(formName, pages);
        const dropped = store.fromJSON({ [formName]: ns });
        expect(dropped).toEqual([]);
        expect(store.getField("Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Név")).not.toBe("");
        expect(store.getField("Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|MTMT azonosító")).not.toBe("");
    });

    it.each(samples)("$label: a mentés aktuális verzióval, változatlanul tölthető vissza", ({ ns }) => {
        const store = new FormStore(formName, pages);
        store.fromJSON({ [formName]: ns });
        const saved = store.toJSON();
        const text = serializeEmbedded(saved);
        expect(JSON.parse(text)._meta.schema).toEqual({ [formName]: FORM_SCHEMAS.Kérelmezői.version });
        expect(loadEmbedded(text)).toEqual(saved);
    });
});
