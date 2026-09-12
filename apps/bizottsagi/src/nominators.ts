import { useFieldValue } from "@repo/form-engine";

// Az egyes betöltött előterjesztők teljes adatfája a "Kérelmezői|..." és "Bizottsági|..." mezőkhöz
// hasonlóan, VALÓDI, teljes értékű store-kulcsként kerül be a közös FormStore-ba - csak "Előterjesztői"
// helyett "Előterjesztő<n>" a gyökérszegmens (n = 1..MAX_NOMINATORS), hogy a 2-3 előterjesztő adatai
// ne írják felül egymást (ld. bizottsagiform.tsx: mergeNominatorIntoStore). Ezek a kulcsok később
// valueSource/conditionKey-ként is hivatkozhatók bármelyik lap-*.ts-ből, pontosan úgy, mint a
// "Kérelmezői|..." mezők.
export const MAX_NOMINATORS = 3;

export function nominatorPrefix(index: number): string {
    return `Előterjesztő${index}`;
}

// A név/fokozat az előterjesztői form saját, deklarált mezőinek valódi elérési útja (ld.
// apps/eloterjesztoi/src/lap-eloterjesztoadatai.ts), csak a gyökérszegmens cserélve.
export function nominatorNameKey(index: number): string {
    return `${nominatorPrefix(index)}|Előterjesztő adatai|Előterjesztő adatai|Adatok|Előterjesztő neve`;
}

export function nominatorFokozatKey(index: number): string {
    return `${nominatorPrefix(index)}|Előterjesztő adatai|Előterjesztő adatai|Adatok|Tudományos fokozat`;
}

// Saját könyvelő-mező (nem az előterjesztői adatlap része), ami jelzi, hogy az adott slotba be
// van-e töltve előterjesztő. A "__meta" prefix miatt kimarad egy esetleges jövőbeli toJSON exportból.
export function nominatorLoadedKey(index: number): string {
    return `__meta|${nominatorPrefix(index)} betöltve`;
}

export type NominatorSlotView = {
    index: number;
    name: string;
    fokozat: string;
};

// Rögzített (MAX_NOMINATORS) számú hívással, minden slotra egyenként feliratkozva olvassa ki az
// előterjesztők nevét/fokozatát - csak a ténylegesen betöltött slotokat adja vissza. A slotok
// mindig rés nélkül, 1-től kezdve vannak feltöltve (ld. registerNominator/removeNominator).
export function useNominatorSlots(): NominatorSlotView[] {
    const slots: NominatorSlotView[] = [];
    for (let i = 1; i <= MAX_NOMINATORS; i++) {
        // eslint-disable-next-line react-hooks/rules-of-hooks -- MAX_NOMINATORS fix konstans, a hívások száma/sorrendje minden renderben azonos
        const loaded = useFieldValue(nominatorLoadedKey(i));
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const name = useFieldValue(nominatorNameKey(i));
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const fokozat = useFieldValue(nominatorFokozatKey(i));
        if (loaded === "true") {
            slots.push({ index: i, name, fokozat });
        }
    }
    return slots;
}
