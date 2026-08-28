import { getMTMTObject } from "./mtmtfetch";
import type { PubItem } from "./pubitem";
import type { MTMTPubListResponse } from "./publist";

const citationCache: { [mtid: string]: PubItem[] } = {};

export const loadMTMTCitations = async (mtid: string) => {
    try {
        if (citationCache[mtid]) {
            return citationCache[mtid];
        }
        let citeData: PubItem[] = [];
        let errorCounter = 0;
        let page = 1;
        while (true) {
            try {
                const nextData = (await getMTMTObject(
                    "/api/publication",
                    `sort=publishedYear,desc&sort=firstAuthor&sort=title&size=20&cond=published;eq;true&cond=cites.publication;eq;${mtid}&cond=cites.published;eq;true&page=${page}`
                )) as MTMTPubListResponse;
                citeData = citeData.concat(nextData.content);
                if (!nextData.paging.last) page++;
                else break;
            } catch (err) {
                console.log(`${Date.now()} When loading page ${page}: `, err);
                errorCounter++;
                if (errorCounter < 10) await new Promise<void>((resolve) => setTimeout(() => resolve(), 250));
                else throw "Too many errors during MTMT fetch";
            }
        }
        console.log("Citations fetched from MTMT.", citeData);
        citationCache[mtid] = citeData;
        return citeData;
    } catch (err) {
        console.log(err);
        return [];
    }
};

export const getCachedCitations = (): { [mtid: string]: PubItem[] } => {
    return citationCache;
};
