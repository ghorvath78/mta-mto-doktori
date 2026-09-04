import { createFormDescriptor, readJsonFromPdf } from "@repo/form-engine";
import { getFromObjectByKey } from "@repo/form-engine";
import { getCategory, getMinPaperQ, getMinTotalI } from "./requirements.tsx";
import { createMTMTTools, loadMTMTCitations, PubList, PubListMinimal, type AuthorData, type PubItemMinimal } from "@repo/mtmt-tools";
import { eloterjesztoAdatai } from "./lap-eloterjesztoadatai.ts";
import { palyazoAdatai } from "./lap-palyazoadatai.ts";
import { tudomanymetria } from "./lap-tudomanymetria.ts";
import { otPublikacio } from "./lap-otpublikacio.ts";
import { otHivatkozas } from "./lap-othivatkozas.ts";
import { kozeletiTevekenyseg } from "./lap-kozeleti.ts";
import { osszesites } from "./lap-osszesites.ts";
import { FileDown, FileUp } from "lucide-react";
import { savePDF } from "./pdfsaver.ts";
import { osszefoglalo } from "./lap-osszefoglalo.ts";
import { biraloBizottsag } from "./lap-biralobizottsag.ts";

const mtmt = createMTMTTools();

// összeállítjuk és exportáljuk a formhoz tartozó információkat, amiket a form engine használni fog
export const eloterjesztoiFormDescriptor = createFormDescriptor({
    formName: "Előterjesztői",
    title: "MTA Műszaki Tudományok Osztálya",
    subtitle: "MTA doktori pályázat, előterjesztői űrlap",
    pages: [eloterjesztoAdatai, palyazoAdatai, tudomanymetria, otPublikacio, otHivatkozas, kozeletiTevekenyseg, osszesites, osszefoglalo, biraloBizottsag],
    buttons: [
        {
            label: "Adatlap mentése",
            icon: <FileDown />,
            onClick: async (_, setDialogMessage: (message: string) => void) => {
                setDialogMessage("Adatlap mentése");
                await savePDF(eloterjesztoiFormDescriptor, {
                    "kerelmezo_form.json": JSON.stringify(applicantDataInForm, null, 4),
                    "kerelmezo_mtmt.json": JSON.stringify(mtmtDataInForm, null, 4)
                });
                setDialogMessage("");
            }
        },
        {
            label: "Adatlap betöltése",
            icon: <FileUp />,
            onClick: async (_, setDialogMessage: (message: string) => void) => {
                const file = await new Promise<File | null>((resolve) => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".pdf,application/pdf";
                    input.oncancel = () => resolve(null);
                    input.onchange = () => resolve(input.files?.[0] ?? null);
                    input.click();
                });
                if (!file) return;

                setDialogMessage("Adatlap betöltése");
                const [formContent, applicantContent, mtmtContent] = await Promise.all([
                    readJsonFromPdf(file, "eloterjeszto_form.json"),
                    readJsonFromPdf(file, "kerelmezo_form.json"),
                    readJsonFromPdf(file, "kerelmezo_mtmt.json")
                ]);
                if (!formContent) {
                    setDialogMessage("");
                    alert("A kiválasztott PDF nem tartalmazza a szükséges adatokat. Kérem, válassza ki a form kitöltésekor letöltött PDF-et.");
                    return;
                }

                const parsedContent = JSON.parse(formContent);
                const valueStore = eloterjesztoiFormDescriptor.valueStore;
                valueStore.initialize(eloterjesztoiFormDescriptor);
                setDialogMessage("Publikációk és hivatkozások betöltése");
                await loadApplicantDataFromForm(applicantContent, mtmtContent);

                valueStore.fromJSON(parsedContent);
                setDialogMessage("");

                console.log("Betöltött form adatok:", valueStore.toJSON());
            }
        }
    ],
    extra: mtmt
});

export const valueStore = eloterjesztoiFormDescriptor.valueStore;

// ha a kategória változik, frissítjük az elvárásokat tartalmazó mezőket
valueStore.subscribeKey(
    "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória",
    onCategoryChange
);

function onCategoryChange() {
    const category = valueStore.getField(
        "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória"
    );
    if (category) {
        valueStore.setField(
            "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Q küszöbszám",
            String(getMinPaperQ(category))
        );
        valueStore.setField(
            "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|I küszöbszám",
            String(getMinTotalI(category))
        );
    }
}

let mtmtDataInForm: Record<string, unknown> | null = null;
let applicantDataInForm: Record<string, unknown> | null = null;

// ezt kell meghívni, miután betöltötték a kérelmezői adatlapot, hogy az ottaniaknak megfelelően frissüljenek a form mezői
export async function loadApplicantData(data: Record<string, unknown>, mtmtData: Record<string, unknown>) {
    mtmtDataInForm = mtmtData;
    applicantDataInForm = data;
    valueStore.fromJSON(data, "", true);
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    const committee = getFromObjectByKey(
        data,
        "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Illetékes bizottság"
    ) as string | undefined;
    const category = getCategory(committee || "");
    valueStore.setField(
        "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória",
        category
    );
    const sciMetrics = JSON.parse(
        getFromObjectByKey(data, "Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat") as string
    );
    valueStore.setField("Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|Független idézők száma", sciMetrics[9][0] || "0");
    valueStore.setField("Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|I-szám", sciMetrics[10][0] || "0");
    valueStore.setField("Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|WoS idézők száma", sciMetrics[11][0] || "0");
    valueStore.setField("Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|H-index", sciMetrics[12][0] || "0");

    // load 5 most important citations
    const summaryCache = eloterjesztoiFormDescriptor["mtmtPubListMinimal"] as PubListMinimal | null;
    if (!summaryCache) {
        console.error("No mtmtPubListMinimal found in form descriptor");
        return;
    }
    const citedPapers = getFromObjectByKey(data, "Legfontosabb hivatkozások|Öt legfontosabb hivatkozás|Öt legfontosabb hivatkozás|Hivatkozott közlemény") as
        | string[]
        | undefined;
    if (citedPapers) {
        for (const mtid of citedPapers) {
            if (mtid) {
                if (!summaryCache.publications[mtid]) {
                    await loadMTMTCitations(mtid);
                }
            }
        }
    }
    // store.set(applicantDataLoaded, true);
}

export function getApplicantAuthorRecord(): AuthorData | null {
    if (!mtmtDataInForm) return null;
    return (mtmtDataInForm["Szerzői adatok"] as AuthorData) || null;
}

export function getCommonPubsWithApplicant(mtid: string): string[] {
    if (!mtmtDataInForm) return [];
    const coAuthors = mtmtDataInForm["Társszerzők"] as Record<string, string[]>;
    const commonPubs: string[] = [];
    // iterate over all publications (all keys of coAuthors object) and if mtid is among the co-authors of that publication, add it to otherPubs set, if mtid is among the co-authors and "Kérelmező" is also among the co-authors, add it to the result array
    for (const [pubId, authors] of Object.entries(coAuthors)) {
        if (authors.map((a) => String(a)).includes(mtid)) {
            commonPubs.push(pubId);
        }
    }
    return commonPubs;
}

export function getNumOfAuthorsInPub(mtid: string): number {
    if (!mtmtDataInForm) return 0;
    const coAuthors = mtmtDataInForm["Társszerzők"] as Record<string, string[]>;
    const authors = coAuthors[mtid] || [];
    return authors.length;
}

export function getRatingOfPub(mtid: string): string {
    if (!mtmtDataInForm) return "";
    const pubSummaries = mtmtDataInForm["Adatlapon szereplő publikációk"] as Record<string, PubItemMinimal>;
    const summary = pubSummaries[mtid];
    return summary ? summary.rating : "";
}

export async function loadApplicantDataFromForm(applicantContent: string | undefined, mtmtContent: string | undefined) {
    if (applicantContent) {
        const applicantData = JSON.parse(applicantContent);
        const mtmtData = mtmtContent ? JSON.parse(mtmtContent) : {};
        const mtmtPubListMinimal = eloterjesztoiFormDescriptor["mtmtPubListMinimal"] as PubListMinimal | null;
        const mtmtPubList = eloterjesztoiFormDescriptor["mtmtPubList"] as PubList | null;
        if ("Adatlapon szereplő publikációk" in mtmtData && "Társszerzők" in mtmtData) {
            mtmtPubListMinimal?.load(mtmtData["Adatlapon szereplő publikációk"] as Record<string, PubItemMinimal>);
        } else {
            const mtmtId = String(
                getFromObjectByKey(applicantData, "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|MTMT azonosító") || ""
            );
            if (mtmtId) {
                await mtmtPubList?.loadMTMTPublications(mtmtId);
            }
        }
        await loadApplicantData(applicantData, mtmtData);
    }
}
