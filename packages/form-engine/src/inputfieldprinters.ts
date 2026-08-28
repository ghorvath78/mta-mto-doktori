import type { FieldDescriptor, InputFieldPrinter } from "./types";

const isInlineDisabled = (fieldDescr: FieldDescriptor) => fieldDescr.attribs?.inline === "false" || fieldDescr.attribs?.inline === false;

export function removeSpecialUtf8KeepAccents(input: string): string {
    return input
        .replace(/[\p{S}\p{C}]+/gu, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

export const SimpleFieldPrinter: InputFieldPrinter = (label, value, fieldDescr) => {
    if (fieldDescr.attribs?.noAlign) {
        return [[{ colSpan: 2, text: `${label} ${value || "-"}` }, { text: "" }]];
    }
    if (isInlineDisabled(fieldDescr)) {
        return [
            [{ colSpan: 2, text: label }, { text: "" }],
            [{ colSpan: 2, text: value || "-", margin: [0, 0, 0, 0], border: [true, true, true, true] }, { text: "" }]
        ];
    }
    return [[{ text: label }, { text: value || "-" }]];
};

export const LinkFieldPrinter: InputFieldPrinter = (label, value, fieldDescr) => {
    const linkText = value ? (fieldDescr.attribs?.short ? "link" : value) : "-";
    if (fieldDescr.attribs?.noAlign) {
        return [
            [
                {
                    colSpan: 2,
                    text: [{ text: `${label} ` }, { text: linkText, link: value || undefined, style: value ? "link" : undefined }]
                },
                { text: "" }
            ]
        ];
    }
    if (isInlineDisabled(fieldDescr)) {
        return [
            [{ colSpan: 2, text: label }, { text: "" }],
            [
                {
                    colSpan: 2,
                    text: linkText,
                    link: value || undefined,
                    margin: [0, 0, 0, 0],
                    style: value ? "link" : undefined,
                    border: [true, true, true, true]
                },
                { text: "" }
            ]
        ];
    }
    return [[{ text: label }, { text: linkText, link: value || undefined, style: value ? "link" : undefined }]];
};

export const YearRangeFieldPrinter: InputFieldPrinter = (label, value) => {
    const parts = value.split("-");
    return [[{ text: label }, { text: parts.join(" - ") }]];
};

export const BirthYearPlaceFieldPrinter: InputFieldPrinter = (label, value) => {
    const parts = value.split("|");
    return [[{ text: label }, { text: parts.join(", ") }]];
};

export const LongTextFieldPrinter: InputFieldPrinter = (label, value) => {
    return [
        [{ colSpan: 2, text: label }, { text: "" }],
        [{ colSpan: 2, text: value || "-", margin: [0, 0, 0, 10], border: [true, true, true, true] }, { text: "" }]
    ];
};

export const DecisionTextFieldPrinter: InputFieldPrinter = (label, value) => {
    return [
        [{ colSpan: 2, text: label, bold: true, italics: true }, { text: "" }],
        [{ colSpan: 2, text: value || "-", margin: [0, 0, 0, 10], border: [true, true, true, true] }, { text: "" }]
    ];
};

export const DecisionYesNoFieldPrinter: InputFieldPrinter = (label, value) => {
    return [[{ colSpan: 2, text: `${label} ${value ? value.toUpperCase() : "-"}`, bold: true, italics: true }, { text: "" }]];
};

export const EmptyFieldPrinter: InputFieldPrinter = () => [];
