import pdfMake from "pdfmake/build/pdfmake";
import { store } from "./atoms";
import { type FormData, type FormDescriptor, type GroupDescriptor, type PdfPrintingOptions } from "./forms";
import type { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { saveAs } from "file-saver";
import { PDFDocument } from "pdf-lib";
import { getInputFieldPrinter } from "./inputfieldstore";

declare const BUILD_DATE: string;

export const groupToPdfDocDefinition = async (
    label: string,
    group: GroupDescriptor,
    formData: FormData,
    keyPrefix: string,
    index: number,
    options: PdfPrintingOptions = {}
): Promise<Content[]> => {
    const body: TableCell[][] = [];
    const fields = group.fields || [];
    const groupKeyPrefix = `${keyPrefix}|${group.key}`;
    for (const field of fields) {
        if (field.attribs?.noPrint) continue;
        const fieldKey = field.valueSource ? field.valueSource : `${group.valueSource ? group.valueSource : groupKeyPrefix}|${field.key}`;
        const fieldValue = store.get(formData[fieldKey])[index] ?? "";
        const fieldLabel = options.nolabel === "true" ? "" : (field.label || field.key) + ":";
        // handle conditional fields
        if (field.conditionKey && field.conditionValue) {
            const val = store.get(formData[field.conditionKey])[index];
            if (val !== field.conditionValue) continue;
        }
        const printer = getInputFieldPrinter(field.type);
        if (!printer) {
            continue;
        }
        body.push(...(await printer(fieldLabel, String(fieldValue), field, { ...options, fieldContext: { formData, index } })));
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
    options: PdfPrintingOptions = {}
): Promise<Content[]> => {
    const fields = group.fields || [];
    const lengthAtom = group.lengthSource ? formData[group.lengthSource] : formData[`${groupKeyPrefix}|_length`];
    const length = lengthAtom ? parseInt(store.get(lengthAtom)[0]) : 1;
    // create rows array
    const rows: TableCell[][] = Array.from({ length: length + 1 }, () => []);

    const colWidths: (string | number)[] = [];
    for (const field of fields) {
        if (field.attribs?.noPrint) continue;
        const fieldKey = field.valueSource ? field.valueSource : `${group.valueSource ? group.valueSource : groupKeyPrefix}|${field.key}`;
        const fieldLabel = options.nolabel === "true" ? "" : field.label || field.key;
        rows[0].push({ text: fieldLabel, bold: true, style: "tableHeader", fontSize: 11 });
        for (let index = 0; index < length; index++) {
            const fieldValue = store.get(formData[fieldKey])[index] ?? "";
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
    formData: FormData,
    sectionKey: string,
    label: string | ((index: number) => string),
    options: PdfPrintingOptions = {}
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
        const lengthAtom = group.lengthSource ? formData[group.lengthSource] : formData[`${groupKeyPrefix}|_length`];
        const length = lengthAtom ? parseInt(store.get(lengthAtom)[0]) : 1;
        if (group.isArray !== true && options.hideEmptyGroup === "true") {
            let isEmpty = true;
            for (const field of group.fields || []) {
                const fieldKey = field.valueSource ? field.valueSource : `${group.valueSource ? group.valueSource : groupKeyPrefix}|${field.key}`;
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
        if (group.attribs?.printTabular === true || group.attribs?.pdfTabular === true) {
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

export function savePdfWithFormData(docDefinition: TDocumentDefinitions, fileName: string, jsonsToEmbed: { [filename: string]: string }) {
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

        if ("showSaveFilePicker" in window) {
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
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (err: any) {
                // If user aborted, do nothing, otherwise fallback
                if (err.name !== "AbortError") {
                    console.error("Save file picker failed:", err);
                    saveAs(blob, fileName);
                }
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
