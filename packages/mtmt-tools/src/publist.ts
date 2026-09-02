import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getMTMTObject } from "./mtmtfetch";
import { getPubRating, type PubItem } from "./pubitem";
import { useFormDescriptor } from "@repo/form-engine";

export type MTMTPubListResponse = {
    content: PubItem[];
    paging: { totalElements: number; totalPages: number; number: number; size: number; first: boolean; last: boolean };
};

type Listener = () => void;
type Status = "uninitialized" | "loading" | "error" | "done";
export class PubList {
    status: Status = "uninitialized";
    publications: PubItem[] = [];
    userId = "";

    private listeners: Set<Listener> = new Set();

    async loadMTMTPublications(mtid: string) {
        this.status = "loading";
        this.userId = mtid;
        this.notifyListeners();
        this.publications = [];
        try {
            let pubData: PubItem[] = [];
            let errorCounter = 0;
            let page = 1;
            while (true) {
                try {
                    const nextData = (await getMTMTObject(
                        "/api/publication",
                        `cond=published;eq;true&cond=core;eq;true&cond=authors.mtid;eq;${mtid}&sort=publishedYear,desc&size=20&labelLang=hun&page=${page}`
                    )) as MTMTPubListResponse;
                    pubData = pubData.concat(nextData.content);
                    if (!nextData.paging.last) page++;
                    else break;
                } catch (err) {
                    console.log(`${Date.now()} When loading page ${page}: `, err);
                    errorCounter++;
                    if (errorCounter < 10) await new Promise<void>((resolve) => setTimeout(() => resolve(), 250));
                    else throw "Too many errors during MTMT fetch";
                }
            }
            console.log("Data fetched from MTMT.", pubData);
            this.publications = pubData;
            this.status = "done";
            this.notifyListeners();
        } catch (err) {
            console.log(err);
            this.status = "error";
            this.notifyListeners();
            return;
        }
    }

    getPublication(mtid: string): PubItem | null {
        const pub = this.publications.find((c) => String(c.mtid) === mtid);
        return pub ?? null;
    }

    getRating(mtid: string): string | null {
        const pub = this.publications.find((c) => String(c.mtid) === mtid);
        return pub ? getPubRating(pub) : "";
    }

    getIndependentCitationCount(mtid: string): number | null {
        const pub = this.publications.find((c) => String(c.mtid) === mtid);
        return pub ? (pub.independentCitationCount ?? null) : null;
    }

    subscribe: (listener: Listener) => () => boolean = (listener) => {
        this.listeners.add(listener);
        return (): boolean => this.listeners.delete(listener);
    };

    notifyListeners(): void {
        for (const listener of this.listeners) {
            listener();
        }
    }
}

export function useMTMTPubList(): [Status, PubItem[], PubList] {
    const formDescriptor = useFormDescriptor();
    if (!formDescriptor || "mtmtPubList" in formDescriptor === false) throw new Error("useMTMTPubListStatus csak <FormProvider> alatt használható");
    const pubList = formDescriptor["mtmtPubList"] as PubList;

    const subscribe = useCallback((fn: Listener) => pubList.subscribe(fn), [pubList]);

    const getSnapshot = useMemo(() => {
        let lastStatus: Status | undefined;
        let lastPubs: PubItem[] | undefined;
        let lastPubList: PubList | undefined;
        let lastResult: [Status, PubItem[], PubList];

        return (): [Status, PubItem[], PubList] => {
            if (pubList.status !== lastStatus || pubList.publications !== lastPubs || pubList !== lastPubList) {
                lastStatus = pubList.status;
                lastPubs = pubList.publications;
                lastPubList = pubList;
                lastResult = [lastStatus, lastPubs, lastPubList];
            }
            return lastResult;
        };
    }, [pubList]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useMTMTAuthorValue(): string {
    const formDescriptor = useFormDescriptor();
    if (!formDescriptor || "mtmtPubList" in formDescriptor === false) throw new Error("useMTMTAuthorValue csak <FormProvider> alatt használható");
    const pubList = formDescriptor["mtmtPubList"] as PubList;

    const subscribe = useCallback((fn: Listener) => pubList.subscribe(fn), [pubList]);
    const getSnapshot = useCallback(() => pubList.userId, [pubList]);

    const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return value;
}
