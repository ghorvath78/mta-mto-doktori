import { InputGroup, InputGroupInput } from "@repo/ui";
import type { FormData } from "@/forms";
import { useAtom } from "jotai";
import type React from "react";

export const YearInput = ({
    label,
    formData,
    fieldKey,
    index,
    inline = false,
    className = "",
    readonly = false
}: {
    label: string;
    formData: FormData;
    fieldKey: string;
    index: number;
    inline?: boolean;
    className?: string;
    readonly?: boolean;
}) => {
    const [value, setValue] = useAtom(formData[fieldKey]);

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

    const fieldName = `${fieldKey}-${index}`;

    return (
        <div className={`${baseClass} ${className}`}>
            <label className={`block mb-1 font-medium ${labelClass}`} htmlFor={fieldName}>
                {label}
            </label>
            <InputGroup className="w-full border border-gray-300 rounded py-1 px-2 flex-3 h-9">
                <InputGroupInput
                    className="h-[unset] px-0 py-0 md:text-base"
                    type="number"
                    min={minYear}
                    max={maxYear}
                    step={1}
                    id={fieldName}
                    name={fieldName}
                    value={value[index] ?? ""}
                    readOnly={readonly}
                    onKeyDown={preventDash}
                    onPaste={preventPasteWithDash}
                    onChange={(e) => {
                        const sanitized = e.target.value.replaceAll("-", "");
                        const newValue = [...value];
                        newValue[index] = sanitized;
                        setValue(newValue);
                    }}
                    onBlur={(e) => {
                        const normalized = normalizeYear(e.target.value);
                        const newValue = [...value];
                        newValue[index] = normalized;
                        setValue(newValue);
                    }}
                />
            </InputGroup>
        </div>
    );
};
