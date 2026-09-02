import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import type { FormStore, Listener } from "./formstore";
import type { FormDescriptor } from "./types";
import { getIndexFromKey } from "./utils";

export const StoreContext = createContext<FormStore | null>(null);
export const FormInfoContext = createContext<FormDescriptor | null>(null);

export function useFormInfo(): FormDescriptor {
    const info = useContext(FormInfoContext);
    if (!info) throw new Error("useFormInfo csak <FormProvider> alatt használható");
    return info;
}

export function useValueStore(): FormStore {
    const store = useContext(FormInfoContext)?.valueStore;
    if (!store) throw new Error("useValueStore csak <FormProvider> alatt használható");
    return store;
}

export function useField(key: string): readonly [string, (v: string) => void] {
    const store = useValueStore();

    const subscribe = useCallback((fn: Listener) => store.subscribeKey(key, fn), [store, key]);
    const getSnapshot = useCallback(() => store.getField(key), [store, key]);

    const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const setValue = useCallback((v: string) => store.setField(key, v), [store, key]);

    return [value, setValue] as const;
}

export function useFieldValue(key: string): string {
    const store = useValueStore();

    const subscribe = useCallback((fn: Listener) => store.subscribeKey(key, fn), [store, key]);
    const getSnapshot = useCallback(() => store.getField(key), [store, key]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getEffectiveFieldKey(key: string, valueSource: string | null | undefined, store: FormStore): string {
    let valueKey = key;

    if (valueSource) {
        // check if the key is an array, has an index part and extract the index
        const ix = getIndexFromKey(key);
        if (ix >= 0) {
            // check if valueSource is in an array group and ix is valid
            const keyParts = valueSource.split("|");
            const lengthKey = [...keyParts.slice(0, -1), "_length"].join("|");
            const isArrayGroup = lengthKey in store.data;
            if (isArrayGroup) {
                const arrayLength = parseInt(store.data[lengthKey]) || 0;
                if (ix < arrayLength) {
                    valueKey = `${keyParts.slice(0, -1).join("|")}[[${ix}]]|${keyParts[keyParts.length - 1]}`;
                }
            } else {
                valueKey = valueSource;
            }
        } else {
            valueKey = valueSource;
        }
    }

    return valueKey;
}

export function useFieldWithValueSource(key: string, valueSource: string | null | undefined): readonly [string, (v: string) => void] {
    const store = useValueStore();
    const valueKey = getEffectiveFieldKey(key, valueSource, store);

    const subscribe = useCallback((fn: Listener) => store.subscribeKey(valueKey, fn), [store, valueKey]);
    const getSnapshot = useCallback(() => store.getField(valueKey), [store, valueKey]);

    const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const setValue = useCallback((v: string) => store.setField(valueKey, v), [store, valueKey]);

    return [value, setValue] as const;
}
