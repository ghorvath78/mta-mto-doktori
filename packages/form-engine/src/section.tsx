import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@repo/ui";
import { type PrimitiveAtom, useAtom, useSetAtom, useAtomValue, atom } from "jotai";
import { ChevronRight } from "lucide-react";
import { infoSectionAtom } from "./atoms";
import { Button } from "@repo/ui";
import type { AttribType, FormData, SectionDescriptor } from "./forms";
import { Group, GroupPanel, GroupArrayPanel } from "./group";
import { Fragment } from "react/jsx-runtime";
import { TabularList } from "./inputfields/tabularlist";

const trueConditionAtom = atom(["true"]);

export const Section = ({ section, formData, keyPrefix }: { section: SectionDescriptor; formData: FormData; keyPrefix: string }) => {
    const conditionValue = useAtomValue(section.conditionKey ? formData[section.conditionKey] : trueConditionAtom);
    const isVisible = !section.conditionKey || (conditionValue && conditionValue[0] === (section.conditionValue ?? "true"));
    const openAtom = formData[`${keyPrefix}|_open`];

    return (
        <SectionCollapsible
            title={section.label ?? section.key}
            style={{ display: isVisible ? "block" : "none" }}
            openAtom={openAtom}
            helpText={section.helpText}
            attribs={section.attribs}
        >
            {section.groups.map((group, ix) => {
                const groupKeyPrefix = `${keyPrefix}|${group.key}`;
                return (
                    <Fragment key={ix}>
                        {!group.isArray && (
                            <GroupPanel group={group} formData={formData}>
                                {group.customComponent ? (
                                    <group.customComponent group={group} formData={formData} keyPrefix={groupKeyPrefix} index={0} />
                                ) : (
                                    <Group
                                        group={group}
                                        formData={formData}
                                        keyPrefix={group.valueSource ?? groupKeyPrefix}
                                        index={0}
                                        readonly={group.readonly}
                                    />
                                )}
                            </GroupPanel>
                        )}
                        {group.isArray && !group.customComponent && !(group.attribs?.printTabular && group.readonly) && (
                            <GroupArrayPanel
                                group={group}
                                formData={formData}
                                keyPrefix={group.valueSource ?? groupKeyPrefix}
                                Component={Group}
                                readonly={group.readonly}
                            />
                        )}
                        {group.isArray && group.customComponent && (
                            <GroupPanel group={group} formData={formData}>
                                <group.customComponent group={group} formData={formData} keyPrefix={groupKeyPrefix} index={0} />
                            </GroupPanel>
                        )}
                        {group.isArray && !group.customComponent && group.attribs?.printTabular && group.readonly && (
                            <GroupPanel group={group} formData={formData}>
                                <TabularList group={group} formData={formData} keyPrefix={groupKeyPrefix} index={0} />
                            </GroupPanel>
                        )}
                    </Fragment>
                );
            })}
        </SectionCollapsible>
    );
};

const SectionCollapsible = ({
    title,
    children,
    style,
    helpText,
    openAtom,
    attribs
}: {
    title: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
    helpText?: string;
    openAtom: PrimitiveAtom<string[]>;
    attribs?: AttribType;
}) => {
    const [open, setOpen] = useAtom(openAtom);
    const setInfoSection = useSetAtom(infoSectionAtom);

    const isAlwaysOpen = attribs?.alwaysOpen === true;
    const isImportant = attribs?.important === true;

    return (
        <>
            <Collapsible
                open={isAlwaysOpen || open[0] === "true"}
                onOpenChange={(val) => setOpen([val ? "true" : "false"])}
                className="w-full"
                style={style}
                onMouseEnter={() => {
                    setInfoSection(helpText ?? "");
                }}
                onMouseLeave={() => {
                    setInfoSection("");
                }}
            >
                <CollapsibleTrigger asChild className="w-full">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start items-start flex-nowrap text-left text-lg h-auto py-1"
                        onClick={() => setOpen([!open[0] ? "true" : "false"])}
                    >
                        {!isAlwaysOpen && (
                            <ChevronRight className={`transition-transform ${open[0] === "true" ? "rotate-90" : ""} self-start flex-shrink-0 m-auto`} />
                        )}
                        <span className={`flex-1 min-w-0 whitespace-normal break-words text-left leading-[0.95em] py-1 ${isImportant ? "text-primary" : ""}`}>
                            {title}
                        </span>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="my-1 ml-8 mr-2">{children}</CollapsibleContent>
            </Collapsible>
        </>
    );
};
