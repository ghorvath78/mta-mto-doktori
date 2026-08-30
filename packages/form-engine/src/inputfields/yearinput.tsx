import { useFieldWithValueSource } from "../hooks";
import type { FieldInputProps } from "../types";
import { getFieldLabel, isFieldReadonly } from "../utils";
import { InputGroup, InputGroupInput } from "@repo/ui";
import type React from "react";

export const YearInput = ({ fieldKey, fieldDescr }: FieldInputProps) => {
    const [value, setValue] = useFieldWithValueSource(fieldKey, fieldDescr.valueSource);
    const label = getFieldLabel(fieldDescr);
    const inline = fieldDescr.attribs?.inline !== false;
    const readonly = isFieldReadonly(fieldDescr);

    const minYear = 1900;
    const maxYear = new Date().getFullYear();

    const normalizeYear = (rawInput: string) => {
        const trimmed = rawInput.trim();
        if (trimmed === "") return "";
        if (!/^\d+$/.test(trimmed)) return "";

        const parsed = Number(trimmed);
        if (!Number.isFinite(parsed)) return "";

        const clamped = Math.min(maxYear, Math.max(minYear, Math.trunc(parsed)));
        return String(clamped);
    };

    const baseClass = inline ? "flex items-center space-x-2" : "";
    const labelClass = inline ? "text-end w-1/4 leading-[0.95em]" : "";

    const preventDash = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "-") e.preventDefault();
    };

    const preventPasteWithDash = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData("text");
        if (text.includes("-")) e.preventDefault();
    };

    return (
        <div className={baseClass}>
            <label className={`block mb-1 font-medium ${labelClass}`} htmlFor={fieldKey}>
                {label}
            </label>
            {readonly && (
                <div id={fieldKey} className="py-1 px-2 mb-1 flex-3">
                    {value ?? ""}
                </div>
            )}
            {!readonly && (
                <InputGroup className="w-full border border-gray-300 rounded py-1 px-2 flex-3 h-9">
                    <InputGroupInput
                        className="h-[unset] px-0 py-0 md:text-base"
                        type="number"
                        min={minYear}
                        max={maxYear}
                        step={1}
                        id={fieldKey}
                        name={fieldKey}
                        value={value ?? ""}
                        readOnly={readonly}
                        onKeyDown={preventDash}
                        onPaste={preventPasteWithDash}
                        onChange={(e) => {
                            const sanitized = e.target.value.replaceAll("-", "");
                            setValue(sanitized);
                        }}
                        onBlur={(e) => {
                            const normalized = normalizeYear(e.target.value);
                            setValue(normalized);
                        }}
                    />
                </InputGroup>
            )}
        </div>
    );
};
