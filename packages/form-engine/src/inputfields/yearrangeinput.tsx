import type { FormData } from "@/forms";
import { useAtom } from "jotai";

export const YearRangeInput = ({
    label,
    formData,
    fieldKey,
    index
}: {
    label: string;
    formData: FormData;
    fieldKey: string;
    index: number;
    className?: string;
}) => {
    const [value, setValue] = useAtom(formData[fieldKey]);

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

    const rawRange = value?.[index] ?? "";
    const [start, end] = rawRange.split("-").map((v) => v.trim());

    const preventDash = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "-") e.preventDefault();
    };

    const preventPasteWithDash = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData("text");
        if (text.includes("-")) e.preventDefault();
    };

    const fieldName = `${fieldKey}-${index}`;

    return (
        <div className="flex items-baseline space-x-2">
            <label className="text-end w-1/4 font-medium leading-[0.95em]" htmlFor={`${fieldName}-from`}>
                {label} kezdete:
            </label>
            <div className="flex flex-grow items-baseline space-x-2">
                <input
                    className="flex-1 w-0 border border-gray-300 rounded py-1 px-2 min-w-0"
                    type="number"
                    min={minYear}
                    max={maxYear}
                    step={1}
                    id={`${fieldName}-from`}
                    name={`${fieldName}-from`}
                    value={start ?? ""}
                    onKeyDown={preventDash}
                    onPaste={preventPasteWithDash}
                    onChange={(e) => {
                        const sanitized = e.target.value.replaceAll("-", "");
                        const newValue = [...value];
                        newValue[index] = `${sanitized}-${end ?? ""}`;
                        setValue(newValue);
                    }}
                    onBlur={(e) => {
                        const normalizedStart = normalizeYear(e.target.value);
                        const normalizedEnd = normalizeYear(end ?? "");

                        const nextEnd =
                            normalizedStart !== "" && normalizedEnd !== "" && Number(normalizedEnd) < Number(normalizedStart) ? normalizedStart : normalizedEnd;

                        const newValue = [...value];
                        newValue[index] = `${normalizedStart}-${nextEnd}`;
                        setValue(newValue);
                    }}
                />
                <label className="flex-0 mb-1 font-medium" htmlFor={`${fieldName}-to`}>
                    vége:
                </label>
                <input
                    className="flex-1 w-0 border border-gray-300 rounded py-1 px-2 "
                    type="number"
                    min={minYear}
                    max={maxYear}
                    step={1}
                    id={`${fieldName}-to`}
                    name={`${fieldName}-to`}
                    value={end ?? ""}
                    onKeyDown={preventDash}
                    onPaste={preventPasteWithDash}
                    onChange={(e) => {
                        const sanitized = e.target.value.replaceAll("-", "");
                        const newValue = [...value];
                        newValue[index] = `${start ?? ""}-${sanitized}`;
                        setValue(newValue);
                    }}
                    onBlur={(e) => {
                        const normalizedStart = normalizeYear(start ?? "");
                        const normalizedEnd = normalizeYear(e.target.value);

                        const nextEnd =
                            normalizedStart !== "" && normalizedEnd !== "" && Number(normalizedEnd) < Number(normalizedStart) ? normalizedStart : normalizedEnd;

                        const newValue = [...value];
                        newValue[index] = `${normalizedStart}-${nextEnd}`;
                        setValue(newValue);
                    }}
                />
            </div>
        </div>
    );
};
