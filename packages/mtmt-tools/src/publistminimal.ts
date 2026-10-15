import { useFormDescriptor } from "@repo/form-engine";
import { getCachedCitations } from "./citations";
import { getPubRating, type PubItem } from "./pubitem";
import type { PubList } from "./publist";
import { useCallback, useSyncExternalStore } from "react";

export type PubItemMinimal = {
    template: string;
    rating: string;
    independentCitationCount?: number;
    /** A publikáció összes szerzőjének száma (authorships.length). A korábbi mentésekből hiányzik, ld. withAuthorCounts. */
    authorCount?: number;
};

export const getPubItemMinimal = (mtmtPub: PubItem): PubItemMinimal => {
    return {
        template: mtmtPub.template,
        rating: getPubRating(mtmtPub),
        independentCitationCount: mtmtPub.independentCitationCount ?? undefined,
        authorCount: mtmtPub.authorships?.length
    };
};

/**
 * A szerzők száma a publikáció MTMT-sablonjából: a `<div class="authors">` blokk `author-name`
 * elemeinek száma. Ha a sablonban nincs szerzőlista, undefined.
 */
export function countAuthorsInTemplate(template: string): number | undefined {
    const authors = /<div class="authors">([\s\S]*?)<\/div\s*>/.exec(template ?? "");
    const count = authors?.[1].match(/class="author-name"/g)?.length ?? 0;
    return count > 0 ? count : undefined;
}

/**
 * Betöltéskor kiegészíti az authorCount nélküli (a mező bevezetése előtt mentett) összefoglalókat a
 * sablonból kinyert szerzőszámmal. A meglévő authorCount értékeket nem változtatja meg.
 */
export function withAuthorCounts(summaries: Record<string, PubItemMinimal>): Record<string, PubItemMinimal> {
    return Object.fromEntries(
        Object.entries(summaries).map(([mtid, pub]) => [
            mtid,
            pub.authorCount !== undefined ? pub : { ...pub, authorCount: countAuthorsInTemplate(pub.template) }
        ])
    );
}

/** A kerelmezo_mtmt.json-ban az adatlapon szereplő publikációk összefoglalóinak kulcsa. */
export const ADATLAP_PUBLIKACIOK_KEY = "Adatlapon szereplő publikációk";

/** A kerelmezo_mtmt.json teljes tartalmára alkalmazza a withAuthorCounts kiegészítést. */
export function withAuthorCountsInMtmtData<T extends Record<string, unknown>>(mtmtData: T): T {
    const summaries = mtmtData[ADATLAP_PUBLIKACIOK_KEY] as Record<string, PubItemMinimal> | undefined;
    return summaries ? { ...mtmtData, [ADATLAP_PUBLIKACIOK_KEY]: withAuthorCounts(summaries) } : mtmtData;
}

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
        this.publications = withAuthorCounts(summaries);
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
    const formDescriptor = useFormDescriptor();
    if (!formDescriptor || "mtmtPubListMinimal" in formDescriptor === false) throw new Error("useMTMTPubListMinimal csak <FormProvider> alatt használható");
    const pubListMinimal = formDescriptor["mtmtPubListMinimal"] as PubListMinimal;

    const subscribe = useCallback((fn: Listener) => pubListMinimal.subscribe(fn), [pubListMinimal]);
    const getSnapshot = useCallback(() => pubListMinimal.publications, [pubListMinimal]);

    const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return value;
}
