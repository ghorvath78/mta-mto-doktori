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

export type PubItemSummary = {
    template: string;
    rating: string;
    independentCitationCount?: number;
};

export const activeMTMTUserIdAtom = atom<string>("");
export const mtmtPubListAtom = atom<PubItem[]>([]);
export const mtmtPubListStatusAtom = atom<"uninitialized" | "loading" | "error" | "done">("uninitialized");
export const mtmtScientometricsAtom = atom<(number | string)[][]>([]);
export const mtmtScientometricsStatusAtom = atom<"uninitialized" | "loading" | "error" | "done">("uninitialized");

export const mtmtPubSummaryCacheAtom = atom<{ [mtid: string]: PubItemSummary }>({});

export const getMTMTObject = async (object: string, params?: string): Promise<{ [key: string]: unknown }> => {
    const response = await fetch(`https://m2.mtmt.hu${object}?${params ?? ""}&format=json`);
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

export const getPubRating = (pubItem: PubItem): string => {
    if (pubItem.journal && pubItem.ratings) {
        const sjr = pubItem.ratings.find((r) => r.otype === "SjrRating");
        if (sjr) return sjr.ranking;
    }
    return "";
};

export const getRating = (mtmtPubList: PubItem[], mtid: string): string | null => {
    const pub = mtmtPubList.find((c) => String(c.mtid) === mtid);
    return pub ? getPubRating(pub) : "";
};

export const getIndependentCitationCount = (mtmtPubList: PubItem[], mtid: string): number | null => {
    const pub = mtmtPubList.find((c) => String(c.mtid) === mtid);
    return pub ? (pub.independentCitationCount ?? null) : null;
};

export const getPubItemSummary = (mtmtPub: PubItem): PubItemSummary => {
    return {
        template: mtmtPub.template,
        rating: getPubRating(mtmtPub),
        independentCitationCount: getIndependentCitationCount([mtmtPub], String(mtmtPub.mtid)) ?? undefined
    };
};

export const savePubItemSummary = (mtids: string[]): Record<string, PubItemSummary> => {
    const mtmtPubList = store.get(mtmtPubListAtom) || [];
    const summary = mtids
        .map((id) => {
            // search in publication list
            const pub = mtmtPubList.find((c) => String(c.mtid) === id);
            if (pub) {
                return [id, getPubItemSummary(pub)] as [string, PubItemSummary];
            }
            // search in citation cache
            for (const cachedCitations of Object.values(citationCache)) {
                const cite = cachedCitations.find((c) => String(c.mtid) === id);
                if (cite) {
                    return [id, getPubItemSummary(cite)] as [string, PubItemSummary];
                }
            }
            return null;
        })
        .filter((item): item is [string, PubItemSummary] => !!item);
    return Object.fromEntries(summary);
};

export const loadPubItemSummary = (summaries: Record<string, PubItemSummary>) => {
    store.set(mtmtPubSummaryCacheAtom, { ...summaries });
};

export type AuthorData = {
    name: string;
    affiliations: string[];
    degree: string;
    disciplines: string[];
};

const institutionCache: { [mtid: string]: string[] } = {};

const getInstitutionParts = async (inst: any): Promise<string[]> => {
    if (inst["mtid"] && institutionCache[inst["mtid"]]) {
        return institutionCache[inst["mtid"]];
    }
    const instRecord = (await getMTMTObject(inst["link"]))["content"] as any;
    const name = (instRecord["abbreviation"] as string) ?? (instRecord["name"] as string) ?? "";
    const type = (instRecord["type"] ? ((instRecord["type"] as any)["label"] ?? "") : "") as string;
    const exclude = ["doktori iskola", "tanács"].some((keyword) => type.toLowerCase().includes(keyword));
    if (exclude) {
        return [""];
    }
    if (instRecord["parent"]) {
        const containment = (await getMTMTObject((instRecord["parent"] as any)[0]["link"]))["content"] as any;
        if (containment["parent"]) {
            const parentParts = await getInstitutionParts(containment["parent"]);
            institutionCache[inst["mtid"]] = [...parentParts, name];
            return institutionCache[inst["mtid"]];
        }
    }
    institutionCache[inst["mtid"]] = [name];
    return [name];
};

export const getAuthorRecord = async (mtid: string): Promise<AuthorData> => {
    const resp = await getMTMTObject(`/api/author/${mtid}`);
    if (resp && resp.content && typeof resp.content === "object") {
        const content = resp.content as { familyName?: string; givenName?: string; affiliations?: any[]; degrees?: string[] };
        const result = {
            name: String(content.familyName) + " " + String(content.givenName),
            affiliations: [],
            degree: "",
            disciplines: []
        } as AuthorData;

        if ("affiliations" in resp.content && Array.isArray(resp.content["affiliations"])) {
            result.affiliations = [];
            for (const affil of resp.content["affiliations"]) {
                if (affil.worksFor && !affil.endDate) {
                    const instLabelParts = await getInstitutionParts(affil.worksFor);
                    // push into result only if is does not have any empty part
                    if (instLabelParts.length > 0 && !instLabelParts.some((part) => part.trim() === "")) {
                        const instLabel = instLabelParts.join(" / ");
                        result.affiliations.push(instLabel);
                    }
                }
            }
        }

        if ("degrees" in resp.content && Array.isArray(resp.content["degrees"])) {
            const allDegrees: string[] = [];
            resp.content["degrees"].forEach((deg: any) => {
                allDegrees.push(deg.label);
            });
            const degreesString = allDegrees.join(", ");
            if (degreesString.includes("MTA Rendes tag")) {
                result.degree = "MTA rendes tagja";
            } else if (degreesString.includes("MTA Levelező tag")) {
                result.degree = "MTA levelező tagja";
            } else if (degreesString.includes("MTA külső tagja")) {
                result.degree = "MTA külső tagja";
            } else if (degreesString.includes("MTA Doktora")) {
                result.degree = "MTA doktora";
            } else if (degreesString.includes("Tudomány doktora (nagydoktor)")) {
                result.degree = "Tudomány doktora";
            } else if (degreesString.includes("Kandidátus")) {
                result.degree = "Kandidátus";
            } else if (degreesString.includes("PhD")) {
                result.degree = "PhD";
            }
        }

        if ("disciplines" in resp.content && Array.isArray(resp.content["disciplines"])) {
            resp.content["disciplines"].forEach((disc: any) => {
                result.disciplines.push(disc.label);
            });
        }

        return result;
    }
    throw new Error(`Author record not found for MTID: ${mtid}`);
};
