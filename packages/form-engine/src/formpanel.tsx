import { useState } from "react";
import type { FormData, FormDescriptor, PageDescriptor } from "./forms";
import { Page } from "./page";
import { atom, useAtomValue } from "jotai";

declare const BUILD_DATE: string;

const trueAtom = atom(true);

export const FormPanel = ({ formName, descriptor, formData }: { formName: string; descriptor: FormDescriptor; formData: FormData }) => {
    const [activePage, setActivePage] = useState(descriptor ? Object.keys(descriptor)[0] : "");

    return (
        <main className="flex-3 p-4 relative max-w-[1200px] mx-auto w-full">
            <div className="flex w-full pt-4 min-h-0 max-h-[100%]">
                <PageSelector activePage={activePage} setActivePage={setActivePage} pages={descriptor} />
                <div className="w-[1px] bg-primary" />
                <div className="flex-3 flex min-h-0 overflow-y-auto overflow-x-hidden relative">
                    <Page descriptor={descriptor[activePage]} formData={formData} keyPrefix={`${formName}|${descriptor[activePage].key}`} />
                </div>
            </div>
            <div className="fixed bottom-1 left-1 text-xs text-muted-foreground">v{BUILD_DATE}</div>
        </main>
    );
};

const PageSelectorItem = ({
    pageKey,
    page,
    active,
    setActivePage
}: {
    pageKey: string;
    page: PageDescriptor;
    active: boolean;
    setActivePage: (pageKey: string) => void;
}) => {
    const enabled = useAtomValue(page?.enabledAtom ?? trueAtom);

    let normalStyle = "hover:bg-secondary hover:text-secondary-foreground";
    let activeStyle = "bg-primary text-primary-foreground";
    if (page.attribs && page.attribs.style === "primary") {
        normalStyle = "hover:bg-primary hover:text-primary-foreground border border-primary bg-white";
        activeStyle = "bg-primary text-primary-foreground border border-primary";
    }
    if (!enabled) {
        normalStyle = "cursor-not-allowed opacity-50";
        activeStyle = "cursor-not-allowed opacity-50";
    }
    return (
        <li key={pageKey} className={`p-2 rounded cursor-pointer ${active ? activeStyle : normalStyle}`} onClick={() => enabled && setActivePage(pageKey)}>
            {pageKey}
        </li>
    );
};

export const PageSelector = ({ activePage, setActivePage, pages }: { activePage: string; setActivePage: (Page: string) => void; pages: FormDescriptor }) => {
    return (
        <nav className="w-1/4 border-r pr-4">
            <ul className="space-y-2">
                {Object.entries(pages).map(([pageKey, page]) => (
                    <PageSelectorItem key={pageKey} pageKey={pageKey} page={page} active={activePage === pageKey} setActivePage={setActivePage} />
                ))}
            </ul>
        </nav>
    );
};
