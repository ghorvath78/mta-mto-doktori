import { describe, expect, it } from "vitest";
import { FormStore } from "@repo/form-engine";
import { FORM_SCHEMAS, loadEmbedded, serializeEmbedded } from "@repo/form-schemas";
import { eloterjesztoiFormDescriptor } from "../src/eloterjesztoiform";
import { loadMigratedNamespaces } from "../../../test-fixtures/fixtures";

// Az előterjesztői adat az előterjesztői PDF-ben ("Előterjesztői"), és a bizottsági PDF-ben az egyes
// előterjesztők "Előterjesztő<n>" névtere alatt fordul elő.
const samples = await loadMigratedNamespaces("Előterjesztői");
const { formName, pages } = eloterjesztoiFormDescriptor;

describe("Előterjesztői adatlap visszafelé kompatibilitása", () => {
    it("vannak minta adatlapok", () => {
        expect(samples.length).toBeGreaterThan(0);
    });

    it.each(samples)("$label: minden mező betölthető", ({ ns }) => {
        const store = new FormStore(formName, pages);
        const dropped = store.fromJSON({ [formName]: ns });
        expect(dropped).toEqual([]);
        expect(store.getField("Előterjesztői|Előterjesztő adatai|Előterjesztő adatai|Adatok|Előterjesztő neve")).not.toBe("");
        expect(store.getField("Előterjesztői|Illetékesség|Illetékesség|Illetékesség|Illetékesség megállapítása")).not.toBe("");
        expect(store.getField("Előterjesztői|Alkalmasság|Alkalmasság|Alkalmasság|Formai alkalmasság megállapítása")).not.toBe("");
    });

    it.each(samples)("$label: a mentés aktuális verzióval, változatlanul tölthető vissza", ({ ns }) => {
        const store = new FormStore(formName, pages);
        store.fromJSON({ [formName]: ns });
        const saved = store.toJSON(pages, formName);
        const text = serializeEmbedded(saved);
        expect(JSON.parse(text)._meta.schema).toEqual({ [formName]: FORM_SCHEMAS.Előterjesztői.version });
        expect(loadEmbedded(text)).toEqual(saved);
    });
});
