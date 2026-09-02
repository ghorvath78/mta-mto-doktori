import pdfMake from "pdfmake/build/pdfmake";
import type { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { saveAs } from "file-saver";
import { PDFDocument } from "pdf-lib";
import { getInputFieldPrinter } from "./inputfieldstore";
import type { FormDescriptor, FormInfo, GroupDescriptor, PdfPrintingOptions } from "./types";
import type { FormStore } from "./formstore";
import { evaluateCondition } from "./conditions";
import { getEffectiveFieldKey } from "./hooks";
import { getIndexFromKey } from "./utils";

declare const BUILD_DATE: string;

export const groupToPdfDocDefinition = async (
    label: string,
    group: GroupDescriptor,
    formInfo: FormInfo,
    groupKeyPrefix: string,
    options: PdfPrintingOptions = {}
): Promise<Content[]> => {
    const body: TableCell[][] = [];
    const fields = group.fields || [];
    const index = getIndexFromKey(groupKeyPrefix);

    const store = formInfo.valueStore;
    for (const field of fields) {
        if (field.attribs?.noPrint) continue;
        if (!evaluateCondition(store, field, index)) continue;
        const fieldKey = getEffectiveFieldKey(`${groupKeyPrefix}|${field.key}`, field.valueSource, store);
        if (store.data[fieldKey] === undefined) {
            continue;
        }
        const fieldValue = store.getField(fieldKey);
        const fieldLabel = options.nolabel === "true" ? "" : (field.label || field.key) + ":";
        const printer = getInputFieldPrinter(field.type);
        if (!printer) {
            continue;
        }
        body.push(...(await printer(fieldLabel, String(fieldValue), field, { ...options, fieldContext: { formInfo, index } })));
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
    if (label) result.unshift({ text: label, style: "grouplabel" });
    else if (options.useGroupLabelAsHeader) result.unshift({ text: label || group.label || group.key, style: "grouplabel" });
    return result;
};

export const groupToPdfTableDefinition = async (
    label: string,
    group: GroupDescriptor,
    formInfo: FormInfo,
    groupKeyPrefix: string,
    options: PdfPrintingOptions = {}
): Promise<Content[]> => {
    const store = formInfo.valueStore;
    const fields = group.fields || [];
    const length = group.lengthSource ? parseInt(store.getField(group.lengthSource)) : parseInt(store.getField(`${groupKeyPrefix}|_length`)) || 0;
    // create rows array
    const rows: TableCell[][] = Array.from({ length: length + 1 }, () => []);

    // create header row
    for (const field of fields) {
        if (field.attribs?.noPrint) continue;
        const fieldLabel = options.nolabel === "true" ? "" : field.label || field.key;
        rows[0].push({ text: fieldLabel, bold: true, style: "tableHeader", fontSize: 11 });
    }

    // table body
    for (let index = 0; index < length; index++) {
        const thisGroupKeyPrefix = `${groupKeyPrefix}[[${index}]]`;
        if (isGroupEmpty(group, store, thisGroupKeyPrefix)) {
            for (const field of fields) {
                if (field.attribs?.noPrint) continue;
                rows[index + 1].push({ text: "-" });
            }
            continue;
        }
        for (const field of fields) {
            if (field.attribs?.noPrint) continue;
            const fieldKey = getEffectiveFieldKey(`${thisGroupKeyPrefix}|${field.key}`, field.valueSource, store);
            const fieldValue = store.getField(fieldKey);
            if (field.type === "link" || fieldValue.startsWith("http")) {
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

    const colWidths: (string | number)[] = [];
    for (const field of fields) {
        if (field.attribs?.noPrint) continue;
        const colWidth = field?.attribs?.colWidth ? String(field.attribs.colWidth) : "*";
        colWidths.push(colWidth.includes("*") ? "*" : parseInt(colWidth));
    }

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
    formInfo: FormInfo,
    sectionKey: string,
    label: string | ((index?: number) => string),
    options: PdfPrintingOptions = {}
): Promise<Content[]> => {
    const rows: Content[] = [];
    const parts = sectionKey.split("|");
    const page = Object.values(descriptor).find((p) => p.key === parts[1]);
    if (!page) return [];
    const section = page.sections.find((s) => s.key === parts[2]);
    if (!section) return [];
    const store = formInfo.valueStore;
    if (!evaluateCondition(store, section, 0)) return [];
    for (const group of section.groups) {
        if (group.isArray) {
            const length = group.lengthSource
                ? parseInt(store.getField(group.lengthSource))
                : parseInt(store.getField(`${sectionKey}|${group.key}|_length`)) || 0;
            if (length === 0) {
                rows.push({ text: "Nincs adat", style: "nodata" });
                continue;
            }
            if (group.attribs?.printTabular === true || group.attribs?.pdfTabular === true) {
                rows.push(...(await groupToPdfTableDefinition(String(label), group, formInfo, `${sectionKey}|${group.key}`, options)));
            } else {
                for (let i = 0; i < length; i++) {
                    const groupKeyPrefix = `${sectionKey}|${group.key}[[${i}]]`;
                    let grLabel: string = typeof label === "function" ? label(i) : label;
                    if (options.sectionIndex) grLabel = `${i + 1}. ${grLabel}`;
                    rows.push(...(await groupToPdfDocDefinition(grLabel, group, formInfo, groupKeyPrefix, options)));
                }
            }
        } else {
            const groupKeyPrefix = `${sectionKey}|${group.key}`;
            if (options.hideEmptyGroup === "true" && isGroupEmpty(group, store, groupKeyPrefix)) {
                rows.push({ text: "Nincs adat", style: "nodata" });
                continue;
            }
            if (group.attribs?.printTabular === true || group.attribs?.pdfTabular === true) {
                rows.push(...(await groupToPdfTableDefinition(String(label), group, formInfo, groupKeyPrefix, options)));
            } else {
                rows.push(...(await groupToPdfDocDefinition(typeof label === "function" ? label() : label, group, formInfo, groupKeyPrefix, options)));
            }
        }
    }
    return rows;
};

export function isGroupEmpty(group: GroupDescriptor, formStore: FormStore, groupKeyPrefix: string): boolean {
    for (const field of group.fields || []) {
        if (field.attribs?.noPrint) continue;
        const key = getEffectiveFieldKey(`${groupKeyPrefix}|${field.key}`, field.valueSource, formStore);
        const ix = getIndexFromKey(key);
        if (evaluateCondition(formStore, field, ix) === false) return true;
        const value = formStore.getField(key);
        if (value.toString().trim() !== "") {
            return false;
        }
    }
    return true;
}

export function getPdfDocumentStyles(): TDocumentDefinitions {
    return {
        content: [],
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
            header_center_title: {
                fontSize: 12,
                bold: true,
                alignment: "center"
            },
            header_center_data: {
                fontSize: 12,
                alignment: "center",
                marginTop: 10,
                marginBottom: 10
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
}

export type PdfSaveTarget = { type: "handle"; handle: any } | { type: "fallback" } | { type: "cancelled" };

// showSaveFilePicker csak közvetlenül egy user gesture (pl. kattintás) hatására hívható meg,
// az engedély ugyanis csak rövid ideig (böngészőtől függően néhány másodpercig) érvényes, és bármelyik
// megelőző await elfogyaszthatja. Ezért ezt a hívást a lehető leghamarabb, minden lassú (pl. hálózati)
// művelet előtt el kell végezni, még mielőtt a PDF tartalma összeáll.
export async function requestPdfSaveTarget(fileName: string): Promise<PdfSaveTarget> {
    if (!("showSaveFilePicker" in window)) {
        return { type: "fallback" };
    }
    try {
        const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [
                {
                    description: "PDF Document",
                    accept: { "application/pdf": [".pdf"] }
                }
            ]
        });
        return { type: "handle", handle };
    } catch (err: any) {
        if (err.name === "AbortError") {
            return { type: "cancelled" };
        }
        console.error("Save file picker failed:", err);
        return { type: "fallback" };
    }
}

export function savePdfWithFormData(
    saveTarget: PdfSaveTarget,
    docDefinition: TDocumentDefinitions,
    fileName: string,
    jsonsToEmbed: { [filename: string]: string }
) {
    if (saveTarget.type === "cancelled") {
        return;
    }

    const fonts = {
        Roboto: {
            normal: "https://fonts.cdnfonts.com/s/85546/Satoshi-Regular.woff",
            bold: "https://fonts.cdnfonts.com/s/85546/Satoshi-Bold.woff",
            italics: "https://fonts.cdnfonts.com/s/85546/Satoshi-Italic.woff",
            bolditalics: "https://fonts.cdnfonts.com/s/85546/Satoshi-BoldItalic.woff"
        }
    };

    pdfMake.createPdf(docDefinition, undefined, fonts).getBuffer(async (buffer: Uint8Array<ArrayBufferLike>) => {
        // add multiple embedded files to the PDF
        let finalPdf = buffer;
        for (const [filename, jsonString] of Object.entries(jsonsToEmbed)) {
            finalPdf = await attachJsonToPdf(finalPdf, jsonString, filename);
        }
        const uint8 = Uint8Array.from(finalPdf);
        const blob = new Blob([uint8], { type: "application/pdf" });

        if (saveTarget.type === "handle") {
            try {
                const writable = await saveTarget.handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (err) {
                console.error("Writing via save file handle failed:", err);
                saveAs(blob, fileName);
                return;
            }
        }

        saveAs(blob, fileName);
    });
}

async function attachJsonToPdf(pdfBytes: Uint8Array, jsonString: string, embeddedFileName: string): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const jsonBytes: Uint8Array = new TextEncoder().encode(jsonString);
    await pdfDoc.attach(jsonBytes, embeddedFileName, {
        mimeType: "application/json",
        description: "Custom metadata"
    });
    return pdfDoc.save();
}
