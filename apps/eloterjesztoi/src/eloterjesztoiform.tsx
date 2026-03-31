import { readJsonFromPdf, mtmtPubSummaryCacheAtom, store, type FormInfo } from "@repo/form-engine";
import { atomsFromJSON, createAtomsFromDescriptor, getByPath, type FormDescriptor } from "@repo/form-engine";
import { getCategory, getMinCommunityCount, getMinPaperQ, getMinTotalI } from "./requirements.tsx";
import { loadMTMTCitations, loadMTMTPublications, loadPubItemSummary, type PubItemSummary } from "@repo/form-engine";
import { eloterjesztoAdatai } from "./lap-eloterjesztoadatai.ts";
import { palyazoAdatai } from "./lap-palyazoadatai.ts";
import { tudomanymetria } from "./lap-tudomanymetria.ts";
import { otPublikacio } from "./lap-otpublikacio.ts";
import { otHivatkozas } from "./lap-othivatkozas.ts";
import { kozeletiTevekenyseg } from "./lap-kozeleti.ts";
import { osszesites } from "./lap-osszesites.ts";
import { applicantDataLoaded } from "./atoms.ts";
import { FileDown, FileUp } from "lucide-react";
import { savePDF } from "./pdfsaver.ts";
import { osszefoglalo } from "./lap-osszefoglalo.ts";
import { biraloBizottsag } from "./lap-biralobizottsag.ts";

// A form neve, ez lesz a form adatok prefixe is a JSON-ban
export const formName = "Előterjesztői";

// Összeszedjük az összes lapot
export const eloterjesztoiFormDescriptor: FormDescriptor = {
    "Előterjesztő adatai": eloterjesztoAdatai,
    "Pályázó adatai": palyazoAdatai,
    Tudománymetria: tudomanymetria,
    "Öt kiemelt publikáció": otPublikacio,
    "Öt kiemelt hivatkozás": otHivatkozas,
    "Közéleti tevékenység": kozeletiTevekenyseg,
    Minimumkövetelmények: osszesites,
    Javaslat: osszefoglalo,
    "Bíráló bizottság": biraloBizottsag
};

// elkészítjük a form mezők tárolóját
export const eloterjesztoiFormData = createAtomsFromDescriptor(formName, eloterjesztoiFormDescriptor);

// ha a kategória változik, frissítjük az elvárásokat tartalmazó mezőket
store.sub(
    eloterjesztoiFormData[
        "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória"
    ],
    onCategoryChange
);

function onCategoryChange() {
    const category = store.get(
        eloterjesztoiFormData[
            "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória"
        ]
    )[0];
    if (category) {
        store.set(
            eloterjesztoiFormData[
                "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Q küszöbszám"
            ],
            [String(getMinPaperQ(category))]
        );
        store.set(
            eloterjesztoiFormData[
                "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|I küszöbszám"
            ],
            [String(getMinTotalI(category))]
        );
        store.set(
            eloterjesztoiFormData[
                "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Tud. köz. szempontok"
            ],
            [String(getMinCommunityCount())]
        );
    }
}

let mtmtDataInForm: Record<string, unknown> | null = null;
let applicantDataInForm: Record<string, unknown> | null = null;

// ezt kell meghívni, miután betöltötték a kérelmezői adatlapot, hogy az ottaniaknak megfelelően frissüljenek a form mezői
export async function loadApplicantData(data: Record<string, unknown>, mtmtData: Record<string, unknown>) {
    mtmtDataInForm = mtmtData;
    applicantDataInForm = data;
    atomsFromJSON(data, eloterjesztoiFormData, "", true);
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    const committee = getByPath(
        data,
        "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Illetékes bizottság"
    ) as string | undefined;
    const category = getCategory(committee || "");
    store.set(
        eloterjesztoiFormData[
            "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória"
        ],
        [category]
    );
    const sciMetrics = JSON.parse(
        getByPath(data, "Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat") as string
    );
    store.set(eloterjesztoiFormData["Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|Független idézők száma"], [sciMetrics[9][0] || "0"]);
    store.set(eloterjesztoiFormData["Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|I-szám"], [sciMetrics[10][0] || "0"]);
    store.set(eloterjesztoiFormData["Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|WoS idézők száma"], [sciMetrics[11][0] || "0"]);
    store.set(eloterjesztoiFormData["Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|H-index"], [sciMetrics[12][0] || "0"]);

    // load 5 most important citations
    const summaryCache = store.get(mtmtPubSummaryCacheAtom);
    const citedPapers = getByPath(data, "Legfontosabb hivatkozások|Öt legfontosabb hivatkozás|Öt legfontosabb hivatkozás|Hivatkozott közlemény") as
        | string[]
        | undefined;
    if (citedPapers) {
        for (const mtid of citedPapers) {
            if (mtid) {
                if (!summaryCache[mtid]) {
                    await loadMTMTCitations(mtid);
                }
            }
        }
    }
    store.set(applicantDataLoaded, true);
}

// összeállítjuk és exportáljuk a formhoz tartozó információkat, amiket a form engine használni fog
export const eloterjesztoiFormInfo: FormInfo = {
    name: formName,
    title: "MTA Műszaki Tudományok Osztálya",
    subtitle: "MTA doktori pályázat, előterjesztői űrlap",
    data: eloterjesztoiFormData,
    descriptor: eloterjesztoiFormDescriptor,
    buttons: [
        {
            label: "Adatlap mentése",
            icon: <FileDown />,
            onClick: async (formData, setDialogMessage: (message: string) => void) => {
                setDialogMessage("Adatlap mentése");
                for (const key in formData) {
                    console.log(key);
                }

                await savePDF(eloterjesztoiFormDescriptor, formData, formName, {
                    "kerelmezo_form.json": JSON.stringify(applicantDataInForm, null, 4),
                    "kerelmezo_mtmt.json": JSON.stringify(mtmtDataInForm, null, 4)
                });
                setDialogMessage("");
            }
        },
        {
            label: "Adatlap betöltése",
            icon: <FileUp />,
            onClick: async (formData, setDialogMessage: (message: string) => void) => {
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
                    return;
                }

                const parsedContent = JSON.parse(formContent);

                if (applicantContent) {
                    const applicantData = JSON.parse(applicantContent);
                    const mtmtData = mtmtContent ? JSON.parse(mtmtContent) : {};
                    setDialogMessage("Publikációk és hivatkozások betöltése");
                    if ("Adatlapon szereplő publikációk" in mtmtData && "A pályázó összes publikációja a beadáskor" in mtmtData) {
                        loadPubItemSummary(mtmtData["Adatlapon szereplő publikációk"] as Record<string, PubItemSummary>);
                    } else {
                        const mtmtId = String(
                            getByPath(applicantData, "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|MTMT azonosító") || ""
                        );
                        if (mtmtId) {
                            await loadMTMTPublications(mtmtId);
                        }
                    }
                    await loadApplicantData(applicantData, mtmtData);
                }

                atomsFromJSON(parsedContent, formData);
                setDialogMessage("");
            }
        }
    ]
};
