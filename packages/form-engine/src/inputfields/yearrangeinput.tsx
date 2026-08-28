import { useFieldWithValueSource } from "@/hooks";
import type { FieldInputProps } from "@/types";
import { getFieldLabel, isFieldReadonly } from "@/utils";

export const YearRangeInput = ({ fieldKey, fieldDescr }: FieldInputProps) => {
    const [value, setValue] = useFieldWithValueSource(fieldKey, fieldDescr.valueSource);
    const label = getFieldLabel(fieldDescr);
    const readonly = isFieldReadonly(fieldDescr);

    const minYear = 1900;
    const maxYear = new Date().getFullYear();

    const normalizeYear = (rawInput: string) => {
        const trimmed = rawInput.trim();
        if (trimmed === "") return "";

        // Only allow digits; keep UX predictable and avoid scientific notation, signs, etc.
        if (!/^\d+$/.test(trimmed)) return "";

        const parsed = Number(trimmed);
        if (!Number.isFinite(parsed)) return "";

        const clamped = Math.min(maxYear, Math.max(minYear, Math.trunc(parsed)));
        return String(clamped);
    };

    const rawRange = value ?? "";
    const [start, end] = rawRange.split("-").map((v) => v.trim());

    const preventDash = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "-") e.preventDefault();
    };

    const preventPasteWithDash = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData("text");
        if (text.includes("-")) e.preventDefault();
    };

    return (
        <div className="flex items-baseline space-x-2">
            <label className="text-end w-1/4 font-medium leading-[0.95em]" htmlFor={`${fieldKey}-from`}>
                {label} kezdete:
            </label>
            <div className="flex flex-grow items-baseline space-x-2">
                <input
                    className="flex-1 w-0 border border-gray-300 rounded py-1 px-2 min-w-0"
                    type="number"
                    min={minYear}
                    max={maxYear}
                    step={1}
                    id={`${fieldKey}-from`}
                    name={`${fieldKey}-from`}
                    value={start ?? ""}
                    readOnly={readonly}
                    onKeyDown={preventDash}
                    onPaste={preventPasteWithDash}
                    onChange={(e) => {
                        const sanitized = e.target.value.replaceAll("-", "");
                        setValue(`${sanitized}-${end ?? ""}`);
                    }}
                    onBlur={(e) => {
                        const normalizedStart = normalizeYear(e.target.value);
                        const normalizedEnd = normalizeYear(end ?? "");

                        const nextEnd =
                            normalizedStart !== "" && normalizedEnd !== "" && Number(normalizedEnd) < Number(normalizedStart) ? normalizedStart : normalizedEnd;

                        setValue(`${normalizedStart}-${nextEnd}`);
                    }}
                />
                <label className="flex-0 mb-1 font-medium" htmlFor={`${fieldKey}-to`}>
                    vége:
                </label>
                <input
                    className="flex-1 w-0 border border-gray-300 rounded py-1 px-2 "
                    type="number"
                    min={minYear}
                    max={maxYear}
                    step={1}
                    id={`${fieldKey}-to`}
                    name={`${fieldKey}-to`}
                    value={end ?? ""}
                    readOnly={readonly}
                    onKeyDown={preventDash}
                    onPaste={preventPasteWithDash}
                    onChange={(e) => {
                        const sanitized = e.target.value.replaceAll("-", "");
                        setValue(`${start ?? ""}-${sanitized}`);
                    }}
                    onBlur={(e) => {
                        const normalizedStart = normalizeYear(start ?? "");
                        const normalizedEnd = normalizeYear(e.target.value);

                        const nextEnd =
                            normalizedStart !== "" && normalizedEnd !== "" && Number(normalizedEnd) < Number(normalizedStart) ? normalizedStart : normalizedEnd;

                        setValue(`${normalizedStart}-${nextEnd}`);
                    }}
                />
            </div>
        </div>
    );
};
