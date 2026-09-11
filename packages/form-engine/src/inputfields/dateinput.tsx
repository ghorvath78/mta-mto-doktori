import { useFieldWithValueSource } from "../hooks";
import type { FieldInputProps } from "../types";
import { getFieldLabel, isFieldReadonly } from "../utils";
import { InputGroup, InputGroupInput } from "@repo/ui";

export const DateInput = ({ fieldKey, fieldDescr }: FieldInputProps) => {
    const [value, setValue] = useFieldWithValueSource(fieldKey, fieldDescr.valueSource);
    const label = getFieldLabel(fieldDescr);
    const inline = fieldDescr.attribs?.inline !== false;
    const readonly = isFieldReadonly(fieldDescr);
    const important = fieldDescr.attribs?.important === true;

    const baseClass = inline ? "flex items-center space-x-2" : "";
    const labelClass = inline ? "text-end w-1/4 leading-[0.95em]" : "";

    const formatForDisplay = (isoDate: string) => {
        if (!isoDate) return "";
        const [year, month, day] = isoDate.split("-");
        if (!year || !month || !day) return isoDate;
        return `${year}. ${month}. ${day}.`;
    };

    return (
        <div className={baseClass}>
            <label className={`block mb-1 font-medium ${labelClass}`} htmlFor={fieldKey}>
                {label}
            </label>
            {readonly && (
                <div id={fieldKey} className="py-1 px-2 mb-1 flex-3">
                    {formatForDisplay(value ?? "")}
                </div>
            )}
            {!readonly && (
                <InputGroup className={`w-full border rounded py-1 px-2 flex-3 h-9 ${important ? "border-primary border-2" : "border-gray-300"}`}>
                    <InputGroupInput
                        className="h-[unset] px-0 py-0 md:text-base"
                        type="date"
                        id={fieldKey}
                        name={fieldKey}
                        value={value ?? ""}
                        readOnly={readonly}
                        onChange={(e) => {
                            setValue(e.target.value);
                        }}
                    />
                </InputGroup>
            )}
        </div>
    );
};
