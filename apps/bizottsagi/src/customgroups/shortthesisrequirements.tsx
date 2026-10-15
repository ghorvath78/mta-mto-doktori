import { invertedText, useFieldArrayValue, useFieldValue } from "@repo/form-engine";
import { getNumOfAuthorsInPub, getRatingOfPub } from "@/bizottsagiform";
import { getShortThesisD1Share, getWosCitationCount, shortThesisNumericalRequirementsMet } from "@/requirements";

export const ShortThesisRequirements = () => {
    const thesisPubs = useFieldArrayValue(
        "Kérelmezői|A doktori mű adatai|Téziseket alátámasztó publikációk|Téziseket alátámasztó publikációk|Cikk MTMT azonosítója"
    );
    const rawData = useFieldValue("Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat") || "[]";
    const data = JSON.parse(rawData);
    const d1Share = getShortThesisD1Share(data);
    const wosNumber = getWosCitationCount(data);
    const thesisPubData = thesisPubs.map((mtmt) => {
        const rating = getRatingOfPub(mtmt);
        const numAuthors = getNumOfAuthorsInPub(mtmt);
        return [mtmt, rating, numAuthors, (rating === "D1" || rating === "Q1") && numAuthors <= 3];
    });

    return (
        <div>
            <div className="w-full my-2 font-semibold grid grid-cols-[1fr_auto] gap-1">
                <div>SJR D1 cikkek összegzett szerzői részaránya:</div>
                <div>{d1Share.toFixed(3)}</div>
                <div>Független WoS hivatkozások száma:</div>
                <div>{wosNumber}</div>
                <div>A kérelmező teljesítette a rövid értekezés speciális numerikus követelményeit:</div>
                <div>{invertedText(shortThesisNumericalRequirementsMet(d1Share, wosNumber) ? "IGEN" : "NEM")}</div>
            </div>
            <div className="w-full my-1">A kérelmező által megjelölt téziseket alátámasztó publikációk:</div>
            <table className="form-table [&_td]:px-2">
                <tbody>
                    <tr className="form-table-head">
                        <td></td>
                        <td>MTMT azonosító</td>
                        <td className="text-center">Besorolás</td>
                        <td className="text-center">Szerzőszám</td>
                        <td className="text-center">Teljesül</td>
                    </tr>
                    {thesisPubData.map(([mtmt, rating, numAuthors, satisfies], index) => (
                        <tr className="border-b border-primary border-dotted" key={index}>
                            <td>{index + 1}.</td>
                            <td>
                                <a href={`https://m2.mtmt.hu/api/publication/${mtmt}`} target="_blank" rel="noopener noreferrer" className="formlink">
                                    {mtmt}
                                </a>
                            </td>
                            <td>{rating}</td>
                            <td>{numAuthors}</td>
                            <td>{satisfies ? "✓" : "✗"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
