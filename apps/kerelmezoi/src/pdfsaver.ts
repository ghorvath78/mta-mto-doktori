import {
    atomsToJSON,
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

declare const BUILD_DATE: string;

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
                tableGroup: "Lista",
                colWidths: "*,40,*,50,40",
                useGroupLabelAsHeader: "true"
            }),
            { text: "8.2. Részvétel graduális és doktori képzésben (tárgyelőadó, tárgyfelelős)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben", "", {
                tableGroup: "Lista",
                colWidths: "*,*,80,60,55"
            }),
            { text: "8.3. Részvétel doktori témavezetésben (fokozatot szerzett hallgatók)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók", "", {
                tableGroup: "Lista",
                colWidths: "*,80,*,80"
            }),
            { text: "8.4. Részvétel tudományos zsűriben, kuratóriumban, bírálatokban", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban",
                "",
                {
                    tableGroup: "Lista",
                    colWidths: "*,60,*,80"
                }
            ),
            { text: "8.5. Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében, plenáris előadások", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Kérelmezői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében",
                "",
                {
                    tableGroup: "Lista",
                    colWidths: "*,80,100,60"
                }
            ),
            { text: "8.6. Tisztség, kiemelt/választott tagság hazai és/vagy nemzetközi tudományos szervezetben", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Kérelmezői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben",
                "",
                {
                    tableGroup: "Lista",
                    colWidths: "*,60,60,90,80"
                }
            ),
            { text: "8.7. Folyóirat-szerkesztőbizottsági tagság legalább 2 évig", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig", "", {
                tableGroup: "Lista",
                colWidths: "*,60,60,90,80"
            }),
            { text: "8.8. Részvétel tudományos minősítésben (bíráló, bírálóbizottsági titkár)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos minősítésben", "", {
                firstColWidth: "200",
                hideEmptyGroup: "true"
            }),
            { text: "8.9. Elnyert tudományos pályázat (témavezető, résztvevő)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat (témavezető, résztvevő)", "", {
                tableGroup: "Lista",
                colWidths: "*,70,60,60,80"
            }),
            { text: "8.10. Külföldi tartózkodás", style: "subsection" },
            await getPdfSection(descriptor, formData, "Kérelmezői|Tudományos közéleti tevékenység|Külföldi tartózkodás", "", {
                tableGroup: "Lista",
                colWidths: "*,85,85,90"
            }),
            { text: "8.11. Állami vagy MTA által adományozott tudományos díj, kitüntetés", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Kérelmezői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés",
                "",
                {
                    tableGroup: "Lista",
                    colWidths: "*,*,90,90"
                }
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
        ],
        defaultStyle: {
            fontSize: 11,
            marginLeft: 20
        },
        styles: {
            header: {
                fontSize: 14,
                bold: true,
                alignment: "center",
                marginTop: 20,
                marginBottom: 20
            },
            section: {
                fontSize: 12,
                bold: true,
                decoration: "underline",
                marginTop: 15,
                marginBottom: 5
            },
            subsection: {
                fontSize: 11,
                bold: true,
                decoration: "underline",
                marginTop: 10,
                marginBottom: 0,
                marginLeft: 10
            },
            grouplabel: {
                fontSize: 11,
                bold: true,
                marginTop: 10,
                marginBottom: 5,
                marginLeft: 10
            },
            nodata: {
                fontSize: 11,
                italics: true,
                marginLeft: 20,
                marginTop: 10,
                marginBottom: 5,
                color: "gray"
            },
            tableHeader: { bold: true, fontSize: 9, fillColor: "#dddddd" },
            subTableHeader: { bold: true, fontSize: 9, fillColor: "#dddddd" },
            tableBody: { fontSize: 9 },
            tableLink: { fontSize: 9, color: "blue", decoration: "underline" },
            tableSummaryHeader: { bold: true, fontSize: 9, fillColor: "#dddddd" },
            tableSummaryData: { bold: true, fontSize: 9, fillColor: "#dddddd" },
            link: { color: "blue", decoration: "underline" },
            authors: { fontSize: 10 },
            title: { italics: true, fontSize: 11 },
            info: { fontSize: 10 }
        },
        // add/adjust pageMargins if needed:
        pageMargins: [40, 60, 40, 50],
        footer: (currentPage: number) => {
            return {
                table: {
                    widths: [500, "*"],
                    body: [
                        [
                            {
                                text: `Exportálás időpontja: ${new Date().toLocaleString("hu-HU")}  szoftver verzió: v${BUILD_DATE}`,
                                fontSize: 8,
                                margin: [40, 0, 0, 0],
                                alignment: "left"
                            },
                            {
                                text: `${currentPage}`,
                                fontSize: 8,
                                alignment: "right",
                                margin: [0, 0, 40, 0]
                            }
                        ]
                    ]
                },
                layout: "noBorders"
            };
        }
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
    const allPubMTMTs: string[] = pubList.map((pub) => String(pub.mtid));

    return {
        "Adatlapon szereplő publikációk": mtmtCache,
        "A pályázó összes publikációja a beadáskor": allPubMTMTs
    };
}
