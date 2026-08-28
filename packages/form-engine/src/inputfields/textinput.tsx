import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "@repo/ui";
import { ExternalLink } from "lucide-react";
import type { FieldInputProps } from "@/types";
import { getFieldLabel, isFieldReadonly } from "@/utils";
import { useFieldWithValueSource } from "@/hooks";

export const TextInput = ({ fieldKey, fieldDescr }: FieldInputProps) => {
    const [value, setValue] = useFieldWithValueSource(fieldKey, fieldDescr.valueSource);
    const label = getFieldLabel(fieldDescr);
    const inline = fieldDescr.attribs?.inline !== false;
    const twoColumn = fieldDescr.attribs?.noAlign ? false : true;
    const readonly = isFieldReadonly(fieldDescr);
    const important = fieldDescr.attribs?.important === true;
    const isLinkField = fieldDescr.type === "link";
    const shortLinkLabel = fieldDescr.attribs?.short === true;

    const baseClass = inline ? "flex items-center space-x-2" : "";
    const labelClass = inline ? "leading-[0.95em]" + (twoColumn ? " text-end w-1/4" : "") : "";

    return (
        <div className={baseClass}>
            <label className={`block mb-1 font-medium ${labelClass}`} htmlFor={fieldKey}>
                {label}
            </label>
            {readonly && !isLinkField && (
                <div id={fieldKey} className="py-1 px-2 mb-1 flex-3">
                    {value?.replaceAll("|", ", ") ?? ""}
                </div>
            )}
            {readonly && isLinkField && value && (
                <a id={fieldKey} className="py-1 px-2 mb-1 flex-3 formlink" href={value} target="_blank" rel="noopener noreferrer">
                    {shortLinkLabel ? "link" : value}
                </a>
            )}
            {readonly && isLinkField && !value && <div className="py-1 px-2 mb-1 flex-3 text-gray-500 italic">Nincs megadva</div>}
            {!readonly && (
                <InputGroup className={`w-full border rounded py-1 px-2 flex-3 h-9 ${important ? "border-primary border-2" : "border-gray-300"}`}>
                    <InputGroupInput
                        className="h-[unset] px-0 py-0 md:text-base"
                        type="text"
                        id={fieldKey}
                        name={fieldKey}
                        value={value ?? ""}
                        readOnly={readonly}
                        onChange={(e) => {
                            setValue(e.target.value);
                        }}
                        onBlur={(e) => {
                            if (isLinkField && e.target.value && !e.target.value.includes("://")) {
                                setValue(`https://${e.target.value}`);
                            }
                        }}
                    />
                    {isLinkField && (
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton variant="ghost" aria-label="Info" size="icon-xs" onClick={() => window.open(value, "_blank", "noopener")}>
                                <ExternalLink />
                            </InputGroupButton>
                        </InputGroupAddon>
                    )}
                </InputGroup>
            )}
        </div>
    );
};
