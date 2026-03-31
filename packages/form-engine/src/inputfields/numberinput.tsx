import { InputGroup, InputGroupInput } from "@repo/ui";
import type { FormData } from "@/forms";
import { useAtom } from "jotai";
import type React from "react";

export const NumberInput = ({
    label,
    formData,
    fieldKey,
    index,
    inline = false,
    className = "",
    fractional = false,
    readonly = false,
    twoColumn = true,
    important = false
}: {
    label: string;
    formData: FormData;
    fieldKey: string;
    index: number;
    inline?: boolean;
    className?: string;
    fractional?: boolean;
    readonly?: boolean;
    twoColumn?: boolean;
    important?: boolean;
}) => {
    const [value, setValue] = useAtom(formData[fieldKey]);

    const baseClass = inline ? "flex items-center space-x-2" : "";
    const labelClass = inline ? (twoColumn ? "text-end w-1/4" : "") + " leading-[0.95em]" : "";

    const sanitize = (raw: string) => {
        if (!fractional) return raw.replaceAll(/\D+/g, "");

        let result = "";
        let foundDecimal = false;
        for (const char of raw) {
            if (/[0-9]/.test(char)) {
                result += char;
            } else if ((char === "." || char === ",") && !foundDecimal) {
                result += char;
                foundDecimal = true;
            }
        }
        return result;
    };

    const preventInvalidKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Block characters that would allow negative, decimals, or scientific notation.
        if (fractional) {
            if (["-", "+", "e", "E"].includes(e.key)) {
                e.preventDefault();
            }
        } else if (["-", "+", ".", ",", "e", "E"].includes(e.key)) {
            e.preventDefault();
        }
    };

    const preventPasteNonDigits = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData("text");
        const invalidPattern = fractional ? /[^\d.,]+/ : /\D/;
        if (invalidPattern.test(text)) e.preventDefault();
    };

    const fieldName = `${fieldKey}-${index}`;

    return (
        <div className={`${baseClass} ${className}`}>
            <label className={`block mb-1 font-medium ${labelClass}`} htmlFor={fieldName}>
                {label}
            </label>
            <InputGroup className={`w-full border rounded py-1 px-2 flex-3 h-9 min-w-16 ${important ? "border-primary border-2" : "border-gray-300"}`}>
                <InputGroupInput
                    className="h-[unset] px-0 py-0 md:text-base"
                    type="text"
                    inputMode="numeric"
                    pattern="\\d*"
                    id={fieldName}
                    name={fieldName}
                    value={value[index] ?? ""}
                    readOnly={readonly}
                    onKeyDown={preventInvalidKeys}
                    onPaste={preventPasteNonDigits}
                    onChange={(e) => {
                        const sanitized = sanitize(e.target.value);
                        const newValue = [...value];
                        newValue[index] = sanitized;
                        setValue(newValue);
                    }}
                    onBlur={(e) => {
                        const sanitized = sanitize(e.target.value);
                        const newValue = [...value];
                        newValue[index] = sanitized;
                        setValue(newValue);
                    }}
                />
            </InputGroup>
        </div>
    );
};
