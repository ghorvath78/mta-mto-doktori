import { atom, type PrimitiveAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { store } from "./atoms";
import type { JSX } from "react";

export type CustomGroupComponent = ({
    group,
    formData,
    keyPrefix,
    index
}: {
    group: GroupDescriptor;
    formData: FormData;
    keyPrefix: string;
    index: number;
}) => JSX.Element;

export type CustomFieldComponent = ({
    field,
    formData,
    keyPrefix,
    index
}: {
    field: FieldDescriptor;
    formData: FormData;
    keyPrefix: string;
    index: number;
}) => JSX.Element;

// export type AttribType = { [key: string]: string | number | boolean | string[] | any };
export type AttribType = { [key: string]: any };

export type FieldDescriptor = {
    label?: string;
    key: string;
    type:
        | "text"
        | "number"
        | "year"
        | "yearRange"
        | "select"
        | "selectAddOther"
        | "longtext"
        | "birthYearPlace"
        | "mtmtUser"
        | "mtmtPub"
        | "mtmtCitation"
        | "link"
        | "mtmtTable"
        | "custom"
        | "decisionText"
        | "decisionYesNo";
    attribs?: AttribType;
    value?: string;
    conditionKey?: string;
    conditionValue?: string;
    helpText?: string;
    noPersist?: boolean;
    readonly?: boolean;
    valueSource?: string;
    customComponent?: CustomFieldComponent;
};

export type SectionDescriptor = {
    label?: string;
    key: string;
    conditionKey?: string;
    conditionValue?: string;
    hidden?: boolean;
    helpText?: string;
    groups: GroupDescriptor[];
    attribs?: AttribType;
    noPersist?: boolean;
    readonly?: boolean;
};

export type GroupDescriptor = {
    label?: string;
    key: string;
    isArray?: boolean;
    arrayMin?: number;
    arrayMax?: number;
    arrayAddLabel?: string;
    fields: FieldDescriptor[];
    conditionKey?: string;
    conditionValue?: string;
    hidden?: boolean;
    attribs?: AttribType;
    customComponent?: CustomGroupComponent;
    noPersist?: boolean;
    readonly?: boolean;
    valueSource?: string;
    lengthSource?: string;
};

export type PageDescriptor = {
    label?: string;
    key: string;
    sections: SectionDescriptor[];
    attribs?: AttribType;
    enabledAtom?: PrimitiveAtom<boolean>;
};

export type FormDescriptor = {
    [pageKey: string]: PageDescriptor;
};

export type FormData = {
    [key: string]: PrimitiveAtom<string[]>;
};

export type FormInfo = {
    name: string;
    title: string;
    subtitle?: string;
    descriptor: FormDescriptor;
    data: FormData;
    buttons?: { label: string; icon: JSX.Element; onClick: (formData: FormData, setDialogMessage: (message: string) => void) => Promise<void> }[];
};

export function createAtomsFromDescriptor(formName: string, descriptor: FormDescriptor): FormData {
    const atoms: { [key: string]: PrimitiveAtom<string[]> } = {};
    // field values and array lengths
    for (const pageKey in descriptor) {
        const page = descriptor[pageKey];
        for (const section of page.sections) {
            if (section.noPersist) continue;
            for (const group of section.groups) {
                if (group.noPersist) continue;
                if (group.isArray) {
                    const arrayKey = `${formName}|${page.key}|${section.key}|${group.key}|_length`;
                    atoms[arrayKey] = atom(group.arrayMin ? [String(group.arrayMin)] : ["0"]);
                }
                for (const field of group.fields) {
                    if (field.noPersist) continue;
                    const atomKey = `${formName}|${page.key}|${section.key}|${group.key}|${field.key}`;
                    const numElements = group.isArray && group.arrayMin ? group.arrayMin : 1;
                    atoms[atomKey] = atom(field.value ? new Array(numElements).fill(field.value) : new Array(numElements).fill(""));
                }
            }
        }
    }
    // section open states
    for (const pageKey in descriptor) {
        const page = descriptor[pageKey];
        for (const section of page.sections) {
            const sectionOpenKey = `${formName}|${page.key}|${section.key}|_open`;
            atoms[sectionOpenKey] = atomWithStorage(sectionOpenKey, ["false"], undefined, { getOnInit: true });
        }
    }
    return atoms;
}

export function atomsToJSON(formData: FormData, descriptor?: FormDescriptor, formName?: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    // Keys always have 5 parts: form|page|section|group|field (or _length/_open).
    // When section key == group key, skip the group level in the JSON output.

    // Identify array groups and their lengths (in original key space)
    const arrayPaths = new Map<string, number>();
    for (const key in formData) {
        const parts = key.split("|");
        if (parts[parts.length - 1] === "_length") {
            const parentPath = parts.slice(0, -1).join("|");
            arrayPaths.set(parentPath, parseInt(store.get(formData[key])[0]) || 0);
        }
    }

    // For groups that use lengthSource, override with the actual source length
    if (descriptor && formName) {
        for (const pageKey in descriptor) {
            const page = descriptor[pageKey];
            for (const section of page.sections) {
                for (const group of section.groups) {
                    if (group.isArray && group.lengthSource && formData[group.lengthSource]) {
                        const parentPath = `${formName}|${page.key}|${section.key}|${group.key}`;
                        const len = parseInt(store.get(formData[group.lengthSource])[0]) || 0;
                        arrayPaths.set(parentPath, len);
                    }
                }
            }
        }
    }

    // Collapse: drop group (index 3) when it equals section (index 2)
    function toOutputParts(parts: string[]): string[] {
        if (parts.length >= 5 && parts[2] === parts[3]) {
            return [...parts.slice(0, 3), ...parts.slice(4)];
        }
        return parts;
    }

    // Identify array paths in collapsed output space
    const outputArrayPaths = new Map<string, number>();
    for (const [origPath, length] of arrayPaths) {
        const parts = origPath.split("|");
        const op = toOutputParts([...parts, "_"]); // append dummy to make length >= 5
        const parentOP = op.slice(0, -1).join("|");
        outputArrayPaths.set(parentOP, length);
    }

    function ensurePath(parts: string[]): Record<string, unknown> | Record<string, unknown>[] {
        let current: any = result;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const pathSoFar = parts.slice(0, i + 1).join("|");
            if (!(part in current)) {
                if (outputArrayPaths.has(pathSoFar)) {
                    const len = outputArrayPaths.get(pathSoFar)!;
                    current[part] = Array.from({ length: len }, () => ({}));
                } else {
                    current[part] = {};
                }
            }
            current = current[part];
        }
        return current;
    }

    for (const key in formData) {
        const parts = key.split("|");
        const lastPart = parts[parts.length - 1];
        if (lastPart === "_length" || lastPart === "_open") continue;

        const op = toOutputParts(parts);
        const fieldName = op[op.length - 1];
        const parentOP = op.slice(0, -1);
        const parentOPStr = parentOP.join("|");

        const value = store.get(formData[key]);
        const parent = ensurePath(parentOP);

        if (outputArrayPaths.has(parentOPStr)) {
            const length = outputArrayPaths.get(parentOPStr)!;
            for (let i = 0; i < length; i++) {
                (parent as Record<string, unknown>[])[i][fieldName] = value[i] ?? "";
            }
        } else {
            (parent as Record<string, unknown>)[fieldName] = value[0] ?? "";
        }
    }

    return result;
}

export function atomsFromJSON(json: Record<string, unknown>, formData: FormData, prefix: string = "", createMissing = false) {
    // Build a set of section keys that were collapsed (section == group) in the target formData.
    // Key: "form|page|section" -> group key (which equals section key when collapsed).
    const collapsedSections = new Set<string>();
    for (const key in formData) {
        const parts = key.split("|");
        if (parts.length >= 5 && parts[2] === parts[3]) {
            collapsedSections.add(parts.slice(0, 3).join("|"));
        }
    }

    function setAtom(atomKey: string, value: string[]) {
        // If atomKey has only 4 parts, the section and group keys were merged;
        // expand by duplicating the section key (index 2) to restore the 5-part format.
        const keyParts = atomKey.split("|");
        if (keyParts.length === 4) {
            keyParts.splice(2, 0, keyParts[2]);
            atomKey = keyParts.join("|");
        }
        const fullKey = prefix ? prefix + "|" + atomKey : atomKey;
        if (formData[fullKey]) {
            store.set(formData[fullKey], value);
        } else if (createMissing) {
            formData[fullKey] = atom(value);
        }
    }

    function flatten(obj: unknown, pathParts: string[]) {
        // At section level (depth 3: form, page, section), if this section was
        // collapsed in atomsToJSON (section == group), duplicate the section key
        // as the group key to restore the full 5-part atom key.
        if (pathParts.length === 3) {
            const lookupKey = (prefix ? prefix + "|" : "") + pathParts.join("|");
            if (collapsedSections.has(lookupKey)) {
                // Insert the section key again as the group key
                flatten(obj, [...pathParts, pathParts[2]]);
                return;
            }
        }

        if (Array.isArray(obj)) {
            setAtom([...pathParts, "_length"].join("|"), [String(obj.length)]);

            const fields = new Set<string>();
            for (const item of obj) {
                if (item && typeof item === "object" && !Array.isArray(item)) {
                    for (const key of Object.keys(item as Record<string, unknown>)) {
                        fields.add(key);
                    }
                }
            }

            for (const field of fields) {
                const values = obj.map((item: unknown) => (item && typeof item === "object" ? String((item as Record<string, unknown>)[field] ?? "") : ""));
                setAtom([...pathParts, field].join("|"), values);
            }
        } else if (obj && typeof obj === "object") {
            for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
                if (Array.isArray(value) || (value && typeof value === "object")) {
                    flatten(value, [...pathParts, key]);
                } else {
                    setAtom([...pathParts, key].join("|"), [String(value ?? "")]);
                }
            }
        }
    }

    flatten(json, []);
}

export function getByPath(obj: unknown, path: string): unknown {
    const parts = path.split("|");
    let current: any = obj;
    for (let i = 0; i < parts.length; i++) {
        if (current == null) return undefined;
        if (Array.isArray(current)) {
            const remainingPath = parts.slice(i).join("|");
            return current.map((item) => getByPath(item, remainingPath));
        }
        // Skip redundant group key at position 3 when section (2) == group (3)
        if (i === 2 && parts[2] === parts[3]) {
            continue;
        }
        current = current[parts[i]];
    }
    return current;
}

export function deleteFromFormArray(groupDescriptor: GroupDescriptor, formData: FormData, arrayKey: string, index: number) {
    const lengthKey = `${arrayKey}|_length`;
    const lengthAtom = formData[lengthKey];
    if (!lengthAtom) {
        console.warn(`No length atom found for arrayKey: ${arrayKey}`);
        return;
    }
    const length = parseInt(store.get(lengthAtom)[0]);
    const newLength = length - 1;
    for (const field of groupDescriptor.fields) {
        const key = `${arrayKey}|${field.key}`;
        const fieldAtom = formData[key];
        if (fieldAtom) {
            const arr = store.get(fieldAtom);
            if (arr.length > index) {
                arr.splice(index, 1);
                store.set(fieldAtom, [...arr]);
            }
        }
    }
    store.set(lengthAtom, [String(newLength)]);
}

export function appendToFormArray(groupDescriptor: GroupDescriptor, formData: FormData, arrayKey: string) {
    const lengthKey = `${arrayKey}|_length`;
    const lengthAtom = formData[lengthKey];
    if (!lengthAtom) {
        console.warn(`No length atom found for arrayKey: ${arrayKey}`);
        return;
    }
    const length = parseInt(store.get(lengthAtom)[0]);
    const newLength = length + 1;
    for (const field of groupDescriptor.fields) {
        const key = `${arrayKey}|${field.key}`;
        const fieldAtom = formData[key];
        if (fieldAtom) {
            const arr = store.get(fieldAtom);
            arr.push(field.value || "");
            store.set(fieldAtom, [...arr]);
        }
    }
    store.set(lengthAtom, [String(newLength)]);
}

export function moveUpInFormArray(groupDescriptor: GroupDescriptor, formData: FormData, arrayKey: string, index: number) {
    if (index === 0) return;
    for (const field of groupDescriptor.fields) {
        const key = `${arrayKey}|${field.key}`;
        const fieldAtom = formData[key];
        if (fieldAtom) {
            const arr = store.get(fieldAtom);
            if (arr.length > index) {
                const temp = arr[index - 1];
                arr[index - 1] = arr[index];
                arr[index] = temp;
                store.set(fieldAtom, [...arr]);
            }
        }
    }
}

export function moveDownInFormArray(groupDescriptor: GroupDescriptor, formData: FormData, arrayKey: string, index: number) {
    const lengthKey = `${arrayKey}|_length`;
    const lengthAtom = formData[lengthKey];
    if (!lengthAtom) {
        console.warn(`No length atom found for arrayKey: ${arrayKey}`);
        return;
    }
    const length = parseInt(store.get(lengthAtom)[0]);
    if (index >= length - 1) return;
    for (const field of groupDescriptor.fields) {
        const key = `${arrayKey}|${field.key}`;
        const fieldAtom = formData[key];
        if (fieldAtom) {
            const arr = store.get(fieldAtom);
            if (arr.length > index) {
                const temp = arr[index + 1];
                arr[index + 1] = arr[index];
                arr[index] = temp;
                store.set(fieldAtom, [...arr]);
            }
        }
    }
}
