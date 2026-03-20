import { atom, useAtomValue, useSetAtom } from "jotai";
import type { FieldDescriptor, FormData } from "./forms";
import { infoFieldAtom } from "./atoms";

const trueConditionAtom = atom(["true"]);

export const FieldWrapper = ({
    fieldDescriptor,
    formData,
    index,
    children
}: {
    fieldDescriptor: FieldDescriptor;
    formData: FormData;
    index: number;
    children: React.ReactNode;
}) => {
    const setInfoField = useSetAtom(infoFieldAtom);
    const conditionValue = useAtomValue(fieldDescriptor.conditionKey ? formData[fieldDescriptor.conditionKey] : trueConditionAtom);
    const isVisible = !fieldDescriptor.conditionKey || (conditionValue && conditionValue[index] === (fieldDescriptor.conditionValue ?? "true"));

    return (
        <div
            style={{ display: isVisible ? "block" : "none" }}
            onMouseEnter={() => setInfoField(fieldDescriptor.helpText ?? "")}
            onMouseLeave={() => setInfoField("")}
        >
            {children}
        </div>
    );
};
