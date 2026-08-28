import { useFieldValue, useValueStore } from "./hooks";
import type { ConditionalDescriptor } from "./types";

export function useCondition(cond: ConditionalDescriptor, ix = -1): boolean {
    const store = useValueStore();

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
    // Hooks must run unconditionally, so subscribe before applying the early-return logic below.
    const inputValue = useFieldValue(keyExists ? conditionKey : "");

    if (!cond.conditionKey) {
        return true;
    }
    if (!keyExists) {
        return false;
    }

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
