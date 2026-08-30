import type { FieldDescriptor } from "./types";

export function cD(x: number | string) {
    try {
        const num = parseFloat(x.toString().replaceAll(",", "."));
        return isNaN(num) ? 0 : num;
    } catch {
        return 0;
    }
}

export function invertedText(text: string) {
    return <span className="bg-primary text-primary-foreground font-bold rounded px-2 py-1">{text}</span>;
}

export function getFieldLabel(fieldDescr: FieldDescriptor): string {
    return fieldDescr.label ?? fieldDescr.key;
}

export function isFieldReadonly(fieldDescr: FieldDescriptor): boolean {
    return fieldDescr.readonly === true;
}

export function getIndexFromKey(key: string): number {
    const bracketStart = key.indexOf("[[");
    return bracketStart >= 0 ? parseInt(key.slice(bracketStart + 2), 10) : -1;
}
