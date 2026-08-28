import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@repo/ui";
import { ChevronRight } from "lucide-react";
import { Button } from "@repo/ui";
import { Group, GroupPanel, GroupArrayPanel } from "./group";
import { Fragment } from "react/jsx-runtime";
import { TabularList } from "./inputfields/tabularlist";
import { useCollapsibleState } from "./collapsiblestate";
import { useSetInfoState } from "./infostate";
import type { SectionDescriptor } from "./types";
import { useCondition } from "./conditions";

export const Section = ({ section, keyPrefix }: { section: SectionDescriptor; keyPrefix: string }) => {
    const isVisible = useCondition(section);

    return (
        <SectionCollapsible
            title={section.label ?? section.key}
            style={{ display: isVisible ? "block" : "none" }}
            keyPrefix={keyPrefix}
            helpText={section.helpText}
            attribs={section.attribs}
        >
            {section.groups.map((group, ix) => {
                const groupKeyPrefix = `${keyPrefix}|${group.key}`;
                return (
                    <Fragment key={ix}>
                        {group.customComponent && (
                            <GroupPanel group={group}>
                                <group.customComponent group={group} keyPrefix={groupKeyPrefix} index={0} />
                            </GroupPanel>
                        )}
                        {!group.customComponent && !group.isArray && (
                            <GroupPanel group={group}>
                                <Group group={group} keyPrefix={group.valueSource ?? groupKeyPrefix} readonly={group.readonly} />
                            </GroupPanel>
                        )}
                        {!group.customComponent && group.isArray && !(group.attribs?.printTabular && group.readonly) && (
                            <GroupArrayPanel group={group} keyPrefix={group.valueSource ?? groupKeyPrefix} readonly={group.readonly} />
                        )}
                        {!group.customComponent && group.isArray && group.attribs?.printTabular && group.readonly && (
                            <GroupPanel group={group}>
                                <TabularList group={group} keyPrefix={groupKeyPrefix} index={0} />
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
    keyPrefix,
    attribs
}: {
    title: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
    helpText?: string;
    keyPrefix: string;
    attribs?: any;
}) => {
    const [open, setOpen] = useCollapsibleState(`${keyPrefix}-open`);
    const setInfoSection = useSetInfoState();

    const isAlwaysOpen = attribs?.alwaysOpen === true;
    const isImportant = attribs?.important === true;

    return (
        <>
            <Collapsible
                open={isAlwaysOpen || open}
                onOpenChange={(val) => setOpen(val)}
                className="w-full"
                style={style}
                onMouseEnter={() => {
                    setInfoSection({ section: helpText ?? "" });
                }}
                onMouseLeave={() => {
                    setInfoSection({ section: "" });
                }}
            >
                <CollapsibleTrigger asChild className="w-full">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start items-start flex-nowrap text-left text-lg h-auto py-1"
                        onClick={() => setOpen(!open)}
                    >
                        {!isAlwaysOpen && <ChevronRight className={`transition-transform ${open ? "rotate-90" : ""} self-start flex-shrink-0 m-auto`} />}
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
