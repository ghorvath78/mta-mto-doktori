import {
    cD,
    getPdfDocumentStyles,
    getPdfSection,
    groupToPdfDocDefinition,
    groupToPdfTableDefinition,
    requestPdfSaveTarget,
    savePdfWithFormData,
    type FormDescriptor,
    type GroupDescriptor,
    type SectionDescriptor
} from "@repo/form-engine";
import type { Content, ContentTable, TableCell } from "pdfmake/interfaces";
import { COMMITTEE_ROLES, committeeArrayKey, committeeArrayLength, COMMITTEE_PAGE_KEY } from "@repo/committee";
import { getMaxAchievementQ, getMaxBookQ, getMinCommunityCount, getMinHIndex, getMinPaperQ, getMinTotalI, getMinTotalQ } from "./requirements";
import { getNumOfAuthorsInPub, getRatingOfPub } from "./bizottsagiform";
import { MAX_NOMINATORS, nominatorFokozatKey, nominatorLoadedKey, nominatorNameKey } from "./nominators";
import { activityRequirementSectionKeys } from "./customgroups/publicactivitysummary";
import { formatVotePercentage } from "./customgroups/votepercentage";
import { BIRALOBIZOTTSAG_SZAVAZAS_SECTION_KEY } from "./lap-biralobizottsag";
import { kozeletiTevekenyseg } from "./lap-kozeleti";

// A bizottsági adatlap PDF-exportja. Két elvi különbség az előterjesztői exporthoz képest:
//  - az előterjesztők véleményét NEM tartalmazza (azok a kitöltést segítő, betöltött adatok, nem
//    a bizottság saját döntése) - a "nominatorOpinionsGroup" csoportok mezőlistája amúgy is üres,
//    így a form-engine sem nyomtatja őket, a csak megjelenítő szakaszokat pedig ki sem vesszük a
//    dokumentumba;
//  - a tudományos közéleti tevékenység és a műszaki alkotások csak összefoglalóan (szempont vagy
//    alkotás neve + igen/nem vagy pontszám) jelennek meg, a részletes listák nélkül.
//
// A visszatöltéshez szükséges minden adat csatolmányként kerül a PDF-be (ld. EMBEDDED_FORM_NAME
// és a bizottsagiform.tsx "Adatlap betöltése" gombja).

/** A teljes store (Bizottsági + Kérelmezői + Előterjesztő<n> névterek) JSON-ja a PDF-ben. */
export const EMBEDDED_FORM_NAME = "bizottsagi_form.json";
/** A kanonikus előterjesztő PDF-jéből származó MTMT gyorsítótár (a store-on kívüli adat). */
export const EMBEDDED_MTMT_NAME = "kerelmezo_mtmt.json";

const KERELMEZO_ALKOTAS_PREFIX = "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása";
const SCIMETRICS_KEY = "Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat";
const KATEGORIA_KEY =
    "Bizottsági|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória";
const BIZOTTSAGI_ALKOTAS_PREFIX = "Bizottsági|Tudományos minimumkövetelmények|Q-szám|A kérelmező alkotási teljesítménye";
const ISZAM_KEY = "Bizottsági|Tudományos minimumkövetelmények|I-szám|I-szám|I-szám";
const MUFORMA_KEY = "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája";

// Konkrét objektumtípussal (nem a TableCell unióval) térnek vissza, hogy szórhatók legyenek
// (pl. rowSpan hozzáadásakor).
const header = (text: string) => ({ text, style: "tableHeader", bold: true, fillColor: "#dddddd" });
const centered = (text: string) => ({ text, alignment: "center" as const });
const noData = (text: string): Content => ({ text, style: "nodata" });

export const savePDF = async (formDescriptor: FormDescriptor, additionalData: Record<string, string>) => {
    const store = formDescriptor.valueStore;
    const loadedNominators = countLoadedNominators(formDescriptor);
    if (loadedNominators === 0) {
        window.alert("A PDF exportálásához előbb be kell tölteni legalább egy előterjesztői adatlapot.");
        return;
    }

    // ennek kell a legelső await-nek lennie: a fájlmentési dialógus csak a user gesture-t
    // közvetlenül kihasználva nyitható meg, a lenti lassú hívások előtt
    const saveTarget = await requestPdfSaveTarget("bizottsagi_adatlap.pdf");
    if (saveTarget.type === "cancelled") return;

    const name = store.getField("Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Név") || "Név";
    const ugykezeloBizottsag = store.getField("Bizottsági|Bizottság|Bizottság összetétele|Bizottság összetétele|Ügykezelő bizottság") || "Bizottság";
    const rovidErtekezes = store.getField(MUFORMA_KEY) === "rövid értekezés";

    const rovidErtekezesBlokk: Content[] = rovidErtekezes
        ? [
              { text: "Rövid értekezésre vonatkozó minimumkövetelmények", style: "subsection" },
              ...getShortThesisRequirements(formDescriptor),
              ...(await getPdfSection(formDescriptor, "Bizottsági|Tudományos minimumkövetelmények|Rövid értekezésre vonatkozó értékelés", ""))
          ]
        : [];

    const docDefinition = {
        ...getPdfDocumentStyles(),
        content: [
            { text: "MTA Műszaki Tudományok Osztálya", italics: true },
            { text: "BIZOTTSÁGI ÉRTÉKELÉS", style: "header" },
            { text: name, style: "header_center_data" },
            { text: "doktori habitusáról.", style: "header_center_title" },
            { text: "A habitusvizsgálatot lefolytatta:", style: "header_center_title" },
            { text: ugykezeloBizottsag, style: "header_center_data" },

            { text: "A. A habitusvizsgálatot lefolytató bizottsági ülés", style: "section" },
            ...(await getPdfSection(formDescriptor, "Bizottsági|Bizottság|Bizottság összetétele", "Az ügykezelő bizottság:")),
            { text: "A felkért előterjesztők", style: "grouplabel" },
            getNominatorsTable(formDescriptor),
            ...(await getPdfSection(formDescriptor, "Bizottsági|Bizottság|Vendégbizottságok", "Vendégbizottság:")),
            { text: "A habitusvizsgálati ülés", style: "grouplabel" },
            ...getQuorumSummary(formDescriptor),
            ...(await getCommitteeSection(formDescriptor, "Bizottsági|Bizottság|Határozatképesség", "Az ülés adatai:")),

            { text: "B. A szakterületi illetékesség megállapítása", style: "section" },
            ...(await getPdfSection(formDescriptor, "Bizottsági|Pályázó adatai|A pályázó személyes adatai", "A pályázó személyes adatai:")),
            ...(await getPdfSection(formDescriptor, "Bizottsági|Pályázó adatai|Aktuális munkahelyek", "Aktuális munkahelyek:")),
            ...(await getPdfSection(formDescriptor, "Bizottsági|Pályázó adatai|A doktori mű", "A doktori mű:")),
            ...(await getPdfSection(
                formDescriptor,
                "Bizottsági|Pályázó adatai|A kérelmező által megnevezett szakterület és tudományos bizottság",
                "A kérelmező által megnevezett szakterület és tudományos bizottság:"
            )),
            ...(await getCommitteeSection(formDescriptor, "Bizottsági|Pályázó adatai|Illetékesség", "A bizottság döntése:")),

            { text: "C. A benyújtott doktori mű formai alkalmassága", style: "section" },
            ...(await getCommitteeSection(formDescriptor, "Bizottsági|Pályázó adatai|Alkalmasság", "A bizottság döntése:")),

            { text: "D. A tudományos minimumkövetelmények teljesítésének ellenőrzése", style: "section" },
            ...(await getPdfSection(
                formDescriptor,
                "Bizottsági|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények",
                "A kérelmezőre vonatkozó minimumkövetelmények:"
            )),
            { text: "1. A kérelmező publikációs és alkotási teljesítménye (Q-szám)", style: "subsection" },
            ...getSciScoringTable(formDescriptor),
            { text: "A kérelmező alkotási teljesítménye", style: "grouplabel" },
            ...getWorksTable(formDescriptor),
            { text: "Q értékszám összesítő", style: "grouplabel" },
            ...getQScoreSummary(formDescriptor),
            { text: "2. A kérelmező idézettsége (I-szám)", style: "subsection" },
            ...(await getPdfSection(formDescriptor, "Bizottsági|Tudományos minimumkövetelmények|I-szám", "")),
            getIScoreSummary(formDescriptor),
            { text: "3. A tételes publikációs elvárások teljesülése", style: "subsection" },
            ...getItemizedRequirements(formDescriptor),
            { text: "4. A publikációs teljesítmény bizottsági értékelése", style: "subsection" },
            ...(await getPdfSection(formDescriptor, "Bizottsági|Tudományos minimumkövetelmények|Publikációs teljesítmény értékelése", "")),
            ...rovidErtekezesBlokk,
            { text: "5. Tudományos közéleti tevékenység", style: "subsection" },
            ...getPublicActivitySummary(formDescriptor),
            ...(await getPdfSection(formDescriptor, "Bizottsági|Tudományos közéleti tevékenység|Tudományos közéleti tevékenység értékelése", "")),
            { text: "6. A tudományos minimumkövetelmények teljesítésének összesítése", style: "subsection" },
            ...(await getPdfSection(formDescriptor, "Bizottsági|A tudományos minimumkövetelmények teljesítésének összesítése|Összesítés", "")),

            { text: "E. Összefoglaló javaslat: A kérelmező doktori habitusának megítélése", style: "section" },
            ...(await getPdfSection(formDescriptor, "Bizottsági|Összefoglaló javaslat|Összefoglaló javaslat", "")),
            ...(await getPdfSection(formDescriptor, "Bizottsági|Összefoglaló javaslat|Javaslat a rövid értekezés benyújtásáról", "")),

            { text: "F. Javaslat a bírálókra és a bíráló bizottság tagjaira", style: "section" },
            ...(await getBiraloBizottsagSection(formDescriptor))
        ] as Content[]
    };

    savePdfWithFormData(saveTarget, docDefinition, "bizottsagi_adatlap.pdf", {
        [EMBEDDED_FORM_NAME]: JSON.stringify(store.toJSON(formDescriptor.pages, formDescriptor.formName), null, 4),
        ...additionalData
    });
};

function countLoadedNominators(formDescriptor: FormDescriptor): number {
    const store = formDescriptor.valueStore;
    let count = 0;
    for (let i = 1; i <= MAX_NOMINATORS; i++) {
        if (store.getField(nominatorLoadedKey(i)) === "true") count++;
    }
    return count;
}

// ─── A. Bizottsági ülés ──────────────────────────────────────────────────────

function getNominatorsTable(formDescriptor: FormDescriptor): Content {
    const store = formDescriptor.valueStore;
    const rows: TableCell[][] = [[header(""), header("Előterjesztő neve"), header("Tudományos fokozat")]];
    for (let i = 1; i <= MAX_NOMINATORS; i++) {
        if (store.getField(nominatorLoadedKey(i)) !== "true") continue;
        rows.push([{ text: `${i}.` }, { text: store.getField(nominatorNameKey(i)) || "-" }, { text: store.getField(nominatorFokozatKey(i)) || "-" }]);
    }
    return { margin: [20, 5, 0, 0], table: { widths: [20, "*", 150], body: rows }, style: { fontSize: 10 } };
}

/** A QuorumSummary komponens PDF-megfelelője: összesített létszámok + a 3 határozatképességi feltétel. */
function getQuorumSummary(formDescriptor: FormDescriptor): Content[] {
    const store = formDescriptor.valueStore;
    const ownPrefix = "Bizottsági|Bizottság|Bizottság összetétele|Bizottság összetétele";
    const guestPrefix = "Bizottsági|Bizottság|Vendégbizottságok|Vendégbizottságok";

    const ownAcademic = cD(store.getField(`${ownPrefix}|Akadémikus és MTA doktora tagok száma`));
    const ownNonConflicted = cD(store.getField(`${ownPrefix}|Ebből a jelölttel nem összeférhetetlen tagok száma`));
    const ownPresent = cD(store.getField(`${ownPrefix}|Ebből jelen van`));

    const sum = (own: number, field: string) => own + store.getArray(`${guestPrefix}|${field}`).reduce((total, v) => total + cD(v), 0);
    const totalAcademic = sum(ownAcademic, "Akadémikus és MTA doktora tagok száma");
    const totalNonConflicted = sum(ownNonConflicted, "Ebből a jelölttel nem összeférhetetlen tagok száma");
    const totalPresent = sum(ownPresent, "Ebből jelen van");

    const allNominatorsPresent = store.getField("Bizottsági|Bizottság|Határozatképesség|Ülés adatai|Jelen van minden előterjesztő").toLowerCase() === "igen";
    const conditionB = ownPresent > 0 && ownPresent * 2 >= ownNonConflicted;
    const conditionC = totalPresent >= 7;
    const check = (ok: boolean) => centered(ok ? "✓" : "✗");

    return [
        {
            margin: [20, 5, 0, 0],
            table: {
                widths: ["*", 50],
                body: [
                    [{ text: "A résztvevő bizottságok akadémikus és MTA doktora tagjainak együttes száma" }, centered(String(totalAcademic))],
                    [{ text: "Ebből a jelölttel nem összeférhetetlen tagok együttes száma" }, centered(String(totalNonConflicted))],
                    [{ text: "Ebből jelen van" }, centered(String(totalPresent))]
                ]
            }
        },
        {
            margin: [20, 10, 0, 0],
            table: {
                widths: [25, "*", 45],
                body: [
                    [header(""), header("Határozatképességi feltétel"), header("Teljesül")],
                    [{ text: "a)" }, { text: "Jelen van az összes felkért előterjesztő" }, check(allNominatorsPresent)],
                    [
                        { text: "b)" },
                        { text: `Az ügykezelő bizottság szavazati jogú, ki nem zárt tagjainak legalább fele jelen van (${ownPresent}/${ownNonConflicted})` },
                        check(conditionB)
                    ],
                    [{ text: "c)" }, { text: `A jelenlévő, szavazati jogú, ki nem zárt tagok együttes száma legalább 7 (${totalPresent})` }, check(conditionC)]
                ]
            }
        }
    ];
}

// ─── Szakaszok az előterjesztői vélemények nélkül ────────────────────────────

/**
 * Egy szakasz kinyomtatása a bizottság saját csoportjaival. Az előterjesztői véleményt megjelenítő
 * csoportoknak nincs mezőjük (csak customComponent), ezért a form-engine amúgy sem nyomtatná őket -
 * ez a függvény viszont a CSOPORT-szintű feltételeket is kiértékeli (a getPdfSection csak a
 * szakasz-szintűt nézi), hogy pl. a "Bevonandó bizottságok/osztályok" csak akkor jelenjen meg, ha
 * a bizottság döntése szerint tényleg van bevonandó bizottság.
 */
async function getCommitteeSection(formDescriptor: FormDescriptor, sectionKey: string, label: string): Promise<Content[]> {
    const store = formDescriptor.valueStore;
    const parts = sectionKey.split("|");
    const page = formDescriptor.pages.find((p) => p.key === parts[1]);
    const section: SectionDescriptor | undefined = page?.sections.find((s) => s.key === parts[2]);
    if (!section) return [];

    const rows: Content[] = [];
    let labelUsed = false;
    for (const group of section.groups) {
        if (group.attribs?.noPrint) continue;
        if (!isGroupConditionMet(formDescriptor, group)) continue;
        const groupKeyPrefix = group.valueSource ?? `${sectionKey}|${group.key}`;
        const groupLabel = labelUsed ? "" : label;
        const content = group.isArray
            ? await getArrayGroupContent(formDescriptor, group, groupKeyPrefix, groupLabel)
            : await groupToPdfDocDefinition(groupLabel, group, formDescriptor, groupKeyPrefix, {});
        if (content.length > 0) labelUsed = true;
        if (!group.isArray) addVotePercentageRow(store, group, groupKeyPrefix, content);
        rows.push(...content);
    }
    return rows;
}

async function getArrayGroupContent(
    formDescriptor: FormDescriptor,
    group: GroupDescriptor,
    groupKeyPrefix: string,
    label: string
): Promise<Content[]> {
    const store = formDescriptor.valueStore;
    const length = parseInt(store.getField(`${groupKeyPrefix}|_length`)) || 0;
    const rows: Content[] = [];
    for (let i = 0; i < length; i++) {
        rows.push(...(await groupToPdfDocDefinition(i === 0 ? label : "", group, formDescriptor, `${groupKeyPrefix}[[${i}]]`, {})));
    }
    return rows;
}

/** Egy csoport conditionKey/conditionValue feltételének kiértékelése (csak egyszerű egyenlőség). */
function isGroupConditionMet(formDescriptor: FormDescriptor, group: GroupDescriptor): boolean {
    if (!group.conditionKey) return true;
    const value = formDescriptor.valueStore.getField(group.conditionKey);
    if (group.conditionValue === undefined) return value !== "" && value !== "false";
    return value === group.conditionValue;
}

/**
 * A "votePercentage" mező számított, nincs tárolt értéke, így a form-engine a printerét meg sem
 * hívja. Ezért a támogatottságot itt illesztjük be a szavazócsoport táblázatába, közvetlenül a
 * szavazatszámok alá, ugyanolyan "címke: érték" sorként.
 */
function addVotePercentageRow(store: FormDescriptor["valueStore"], group: GroupDescriptor, groupKeyPrefix: string, content: Content[]): void {
    const field = group.fields.find((f) => f.type === "votePercentage");
    if (!field) return;
    const table = content.find((c): c is ContentTable => typeof c === "object" && c !== null && "table" in c);
    if (!table) return;
    const igen = cD(store.getField(`${groupKeyPrefix}|Igen szavazatok száma`));
    const nem = cD(store.getField(`${groupKeyPrefix}|Nem szavazatok száma`));
    table.table.body.push([{ text: `${field.label || field.key}:` }, { text: formatVotePercentage(igen, nem) ?? "-", bold: true }]);
}

// ─── D. Tudománymetria ───────────────────────────────────────────────────────

function getSciMetrics(formDescriptor: FormDescriptor): number[][] {
    return JSON.parse(formDescriptor.valueStore.getField(SCIMETRICS_KEY) || "[]");
}

function getSciScoringTable(formDescriptor: FormDescriptor): Content[] {
    const data = getSciMetrics(formDescriptor);
    const d = (row: number, col: number) => cD(data[row]?.[col] ?? 0);
    const count = (row: number) => centered(String(d(row, 0) + d(row, 2) + d(row, 4)));

    return [
        {
            margin: [20, 5, 0, 0],
            table: {
                widths: ["*", 50, 50],
                body: [
                    [header("Tudományos folyóiratcikk"), header("Darab"), header("Pontszám")],
                    [{ text: "Lektorált folyóiratcikk" }, count(1), centered(String(d(1, 6)))],
                    [{ text: "Lektorált folyóirat cikk IF-ral" }, count(2), { text: "" }],
                    [{ text: "Lektorált folyóirat egyszerzős IF-os cikk" }, count(3), { text: "" }],
                    [{ text: "Konferenciacikk konferenciakötetben, folyóiratban, könyvrészletben" }, count(4), centered(String(d(4, 6)))],
                    [
                        { text: "Tudományos folyóirat és konferenciacikk Q érték", bold: true, colSpan: 2 },
                        { text: "" },
                        { text: String(d(1, 6) + d(4, 6)), bold: true, alignment: "center" as const }
                    ]
                ]
            }
        },
        {
            margin: [20, 10, 0, 0],
            table: {
                widths: ["*", 50, 50],
                body: [
                    [header("Tudományos könyv, könyvrészlet szerzőként"), header("Darab"), header("Pontszám")],
                    [{ text: "Könyv" }, count(6), centered(String(d(6, 6)))],
                    [{ text: "Könyvrészlet" }, count(7), centered(String(d(7, 6)))],
                    [
                        { text: "Tudományos könyv és könyvrészlet Q érték", bold: true, colSpan: 2 },
                        { text: "" },
                        { text: String(d(6, 6) + d(7, 6)), bold: true, alignment: "center" as const }
                    ]
                ]
            }
        }
    ];
}

/** Az alkotások csak névvel és a bizottság által adott ponttal jelennek meg (részletek nélkül). */
function getWorksTable(formDescriptor: FormDescriptor): Content[] {
    const store = formDescriptor.valueStore;
    const descriptions = store.getArray(`${KERELMEZO_ALKOTAS_PREFIX}|Műszaki alkotás leírása`);
    if (descriptions.length === 0) return [noData("A kérelmező nem adott meg műszaki alkotást.")];

    const scores = store.getArray(`${BIZOTTSAGI_ALKOTAS_PREFIX}|Bizottsági pontszám`);
    const rows: TableCell[][] = [[header(""), header("Alkotás megnevezése"), header("Bizottsági pontszám")]];
    descriptions.forEach((description, i) => {
        rows.push([{ text: `${i + 1}.` }, { text: description || "-" }, centered(scores[i] || "-")]);
    });
    rows.push([
        { text: "Összesen", bold: true, colSpan: 2 },
        { text: "" },
        { text: String(getAchievementQ(formDescriptor)), bold: true, alignment: "center" as const }
    ]);
    return [{ margin: [20, 5, 0, 0], table: { widths: [20, "*", 90], body: rows }, style: { fontSize: 10 } }];
}

function getAchievementQ(formDescriptor: FormDescriptor): number {
    const scores = formDescriptor.valueStore.getArray(`${BIZOTTSAGI_ALKOTAS_PREFIX}|Bizottsági pontszám`);
    return Math.round(10000 * scores.reduce((sum, value) => sum + cD(value), 0)) / 10000;
}

function getQValues(formDescriptor: FormDescriptor) {
    const data = getSciMetrics(formDescriptor);
    const category = formDescriptor.valueStore.getField(KATEGORIA_KEY);
    return {
        category,
        paperQ: cD(data[1]?.[6]) + cD(data[4]?.[6]),
        bookQ: cD(data[6]?.[6]) + cD(data[7]?.[6]),
        achievementQ: getAchievementQ(formDescriptor),
        minPaperQ: getMinPaperQ(category),
        maxBookQ: getMaxBookQ(),
        maxAchievementQ: Math.round(1000 * getMaxAchievementQ(category)) / 1000,
        minTotalQ: getMinTotalQ(category)
    };
}

function getQScoreSummary(formDescriptor: FormDescriptor): Content[] {
    const q = getQValues(formDescriptor);
    const totalQ = Math.round(10000 * (q.paperQ + Math.min(q.bookQ, q.maxBookQ) + Math.min(q.achievementQ, q.maxAchievementQ))) / 10000;

    return [
        {
            margin: [20, 5, 0, 0],
            table: {
                widths: ["*", 80, 50, 80],
                body: [
                    [header("Összetevői"), header("Előírt"), header("Elért"), header("Figyelembe vehető")],
                    [{ text: "Tudományos cikk" }, centered(`minimum ${q.minPaperQ}`), centered(String(q.paperQ)), centered(String(q.paperQ))],
                    [
                        { text: "Tudományos könyv, könyvrészlet" },
                        centered(`maximum ${q.maxBookQ}`),
                        centered(String(q.bookQ)),
                        centered(String(Math.min(q.bookQ, q.maxBookQ)))
                    ],
                    [
                        { text: "Kiemelkedő alkotás (bizottsági pontszám alapján)" },
                        centered(`maximum ${q.maxAchievementQ}`),
                        centered(String(q.achievementQ)),
                        centered(String(Math.min(q.achievementQ, q.maxAchievementQ)))
                    ],
                    [{ text: "Összesen", bold: true }, { text: "" }, { text: "" }, { text: String(totalQ), bold: true, alignment: "center" as const }]
                ]
            }
        },
        {
            margin: [20, 10, 0, 0],
            layout: { defaultBorder: false },
            table: {
                widths: ["*", 80],
                body: [
                    [{ text: "A kérelmező által elért publikációs (alkotási, Q) érték:" }, { text: String(totalQ), bold: true, alignment: "center" as const }],
                    [{ text: "Minimum követelmény (Qmin):" }, { text: String(q.minTotalQ), bold: true, alignment: "center" as const }],
                    [
                        { text: "A bizottság megítélése szerint a kérelmező teljesítette a Q ≥ Qmin követelményt:" },
                        { text: totalQ >= q.minTotalQ ? "IGEN" : "NEM", bold: true, alignment: "center" as const }
                    ]
                ]
            }
        }
    ];
}

function getIScoreSummary(formDescriptor: FormDescriptor): Content {
    const store = formDescriptor.valueStore;
    const iScore = parseInt(store.getField(ISZAM_KEY) || "0");
    const minIScore = getMinTotalI(store.getField(KATEGORIA_KEY));
    return {
        text: ["A kérelmező teljesítette az I ≥ Imin követelményt: ", { text: iScore >= minIScore ? "IGEN" : "NEM", bold: true }],
        bold: true,
        margin: [20, 5, 0, 5]
    };
}

function getItemizedRequirements(formDescriptor: FormDescriptor): Content[] {
    const store = formDescriptor.valueStore;
    const data = getSciMetrics(formDescriptor);
    const q = getQValues(formDescriptor);
    const iScore = parseInt(store.getField(ISZAM_KEY) || "0");
    const minIScore = getMinTotalI(q.category);
    const maxAchievementQ = getMaxAchievementQ(q.category);
    const phdStudents = cD(
        store.getField("Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók|Összes|Fokozatott szerzett doktoranduszok száma") || 0
    );

    const hunPapers = cD(data[13]?.[0] ?? 0);
    const asIfPapers = cD(data[14]?.[0] ?? 0);
    const ifPapers = cD(data[15]?.[0] ?? 0);
    const relIf = cD(data[16]?.[0] ?? 0);
    const wosCitations = cD(data[11]?.[0] ?? 0);
    const hIndex = cD(data[12]?.[0] ?? 0);
    const minHIndex = getMinHIndex(q.category);
    const minHunPapers = 1;
    const minSaIfPhdSum = 2;

    const optionalSatisfied =
        q.paperQ >= q.minPaperQ * 1.5 || q.bookQ >= q.maxBookQ * 1.5 || q.achievementQ >= maxAchievementQ * 1.5 || iScore >= 1.5 * minIScore;

    const allSatisfied =
        q.paperQ >= q.minPaperQ &&
        optionalSatisfied &&
        hunPapers >= minHunPapers &&
        asIfPapers + phdStudents >= minSaIfPhdSum &&
        ifPapers >= q.minTotalQ * 0.5 &&
        relIf >= q.minTotalQ * 0.25 &&
        hIndex >= minHIndex &&
        wosCitations >= minIScore * 0.5;

    const check = (ok: boolean) => centered(ok ? "✓" : "✗");
    const num = (v: number) => centered(String(v));

    return [
        {
            margin: [20, 5, 0, 0],
            table: {
                widths: [30, "*", 50, 50, 45],
                body: [
                    [header(""), header("Tételes publikációs elvárások"), header("Saját"), header("Minimum"), header("Teljesül")],
                    [
                        { text: "1." },
                        { text: "A Q érték cikkekre külön is érje el a cikkekre előírt minimumot" },
                        num(q.paperQ),
                        num(q.minPaperQ),
                        check(q.paperQ >= q.minPaperQ)
                    ],
                    [
                        { text: "2.a." },
                        { text: "Cikkekre érjen el szignifikánsan (≥ 50%-kal) nagyobb Q értéket" },
                        num(q.paperQ),
                        num(q.minPaperQ * 1.5),
                        { ...check(optionalSatisfied), rowSpan: 4 }
                    ],
                    [
                        { text: "2.b." },
                        { text: "Könyvekre érjen el szignifikánsan (≥ 50%-kal) nagyobb Q értéket" },
                        num(q.bookQ),
                        num(q.maxBookQ * 1.5),
                        { text: "" }
                    ],
                    [
                        { text: "2.c." },
                        { text: "Alkotásokra érjen el szignifikánsan (≥ 50%-kal) nagyobb Q értéket" },
                        num(q.achievementQ),
                        num(maxAchievementQ * 1.5),
                        { text: "" }
                    ],
                    [
                        { text: "2.d." },
                        { text: "Idézettségre érjen el szignifikánsan (≥ 50%-kal) nagyobb értéket" },
                        num(iScore),
                        num(minIScore * 1.5),
                        { text: "" }
                    ],
                    [
                        { text: "3." },
                        { text: "A magyar állampolgároknak legyen magyar nyelvű publikációja is" },
                        num(hunPapers),
                        num(minHunPapers),
                        check(hunPapers >= minHunPapers)
                    ],
                    [
                        { text: "4." },
                        { text: "Az egyszerzős IF-os cikkeinek és a sikeresen védett PhD/DLA hallgatói darabszámainak összege legyen legalább 2" },
                        num(asIfPapers + phdStudents),
                        num(minSaIfPhdSum),
                        check(asIfPapers + phdStudents >= minSaIfPhdSum)
                    ],
                    [
                        { text: "5." },
                        { text: "Az IF-os cikkeinek száma (a szerzők számával nem kell osztani) legyen legalább 0,5 Qmin" },
                        num(ifPapers),
                        num(q.minTotalQ * 0.5),
                        check(ifPapers >= q.minTotalQ * 0.5)
                    ],
                    [
                        { text: "6." },
                        { text: "A viszonyított IF-számok összege legyen legalább 0,25 Qmin" },
                        num(relIf),
                        num(q.minTotalQ * 0.25),
                        check(relIf >= q.minTotalQ * 0.25)
                    ],
                    [
                        { text: "7." },
                        { text: "A WoS-ben megjelent hivatkozásainak darabszáma legyen legalább 0,5 Imin" },
                        num(wosCitations),
                        num(minIScore * 0.5),
                        check(wosCitations >= minIScore * 0.5)
                    ],
                    [
                        { text: "8." },
                        { text: "MTMT-ben szereplő független hivatkozásokból számolt Hirsch-indexe" },
                        num(hIndex),
                        num(minHIndex),
                        check(hIndex >= minHIndex)
                    ]
                ]
            }
        },
        {
            text: ["A kérelmező maradéktalanul teljesítette a tételes publikációs elvárásokat: ", { text: allSatisfied ? "IGEN" : "NEM", bold: true }],
            margin: [20, 5, 0, 5]
        }
    ];
}

function getShortThesisRequirements(formDescriptor: FormDescriptor): Content[] {
    const store = formDescriptor.valueStore;
    const d1Pubs = store.getArray("Kérelmezői|A doktori mű adatai|D1 közlemények listája|D1 közlemények listája|Cikk MTMT azonosítója");
    const thesisPubs = store.getArray("Kérelmezői|A doktori mű adatai|Téziseket alátámasztó publikációk|Téziseket alátámasztó publikációk|Cikk MTMT azonosítója");
    const d1Share = d1Pubs.reduce((sum, mtmt) => {
        const numAuthors = getNumOfAuthorsInPub(mtmt);
        return sum + (numAuthors > 0 ? 1 / numAuthors : 0);
    }, 0);
    const wosNumber = cD(getSciMetrics(formDescriptor)[11]?.[0] ?? 0);

    const thesisPubRows: TableCell[][] = thesisPubs.map((mtmt, index) => {
        const rating = getRatingOfPub(mtmt);
        const numAuthors = getNumOfAuthorsInPub(mtmt);
        const satisfies = (rating === "D1" || rating === "Q1") && numAuthors <= 3;
        return [
            { text: `${index + 1}.` },
            { text: mtmt, link: `https://m2.mtmt.hu/api/publication/${mtmt}`, color: "#1d4ed8", decoration: "underline" as const },
            centered(rating),
            centered(String(numAuthors)),
            centered(satisfies ? "✓" : "✗")
        ];
    });

    return [
        {
            margin: [20, 5, 0, 0],
            layout: { defaultBorder: false },
            table: {
                widths: ["*", 80],
                body: [
                    [{ text: "SJR D1 cikkek összegzett szerzői részaránya:" }, { text: d1Share.toFixed(3), alignment: "right" as const }],
                    [{ text: "Független WoS hivatkozások száma:" }, { text: String(wosNumber), alignment: "right" as const }],
                    [
                        { text: "A kérelmező teljesítette a rövid értekezés speciális számszerű követelményeit:" },
                        { text: d1Share >= 3 && wosNumber >= 750 ? "IGEN" : "NEM", bold: true, alignment: "right" as const }
                    ]
                ]
            }
        },
        { text: "A kérelmező által megjelölt téziseket alátámasztó publikációk:", margin: [20, 8, 0, 4] },
        {
            margin: [20, 0, 0, 0],
            table: {
                widths: [25, "*", 60, 60, 50],
                body: [[header(""), header("MTMT azonosító"), header("Besorolás"), header("Szerzőszám"), header("Teljesül")], ...thesisPubRows]
            }
        }
    ];
}

// ─── D5. Tudományos közéleti tevékenység (tömör, szempontonkénti igen/nem) ───

/**
 * A közéleti tevékenység a bizottsági adatlapon nincs tételesen kifejtve: szempontonként csak a
 * bizottság igen/nem döntése jelenik meg, a végén a teljesített szempontok számával. A szempontok
 * megnevezése a "Tudományos közéleti tevékenység" lap szakaszaiból származik.
 */
function getPublicActivitySummary(formDescriptor: FormDescriptor): Content[] {
    const store = formDescriptor.valueStore;
    const rows: TableCell[][] = [[header(""), header("Tudományos közéleti tevékenység"), header("Teljesült")]];
    let satisfiedCount = 0;

    activityRequirementSectionKeys.forEach((sectionKey, index) => {
        const section = kozeletiTevekenyseg.sections.find((s) => s.key === sectionKey);
        const value = store.getField(`Bizottsági|Tudományos közéleti tevékenység|${sectionKey}|Bizottsági értékelés|Bizottsági vélemény`);
        const satisfied = value.toLowerCase() === "igen";
        if (satisfied) satisfiedCount++;
        rows.push([{ text: `${index + 1}.` }, { text: section?.label ?? sectionKey }, centered(value ? (satisfied ? "igen" : "nem") : "-")]);
    });

    return [
        { margin: [20, 5, 0, 0], table: { widths: [25, "*", 50], body: rows }, style: { fontSize: 10 } },
        {
            text: [
                "A bizottság megítélése szerint a kérelmező a fentiek közül ",
                { text: String(satisfiedCount), bold: true },
                " szempontot teljesített (a teljesítendő szempontok száma: ",
                { text: String(getMinCommunityCount()), bold: true },
                ")."
            ],
            margin: [20, 8, 0, 5]
        }
    ];
}

// ─── F. Bíráló bizottság ─────────────────────────────────────────────────────

async function getBiraloBizottsagSection(formDescriptor: FormDescriptor): Promise<Content[]> {
    const store = formDescriptor.valueStore;
    const pagePrefix = `Bizottsági|${COMMITTEE_PAGE_KEY}`;
    const page = formDescriptor.pages.find((p) => p.key === COMMITTEE_PAGE_KEY);
    if (!page) return [];

    const result: Content[] = [];
    for (const role of COMMITTEE_ROLES) {
        const arrayKey = committeeArrayKey(pagePrefix, role.key);
        const group = page.sections.find((s) => s.key === role.key)?.groups[0];
        if (!group) continue;
        result.push({ text: role.key, style: "grouplabel" });
        if (committeeArrayLength(store, arrayKey) === 0) {
            result.push({ text: "Nincs megadva", italics: true, margin: [20, 0, 0, 5] });
        } else {
            result.push(...(await groupToPdfTableDefinition("", group, formDescriptor, arrayKey, {})));
        }
    }
    result.push(
        ...(await getCommitteeSection(
            formDescriptor,
            `${pagePrefix}|${BIRALOBIZOTTSAG_SZAVAZAS_SECTION_KEY}`,
            "A bíráló bizottság összetételének megerősítése:"
        ))
    );
    return result;
}
