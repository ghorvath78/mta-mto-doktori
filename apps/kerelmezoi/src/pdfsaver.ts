import { getPdfDocumentStyles, getPdfSection, savePdfWithFormData, type FormInfo } from "@repo/form-engine";
import { getAuthorRecord, loadMTMTCitations, PubList, savePubListMinimal, type Scientometrics } from "@repo/mtmt-tools";
import type { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";

export const savePDF = async (formInfo: FormInfo) => {
    const store = formInfo.valueStore;
    const descriptor = formInfo.descriptor;
    const doktoriMuSection = [];
    const formaKey = "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája";
    if (store.getField(formaKey) === "monográfia vagy könyv") {
        doktoriMuSection.push({ text: "A könyv adatai:", style: "subsection" });
        doktoriMuSection.push(
            ...(await getPdfSection(descriptor, formInfo, "Kérelmezői|A doktori mű adatai|Könyv adatai", "", { bibIndex: "true", bibLabel: "" }))
        );
    } else if (store.getField(formaKey) === "rövid értekezés") {
        doktoriMuSection.push({ text: "A SJR D1 besorolású tudományos közleményeinek listája:", style: "subsection" });
        doktoriMuSection.push(
            ...(await getPdfSection(descriptor, formInfo, "Kérelmezői|A doktori mű adatai|D1 közlemények listája", "", { bibIndex: "true", bibLabel: "" }))
        );
        doktoriMuSection.push({ text: "A téziseket alátámasztó, legfeljebb 6 darab SJR legalább Q1 besorolású cikk:", style: "subsection" });
        doktoriMuSection.push(
            ...(await getPdfSection(descriptor, formInfo, "Kérelmezői|A doktori mű adatai|Téziseket alátámasztó publikációk", "", {
                bibIndex: "true",
                bibLabel: ""
            }))
        );
    }

    const hivatkozasok = store
        .getArray("Kérelmezői|Legfontosabb hivatkozások|Öt legfontosabb hivatkozás|Öt legfontosabb hivatkozás|Hivatkozó közlemény")
        .filter((h) => h) as string[];

    const docDefinition: TDocumentDefinitions = {
        ...getPdfDocumentStyles(),
        content: [
            { text: "MTA Műszaki Tudományok Osztálya", italics: true },
            { text: "KÉRELMEZŐI ADATLAP", style: "header" },
            { text: "1. A kérelmező főbb adatai", style: "section" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|A kérelmező főbb adatai|Személyes adatok", ""),
            await getPdfSection(descriptor, formInfo, "Kérelmezői|A kérelmező főbb adatai|Diplomák", (i) => (i === 0 ? "Egyetemi diploma:" : "Egyéb diploma:")),
            await getPdfSection(descriptor, formInfo, "Kérelmezői|A kérelmező főbb adatai|Tudományos fokozatok", "Tudományos fokozat:"),
            await getPdfSection(descriptor, formInfo, "Kérelmezői|A kérelmező főbb adatai|Tudományos címek", "Tudományos cím:"),
            await getPdfSection(descriptor, formInfo, "Kérelmezői|A kérelmező főbb adatai|Aktuális munkahelyek", "Munkahely (a benyújtáskor):"),
            await getPdfSection(descriptor, formInfo, "Kérelmezői|A kérelmező főbb adatai|Nyelvvizsgák", "Nyelvvizsga:"),
            { text: "2. A kérelmező szakterületei", style: "section" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|A kérelmező főbb adatai|Szakterületek", ""),
            {
                text: "3. A kérelmező egyetemi oktatói, kutatóintézeti, ipari, tervezői vagy kivitelezői tevékenysége, munkahelyei (utolsó három)",
                style: "section"
            },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|A kérelmező főbb adatai|Korábbi tevékenységek, munkahelyek", ""),
            { text: "4. Az eljárás alapjául szolgáló doktori mű", style: "section" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű", ""),
            ...doktoriMuSection,
            { text: "5. A kérelmező öt legfontosabb publikációja", style: "section" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Legfontosabb publikációk|Öt legfontosabb publikáció", "", { bibIndex: "true", bibLabel: "" }),
            { text: "6. A kérelmező öt legfontosabb hivatkozása", style: "section" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Legfontosabb hivatkozások|Öt legfontosabb hivatkozás", "", {
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
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása", "Műszaki alkotás", {
                indexColWidth: "136",
                sectionIndex: "true"
            }),
            { text: "8. A kérelmező tudományos közéleti tevékenysége", style: "section" },
            { text: "8.1. TDK témavezetés", style: "subsection" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés", "", {
                useGroupLabelAsHeader: "true"
            }),
            { text: "8.2. Részvétel graduális és doktori képzésben (tárgyelőadó, tárgyfelelős)", style: "subsection" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben", ""),
            { text: "8.3. Részvétel doktori témavezetésben (fokozatot szerzett hallgatók)", style: "subsection" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók", ""),
            { text: "8.4. Részvétel tudományos zsűriben, kuratóriumban, bírálatokban", style: "subsection" },
            await getPdfSection(
                descriptor,
                formInfo,
                "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban",
                ""
            ),
            { text: "8.5. Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében, plenáris előadások", style: "subsection" },
            await getPdfSection(
                descriptor,
                formInfo,
                "Kérelmezői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében",
                ""
            ),
            { text: "8.6. Tisztség, kiemelt/választott tagság hazai és/vagy nemzetközi tudományos szervezetben", style: "subsection" },
            await getPdfSection(
                descriptor,
                formInfo,
                "Kérelmezői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben",
                ""
            ),
            { text: "8.7. Folyóirat-szerkesztőbizottsági tagság legalább 2 évig", style: "subsection" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig", ""),
            { text: "8.8. Részvétel tudományos minősítésben (bíráló, bírálóbizottsági titkár)", style: "subsection" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos minősítésben", ""),
            { text: "8.9. Elnyert tudományos pályázat (témavezető, résztvevő)", style: "subsection" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat", ""),
            { text: "8.10. Külföldi szakmai munka", style: "subsection" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Tudományos közéleti tevékenység|Külföldi tartózkodás", ""),
            { text: "8.11. Állami vagy MTA által adományozott tudományos díj, kitüntetés", style: "subsection" },
            await getPdfSection(
                descriptor,
                formInfo,
                "Kérelmezői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés",
                ""
            ),
            { text: "9. A doktori címet megalapozó tudományos munkásság rövid összefoglalója", style: "section" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Munkásság összefoglalása|Összefoglaló szövege", "", { nolabel: "true" }),
            { text: "10. Egyéb közlendők", style: "section" },
            await getPdfSection(descriptor, formInfo, "Kérelmezői|Munkásság összefoglalása|Egyéb közlendők", "", { nolabel: "true" }),
            //{ text: "Melléklet", italics: true, pageBreak: "before" },
            {
                text: "Az MTMT segítségével elkészített tudománymetriai táblázat",
                bold: true,
                fontSize: 14,
                alignment: "center",
                margin: [0, 0, 0, 5],
                pageBreak: "before"
            },
            ...getScientometricsPdfSection(formInfo)
        ]
    };

    const mtmtData = await collectMTMTDataToSave(formInfo);

    savePdfWithFormData(docDefinition, "adatlap.pdf", {
        "kerelmezo_form.json": JSON.stringify(store.toJSON(), null, 4),
        "kerelmezo_mtmt.json": JSON.stringify(mtmtData, null, 4)
    });
};

async function collectMTMTDataToSave(formInfo: FormInfo): Promise<object> {
    const store = formInfo.valueStore;
    const descriptor = formInfo.descriptor;
    const mtids = new Set<string>();
    const citationParentMtids = new Set<string>();

    for (const page of Object.values(descriptor)) {
        for (const section of page.sections) {
            for (const group of section.groups) {
                for (const field of group.fields) {
                    if (field.type !== "mtmtPub" && field.type !== "mtmtCitation") {
                        continue;
                    }
                    const fieldKey = `Kérelmezői|${page.key}|${section.key}|${group.key}|${field.key}`;
                    const values = store.getArray(fieldKey);

                    for (let index = 0; index < values.length; index++) {
                        const mtid = values[index];
                        if (mtid) {
                            mtids.add(mtid);
                        }

                        if (field.type !== "mtmtCitation" || !field.attribs?.pubKey) {
                            continue;
                        }

                        const parentMtid = store.getArrayItem(field.attribs.pubKey, index).trim();
                        if (parentMtid) {
                            citationParentMtids.add(parentMtid);
                        }
                    }
                }
            }
        }
    }

    await Promise.all(Array.from(citationParentMtids, (mtid) => loadMTMTCitations(mtid)));

    const pubList = formInfo.mtmtPubList as PubList;
    const mtmtCache = savePubListMinimal(Array.from(mtids), pubList);
    const allPubMTMTs: Record<string, string[]> = pubList?.publications?.reduce(
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
    const authorData = await getAuthorRecord(pubList.userId);

    return {
        "Adatlapon szereplő publikációk": mtmtCache,
        Társszerzők: allPubMTMTs,
        "Szerzői adatok": authorData
    };
}

const getScientometricsPdfSection = (formInfo: FormInfo): Content[] => {
    if (!formInfo.mtmtScientometrics) {
        return [{ text: "Nincs rendelkezésre álló adat", style: "nodata" }];
    }
    const scientometrics = formInfo.mtmtScientometrics as Scientometrics;
    const status = scientometrics.status;
    const data = scientometrics.scientometrics;
    if (!status || status.length === 0 || data.length === 0) {
        return [{ text: "Nincs rendelkezésre álló adat", style: "nodata" }];
    }

    const links: Record<string, string> = {
        plink: "https://m2.mtmt.hu/api/publication?sort=publishedYear,desc&sort=title,asc&cond=mtid;in;",
        alink: "https://m2.mtmt.hu/api/citation?cond=published;eq;true&cond=related.category;eq;1&cond=externalCitation;eq;true&cond=publication.mtid;in;",
        flink: "https://m2.mtmt.hu/api/citation?cond=published;eq;true&cond=related.category;eq;1&cond=related.type;ne;29&cond=externalCitation;eq;true&cond=publication.mtid;in;",
        wlink: "https://m2.mtmt.hu/api/citation?cond=publication.authors;eq;10002462&cond=related.identifiers.source;in;1,61&cond=related.type;ne;29&cond=related.category;eq;1&cond=externalCitation;eq;true&cond=publication.mtid;in;",
        hlink: "https://m2.mtmt.hu/api/publication?sort=independentCitationCount,desc&cond=mtid;in;"
    };

    const cellTypes = [
        ["plink", "plink", "plink", ""],
        ["plink", "plink", "plink", ""],
        ["plink", "plink", "plink", ""],
        ["plink", "plink", "plink", ""],
        ["plink", "plink", "plink", ""],
        ["plink", "plink", "plink", ""],
        ["plink", "plink", "plink", ""],
        ["", "", "", ""], // end of first table
        ["alink"],
        ["flink"],
        ["wlink"],
        ["hlink"], // end of second table
        ["plink"],
        ["plink"],
        ["plink"],
        [""], // end of third table
        ["plink"], // end of fourth table
        ["plink"],
        ["plink"],
        ["plink"],
        ["plink"],
        ["plink"],
        ["plink"],
        ["plink"],
        ["plink"],
        ["plink"],
        ["plink"], // end of fifth table
        ["plink"],
        ["plink"]
    ];
    const cellData = (row: number, col: number, cellStyle = "tableBody"): TableCell => {
        if (data[row][col] !== 0) {
            const style = links[cellTypes[row - 1][col / 2]];
            return { text: data[row][col].toString(), style: style ? "tableLink" : cellStyle, alignment: "center", link: style + data[row][col + 1] };
        } else {
            return { text: "-", style: cellStyle, alignment: "center" };
        }
    };

    const simpleHeader = (title: string): TableCell[] => {
        return [{ text: title, style: "tableHeader", colSpan: 5, alignment: "left" }, { text: "" }, { text: "" }, { text: "" }, { text: "" }];
    };

    const simpleRow = (title: string, row: number, cellStyle = "tableBody"): TableCell[] => {
        return [{ text: title, style: cellStyle, colSpan: 4, alignment: "left" }, { text: "" }, { text: "" }, { text: "" }, cellData(row, 0, cellStyle)];
    };

    const emptyRow = (): TableCell[] => {
        return [{ text: " ", colSpan: 5, lineHeight: 0.5, border: [false, false, false, false] }, { text: "" }, { text: "" }, { text: "" }, { text: "" }];
    };

    const content: Content[] = [];
    content.push({ text: data[0][1], fontSize: 12, bold: true, margin: [0, 0, 0, 2], alignment: "center" });
    content.push({ text: "Lekérdezés ideje: " + data[0][2], fontSize: 10, margin: [0, 0, 0, 5], alignment: "center" });
    const table1: Content = {
        layout: {
            defaultBorder: true,
            paddingBottom: () => 1.7,
            paddingTop: () => 1.7,
            paddingLeft: () => 2,
            paddingRight: () => 2
        },
        table: {
            widths: ["*", 60, 60, 60, 60],
            body: [
                simpleHeader("1. A kérelmező publikációs és alkotási teljesítménye (Q-szám)"),
                [
                    {
                        text: "Tudományos közlemények",
                        style: "subTableHeader",
                        rowSpan: 2,
                        alignment: "center",
                        verticalAlignment: "middle",
                        margin: [0, 7, 0, 0]
                    } as TableCell,
                    {
                        text: "Külföldön megjelent",
                        style: "subTableHeader",
                        rowSpan: 2,
                        alignment: "center",
                        verticalAlignment: "middle",
                        margin: [0, 7, 0, 0]
                    } as TableCell,
                    { text: "Magyarországon megjelent", style: "subTableHeader", colSpan: 2, alignment: "center", verticalAlignment: "middle" } as TableCell,
                    { text: "" } as TableCell,
                    {
                        text: "Pontszám",
                        style: "subTableHeader",
                        alignment: "center",
                        rowSpan: 2,
                        verticalAlignment: "middle",
                        margin: [0, 7, 0, 0]
                    } as TableCell
                ],
                [
                    { text: "" },
                    { text: "" },
                    { text: "idegen nyelven", style: "subTableHeader", alignment: "center" },
                    { text: "magyarul", style: "subTableHeader", alignment: "center" },
                    { text: "" }
                ],
                [{ text: "Lektorált tudományos folyóiratcikk", style: "tableBody" }, cellData(1, 0), cellData(1, 2), cellData(1, 4), cellData(1, 6)],
                [{ text: "- ebből IF-al", style: "tableBody" }, cellData(2, 0), cellData(2, 2), cellData(2, 4), cellData(2, 6)],
                [{ text: "- ebből egyszerzős", style: "tableBody" }, cellData(3, 0), cellData(3, 2), cellData(3, 4), cellData(3, 6)],
                [
                    { text: "Konferenciacikk (min. 4 oldal) konferenciakötetben, folyóiratban, könyvrészletben", style: "tableBody" },
                    cellData(4, 0),
                    cellData(4, 2),
                    cellData(4, 4),
                    cellData(4, 6)
                ],
                [
                    { text: "Folyóirat cikkek összesen", style: "tableSummaryHeader", colSpan: 4 },
                    { text: "" },
                    { text: "" },
                    { text: "" },
                    cellData(5, 6, "tableSummaryData")
                ],
                [{ text: "Tudományos könyv", style: "tableBody" }, cellData(6, 0), cellData(6, 2), cellData(6, 4), cellData(6, 6)],
                [{ text: "Tudományos könyvrészlet", style: "tableBody" }, cellData(7, 0), cellData(7, 2), cellData(7, 4), cellData(7, 6)],
                [
                    { text: "Könyvek összesen", style: "tableSummaryHeader", colSpan: 4 },
                    { text: "" },
                    { text: "" },
                    { text: "" },
                    cellData(8, 6, "tableSummaryData")
                ],
                emptyRow(),
                simpleHeader("2. A kérelmező idézettsége (I-szám)"),
                simpleRow("Független idézők száma (összes, egyéb típusúakkal együtt)", 9),
                simpleRow("Független idézők száma egyéb típusúak nélkül (I-szám)", 10),
                simpleRow("Független WoS idézők száma", 11),
                simpleRow("H-index (független idézetekből)", 12),
                emptyRow(),
                simpleHeader("3. A tételes publikációs elvárások"),
                simpleRow("Magyar nyelvű publikáció", 13),
                simpleRow("Az egyszerzős IF-os cikkeinek száma", 14),
                simpleRow("Az IF-os cikkeinek száma", 15),
                simpleRow("A viszonyított IF-számok összege", 16),
                emptyRow(),
                simpleHeader("4. Rövid értekezéssel pályázók adatai"),
                simpleRow("D1 besorolású cikkeinek összegzett szerzői aránya", 17),
                emptyRow(),
                simpleHeader('5. "C" kategóriájú pályázókhoz'),
                simpleRow("Tudományos folyóiratcikk külföldi kiadású szakfolyóiratban, idegen nyelvű", 18),
                simpleRow("Tudományos folyóiratcikk külföldi kiadású szakfolyóiratban, magyar nyelvű", 19),
                simpleRow("Könyv szerzőként, idegen nyelvű", 20),
                simpleRow("Könyv szerzőként, magyar nyelvű", 21),
                simpleRow("Könyv szerkesztőként, idegen nyelvű", 22),
                simpleRow("Könyv szerkesztőként, magyar nyelvű", 23),
                simpleRow("Könyvrészlet, idegen nyelvű", 24),
                simpleRow("Könyvrészlet, magyar nyelvű", 25),
                simpleRow("Konferenciaközlemény folyóiratban vagy konferenciakötetben, idegen nyelvű", 26),
                simpleRow("Konferenciaközlemény folyóiratban vagy konferenciakötetben, magyar nyelvű", 27),
                emptyRow(),
                simpleHeader("6. Egyéb minőségi adatok"),
                simpleRow("Q1 besorolású cikkeinek összegzett szerzői aránya", 28),
                simpleRow("Q2 besorolású cikkeinek összegzett szerzői aránya", 29)
            ]
        }
    };
    content.push(table1);
    return content;
};
