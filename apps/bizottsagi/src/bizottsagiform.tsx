import { createFormDescriptor, getFromObjectByKey, type GroupDescriptor } from "@repo/form-engine";
import { getCategory, getMinPaperQ, getMinTotalI } from "./requirements.tsx";
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

// Az "Előterjesztők" tömb GroupDescriptor.arrayMin értéke szándékosan 0 (ld. lap-bizottsag.ts) -
// a FormStore ugyanis arrayMin darab ÜRES tömbelemet foglal le induláskor (FormStore.initialize),
// ami itt hamis, még fel nem töltött előterjesztő-sorokat jelentene. A ténylegesen megkövetelt
// minimumot ez a konstans írja le, a feltöltő UI és a kapu-logika egyaránt ezt használja.
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

type CanonicalApplicant = {
    name: string;
    mtmtId: string;
    kerJson: Record<string, unknown>;
    mtmtJson: Record<string, unknown>;
};

// A már betöltött előterjesztők közül az elsőként betöltött kérelmezői adata, amihez a további
// előterjesztők kérelmezői adatát hasonlítjuk (mindegyik előterjesztőnek ugyanarról a kérelmezőről
// kell szólnia).
let canonicalApplicant: CanonicalApplicant | null = null;

function getApplicantIdentity(kerJson: Record<string, unknown>): { name: string; mtmtId: string } {
    const name = String(getFromObjectByKey(kerJson, "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Név") || "");
    const mtmtId = String(getFromObjectByKey(kerJson, "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|MTMT azonosító") || "");
    return { name, mtmtId };
}

function applyCategoryFromCanonicalApplicant() {
    if (!canonicalApplicant) return;
    const committee = getFromObjectByKey(
        canonicalApplicant.kerJson,
        "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Illetékes bizottság"
    ) as string | undefined;
    const category = getCategory(committee || "");
    valueStore.setField(
        "Bizottsági|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória",
        category
    );

    const rawSciMetrics = getFromObjectByKey(
        canonicalApplicant.kerJson,
        "Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat"
    ) as string | undefined;
    const sciMetrics = JSON.parse(rawSciMetrics || "[]");
    valueStore.setField("Bizottsági|Tudományos minimumkövetelmények|I-szám|I-szám|Független idézők száma", sciMetrics?.[9]?.[0] || "0");
    valueStore.setField("Bizottsági|Tudományos minimumkövetelmények|I-szám|I-szám|I-szám", sciMetrics?.[10]?.[0] || "0");
    valueStore.setField("Bizottsági|Tudományos minimumkövetelmények|I-szám|I-szám|WoS idézők száma", sciMetrics?.[11]?.[0] || "0");
    valueStore.setField("Bizottsági|Tudományos minimumkövetelmények|I-szám|I-szám|H-index", sciMetrics?.[12]?.[0] || "0");
}

function recomputeNominatorsLoadedFlag(keyPrefix: string) {
    const length = parseInt(valueStore.getField(`${keyPrefix}|_length`)) || 0;
    valueStore.setField(NOMINATORS_LOADED_KEY, length >= MIN_NOMINATORS ? "true" : "false");
}

export type NominatorUploadData = {
    eloJson: Record<string, unknown>;
    kerJson: Record<string, unknown>;
    mtmtJson: Record<string, unknown>;
    name: string;
    fokozat: string;
};

// Egy előterjesztői PDF-ből kinyert adatok érvényesítése és felvétele a "Bizottsági" tömbbe.
// Elutasítja a feltöltést, ha a benne szereplő kérelmezői adat eltér a korábban betöltött
// előterjesztő(k) kérelmezőjétől.
export function registerNominator(
    group: GroupDescriptor,
    keyPrefix: string,
    data: NominatorUploadData
): { ok: true } | { ok: false; error: string } {
    const identity = getApplicantIdentity(data.kerJson);
    if (!identity.name) {
        return { ok: false, error: "A feltöltött PDF-ben nem található érvényes, beágyazott kérelmezői adatlap." };
    }
    if (canonicalApplicant && (canonicalApplicant.name !== identity.name || canonicalApplicant.mtmtId !== identity.mtmtId)) {
        return {
            ok: false,
            error: `A feltöltött előterjesztői adatlapban szereplő kérelmező ("${identity.name}") eltér a korábban betöltött előterjesztő(k) kérelmezőjétől ("${canonicalApplicant.name}"). Az előterjesztő adatlapja emiatt nem került betöltésre - ellenőrizze, hogy a megfelelő fájlt választotta-e.`
        };
    }

    if (!canonicalApplicant) {
        canonicalApplicant = { ...identity, kerJson: data.kerJson, mtmtJson: data.mtmtJson };
        valueStore.fromJSON(data.kerJson, "", true);
        applyCategoryFromCanonicalApplicant();
    }

    const newIndex = parseInt(valueStore.getField(`${keyPrefix}|_length`)) || 0;
    valueStore.appendToFormArray(group, keyPrefix);
    valueStore.setField(`${keyPrefix}[[${newIndex}]]|Előterjesztő neve`, data.name);
    valueStore.setField(`${keyPrefix}[[${newIndex}]]|Tudományos fokozat`, data.fokozat);
    valueStore.setField(`${keyPrefix}[[${newIndex}]]|RawJSON`, JSON.stringify(data.eloJson));
    valueStore.setField(`${keyPrefix}[[${newIndex}]]|RawApplicantJSON`, JSON.stringify(data.kerJson));
    valueStore.setField(`${keyPrefix}[[${newIndex}]]|RawMtmtJSON`, JSON.stringify(data.mtmtJson));
    recomputeNominatorsLoadedFlag(keyPrefix);

    return { ok: true };
}

export function removeNominator(group: GroupDescriptor, keyPrefix: string, index: number) {
    valueStore.deleteFromFormArray(group, keyPrefix, index);

    const length = parseInt(valueStore.getField(`${keyPrefix}|_length`)) || 0;
    if (length === 0) {
        canonicalApplicant = null;
    } else {
        const rawApplicant = valueStore.getField(`${keyPrefix}[[0]]|RawApplicantJSON`);
        const rawMtmt = valueStore.getField(`${keyPrefix}[[0]]|RawMtmtJSON`);
        if (rawApplicant) {
            const kerJson = JSON.parse(rawApplicant);
            const mtmtJson = rawMtmt ? JSON.parse(rawMtmt) : {};
            canonicalApplicant = { ...getApplicantIdentity(kerJson), kerJson, mtmtJson };
        }
    }
    recomputeNominatorsLoadedFlag(keyPrefix);
}

// A kérelmező alkotásaira (Q-szám) és téziseket alátámasztó publikációira vonatkozó MTMT-adatok
// (társszerzők száma, minősítés) a kanonikus előterjesztő PDF-jéből, a "Kérelmezői" adatlaphoz
// tartozó tudománymetriai gyorsítótárból (kerelmezo_mtmt.json) származnak.
export function getNumOfAuthorsInPub(mtid: string): number {
    if (!canonicalApplicant) return 0;
    const coAuthors = (canonicalApplicant.mtmtJson["Társszerzők"] as Record<string, string[]>) || {};
    const authors = coAuthors[mtid] || [];
    return authors.length;
}

export function getRatingOfPub(mtid: string): string {
    if (!canonicalApplicant) return "";
    const pubSummaries = (canonicalApplicant.mtmtJson["Adatlapon szereplő publikációk"] as Record<string, PubRatingItem>) || {};
    const summary = pubSummaries[mtid];
    return summary ? summary.rating : "";
}
