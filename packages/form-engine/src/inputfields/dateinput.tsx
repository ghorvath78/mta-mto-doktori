import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { useFieldWithValueSource } from "../hooks";
import type { FieldInputProps } from "../types";
import { getFieldLabel, isFieldReadonly } from "../utils";
import { Calendar, calendarLocaleHu, InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";

const pad = (n: number) => String(n).padStart(2, "0");

const formatForDisplay = (isoDate: string) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    if (!year || !month || !day) return isoDate;
    return `${year}. ${month}. ${day}.`;
};

// Elfogadott formátumok: "2026. 09. 13.", "2026.9.13", "2026-09-13", "2026/09/13"
const parseInput = (text: string): string | null => {
    const match = /^\s*(\d{4})\s*[.\-/ ]\s*(\d{1,2})\s*[.\-/ ]\s*(\d{1,2})\s*\.?\s*$/.exec(text);
    if (!match) return null;
    const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return `${year}-${pad(month)}-${pad(day)}`;
};

const isoToDate = (isoDate: string): Date | undefined => {
    const [year, month, day] = isoDate.split("-").map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day);
};

const dateToIso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const DateInput = ({ fieldKey, fieldDescr }: FieldInputProps) => {
    const [value, setValue] = useFieldWithValueSource(fieldKey, fieldDescr.valueSource);
    const label = getFieldLabel(fieldDescr);
    const inline = fieldDescr.attribs?.inline !== false;
    const readonly = isFieldReadonly(fieldDescr);
    const important = fieldDescr.attribs?.important === true;

    const [text, setText] = useState(formatForDisplay(value ?? ""));
    const [open, setOpen] = useState(false);

    // Külső értékváltozás (betöltés, valueSource) esetén a szöveget szinkronizáljuk
    useEffect(() => {
        setText((current) => ((parseInput(current) ?? "") === (value ?? "") ? current : formatForDisplay(value ?? "")));
    }, [value]);

    const invalid = text.trim() !== "" && parseInput(text) === null;
    const selected = isoToDate(value ?? "");

    const baseClass = inline ? "flex items-center space-x-2" : "";
    const labelClass = inline ? "text-end w-1/4 leading-[0.95em]" : "";

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
                        type="text"
                        inputMode="numeric"
                        placeholder="éééé. hh. nn."
                        id={fieldKey}
                        name={fieldKey}
                        value={text}
                        aria-invalid={invalid}
                        onChange={(e) => {
                            const newText = e.target.value;
                            setText(newText);
                            if (newText.trim() === "") {
                                setValue("");
                            } else {
                                const iso = parseInput(newText);
                                if (iso) setValue(iso);
                            }
                        }}
                        onBlur={() => {
                            const iso = parseInput(text);
                            if (iso) setText(formatForDisplay(iso));
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "ArrowDown" && e.altKey) {
                                e.preventDefault();
                                setOpen(true);
                            }
                        }}
                    />
                    <InputGroupAddon align="inline-end">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <InputGroupButton size="icon-xs" aria-label="Dátum kiválasztása">
                                    <CalendarIcon />
                                </InputGroupButton>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
                                <Calendar
                                    mode="single"
                                    locale={calendarLocaleHu}
                                    captionLayout="dropdown"
                                    selected={selected}
                                    defaultMonth={selected}
                                    startMonth={new Date(1900, 0)}
                                    endMonth={new Date(new Date().getFullYear() + 10, 11)}
                                    formatters={{
                                        formatMonthDropdown: (date) => date.toLocaleString("hu", { month: "short" })
                                    }}
                                    onSelect={(date) => {
                                        const iso = date ? dateToIso(date) : "";
                                        setValue(iso);
                                        setText(formatForDisplay(iso));
                                        setOpen(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </InputGroupAddon>
                </InputGroup>
            )}
        </div>
    );
};
