import type { FormData } from "@/forms";
import { useAtom } from "jotai";

export const BirthDataInput = ({
    fieldKey,
    formData,
    index,
    readonly = false
}: {
    fieldKey: string;
    formData: FormData;
    index: number;
    readonly?: boolean;
}) => {
    const minYear = 1900;
    const maxYear = new Date().getFullYear();

    const [value, setValue] = useAtom(formData[fieldKey]);
    // Keep the place text as-is (including spaces). Only normalize the year.
    const raw = value[index] ?? "";
    const pipeIndex = raw.indexOf("|");
    const rawYear = pipeIndex === -1 ? raw : raw.slice(0, pipeIndex);
    const rawPlace = pipeIndex === -1 ? "" : raw.slice(pipeIndex + 1);

    const year = rawYear.trim();
    const place = rawPlace;

    const fieldName = fieldKey + "-" + index;

    return (
        <div className="flex items-baseline space-x-2">
            <label className="text-end w-1/4 font-medium leading-[0.95em] min-w-1/4" htmlFor={fieldName + "-year"}>
                Születés éve
            </label>
            <div className="flex flex-grow">
                <div className="flex flex-1 items-baseline space-x-2">
                    <input
                        className="flex-0 border border-gray-300 rounded py-1 px-2 w-24"
                        type="number"
                        min={minYear}
                        max={maxYear}
                        step={1}
                        id={fieldName + "-year"}
                        name={fieldName + "-year"}
                        value={year}
                        readOnly={readonly}
                        onChange={(e) => {
                            const newValue = [...value];
                            newValue[index] = `${e.target.value}|${place}`;
                            setValue(newValue);
                        }}
                        onBlur={(e) => {
                            const rawInput = e.target.value;
                            if (rawInput === "") return;

                            const parsed = Number(rawInput);
                            if (!Number.isFinite(parsed)) return;

                            const clamped = Math.min(maxYear, Math.max(minYear, Math.trunc(parsed)));
                            const newValue = [...value];
                            newValue[index] = `${String(clamped)}|${place}`;
                            setValue(newValue);
                        }}
                    />
                    <label className="flex-0 mb-1 font-medium" htmlFor={fieldName + "-place"}>
                        helye:
                    </label>
                    <input
                        className="flex-1 border border-gray-300 rounded py-1 px-2 w-full"
                        type="text"
                        id={fieldName + "-place"}
                        name={fieldName + "-place"}
                        value={place}
                        readOnly={readonly}
                        onChange={(e) => {
                            const newValue = [...value];
                            newValue[index] = `${year}|${e.target.value}`;
                            setValue(newValue);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
