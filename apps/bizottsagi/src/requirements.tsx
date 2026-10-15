import { cD } from "@repo/form-engine";

export function getMinPaperQ(category: string) {
    switch (category) {
        case "A":
            return 6;
        case "B":
            return 8;
        default:
            return 0;
    }
}

export function getMaxBookQ() {
    return 3;
}

export function getMaxAchievementQ(category: string) {
    switch (category) {
        case "A":
            return 4;
        case "B":
            return 5;
        default:
            return 0;
    }
}

export function getMinTotalQ(category: string) {
    switch (category) {
        case "A":
            return 12;
        case "B":
            return 16;
        default:
            return 0;
    }
}

// Rövid értekezés esetén is a kategória szerinti küszöb érvényes: a 750-es határ a független WoS
// hivatkozások számára vonatkozó külön követelmény (ld. shortThesisNumericalRequirementsMet).
export function getMinTotalI(category: string) {
    switch (category) {
        case "A":
            return 90;
        case "B":
            return 200;
        default:
            return 0;
    }
}

export function getMinHIndex(category: string) {
    switch (category) {
        case "A":
            return 5;
        case "B":
            return 7;
        default:
            return 0;
    }
}

// A 11 terület közül legalább 5 - rövid értekezéssel pályázók esetén is.
export function getMinCommunityCount() {
    return 5;
}

// Rövid értekezéssel pályázók speciális számszerű követelményei (mindhárom kategóriában): az SJR D1
// cikkek összegzett szerzői aránya 3,00-nál több, a független WoS hivatkozások száma 750-nél nagyobb
// legyen. (A tudományos közéleti követelmény számukra is ugyanaz, ld. getMinCommunityCount.)
export const SHORT_THESIS_MIN_D1_SHARE = 3;
export const SHORT_THESIS_MIN_WOS = 750;

export function shortThesisNumericalRequirementsMet(d1Share: number, wosNumber: number): boolean {
    return d1Share > SHORT_THESIS_MIN_D1_SHARE && wosNumber > SHORT_THESIS_MIN_WOS;
}

// A tudománymetriai táblázat (MTMT) "Rövid értekezéssel pályázók adatai" sora: az SJR D1 cikkek
// összegzett szerzői aránya, az MTMT által a teljes szerzőlista alapján számolva.
export function getShortThesisD1Share(sciMetrics: unknown[][]): number {
    return cD(String(sciMetrics[17]?.[0] ?? 0));
}

// A tudománymetriai táblázat (MTMT) független WoS hivatkozásainak száma.
export function getWosCitationCount(sciMetrics: unknown[][]): number {
    return cD(String(sciMetrics[11]?.[0] ?? 0));
}

const categoryMap: Record<string, string> = {
    "Anyagtudományi és Technológiai Tudományos Bizottság": "B",
    "Áramlás- és Hőtechnikai Tudományos Bizottság": "A",
    "Automatizálási és Számítástechnikai Tudományos Bizottság": "B",
    "Elektronikus Eszközök és Technológiák Tudományos Bizottsága": "A",
    "Elektrotechnikai Tudományos Bizottság": "A",
    "Energetikai Tudományos Bizottság": "A",
    "Építészeti Tudományos Bizottság": "A",
    "Gépszerkezettani Tudományos Bizottság": "A",
    "Informatikai Tudományos Bizottság": "B",
    "Közlekedés- és Járműtudományi Bizottság": "A",
    "Metallurgiai Tudományos Bizottság": "A",
    "Szál- és Kompozittechnológiai Tudományos Bizottság": "B",
    "Szilárd Testek Mechanikája Tudományos Bizottság": "A",
    "Távközlési Tudományos Bizottság": "B",
    "Vízgazdálkodástudományi Bizottság": "A"
};

export function getCategory(committee: string) {
    return categoryMap[committee] || "A";
}

// A bizottsági "Ügykezelő bizottság" és "Vendégbizottság" legördülő menük közös opciólistája.
export const tudomanyosBizottsagOptions = Object.keys(categoryMap);

// Az MTA tudományos osztályainak listája (illetékesség bővítésénél a bevonandó osztály kiválasztásához).
export const mtaOsztalyOptions = [
    "I. Nyelv- és Irodalomtudományok",
    "II. Filozófiai és Történettudományok",
    "III. Matematikai Tudományok",
    "IV. Agrártudományok",
    "V. Orvosi Tudományok",
    "VI. Műszaki Tudományok",
    "VII. Kémiai Tudományok",
    "VIII. Biológiai Tudományok",
    "IX. Gazdaság- és Jogtudományok",
    "X. Földtudományok",
    "XI. Fizikai Tudományok"
];

export const MUSZAKI_TUDOMANYOK_OSZTALY = "VI. Műszaki Tudományok";
