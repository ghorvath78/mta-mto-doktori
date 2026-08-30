import type { FormStore } from "./formstore";
import { useFieldValue, useValueStore } from "./hooks";
import type { ConditionalDescriptor } from "./types";

export function useCondition(cond: ConditionalDescriptor, ix = -1): boolean {
    const store = useValueStore();
    const conditionKey = getConditionKey(store, cond, ix);

    const inputValue = useFieldValue(conditionKey ?? "");

    if (!cond.conditionKey) {
        return true;
    }
    if (conditionKey === null) {
        return false;
    }

    const conditionValue = cond.conditionValue ?? "true";
    return matchesConditionValue(inputValue, conditionValue);
}

function getConditionKey(store: FormStore, cond: ConditionalDescriptor, ix = -1): string | null {
    let conditionKey = cond.conditionKey ?? "";
    if (conditionKey && ix >= 0) {
        // check if cond.conditionKey is in an array group and ix is valid
        const keyParts = conditionKey.split("|");
        const lengthKey = [...keyParts.slice(0, -1), "_length"].join("|");
        const isArrayGroup = lengthKey in store.data;
        if (isArrayGroup) {
            const arrayLength = parseInt(store.data[lengthKey]) || 0;
            if (ix < arrayLength) {
                conditionKey = `${keyParts.slice(0, -1).join("|")}[[${ix}]]|${keyParts[keyParts.length - 1]}`;
            }
        }
    }

    const keyExists = conditionKey !== "" && conditionKey in store.data;
    return keyExists ? conditionKey : null;
}

export function evaluateCondition(store: FormStore, cond: ConditionalDescriptor, ix = -1): boolean {
    if (!cond.conditionKey) {
        return true;
    }
    const conditionKey = getConditionKey(store, cond, ix);
    if (!conditionKey) {
        return false;
    }

    const inputValue = store.data[conditionKey];
    const conditionValue = cond.conditionValue ?? "true";
    return matchesConditionValue(inputValue, conditionValue);
}

export function matchesConditionValue(value: string, conditionValue: string = "true"): boolean {
    const normalizedCondition = conditionValue.trim();

    if (normalizedCondition.startsWith("!")) {
        return !matchesConditionValue(value, normalizedCondition.slice(1));
    }

    const comparisonMatch = normalizedCondition.match(/^(<=|>=|<|>)(.*)$/);
    if (comparisonMatch) {
        const [, operator, rawExpected] = comparisonMatch;
        const actualNumber = Number(value);
        const expectedNumber = Number(rawExpected.trim());

        if (Number.isNaN(actualNumber) || Number.isNaN(expectedNumber)) {
            return false;
        }

        switch (operator) {
            case "<":
                return actualNumber < expectedNumber;
            case ">":
                return actualNumber > expectedNumber;
            case "<=":
                return actualNumber <= expectedNumber;
            case ">=":
                return actualNumber >= expectedNumber;
            default:
                return false;
        }
    }

    return normalizedCondition
        .split("|")
        .map((option) => option.trim())
        .includes(value);
}
