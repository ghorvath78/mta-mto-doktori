import { describe, expect, it } from "vitest";
import { FormStore } from "@repo/form-engine";
import { FORM_SCHEMAS, loadEmbedded, serializeEmbedded } from "@repo/form-schemas";
import { bizottsagiFormDescriptor } from "../src/bizottsagiform";
import { loadMigratedNamespaces } from "../../../test-fixtures/fixtures";

// A bizottsági PDF saját ("Bizottsági") névtere. A benne lévő "Kérelmezői" és "Előterjesztő<n>"
// ágakat a kérelmezői és az előterjesztői app kompatibilitási tesztje ellenőrzi.
const samples = await loadMigratedNamespaces("Bizottsági");
const { formName, pages } = bizottsagiFormDescriptor;

describe("Bizottsági adatlap visszafelé kompatibilitása", () => {
    it("vannak minta adatlapok", () => {
        expect(samples.length).toBeGreaterThan(0);
    });

    it.each(samples)("$label: minden mező betölthető", ({ ns }) => {
        const store = new FormStore(formName, pages);
        const dropped = store.fromJSON({ [formName]: ns });
        expect(dropped).toEqual([]);
        expect(store.getField("Bizottsági|Bizottság|Bizottság összetétele|Bizottság összetétele|Ügykezelő bizottság")).not.toBe("");
        expect(store.getField("Bizottsági|Illetékesség|Illetékesség|A bizottság véleménye|Bizottsági megállapítás")).not.toBe("");
        expect(store.getField("Bizottsági|Illetékesség|Illetékesség|Illetékesség szavazás eredménye|Igen szavazatok száma")).not.toBe("");
        expect(store.getField("Bizottsági|Alkalmasság|Alkalmasság|Alkalmasság|Bizottsági vélemény")).not.toBe("");
        expect(store.getField("Bizottsági|Alkalmasság|Alkalmasság|Alkalmasság szavazás eredménye|Igen szavazatok száma")).not.toBe("");
    });

    it.each(samples)("$label: a mentés aktuális verzióval, változatlanul tölthető vissza", ({ ns }) => {
        const store = new FormStore(formName, pages);
        store.fromJSON({ [formName]: ns });
        const saved = store.toJSON(pages, formName);
        const text = serializeEmbedded(saved);
        expect(JSON.parse(text)._meta.schema).toEqual({ [formName]: FORM_SCHEMAS.Bizottsági.version });
        expect(loadEmbedded(text)).toEqual(saved);
    });
});
