import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { Button } from "@repo/ui";
import { type JSX } from "react";
import { FieldWrapper } from "./fieldwrapper";
import { getInputFieldComponent } from "./inputfieldstore";
import { useCondition } from "./conditions";
import { useFieldValue, useValueStore } from "./hooks";
import type { FieldDescriptor, GroupDescriptor } from "./types";

const GroupLabel = ({ title }: { title: string }) => {
    return <div className="font-bold italic my-2">{title}</div>;
};

export const GroupPanel = ({
    group,
    children,
    index = -1,
    noLabel = false,
    className
}: {
    group: GroupDescriptor;
    children: React.ReactNode;
    index?: number;
    noLabel?: boolean;
    className?: string;
}) => {
    const isVisible = useCondition(group, index);
    const isImportant = group.attribs?.important === true;

    return (
        <div className="formgroup" style={{ display: isVisible ? "block" : "none" }}>
            {group.label && !noLabel && <GroupLabel title={group.label} />}
            <div className={`shadow-md relative p-2 rounded-lg space-y-1 ${isImportant ? "bg-primary" : "bg-secondary"} ${className}`}>{children}</div>
        </div>
    );
};

export const GroupArrayPanel = ({ group, keyPrefix, readonly }: { group: GroupDescriptor; keyPrefix: string; source?: string; readonly?: boolean }) => {
    const store = useValueStore();
    const isVisible = useCondition(group);
    const arrayLengthSource = group.lengthSource ? group.lengthSource : `${keyPrefix}|_length`;
    const length = parseInt(useFieldValue(arrayLengthSource));

    const label: JSX.Element | null = group.label ? <GroupLabel title={group.label} /> : null;

    const groups: JSX.Element[] = [];
    for (let i = 0; i < length; i++) {
        const groupKeyPrefix = `${keyPrefix}[[${i}]]`;
        groups.push(
            <GroupPanel key={`${group.key}-${i}`} group={group} index={i} className="pb-1" noLabel={true}>
                <div className="space-y-1">
                    <Group group={group} keyPrefix={groupKeyPrefix} index={i} key={`${group.key}-${i}-comp`} readonly={readonly} />
                    <div className="absolute top-0 left-0 flex flex-col translate-x-[-100%]">
                        {!readonly && length > (group.arrayMin ?? 0) && (
                            <Button
                                className="has-[>svg]:px-1 mr-1"
                                variant="ghost"
                                size="sm"
                                title="Blokk törlése"
                                onClick={() => store.deleteFromFormArray(group, keyPrefix, i)}
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
                                onClick={() => store.moveUpInFormArray(group, keyPrefix, i)}
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
                                onClick={() => store.moveDownInFormArray(group, keyPrefix, i)}
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
                    <Button variant="outline" onClick={() => store.appendToFormArray(group, keyPrefix)} className="ml-auto w-64">
                        <Plus /> {group.arrayAddLabel ?? "Új blokk hozzáadása"}
                    </Button>
                </div>
            )}
        </div>
    );
};

export const Group = ({
    group,
    keyPrefix,
    index = -1,
    readonly = false
}: {
    group: GroupDescriptor;
    keyPrefix: string;
    index?: number;
    readonly?: boolean;
}) => {
    const components: JSX.Element[] = [];
    for (const field of group.fields) {
        const key = `${keyPrefix}|${field.key}`;
        const fieldDescr: FieldDescriptor = readonly && field.readonly === undefined ? { ...field, readonly: true } : field;
        const inputProps = { fieldKey: key, fieldDescr };
        const InputField = getInputFieldComponent(fieldDescr.type);
        const component = InputField ? <InputField {...inputProps} /> : null;
        if (component) {
            components.push(
                <FieldWrapper fieldDescriptor={field} groupIndex={index} key={key}>
                    {component}
                </FieldWrapper>
            );
        }
    }
    return <>{components}</>;
};
