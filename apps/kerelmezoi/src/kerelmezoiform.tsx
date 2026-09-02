import { chooseAndLoadPdf, FormStore, type FormDescriptor } from "@repo/form-engine";
import { type PageDescriptor } from "@repo/form-engine";
import { fobbAdatok } from "./lap-fobbadatok";
import { doktoriMu } from "./lap-doktorimu";
import { publikaciok } from "./lap-publikaciok";
import { hivatkozasok } from "./lap-hivatkozasok";
import { alkotasok } from "./lap-alkotasok";
import { tudomanymetria } from "./lap-tudomanymetria";
import { kozeletiTevekenyseg } from "./lap-kozeleti";
import { osszefoglalas } from "./lap-osszefoglalas";
import { createMTMTTools, getPubRating, loadMTMTCitations } from "@repo/mtmt-tools";
import { FileDown, FileUp } from "lucide-react";
import { savePDF } from "./pdfsaver";
import { getFromObjectByKey } from "@repo/form-engine";

// A form neve, ez lesz a form adatok prefixe is a JSON-ban
export const formName = "Kérelmezői";

// Összeszedjük az összes lapot
const pages: PageDescriptor[] = [fobbAdatok, doktoriMu, publikaciok, hivatkozasok, alkotasok, tudomanymetria, kozeletiTevekenyseg, osszefoglalas];

export const valueStore = new FormStore(formName, pages);
const mtmt = createMTMTTools();

type JsonMap = Record<string, unknown>;

// Legkésőbb a mentés előtt frissítjük a D1-es publikációk listáját, ami szintén az adatlap része, de a MTMT-ből származik, így nem szerkeszthető kézzel.
const updateD1Field = () => {
    // csak ha van betöltött publikációs lista
    if (mtmt.mtmtPubList.status === "done") {
        let d1PubNum = 0;
        for (const pub of mtmt.mtmtPubList.publications) {
            if (getPubRating(pub) === "D1") {
                valueStore.setField(
                    `Kérelmezői|A doktori mű adatai|D1 közlemények listája|D1 közlemények listája[[${d1PubNum}]]|Cikk MTMT azonosítója`,
                    String(pub["mtid"])
                );
                d1PubNum++;
            }
        }
        valueStore.setField("Kérelmezői|A doktori mű adatai|D1 közlemények listája|D1 közlemények listája|_length", String(d1PubNum));
    }
};

export const beforeLoad = async (json: JsonMap) => {
    const data = (json?.["Kérelmezői"] as JsonMap | undefined)?.["A kérelmező főbb adatai"] as JsonMap | undefined;
    const mtmtUserId = (data?.["Személyes adatok"] as JsonMap | undefined)?.["MTMT azonosító"] as string | undefined;
    if (mtmtUserId) {
        await mtmt.mtmtPubList.loadMTMTPublications(mtmtUserId);
        for (const page of pages) {
            for (const section of page.sections) {
                for (const group of section.groups) {
                    for (const field of group.fields) {
                        if (field.type === "mtmtCitation") {
                            const pubKeys = getFromObjectByKey(json, String(field?.attribs?.pubKey)) as string[];
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

export const afterLoad = async () => {
    updateD1Field();
    const scientometrics = valueStore.getField("Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat");
    try {
        mtmt.mtmtScientometrics.set(JSON.parse(scientometrics));
    } catch {
        await mtmt.mtmtScientometrics.load(mtmt.mtmtPubList.userId);
    }
};

// összeállítjuk és exportáljuk a formhoz tartozó információkat, amiket a form engine használni fog
export const kerelmezoiFormDescriptor: FormDescriptor = {
    name: formName,
    title: "MTA Műszaki Tudományok Osztálya",
    subtitle: "MTA doktori pályázat, kérelmezői űrlap",
    valueStore,
    pages,
    buttons: [
        {
            label: "Adatlap mentése",
            icon: <FileDown />,
            onClick: async (_, setDialogMessage: (message: string) => void) => {
                setDialogMessage("Adatlap mentése");
                // összeszedjük a D1 publikációkat és hozzávesszük az adatokhoz
                updateD1Field();
                // hozzáadjuk a tudománymetriai adatokat is egy rejtett mezőbe
                const scientometrics = JSON.stringify(mtmt.mtmtScientometrics.scientometrics);
                valueStore.setField("Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat", scientometrics);
                await savePDF(kerelmezoiFormDescriptor);
                setDialogMessage("");
            }
        },
        {
            label: "Adatlap betöltése",
            icon: <FileUp />,
            onClick: async (_, setDialogMessage: (message: string) => void) => {
                const content = await chooseAndLoadPdf("kerelmezo_form.json");
                if (!content) return;
                setDialogMessage("Adatlap betöltése");
                const parsedContent = JSON.parse(content);
                valueStore.initialize(formName, pages);
                setDialogMessage("Pubikációk és hivatkozások betöltése");
                await beforeLoad(parsedContent);
                valueStore.fromJSON(parsedContent);
                await afterLoad();
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
    ],
    ...mtmt
};
