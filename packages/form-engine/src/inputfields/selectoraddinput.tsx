import {
    Combobox,
    ComboboxContent,
    ComboboxCreateNew,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger
} from "@repo/ui";
import { useFieldWithValueSource } from "..";
import type { FieldInputProps } from "@/types";
import { getFieldLabel, isFieldReadonly } from "@/utils";

export const SelectOrAddInput = ({ fieldKey, fieldDescr }: FieldInputProps) => {
    const [value, setValue] = useFieldWithValueSource(fieldKey, fieldDescr.valueSource);
    const label = getFieldLabel(fieldDescr);
    const readonly = isFieldReadonly(fieldDescr);
    const choices = (fieldDescr.attribs?.options as string[] | undefined) ?? [];
    const type = (fieldDescr.attribs?.type as string | undefined) ?? "elem";
    const addNew = fieldDescr.type === "select" ? false : fieldDescr.attribs?.addNew !== false;

    const extChoices = !choices.includes(value) && value !== "" ? [...choices, value] : choices;

    if (readonly) {
        return (
            <div className="flex items-center space-x-2 min-w-0">
                <div className="text-end w-1/4 shrink-0 font-medium leading-[0.95em]">{label}</div>
                <div className="flex flex-1 min-w-0 py-1 px-2">{value || <span className="italic text-gray-500">Nincs megadva</span>}</div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 min-w-0">
            <div className="text-end w-1/4 shrink-0 font-medium leading-[0.95em]">{label}</div>
            <SelectOrAddField
                className="flex flex-1 min-w-0"
                value={value ?? ""}
                type={type}
                choices={extChoices}
                onChange={(newValue) => {
                    setValue(newValue);
                }}
                addNew={addNew}
            />
        </div>
    );
};

export const SelectOrAddField = ({
    value,
    type,
    choices,
    onChange,
    addNew = true,
    className
}: {
    value: string;
    type: string;
    choices: string[];
    onChange: (newData: string) => void;
    addNew?: boolean;
    className?: string;
}) => {
    const handleCreateNew = (newValue: string) => {
        onChange(newValue);
    };

    const data = choices.map((choice) => ({ label: choice, value: choice }));

    return (
        <div className={className}>
            <Combobox data={data} onValueChange={(newValue: string) => onChange(newValue ?? "")} type={type} value={value}>
                <ComboboxTrigger className="w-full rounded bg-transparent border-gray-300 hover:bg-background" />
                <ComboboxContent>
                    {addNew && (
                        <>
                            <ComboboxInput />
                            <ComboboxEmpty>
                                <ComboboxCreateNew onCreateNew={handleCreateNew} />
                            </ComboboxEmpty>
                        </>
                    )}
                    <ComboboxList>
                        <ComboboxGroup>
                            {choices.map((choice) => (
                                <ComboboxItem key={choice} value={choice}>
                                    {choice}
                                </ComboboxItem>
                            ))}
                        </ComboboxGroup>
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    );
};
