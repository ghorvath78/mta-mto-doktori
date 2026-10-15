// Közös segédfüggvények a kompatibilitási tesztekhez (apps/*/test/compat.test.ts).
//
// A v<n>/ mappákban az adott sémaverzióval mentett, befagyasztott minta PDF-ek vannak. Ezeket soha nem
// szabad újramenteni vagy lecserélni: a tesztek azt ellenőrzik, hogy a régi verziójú adatlapok a
// migrációk után is hiánytalanul betölthetők a jelenlegi űrlapokba. Verzióemeléskor új mappába (pl. v2/)
// kerüljenek az új verzióval mentett minták.

import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readJsonFromPdf } from "../packages/form-engine/src/pdfloader.ts";
import { kindOfNamespace, loadEmbedded, type FormKind, type Tree } from "../packages/form-schemas/src/index.ts";

const FIXTURES_DIR = fileURLToPath(new URL(".", import.meta.url));

/** A PDF-ekbe ágyazható form JSON-ok (a kerelmezo_mtmt.json nem form adat, nincs verziózva). */
const EMBEDDED_FORM_FILES = ["kerelmezo_form.json", "eloterjeszto_form.json", "bizottsagi_form.json"];

export type NamespaceSample = {
    /** pl. "v1/bizottsagi-teljes.pdf › bizottsagi_form.json › Előterjesztő2" */
    label: string;
    /** a loadEmbedded által már az aktuális verzióra migrált névtér-részfa */
    ns: Tree;
};

function listFixturePdfs(): string[] {
    const result: string[] = [];
    for (const dir of readdirSync(FIXTURES_DIR, { withFileTypes: true })) {
        if (!dir.isDirectory() || !/^v\d+$/.test(dir.name)) continue;
        for (const file of readdirSync(join(FIXTURES_DIR, dir.name))) {
            if (file.endsWith(".pdf")) result.push(join(FIXTURES_DIR, dir.name, file));
        }
    }
    return result.sort();
}

/** Az összes minta PDF összes beágyazott form JSON-jából kigyűjti az adott fajtájú névtereket, migrálva. */
export async function loadMigratedNamespaces(kind: FormKind): Promise<NamespaceSample[]> {
    const samples: NamespaceSample[] = [];
    for (const path of listFixturePdfs()) {
        const file = new File([readFileSync(path)], basename(path), { type: "application/pdf" });
        const fileLabel = `${basename(join(path, ".."))}/${basename(path)}`;
        for (const embeddedName of EMBEDDED_FORM_FILES) {
            const text = await readJsonFromPdf(file, embeddedName);
            if (!text) continue;
            const tree = loadEmbedded(text);
            for (const [namespace, ns] of Object.entries(tree)) {
                if (kindOfNamespace(namespace) === kind) {
                    samples.push({ label: `${fileLabel} › ${embeddedName} › ${namespace}`, ns: ns as Tree });
                }
            }
        }
    }
    return samples;
}
