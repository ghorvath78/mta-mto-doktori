import { chooseAndLoadPdf, mtmtPubSummaryCacheAtom, store, type FormInfo } from "@repo/form-engine";
import { atomsFromJSON, createAtomsFromDescriptor, getByPath, type FormDescriptor } from "@repo/form-engine";
import { getCategory, getMinCommunityCount, getMinPaperQ, getMinTotalI } from "./requirements.tsx";
import { loadMTMTCitations } from "@repo/form-engine";
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
    Javaslat: osszefoglalo
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

// ezt kell meghívni, miután betöltötték a kérelmezői adatlapot, hogy az ottaniaknak megfelelően frissüljenek a form mezői
export async function loadApplicantData(data: Record<string, unknown>) {
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
    store.set(eloterjesztoiFormData["Előterjesztői|Tudományos minimumkövetelmények|I-szám|Táblázat|Független idézők száma"], [sciMetrics[9][0] || "0"]);
    store.set(eloterjesztoiFormData["Előterjesztői|Tudományos minimumkövetelmények|I-szám|Táblázat|I-szám"], [sciMetrics[10][0] || "0"]);
    store.set(eloterjesztoiFormData["Előterjesztői|Tudományos minimumkövetelmények|I-szám|Táblázat|WoS idézők száma"], [sciMetrics[11][0] || "0"]);
    store.set(eloterjesztoiFormData["Előterjesztői|Tudományos minimumkövetelmények|I-szám|Táblázat|H-index"], [sciMetrics[12][0] || "0"]);

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

                await savePDF(eloterjesztoiFormDescriptor, formData);
                setDialogMessage("");
            }
        },
        {
            label: "Adatlap betöltése",
            icon: <FileUp />,
            onClick: async (formData, setDialogMessage: (message: string) => void) => {
                const content = await chooseAndLoadPdf("eloterjeszto_form.json");
                if (!content) return;
                setDialogMessage("Adatlap betöltése");
                const parsedContent = JSON.parse(content);
                setDialogMessage("Pubikációk és hivatkozások betöltése");
                atomsFromJSON(parsedContent, formData);
                setDialogMessage("");
            }
        }
    ]
};
