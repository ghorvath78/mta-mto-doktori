import type { FieldDescriptor } from "./types";
import { useCondition } from "./conditions";
import { useSetInfoState } from "./infostate";

export const FieldWrapper = ({ fieldDescriptor, children }: { fieldDescriptor: FieldDescriptor; children: React.ReactNode }) => {
    const isVisible = useCondition(fieldDescriptor);
    const setInfoField = useSetInfoState();

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
