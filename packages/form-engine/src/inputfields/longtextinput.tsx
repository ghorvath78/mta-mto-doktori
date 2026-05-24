import { Textarea } from "@repo/ui";
import { getFieldLabel, isFieldReadonly, resolveFieldKey, type FieldInputProps } from "../forms";
import { useAtom } from "jotai";

export const LongTextInput = ({ formData, fieldKey, index, fieldDescr }: FieldInputProps) => {
    const resolvedFieldKey = resolveFieldKey(fieldKey, fieldDescr);
    const [value, setValue] = useAtom(formData[resolvedFieldKey]);
    const label = getFieldLabel(fieldDescr);
    const lines = (fieldDescr.attribs?.rows as number | undefined) ?? 2;
    const characters = (fieldDescr.attribs?.maxLength as number | undefined) ?? 500;
    const inline = fieldDescr.attribs?.inline === true;
    const readonly = isFieldReadonly(fieldDescr);

    const baseClass = inline ? "flex items-baseline space-x-2" : "";
    const labelClass = inline ? "text-end w-1/4 leading-[0.95em]" : "";

    const fieldName = `${resolvedFieldKey}-${index}`;

    // Keep min height in sync with requested line count.
    // Approximation: 1.5em per line + vertical padding (py-1 => 0.5rem total).
    const minHeight = `calc(${lines} * 1.5em + 0.5rem)`;
    return (
        <div className={baseClass}>
            <label className={`block mb-1 font-medium ${labelClass}`} htmlFor={fieldName}>
                {label}
            </label>
            <Textarea
                rows={lines}
                maxLength={characters}
                wrap="soft"
                className="w-full min-w-0 border border-gray-300 rounded py-1 px-2 flex-3 break-words [overflow-wrap:anywhere] [word-break:break-word] [field-sizing:fixed]"
                style={{ minHeight }}
                id={fieldName}
                name={fieldName}
                value={value[index] ?? ""}
                onChange={(e) => {
                    const newValue = [...value];
                    newValue[index] = e.target.value;
                    setValue(newValue);
                }}
                readOnly={readonly}
            />
        </div>
    );
};
