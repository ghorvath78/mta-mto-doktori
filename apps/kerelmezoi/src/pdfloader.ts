import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFRawStream } from "pdf-lib";
import { inflate } from "pako";

export async function readJsonFromPdf(file: File, attachmentName: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const catalog = pdfDoc.catalog;
    const namesRef = catalog?.get?.(PDFName.of("Names"));
    if (!namesRef) return "";

    const namesDict = pdfDoc.context.lookup(namesRef) as PDFDict | undefined;
    const efRef = namesDict?.get?.(PDFName.of("EmbeddedFiles"));
    if (!efRef) return "";

    const efDict = pdfDoc.context.lookup(efRef) as PDFDict | undefined;
    const namesArrayRef = efDict?.get?.(PDFName.of("Names"));
    if (!namesArrayRef) return "";

    const namesArray = pdfDoc.context.lookup(namesArrayRef) as PDFArray | undefined;
    if (!namesArray) return "";

    // namesArray is [name, filespec, name, filespec, ...]
    const size = namesArray.size();
    for (let i = 0; i < size; i += 2) {
        const nameObj = namesArray.get(i) as PDFHexString;
        const filename = nameObj.decodeText();
        if (filename !== attachmentName) continue;

        const fileSpecRef = namesArray.get(i + 1);
        const fileSpec = pdfDoc.context.lookup(fileSpecRef) as PDFDict | undefined;
        if (!fileSpec) continue;

        const efEntry = fileSpec.get?.(PDFName.of("EF")) as PDFDict | undefined;
        if (!efEntry) continue;

        const fStreamRef = efEntry.get?.(PDFName.of("F"));
        if (!fStreamRef) continue;

        const fStream = pdfDoc.context.lookup(fStreamRef) as PDFRawStream | undefined;
        if (!fStream) continue;

        const bytes = fStream.getContents();
        try {
            const decompressed = inflate(bytes);
            return new TextDecoder("utf-8").decode(decompressed);
        } catch {
            // not valid JSON, continue to next attachment
            continue;
        }
    }

    return "";
}
