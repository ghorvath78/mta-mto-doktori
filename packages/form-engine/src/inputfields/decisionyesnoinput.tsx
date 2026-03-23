import { SimpleCombobox, SimpleComboboxContent, SimpleComboboxInput, SimpleComboboxItem, SimpleComboboxList } from "@repo/ui";
import type { FormData } from "@/forms";
import { useAtom } from "jotai";

export const DecisionYesNoInput = ({
    label,
    fieldKey,
    className = "",
    formData,
    index,
    onChange
}: {
    label: string;
    fieldKey: string;
    className?: string;
    formData: FormData;
    index: number;
    onChange?: (value: string) => void;
}) => {
    const [value, setValue] = useAtom(formData[fieldKey]);
    const items = ["igen", "nem"];

    const baseClass = "flex items-center gap-x-4";
    const labelClass = "block mb-1 font-medium text-start w-1/4 leading-[0.95em] flex-1 text-primary-foreground";
    return (
        <div className={`${baseClass} ${className}`}>
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
                    onChange?.(nextValue);
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
