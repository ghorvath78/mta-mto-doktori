import { useState } from "react";
import { Page } from "./page";
import { atom, useAtomValue } from "jotai";
import { useFormDescriptor } from "./hooks";
import type { PageDescriptor } from "./types";
import { getPageLabel } from "./types";

declare const BUILD_DATE: string;

const trueAtom = atom(true);

export const FormPanel = () => {
    const formDescriptor = useFormDescriptor();
    const { name: formName, pages } = formDescriptor;
    const [activePage, setActivePage] = useState(pages ? pages[0]?.key : "");
    const activePageDescriptor = pages.find((page) => page.key === activePage);

    return (
        <main className="flex-3 min-w-0 p-4 relative max-w-[1200px] mx-auto w-full">
            <div className="flex w-full pt-4 min-h-0 max-h-[100%]">
                <PageSelector activePage={activePage} setActivePage={setActivePage} pages={pages} />
                <div className="w-[1px] bg-primary" />
                <div className="flex-3 flex min-h-0 min-w-0 overflow-y-auto overflow-x-hidden relative">
                    {activePageDescriptor && <Page descriptor={activePageDescriptor} keyPrefix={`${formName}|${activePageDescriptor.key}`} />}
                </div>
            </div>
            <div className="fixed bottom-1 left-1 text-xs text-muted-foreground">v{BUILD_DATE}</div>
        </main>
    );
};

const PageSelectorItem = ({ page, active, setActivePage }: { page: PageDescriptor; active: boolean; setActivePage: (pageKey: string) => void }) => {
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
        <li key={page.key} className={`p-2 rounded cursor-pointer ${active ? activeStyle : normalStyle}`} onClick={() => enabled && setActivePage(page.key)}>
            {getPageLabel(page)}
        </li>
    );
};

export const PageSelector = ({ activePage, setActivePage, pages }: { activePage: string; setActivePage: (Page: string) => void; pages: PageDescriptor[] }) => {
    return (
        <nav className="w-1/4 border-r pr-4">
            <ul className="space-y-2">
                {pages.map((page) => (
                    <PageSelectorItem key={page.key} page={page} active={activePage === page.key} setActivePage={setActivePage} />
                ))}
            </ul>
        </nav>
    );
};
