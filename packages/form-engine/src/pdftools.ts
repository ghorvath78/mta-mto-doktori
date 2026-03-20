import { store } from "./atoms";
import type { FormData, FormDescriptor, GroupDescriptor } from "./forms";
import type { Content, TableCell } from "pdfmake/interfaces";
import { getRanking, loadMTMTCitations, mtmtPubListAtom, mtmtScientometricsAtom } from "./mtmt";

type Options = { [key: string]: string | { [key: string]: string } };

export function removeSpecialUtf8KeepAccents(input: string): string {
    return input
        .replace(/[\p{S}\p{C}]+/gu, "") // strip symbols (emoji, dingbats, currency, etc.) and control/format chars
        .replace(/\s{2,}/g, " ") // collapse repeated whitespace left by removals
        .trim();
}

export const groupToPdfDocDefinition = async (
    label: string,
    group: GroupDescriptor,
    formData: FormData,
    keyPrefix: string,
    index: number,
    options: Options = {}
): Promise<Content[]> => {
    const body: TableCell[][] = [];
    const fields = group.fields || [];
    const groupKeyPrefix = `${keyPrefix}|${group.key}`;
    for (const field of fields) {
        const fieldKey = `${groupKeyPrefix}|${field.key}`;
        const fieldValue = store.get(formData[fieldKey])[index];
        const fieldLabel = options.nolabel === "true" ? "" : (field.label || field.key) + ":";
        // handle conditional fields
        if (field.conditionKey && field.conditionValue) {
            const val = store.get(formData[field.conditionKey])[index];
            if (val !== field.conditionValue) continue;
        }
        switch (field.type) {
            case "text":
            case "year":
            case "select":
            case "number":
            case "selectAddOther":
                if (field.attribs?.inline && field.attribs.inline === "false") {
                    body.push([{ colSpan: 2, text: fieldLabel }, { text: "" }]);
                    body.push([{ colSpan: 2, text: fieldValue || "-", margin: [0, 0, 0, 0], border: [true, true, true, true] }, { text: "" }]);
                } else {
                    body.push([{ text: fieldLabel }, { text: fieldValue || "-" }]);
                }
                break;
            case "link":
                if (field.attribs?.inline && field.attribs.inline === "false") {
                    body.push([{ colSpan: 2, text: fieldLabel }, { text: "" }]);
                    body.push([
                        { colSpan: 2, text: fieldValue || "-", margin: [0, 0, 0, 0], style: fieldValue ? "link" : undefined, border: [true, true, true, true] },
                        { text: "" }
                    ]);
                } else {
                    body.push([
                        { text: fieldLabel },
                        {
                            text: fieldValue || "-",
                            link: fieldValue || undefined,
                            style: fieldValue ? "link" : undefined
                        }
                    ]);
                }
                break;
            case "mtmtUser":
                body.push([
                    { text: fieldLabel },
                    {
                        text: fieldValue,
                        link: `https://m2.mtmt.hu/api/author/${fieldValue}`,
                        style: "link"
                    }
                ]);
                break;
            case "yearRange":
                {
                    const parts = fieldValue.split("-");
                    body.push([{ text: fieldLabel }, { text: parts.join(" - ") }]);
                }
                break;
            case "birthYearPlace":
                {
                    const parts = fieldValue.split("|");
                    body.push([{ text: fieldLabel }, { text: parts.join(", ") }]);
                }
                break;
            case "longtext":
                body.push([{ colSpan: 2, text: fieldLabel }, { text: "" }]);
                body.push([{ colSpan: 2, text: fieldValue || "-", margin: [0, 0, 0, 10], border: [true, true, true, true] }, { text: "" }]);
                break;
            case "mtmtCitation":
            case "mtmtPub": {
                const mtmt = String(fieldValue);
                let pub = store.get(mtmtPubListAtom).find((p) => String(p.mtid) === mtmt);
                if (field.type === "mtmtCitation" && !pub && mtmt) {
                    const pubMTMT = store.get(formData[String(field?.attribs?.pubKey)])[index];
                    const citations = await loadMTMTCitations(pubMTMT);
                    pub = citations.find((p) => String(p.mtid) === mtmt);
                }
                const el = document.createElement("div");
                el.innerHTML = pub?.template ?? "";
                const authors = Array.from(el.getElementsByClassName("author-name"))
                    .map((element) => removeSpecialUtf8KeepAccents(element.textContent))
                    .join(", ");
                const title = el.getElementsByClassName("title")[0]?.textContent ?? "";
                const info = el.getElementsByClassName("pub-info")[0]?.textContent ?? "";
                const category = el.getElementsByClassName("pub-category")[0]?.textContent ?? "";
                const type = el.getElementsByClassName("pub-type")[0]?.textContent ?? "";
                const ranking = pub ? getRanking(pub) : "N/A";
                const citations = pub ? (pub["independentCitationCount"] ?? "N/A") : "N/A";
                const baseLabel =
                    options.bibLabel !== undefined
                        ? String(options.bibLabel)
                        : options.bibLabels && typeof options.bibLabels === "object" && (field.label || field.key) in options.bibLabels
                          ? String(options.bibLabels[field.label || field.key])
                          : fieldLabel;
                const baseIndex = options.bibIndex && field.type === "mtmtPub" ? [{ text: `[${index + 1}]`, bold: true }] : [];
                const pubBody: TableCell[][] = [];
                if (pub) {
                    pubBody.push([
                        [...baseIndex, { text: String(baseLabel) }],
                        [
                            {
                                text: mtmt,
                                link: `https://m2.mtmt.hu/api/publication/${mtmt}`,
                                style: "link"
                            },
                            { text: authors, style: "authors" },
                            { text: title, style: "title" },
                            { text: info, style: "info" },
                            { text: `${category} ${type}, SJR: ${ranking}, Független idézők: ${citations}`, style: "info" }
                        ]
                    ]);
                } else {
                    pubBody.push([
                        { text: String(baseLabel) },
                        {
                            text: mtmt || "nincs megadva",
                            link: mtmt ? `https://m2.mtmt.hu/api/publication/${mtmt}` : undefined,
                            style: mtmt ? "link" : undefined
                        }
                    ]);
                }
                const indexColWidth = options.indexColWidth ? parseInt(String(options.indexColWidth)) : 20;
                body.push([
                    {
                        colSpan: 2,
                        layout: {
                            defaultBorder: false,
                            paddingBottom: () => 0,
                            paddingTop: () => 0,
                            paddingLeft: () => 0,
                            paddingRight: () => 0
                        },
                        table: { widths: [indexColWidth, "*"], body: pubBody, dontBreakRows: true },
                        margin: [0, 0, 0, 0]
                    },
                    { text: "" }
                ]);
                break;
            }
        }
    }
    if (body.length === 0) return [];
    const firstColWidth = options.firstColWidth ? parseInt(String(options.firstColWidth)) : 130;
    const result: Content[] = [
        {
            layout: {
                defaultBorder: false
            },
            table: {
                widths: [firstColWidth, "*"],
                dontBreakRows: true,
                body
            },
            margin: [20, 5, 0, 0]
        }
    ];
    if (label) result.unshift({ text: options.sectionIndex ? `${index + 1}. ${label}` : label, style: "grouplabel" });
    else if (options.useGroupLabelAsHeader) result.unshift({ text: label || group.label || group.key, style: "grouplabel" });
    return result;
};

export const groupToPdfTableDefinition = async (
    label: string,
    group: GroupDescriptor,
    formData: FormData,
    groupKeyPrefix: string,
    options: Options = {}
): Promise<Content[]> => {
    const fields = group.fields || [];
    const lengthAtom = formData[`${groupKeyPrefix}|_length`];
    const length = lengthAtom ? parseInt(store.get(lengthAtom)[0]) : 1;
    // create rows array
    const rows: TableCell[][] = Array.from({ length: length + 1 }, () => []);
    for (const field of fields) {
        const fieldKey = `${groupKeyPrefix}|${field.key}`;
        const fieldLabel = options.nolabel === "true" ? "" : (field.label || field.key) + ":";
        rows[0].push({ text: fieldLabel, bold: true });
        for (let index = 0; index < length; index++) {
            const fieldValue = store.get(formData[fieldKey])[index];
            if (field.type === "link") {
                rows[index + 1].push({
                    text: fieldValue ? "link" : "-",
                    link: fieldValue || undefined,
                    style: fieldValue ? "link" : undefined
                });
            } else {
                rows[index + 1].push({ text: fieldValue || "-" });
            }
        }
    }

    const colWidths = options.colWidths
        ? String(options.colWidths)
              .split(",")
              .map((width) => (width.includes("*") ? width.trim() : parseInt(width.trim())))
        : "*".repeat(fields.length).split("");
    const result: Content[] = [
        {
            layout: {
                defaultBorder: true
            },
            table: {
                widths: colWidths,
                dontBreakRows: true,
                body: rows
            },
            style: { fontSize: 10 },
            margin: [20, 5, 0, 0]
        }
    ];
    if (!label && options.useGroupLabelAsHeader) result.unshift({ text: label || group.label || group.key, style: "grouplabel" });
    return result;
};

export const getPdfSection = async (
    descriptor: FormDescriptor,
    formData: FormData,
    sectionKey: string,
    label: string | ((index: number) => string),
    options: Options = {}
): Promise<Content[]> => {
    const rows: Content[] = [];
    const parts = sectionKey.split("|");
    const page = Object.values(descriptor).find((p) => p.key === parts[1]);
    if (!page) return [];
    const section = page.sections.find((s) => s.key === parts[2]);
    if (!section) return [];
    for (const group of section.groups) {
        const groupKeyPrefix = `${sectionKey}|${group.key}`;
        if (group.conditionKey && group.conditionValue) {
            const val = store.get(formData[group.conditionKey]);
            const isVisible = val && parseInt(val[0]) >= parseInt(group.conditionValue ?? "0");
            if (!isVisible) continue;
        }
        const lengthAtom = formData[`${groupKeyPrefix}|_length`];
        const length = lengthAtom ? parseInt(store.get(lengthAtom)[0]) : 1;
        if (group.isArray !== true && options.hideEmptyGroup === "true") {
            let isEmpty = true;
            for (const field of group.fields || []) {
                const fieldKey = `${groupKeyPrefix}|${field.key}`;
                const values = store.get(formData[fieldKey]);
                for (let i = 0; i < length; i++) {
                    if (values[i] && values[i].toString().trim() !== "") {
                        isEmpty = false;
                        break;
                    }
                }
                if (!isEmpty) break;
            }
            if (isEmpty) {
                rows.push({ text: "Nincs adat", style: "nodata" });
                continue;
            }
        }
        if (options.tableGroup && (options.tableGroup as string).includes(group.key)) {
            if (length === 0) rows.push({ text: "Nincs adat", style: "nodata" });
            else rows.push(...(await groupToPdfTableDefinition(String(label), group, formData, groupKeyPrefix, options)));
            continue;
        }
        for (let i = 0; i < length; i++) {
            rows.push(...(await groupToPdfDocDefinition(typeof label === "function" ? label(i) : label, group, formData, sectionKey, i, options)));
        }
    }
    return rows;
};

export const getScientometricsPdfSection = (): Content[] => {
    const status = store.get(mtmtScientometricsAtom);
    const data = store.get(mtmtScientometricsAtom);
    if (!status || status.length === 0 || data.length === 0) {
        return [{ text: "Nincs rendelkezésre álló adat", style: "nodata" }];
    }

    const links: Record<string, string> = {
        plink: "https://m2.mtmt.hu/api/publication?sort=publishedYear,desc&sort=title,asc&size=5000&cond=mtid;in;",
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
