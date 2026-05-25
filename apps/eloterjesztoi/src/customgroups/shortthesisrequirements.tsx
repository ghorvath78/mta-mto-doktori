import { useAtomValue, atom } from "jotai";
import type { GroupDescriptor, FormData } from "@repo/form-engine";
import { cD, invertedText } from "@repo/form-engine";
import { getNumOfAuthorsInPub, getRatingOfPub } from "@/eloterjesztoiform";

const emptyArrayAtom = atom<string[]>([]);

export const ShortThesisRequirements = ({ formData }: { group: GroupDescriptor; formData: FormData; keyPrefix: string; index: number }) => {
    const d1PubsFromData = formData["Kérelmezői|A doktori mű adatai|D1 közlemények listája|D1 közlemények listája|Cikk MTMT azonosítója"];
    const d1Pubs = useAtomValue(d1PubsFromData || emptyArrayAtom);
    const thesisPubsFromData =
        formData["Kérelmezői|A doktori mű adatai|Téziseket alátámasztó publikációk|Téziseket alátámasztó publikációk|Cikk MTMT azonosítója"];
    const thesisPubs = useAtomValue(thesisPubsFromData || emptyArrayAtom);
    const d1Share = d1Pubs.reduce((sum, mtmt) => sum + 1 / getNumOfAuthorsInPub(mtmt), 0);

    const rawData = useAtomValue(formData["Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat"] || []);
    const data = JSON.parse(rawData[0] || "[]");
    const wosNumber = cD(data[11][0] || 0);
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
                <div>{invertedText(d1Share >= 3 && wosNumber >= 750 ? "IGEN" : "NEM")}</div>
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
