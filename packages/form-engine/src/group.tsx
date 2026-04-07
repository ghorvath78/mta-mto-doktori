import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash } from "lucide-react";
import { Button } from "@repo/ui";
import { type JSX } from "react";
import { appendToFormArray, deleteFromFormArray, moveDownInFormArray, moveUpInFormArray, type FormData, type GroupDescriptor } from "./forms";
import { atom, useAtomValue } from "jotai";
import { store } from "./atoms";
import { InputGroupButton } from "@repo/ui";
import { FieldWrapper } from "./fieldwrapper";
import { BirthDataInput } from "./inputfields/birthdatainput";
import { LongTextInput } from "./inputfields/longtextinput";
import { MTMTCitationInput } from "./inputfields/mtmtcitationinput";
import { MTMTPubInput } from "./inputfields/mtmtpubinput";
import { MTMTUserInput } from "./inputfields/mtmtuserinput";
import { NumberInput } from "./inputfields/numberinput";
import { SelectOrAddInput } from "./inputfields/selectoraddinput";
import { TextInput } from "./inputfields/textinput";
import { YearInput } from "./inputfields/yearinput";
import { YearRangeInput } from "./inputfields/yearrangeinput";
import { MTMTScientometrics } from "./inputfields/mtmtscientometrics";
import { DecisionYesNoInput } from "./inputfields/decisionyesnoinput";
import { DecisionTextInput } from "./inputfields/decisiontext";
import { LinkDataDisplay } from "./inputfields/linkdatadisplay";

const GroupLabel = ({ title }: { title: string }) => {
    return <div className="font-bold italic my-2">{title}</div>;
};

const oneAtom = atom(["1"]);

export const GroupPanel = ({
    group,
    formData,
    children,
    noLabel = false,
    className
}: {
    group: GroupDescriptor;
    formData: FormData;
    children: React.ReactNode;
    noLabel?: boolean;
    className?: string;
}) => {
    const conditionValue = useAtomValue(group.conditionKey ? formData[group.conditionKey] : oneAtom);
    const isVisible = !group.conditionKey || (conditionValue && parseInt(conditionValue[0]) >= parseInt(group.conditionValue ?? "0"));
    const isImportant = group.attribs?.important === true;

    return (
        <div className="formgroup" style={{ display: isVisible ? "block" : "none" }}>
            {group.label && !noLabel && <GroupLabel title={group.label} />}
            <div className={`shadow-md relative p-2 rounded-lg space-y-1 ${isImportant ? "bg-primary" : "bg-secondary"} ${className}`}>{children}</div>
        </div>
    );
};

export const GroupArrayPanel = ({
    Component,
    group,
    formData,
    keyPrefix,
    readonly
}: {
    Component: React.FC<{ group: typeof group; formData: typeof formData; keyPrefix: string; index: number; readonly?: boolean; attribs?: any }>;
    group: GroupDescriptor;
    formData: FormData;
    keyPrefix: string;
    source?: string;
    readonly?: boolean;
}) => {
    const conditionValue = useAtomValue(group.conditionKey ? formData[group.conditionKey] : oneAtom);
    const isVisible = !group.conditionKey || (conditionValue && parseInt(conditionValue[0]) >= parseInt(group.conditionValue ?? "0"));
    const arrayLength = useAtomValue(group.lengthSource ? formData[group.lengthSource] : (formData[`${keyPrefix}|_length`] ?? oneAtom));
    const length = parseInt(arrayLength[0]);

    const label: JSX.Element | null = group.label ? <GroupLabel title={group.label} /> : null;

    const groups: JSX.Element[] = [];
    for (let i = 0; i < length; i++) {
        groups.push(
            <GroupPanel key={`${group.key}-${i}`} group={group} formData={formData} className="pb-1" noLabel={true}>
                <div className="space-y-1">
                    <Component
                        group={group}
                        formData={formData}
                        keyPrefix={keyPrefix}
                        index={i}
                        key={`${group.key}-${i}-comp`}
                        readonly={readonly}
                        attribs={group.attribs}
                    />
                    <div className="absolute top-0 left-0 flex flex-col translate-x-[-100%]">
                        {!readonly && length > (group.arrayMin ?? 0) && (
                            <Button
                                className="has-[>svg]:px-1 mr-1"
                                variant="ghost"
                                size="sm"
                                title="Blokk törlése"
                                onClick={() => deleteFromFormArray(group, formData, keyPrefix, i)}
                            >
                                <Trash />
                            </Button>
                        )}
                        {!readonly && i > 0 && (
                            <Button
                                className="has-[>svg]:px-1 mr-1"
                                variant="ghost"
                                size="sm"
                                title="Blokk feljebb mozgatása"
                                onClick={() => moveUpInFormArray(group, formData, keyPrefix, i)}
                            >
                                <ArrowUp />
                            </Button>
                        )}
                        {!readonly && i < length - 1 && (
                            <Button
                                className="has-[>svg]:px-1 mr-1"
                                variant="ghost"
                                size="sm"
                                title="Blokk lejjebb mozgatása"
                                onClick={() => moveDownInFormArray(group, formData, keyPrefix, i)}
                            >
                                <ArrowDown />
                            </Button>
                        )}
                    </div>
                </div>
            </GroupPanel>
        );
    }

    return (
        <div style={{ display: isVisible ? "block" : "none" }}>
            {label && <div className="space-y-2 mb-1">{label}</div>}
            <div className="space-y-2 mb-1">{groups.length > 0 ? groups : <div className="italic text-muted-foreground">Nincs megjeleníthető blokk.</div>}</div>
            {!readonly && groups.length < (group.arrayMax ?? Infinity) && (
                <div className="flex mb-1">
                    <Button variant="outline" onClick={() => appendToFormArray(group, formData, keyPrefix)} className="ml-auto w-64">
                        <Plus /> {group.arrayAddLabel ?? "Új blokk hozzáadása"}
                    </Button>
                </div>
            )}
        </div>
    );
};

export const Group = ({
    group,
    formData,
    keyPrefix,
    index,
    readonly = false
}: {
    group: GroupDescriptor;
    formData: FormData;
    keyPrefix: string;
    index: number;
    readonly?: boolean;
}) => {
    const components: JSX.Element[] = [];
    for (const field of group.fields) {
        const key = `${keyPrefix}|${field.key}`;
        let component: JSX.Element | null = null;
        const fieldReadonly = field.readonly === true; // || readonly;
        switch (field.type) {
            case "text":
                component = (
                    <TextInput
                        inline={!field.attribs || field.attribs["inline"] !== false}
                        label={field.label ?? field.key}
                        fieldKey={field.valueSource ?? key}
                        key={key}
                        formData={formData}
                        index={index}
                        readonly={fieldReadonly}
                        twoColumn={field.attribs?.noAlign ? false : true}
                        important={field.attribs?.important === true}
                    ></TextInput>
                );
                break;
            case "birthYearPlace":
                component = <BirthDataInput fieldKey={field.valueSource ?? key} key={key} formData={formData} index={index} readonly={readonly} />;
                break;
            case "longtext":
                component = (
                    <LongTextInput
                        inline={false}
                        lines={(field.attribs?.["rows"] as number | undefined) ?? undefined}
                        characters={(field.attribs?.["maxLength"] as number | undefined) ?? undefined}
                        label={field.label ?? field.key}
                        fieldKey={field.valueSource ?? key}
                        key={key}
                        formData={formData}
                        index={index}
                        readonly={fieldReadonly}
                    />
                );
                break;
            case "selectAddOther":
                component = (
                    <SelectOrAddInput
                        label={field.label ?? field.key}
                        fieldKey={key}
                        key={key}
                        formData={formData}
                        choices={(field.attribs?.["options"] as string[] | undefined) ?? []}
                        type={(field.attribs?.["type"] as string | undefined) ?? "elem"}
                        index={index}
                    />
                );
                break;
            case "select":
                component = (
                    <SelectOrAddInput
                        label={field.label ?? field.key}
                        fieldKey={key}
                        key={key}
                        formData={formData}
                        addNew={false}
                        choices={(field.attribs?.["options"] as string[] | undefined) ?? []}
                        type={(field.attribs?.["type"] as string | undefined) ?? "elem"}
                        index={index}
                    />
                );
                break;
            case "number":
                component = (
                    <NumberInput
                        inline={!field.attribs || field.attribs["inline"] !== false}
                        label={field.label ?? field.key}
                        fieldKey={field.valueSource ?? key}
                        key={key}
                        formData={formData}
                        index={index}
                        readonly={fieldReadonly}
                        fractional={field.attribs?.["fractional"] === true}
                        twoColumn={field.attribs?.noAlign ? false : true}
                        important={field.attribs?.important === true}
                    />
                );
                break;
            case "year":
                component = (
                    <YearInput
                        inline={!field.attribs || field.attribs["inline"] !== false}
                        label={field.label ?? field.key}
                        fieldKey={field.valueSource ?? key}
                        key={key}
                        formData={formData}
                        index={index}
                        readonly={fieldReadonly}
                    />
                );
                break;
            case "mtmtUser":
                component = (
                    <MTMTUserInput
                        label={field.label ?? field.key}
                        fieldKey={field.valueSource ?? key}
                        formData={formData}
                        index={index}
                        readonly={fieldReadonly}
                        onMTMTIdChange={field.attribs?.onMTMTIdChange}
                    />
                );
                break;
            case "mtmtPub":
                component = (
                    <MTMTPubInput
                        label={field.label ?? field.key}
                        fieldKey={field.valueSource ?? key}
                        formData={formData}
                        index={index}
                        attribs={field.attribs}
                        readonly={fieldReadonly}
                    />
                );
                break;
            case "mtmtCitation":
                component = (
                    <MTMTCitationInput
                        label={field.label ?? field.key}
                        fieldKey={field.valueSource ?? key}
                        formData={formData}
                        index={index}
                        attribs={field.attribs}
                        readonly={fieldReadonly}
                    />
                );
                break;
            case "mtmtTable":
                component = <MTMTScientometrics fieldKey={field.valueSource ?? key} formData={formData} />;
                break;
            case "link":
                component = fieldReadonly ? (
                    <LinkDataDisplay
                        label={field.label ?? field.key}
                        fieldKey={field.valueSource ?? key}
                        key={key}
                        formData={formData}
                        index={index}
                        twoColumn={field.attribs?.noAlign ? false : true}
                        short={field.attribs?.short === true}
                    />
                ) : (
                    <TextInput
                        label={field.label ?? field.key}
                        fieldKey={field.valueSource ?? key}
                        key={key}
                        formData={formData}
                        inline={!field.attribs || field.attribs?.["inline"] === "true"}
                        index={index}
                        onBlur={(value, setValue) => {
                            if (value && !value.includes("://")) {
                                setValue("https://" + value);
                            }
                        }}
                    >
                        <InputGroupButton
                            variant="ghost"
                            aria-label="Info"
                            size="icon-xs"
                            onClick={() => window.open(store.get(formData[field.valueSource ?? key])[index], "_blank", "noopener")}
                        >
                            <ExternalLink />
                        </InputGroupButton>
                    </TextInput>
                );
                break;
            case "yearRange":
                component = <YearRangeInput label={field.label ?? field.key} key={key} formData={formData} fieldKey={field.valueSource ?? key} index={index} />;
                break;
            case "decisionYesNo":
                component = (
                    <DecisionYesNoInput label={field.label ?? field.key} key={key} formData={formData} fieldKey={field.valueSource ?? key} index={index} />
                );
                break;
            case "decisionText":
                component = (
                    <DecisionTextInput
                        label={field.label ?? field.key}
                        key={key}
                        formData={formData}
                        fieldKey={field.valueSource ?? key}
                        index={index}
                        lines={(field.attribs?.["rows"] as number | undefined) ?? undefined}
                        characters={(field.attribs?.["maxLength"] as number | undefined) ?? undefined}
                        readonly={readonly || field.readonly}
                    />
                );
                break;
            case "custom":
                if (field.customComponent) {
                    component = <field.customComponent field={field} formData={formData} keyPrefix={key} index={index} />;
                }
                break;
            default:
                component = null;
        }
        if (component) {
            components.push(
                <FieldWrapper fieldDescriptor={field} formData={formData} key={key} index={index}>
                    {component}
                </FieldWrapper>
            );
        }
    }
    return <>{components}</>;
};
