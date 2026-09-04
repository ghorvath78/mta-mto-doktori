import {
    cD,
    getPdfDocumentStyles,
    getPdfSection,
    groupToPdfTableDefinition,
    requestPdfSaveTarget,
    savePdfWithFormData,
    type FormDescriptor
} from "@repo/form-engine";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { getMaxBookQ, getMaxAchievementQ, getMinPaperQ, getMinTotalI, getMinHIndex, getMinTotalQ, getMinCommunityCount } from "./requirements";
import { biraloBizottsag } from "./lap-biralobizottsag";
import { getNumOfAuthorsInPub, getRatingOfPub } from "./eloterjesztoiform";
import { activityRequirementSectionKeys } from "./customgroups/publicactivitysummary";

export const savePDF = async (formDescriptor: FormDescriptor, additionalData: Record<string, string>) => {
    const store = formDescriptor.valueStore;
    const hasKerelmezoData = Object.keys(store.data).some((key) => key.startsWith("Kérelmezői"));
    if (!hasKerelmezoData) {
        window.alert("A PDF exportálásához előbb be kell tölteni a kérelmező adatait.");
        return;
    }

    // ezt kell a legelső await-nek lennie: a fájlmentési dialógus csak a user gesture-t
    // közvetlenül kihasználva nyitható meg, a lenti lassú hívások előtt
    const saveTarget = await requestPdfSaveTarget("eloterjesztoi_adatlap.pdf");
    if (saveTarget.type === "cancelled") {
        return;
    }

    const name = store.getField("Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Név") || "Név";
    const bizottsag =
        store.getField(
            "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Illetékes bizottság"
        ) || "Bizottság";
    const eloterjesztoNeve = store.getField("Előterjesztői|Előterjesztő adatai|Előterjesztő adatai|Adatok|Előterjesztő neve");
    const eloterjesztoFokozata = store.getField("Előterjesztői|Előterjesztő adatai|Előterjesztő adatai|Adatok|Tudományos fokozat");

    const rovidErtekezes =
        store.getField("Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája") ===
        "rövid értekezés";
    const rovidErtekezesSection = rovidErtekezes
        ? [
              { text: "Rövid értekezésre vonatkozó minimumkövetelmények", style: "subsection" },
              getShortThesisRequirementsSection(formDescriptor),
              await getPdfSection(formDescriptor, "Előterjesztői|Tudományos minimumkövetelmények|Rövid értekezésre vonatkozó értékelés", "")
          ]
        : [];

    const tudomanyMetria = formDescriptor.pages.find((p) => p.key === "Tudományos minimumkövetelmények")!;
    const qSection = tudomanyMetria.sections.find((s) => s.key === "Q-szám");
    const alkGroup = qSection?.groups.find((g) => g.key === "A kérelmező alkotási teljesítménye");
    const alkNum = parseInt(store.getField("Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|_length"));
    const docDefinition: TDocumentDefinitions = {
        ...getPdfDocumentStyles(),
        content: [
            { text: "MTA Műszaki Tudományok Osztálya", italics: true },
            { text: "ELŐTERJESZTŐI ÉRTÉKELÉS", style: "header" },
            { text: name, style: "header_center_data" },
            { text: "doktori habitusáról", style: "header_center_title" },
            { text: "az MTA Műszaki Tudományok Osztálya", style: "header_center_title" },
            { text: bizottsag, style: "header_center_data" },
            { text: "számára. Készítette:", style: "header_center_title" },
            { text: `${eloterjesztoNeve}, ${eloterjesztoFokozata}`, style: "header_center_data" },
            { text: "A. A szakterületi illetékesség megállapítása", style: "section" },
            await getPdfSection(formDescriptor, "Előterjesztői|Pályázó adatai|A pályázó személyes adatai", "A pályázó személyes adatai:"),
            await getPdfSection(formDescriptor, "Előterjesztői|Pályázó adatai|Aktuális munkahelyek", "Aktuális munkahelyek:"),
            await getPdfSection(formDescriptor, "Előterjesztői|Pályázó adatai|A doktori mű", "A doktori mű:"),
            await getPdfSection(
                formDescriptor,
                "Előterjesztői|Pályázó adatai|A kérelmező által megnevezett szakterület és tudományos bizottság",
                "A kérelmező által megnevezett szakterület és tudományos bizottság:"
            ),
            await getPdfSection(formDescriptor, "Előterjesztői|Pályázó adatai|Illetékesség", "Illetékesség megállapítása:"),
            { text: "B. A benyújtott doktori mű formai alkalmassága", style: "section" },
            await getPdfSection(formDescriptor, "Előterjesztői|Pályázó adatai|Alkalmasság", ""),
            { text: "C. A tudományos minimumkövetelmények teljesítésének ellenőrzése", style: "section" },
            { text: "1. A kérelmező publikációs és alkotási teljesítménye (Q-szám)", style: "subsection" },
            getQScoringTableSection(formDescriptor),
            {
                stack: [
                    alkGroup && alkNum
                        ? await groupToPdfTableDefinition(
                              "",
                              alkGroup,
                              formDescriptor,
                              "Előterjesztői|Tudományos minimumkövetelmények|Q-szám|A kérelmező alkotási teljesítménye",
                              {}
                          )
                        : { text: "Nincsenek megadva műszaki alkotások", italics: true }
                ],
                margin: [0, 5, 0, 0]
            },
            { text: "Q értékszám összesítő", style: "grouplabel" },
            getQScoreSummarySection(formDescriptor),
            { text: "2. A kérelmező idézettsége (I-szám)", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos minimumkövetelmények|I-szám", ""),
            getIScoreSummarySection(formDescriptor),
            { text: "3. A tételes publikációs elvárások teljesülése", style: "subsection" },
            await getItemizedRequirementsSection(formDescriptor),
            { text: "4. A publikációs teljesítmény értékelése", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos minimumkövetelmények|Publikációs teljesítmény értékelése", ""),
            [...rovidErtekezesSection],
            { text: "5. A kérelmező öt legfontosabb publikációja", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Öt kiemelt publikáció|A kérelmező által megjelölt öt legfontosabb publikáció", "", {
                bibIndex: "true",
                bibLabel: ""
            }),
            await getPdfSection(formDescriptor, "Előterjesztői|Öt kiemelt publikáció|Öt legfontosabb publikáció értékelése", "", {}),
            { text: "6. A kérelmező öt legfontosabb hivatkozása", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Öt kiemelt hivatkozás|A kérelmező által megjelölt öt legfontosabb hivatkozás", "", {
                bibIndex: "true",
                bibLabels: { "Hivatkozott közlemény": "Hivatkozott\nközlemény", "Hivatkozó közlemény": "Hivatkozó\nközlemény" },
                indexColWidth: "75"
            }),
            await getPdfSection(formDescriptor, "Előterjesztői|Öt kiemelt hivatkozás|Öt legfontosabb hivatkozás értékelése", "", {}),
            { text: "7. Tudományos közéleti tevékenység", style: "subsection" },
            { text: "7.1. TDK témavezetés", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos közéleti tevékenység|TDK témavezetés", "", {
                useGroupLabelAsHeader: "true"
            }),
            { text: "7.2. Részvétel graduális és doktori képzésben (tárgyelőadó, tárgyfelelős)", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben", ""),
            { text: "7.3. Részvétel doktori témavezetésben (fokozatot szerzett hallgatók)", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók", ""),
            { text: "7.4. Részvétel tudományos zsűriben, kuratóriumban, bírálatokban", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban", ""),
            { text: "7.5. Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében, plenáris előadások", style: "subsection" },
            await getPdfSection(
                formDescriptor,
                "Előterjesztői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében",
                ""
            ),
            { text: "7.6. Tisztség, kiemelt/választott tagság hazai és/vagy nemzetközi tudományos szervezetben", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben", ""),
            { text: "7.7. Folyóirat-szerkesztőbizottsági tagság legalább 2 évig", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig", ""),
            { text: "7.8. Részvétel tudományos minősítésben (bíráló, bírálóbizottsági titkár)", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos közéleti tevékenység|Részvétel tudományos minősítésben", "", {
                firstColWidth: "200",
                hideEmptyGroup: "true"
            }),
            { text: "7.9. Elnyert tudományos pályázat (témavezető, résztvevő)", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat", ""),
            { text: "7.10. Külföldi tartózkodás", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos közéleti tevékenység|Külföldi tartózkodás", ""),
            { text: "7.11. Állami vagy MTA által adományozott tudományos díj, kitüntetés", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés", ""),
            { text: "7.12. Tudományos közéleti tevékenység értékelése", style: "subsection" },
            getPublicActivitySummarySection(formDescriptor),
            await getPdfSection(formDescriptor, "Előterjesztői|Tudományos közéleti tevékenység|Tudományos közéleti tevékenység értékelése", ""),
            { text: "8. A tudományos minimumkövetelmények teljesítésének összesítése", style: "subsection" },
            await getPdfSection(formDescriptor, "Előterjesztői|A tudományos minimumkövetelmények teljesítésének összesítése|Összesítés", ""),
            { text: "D. Összefoglaló javaslat: A kérelmező doktori habitusának megítélése", style: "section" },
            await getPdfSection(formDescriptor, "Előterjesztői|Összefoglaló javaslat|Összefoglaló javaslat", ""),
            await getPdfSection(formDescriptor, "Előterjesztői|Összefoglaló javaslat|Javaslat a rövid értekezés benyújtásáról", ""),
            { text: "E. Javaslat a bírálókra és a bíráló bizottság tagjaira", style: "section" },
            ...(await getBiraloBizottsagSection(formDescriptor))
        ]
    };

    savePdfWithFormData(saveTarget, docDefinition, "eloterjesztoi_adatlap.pdf", {
        "eloterjeszto_form.json": JSON.stringify(store.toJSON(formDescriptor.pages, formDescriptor.formName), null, 4),
        ...additionalData
    });
};

const getQScoringTableSection = (formDescriptor: FormDescriptor): Content => {
    const store = formDescriptor.valueStore;
    const rawData = store.getField("Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat");
    const data = JSON.parse(rawData || "[]");

    const d = (row: number, col: number) => cD(data[row]?.[col] ?? 0);

    const tableBody = [
        [
            { text: "Tudományos folyóiratcikk", bold: true, fillColor: "#dddddd" },
            { text: "Darab", bold: true, alignment: "center" as const, fillColor: "#dddddd" },
            { text: "Pontszám", bold: true, alignment: "center" as const, fillColor: "#dddddd" }
        ],
        [
            { text: "Lektorált folyóiratcikk" },
            { text: String(d(1, 0) + d(1, 2) + d(1, 4)), alignment: "center" as const },
            { text: String(d(1, 6)), alignment: "center" as const }
        ],
        [{ text: "Lektorált folyóirat cikk IF-ral" }, { text: String(d(2, 0) + d(2, 2) + d(2, 4)), alignment: "center" as const }, { text: "" }],
        [{ text: "Lektorált folyóirat egyszerzős IF-os cikk" }, { text: String(d(3, 0) + d(3, 2) + d(3, 4)), alignment: "center" as const }, { text: "" }],
        [
            { text: "Konferenciacikk konferenciakötetben, folyóiratban, könyvrészletben" },
            { text: String(d(4, 0) + d(4, 2) + d(4, 4)), alignment: "center" as const },
            { text: String(d(4, 6)), alignment: "center" as const }
        ],
        [
            { text: "Tudományos folyóirat és konferenciacikk Q érték", bold: true, colSpan: 2 },
            { text: "" },
            { text: String(d(1, 6) + d(4, 6)), bold: true, alignment: "center" as const }
        ]
    ];

    const tableBody2 = [
        [
            { text: "Tudományos könyv, könyvrészlet szerzőként", bold: true, fillColor: "#dddddd" },
            { text: "Darab", bold: true, alignment: "center" as const, fillColor: "#dddddd" },
            { text: "Pontszám", bold: true, alignment: "center" as const, fillColor: "#dddddd" }
        ],
        [
            { text: "Könyv" },
            { text: String(d(6, 0) + d(6, 2) + d(6, 4)), alignment: "center" as const },
            { text: String(d(6, 6)), alignment: "center" as const }
        ],
        [
            { text: "Könyvrészlet" },
            { text: String(d(7, 0) + d(7, 2) + d(7, 4)), alignment: "center" as const },
            { text: String(d(7, 6)), alignment: "center" as const }
        ],
        [
            { text: "Tudományos könyv és könyvrészlet Q érték", bold: true, colSpan: 2 },
            { text: "" },
            { text: String(d(6, 6) + d(7, 6)), bold: true, alignment: "center" as const }
        ]
    ];

    return [
        {
            margin: [20, 5, 0, 0],
            table: { widths: ["*", 50, 50], body: tableBody }
        },
        {
            margin: [20, 10, 0, 0],
            table: { widths: ["*", 50, 50], body: tableBody2 }
        }
    ] as Content;
};

const getQScoreSummarySection = (formDescriptor: FormDescriptor): Content => {
    const store = formDescriptor.valueStore;
    const achievementQ = store.getArray("Előterjesztői|Tudományos minimumkövetelmények|Q-szám|A kérelmező alkotási teljesítménye|Pontszám");
    const category = store.getField(
        "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória"
    );
    const rawData = store.getField("Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat");
    const data = JSON.parse(rawData || "[]");

    const achievementQValue = Math.round(10000 * achievementQ.reduce((sum, val) => sum + cD(val), 0)) / 10000;
    const paperQValue = cD(data[1]?.[6]) + cD(data[4]?.[6]);
    const bookQValue = cD(data[6]?.[6]) + cD(data[7]?.[6]);

    const minPaperQ = getMinPaperQ(category);
    const maxBookQ = getMaxBookQ();
    const maxAchievementQ = getMaxAchievementQ(category);
    const totalQ = paperQValue + Math.min(bookQValue, maxBookQ) + Math.min(achievementQValue, maxAchievementQ);
    const minTotalQ = getMinTotalQ(category);
    const satisfied = totalQ >= minTotalQ;

    const tableBody = [
        [
            { text: "Összetevői", bold: true, fillColor: "#dddddd" },
            { text: "Előírt", bold: true, alignment: "center" as const, fillColor: "#dddddd" },
            { text: "Elért", bold: true, alignment: "center" as const, fillColor: "#dddddd" },
            { text: "Figyelembe vehető", bold: true, alignment: "center" as const, fillColor: "#dddddd" }
        ],
        [
            { text: "Tudományos cikk" },
            { text: `minimum ${minPaperQ}`, alignment: "center" as const },
            { text: String(paperQValue), alignment: "center" as const },
            { text: String(paperQValue), alignment: "center" as const }
        ],
        [
            { text: "Tudományos könyv, könyvrészlet" },
            { text: `maximum ${maxBookQ}`, alignment: "center" as const },
            { text: String(bookQValue), alignment: "center" as const },
            { text: String(Math.min(bookQValue, maxBookQ)), alignment: "center" as const }
        ],
        [
            { text: "Kiemelkedő alkotás" },
            { text: `maximum ${maxAchievementQ}`, alignment: "center" as const },
            { text: String(achievementQValue), alignment: "center" as const },
            { text: String(Math.min(achievementQValue, maxAchievementQ)), alignment: "center" as const }
        ],
        [{ text: "Összesen", bold: true }, { text: "" }, { text: "" }, { text: String(totalQ), bold: true, alignment: "center" as const }]
    ];

    const summaryBody = [
        [
            { text: "A kérelmező által elért publikációs (alkotási, Q) érték:", bold: false },
            { text: String(totalQ), bold: true, alignment: "center" as const }
        ],
        [
            { text: "Minimum követelmény (Qmin):", bold: false },
            { text: String(minTotalQ), bold: true, alignment: "center" as const }
        ],
        [
            { text: "A kérelmező teljesítette a Q ≥ Qmin követelményt:", bold: false },
            { text: satisfied ? "IGEN" : "NEM", bold: true, alignment: "center" as const }
        ]
    ];

    return [
        {
            margin: [20, 5, 0, 0],
            table: { widths: ["*", 80, 50, 80], body: tableBody }
        },
        {
            margin: [20, 10, 0, 0],
            table: { widths: ["*", 80], body: summaryBody },
            layout: { defaultBorder: false }
        }
    ] as Content;
};

const getIScoreSummarySection = (formDescriptor: FormDescriptor): Content => {
    const store = formDescriptor.valueStore;
    const category = store.getField(
        "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória"
    );
    const iScore = parseInt(store.getField("Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|I-szám") || "0");
    const minIScore = getMinTotalI(category);
    const satisfied = iScore >= minIScore;
    return {
        text: ["A kérelmező teljesítette az I ≥ Imin követelményt: ", { text: satisfied ? "IGEN" : "NEM", bold: true }],
        bold: true,
        margin: [20, 5, 0, 5]
    };
};

const getItemizedRequirementsSection = async (formDescriptor: FormDescriptor): Promise<Content[]> => {
    const store = formDescriptor.valueStore;
    const achievementQ = store.getArray("Előterjesztői|Tudományos minimumkövetelmények|Q-szám|A kérelmező alkotási teljesítménye|Pontszám");
    const category = store.getField(
        "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória"
    );
    const rawData = store.getField("Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat");
    const data = JSON.parse(rawData || "[]");
    const iScore = parseInt(store.getField("Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|I-szám") || "0");
    const phdStudents = cD(
        store.getField("Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók|Összes|Fokozatott szerzett doktoranduszok száma") ||
            0
    );

    const achievementQValue = Math.round(10000 * achievementQ.reduce((sum, val) => sum + cD(val), 0)) / 10000;
    const paperQValue = cD(data[1]?.[6]) + cD(data[4]?.[6]);
    const bookQValue = cD(data[6]?.[6]) + cD(data[7]?.[6]);

    const minPaperQ = getMinPaperQ(category);
    const maxBookQ = getMaxBookQ();
    const maxAchievementQ = getMaxAchievementQ(category);
    const minIScore = getMinTotalI(category);
    const minTotalQ = getMinTotalQ(category);

    const hunPapers = cD(data[13]?.[0] ?? 0);
    const minHunPapers = 1;

    const asIfPapers = cD(data[14]?.[0] ?? 0);
    const minSaIfPhdSum = 2;

    const ifPapers = cD(data[15]?.[0] ?? 0);
    const relIf = cD(data[16]?.[0] ?? 0);
    const wosCitations = cD(data[11]?.[0] ?? 0);
    const hIndex = cD(data[12]?.[0] ?? 0);
    const minHIndex = getMinHIndex(category);

    const optionalSatisfied =
        paperQValue >= minPaperQ * 1.5 || bookQValue >= maxBookQ * 1.5 || achievementQValue >= maxAchievementQ * 1.5 || iScore >= 1.5 * minIScore;

    const allSatisfied =
        paperQValue >= minPaperQ &&
        optionalSatisfied &&
        hunPapers >= minHunPapers &&
        asIfPapers + phdStudents >= minSaIfPhdSum &&
        ifPapers >= minTotalQ * 0.5 &&
        relIf >= minTotalQ * 0.25 &&
        hIndex >= minHIndex &&
        wosCitations >= minIScore * 0.5;

    const check = (ok: boolean) => ({ text: ok ? "✓" : "✗", alignment: "center" as const });
    const num = (v: number) => ({ text: String(v), alignment: "center" as const });

    const tableBody = [
        [
            { text: "", bold: true, fillColor: "#dddddd" },
            { text: "Tételes publikációs elvárások", bold: true, fillColor: "#dddddd" },
            { text: "Saját", bold: true, alignment: "center" as const, fillColor: "#dddddd" },
            { text: "Minimum", bold: true, alignment: "center" as const, fillColor: "#dddddd" },
            { text: "Teljesül", bold: true, alignment: "center" as const, fillColor: "#dddddd" }
        ],
        [
            { text: "1." },
            { text: "A Q érték cikkekre külön is érje el a cikkekre előírt minimumot" },
            num(paperQValue),
            num(minPaperQ),
            check(paperQValue >= minPaperQ)
        ],
        [
            { text: "2.a." },
            { text: "Cikkekre érjen el szignifikánsan (≥ 50%-kal) nagyobb Q értéket" },
            num(paperQValue),
            num(minPaperQ * 1.5),
            { ...check(optionalSatisfied), rowSpan: 4 }
        ],
        [{ text: "2.b." }, { text: "Könyvekre érjen el szignifikánsan (≥ 50%-kal) nagyobb Q értéket" }, num(bookQValue), num(maxBookQ * 1.5), { text: "" }],
        [
            { text: "2.c." },
            { text: "Alkotásokra érjen el szignifikánsan (≥ 50%-kal) nagyobb Q értéket" },
            num(achievementQValue),
            num(maxAchievementQ * 1.5),
            { text: "" }
        ],
        [{ text: "2.d." }, { text: "Idézettségre érjen el szignifikánsan (≥ 50%-kal) nagyobb értéket" }, num(iScore), num(minIScore * 1.5), { text: "" }],
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
            num(minTotalQ * 0.5),
            check(ifPapers >= minTotalQ * 0.5)
        ],
        [
            { text: "6." },
            { text: "A viszonyított IF-számok összege legyen legalább 0,25 Qmin" },
            num(relIf),
            num(minTotalQ * 0.25),
            check(relIf >= minTotalQ * 0.25)
        ],
        [
            { text: "7." },
            { text: "A WoS-ben megjelent hivatkozásainak darabszáma legyen legalább 0,5 Imin" },
            num(wosCitations),
            num(minIScore * 0.5),
            check(wosCitations >= minIScore * 0.5)
        ],
        [{ text: "8." }, { text: "MTMT-ben szereplő független hivatkozásokból számolt Hirsch-indexe" }, num(hIndex), num(minHIndex), check(hIndex >= minHIndex)]
    ];

    return [
        {
            margin: [20, 5, 0, 0],
            table: {
                widths: [30, "*", 50, 50, 45],
                body: tableBody
            }
        },
        {
            text: ["A kérelmező maradéktalanul teljesítette a tételes publikációs elvárásokat: ", { text: allSatisfied ? "IGEN" : "NEM", bold: true }],
            margin: [20, 5, 0, 5]
        }
    ];
};

const getShortThesisRequirementsSection = (formDescriptor: FormDescriptor): Content[] => {
    const store = formDescriptor.valueStore;
    const d1Pubs = store.getArray("Kérelmezői|A doktori mű adatai|D1 közlemények listája|D1 közlemények listája|Cikk MTMT azonosítója");
    const thesisPubs = store.getArray("Kérelmezői|A doktori mű adatai|Téziseket alátámasztó publikációk|Téziseket alátámasztó publikációk|Cikk MTMT azonosítója");
    const d1Share = d1Pubs.reduce((sum, mtmt) => {
        const numAuthors = getNumOfAuthorsInPub(mtmt);
        return sum + (numAuthors > 0 ? 1 / numAuthors : 0);
    }, 0);

    const rawData = store.getField("Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat");
    const data = JSON.parse(rawData || "[]");
    const wosNumber = cD(data[11]?.[0] ?? 0);
    const numericalRequirementsMet = d1Share >= 3 && wosNumber >= 750;

    const thesisPubRows = thesisPubs.map((mtmt, index) => {
        const rating = getRatingOfPub(mtmt);
        const numAuthors = getNumOfAuthorsInPub(mtmt);
        const satisfies = (rating === "D1" || rating === "Q1") && numAuthors <= 3;
        return [
            { text: `${index + 1}.` },
            {
                text: mtmt,
                link: `https://m2.mtmt.hu/api/publication/${mtmt}`,
                color: "#1d4ed8",
                decoration: "underline" as const
            },
            { text: rating, alignment: "center" as const },
            { text: String(numAuthors), alignment: "center" as const },
            { text: satisfies ? "✓" : "✗", alignment: "center" as const }
        ];
    });

    return [
        {
            margin: [20, 5, 0, 0],
            table: {
                widths: ["*", 80],
                body: [
                    [{ text: "SJR D1 cikkek összegzett szerzői részaránya:" }, { text: d1Share.toFixed(3), alignment: "right" as const }],
                    [{ text: "Független WoS hivatkozások száma:" }, { text: String(wosNumber), alignment: "right" as const }],
                    [
                        { text: "A kérelmező teljesítette a rövid értekezés speciális számszerű követelményeit:" },
                        { text: numericalRequirementsMet ? "IGEN" : "NEM", bold: true, alignment: "right" as const }
                    ]
                ]
            },
            layout: { defaultBorder: false }
        },
        { text: "A kérelmező által megjelölt téziseket alátámasztó publikációk:", margin: [20, 8, 0, 4] },
        {
            margin: [20, 0, 0, 0],
            table: {
                widths: [25, "*", 60, 60, 50],
                body: [
                    [
                        { text: "", bold: true, fillColor: "#dddddd" },
                        { text: "MTMT azonosító", bold: true, fillColor: "#dddddd" },
                        { text: "Besorolás", bold: true, alignment: "center" as const, fillColor: "#dddddd" },
                        { text: "Szerzőszám", bold: true, alignment: "center" as const, fillColor: "#dddddd" },
                        { text: "Teljesül", bold: true, alignment: "center" as const, fillColor: "#dddddd" }
                    ],
                    ...thesisPubRows
                ]
            }
        }
    ];
};

const getPublicActivitySummarySection = (formDescriptor: FormDescriptor): Content[] => {
    const store = formDescriptor.valueStore;
    const minimumRequired = getMinCommunityCount();
    let actualCount = 0;

    for (const sectionKey of activityRequirementSectionKeys) {
        const value = store.getField(`Előterjesztői|Tudományos közéleti tevékenység|${sectionKey}|Értékelés|Követelmény teljesül`);

        if (value.toLowerCase() === "igen") {
            actualCount++;
        }
    }

    return [
        {
            margin: [20, 5, 0, 0],
            table: {
                widths: ["*", 60],
                body: [
                    [
                        { text: "Teljesítendő tudományos közéleti szempontok száma:" },
                        { text: String(minimumRequired), bold: true, alignment: "right" as const }
                    ],
                    [{ text: "Teljesített tudományos közéleti szempontok száma:" }, { text: String(actualCount), bold: true, alignment: "right" as const }]
                ]
            },
            layout: { defaultBorder: false }
        }
    ];
};

const getBiraloBizottsagSection = async (formDescriptor: FormDescriptor): Promise<Content[]> => {
    const store = formDescriptor.valueStore;
    const result: Content[] = [];
    const pageKey = "Előterjesztői|Bíráló bizottság";
    for (const section of biraloBizottsag.sections) {
        if (section.attribs?.noPrint) continue;
        for (const group of section.groups) {
            if (group.attribs?.noPrint) continue;
            const keyPrefix = `${pageKey}|${section.key}|${group.key}`;
            const length = parseInt(store.getField(`${keyPrefix}|_length`)) || 0;
            result.push({ text: section.key, style: "grouplabel" });
            if (length === 0) {
                result.push({ text: "Nincs megadva", italics: true, margin: [20, 0, 0, 5] } as Content);
            } else {
                result.push(...(await groupToPdfTableDefinition("", group, formDescriptor, keyPrefix, {})));
            }
        }
    }
    return result;
};
