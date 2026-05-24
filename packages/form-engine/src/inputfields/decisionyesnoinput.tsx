import { SimpleCombobox, SimpleComboboxContent, SimpleComboboxInput, SimpleComboboxItem, SimpleComboboxList } from "@repo/ui";
import { getFieldLabel, isFieldReadonly, resolveFieldKey, type FieldInputProps } from "../forms";
import { useAtom } from "jotai";

export const DecisionYesNoInput = ({ formData, index, fieldKey, fieldDescr }: FieldInputProps) => {
    const resolvedFieldKey = resolveFieldKey(fieldKey, fieldDescr);
    const [value, setValue] = useAtom(formData[resolvedFieldKey]);
    const label = getFieldLabel(fieldDescr);
    const readonly = isFieldReadonly(fieldDescr);
    const items = ["igen", "nem"];

    const baseClass = "flex items-center gap-x-4";
    const labelClass = "block mb-1 font-medium text-start w-1/4 leading-[0.95em] flex-1 text-primary-foreground";

    if (readonly) {
        return (
            <div className={baseClass}>
                <div className={labelClass}>{label}</div>
                <div className="py-1 px-2 flex-3">{value[index] || <span className="italic text-gray-500">Nincs megadva</span>}</div>
            </div>
        );
    }

    return (
        <div className={baseClass}>
            <div className={labelClass}>{label}</div>
            <SimpleCombobox
                items={items}
                multiple={false}
                value={value[index] ?? ""}
                onValueChange={(v: string | null) => {
                    const nextValue = v ?? "";
                    if (value[index] === nextValue) return;
                    const newValue = [...value];
                    newValue[index] = nextValue;
                    setValue(newValue);
                }}
            >
                <SimpleComboboxInput
                    placeholder="Válasszon"
                    className="bg-primary-foreground"
                    readOnly={true}
                    inputClassName="w-24 bg-transparent !font-bold !text-primary !text-base"
                />
                <SimpleComboboxContent>
                    <SimpleComboboxList>
                        <SimpleComboboxItem key={resolvedFieldKey + "-igen"} value={"igen"}>
                            igen
                        </SimpleComboboxItem>
                        <SimpleComboboxItem key={resolvedFieldKey + "-nem"} value={"nem"}>
                            nem
                        </SimpleComboboxItem>
                    </SimpleComboboxList>
                </SimpleComboboxContent>
            </SimpleCombobox>
        </div>
    );
};
