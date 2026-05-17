import {
    activeMTMTUserIdAtom,
    atomsToJSON,
    getAuthorRecord,
    getPdfDocumentStyles,
    getPdfSection,
    getScientometricsPdfSection,
    loadMTMTCitations,
    mtmtPubListAtom,
    savePdfWithFormData,
    savePubItemSummary,
    store,
    type FormData,
    type FormDescriptor
} from "@repo/form-engine";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

export const savePDF = async (descriptor: FormDescriptor, formData: FormData) => {
    const doktoriMuSection = [];
    const formaKey = "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája";
    if (store.get(formData[formaKey])[0] === "monográfia vagy könyv") {
        doktoriMuSection.push({ text: "A könyv adatai:", style: "subsection" });
        doktoriMuSection.push(
            ...(await getPdfSection(descriptor, formData, "Kérelmezői|A doktori mű adatai|Könyv adatai", "", { bibIndex: "true", bibLabel: "" }))
        );
    } else if (store.get(formData[formaKey])[0] === "rövid értekezés") {
        doktoriMuSection.push({ text: "A SJR D1 besorolású tudományos közleményeinek listája:", style: "subsection" });
        doktoriMuSection.push(
            ...(await getPdfSection(descriptor, formData, "Kérelmezői|A doktori mű adatai|D1 közlemények listája", "", { bibIndex: "true", bibLabel: "" }))
        );
        doktoriMuSection.push({ text: "A téziseket alátámasztó, legfeljebb 6 darab SJR legalább Q1 besorolású cikk:", style: "subsection" });
        doktoriMuSection.push(
            ...(await getPdfSection(descriptor, formData, "Kérelmezői|A doktori mű adatai|Téziseket alátámasztó publikációk", "", {
                bibIndex: "true",
                bibLabel: ""
            }))
        );
    }

    const hivatkozasok = store
        .get(formData["Kérelmezői|Legfontosabb hivatkozások|Öt legfontosabb hivatkozás|Öt legfontosabb hivatkozás|Hivatkozó közlemény"])
        .filter((h) => h) as string[];

    const docDefinition: TDocumentDefinitions = {
        ...getPdfDocumentStyles(),
        content: [
            { text: "MTA Műszaki Tudományok Osztálya", italics: true },
            { text: "KÉRELMEZŐI ADATLAP", style: "header" },
            { text: "1. A kérelmező főbb adatai", style: "section" },
            await getPdfSection(descriptor, formData, "Kérelmezői|A kérelmező főbb adatai|Személyes adatok", ""),
            await getPdfSection(descriptor, formData, "Kérelmezői|A kérelmező főbb adatai|Diplomák", (i) => (i === 0 ? "Egyetemi diploma:" : "Egyéb diploma:")),
            await getPdfSection(descriptor, formData, "Kérelmezői|A kérelmező főbb adatai|Tudományos fokozatok", "Tudományos fokozat:"),
            await getPdfSection(descriptor, formData, "Kérelmezői|A kérelmező főbb adatai|Tudományos címek", "Tudományos cím:"),
            await getPdfSection(descriptor, formData, "Kérelmezői|A kérelmező főbb adatai|Aktuális munkahelyek", "Munkahely (a benyújtáskor):"),
            await getPdfSection(descriptor, formData, "Kérelmezői|A kérelmező főbb adatai|Nyelvismeret", "Nyelvtudás:"),
            { text: "2. A kérelmező szakterületei", style: "section" },
            await getPdfSection(descriptor, formData, "Kérelmezői|A kérelmező főbb adatai|Szakterületek", ""),
            {
                text: "3. A kérelmező egyetemi oktatói, kutatóintézeti, ipari, tervezői vagy kivitelezői tevékenysége, munkahelyei (utolsó három)",
                style: "section"
            },
            await getPdfSection(descriptor, formData, "Kérelmezői|A kérelmező főbb adatai|Korábbi tevékenységek, munkahelyek", ""),
            { text: "4. Az eljárás alapjául szolgáló doktori mű", style: "section" },
            await getPdfSection(descriptor, formData, "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű", ""),
            ...doktoriMuSection,
            { text: "5. A kérelmező öt legfontosabb publikációja", style: "section" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Legfontosabb publikációk|Öt legfontosabb publikáció", "", { bibIndex: "true", bibLabel: "" }),
            { text: "6. A kérelmező öt legfontosabb hivatkozása", style: "section" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Legfontosabb hivatkozások|Öt legfontosabb hivatkozás", "", {
                bibIndex: "true",
                bibLabels: { "Hivatkozott közlemény": "Hivatkozott\nközlemény", "Hivatkozó közlemény": "Hivatkozó\nközlemény" },
                indexColWidth: "75"
            }),
            {
                text: [
                    "Az 5 hivatkozás megjelenítése az MTMT adattárban:",
                    " ",
                    {
                        text: hivatkozasok.length > 0 ? "link" : "nincsenek hivatkozások megadva",
                        link:
                            hivatkozasok.length > 0
                                ? `https://m2.mtmt.hu/api/publication?format=html&st_on=1&url_on=1&com_on=1&type_on=1&la_on=1&cite_type=4&fields=citations:2&ctx_on=1&cond=mtid;in;${hivatkozasok.join(",")}`
                                : undefined,
                        style: hivatkozasok.length > 0 ? "link" : ""
                    }
                ],
                margin: [20, 10, 0, 10]
            },
            { text: "7. A kérelmező kiemelkedő megvalósult műszaki alkotásai", style: "section" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása", "Műszaki alkotás", {
                indexColWidth: "136",
                sectionIndex: "true"
            }),
            { text: "8. A kérelmező tudományos közéleti tevékenysége", style: "section" },
            { text: "8.1. TDK témavezetés", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés", "", {
                useGroupLabelAsHeader: "true"
            }),
            { text: "8.2. Részvétel graduális és doktori képzésben (tárgyelőadó, tárgyfelelős)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben", ""),
            { text: "8.3. Részvétel doktori témavezetésben (fokozatot szerzett hallgatók)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók", ""),
            { text: "8.4. Részvétel tudományos zsűriben, kuratóriumban, bírálatokban", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban",
                ""
            ),
            { text: "8.5. Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében, plenáris előadások", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Kérelmezői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében",
                ""
            ),
            { text: "8.6. Tisztség, kiemelt/választott tagság hazai és/vagy nemzetközi tudományos szervezetben", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Kérelmezői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben",
                ""
            ),
            { text: "8.7. Folyóirat-szerkesztőbizottsági tagság legalább 2 évig", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig", ""),
            { text: "8.8. Részvétel tudományos minősítésben (bíráló, bírálóbizottsági titkár)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos minősítésben", ""),
            { text: "8.9. Elnyert tudományos pályázat (témavezető, résztvevő)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat", ""),
            { text: "8.10. Külföldi tartózkodás", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Külföldi tartózkodás", ""),
            { text: "8.11. Állami vagy MTA által adományozott tudományos díj, kitüntetés", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Kérelmezői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés",
                ""
            ),
            { text: "9. A doktori címet megalapozó tudományos munkásság rövid összefoglalója", style: "section" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Munkásság összefoglalása|Összefoglaló szövege", "", { nolabel: "true" }),
            { text: "10. Egyéb közlendők", style: "section" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Munkásság összefoglalása|Egyéb közlendők", "", { nolabel: "true" }),
            //{ text: "Melléklet", italics: true, pageBreak: "before" },
            {
                text: "Az MTMT segítségével elkészített tudománymetriai táblázat",
                bold: true,
                fontSize: 14,
                alignment: "center",
                margin: [0, 0, 0, 5],
                pageBreak: "before"
            },
            ...getScientometricsPdfSection()
        ]
    };

    const mtmtData = await collectMTMTDataToSave(descriptor, formData);

    savePdfWithFormData(docDefinition, "adatlap.pdf", {
        "kerelmezo_form.json": JSON.stringify(atomsToJSON(formData), null, 4),
        "kerelmezo_mtmt.json": JSON.stringify(mtmtData, null, 4)
    });
};

async function collectMTMTDataToSave(descriptor: FormDescriptor, formData: FormData): Promise<object> {
    const mtids = new Set<string>();
    const citationParentMtids = new Set<string>();

    for (const page of Object.values(descriptor)) {
        for (const section of page.sections) {
            for (const group of section.groups) {
                const groupLengthKey = `Kérelmezői|${page.key}|${section.key}|${group.key}|_length`;
                const groupLength = group.isArray ? Number.parseInt(store.get(formData[groupLengthKey])?.[0] ?? "0", 10) || 0 : 1;

                for (const field of group.fields) {
                    if (field.type !== "mtmtPub" && field.type !== "mtmtCitation") {
                        continue;
                    }

                    const fieldKey = `Kérelmezői|${page.key}|${section.key}|${group.key}|${field.key}`;
                    const values = store.get(formData[fieldKey]) ?? [];

                    for (let index = 0; index < groupLength; index++) {
                        const mtid = values[index];
                        if (mtid) {
                            mtids.add(mtid);
                        }

                        if (field.type !== "mtmtCitation" || !field.attribs?.pubKey) {
                            continue;
                        }

                        const parentValues = store.get(formData[String(field.attribs.pubKey)]) ?? [];
                        const parentMtid = parentValues[index]?.trim();
                        if (parentMtid) {
                            citationParentMtids.add(parentMtid);
                        }
                    }
                }
            }
        }
    }

    await Promise.all(Array.from(citationParentMtids, (mtid) => loadMTMTCitations(mtid)));

    const mtmtCache = savePubItemSummary(Array.from(mtids));
    const pubList = store.get(mtmtPubListAtom) ?? [];
    const allPubMTMTs: Record<string, string[]> = pubList.reduce(
        (acc, pub) => {
            const mtid = String(pub.mtid);
            if (!acc[mtid]) {
                acc[mtid] = [];
            }
            if (pub.authorships) {
                for (const auth of pub.authorships as any[]) {
                    if (auth["authorTyped"] === true && auth["author"]) {
                        acc[mtid].push(auth["author"]["mtid"]);
                    }
                }
            }
            return acc;
        },
        {} as Record<string, string[]>
    );
    const authorData = await getAuthorRecord(store.get(activeMTMTUserIdAtom));

    return {
        "Adatlapon szereplő publikációk": mtmtCache,
        Társszerzők: allPubMTMTs,
        "Szerzői adatok": authorData
    };
}
