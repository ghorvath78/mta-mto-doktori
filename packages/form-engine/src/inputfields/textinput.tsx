import { InputGroup, InputGroupInput, InputGroupAddon } from "@repo/ui";
import type { FormData } from "@/forms";
import { useAtom } from "jotai";

export const TextInput = ({
    label,
    fieldKey,
    inline = false,
    numeric = false,
    className = "",
    children,
    formData,
    twoColumn = true,
    index,
    onBlur,
    readonly = false
}: {
    label: string;
    fieldKey: string;
    inline?: boolean;
    numeric?: boolean;
    className?: string;
    children?: React.ReactNode;
    formData: FormData;
    twoColumn?: boolean;
    index: number;
    onBlur?: (value: string, setValue: (value: string) => void) => void;
    readonly?: boolean;
}) => {
    const [value, setValue] = useAtom(formData[fieldKey]);

    const baseClass = inline ? "flex items-center space-x-2" : "";
    const labelClass = inline ? "leading-[0.95em]" + (twoColumn ? " text-end w-1/4" : "") : "";

    const fieldName = `${fieldKey}-${index}`;

    return (
        <div className={`${baseClass} ${className}`}>
            <label className={`block mb-1 font-medium ${labelClass}`} htmlFor={fieldName}>
                {label}
            </label>
            {readonly && (
                <div id={fieldName} className="py-1 px-2 mb-1 flex-3">
                    {value[index]?.replaceAll("|", ", ") ?? ""}
                </div>
            )}
            {!readonly && (
                <InputGroup className="w-full border border-gray-300 rounded py-1 px-2 flex-3 h-9">
                    <InputGroupInput
                        className="h-[unset] px-0 py-0 md:text-base"
                        type={numeric ? "number" : "text"}
                        id={fieldName}
                        name={fieldName}
                        value={value[index] ?? ""}
                        readOnly={readonly}
                        onChange={(e) => {
                            const newValue = [...value];
                            newValue[index] = e.target.value;
                            setValue(newValue);
                        }}
                        onBlur={(e) => {
                            if (onBlur)
                                onBlur(e.target.value, (val) => {
                                    const newValue = [...value];
                                    newValue[index] = val;
                                    setValue(newValue);
                                });
                        }}
                    />
                    {children && <InputGroupAddon align="inline-end">{children}</InputGroupAddon>}
                </InputGroup>
            )}
        </div>
    );
};
