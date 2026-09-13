import type { GroupDescriptor, PageDescriptor } from "./types";

export type FormData = {
    [key: string]: string;
};

// Keys whose top-level segment is this prefix are runtime-only bookkeeping (e.g. a page's
// visibility condition flag) and never form field data, so they are excluded from toJSON.
const META_KEY_PREFIX = "__meta|";

export function isMetaKey(key: string): boolean {
    return key.startsWith(META_KEY_PREFIX);
}

export type Listener = () => void;
export class FormStore {
    data: FormData = {};
    listeners = new Map<string, Set<Listener>>();

    constructor(formName: string, pages: PageDescriptor[]) {
        this.initialize({ formName, pages });
    }

    initialize({ formName, pages }: { formName: string; pages: PageDescriptor[] }) {
        this.data = {};
        // field values and array lengths
        for (const page of pages) {
            for (const section of page.sections) {
                if (section.noPersist) continue;
                for (const group of section.groups) {
                    if (group.noPersist) continue;
                    const groupKey = `${formName}|${page.key}|${section.key}|${group.key}`;
                    if (group.isArray) {
                        const length = group.arrayMin ? group.arrayMin : 0;
                        this.data[`${groupKey}|_length`] = String(length);
                        for (let i = 0; i < length; i++) {
                            for (const field of group.fields) {
                                if (field.noPersist) continue;
                                this.data[`${groupKey}[[${i}]]|${field.key}`] = field.value || "";
                            }
                        }
                    } else {
                        for (const field of group.fields) {
                            if (field.noPersist) continue;
                            this.data[`${groupKey}|${field.key}`] = field.value || "";
                        }
                    }
                }
            }
        }
    }

    subscribeKey = (key: string, fn: Listener): (() => void) => {
        let set = this.listeners.get(key);
        if (!set) {
            set = new Set<Listener>();
            this.listeners.set(key, set);
        }
        set.add(fn);

        return () => {
            const s = this.listeners.get(key);
            if (!s) return;
            s.delete(fn);
            if (s.size === 0) this.listeners.delete(key);
        };
    };

    notifyListeners(key: string): void {
        const set = this.listeners.get(key);
        if (!set) return;
        for (const fn of [...set]) fn();
    }

    notifyListenersForKeys(keys: string[]): void {
        for (const key of keys) {
            const set = this.listeners.get(key);
            if (!set) continue;
            for (const fn of [...set]) fn();
        }
    }

    notifyAllListeners(): void {
        for (const set of [...this.listeners.values()]) {
            for (const fn of [...set]) fn();
        }
    }

    getField(key: string): string {
        const value = this.data[key];
        if (!value) return "";
        return value;
    }

    setField = (key: string, value: string): void => {
        this.data[key] = value;
        this.notifyListeners(key);
    };

    deleteFromFormArray(groupDescriptor: GroupDescriptor, arrayKey: string, index: number) {
        const lengthKey = `${arrayKey}|_length`;
        const length = parseInt(this.data[lengthKey]) || 0;
        if (index < 0 || index >= length) return;
        const newLength = length - 1;
        const toNotifyKeys = [lengthKey];
        for (const field of groupDescriptor.fields) {
            if (field.noPersist) continue;
            // shift every item after the deleted index down by one slot
            for (let i = index; i < newLength; i++) {
                const key = `${arrayKey}[[${i}]]|${field.key}`;
                const nextKey = `${arrayKey}[[${i + 1}]]|${field.key}`;
                this.data[key] = this.data[nextKey];
                toNotifyKeys.push(key);
            }
            const lastKey = `${arrayKey}[[${newLength}]]|${field.key}`;
            delete this.data[lastKey];
            // toNotifyKeys.push(lastKey);
        }
        this.data[lengthKey] = String(newLength);
        this.notifyListenersForKeys(toNotifyKeys);
    }

    appendToFormArray(groupDescriptor: GroupDescriptor, arrayKey: string) {
        const lengthKey = `${arrayKey}|_length`;
        const length = parseInt(this.data[lengthKey]) || 0;
        const newLength = length + 1;
        const toNotifyKeys = [lengthKey];
        for (const field of groupDescriptor.fields) {
            if (field.noPersist) continue;
            const key = `${arrayKey}[[${length}]]|${field.key}`;
            this.data[key] = field.value || "";
            toNotifyKeys.push(key);
        }
        this.data[lengthKey] = String(newLength);
        this.notifyListenersForKeys(toNotifyKeys);
    }

    moveUpInFormArray(groupDescriptor: GroupDescriptor, arrayKey: string, index: number) {
        if (index === 0) return;
        const toNotifyKeys = [];
        for (const field of groupDescriptor.fields) {
            if (field.noPersist) continue;
            const key = `${arrayKey}[[${index}]]|${field.key}`;
            const prevKey = `${arrayKey}[[${index - 1}]]|${field.key}`;
            const temp = this.data[prevKey];
            this.data[prevKey] = this.data[key];
            this.data[key] = temp;
            toNotifyKeys.push(key, prevKey);
        }
        this.notifyListenersForKeys(toNotifyKeys);
    }

    moveDownInFormArray(groupDescriptor: GroupDescriptor, arrayKey: string, index: number) {
        const lengthKey = `${arrayKey}|_length`;
        const length = parseInt(this.data[lengthKey]) || 0;
        if (index >= length - 1) return;
        const toNotifyKeys = [];
        for (const field of groupDescriptor.fields) {
            if (field.noPersist) continue;
            const key = `${arrayKey}[[${index}]]|${field.key}`;
            const nextKey = `${arrayKey}[[${index + 1}]]|${field.key}`;
            const temp = this.data[nextKey];
            this.data[nextKey] = this.data[key];
            this.data[key] = temp;
            toNotifyKeys.push(key, nextKey);
        }
        this.notifyListenersForKeys(toNotifyKeys);
    }

    fromJSON(json: Record<string, unknown>, prefix: string = "", createMissing = false) {
        // Build a set of section keys that were collapsed (section == group) in the target formData.
        // Key: "form|page|section" -> group key (which equals section key when collapsed).
        const collapsedSections = new Set<string>();
        for (const key in this.data) {
            const parts = key.split("|");
            if (parts.length < 5) continue;
            // Strip a possible "[[i]]" array-index suffix before comparing section/group keys.
            const groupBase = parts[3].match(/^(.*)\[\[\d+\]\]$/)?.[1] ?? parts[3];
            if (parts[2] === groupBase) {
                collapsedSections.add(parts.slice(0, 3).join("|"));
            }
        }

        const setField = (objKey: string, value: string) => {
            // If objKey has only 4 parts, the section and group keys were merged;
            // expand by duplicating the section key (index 2) to restore the 5-part format.
            // The section itself can never be an array (only the group can), so strip any
            // "[[i]]" array-index suffix before duplicating it into the section slot.
            const keyParts = objKey.split("|");
            if (keyParts.length === 4) {
                const sectionBase = keyParts[2].match(/^(.*)\[\[\d+\]\]$/)?.[1] ?? keyParts[2];
                keyParts.splice(2, 0, sectionBase);
                objKey = keyParts.join("|");
            }
            const fullKey = prefix ? prefix + "|" + objKey : objKey;
            if (createMissing || fullKey in this.data || this.isFieldinArrayGroup(fullKey)) {
                this.data[fullKey] = value;
            }
        };

        const flatten = (obj: unknown, pathParts: string[]) => {
            // At section level (depth 3: form, page, section), if this section was
            // collapsed in atomsToJSON (section == group), duplicate the section key
            // as the group key to restore the full 5-part atom key.
            if (pathParts.length === 3) {
                const lookupKey = (prefix ? prefix + "|" : "") + pathParts.join("|");
                if (collapsedSections.has(lookupKey)) {
                    // Insert the section key again as the group key
                    if (Array.isArray(obj) || !obj || typeof obj !== "object") {
                        flatten(obj, [...pathParts, pathParts[2]]);
                        return;
                    }
                    // The section may have further groups next to the collapsed one: toJSON writes them
                    // beside the collapsed group's (always string) field values as nested objects/arrays,
                    // so those keep their own group key instead of being nested under the section key.
                    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
                        if (Array.isArray(value) || (value && typeof value === "object")) {
                            flatten(value, [...pathParts, key]);
                        } else {
                            setField([...pathParts, pathParts[2], key].join("|"), String(value ?? ""));
                        }
                    }
                    return;
                }
            }

            if (Array.isArray(obj)) {
                const arrayKey = pathParts.join("|");
                setField(`${arrayKey}|_length`, String(obj.length));

                const fields = new Set<string>();
                for (const item of obj) {
                    if (item && typeof item === "object" && !Array.isArray(item)) {
                        for (const key of Object.keys(item as Record<string, unknown>)) {
                            fields.add(key);
                        }
                    }
                }
                obj.forEach((item: unknown, i: number) => {
                    for (const field of fields) {
                        const value = item && typeof item === "object" ? String((item as Record<string, unknown>)[field] ?? "") : "";
                        setField(`${arrayKey}[[${i}]]|${field}`, value);
                    }
                });
            } else if (obj && typeof obj === "object") {
                for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
                    if (Array.isArray(value) || (value && typeof value === "object")) {
                        flatten(value, [...pathParts, key]);
                    } else {
                        setField([...pathParts, key].join("|"), String(value ?? ""));
                    }
                }
            }
        };

        flatten(json, []);
        this.notifyAllListeners();
    }

    toJSON(pages?: PageDescriptor[], formName?: string): Record<string, unknown> {
        const result: Record<string, unknown> = {};

        // Keys always have 5 parts: form|page|section|group|field (or _length/_open).
        // The group part carries "[[i]]" when it names an array item's slot.
        // When section key == group key, skip the group level in the JSON output.

        function parseGroupPart(part: string): { base: string; index: number | null } {
            const m = part.match(/^(.*)\[\[(\d+)\]\]$/);
            if (m) return { base: m[1], index: parseInt(m[2], 10) };
            return { base: part, index: null };
        }

        // Identify array groups and their lengths (in original key space)
        // A saját névtér (formName) leírókban tömbként megadott csoportjai. Egy korábban hibásan
        // visszatöltött adatlapból maradhat a store-ban nem létező tömbre utaló "_length" kulcs (pl.
        // "…|Illetékesség|Illetékesség|_length"), ami a teljes szakaszt tömbbé tenné a kimenetben.
        // Az idegen névterek (pl. Kérelmezői, Előterjesztő<n>) csoportjai nincsenek a leírókban, azokat nem szűrjük.
        const describedArrayPaths = new Set<string>();
        if (pages && formName) {
            for (const page of pages) {
                for (const section of page.sections) {
                    for (const group of section.groups) {
                        if (group.isArray) describedArrayPaths.add(`${formName}|${page.key}|${section.key}|${group.key}`);
                    }
                }
            }
        }

        // Azok a csoportok, amelyeknek ténylegesen van indexelt ("[[i]]") eleme a store-ban.
        const indexedGroupPaths = new Set<string>();
        for (const key in this.data) {
            const parts = key.split("|");
            if (parts.length !== 5) continue;
            const { base, index } = parseGroupPart(parts[3]);
            if (index !== null) indexedGroupPaths.add([parts[0], parts[1], parts[2], base].join("|"));
        }

        const arrayPaths = new Map<string, number>();
        for (const key in this.data) {
            const parts = key.split("|");
            // Érvényes kulcs mindig 5 tagú; a hosszabbak hibás visszatöltésből maradt szemetek.
            if (parts.length !== 5 || parts[4] !== "_length") continue;
            const parentPath = parts.slice(0, 4).join("|");
            // Saját névtérben a leíróban nem szereplő, elem nélküli "tömb" csak szemét lehet (ld. fent).
            if (pages && formName && parts[0] === formName && !describedArrayPaths.has(parentPath) && !indexedGroupPaths.has(parentPath)) continue;
            arrayPaths.set(parentPath, parseInt(this.data[key]) || 0);
        }

        // For groups that use lengthSource, override with the actual source length.
        // A noPersist szakaszok/csoportok kimaradnak - ezeknek az initialize sem hoz létre kulcsot,
        // tehát nincs saját adatuk. Enélkül a csak-olvasható, más névtér adatát tükröző listák (pl.
        // a bizottsági adatlap közéleti "Lista" csoportjai) üres tömbként bekerülnének a mentett
        // JSON-ba, holott a tartalmuk a forrás-névtérben (Kérelmezői|...) már ott van.
        if (pages && formName) {
            for (const page of pages) {
                for (const section of page.sections) {
                    if (section.noPersist) continue;
                    for (const group of section.groups) {
                        if (group.noPersist) continue;
                        if (group.isArray && group.lengthSource && this.data[group.lengthSource]) {
                            const parentPath = `${formName}|${page.key}|${section.key}|${group.key}`;
                            const len = parseInt(this.data[group.lengthSource]) || 0;
                            arrayPaths.set(parentPath, len);
                        }
                    }
                }
            }
        }

        // Identify array paths in collapsed output space (group dropped when it equals section)
        const outputArrayPaths = new Map<string, number>();
        for (const [origGroupKey, length] of arrayPaths) {
            const gparts = origGroupKey.split("|");
            const containerParts = gparts[2] === gparts[3] ? gparts.slice(0, 3) : gparts;
            outputArrayPaths.set(containerParts.join("|"), length);
        }

        function ensurePath(parts: string[]): Record<string, unknown> | Record<string, unknown>[] {
            let current: any = result;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const pathSoFar = parts.slice(0, i + 1).join("|");
                // Egy hibás visszatöltésből maradt, a csoport nevén álló szöveges érték nem blokkolhatja a csoportot
                if (!(part in current) || current[part] === null || typeof current[part] !== "object") {
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

        // Ensure array containers exist in the output even when they have zero items
        // (in which case there are no field keys to trigger ensurePath below).
        for (const path of outputArrayPaths.keys()) {
            ensurePath(path.split("|"));
        }

        for (const key in this.data) {
            if (isMetaKey(key)) continue;

            const parts = key.split("|");
            if (parts.length !== 5) continue;
            const lastPart = parts[parts.length - 1];
            if (lastPart === "_length" || lastPart === "_open") continue;

            const { base: groupBase, index } = parseGroupPart(parts[3]);
            const collapsed = parts[2] === groupBase;
            const containerParts = collapsed ? parts.slice(0, 3) : [parts[0], parts[1], parts[2], groupBase];
            const fieldName = parts[4];

            const value = this.data[key];
            const parent = ensurePath(containerParts);

            // Ha a kulcs szerkezete nem illik a kimenet szerkezetéhez (tömb vs. objektum), a kulcsot
            // kihagyjuk, különben kivétel keletkezne, vagy az érték a JSON.stringify-ban nyomtalanul elveszne.
            if (index !== null) {
                const item = Array.isArray(parent) ? parent[index] : undefined;
                if (!item) continue;
                item[fieldName] = value ?? "";
            } else {
                if (Array.isArray(parent)) continue;
                // ...és fordítva: egy ilyen szöveges érték nem írhatja felül a már felépített csoportot
                const existing = (parent as Record<string, unknown>)[fieldName];
                if (existing !== null && typeof existing === "object") continue;
                (parent as Record<string, unknown>)[fieldName] = value ?? "";
            }
        }

        return result;
    }

    getArrayLengthKey(fieldKey: string): string {
        const parts = fieldKey.split("|");
        // If the fieldKey contains indexed array notation, strip it to get the base group key
        const groupPart = parts[3];
        const m = groupPart.match(/^(.*)\[\[(\d+)\]\]$/);
        if (m) {
            parts[3] = m[1]; // Replace with base group key
        }
        return [...parts.slice(0, -1), "_length"].join("|");
    }

    getArrayLength(fieldKey: string): number {
        const parts = fieldKey.split("|");
        if (parts.length < 5) return 0;
        const arrayKey = this.getArrayLengthKey(fieldKey);
        return arrayKey in this.data ? parseInt(this.data[arrayKey]) || 0 : -1;
    }

    isFieldinArrayGroup(fieldKey: string): boolean {
        return this.getArrayLength(fieldKey) >= 0;
    }

    getFieldKeyForArrayItem(fieldKey: string, index: number): string {
        const parts = fieldKey.split("|");
        const groupPart = parts[3];
        const m = groupPart.match(/^(.*)\[\[(\d+)\]\]$/);
        const base = m ? m[1] : groupPart;
        const newGroupPart = `${base}[[${index}]]`;
        return [...parts.slice(0, 3), newGroupPart, parts[4]].join("|");
    }

    getArrayItem(fieldKey: string, index: number): string {
        const itemKey = this.getFieldKeyForArrayItem(fieldKey, index);
        return this.data[itemKey] || "";
    }

    getArray(fieldKey: string): string[] {
        const length = this.getArrayLength(fieldKey);
        const result: string[] = [];
        for (let i = 0; i < length; i++) {
            result.push(this.getArrayItem(fieldKey, i));
        }
        return result;
    }
}

export function getFromObjectByKey(obj: unknown, path: string): unknown {
    const parts = path.split("|");
    let current: any = obj;
    for (let i = 0; i < parts.length; i++) {
        if (current == null) return undefined;

        // A part may carry "[[i]]" to address a specific array item's slot.
        const m = parts[i].match(/^(.*)\[\[(\d+)\]\]$/);
        const base = m ? m[1] : parts[i];
        const index = m ? parseInt(m[2], 10) : null;

        if (Array.isArray(current)) {
            const remainingPath = parts.slice(i).join("|");
            return current.map((item) => getFromObjectByKey(item, remainingPath));
        }

        // Skip redundant group key at position 3 when section (2) == group (3)
        if (i === 2) {
            const nextMatch = parts[3]?.match(/^(.*)\[\[(\d+)\]\]$/);
            const nextBase = nextMatch ? nextMatch[1] : parts[3];
            if (parts[2] === nextBase) continue;
        }

        current = current[base];
        if (index !== null) {
            if (!Array.isArray(current)) return undefined;
            current = current[index];
        }
    }
    return current;
}
