import type { FieldDescriptor } from "./types";
import { useCondition } from "./conditions";
import { useSetInfoState } from "./infostate";

export const FieldWrapper = ({ fieldDescriptor, keyPrefix, children }: { fieldDescriptor: FieldDescriptor; keyPrefix: string; children: React.ReactNode }) => {
    const isVisible = useCondition(fieldDescriptor, keyPrefix);
    const setInfoField = useSetInfoState();

    console.log("FieldWrapper: fieldDescriptor.key is", fieldDescriptor.key, "conditionKey:", fieldDescriptor.conditionKey, "isVisible:", isVisible);

    if (fieldDescriptor.key === "Kapcsolódó szabadalom") {
        console.log("FieldWrapper: fieldDescriptor.key is 'Kapcsolódó szabadalom'", fieldDescriptor.conditionKey);
    }

    return (
        <div
            style={{ display: isVisible ? "block" : "none" }}
            onMouseEnter={() => setInfoField({ field: fieldDescriptor.helpText ?? "" })}
            onMouseLeave={() => setInfoField({ field: "" })}
        >
            {children}
        </div>
    );
};
