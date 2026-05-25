import { atom, useAtomValue, useSetAtom } from "jotai";
import { getConditionInputValue, isConditionSatisfied, type FieldDescriptor, type FormData } from "./forms";
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
    const conditionValues = useAtomValue(fieldDescriptor.conditionKey ? formData[fieldDescriptor.conditionKey] : trueConditionAtom);
    const isVisible = isConditionSatisfied(conditionValues, index, fieldDescriptor.conditionValue ?? getConditionInputValue(["true"], 0));

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
