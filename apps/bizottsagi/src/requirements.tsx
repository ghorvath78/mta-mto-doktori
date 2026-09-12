import { valueStore } from "./bizottsagiform";

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

export function getMinTotalI(category: string) {
    const format = valueStore.getField(
        "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája"
    );
    if (format[0] === "rövid értekezés") {
        return 750;
    }
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

export function getMinCommunityCount() {
    return 5;
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
