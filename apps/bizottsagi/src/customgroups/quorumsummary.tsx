import { cD, useFieldArrayValue, useFieldValue } from "@repo/form-engine";

const OWN_PREFIX = "Bizottsági|Bizottság|Bizottság összetétele|Bizottság összetétele";
const GUEST_PREFIX = "Bizottsági|Bizottság|Vendégbizottságok|Vendégbizottságok";

export const QuorumSummary = () => {
    const ownAcademic = cD(useFieldValue(`${OWN_PREFIX}|Akadémikus és MTA (tudomány) doktora tagjainak száma`));
    const ownNonConflicted = cD(useFieldValue(`${OWN_PREFIX}|Ebből a jelölttel nem összeférhetetlen tagok száma`));
    const ownPresent = cD(useFieldValue(`${OWN_PREFIX}|Ebből jelen van`));

    const guestAcademic = useFieldArrayValue(`${GUEST_PREFIX}|Akadémikus és MTA (tudomány) doktora tagjainak száma`);
    const guestNonConflicted = useFieldArrayValue(`${GUEST_PREFIX}|Ebből a jelölttel nem összeférhetetlen tagok száma`);
    const guestPresent = useFieldArrayValue(`${GUEST_PREFIX}|Ebből jelen van`);

    const sum = (own: number, guests: string[]) => own + guests.reduce((total, v) => total + cD(v), 0);

    const totalAcademic = sum(ownAcademic, guestAcademic);
    const totalNonConflicted = sum(ownNonConflicted, guestNonConflicted);
    const totalPresent = sum(ownPresent, guestPresent);

    return (
        <table className="form-table">
            <tbody>
                <tr>
                    <td className="form-table-fcol">
                        A résztvevő bizottságok akadémikus és MTA (tudomány) doktora tagjainak együttes száma
                    </td>
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
    );
};
