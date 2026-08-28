import { useFieldWithValueSource } from "@/hooks";
import type { FieldInputProps } from "@/types";
import { getFieldLabel, isFieldReadonly } from "@/utils";
import { SimpleCombobox, SimpleComboboxContent, SimpleComboboxInput, SimpleComboboxItem, SimpleComboboxList } from "@repo/ui";

export const DecisionYesNoInput = ({ fieldKey, fieldDescr }: FieldInputProps) => {
    const [value, setValue] = useFieldWithValueSource(fieldKey, fieldDescr.valueSource);
    const label = getFieldLabel(fieldDescr);
    const readonly = isFieldReadonly(fieldDescr);
    const items = ["igen", "nem"];

    const baseClass = "flex items-center gap-x-4";
    const labelClass = "block mb-1 font-medium text-start w-1/4 leading-[0.95em] flex-1 text-primary-foreground";

    if (readonly) {
        return (
            <div className={baseClass}>
                <div className={labelClass}>{label}</div>
                <div className="py-1 px-2 flex-3">{value || <span className="italic text-gray-500">Nincs megadva</span>}</div>
            </div>
        );
    }

    return (
        <div className={baseClass}>
            <div className={labelClass}>{label}</div>
            <SimpleCombobox
                items={items}
                multiple={false}
                value={value ?? ""}
                onValueChange={(v: string | null) => {
                    const nextValue = v ?? "";
                    if (value === nextValue) return;
                    setValue(nextValue);
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
                        <SimpleComboboxItem key={fieldKey + "-igen"} value={"igen"}>
                            igen
                        </SimpleComboboxItem>
                        <SimpleComboboxItem key={fieldKey + "-nem"} value={"nem"}>
                            nem
                        </SimpleComboboxItem>
                    </SimpleComboboxList>
                </SimpleComboboxContent>
            </SimpleCombobox>
        </div>
    );
};
