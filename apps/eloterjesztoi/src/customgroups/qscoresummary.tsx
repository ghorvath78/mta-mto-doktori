import { useAtomValue } from "jotai";
import type { GroupDescriptor, FormData } from "@repo/form-engine";
import { getMaxBookQ, getMaxAchievementQ, getMinPaperQ, getMinTotalQ } from "@/requirements";
import { cD, invertedText } from "@repo/form-engine";

export const QScoreSummary = ({ formData }: { group: GroupDescriptor; formData: FormData; keyPrefix: string; index: number }) => {
    const achievementQ = useAtomValue(formData["Előterjesztői|Tudományos minimumkövetelmények|Q-szám|A kérelmező alkotási teljesítménye|Pontszám"] || []);
    const category = useAtomValue(
        formData["Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Minimumkövetelmények|Kategória"] || [""]
    )[0];
    const rawData = useAtomValue(formData["Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat"] || []);
    const data = JSON.parse(rawData[0] || "[]");

    const achievementQValue = Math.round(10000 * achievementQ.reduce((sum, val) => sum + cD(val), 0)) / 10000;
    const paperQValue = cD(data[1][6]) + cD(data[4][6]);
    const bookQValue = cD(data[6][6]) + cD(data[7][6]);

    const minPaperQ = getMinPaperQ(category);
    const maxBookQ = getMaxBookQ();
    const maxAchievementQ = getMaxAchievementQ(category);
    const totalQ = paperQValue + Math.min(bookQValue, maxBookQ) + Math.min(achievementQValue, maxAchievementQ);
    const minTotalQ = getMinTotalQ(category);

    return (
        <>
            <table className="form-table">
                <tbody>
                    <tr className="form-table-head">
                        <td>Összetevői</td>
                        <td className="text-center">Előírt</td>
                        <td className="text-center">Elért</td>
                        <td className="text-center">Figyelembe vehető</td>
                        {/*<td className="text-center">Teljesül</td>*/}
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Tudományos cikk</td>
                        <td>minimum {minPaperQ}</td>
                        <td>{paperQValue}</td>
                        <td>{paperQValue}</td>
                        {/*<td>{paperQValue >= minPaperQ ? "Igen" : "Nem"}</td>*/}
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Tudományos könyv, könyvrészlet</td>
                        <td>maximum {maxBookQ}</td>
                        <td>{bookQValue}</td>
                        <td>{Math.min(bookQValue, maxBookQ)}</td>
                        {/*<td>{bookQValue >= maxBookQ ? "Igen" : "Nem"}</td>*/}
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Kiemelkedő alkotás</td>
                        <td>maximum {maxAchievementQ}</td>
                        <td>{achievementQValue}</td>
                        <td>{Math.min(achievementQValue, maxAchievementQ)}</td>
                        {/*<td>{achievementQValue >= maxAchievementQ ? "Igen" : "Nem"}</td>*/}
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Összesen</td>
                        <td></td>
                        <td></td>
                        <td>{totalQ}</td>
                        {/*<td></td>*/}
                    </tr>
                </tbody>
            </table>
            <div className="w-full mt-2 pt-2">
                <table className="form-table">
                    <tbody>
                        <tr>
                            <td className="form-table-fcol font-bold">A kérelmező által elért publikációs (alkotási, Q) érték:</td>
                            <td className="font-bold">{totalQ}</td>
                        </tr>
                        <tr>
                            <td className="form-table-fcol font-bold">Minimum követelmény (Qmin):</td>
                            <td className="font-bold">{minTotalQ}</td>
                        </tr>
                        <tr>
                            <td className="form-table-fcol font-bold">A kérelmező teljesítette a Q ≥ Qmin követelményt:</td>
                            <td className="font-bold">{invertedText(totalQ >= minTotalQ ? "IGEN" : "NEM")}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
};
