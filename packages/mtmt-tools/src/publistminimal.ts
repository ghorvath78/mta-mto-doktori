import { useFormInfo } from "@repo/form-engine/hooks";
import { getCachedCitations } from "./citations";
import { getPubRating, type PubItem } from "./pubitem";
import type { PubList } from "./publist";
import { useCallback, useSyncExternalStore } from "react";

export type PubItemMinimal = {
    template: string;
    rating: string;
    independentCitationCount?: number;
};

export const getPubItemMinimal = (mtmtPub: PubItem): PubItemMinimal => {
    return {
        template: mtmtPub.template,
        rating: getPubRating(mtmtPub),
        independentCitationCount: mtmtPub.independentCitationCount ?? undefined
    };
};

type Listener = () => void;
export class PubListMinimal {
    private listeners: Set<Listener> = new Set();
    publications: { [mtid: string]: PubItemMinimal } = {};

    isInList(mtid: string): boolean {
        return this.publications.hasOwnProperty(mtid);
    }

    getPublication(mtid: string): PubItemMinimal | null {
        return this.publications[mtid] ?? null;
    }

    load(summaries: Record<string, PubItemMinimal>): void {
        this.publications = { ...summaries };
        this.notifyListeners();
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

export const savePubListMinimal = (mtids: string[], pubList: PubList): Record<string, PubItemMinimal> => {
    const citationCache = getCachedCitations();
    const summary = mtids
        .map((id) => {
            // search in publication list
            const pub = pubList.getPublication(id);
            if (pub) {
                return [id, getPubItemMinimal(pub)] as [string, PubItemMinimal];
            }
            // search in citation cache
            for (const cachedCitations of Object.values(citationCache)) {
                const cite = cachedCitations.find((c) => String(c.mtid) === id);
                if (cite) {
                    return [id, getPubItemMinimal(cite)] as [string, PubItemMinimal];
                }
            }
            return null;
        })
        .filter((item): item is [string, PubItemMinimal] => !!item);
    return Object.fromEntries(summary);
};

export function useMTMTPubListMinimal(): Record<string, PubItemMinimal> {
    const formInfo = useFormInfo();
    if (!formInfo || "mtmtPubListMinimal" in formInfo === false) throw new Error("useMTMTPubListMinimal csak <FormProvider> alatt használható");
    const pubListMinimal = formInfo["mtmtPubListMinimal"] as PubListMinimal;

    const subscribe = useCallback((fn: Listener) => pubListMinimal.subscribe(fn), [pubListMinimal]);
    const getSnapshot = useCallback(() => pubListMinimal.publications, [pubListMinimal]);

    const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return value;
}
