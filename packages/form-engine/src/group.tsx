import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { Button } from "@repo/ui";
import { type JSX } from "react";
import {
    appendToFormArray,
    deleteFromFormArray,
    moveDownInFormArray,
    moveUpInFormArray,
    type FieldDescriptor,
    type FormData,
    type GroupDescriptor
} from "./forms";
import { atom, useAtomValue } from "jotai";
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
        const fieldDescr: FieldDescriptor = readonly && field.readonly !== true ? { ...field, readonly: true } : field;
        const inputProps = { formData, fieldKey: key, index, fieldDescr };
        switch (field.type) {
            case "text":
                component = <TextInput {...inputProps} />;
                break;
            case "birthYearPlace":
                component = <BirthDataInput {...inputProps} />;
                break;
            case "longtext":
                component = <LongTextInput {...inputProps} />;
                break;
            case "selectAddOther":
                component = <SelectOrAddInput {...inputProps} />;
                break;
            case "select":
                component = <SelectOrAddInput {...inputProps} />;
                break;
            case "number":
                component = <NumberInput {...inputProps} />;
                break;
            case "year":
                component = <YearInput {...inputProps} />;
                break;
            case "mtmtUser":
                component = <MTMTUserInput {...inputProps} />;
                break;
            case "mtmtPub":
                component = <MTMTPubInput {...inputProps} />;
                break;
            case "mtmtCitation":
                component = <MTMTCitationInput {...inputProps} />;
                break;
            case "mtmtTable":
                component = <MTMTScientometrics {...inputProps} />;
                break;
            case "link":
                component = <TextInput {...inputProps} />;
                break;
            case "yearRange":
                component = <YearRangeInput {...inputProps} />;
                break;
            case "decisionYesNo":
                component = <DecisionYesNoInput {...inputProps} />;
                break;
            case "decisionText":
                component = <DecisionTextInput {...inputProps} />;
                break;
            case "custom":
                if (field.customComponent) {
                    component = <field.customComponent {...inputProps} />;
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
