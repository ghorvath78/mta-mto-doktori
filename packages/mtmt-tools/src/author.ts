import { getMTMTObject } from "./mtmtfetch";
import type { PubItem } from "./pubitem";

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
            // remove those affiliations that are prefixes of others
            result.affiliations = result.affiliations.filter((affil, index) => {
                return !result.affiliations.some((other, otherIndex) => otherIndex !== index && other.startsWith(affil + " / "));
            });
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

export const isAuthorOfPubItem = (authorMtid: string, pubItem: PubItem): boolean => {
    if (!pubItem.authorships) return false;
    return pubItem.authorships.some((auth: any) => auth["author"] && String(auth["author"]["mtid"]) === authorMtid);
};
