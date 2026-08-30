import { useFieldWithValueSource } from "../hooks";
import type { FieldInputProps } from "../types";
import { isFieldReadonly } from "../utils";

export const BirthDataInput = ({ fieldKey, fieldDescr }: FieldInputProps) => {
    const minYear = 1900;
    const maxYear = new Date().getFullYear();
    const readonly = isFieldReadonly(fieldDescr);
    const [value, setValue] = useFieldWithValueSource(fieldKey, fieldDescr.valueSource);

    // Keep the place text as-is (including spaces). Only normalize the year.
    const pipeIndex = value.indexOf("|");
    const rawYear = pipeIndex === -1 ? value : value.slice(0, pipeIndex);
    const rawPlace = pipeIndex === -1 ? "" : value.slice(pipeIndex + 1);

    const year = rawYear.trim();
    const place = rawPlace;
    const readonlyValue = [year, place].filter(Boolean).join(", ");

    if (readonly) {
        return (
            <div className="flex items-baseline space-x-2">
                <label className="text-end w-1/4 font-medium leading-[0.95em] min-w-1/4">Születési adatok</label>
                <div className="flex flex-grow">
                    <div className="py-1 px-2">{readonlyValue}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-baseline space-x-2">
            <label className="text-end w-1/4 font-medium leading-[0.95em] min-w-1/4" htmlFor={fieldKey + "-year"}>
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
                        id={fieldKey + "-year"}
                        name={fieldKey + "-year"}
                        value={year}
                        readOnly={readonly}
                        onChange={(e) => {
                            setValue(`${e.target.value}|${place}`);
                        }}
                        onBlur={(e) => {
                            const rawInput = e.target.value;
                            if (rawInput === "") return;

                            const parsed = Number(rawInput);
                            if (!Number.isFinite(parsed)) return;

                            const clamped = Math.min(maxYear, Math.max(minYear, Math.trunc(parsed)));
                            setValue(`${String(clamped)}|${place}`);
                        }}
                    />
                    <label className="flex-0 mb-1 font-medium" htmlFor={fieldKey + "-place"}>
                        helye:
                    </label>
                    <input
                        className="flex-1 border border-gray-300 rounded py-1 px-2 w-full"
                        type="text"
                        id={fieldKey + "-place"}
                        name={fieldKey + "-place"}
                        value={place}
                        readOnly={readonly}
                        onChange={(e) => {
                            setValue(`${year}|${e.target.value}`);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
