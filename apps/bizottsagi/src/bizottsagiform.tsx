import { createFormDescriptor, getFromObjectByKey } from "@repo/form-engine";
import { getCategory, getMinPaperQ, getMinTotalI } from "./requirements.tsx";
import { MAX_NOMINATORS, nominatorLoadedKey, nominatorPrefix } from "./nominators.ts";
import { bizottsag } from "./lap-bizottsag.ts";
import { tudomanymetria } from "./lap-tudomanymetria.ts";
import { kozeletiTevekenyseg } from "./lap-kozeleti.ts";
import { osszesites } from "./lap-osszesites.ts";
import { osszefoglalo } from "./lap-osszefoglalo.ts";

// FormStore key used as a page-visibility condition once legalább 2 előterjesztői adatlap be lett töltve.
// A "__meta" prefix jelzi, hogy futásidejű könyvelő adat, nem kerül be a mentett/betöltött JSON-ba.
// A lap-*.ts oldal-leírók ugyanezt az értéket string literálként hivatkozzák (nem importálhatják innen,
// mert ez a modul importálja őket vissza - körkörös const import "Cannot access before initialization" hibát dobna).
export const NOMINATORS_LOADED_KEY = "__meta|Legalább 2 előterjesztő betöltve";

// A ténylegesen megkövetelt minimum előterjesztő-szám - a feltöltő UI és a kapu-logika egyaránt ezt használja.
export const MIN_NOMINATORS = 2;

export const bizottsagiFormDescriptor = createFormDescriptor({
    formName: "Bizottsági",
    title: "MTA Műszaki Tudományok Osztálya",
    subtitle: "MTA doktori pályázat, bizottsági űrlap",
    pages: [bizottsag, tudomanymetria, kozeletiTevekenyseg, osszesites, osszefoglalo],
    generalHelpText:
        "Bizottsági adatlap\n\nEz az adatlap egyelőre csak a kitöltést támogatja - a kitöltött adatok mentése/PDF-exportja még nem elérhető, az oldal frissítésekor elvesznek.\n\nA \"Bizottság\" lap kitöltése után töltse fel legalább 2 előterjesztő mentett PDF adatlapját az \"Előterjesztők\" szakaszban - ez nyitja meg a további lapokat.",
    extra: {}
});

export const valueStore = bizottsagiFormDescriptor.valueStore;

// ha a kategória változik, frissítjük az elvárásokat tartalmazó mezőket
valueStore.subscribeKey(
    "Bizottsági|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória",
    onCategoryChange
);

function onCategoryChange() {
    const category = valueStore.getField(
        "Bizottsági|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória"
    );
    if (category) {
        valueStore.setField(
            "Bizottsági|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Q küszöbszám",
            String(getMinPaperQ(category))
        );
        valueStore.setField(
            "Bizottsági|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|I küszöbszám",
            String(getMinTotalI(category))
        );
    }
}

type PubRatingItem = { rating: string };

const CANONICAL_NAME_KEY = "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Név";
const CANONICAL_MTMT_ID_KEY = "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|MTMT azonosító";

// A kérelmező MTMT publikációs gyorsítótára (kerelmezo_mtmt.json, a kanonikus - elsőként betöltött -
// előterjesztő PDF-jéből) NEM kerül be a store-ba: ez nem "form mező", hanem a kérelmező publikációs
// adatainak nyers gyorsítótára, amit getNumOfAuthorsInPub/getRatingOfPub olvas ki. Ugyanígy tárolja
// (nem a valueStore-ban) ezt az adatot maga az előterjesztői app is - ld. eloterjesztoiform.tsx
// "mtmtDataInForm" module-szintű változóját.
let canonicalMtmtJson: Record<string, unknown> | null = null;

function getApplicantIdentity(kerJson: Record<string, unknown>): { name: string; mtmtId: string } {
    const name = String(getFromObjectByKey(kerJson, CANONICAL_NAME_KEY) || "");
    const mtmtId = String(getFromObjectByKey(kerJson, CANONICAL_MTMT_ID_KEY) || "");
    return { name, mtmtId };
}

// A kanonikus kérelmező azonosítója MÁR a store-ból olvasható, hiszen a "Kérelmezői|..." adat az
// első regisztrált előterjesztőnél teljes egészében bekerül a közös store-ba (ld. registerNominator).
function getCanonicalIdentity(): { name: string; mtmtId: string } {
    return {
        name: valueStore.getField(CANONICAL_NAME_KEY),
        mtmtId: valueStore.getField(CANONICAL_MTMT_ID_KEY)
    };
}

function applyCategoryFromCanonicalApplicant() {
    const committee = valueStore.getField(
        "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Illetékes bizottság"
    );
    const category = getCategory(committee || "");
    valueStore.setField(
        "Bizottsági|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória",
        category
    );

    const rawSciMetrics = valueStore.getField("Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat");
    const sciMetrics = JSON.parse(rawSciMetrics || "[]");
    valueStore.setField("Bizottsági|Tudományos minimumkövetelmények|I-szám|I-szám|Független idézők száma", sciMetrics?.[9]?.[0] || "0");
    valueStore.setField("Bizottsági|Tudományos minimumkövetelmények|I-szám|I-szám|I-szám", sciMetrics?.[10]?.[0] || "0");
    valueStore.setField("Bizottsági|Tudományos minimumkövetelmények|I-szám|I-szám|WoS idézők száma", sciMetrics?.[11]?.[0] || "0");
    valueStore.setField("Bizottsági|Tudományos minimumkövetelmények|I-szám|I-szám|H-index", sciMetrics?.[12]?.[0] || "0");
}

// Visszaadja, hány előterjesztő van jelenleg betöltve - a legmagasabb index, amelynél még van
// adat (a slotok mindig rés nélkül, 1-től kezdve vannak kitöltve, ld. registerNominator/removeNominator).
export function getNominatorCount(): number {
    let count = 0;
    for (let i = 1; i <= MAX_NOMINATORS; i++) {
        if (valueStore.getField(nominatorLoadedKey(i)) === "true") {
            count = i;
        }
    }
    return count;
}

function recomputeNominatorsLoadedFlag() {
    valueStore.setField(NOMINATORS_LOADED_KEY, getNominatorCount() >= MIN_NOMINATORS ? "true" : "false");
}

export type NominatorUploadData = {
    eloJson: Record<string, unknown>;
    kerJson: Record<string, unknown>;
    mtmtJson: Record<string, unknown>;
};

// Az előterjesztő saját ("Előterjesztői|...") adatfáját a közös store-ba mergeli, a gyökérszegmenst
// "Előterjesztő<n>"-re cserélve - ugyanazzal a mechanizmussal, amivel a kérelmezői adat is a
// "Kérelmezői|..." névtér alatt kerül be (FormStore.fromJSON, createMissing=true). Ettől kezdve az
// összes mezője valódi, teljes értékű store-kulcs (valueSource/conditionKey-ként is hivatkozható).
function mergeNominatorIntoStore(index: number, eloJson: Record<string, unknown>) {
    const nominatorRoot = eloJson["Előterjesztői"];
    if (nominatorRoot && typeof nominatorRoot === "object") {
        valueStore.fromJSON({ [nominatorPrefix(index)]: nominatorRoot }, "", true);
    }
    valueStore.setField(nominatorLoadedKey(index), "true");
}

// Egy adott slot ÖSSZES kulcsát üresre állítja (a slot "üres" állapotát a nominatorLoadedKey jelzi).
function clearNominatorSlot(index: number) {
    const prefix = `${nominatorPrefix(index)}|`;
    for (const key of Object.keys(valueStore.data)) {
        if (key.startsWith(prefix)) {
            valueStore.setField(key, "");
        }
    }
    valueStore.setField(nominatorLoadedKey(index), "false");
}

// Egy slot összes kulcsát átmásolja egy másik slotba (törléskor a feljebb lévő előterjesztők
// lejjebb csúsztatásához, hogy a slotok rés nélkül maradjanak).
function copyNominatorSlot(fromIndex: number, toIndex: number) {
    const fromPrefix = `${nominatorPrefix(fromIndex)}|`;
    const toPrefix = `${nominatorPrefix(toIndex)}|`;
    for (const [key, value] of Object.entries(valueStore.data)) {
        if (key.startsWith(fromPrefix)) {
            valueStore.setField(toPrefix + key.slice(fromPrefix.length), value);
        }
    }
    valueStore.setField(nominatorLoadedKey(toIndex), valueStore.getField(nominatorLoadedKey(fromIndex)));
}

// Egy előterjesztői PDF-ből kinyert adatok érvényesítése és felvétele a következő szabad
// "Előterjesztő<n>" slotba. Elutasítja a feltöltést, ha a benne szereplő kérelmezői adat eltér a
// korábban betöltött előterjesztő(k) kérelmezőjétől, vagy ha már nincs szabad hely.
export function registerNominator(data: NominatorUploadData): { ok: true } | { ok: false; error: string } {
    const identity = getApplicantIdentity(data.kerJson);
    if (!identity.name) {
        return { ok: false, error: "A feltöltött PDF-ben nem található érvényes, beágyazott kérelmezői adatlap." };
    }

    const count = getNominatorCount();
    if (count > 0) {
        const canonical = getCanonicalIdentity();
        if (canonical.name !== identity.name || canonical.mtmtId !== identity.mtmtId) {
            return {
                ok: false,
                error: `A feltöltött előterjesztői adatlapban szereplő kérelmező ("${identity.name}") eltér a korábban betöltött előterjesztő(k) kérelmezőjétől ("${canonical.name}"). Az előterjesztő adatlapja emiatt nem került betöltésre - ellenőrizze, hogy a megfelelő fájlt választotta-e.`
            };
        }
    }
    if (count >= MAX_NOMINATORS) {
        return { ok: false, error: `Legfeljebb ${MAX_NOMINATORS} előterjesztő tölthető fel.` };
    }

    if (count === 0) {
        valueStore.fromJSON(data.kerJson, "", true);
        canonicalMtmtJson = data.mtmtJson;
        applyCategoryFromCanonicalApplicant();
    }

    mergeNominatorIntoStore(count + 1, data.eloJson);
    recomputeNominatorsLoadedFlag();

    return { ok: true };
}

export function removeNominator(index: number) {
    const count = getNominatorCount();
    // a törölt slot fölötti előterjesztőket eggyel lejjebb csúsztatjuk, hogy a slotok rés nélkül maradjanak
    for (let i = index; i < count; i++) {
        copyNominatorSlot(i + 1, i);
    }
    clearNominatorSlot(count);

    if (count - 1 === 0) {
        canonicalMtmtJson = null;
        // Megjegyzés: a "Kérelmezői|..." adatot és a fenti mtmt gyorsítótárat szándékosan NEM
        // töröljük a store-ból teljes visszavonás esetén sem - a lapok úgyis újra zárolódnak
        // (NOMINATORS_LOADED_KEY), egy új kérelmezőről szóló feltöltés pedig felülírja majd.
    }
    recomputeNominatorsLoadedFlag();
}

// A kérelmező alkotásaira (Q-szám) és téziseket alátámasztó publikációira vonatkozó MTMT-adatok
// (társszerzők száma, minősítés) a kanonikus előterjesztő PDF-jéből, a "Kérelmezői" adatlaphoz
// tartozó tudománymetriai gyorsítótárból (kerelmezo_mtmt.json) származnak.
export function getNumOfAuthorsInPub(mtid: string): number {
    if (!canonicalMtmtJson) return 0;
    const coAuthors = (canonicalMtmtJson["Társszerzők"] as Record<string, string[]>) || {};
    const authors = coAuthors[mtid] || [];
    return authors.length;
}

export function getRatingOfPub(mtid: string): string {
    if (!canonicalMtmtJson) return "";
    const pubSummaries = (canonicalMtmtJson["Adatlapon szereplő publikációk"] as Record<string, PubRatingItem>) || {};
    const summary = pubSummaries[mtid];
    return summary ? summary.rating : "";
}
