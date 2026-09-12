import { useEffect } from "react";
import { cD, useFieldArrayValue, useFieldValue, useValueStore } from "@repo/form-engine";
import { HATAROZATKEPESSEG_KEY } from "../bizottsagiform";

const OWN_PREFIX = "Bizottsági|Bizottság|Bizottság összetétele|Bizottság összetétele";
const GUEST_PREFIX = "Bizottsági|Bizottság|Vendégbizottságok|Vendégbizottságok";
const ALL_PRESENT_KEY = "Bizottsági|Bizottság|Határozatképesség|Ülés adatai|Jelen van minden előterjesztő";

const MIN_TOTAL_PRESENT = 7;

// Kiszámolja és kiírja a résztvevő bizottságok összesített létszámát, majd a szabályzat szerinti
// 3 határozatképességi feltételt (ld. lap-bizottsag.ts helpText-je) is kiértékeli, és az eredményt
// (igen/nem) automatikusan beírja a "Határozatképesség megállapítása" csoport readonly mezőjébe.
export const QuorumSummary = () => {
    const store = useValueStore();

    const ownAcademic = cD(useFieldValue(`${OWN_PREFIX}|Akadémikus és MTA doktora tagok száma`));
    const ownNonConflicted = cD(useFieldValue(`${OWN_PREFIX}|Ebből a jelölttel nem összeférhetetlen tagok száma`));
    const ownPresent = cD(useFieldValue(`${OWN_PREFIX}|Ebből jelen van`));

    const guestAcademic = useFieldArrayValue(`${GUEST_PREFIX}|Akadémikus és MTA doktora tagok száma`);
    const guestNonConflicted = useFieldArrayValue(`${GUEST_PREFIX}|Ebből a jelölttel nem összeférhetetlen tagok száma`);
    const guestPresent = useFieldArrayValue(`${GUEST_PREFIX}|Ebből jelen van`);

    const allNominatorsPresent = useFieldValue(ALL_PRESENT_KEY).toLowerCase() === "igen";

    const sum = (own: number, guests: string[]) => own + guests.reduce((total, v) => total + cD(v), 0);

    const totalAcademic = sum(ownAcademic, guestAcademic);
    const totalNonConflicted = sum(ownNonConflicted, guestNonConflicted);
    const totalPresent = sum(ownPresent, guestPresent);

    // a) jelen van az összes felkért előterjesztő
    const conditionA = allNominatorsPresent;
    // b) az ügykezelő bizottság szavazati jogú (nem összeférhetetlen) tagjainak legalább fele jelen van
    const conditionB = ownPresent > 0 && ownPresent * 2 >= ownNonConflicted;
    // c) a jelenlévő (szavazati jogú, ki nem zárt) ügykezelő és vendégbizottsági tagok együttes
    //    száma - az előterjesztőket nem számítva - legalább 7
    const conditionC = totalPresent >= MIN_TOTAL_PRESENT;

    const hatarozatkepes = conditionA && conditionB && conditionC;

    useEffect(() => {
        store.setField(HATAROZATKEPESSEG_KEY, hatarozatkepes ? "igen" : "nem");
    }, [store, hatarozatkepes]);

    return (
        <>
            <table className="form-table">
                <tbody>
                    <tr>
                        <td className="form-table-fcol">A résztvevő bizottságok akadémikus és MTA doktora tagjainak együttes száma</td>
                        <td className="font-bold">{totalAcademic}</td>
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Ebből a jelölttel nem összeférhetetlen tagok együttes száma</td>
                        <td className="font-bold">{totalNonConflicted}</td>
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Ebből jelen van</td>
                        <td className="font-bold">{totalPresent}</td>
                    </tr>
                </tbody>
            </table>
            <table className="form-table mt-2 [&_td]:px-2">
                <tbody>
                    <tr className="form-table-head">
                        <td></td>
                        <td>Határozatképességi feltétel</td>
                        <td className="text-center">Teljesül</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>a)</td>
                        <td className="text-left">Jelen van az összes felkért előterjesztő</td>
                        <td className="text-center">{conditionA ? "✓" : "✗"}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>b)</td>
                        <td className="text-left">
                            Az ügykezelő bizottság szavazati jogú, ki nem zárt tagjainak legalább fele jelen van ({ownPresent}/{ownNonConflicted})
                        </td>
                        <td className="text-center">{conditionB ? "✓" : "✗"}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>c)</td>
                        <td className="text-left">
                            A jelenlévő, szavazati jogú, ki nem zárt tagok együttes száma legalább {MIN_TOTAL_PRESENT} ({totalPresent})
                        </td>
                        <td className="text-center">{conditionC ? "✓" : "✗"}</td>
                    </tr>
                </tbody>
            </table>
            {/*<div className="w-full mt-2 pt-2 font-semibold">
                A habitusvizsgálatot lefolytató bizottsági ülés határozatképes: {invertedText(hatarozatkepes ? "IGEN" : "NEM")}
            </div>*/}
        </>
    );
};
