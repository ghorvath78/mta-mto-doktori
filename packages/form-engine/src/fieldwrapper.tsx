import type { FieldDescriptor } from "./types";
import { useCondition } from "./conditions";
import { useSetInfoState } from "./infostate";

export const FieldWrapper = ({
    fieldDescriptor,
    groupIndex,
    children
}: {
    fieldDescriptor: FieldDescriptor;
    groupIndex: number;
    children: React.ReactNode;
}) => {
    const isVisible = useCondition(fieldDescriptor, groupIndex);
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
