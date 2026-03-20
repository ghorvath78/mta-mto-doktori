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
import type { FormData } from "@/forms";
import { useAtom } from "jotai";

export const SelectOrAddInput = ({
    label,
    choices,
    type,
    addNew = true,
    fieldKey,
    formData,
    index
}: {
    label: string;
    type: string;
    addNew?: boolean;
    choices: string[];
    fieldKey: string;
    formData: FormData;
    index: number;
}) => {
    const [value, setValue] = useAtom(formData[fieldKey]);

    const extChoices = !choices.includes(value[index]) && value[index] !== "" ? [...choices, value[index]] : choices;

    return (
        <div className="flex items-center space-x-2">
            <div className="text-end w-1/4 font-medium leading-[0.95em]">{label}</div>
            <SelectOrAddField
                className="flex flex-grow"
                value={value[index] ?? ""}
                type={type}
                choices={extChoices}
                onChange={(newValue) => {
                    const newValues = [...value];
                    newValues[index] = newValue;
                    setValue(newValues);
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
        <Combobox data={data} onValueChange={(newValue: string) => onChange(newValue ?? "")} type={type} value={value}>
            <ComboboxTrigger className={`${className} rounded bg-transparent border-gray-300 hover:bg-background`} />
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
    );
};
