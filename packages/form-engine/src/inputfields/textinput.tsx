import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "@repo/ui";
import { getFieldLabel, isFieldReadonly, resolveFieldKey, type FieldInputProps } from "../forms";
import { store } from "../atoms";
import { atom, useAtom } from "jotai";
import { ExternalLink } from "lucide-react";

const emptyValueAtom = atom<string[]>([]);

export const TextInput = ({ formData, index, fieldKey, fieldDescr }: FieldInputProps) => {
    const resolvedFieldKey = resolveFieldKey(fieldKey, fieldDescr);
    const [value, setValue] = useAtom(formData[resolvedFieldKey] ?? emptyValueAtom);
    const label = getFieldLabel(fieldDescr);
    const inline = fieldDescr.attribs?.inline !== false;
    const twoColumn = fieldDescr.attribs?.noAlign ? false : true;
    const readonly = isFieldReadonly(fieldDescr);
    const important = fieldDescr.attribs?.important === true;
    const isLinkField = fieldDescr.type === "link";
    const shortLinkLabel = fieldDescr.attribs?.short === true;

    const baseClass = inline ? "flex items-center space-x-2" : "";
    const labelClass = inline ? "leading-[0.95em]" + (twoColumn ? " text-end w-1/4" : "") : "";

    const fieldName = `${resolvedFieldKey}-${index}`;

    const setIndexedValue = (nextValue: string) => {
        const newValue = [...value];
        newValue[index] = nextValue;
        setValue(newValue);
    };

    return (
        <div className={baseClass}>
            <label className={`block mb-1 font-medium ${labelClass}`} htmlFor={fieldName}>
                {label}
            </label>
            {readonly && !isLinkField && (
                <div id={fieldName} className="py-1 px-2 mb-1 flex-3">
                    {value[index]?.replaceAll("|", ", ") ?? ""}
                </div>
            )}
            {readonly && isLinkField && value[index] && (
                <a id={fieldName} className="py-1 px-2 mb-1 flex-3 formlink" href={value[index]} target="_blank" rel="noopener noreferrer">
                    {shortLinkLabel ? "link" : value[index]}
                </a>
            )}
            {readonly && isLinkField && !value[index] && <div className="py-1 px-2 mb-1 flex-3 text-gray-500 italic">Nincs megadva</div>}
            {!readonly && (
                <InputGroup className={`w-full border rounded py-1 px-2 flex-3 h-9 ${important ? "border-primary border-2" : "border-gray-300"}`}>
                    <InputGroupInput
                        className="h-[unset] px-0 py-0 md:text-base"
                        type="text"
                        id={fieldName}
                        name={fieldName}
                        value={value[index] ?? ""}
                        readOnly={readonly}
                        onChange={(e) => {
                            setIndexedValue(e.target.value);
                        }}
                        onBlur={(e) => {
                            if (isLinkField && e.target.value && !e.target.value.includes("://")) {
                                setIndexedValue(`https://${e.target.value}`);
                            }
                        }}
                    />
                    {isLinkField && (
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                variant="ghost"
                                aria-label="Info"
                                size="icon-xs"
                                onClick={() => window.open(store.get(formData[resolvedFieldKey])[index], "_blank", "noopener")}
                            >
                                <ExternalLink />
                            </InputGroupButton>
                        </InputGroupAddon>
                    )}
                </InputGroup>
            )}
        </div>
    );
};
