import {
    atomsFromJSON,
    // chooseAndLoadJSON,
    chooseAndLoadPdf,
    getByPath,
    loadMTMTCitations,
    loadMTMTPublications,
    loadScientometrics,
    mtmtScientometricsStatusAtom,
    store,
    type FormData,
    type FormInfo
} from "@repo/form-engine";
import { createAtomsFromDescriptor, type FormDescriptor } from "@repo/form-engine";
import { fobbAdatok } from "./lap-fobbadatok";
import { doktoriMu } from "./lap-doktorimu";
import { publikaciok } from "./lap-publikaciok";
import { hivatkozasok } from "./lap-hivatkozasok";
import { alkotasok } from "./lap-alkotasok";
import { tudomanymetria } from "./lap-tudomanymetria";
import { kozeletiTevekenyseg } from "./lap-kozeleti";
import { osszefoglalas } from "./lap-osszefoglalas";
import { getRanking, mtmtPubListAtom, mtmtPubListStatusAtom, mtmtScientometricsAtom } from "@repo/form-engine";
import { FileDown, FileUp } from "lucide-react";
import { savePDF } from "./pdfsaver";

// A form neve, ez lesz a form adatok prefixe is a JSON-ban
export const formName = "Kérelmezői";

// Összeszedjük az összes lapot
export const kerelmezoiFormDescriptor: FormDescriptor = {
    "Főbb adatok": fobbAdatok,
    "A doktori mű": doktoriMu,
    "Legfontosabb publikációk": publikaciok,
    "Legfontosabb hivatkozások": hivatkozasok,
    "Műszaki alkotások": alkotasok,
    Tudománymetria: tudomanymetria,
    "Közéleti tevékenység": kozeletiTevekenyseg,
    "Munkásság összefoglalása": osszefoglalas
};

export const kerelmezoiFormData = createAtomsFromDescriptor(formName, kerelmezoiFormDescriptor);

type JsonMap = Record<string, unknown>;

// Legkésőbb a mentés előtt frissítjük a D1-es publikációk listáját, ami szintén az adatlap része, de a MTMT-ből származik, így nem szerkeszthető kézzel.
const updateD1Field = (formData: FormData) => {
    // csak ha van betöltött publikációs lista
    if (store.get(mtmtPubListStatusAtom) === "done") {
        const d1Pubs = [];
        for (const pub of store.get(mtmtPubListAtom) || []) {
            if (getRanking(pub) === "D1") {
                d1Pubs.push(pub);
            }
        }
        store.set(
            formData["Kérelmezői|A doktori mű adatai|D1 közlemények listája|D1 közlemények listája|Cikk MTMT azonosítója"],
            d1Pubs.map((pub) => pub["mtid"])
        );
        store.set(formData["Kérelmezői|A doktori mű adatai|D1 közlemények listája|D1 közlemények listája|_length"], [String(d1Pubs.length)]);
    }
};

export const beforeLoad = async (json: JsonMap) => {
    const data = (json?.["Kérelmezői"] as JsonMap | undefined)?.["A kérelmező főbb adatai"] as JsonMap | undefined;
    const mtmt = (data?.["Személyes adatok"] as JsonMap | undefined)?.["MTMT azonosító"] as string | undefined;
    if (mtmt) {
        await loadMTMTPublications(mtmt);
        for (const value of Object.values(kerelmezoiFormDescriptor)) {
            for (const section of value.sections) {
                for (const group of section.groups) {
                    for (const field of group.fields) {
                        if (field.type === "mtmtCitation") {
                            const pubKeys = getByPath(json, String(field?.attribs?.pubKey)) as string[];
                            for (const mtid of pubKeys || []) {
                                if (mtid) {
                                    await loadMTMTCitations(mtid);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export const afterLoad = async (formData: FormData) => {
    updateD1Field(formData);
    const scientometrics = store.get(formData["Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat"]);
    try {
        store.set(mtmtScientometricsAtom, JSON.parse(scientometrics[0]));
        store.set(mtmtScientometricsStatusAtom, "done");
    } catch {
        await loadScientometrics();
    }
};

// összeállítjuk és exportáljuk a formhoz tartozó információkat, amiket a form engine használni fog
export const kerelmezoiFormInfo: FormInfo = {
    name: formName,
    title: "MTA Műszaki Tudományok Osztálya",
    subtitle: "MTA doktori pályázat, kérelmezői űrlap",
    data: kerelmezoiFormData,
    descriptor: kerelmezoiFormDescriptor,
    buttons: [
        {
            label: "Adatlap mentése",
            icon: <FileDown />,
            onClick: async (formData, setDialogMessage: (message: string) => void) => {
                setDialogMessage("Adatlap mentése");
                // összeszedjük a D1 publikációkat és hozzávesszük az adatokhoz
                updateD1Field(formData);
                // hozzáadjuk a tudománymetriai adatokat is egy rejtett mezőbe
                const scientometrics = JSON.stringify(store.get(mtmtScientometricsAtom));
                store.set(formData["Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat"], [scientometrics]);
                await savePDF(kerelmezoiFormDescriptor, formData);
                setDialogMessage("");
            }
        },
        {
            label: "Adatlap betöltése",
            icon: <FileUp />,
            onClick: async (formData, setDialogMessage: (message: string) => void) => {
                const content = await chooseAndLoadPdf("kerelmezo_form.json");
                if (!content) return;
                setDialogMessage("Adatlap betöltése");
                const parsedContent = JSON.parse(content);
                setDialogMessage("Pubikációk és hivatkozások betöltése");
                await beforeLoad(parsedContent);
                atomsFromJSON(parsedContent, formData);
                await afterLoad(formData);
                setDialogMessage("");
            }
        } /*,
        {
            label: "Test JSON betöltése",
            icon: <FileUp />,
            onClick: async (formData, setDialogMessage: (message: string) => void) => {
                const content = await chooseAndLoadJSON();
                if (!content) return;
                setDialogMessage("Adatlap betöltése");
                const parsedContent = JSON.parse(content);
                setDialogMessage("Pubikációk és hivatkozások betöltése");
                await beforeLoad(parsedContent);
                atomsFromJSON(parsedContent, formData);
                await afterLoad(formData);
                setDialogMessage("");
            }
        }*/
    ]
};
