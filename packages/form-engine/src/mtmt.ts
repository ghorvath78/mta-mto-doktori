import { atom } from "jotai";
import { store } from "./atoms";

type PubItem = {
    mtid: string;
    title: string;
    template: string;
    journal?: object;
    book?: object;
    type?: { otypeName: string };
    subType?: { name: string };
    authorships?: object[];
    ratings?: { otype: string; ranking: string }[];
    independentCitationCount?: number;
};

export const activeMTMTUserIdAtom = atom<string>("");
export const mtmtPubListAtom = atom<PubItem[]>([]);
export const mtmtPubListStatusAtom = atom<"uninitialized" | "loading" | "error" | "done">("uninitialized");
export const mtmtScientometricsAtom = atom<(number | string)[][]>([]);
export const mtmtScientometricsStatusAtom = atom<"uninitialized" | "loading" | "error" | "done">("uninitialized");

export const getMTMTObject = async (object: string, params: string | null = null): Promise<{ [key: string]: unknown }> => {
    const paramStr = params ? params : "";
    const response = await fetch(`https://m2.mtmt.hu${object}?${paramStr}&format=json`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

type MTMTResponse = {
    content: PubItem[];
    paging: { totalElements: number; totalPages: number; number: number; size: number; first: boolean; last: boolean };
};

export const loadMTMTPublications = async (mtid: string) => {
    store.set(mtmtPubListStatusAtom, "loading");
    store.set(activeMTMTUserIdAtom, mtid);
    store.set(mtmtPubListAtom, []);
    store.set(mtmtScientometricsAtom, []);
    try {
        let pubData: PubItem[] = [];
        let errorCounter = 0;
        let page = 1;
        while (true) {
            try {
                const nextData = (await getMTMTObject(
                    "/api/publication",
                    `cond=published;eq;true&cond=core;eq;true&cond=authors.mtid;eq;${mtid}&sort=publishedYear,desc&size=20&labelLang=hun&page=${page}`
                )) as MTMTResponse;
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
        store.set(mtmtPubListAtom, pubData);
        store.set(mtmtPubListStatusAtom, "done");
    } catch (err) {
        console.log(err);
        store.set(mtmtPubListStatusAtom, "error");
        return;
    }
};

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
                )) as MTMTResponse;
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

export const isValidMTMTId = (s: string): boolean => {
    return s.length > 0 && /^\d+$/.test(s.trim());
};

export const getRanking = (pub: PubItem): string => {
    if (pub.journal && pub.ratings) {
        const sjr = pub.ratings.find((r) => r.otype === "SjrRating");
        if (sjr) return sjr.ranking;
    }
    return "N/A";
};

const base = "https://m2.mtmt.hu";

export const processMTMTTemplateLinks = (node: HTMLDivElement) => {
    const anchors = node.querySelectorAll("a");
    anchors.forEach((a) => {
        const href = a.getAttribute("href") || "";
        // ignore empty, anchors, protocol-relative and absolute (scheme:) URLs
        if (!href || href.startsWith("#") || href.startsWith("//") || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)) return;
        try {
            a.style.color = "revert";
            if (href.includes("type=authors")) {
                const match = href.match(/sel=(\d+)/);
                if (match) {
                    const id = match[1];
                    a.setAttribute("href", new URL(`api/author/${id}`, base).toString());
                    return;
                }
            }
            if (href.includes("params=publication")) {
                const match = href.match(/publication;(\d+)/);
                if (match) {
                    const id = match[1];
                    a.setAttribute("href", new URL(`api/publication/${id}`, base).toString());
                    return;
                }
            }
            a.setAttribute("href", new URL(href, base).toString());
        } catch {
            // invalid href — ignore or handle
            console.error("Invalid URL in MTMT template:", href);
        }
    });
};

export const loadScientometrics = async () => {
    if (store.get(mtmtPubListStatusAtom) === "done") {
        store.set(mtmtScientometricsStatusAtom, "loading");
        const link = "https://support.mtmt.hu/doktori_minimum/256_backend.php?author=" + store.get(activeMTMTUserIdAtom);
        // const link = "https://x7vwyr99d0.execute-api.eu-west-1.amazonaws.com/mtmt?author=" + store.get(activeMTMTUserIdAtom);
        // const link = "https://mtmt-min-requirement-proxy.ghorvath-x.workers.dev/?author=" + store.get(activeMTMTUserIdAtom);
        try {
            const response = await fetch(link);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Scientometrics fetched:", data);
            if (data.length >= 29 && data[0].length >= 2) {
                data[0][2] = new Date().toLocaleString("hu-HU");
                store.set(mtmtScientometricsAtom, data);
                store.set(mtmtScientometricsStatusAtom, "done");
            } else {
                throw new Error("Invalid scientometrics data format");
            }
        } catch (error) {
            console.error("Error fetching scientometrics:", error);
            store.set(mtmtScientometricsStatusAtom, "error");
        }
    }
};
